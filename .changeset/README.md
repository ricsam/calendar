# Changesets

Add a changeset with:

```bash
npm run changeset
```

Choose `patch`, `minor`, or `major` and describe the consumer-facing change. Merge the changeset with the implementation. The publish workflow keeps a **Version Packages** pull request updated; merging that pull request publishes the package through npm trusted publishing.

Use an empty changeset for changes that should not release the package:

```bash
npm run changeset -- --empty
```
