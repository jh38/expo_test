import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSchedules } from "@/contexts/ScheduleContext";
import { useColors } from "@/hooks/useColors";

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatDateKr(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("ko-KR", { month: "long", day: "numeric", weekday: "short" });
}

function getDaysUntil(dateStr: string) {
  const today = new Date(todayStr() + "T00:00:00");
  const target = new Date(dateStr + "T00:00:00");
  const diff = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "오늘";
  if (diff === 1) return "내일";
  if (diff < 0) return `${Math.abs(diff)}일 전`;
  return `${diff}일 후`;
}

export default function AlarmsTab() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { schedules } = useSchedules();

  const today = todayStr();

  const upcoming = useMemo(() => {
    const next30 = new Date();
    next30.setDate(next30.getDate() + 30);
    const next30Str = `${next30.getFullYear()}-${String(next30.getMonth() + 1).padStart(2, "0")}-${String(next30.getDate()).padStart(2, "0")}`;

    return schedules
      .filter((s) => s.date >= today && s.date <= next30Str && !s.completed)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [schedules, today]);

  const withNotif = upcoming.filter((s) => s.notificationEnabled);
  const withoutNotif = upcoming.filter((s) => !s.notificationEnabled);

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scrollContent: {
      paddingHorizontal: 16,
      paddingTop: Platform.OS === "web" ? insets.top + 16 : 16,
      paddingBottom: 100,
    },
    sectionLabel: {
      fontSize: 13,
      fontFamily: "Inter_600SemiBold",
      color: colors.mutedForeground,
      marginBottom: 10,
      marginTop: 16,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      padding: 14,
      marginBottom: 10,
      flexDirection: "row",
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    colorBar: {
      width: 4,
      borderRadius: 2,
      alignSelf: "stretch",
      marginRight: 12,
    },
    cardContent: { flex: 1 },
    cardTitle: {
      fontSize: 15,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
      marginBottom: 2,
    },
    cardDate: {
      fontSize: 13,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
    },
    badgeRow: {
      flexDirection: "row",
      gap: 6,
      marginTop: 4,
      flexWrap: "wrap",
    },
    badge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 8,
    },
    badgeText: {
      fontSize: 12,
      fontFamily: "Inter_500Medium",
    },
    editBtn: { padding: 6 },
    emptyBox: {
      alignItems: "center",
      paddingVertical: 64,
    },
    emptyTitle: {
      fontSize: 16,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
      marginTop: 12,
    },
    emptyText: {
      fontSize: 13,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      marginTop: 4,
      textAlign: "center",
      paddingHorizontal: 32,
    },
    summaryBox: {
      backgroundColor: colors.primary + "18",
      borderRadius: colors.radius,
      padding: 16,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginBottom: 8,
    },
    summaryText: {
      flex: 1,
      fontSize: 14,
      fontFamily: "Inter_500Medium",
      color: colors.primary,
    },
  });

  if (upcoming.length === 0) {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.emptyBox}>
            <Feather name="bell-off" size={48} color={colors.mutedForeground} />
            <Text style={styles.emptyTitle}>예정된 청소가 없어요</Text>
            <Text style={styles.emptyText}>
              달력 탭에서 청소 일정을 추가하면 여기서 확인할 수 있어요
            </Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.summaryBox}>
          <Feather name="calendar" size={20} color={colors.primary} />
          <Text style={styles.summaryText}>
            앞으로 30일 내에 청소 일정이{" "}
            <Text style={{ fontFamily: "Inter_700Bold" }}>{upcoming.length}개</Text> 있어요
          </Text>
        </View>

        {withNotif.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>
              <Feather name="bell" size={12} /> 알림 설정됨 ({withNotif.length})
            </Text>
            {withNotif.map((s) => (
              <TouchableOpacity
                key={s.id}
                style={styles.card}
                onPress={() =>
                  router.push({ pathname: "/schedule-form", params: { id: s.id, date: s.date } })
                }
                activeOpacity={0.85}
              >
                <View style={[styles.colorBar, { backgroundColor: s.color }]} />
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle} numberOfLines={1}>{s.title}</Text>
                  <Text style={styles.cardDate}>{formatDateKr(s.date)}</Text>
                  <View style={styles.badgeRow}>
                    <View style={[styles.badge, { backgroundColor: colors.primary + "20" }]}>
                      <Feather name="bell" size={11} color={colors.primary} />
                      <Text style={[styles.badgeText, { color: colors.primary }]}>
                        {s.notificationTime}
                      </Text>
                    </View>
                    <View style={[styles.badge, { backgroundColor: s.date === today ? colors.warning + "30" : colors.muted }]}>
                      <Text style={[styles.badgeText, { color: s.date === today ? colors.warning : colors.mutedForeground }]}>
                        {getDaysUntil(s.date)}
                      </Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={() =>
                    router.push({ pathname: "/schedule-form", params: { id: s.id, date: s.date } })
                  }
                >
                  <Feather name="edit-2" size={16} color={colors.mutedForeground} />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </>
        )}

        {withoutNotif.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>알림 없음 ({withoutNotif.length})</Text>
            {withoutNotif.map((s) => (
              <TouchableOpacity
                key={s.id}
                style={[styles.card, { opacity: 0.7 }]}
                onPress={() =>
                  router.push({ pathname: "/schedule-form", params: { id: s.id, date: s.date } })
                }
                activeOpacity={0.85}
              >
                <View style={[styles.colorBar, { backgroundColor: s.color }]} />
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle} numberOfLines={1}>{s.title}</Text>
                  <Text style={styles.cardDate}>{formatDateKr(s.date)}</Text>
                  <View style={styles.badgeRow}>
                    <View style={[styles.badge, { backgroundColor: colors.muted }]}>
                      <Feather name="bell-off" size={11} color={colors.mutedForeground} />
                      <Text style={[styles.badgeText, { color: colors.mutedForeground }]}>
                        알림 없음
                      </Text>
                    </View>
                    <View style={[styles.badge, { backgroundColor: colors.muted }]}>
                      <Text style={[styles.badgeText, { color: colors.mutedForeground }]}>
                        {getDaysUntil(s.date)}
                      </Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={() =>
                    router.push({ pathname: "/schedule-form", params: { id: s.id, date: s.date } })
                  }
                >
                  <Feather name="edit-2" size={16} color={colors.mutedForeground} />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}
