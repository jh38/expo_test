import AsyncStorage from "@react-native-async-storage/async-storage";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import type { Schedule } from "@/contexts/ScheduleContext";
import {
  cancelAllCleaningNotifications,
  scheduleCleaningNotification,
} from "@/utils/notifications";

export const BACKUP_STORAGE_KEYS = {
  schedules: "@cleaning_schedules_v3",
  memos: "@cleaning_memos_v2",
  categories: "@cleaning_categories_v1",
  quickKeywords: "@cleaning_quick_keywords_v1",
} as const;

export interface CleaningBackup {
  format: "cleaning-schedule-backup";
  version: 1;
  exportedAt: string;
  schedules: unknown[];
  memos: unknown[];
  categories: unknown[];
  quickKeywords: string[];
}

function parseArray(value: string | null, fallback: unknown[] = []): unknown[] {
  if (!value) return fallback;
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

export async function createBackup(): Promise<CleaningBackup> {
  const values = await AsyncStorage.multiGet(Object.values(BACKUP_STORAGE_KEYS));
  const stored = Object.fromEntries(values);

  return {
    format: "cleaning-schedule-backup",
    version: 1,
    exportedAt: new Date().toISOString(),
    schedules: parseArray(stored[BACKUP_STORAGE_KEYS.schedules]),
    memos: parseArray(stored[BACKUP_STORAGE_KEYS.memos]),
    categories: parseArray(stored[BACKUP_STORAGE_KEYS.categories]),
    quickKeywords: parseArray(stored[BACKUP_STORAGE_KEYS.quickKeywords]) as string[],
  };
}

export async function exportBackup(): Promise<"shared" | "saved"> {
  const backup = await createBackup();
  const filename = `청소스케줄-백업-${new Date().toISOString().slice(0, 10)}.json`;
  const uri = `${FileSystem.cacheDirectory ?? FileSystem.documentDirectory}${filename}`;

  await FileSystem.writeAsStringAsync(uri, JSON.stringify(backup, null, 2), {
    encoding: FileSystem.EncodingType.UTF8,
  });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: "application/json",
      dialogTitle: "청소 스케줄 백업 저장",
      UTI: "public.json",
    });
    return "shared";
  }

  return "saved";
}

function isValidBackup(value: unknown): value is CleaningBackup {
  if (!value || typeof value !== "object") return false;
  const backup = value as Partial<CleaningBackup>;
  return (
    backup.format === "cleaning-schedule-backup" &&
    backup.version === 1 &&
    Array.isArray(backup.schedules) &&
    Array.isArray(backup.memos) &&
    Array.isArray(backup.categories) &&
    Array.isArray(backup.quickKeywords)
  );
}

export async function pickBackup(): Promise<CleaningBackup | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: "application/json",
    copyToCacheDirectory: true,
  });

  if (result.canceled || !result.assets[0]) return null;
  const content = await FileSystem.readAsStringAsync(result.assets[0].uri, {
    encoding: FileSystem.EncodingType.UTF8,
  });
  const parsed: unknown = JSON.parse(content);

  if (!isValidBackup(parsed)) {
    throw new Error("청소 스케줄 백업 파일이 아닙니다.");
  }

  return parsed;
}

export async function restoreBackup(backup: CleaningBackup): Promise<void> {
  await cancelAllCleaningNotifications();

  const restoredSchedules = await Promise.all(
    (backup.schedules as Schedule[]).map(async (schedule) => {
      const { notificationId: _oldNotificationId, ...scheduleWithoutNotificationId } = schedule;
      if (!schedule.notificationEnabled) return scheduleWithoutNotificationId;

      const notificationId = await scheduleCleaningNotification(
        schedule.title,
        schedule.date,
        schedule.notificationTime,
      );
      return notificationId
        ? { ...scheduleWithoutNotificationId, notificationId }
        : scheduleWithoutNotificationId;
    }),
  );

  await AsyncStorage.multiSet([
    [BACKUP_STORAGE_KEYS.schedules, JSON.stringify(restoredSchedules)],
    [BACKUP_STORAGE_KEYS.memos, JSON.stringify(backup.memos)],
    [BACKUP_STORAGE_KEYS.categories, JSON.stringify(backup.categories)],
    [BACKUP_STORAGE_KEYS.quickKeywords, JSON.stringify(backup.quickKeywords)],
  ]);
}