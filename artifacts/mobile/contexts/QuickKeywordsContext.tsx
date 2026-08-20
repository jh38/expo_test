import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const STORAGE_KEY = "@cleaning_quick_keywords_v1";

const DEFAULT_KEYWORDS = [
  "화장실 청소",
  "주방 청소",
  "거실 청소",
  "침실 청소",
  "창문 닦기",
  "바닥 청소",
  "분리수거",
];

interface QuickKeywordsContextType {
  keywords: string[];
  addKeyword: (keyword: string) => Promise<void>;
  removeKeyword: (keyword: string) => Promise<void>;
  loading: boolean;
}

const QuickKeywordsContext = createContext<QuickKeywordsContextType | null>(null);

export function QuickKeywordsProvider({ children }: { children: React.ReactNode }) {
  const [keywords, setKeywords] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((data) => {
        if (data) {
          setKeywords(JSON.parse(data));
        } else {
          setKeywords(DEFAULT_KEYWORDS);
          AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_KEYWORDS));
        }
      })
      .catch(() => setKeywords(DEFAULT_KEYWORDS))
      .finally(() => setLoading(false));
  }, []);

  const persist = async (next: string[]) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setKeywords(next);
  };

  const addKeyword = useCallback(
    async (keyword: string) => {
      const trimmed = keyword.trim();
      if (!trimmed || keywords.includes(trimmed)) return;
      await persist([...keywords, trimmed]);
    },
    [keywords]
  );

  const removeKeyword = useCallback(
    async (keyword: string) => {
      await persist(keywords.filter((k) => k !== keyword));
    },
    [keywords]
  );

  return (
    <QuickKeywordsContext.Provider value={{ keywords, addKeyword, removeKeyword, loading }}>
      {children}
    </QuickKeywordsContext.Provider>
  );
}

export function useQuickKeywords() {
  const ctx = useContext(QuickKeywordsContext);
  if (!ctx) throw new Error("useQuickKeywords must be inside QuickKeywordsProvider");
  return ctx;
}
