import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export const SCHEDULE_COLORS = [
  "#4ECDC4", "#45B7D1", "#3182CE", "#63B3ED",
  "#48BB78", "#68D391", "#A8E6CF", "#38A169",
  "#FC5C65", "#F687B3", "#FC8181", "#E53E3E",
  "#A29BFE", "#805AD5", "#B794F4", "#9F7AEA",
  "#F6AD55", "#FBD38D", "#FFA07A", "#ED8936",
  "#FF8C42", "#718096",
];

export type RecurrenceType = "none" | "daily" | "weekly" | "monthly";

export const RECURRENCE_LABELS: Record<RecurrenceType, string> = {
  none: "없음",
  daily: "매일",
  weekly: "매주",
  monthly: "매월",
};

export interface Schedule {
  id: string;
  date: string;
  title: string;
  description: string;
  completed: boolean;
  color: string;
  notificationEnabled: boolean;
  notificationTime: string;
  notificationId?: string;
  recurrence: RecurrenceType;
  recurrenceEndDate?: string;
}

interface ScheduleContextType {
  schedules: Schedule[];
  addSchedule: (schedule: Omit<Schedule, "id">) => Promise<Schedule>;
  updateSchedule: (id: string, updates: Partial<Schedule>) => Promise<void>;
  deleteSchedule: (id: string) => Promise<void>;
  toggleComplete: (id: string) => Promise<void>;
  getSchedulesForDate: (date: string) => Schedule[];
  loading: boolean;
}

const ScheduleContext = createContext<ScheduleContextType | null>(null);
const STORAGE_KEY = "@cleaning_schedules_v3";

function matchesRecurrence(schedule: Schedule, targetDate: string): boolean {
  if (schedule.date > targetDate) return false;
  if (schedule.recurrenceEndDate && targetDate > schedule.recurrenceEndDate) return false;
  if (schedule.date === targetDate) return true;
  if (!schedule.recurrence || schedule.recurrence === "none") return false;

  const start = new Date(schedule.date + "T00:00:00");
  const target = new Date(targetDate + "T00:00:00");

  switch (schedule.recurrence) {
    case "daily":
      return true;
    case "weekly":
      return start.getDay() === target.getDay();
    case "monthly":
      return schedule.date.split("-")[2] === targetDate.split("-")[2];
    default:
      return false;
  }
}

export function ScheduleProvider({ children }: { children: React.ReactNode }) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((data) => {
        if (data) setSchedules(JSON.parse(data));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const persist = async (next: Schedule[]) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setSchedules(next);
  };

  const addSchedule = useCallback(
    async (schedule: Omit<Schedule, "id">) => {
      const newSchedule: Schedule = {
        ...schedule,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      };
      await persist([...schedules, newSchedule]);
      return newSchedule;
    },
    [schedules]
  );

  const updateSchedule = useCallback(
    async (id: string, updates: Partial<Schedule>) => {
      await persist(schedules.map((s) => (s.id === id ? { ...s, ...updates } : s)));
    },
    [schedules]
  );

  const deleteSchedule = useCallback(
    async (id: string) => {
      await persist(schedules.filter((s) => s.id !== id));
    },
    [schedules]
  );

  const toggleComplete = useCallback(
    async (id: string) => {
      await persist(
        schedules.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s))
      );
    },
    [schedules]
  );

  const getSchedulesForDate = useCallback(
    (date: string) => schedules.filter((s) => matchesRecurrence(s, date)),
    [schedules]
  );

  return (
    <ScheduleContext.Provider
      value={{
        schedules,
        addSchedule,
        updateSchedule,
        deleteSchedule,
        toggleComplete,
        getSchedulesForDate,
        loading,
      }}
    >
      {children}
    </ScheduleContext.Provider>
  );
}

export function useSchedules() {
  const ctx = useContext(ScheduleContext);
  if (!ctx) throw new Error("useSchedules must be inside ScheduleProvider");
  return ctx;
}
