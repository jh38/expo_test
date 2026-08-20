import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export interface Category {
  id: string;
  label: string;
  color: string;
}

export const DEFAULT_CATEGORIES: Category[] = [
  { id: "kitchen", label: "부엌", color: "#FF8C42" },
  { id: "bathroom", label: "화장실", color: "#45B7D1" },
  { id: "bedroom", label: "침실", color: "#A29BFE" },
  { id: "living", label: "거실", color: "#4ECDC4" },
  { id: "other", label: "기타", color: "#718096" },
];

export const PALETTE_COLORS = [
  "#4ECDC4", "#45B7D1", "#3182CE", "#63B3ED",
  "#48BB78", "#68D391", "#A8E6CF", "#38A169",
  "#FC5C65", "#F687B3", "#FC8181", "#E53E3E",
  "#A29BFE", "#805AD5", "#B794F4", "#9F7AEA",
  "#F6AD55", "#FBD38D", "#FFA07A", "#ED8936",
  "#FF8C42", "#718096", "#A0AEC0", "#2D3748",
];

interface CategoryContextType {
  categories: Category[];
  addCategory: (label: string, color: string) => Promise<void>;
  updateCategory: (id: string, label: string, color: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  loading: boolean;
}

const CategoryContext = createContext<CategoryContextType | null>(null);
const STORAGE_KEY = "@cleaning_categories_v1";

export function CategoryProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((data) => {
        if (data) setCategories(JSON.parse(data));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const persist = async (next: Category[]) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setCategories(next);
  };

  const addCategory = useCallback(
    async (label: string, color: string) => {
      const newCat: Category = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 6),
        label,
        color,
      };
      await persist([...categories, newCat]);
    },
    [categories]
  );

  const updateCategory = useCallback(
    async (id: string, label: string, color: string) => {
      await persist(categories.map((c) => (c.id === id ? { ...c, label, color } : c)));
    },
    [categories]
  );

  const deleteCategory = useCallback(
    async (id: string) => {
      await persist(categories.filter((c) => c.id !== id));
    },
    [categories]
  );

  return (
    <CategoryContext.Provider value={{ categories, addCategory, updateCategory, deleteCategory, loading }}>
      {children}
    </CategoryContext.Provider>
  );
}

export function useCategories() {
  const ctx = useContext(CategoryContext);
  if (!ctx) throw new Error("useCategories must be inside CategoryProvider");
  return ctx;
}
