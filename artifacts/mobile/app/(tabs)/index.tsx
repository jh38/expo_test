import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CalendarView from "@/components/CalendarView";
import FAB from "@/components/FAB";
import ScheduleCard from "@/components/ScheduleCard";
import { useSchedules } from "@/contexts/ScheduleContext";
import { useColors } from "@/hooks/useColors";
import { cancelCleaningNotification } from "@/utils/notifications";

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function CalendarTab() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { deleteSchedule, toggleComplete, getSchedulesForDate } = useSchedules();
  const [selectedDate, setSelectedDate] = useState(todayStr);

  const daySchedules = getSchedulesForDate(selectedDate);

  const formattedDate = new Date(selectedDate + "T00:00:00").toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
  });

  const handleDelete = (id: string, notificationId?: string) => {
    Alert.alert("삭제", "이 스케줄을 삭제할까요?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: async () => {
          if (Platform.OS !== "web")
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          if (notificationId) await cancelCleaningNotification(notificationId);
          deleteSchedule(id);
        },
      },
    ]);
  };

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scrollContent: {
      paddingHorizontal: 16,
      paddingTop: Platform.OS === "web" ? insets.top + 16 : 16,
      paddingBottom: 120,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 20,
      marginBottom: 12,
    },
    sectionTitle: {
      fontSize: 16,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
    },
    countBadge: {
      backgroundColor: colors.primary,
      borderRadius: 10,
      paddingHorizontal: 8,
      paddingVertical: 2,
    },
    countText: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: "#fff" },
    emptyBox: { alignItems: "center", paddingVertical: 32 },
    emptyText: {
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      marginTop: 8,
    },
    completedLabel: {
      fontSize: 12,
      fontFamily: "Inter_500Medium",
      color: colors.mutedForeground,
      marginBottom: 8,
      marginTop: 4,
    },
  });

  const pending = daySchedules.filter((s) => !s.completed);
  const completed = daySchedules.filter((s) => s.completed);

  return (
    <View style={s.container}>
      <ScrollView
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ flexDirection: "row", justifyContent: "flex-end", marginBottom: 4 }}>
          <TouchableOpacity
            onPress={() => router.push("../settings")}
            accessibilityLabel="데이터 관리 열기"
            hitSlop={10}
            style={{ padding: 6 }}
          >
            <Feather name="settings" size={21} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>
        <CalendarView
          getSchedulesForDate={getSchedulesForDate}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />

        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>{formattedDate}</Text>
          {daySchedules.length > 0 && (
            <View style={s.countBadge}>
              <Text style={s.countText}>{daySchedules.length}개</Text>
            </View>
          )}
        </View>

        {daySchedules.length === 0 ? (
          <View style={s.emptyBox}>
            <Feather name="check-circle" size={36} color={colors.mutedForeground} />
            <Text style={s.emptyText}>이 날의 청소 일정이 없어요</Text>
            <TouchableOpacity
              style={{
                marginTop: 12,
                backgroundColor: colors.primary + "22",
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
              }}
              onPress={() =>
                router.push({ pathname: "/schedule-form", params: { date: selectedDate } })
              }
            >
              <Text
                style={{
                  color: colors.primary,
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 13,
                }}
              >
                + 일정 추가하기
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {pending.map((s) => (
              <ScheduleCard
                key={s.id}
                schedule={s}
                onToggle={() => toggleComplete(s.id)}
                onEdit={() =>
                  router.push({
                    pathname: "/schedule-form",
                    params: { id: s.id, date: s.date },
                  })
                }
                onDelete={() => handleDelete(s.id, s.notificationId)}
              />
            ))}
            {completed.length > 0 && (
              <>
                <Text style={s.completedLabel}>완료된 항목 {completed.length}개</Text>
                {completed.map((s) => (
                  <ScheduleCard
                    key={s.id}
                    schedule={s}
                    onToggle={() => toggleComplete(s.id)}
                    onEdit={() =>
                      router.push({
                        pathname: "/schedule-form",
                        params: { id: s.id, date: s.date },
                      })
                    }
                    onDelete={() => handleDelete(s.id, s.notificationId)}
                  />
                ))}
              </>
            )}
          </>
        )}
      </ScrollView>

      <FAB
        onPress={() =>
          router.push({ pathname: "/schedule-form", params: { date: selectedDate } })
        }
      />
    </View>
  );
}
