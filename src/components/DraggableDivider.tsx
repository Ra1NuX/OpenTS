import { ReactElement, useCallback, useEffect, useRef, useState } from "react";

const MIN_PANEL_WIDTH_PX = 200;

const DraggableDivider: React.FC<{
  leftComponent: ReactElement;
  rightComponent: ReactElement;
}> = ({ leftComponent, rightComponent }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dividerRatio, setDividerRatio] = useState<number>(0.5);
  const isDragging = useRef<boolean>(false);
  const animationFrame = useRef<number>();

  const onMouseMoveRef = useRef<(e: MouseEvent | TouchEvent) => void>();
  const onMouseUpRef = useRef<() => void>();

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const containerWidth = containerRect.width;

    let newPositionPx = clientX - containerRect.left;

    let newRatio = newPositionPx / containerWidth;

    const minRatio = MIN_PANEL_WIDTH_PX / containerWidth;
    const maxRatio = 1 - minRatio;

    if (newRatio < minRatio) newRatio = minRatio;
    if (newRatio > maxRatio) newRatio = maxRatio;

    setDividerRatio(newRatio);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      let clientX: number;

      if (e instanceof MouseEvent) {
        clientX = e.clientX;
      } else if (e instanceof TouchEvent) {
        clientX = e.touches[0].clientX;
      } else {
        return;
      }

      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
      animationFrame.current = window.requestAnimationFrame(() => {
        updatePosition(clientX);
      });
    },
    [updatePosition]
  );

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
    if (onMouseMoveRef.current) {
      window.removeEventListener("mousemove", onMouseMoveRef.current);
      window.removeEventListener("touchmove", onMouseMoveRef.current);
    }
    if (onMouseUpRef.current) {
      window.removeEventListener("mouseup", onMouseUpRef.current);
      window.removeEventListener("touchend", onMouseUpRef.current);
    }
  }, []);

  const startDragging = useCallback(
    (clientX: number) => {
      isDragging.current = true;
      updatePosition(clientX);

      onMouseMoveRef.current = handleMouseMove;
      onMouseUpRef.current = handleMouseUp;

      window.addEventListener("mousemove", onMouseMoveRef.current);
      window.addEventListener("touchmove", onMouseMoveRef.current, {
        passive: false,
      });
      window.addEventListener("mouseup", onMouseUpRef.current);
      window.addEventListener("touchend", onMouseUpRef.current);
    },
    [handleMouseMove, handleMouseUp, updatePosition]
  );

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    startDragging(e.clientX);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    startDragging(e.touches[0].clientX);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      const delta = e.key === "ArrowLeft" ? -0.05 : 0.05;
      setDividerRatio((prev) => {
        let newRatio = prev + delta;
        if (!containerRef.current) return prev;
        const containerRect = containerRef.current.getBoundingClientRect();
        const minRatio = MIN_PANEL_WIDTH_PX / containerRect.width;
        const maxRatio = 1 - minRatio;
        if (newRatio < minRatio) newRatio = minRatio;
        if (newRatio > maxRatio) newRatio = maxRatio;
        return newRatio;
      });
    }
  };

  useEffect(() => {
    const initializeDivider = () => {
      if (containerRef.current) {
        setDividerRatio(0.5);
      }
    };

    initializeDivider();

    return () => {
      if (onMouseMoveRef.current) {
        window.removeEventListener("mousemove", onMouseMoveRef.current);
        window.removeEventListener("touchmove", onMouseMoveRef.current);
      }
      if (onMouseUpRef.current) {
        window.removeEventListener("mouseup", onMouseUpRef.current);
        window.removeEventListener("touchend", onMouseUpRef.current);
      }
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, []);

  const leftPanelWidthPercent = dividerRatio * 100;
  const rightPanelWidthPercent = (1 - dividerRatio) * 100;

  return (
    <div className="flex dark:bg-main-dark bg-[#f7f7f7] h-full overflow-hidden p-2 pl-0 flex-1" ref={containerRef}>
      <div
        className="rounded-md overflow-hidden dark:bg-main-light bg-[#eaeaea] p-2 pl-0 rounded-r-none border-r dark:border-r-main-dark border-r-[#f7f7f7]"
        style={{ width: `${leftPanelWidthPercent}%` }}
      >
        {leftComponent}
      </div>
      <div
        className="relative h-full w-2 dark:bg-main-dark bg-[#f7f7f7] cursor-ew-resize select-none touch-none"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onKeyDown={handleKeyDown}
        role="separator"
        tabIndex={0}
        aria-orientation="vertical"
        aria-label="Divider"
      />
      <div className="flex flex-col flex-1"
        style={{ width: `${rightPanelWidthPercent}%` }}
      >
        {rightComponent}
      </div>
    </div>
  );
};

export default DraggableDivider;
