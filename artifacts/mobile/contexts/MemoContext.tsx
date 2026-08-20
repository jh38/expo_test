import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export const MEMO_CATEGORIES = [
  { label: "부엌", color: "#FF8C42" },
  { label: "화장실", color: "#45B7D1" },
  { label: "침실", color: "#A29BFE" },
  { label: "거실", color: "#4ECDC4" },
  { label: "기타", color: "#718096" },
];

export interface Memo {
  id: string;
  title: string;
  content: string;
  category: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

interface MemoContextType {
  memos: Memo[];
  addMemo: (memo: Omit<Memo, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  updateMemo: (id: string, updates: Partial<Memo>) => Promise<void>;
  deleteMemo: (id: string) => Promise<void>;
  loading: boolean;
}

const MemoContext = createContext<MemoContextType | null>(null);
const STORAGE_KEY = "@cleaning_memos_v2";

export function MemoProvider({ children }: { children: React.ReactNode }) {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((data) => {
        if (data) setMemos(JSON.parse(data));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const persist = async (next: Memo[]) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setMemos(next);
  };

  const addMemo = useCallback(
    async (memo: Omit<Memo, "id" | "createdAt" | "updatedAt">) => {
      const now = new Date().toISOString();
      const newMemo: Memo = {
        ...memo,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        createdAt: now,
        updatedAt: now,
      };
      await persist([newMemo, ...memos]);
    },
    [memos]
  );

  const updateMemo = useCallback(
    async (id: string, updates: Partial<Memo>) => {
      await persist(
        memos.map((m) =>
          m.id === id ? { ...m, ...updates, updatedAt: new Date().toISOString() } : m
        )
      );
    },
    [memos]
  );

  const deleteMemo = useCallback(
    async (id: string) => {
      await persist(memos.filter((m) => m.id !== id));
    },
    [memos]
  );

  return (
    <MemoContext.Provider value={{ memos, addMemo, updateMemo, deleteMemo, loading }}>
      {children}
    </MemoContext.Provider>
  );
}

export function useMemos() {
  const ctx = useContext(MemoContext);
  if (!ctx) throw new Error("useMemos must be inside MemoProvider");
  return ctx;
}
