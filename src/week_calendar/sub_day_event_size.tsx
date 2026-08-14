export const subDayEventSize = (
  n: number,
  horPos: number,
): { w: number; x: number } => {
  if (n === 1) {
    return { x: 0, w: 110 };
  }
  if (n === 2) {
    if (horPos === 0) {
      return { x: 0, w: 88 };
    }
    if (horPos === 1) {
      return { x: 55, w: 55 };
    }
  }
  if (n === 3) {
    if (horPos === 0) {
      return { x: 0, w: 64 };
    }
    if (horPos === 1) {
      return { x: 31, w: 64 };
    }
    if (horPos === 2) {
      return { x: 72, w: 37 };
    }
  }

  const b = 110 / n;
  const c = 110 - (0.8 * b) / 2;
  const a = (c / (n - 1)) * 1.5 - (0.8 * b) / 2 / 4;
  if (horPos + 1 === n) {
    return { x: 110 - b, w: b };
  }

  const cardVisible = (c - a) / (n - 2);
  const x = horPos * cardVisible;

  return { x, w: a };
};
