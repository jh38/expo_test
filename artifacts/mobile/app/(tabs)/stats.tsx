import { Feather } from "@expo/vector-icons";
import React, { useMemo } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RECURRENCE_LABELS, RecurrenceType, useSchedules } from "@/contexts/ScheduleContext";
import { useColors } from "@/hooks/useColors";

function dateStr(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min(value / max, 1) : 0;
  return (
    <View style={{ height: 10, borderRadius: 5, backgroundColor: color + "22", overflow: "hidden" }}>
      <View style={{ height: "100%", width: `${Math.round(pct * 100)}%`, backgroundColor: color, borderRadius: 5 }} />
    </View>
  );
}

export default function StatsTab() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { schedules, getSchedulesForDate } = useSchedules();

  const today = dateStr(0);
  const thisMonthPrefix = today.slice(0, 7);

  const stats = useMemo(() => {
    const total = schedules.length;
    const completed = schedules.filter((s) => s.completed).length;
    const pending = total - completed;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

    const thisMonth = schedules.filter(
      (s) => s.recurrence === "none" && s.date.startsWith(thisMonthPrefix)
    );
    const thisMonthDone = thisMonth.filter((s) => s.completed).length;

    const byRecurrence: Record<RecurrenceType, { total: number; done: number }> = {
      none: { total: 0, done: 0 },
      daily: { total: 0, done: 0 },
      weekly: { total: 0, done: 0 },
      monthly: { total: 0, done: 0 },
    };
    for (const s of schedules) {
      byRecurrence[s.recurrence].total++;
      if (s.completed) byRecurrence[s.recurrence].done++;
    }
    const maxRecurCount = Math.max(...Object.values(byRecurrence).map((v) => v.total), 1);

    const recentCompleted = [...schedules]
      .filter((s) => s.completed)
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 5);

    const upcoming = [...schedules]
      .filter(
        (s) =>
          !s.completed &&
          s.recurrence === "none" &&
          s.date >= today &&
          s.date <= dateStr(30)
      )
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 5);

    return { total, completed, pending, rate, thisMonth, thisMonthDone, byRecurrence, maxRecurCount, recentCompleted, upcoming };
  }, [schedules, today, thisMonthPrefix]);

  const heatmap = useMemo(() => {
    const days: { label: number; total: number; done: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const ds = dateStr(-i);
      const dayItems = getSchedulesForDate(ds);
      const d = new Date(ds + "T00:00:00");
      days.push({ label: d.getDate(), total: dayItems.length, done: dayItems.filter((s) => s.completed).length });
    }
    return days;
  }, [schedules]);

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scroll: {
      paddingHorizontal: 16,
      paddingTop: Platform.OS === "web" ? insets.top + 16 : 16,
      paddingBottom: 120,
      gap: 12,
    },
    sectionTitle: {
      fontSize: 13,
      fontFamily: "Inter_600SemiBold",
      color: colors.mutedForeground,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      marginBottom: 8,
      marginTop: 4,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      padding: 16,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 6,
      elevation: 2,
    },
    summaryRow: { flexDirection: "row", gap: 10 },
    summaryCard: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      padding: 14,
      alignItems: "center",
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 6,
      elevation: 2,
    },
    bigNum: {
      fontSize: 28,
      fontFamily: "Inter_700Bold",
      color: colors.primary,
      marginBottom: 2,
    },
    bigLabel: {
      fontSize: 11,
      fontFamily: "Inter_500Medium",
      color: colors.mutedForeground,
    },
    rateNum: {
      fontSize: 40,
      fontFamily: "Inter_700Bold",
      color: colors.primary,
    },
    rateLabel: {
      fontSize: 13,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      marginBottom: 10,
    },
    recurRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
    recurLabel: { width: 52, fontSize: 13, fontFamily: "Inter_500Medium", color: colors.foreground },
    recurBarTrack: { flex: 1, height: 8, borderRadius: 4, backgroundColor: colors.muted, overflow: "hidden", marginHorizontal: 10 },
    recurBarFill: { height: "100%", borderRadius: 4 },
    recurCount: { width: 28, fontSize: 12, fontFamily: "Inter_600SemiBold", color: colors.foreground, textAlign: "right" },
    listItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 9,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      gap: 10,
    },
    listTitle: { flex: 1, fontSize: 14, fontFamily: "Inter_500Medium", color: colors.foreground },
    listDate: { fontSize: 12, fontFamily: "Inter_400Regular", color: colors.mutedForeground },
    colorDot: { width: 8, height: 8, borderRadius: 4 },
    emptyText: { fontSize: 13, fontFamily: "Inter_400Regular", color: colors.mutedForeground, textAlign: "center", paddingVertical: 16 },
    heatmapWrap: { flexDirection: "row", flexWrap: "wrap", gap: 4 },
    heatCell: { width: 22, height: 22, borderRadius: 5, alignItems: "center", justifyContent: "center" },
    heatLabel: { fontSize: 8, fontFamily: "Inter_500Medium" },
  });

  const RECURRENCE_COLORS: Record<RecurrenceType, string> = {
    none: colors.mutedForeground,
    daily: "#C4724A",
    weekly: "#7A8FC4",
    monthly: "#7DAA80",
  };

  const monthName = new Date(today + "T00:00:00").toLocaleDateString("ko-KR", { month: "long" });

  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Summary cards */}
        <View style={s.summaryRow}>
          <View style={s.summaryCard}>
            <Text style={s.bigNum}>{stats.total}</Text>
            <Text style={s.bigLabel}>전체 일정</Text>
          </View>
          <View style={s.summaryCard}>
            <Text style={[s.bigNum, { color: colors.success }]}>{stats.completed}</Text>
            <Text style={s.bigLabel}>완료</Text>
          </View>
          <View style={s.summaryCard}>
            <Text style={[s.bigNum, { color: stats.pending > 0 ? colors.warning : colors.mutedForeground }]}>{stats.pending}</Text>
            <Text style={s.bigLabel}>남은 일정</Text>
          </View>
        </View>

        {/* Overall completion rate */}
        <View style={s.card}>
          <Text style={s.sectionTitle}>전체 달성률</Text>
          <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 6, marginBottom: 10 }}>
            <Text style={s.rateNum}>{stats.rate}</Text>
            <Text style={[s.rateLabel, { marginBottom: 8 }]}>%</Text>
            <Text style={[s.rateLabel, { flex: 1, textAlign: "right", marginBottom: 8 }]}>
              {stats.completed}/{stats.total}개 완료
            </Text>
          </View>
          <ProgressBar value={stats.completed} max={stats.total} color={colors.primary} />
        </View>

        {/* This month */}
        <View style={s.card}>
          <Text style={s.sectionTitle}>이번 달 ({monthName})</Text>
          {stats.thisMonth.length === 0 ? (
            <Text style={s.emptyText}>이번 달 등록된 일회성 일정이 없어요</Text>
          ) : (
            <>
              <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 4, marginBottom: 10 }}>
                <Text style={[s.bigNum, { fontSize: 22 }]}>{stats.thisMonthDone}</Text>
                <Text style={[s.rateLabel, { marginBottom: 2 }]}>/ {stats.thisMonth.length}개 완료</Text>
                <Text style={[s.rateLabel, { flex: 1, textAlign: "right", marginBottom: 2, color: colors.primary }]}>
                  {stats.thisMonth.length > 0 ? Math.round((stats.thisMonthDone / stats.thisMonth.length) * 100) : 0}%
                </Text>
              </View>
              <ProgressBar value={stats.thisMonthDone} max={stats.thisMonth.length} color={colors.primary} />
            </>
          )}
        </View>

        {/* 30-day heatmap */}
        <View style={s.card}>
          <Text style={s.sectionTitle}>최근 30일 현황</Text>
          <View style={s.heatmapWrap}>
            {heatmap.map((day, i) => {
              const hasSchedule = day.total > 0;
              const allDone = hasSchedule && day.done === day.total;
              const someDone = hasSchedule && day.done > 0 && day.done < day.total;
              const noneDone = hasSchedule && day.done === 0;
              const bg = allDone
                ? colors.primary
                : someDone
                ? colors.primary + "66"
                : noneDone
                ? colors.primary + "22"
                : colors.border + "88";
              const textColor = allDone ? "#fff" : someDone ? colors.primary : noneDone ? colors.primary + "AA" : colors.mutedForeground;
              return (
                <View key={i} style={[s.heatCell, { backgroundColor: bg }]}>
                  <Text style={[s.heatLabel, { color: textColor }]}>{day.label}</Text>
                </View>
              );
            })}
          </View>
          <View style={{ flexDirection: "row", gap: 12, marginTop: 10, flexWrap: "wrap" }}>
            {[
              { color: colors.primary, label: "모두 완료" },
              { color: colors.primary + "66", label: "일부 완료" },
              { color: colors.primary + "22", label: "미완료" },
              { color: colors.border + "88", label: "일정 없음" },
            ].map((item) => (
              <View key={item.label} style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <View style={[s.colorDot, { backgroundColor: item.color }]} />
                <Text style={{ fontSize: 10, color: colors.mutedForeground, fontFamily: "Inter_400Regular" }}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Recurrence breakdown */}
        <View style={s.card}>
          <Text style={s.sectionTitle}>반복 유형 분포</Text>
          {(["none", "daily", "weekly", "monthly"] as RecurrenceType[]).map((type) => {
            const { total, done } = stats.byRecurrence[type];
            if (total === 0) return null;
            const barPct = total / stats.maxRecurCount;
            return (
              <View key={type} style={s.recurRow}>
                <Text style={s.recurLabel}>{RECURRENCE_LABELS[type]}</Text>
                <View style={s.recurBarTrack}>
                  <View style={[s.recurBarFill, { width: `${Math.round(barPct * 100)}%`, backgroundColor: RECURRENCE_COLORS[type] }]} />
                </View>
                <Text style={s.recurCount}>{total}</Text>
                <View style={{ marginLeft: 6, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, backgroundColor: colors.success + "22" }}>
                  <Text style={{ fontSize: 10, color: colors.success, fontFamily: "Inter_500Medium" }}>
                    {done}/{total}
                  </Text>
                </View>
              </View>
            );
          })}
          {stats.total === 0 && <Text style={s.emptyText}>등록된 일정이 없어요</Text>}
        </View>

        {/* Recently completed */}
        <View style={s.card}>
          <Text style={s.sectionTitle}>최근 완료한 일정</Text>
          {stats.recentCompleted.length === 0 ? (
            <Text style={s.emptyText}>완료한 일정이 없어요</Text>
          ) : (
            stats.recentCompleted.map((s2, i) => (
              <View key={s2.id} style={[s.listItem, i === stats.recentCompleted.length - 1 && { borderBottomWidth: 0 }]}>
                <View style={[s.colorDot, { width: 10, height: 10, backgroundColor: s2.color }]} />
                <Text style={s.listTitle} numberOfLines={1}>{s2.title}</Text>
                <Text style={s.listDate}>
                  {new Date(s2.date + "T00:00:00").toLocaleDateString("ko-KR", { month: "short", day: "numeric" })}
                </Text>
                <Feather name="check-circle" size={14} color={colors.success} />
              </View>
            ))
          )}
        </View>

        {/* Upcoming */}
        {stats.upcoming.length > 0 && (
          <View style={s.card}>
            <Text style={s.sectionTitle}>앞으로 예정된 일정</Text>
            {stats.upcoming.map((s2, i) => (
              <View key={s2.id} style={[s.listItem, i === stats.upcoming.length - 1 && { borderBottomWidth: 0 }]}>
                <View style={[s.colorDot, { width: 10, height: 10, backgroundColor: s2.color }]} />
                <Text style={s.listTitle} numberOfLines={1}>{s2.title}</Text>
                <Text style={s.listDate}>
                  {new Date(s2.date + "T00:00:00").toLocaleDateString("ko-KR", { month: "short", day: "numeric" })}
                </Text>
              </View>
            ))}
          </View>
        )}

      </ScrollView>
    </View>
  );
}
