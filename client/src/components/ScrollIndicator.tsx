import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScrollIndicatorProps {
  children: React.ReactNode;
  className?: string;
  showTopIndicator?: boolean;
  showBottomIndicator?: boolean;
}

export default function ScrollIndicator({
  children,
  className,
  showTopIndicator = true,
  showBottomIndicator = true
}: ScrollIndicatorProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);

  const checkScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const threshold = 20; // pixels threshold for showing indicators

    setCanScrollUp(scrollTop > threshold);
    setCanScrollDown(scrollTop + clientHeight < scrollHeight - threshold);
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    checkScroll();

    const handleScroll = () => {
      checkScroll();
    };

    const resizeObserver = new ResizeObserver(() => {
      checkScroll();
    });

    container.addEventListener("scroll", handleScroll);
    resizeObserver.observe(container);

    return () => {
      container.removeEventListener("scroll", handleScroll);
      resizeObserver.disconnect();
    };
  }, []);

  const scrollToTop = () => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToBottom = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
  };

  return (
    <div className="relative w-full h-full">
      {/* Top Scroll Indicator */}
      {showTopIndicator && canScrollUp && (
        <div 
          className="absolute top-0 left-0 right-0 z-10 pointer-events-none"
          data-testid="scroll-indicator-top"
        >
          <div className="h-16 bg-gradient-to-b from-background to-transparent flex items-start justify-center pt-2">
            <button
              onClick={scrollToTop}
              className="pointer-events-auto bg-background/80 backdrop-blur-sm hover-elevate active-elevate-2 rounded-full p-2 shadow-md border"
              data-testid="button-scroll-top"
              aria-label="Scroll to top"
            >
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      )}

      {/* Scrollable Content */}
      <div
        ref={scrollContainerRef}
        className={cn("w-full h-full overflow-y-auto", className)}
        data-testid="scroll-container"
      >
        {children}
      </div>

      {/* Bottom Scroll Indicator */}
      {showBottomIndicator && canScrollDown && (
        <div 
          className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none"
          data-testid="scroll-indicator-bottom"
        >
          <div className="h-16 bg-gradient-to-t from-background to-transparent flex items-end justify-center pb-2">
            <button
              onClick={scrollToBottom}
              className="pointer-events-auto bg-background/80 backdrop-blur-sm hover-elevate active-elevate-2 rounded-full p-2 shadow-md border"
              data-testid="button-scroll-bottom"
              aria-label="Scroll to bottom"
            >
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
