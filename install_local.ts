/**
 * install_local.ts
 *
 * Builds @anocca-os/calendar and installs it directly into a local target
 * directory (e.g. a consuming project's node_modules) without publishing to
 * a registry.
 *
 * Usage:
 *   bun run install:local --target /path/to/node_modules/@anocca-os/calendar
 */

import { Glob, $ } from "bun";
import { mkdir, rm } from "node:fs/promises";
import path from "node:path";

// ---------------------------------------------------------------------------
// Parse --target argument
// ---------------------------------------------------------------------------

const args = Bun.argv.slice(2);
const targetFlagIndex = args.indexOf("--target");
if (targetFlagIndex === -1 || !args[targetFlagIndex + 1]) {
  console.error("Error: --target <path> is required");
  console.error(
    "Usage: bun run install:local --target /path/to/node_modules/@anocca-os/calendar"
  );
  process.exit(1);
}
const targetDir = path.resolve(args[targetFlagIndex + 1]);

console.log(`Building @anocca-os/calendar...`);
console.log(`Target: ${targetDir}`);

// ---------------------------------------------------------------------------
// Phase 1: Compile in lib-out (staging / temp area)
// ---------------------------------------------------------------------------

const baseDir = "lib-out";

// Clean lib-out (skip node_modules to avoid slow re-installs when possible)
for await (const file of new Glob("**").scan({
  cwd: baseDir,
  absolute: true,
  dot: true,
})) {
  if (file.includes("node_modules")) {
    continue;
  }
  await $`rm -rf ${file}`;
}

await mkdir(baseDir, { recursive: true });

const packageJson = await Bun.file("package.json").json();

// Write package.json into staging dir
await Bun.write(
  path.join(baseDir, "package.json"),
  JSON.stringify(
    {
      name: packageJson.name,
      version: packageJson.version,
      license: "MIT",
      main: "dist/cjs/index.js",
      module: "dist/esm/index.js",
      exports: {
        ".": {
          import: "./dist/esm/index.js",
          require: "./dist/cjs/index.js",
        },
      },
      description: "A calendar component for React",
      title: "Calendar",
      author: "Anocca",
      peerDependencies: {
        "@mui/material": "*",
        "@mui/x-date-pickers": "*",
        "date-fns": "*",
        react: "*",
      },
      devDependencies: {
        typescript: "^5",
        "@types/node": "^20",
        "@types/react": "^18",
        "@types/react-dom": "^18",
      },
    },
    null,
    2
  )
);

// Write tsconfigs for ESM and CJS compilation
for (const props of [
  {
    type: "esm",
    compilerOptions: { module: "esnext", outDir: "dist/esm", target: "esnext" },
  },
  {
    type: "cjs",
    compilerOptions: {
      module: "commonjs",
      outDir: "dist/cjs",
      target: "es2015",
    },
  },
]) {
  await Bun.write(
    path.join(baseDir, `tsconfig-${props.type}.json`),
    JSON.stringify(
      {
        compilerOptions: {
          lib: ["dom", "dom.iterable", "esnext"],
          allowJs: false,
          skipLibCheck: true,
          strict: true,
          noEmit: false,
          sourceMap: false,
          esModuleInterop: true,
          moduleResolution: "node",
          resolveJsonModule: true,
          isolatedModules: false,
          downlevelIteration: true,
          jsx: "react-jsx",
          pretty: true,
          incremental: true,
          declaration: true,
          declarationMap: true,
          paths: {
            "@/components/*": ["./*"],
          },
          ...props.compilerOptions,
        },
        include: ["**/*.ts", "**/*.tsx", "global.d.ts"],
        exclude: ["node_modules"],
      },
      null,
      2
    )
  );
}

// Copy source files from nextjs/components, rewriting @/components/ path aliases
const tsGlob = new Glob("**/*.{ts,tsx}");

async function replaceAsync(
  str: string,
  regex: RegExp,
  asyncFn: (...args: any[]) => Promise<any>
) {
  const promises: Promise<any>[] = [];
  str.replaceAll(regex, (full, ...args) => {
    promises.push(asyncFn(full, ...args));
    return full;
  });
  const data = await Promise.all(promises);
  return str.replaceAll(regex, () => data.shift());
}

for await (const file of tsGlob.scan("nextjs/components")) {
  if (file.includes(".test.")) {
    continue;
  }
  const dir = path.parse(file).dir;
  const outDir = path.join(baseDir, dir);
  await mkdir(outDir, { recursive: true });
  const f = Bun.file(path.join("nextjs/components", file));
  const relPath = path.relative(outDir, baseDir);

  const content = (await f.text()).replaceAll(
    /from (["'])(@\/components\/)/gm,
    `from $1${relPath === "" ? "." : relPath}/`
  );

  await Bun.write(path.join(baseDir, file), content);
}

// Restore/update lockfile and install deps (needed so tsc can resolve types)
await Bun.write(path.join(baseDir, "bun.lockb"), Bun.file("lib-out.lockb"));
await $`cd ${baseDir} && bun install`;
await Bun.write("lib-out.lockb", Bun.file(path.join(baseDir, "bun.lockb")));

// Write public index.ts barrel
await Bun.write(
  path.join(baseDir, "index.ts"),
  [
    "export { WeekCalendar } from './week_calendar/week_calendar';",
    "export { MonthCalendar } from './month_calendar/month_calendar';",
    "export { Timeline } from './timeline/timeline';",
    "export { CalendarNav } from './nav/calendar_nav';",
    "export { TimelineNav, allResolutions, speeds } from './nav/timeline_nav';",
    "export { calendarTheme } from './theme';",
    "export { DEFAULT_COLOR } from './helpers';",
    "export type { CalendarEvent, StartDay, TimelineResolution, TimelineSpeed } from './types';",
    "export type { WeekCalendarProps } from './week_calendar/week_calendar';",
    "export type { MonthCalendarProps } from './month_calendar/month_calendar';",
    "export type { TimelineProps } from './timeline/timeline';",
    "export { minRenderedEventDuration, eventsOverlaps, eventsToRows } from './events_to_rows';",
    "export type { PartialEvent } from './events_to_rows';",
  ].join("\n") + "\n"
);

// Write global.d.ts
await Bun.write(
  path.join(baseDir, "global.d.ts"),
  Bun.file("nextjs/global.d.ts")
);

// Compile TypeScript to ESM and CJS
console.log("Compiling TypeScript...");
await $`cd ${baseDir} && bunx tsc -p tsconfig-esm.json && bunx tsc -p tsconfig-cjs.json`;

// Clean up node_modules and lockfile from lib-out — these were only needed for
// tsc type resolution and must not be present in the install target (they contain
// old/conflicting versions that would confuse the consuming project's resolver).
console.log("Cleaning lib-out/node_modules...");
await rm(path.join(baseDir, "node_modules"), { recursive: true, force: true });
await rm(path.join(baseDir, "bun.lockb"), { force: true });

// Write dist subdir package.json markers (ESM / CJS module type hints)
for (const type of ["esm", "cjs"]) {
  await Bun.write(
    path.join(baseDir, "dist", type, "package.json"),
    JSON.stringify(
      {
        type: type === "esm" ? "module" : "commonjs",
      },
      null,
      2
    )
  );
}

// Fix ESM relative imports: add .js extension where missing
for await (const file of new Glob("**/*.js").scan(
  path.join(baseDir, "dist/esm")
)) {
  const dir = path.parse(file).dir;
  const fileDir = path.join(baseDir, "dist/esm", dir);
  const f = Bun.file(path.join(baseDir, "dist/esm", file));

  const content = await replaceAsync(
    await f.text(),
    /from (["'])([^"']+)(["'])/gm,
    async (match: string, p1: string, p2: string, p3: string) => {
      if (!p2.startsWith(".")) {
        return match;
      }
      const fPaths = ["js"].map((ext) => [
        path.join(fileDir, p2) + "." + ext,
        ext,
      ]);
      for (const [fPath, ext] of fPaths) {
        if (await Bun.file(fPath).exists()) {
          return `from ${p1}${p2}.${ext}${p3}`;
        }
      }
      return match;
    }
  );

  await Bun.write(path.join(baseDir, "dist/esm", file), content);
}

console.log("Compilation done.");

// ---------------------------------------------------------------------------
// Phase 2: Copy compiled output + package metadata to target directory
// ---------------------------------------------------------------------------

console.log(`Installing into ${targetDir}...`);

await mkdir(targetDir, { recursive: true });

// Files/dirs to copy from lib-out to target (everything except node_modules
// and the tsconfig/npmrc/npmignore build artifacts)
const SKIP_PATTERNS = new Set([
  "node_modules",
  ".npmrc",
  ".npmignore",
  "tsconfig-esm.json",
  "tsconfig-cjs.json",
  "bun.lockb",
]);

for await (const file of new Glob("**/*").scan({
  cwd: baseDir,
  dot: true,
})) {
  // Skip node_modules and build-only artifacts
  if (SKIP_PATTERNS.has(file) || file.startsWith("node_modules/")) {
    continue;
  }
  // Skip tsconfig files at the root
  if (file.match(/^tsconfig.*\.json$/)) {
    continue;
  }

  const dir = path.parse(file).dir;
  const outDir = path.join(targetDir, dir);
  await mkdir(outDir, { recursive: true });

  await Bun.write(
    path.join(targetDir, file),
    Bun.file(path.join(baseDir, file))
  );
}

console.log(`Done. @anocca-os/calendar@${packageJson.version} installed into:`);
console.log(`  ${targetDir}`);
