import { useEffect, useState } from "react";

export const useMeasureHeight = (initialHeight: number) => {
  const [wrapperRef, setWrapperRef] = useState<HTMLDivElement | null>(null);

  const [hasMeasuredHeight, setHasMeasuredHeight] = useState(false);
  const [height, setHeight] = useState<number>(initialHeight);
  const [width, setWidth] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (!wrapperRef) {
      return;
    }
    let t: number;
    const updateSize = (w: number, h: number) => {
      cancelAnimationFrame(t);
      t = requestAnimationFrame(() => {
        setWidth(w);
        setHeight(h);
        setHasMeasuredHeight(true);
      });
    };
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        updateSize(entry.contentRect.width, entry.contentRect.height);
      }
    });
    observer.observe(wrapperRef);
    return () => {
      observer.disconnect();
    };
  }, [wrapperRef]);
  return { width, height, setWrapperRef, hasMeasuredHeight };
};
