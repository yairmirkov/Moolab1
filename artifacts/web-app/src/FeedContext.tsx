import { createContext, useContext, useState, useRef, useCallback, type ReactNode } from "react";

interface FeedState {
  currentData: any;
  setCurrentData: React.Dispatch<React.SetStateAction<any>>;
  activeSlideIndex: number;
  setActiveSlideIndex: React.Dispatch<React.SetStateAction<number>>;
  completedSlides: string[];
  setCompletedSlides: React.Dispatch<React.SetStateAction<string[]>>;
  slideAnswers: Record<string, any>;
  setSlideAnswers: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  isFetchingMore: boolean;
  setIsFetchingMore: React.Dispatch<React.SetStateAction<boolean>>;
  isFetchingRef: React.MutableRefObject<boolean>;
  introBurned: boolean;
  burnIntro: () => void;
  resetFeedSession: () => void;
  scrollProgress: number;
  setScrollProgress: React.Dispatch<React.SetStateAction<number>>;
  feedRef: React.RefObject<HTMLDivElement | null>;
  slidesScrolledRef: React.MutableRefObject<number>;
  lastSlideRef: React.MutableRefObject<number>;
}

const FeedContext = createContext<FeedState | null>(null);

export function FeedProvider({ children }: { children: ReactNode }) {
  const [currentData, setCurrentData] = useState<any>(null);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [completedSlides, setCompletedSlides] = useState<string[]>([]);
  const [slideAnswers, setSlideAnswers] = useState<Record<string, any>>({});
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const isFetchingRef = useRef(false);
  const [introBurned, setIntroBurned] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const feedRef = useRef<HTMLDivElement | null>(null);
  const slidesScrolledRef = useRef(0);
  const lastSlideRef = useRef(-1);

  const burnIntro = useCallback(() => {
    if (introBurned) return;
    setCurrentData((prev: any) => {
      if (!prev?.lessons?.length) return prev;
      if (prev.lessons[0]?.type !== "intro") return prev;
      return { ...prev, lessons: prev.lessons.slice(1) };
    });
    setActiveSlideIndex((prev) => Math.max(0, prev - 1));
    setIntroBurned(true);
    if (feedRef.current) {
      requestAnimationFrame(() => {
        if (feedRef.current) {
          feedRef.current.scrollTop = 0;
        }
      });
    }
  }, [introBurned]);

  const resetFeedSession = useCallback(() => {
    setCurrentData(null);
    setActiveSlideIndex(0);
    setCompletedSlides([]);
    setSlideAnswers({});
    setIsFetchingMore(false);
    isFetchingRef.current = false;
    setIntroBurned(false);
    setScrollProgress(0);
    slidesScrolledRef.current = 0;
    lastSlideRef.current = -1;
  }, []);

  return (
    <FeedContext.Provider
      value={{
        currentData,
        setCurrentData,
        activeSlideIndex,
        setActiveSlideIndex,
        completedSlides,
        setCompletedSlides,
        slideAnswers,
        setSlideAnswers,
        isFetchingMore,
        setIsFetchingMore,
        isFetchingRef,
        introBurned,
        burnIntro,
        resetFeedSession,
        scrollProgress,
        setScrollProgress,
        feedRef,
        slidesScrolledRef,
        lastSlideRef,
      }}
    >
      {children}
    </FeedContext.Provider>
  );
}

export function useFeed() {
  const ctx = useContext(FeedContext);
  if (!ctx) throw new Error("useFeed must be used within FeedProvider");
  return ctx;
}
