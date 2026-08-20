import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  RECURRENCE_LABELS,
  RecurrenceType,
  SCHEDULE_COLORS,
  useSchedules,
} from "@/contexts/ScheduleContext";
import { useQuickKeywords } from "@/contexts/QuickKeywordsContext";
import { useColors } from "@/hooks/useColors";
import {
  cancelCleaningNotification,
  requestNotificationPermissions,
  scheduleCleaningNotification,
} from "@/utils/notifications";

const RECURRENCE_OPTIONS: RecurrenceType[] = ["none", "daily", "weekly", "monthly"];
const WEEKDAYS_SHORT = ["일", "월", "화", "수", "목", "금", "토"];

function buildCalendarCells(year: number, month: number) {
  const firstDay = new Date(year, month - 1, 1).getDay();
  const totalDays = new Date(year, month, 0).getDate();
  const cells: Array<number | null> = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function toStr(y: number, m: number, d: number) {
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export default function ScheduleFormScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id?: string; date?: string }>();
  const { schedules, addSchedule, updateSchedule } = useSchedules();

  const existing = params.id ? schedules.find((s) => s.id === params.id) : null;

  const todayDate = new Date();
  const initialDate =
    params.date ??
    toStr(todayDate.getFullYear(), todayDate.getMonth() + 1, todayDate.getDate());

  const [title, setTitle] = useState(existing?.title ?? "");
  const [description, setDescription] = useState(existing?.description ?? "");
  const [selectedDate, setSelectedDate] = useState(existing?.date ?? initialDate);
  const [color, setColor] = useState(existing?.color ?? SCHEDULE_COLORS[0]);
  const [recurrence, setRecurrence] = useState<RecurrenceType>(
    existing?.recurrence ?? "none"
  );
  const [recurrenceEndDate, setRecurrenceEndDate] = useState<string | undefined>(
    existing?.recurrenceEndDate
  );
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [endCalYear, setEndCalYear] = useState(() => {
    if (existing?.recurrenceEndDate) return parseInt(existing.recurrenceEndDate.split("-")[0], 10);
    const d = new Date(); return d.getFullYear();
  });
  const [endCalMonth, setEndCalMonth] = useState(() => {
    if (existing?.recurrenceEndDate) return parseInt(existing.recurrenceEndDate.split("-")[1], 10);
    const d = new Date(); return d.getMonth() + 1;
  });
  const [notifEnabled, setNotifEnabled] = useState(existing?.notificationEnabled ?? false);
  const [notifHour, setNotifHour] = useState(() => {
    const t = existing?.notificationTime ?? "09:00";
    return parseInt(t.split(":")[0], 10);
  });
  const [notifMinute, setNotifMinute] = useState(() => {
    const t = existing?.notificationTime ?? "09:00";
    return parseInt(t.split(":")[1], 10);
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [calYear, setCalYear] = useState(() => parseInt(selectedDate.split("-")[0], 10));
  const [calMonth, setCalMonth] = useState(() => parseInt(selectedDate.split("-")[1], 10));

  const { keywords, addKeyword, removeKeyword } = useQuickKeywords();
  const [showAddKeyword, setShowAddKeyword] = useState(false);
  const [newKeyword, setNewKeyword] = useState("");

  const titleRef = useRef<TextInput>(null);
  const notifTime = `${String(notifHour).padStart(2, "0")}:${String(notifMinute).padStart(2, "0")}`;

  const handleAddKeyword = async () => {
    if (!newKeyword.trim()) return;
    await addKeyword(newKeyword.trim());
    setNewKeyword("");
    setShowAddKeyword(false);
  };

  const handleKeywordChipLongPress = (kw: string) => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert("키워드 삭제", `"${kw}"를 목록에서 삭제할까요?`, [
      { text: "취소", style: "cancel" },
      { text: "삭제", style: "destructive", onPress: () => removeKeyword(kw) },
    ]);
  };

  const handleToggleNotif = async (val: boolean) => {
    if (val && Platform.OS !== "web") {
      const granted = await requestNotificationPermissions();
      if (!granted) {
        Alert.alert("알림 권한", "설정에서 알림 권한을 허용해 주세요.");
        return;
      }
    }
    setNotifEnabled(val);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert("제목을 입력해 주세요");
      return;
    }
    if (Platform.OS !== "web")
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    let notificationId: string | undefined = existing?.notificationId;

    if (notifEnabled) {
      if (notificationId) await cancelCleaningNotification(notificationId);
      const id = await scheduleCleaningNotification(title.trim(), selectedDate, notifTime);
      notificationId = id ?? undefined;
    } else if (notificationId) {
      await cancelCleaningNotification(notificationId);
      notificationId = undefined;
    }

    const data = {
      date: selectedDate,
      title: title.trim(),
      description: description.trim(),
      completed: existing?.completed ?? false,
      color,
      recurrence,
      recurrenceEndDate: recurrence !== "none" ? recurrenceEndDate : undefined,
      notificationEnabled: notifEnabled,
      notificationTime: notifTime,
      notificationId,
    };

    if (existing) {
      await updateSchedule(existing.id, data);
    } else {
      await addSchedule(data);
    }
    router.back();
  };

  const calCells = buildCalendarCells(calYear, calMonth);

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingTop: Platform.OS === "web" ? insets.top + 16 : 16,
      paddingBottom: 16,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    closeBtn: { padding: 6, marginRight: 12 },
    headerTitle: {
      flex: 1,
      fontSize: 18,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
    },
    saveBtn: {
      backgroundColor: colors.primary,
      paddingHorizontal: 18,
      paddingVertical: 8,
      borderRadius: 20,
    },
    saveBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#fff" },
    scrollContent: { padding: 16, paddingBottom: 40 },
    section: {
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      padding: 16,
      marginBottom: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 4,
      elevation: 1,
    },
    label: {
      fontSize: 12,
      fontFamily: "Inter_600SemiBold",
      color: colors.mutedForeground,
      marginBottom: 8,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    input: {
      fontSize: 16,
      fontFamily: "Inter_400Regular",
      color: colors.foreground,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      paddingVertical: 8,
    },
    textArea: {
      fontSize: 15,
      fontFamily: "Inter_400Regular",
      color: colors.foreground,
      minHeight: 80,
      textAlignVertical: "top",
      paddingTop: 4,
    },
    dateBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 8,
    },
    dateBtnText: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: colors.foreground },
    // Color grid
    colorGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
    colorDot: { width: 28, height: 28, borderRadius: 14 },
    // Recurrence
    recurrenceRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
    recurrenceBtn: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1.5,
    },
    recurrenceBtnText: { fontSize: 14, fontFamily: "Inter_500Medium" },
    // Notification
    notifRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    notifLabel: { fontSize: 15, fontFamily: "Inter_500Medium", color: colors.foreground },
    timePicker: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      marginTop: 16,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    timeUnit: { alignItems: "center" },
    timeNum: {
      fontSize: 36,
      fontFamily: "Inter_700Bold",
      color: colors.primary,
      minWidth: 54,
      textAlign: "center",
    },
    timeSep: { fontSize: 32, fontFamily: "Inter_700Bold", color: colors.primary },
    timeUnitLabel: {
      fontSize: 11,
      fontFamily: "Inter_500Medium",
      color: colors.mutedForeground,
      marginTop: 2,
    },
    timeArrow: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.muted,
      alignItems: "center",
      justifyContent: "center",
    },
    // Mini calendar in date picker
    calendarContainer: { marginTop: 12 },
    calHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 8,
    },
    calTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: colors.foreground },
    calNavBtn: { padding: 6 },
    calWeekRow: { flexDirection: "row", marginBottom: 4 },
    calWeekDay: {
      flex: 1,
      textAlign: "center",
      fontSize: 11,
      fontFamily: "Inter_500Medium",
      color: colors.mutedForeground,
    },
    calRow: { flexDirection: "row" },
    calCell: { flex: 1, aspectRatio: 1, alignItems: "center", justifyContent: "center" },
    calDayBtn: {
      width: 30,
      height: 30,
      borderRadius: 15,
      alignItems: "center",
      justifyContent: "center",
    },
    calDayText: { fontSize: 13, fontFamily: "Inter_400Regular", color: colors.foreground },
    calSelectedBg: { backgroundColor: colors.primary },
    calSelectedText: { color: "#fff", fontFamily: "Inter_700Bold" },
  });

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={s.header}>
        <TouchableOpacity style={s.closeBtn} onPress={() => router.back()}>
          <Feather name="x" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>{existing ? "일정 수정" : "일정 추가"}</Text>
        <TouchableOpacity style={s.saveBtn} onPress={handleSave}>
          <Text style={s.saveBtnText}>저장</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={s.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Title */}
        <View style={s.section}>
          <Text style={s.label}>제목</Text>
          <TextInput
            ref={titleRef}
            style={s.input}
            placeholder="청소 항목을 입력해 주세요"
            placeholderTextColor={colors.mutedForeground}
            value={title}
            onChangeText={setTitle}
            returnKeyType="next"
            autoFocus={!existing}
          />
          {/* Quick keyword chips */}
          <View style={{ marginTop: 12 }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
              <Text style={[s.label, { marginBottom: 0, flex: 1 }]}>빠른 입력</Text>
              <TouchableOpacity
                onPress={() => setShowAddKeyword(true)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 12,
                  backgroundColor: colors.muted,
                }}
              >
                <Feather name="plus" size={12} color={colors.mutedForeground} />
                <Text style={{ fontSize: 12, fontFamily: "Inter_500Medium", color: colors.mutedForeground }}>
                  추가
                </Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ flexDirection: "row", gap: 8, paddingBottom: 4 }}
            >
              {keywords.map((kw) => (
                <TouchableOpacity
                  key={kw}
                  onPress={() => {
                    setTitle(kw);
                    if (Platform.OS !== "web") Haptics.selectionAsync();
                  }}
                  onLongPress={() => handleKeywordChipLongPress(kw)}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 7,
                    borderRadius: 20,
                    backgroundColor: title === kw ? color : colors.muted,
                    borderWidth: 1.5,
                    borderColor: title === kw ? color : "transparent",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontFamily: "Inter_500Medium",
                      color: title === kw ? "#fff" : colors.foreground,
                    }}
                  >
                    {kw}
                  </Text>
                </TouchableOpacity>
              ))}
              {keywords.length === 0 && (
                <Text style={{ fontSize: 13, color: colors.mutedForeground, fontFamily: "Inter_400Regular" }}>
                  아직 키워드가 없어요. 추가 버튼을 눌러보세요!
                </Text>
              )}
            </ScrollView>
            <Text style={{ fontSize: 11, color: colors.mutedForeground, fontFamily: "Inter_400Regular", marginTop: 6 }}>
              탭하면 제목에 입력돼요 · 길게 누르면 삭제
            </Text>
          </View>
        </View>

        {/* Description */}
        <View style={s.section}>
          <Text style={s.label}>메모</Text>
          <TextInput
            style={s.textArea}
            placeholder="청소 방법이나 메모를 입력해 주세요 (선택)"
            placeholderTextColor={colors.mutedForeground}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Date */}
        <View style={s.section}>
          <Text style={s.label}>날짜</Text>
          <TouchableOpacity
            style={s.dateBtn}
            onPress={() => setShowDatePicker((v) => !v)}
          >
            <Text style={s.dateBtnText}>
              {new Date(selectedDate + "T00:00:00").toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
                weekday: "short",
              })}
            </Text>
            <Feather
              name={showDatePicker ? "chevron-up" : "chevron-down"}
              size={18}
              color={colors.mutedForeground}
            />
          </TouchableOpacity>

          {showDatePicker && (
            <View style={s.calendarContainer}>
              <View style={s.calHeader}>
                <TouchableOpacity
                  style={s.calNavBtn}
                  onPress={() => {
                    if (calMonth === 1) { setCalYear((y) => y - 1); setCalMonth(12); }
                    else setCalMonth((m) => m - 1);
                  }}
                >
                  <Feather name="chevron-left" size={18} color={colors.foreground} />
                </TouchableOpacity>
                <Text style={s.calTitle}>{calYear}년 {calMonth}월</Text>
                <TouchableOpacity
                  style={s.calNavBtn}
                  onPress={() => {
                    if (calMonth === 12) { setCalYear((y) => y + 1); setCalMonth(1); }
                    else setCalMonth((m) => m + 1);
                  }}
                >
                  <Feather name="chevron-right" size={18} color={colors.foreground} />
                </TouchableOpacity>
              </View>
              <View style={s.calWeekRow}>
                {WEEKDAYS_SHORT.map((d) => (
                  <Text key={d} style={s.calWeekDay}>{d}</Text>
                ))}
              </View>
              {Array.from({ length: calCells.length / 7 }, (_, row) => (
                <View key={row} style={s.calRow}>
                  {calCells.slice(row * 7, row * 7 + 7).map((day, col) => {
                    if (!day) return <View key={col} style={s.calCell} />;
                    const ds = toStr(calYear, calMonth, day);
                    const isSel = ds === selectedDate;
                    return (
                      <View key={col} style={s.calCell}>
                        <Pressable
                          style={[s.calDayBtn, isSel && s.calSelectedBg]}
                          onPress={() => { setSelectedDate(ds); setShowDatePicker(false); }}
                        >
                          <Text style={[s.calDayText, isSel && s.calSelectedText]}>
                            {day}
                          </Text>
                        </Pressable>
                      </View>
                    );
                  })}
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Recurrence */}
        <View style={s.section}>
          <Text style={s.label}>반복</Text>
          <View style={s.recurrenceRow}>
            {RECURRENCE_OPTIONS.map((opt) => {
              const active = recurrence === opt;
              return (
                <TouchableOpacity
                  key={opt}
                  style={[
                    s.recurrenceBtn,
                    {
                      backgroundColor: active ? color : "transparent",
                      borderColor: active ? color : colors.border,
                    },
                  ]}
                  onPress={() => setRecurrence(opt)}
                >
                  <Text
                    style={[
                      s.recurrenceBtnText,
                      { color: active ? "#fff" : colors.foreground },
                    ]}
                  >
                    {RECURRENCE_LABELS[opt]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {recurrence !== "none" && (
            <View style={{ marginTop: 10, padding: 10, backgroundColor: color + "18", borderRadius: 10 }}>
              <Text style={{ fontSize: 13, color: color, fontFamily: "Inter_500Medium" }}>
                {recurrence === "daily" && "매일 이 청소 일정이 반복돼요"}
                {recurrence === "weekly" && `매주 ${["일","월","화","수","목","금","토"][new Date(selectedDate + "T00:00:00").getDay()]}요일에 반복돼요`}
                {recurrence === "monthly" && `매월 ${parseInt(selectedDate.split("-")[2], 10)}일에 반복돼요`}
              </Text>
            </View>
          )}

          {recurrence !== "none" && (
            <View style={{ marginTop: 14 }}>
              <Text style={s.label}>마감일 (선택)</Text>
              <TouchableOpacity
                style={s.dateBtn}
                onPress={() => setShowEndDatePicker((v) => !v)}
              >
                <Text style={[s.dateBtnText, { fontSize: 14, color: recurrenceEndDate ? colors.foreground : colors.mutedForeground }]}>
                  {recurrenceEndDate
                    ? new Date(recurrenceEndDate + "T00:00:00").toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" }) + " 까지"
                    : "마감일 없음 (무한 반복)"}
                </Text>
                <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
                  {recurrenceEndDate && (
                    <TouchableOpacity
                      onPress={() => { setRecurrenceEndDate(undefined); setShowEndDatePicker(false); }}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Feather name="x-circle" size={16} color={colors.mutedForeground} />
                    </TouchableOpacity>
                  )}
                  <Feather name={showEndDatePicker ? "chevron-up" : "chevron-down"} size={18} color={colors.mutedForeground} />
                </View>
              </TouchableOpacity>

              {showEndDatePicker && (() => {
                const endCells = buildCalendarCells(endCalYear, endCalMonth);
                return (
                  <View style={s.calendarContainer}>
                    <View style={s.calHeader}>
                      <TouchableOpacity style={s.calNavBtn} onPress={() => {
                        if (endCalMonth === 1) { setEndCalYear((y) => y - 1); setEndCalMonth(12); }
                        else setEndCalMonth((m) => m - 1);
                      }}>
                        <Feather name="chevron-left" size={18} color={colors.foreground} />
                      </TouchableOpacity>
                      <Text style={s.calTitle}>{endCalYear}년 {endCalMonth}월</Text>
                      <TouchableOpacity style={s.calNavBtn} onPress={() => {
                        if (endCalMonth === 12) { setEndCalYear((y) => y + 1); setEndCalMonth(1); }
                        else setEndCalMonth((m) => m + 1);
                      }}>
                        <Feather name="chevron-right" size={18} color={colors.foreground} />
                      </TouchableOpacity>
                    </View>
                    <View style={s.calWeekRow}>
                      {WEEKDAYS_SHORT.map((d) => (<Text key={d} style={s.calWeekDay}>{d}</Text>))}
                    </View>
                    {Array.from({ length: endCells.length / 7 }, (_, row) => (
                      <View key={row} style={s.calRow}>
                        {endCells.slice(row * 7, row * 7 + 7).map((day, col) => {
                          if (!day) return <View key={col} style={s.calCell} />;
                          const ds = toStr(endCalYear, endCalMonth, day);
                          const isSel = ds === recurrenceEndDate;
                          const isPast = ds < selectedDate;
                          return (
                            <View key={col} style={s.calCell}>
                              <Pressable
                                style={[s.calDayBtn, isSel && s.calSelectedBg]}
                                onPress={() => {
                                  if (!isPast) { setRecurrenceEndDate(ds); setShowEndDatePicker(false); }
                                }}
                              >
                                <Text style={[
                                  s.calDayText,
                                  isSel && s.calSelectedText,
                                  isPast && { color: colors.border },
                                ]}>
                                  {day}
                                </Text>
                              </Pressable>
                            </View>
                          );
                        })}
                      </View>
                    ))}
                  </View>
                );
              })()}
            </View>
          )}
        </View>

        {/* Color */}
        <View style={s.section}>
          <Text style={s.label}>색상</Text>
          <View style={s.colorGrid}>
            {SCHEDULE_COLORS.map((c) => (
              <TouchableOpacity
                key={c}
                style={[
                  s.colorDot,
                  { backgroundColor: c },
                  color === c && {
                    borderWidth: 3,
                    borderColor: colors.foreground,
                    transform: [{ scale: 1.18 }],
                  },
                ]}
                onPress={() => setColor(c)}
              />
            ))}
          </View>
        </View>

        {/* Notification */}
        <View style={s.section}>
          <View style={s.notifRow}>
            <View>
              <Text style={s.notifLabel}>알림 설정</Text>
              <Text style={{ fontSize: 12, color: colors.mutedForeground, marginTop: 2 }}>
                지정한 시간에 청소 알림을 보내드려요
              </Text>
            </View>
            <Switch
              value={notifEnabled}
              onValueChange={handleToggleNotif}
              trackColor={{ false: colors.muted, true: colors.primary }}
              thumbColor="#fff"
            />
          </View>

          {notifEnabled && (
            <View style={s.timePicker}>
              <View style={s.timeUnit}>
                <TouchableOpacity
                  style={s.timeArrow}
                  onPress={() => setNotifHour((h) => (h + 1) % 24)}
                >
                  <Feather name="chevron-up" size={18} color={colors.foreground} />
                </TouchableOpacity>
                <Text style={s.timeNum}>{String(notifHour).padStart(2, "0")}</Text>
                <TouchableOpacity
                  style={s.timeArrow}
                  onPress={() => setNotifHour((h) => (h - 1 + 24) % 24)}
                >
                  <Feather name="chevron-down" size={18} color={colors.foreground} />
                </TouchableOpacity>
                <Text style={s.timeUnitLabel}>시</Text>
              </View>

              <Text style={s.timeSep}>:</Text>

              <View style={s.timeUnit}>
                <TouchableOpacity
                  style={s.timeArrow}
                  onPress={() => setNotifMinute((m) => (m + 5) % 60)}
                >
                  <Feather name="chevron-up" size={18} color={colors.foreground} />
                </TouchableOpacity>
                <Text style={s.timeNum}>{String(notifMinute).padStart(2, "0")}</Text>
                <TouchableOpacity
                  style={s.timeArrow}
                  onPress={() => setNotifMinute((m) => (m - 5 + 60) % 60)}
                >
                  <Feather name="chevron-down" size={18} color={colors.foreground} />
                </TouchableOpacity>
                <Text style={s.timeUnitLabel}>분</Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add keyword modal */}
      <Modal
        visible={showAddKeyword}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddKeyword(false)}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.45)",
            justifyContent: "center",
            alignItems: "center",
            padding: 32,
          }}
          onPress={() => setShowAddKeyword(false)}
        >
          <Pressable
            style={{
              backgroundColor: colors.card,
              borderRadius: 20,
              padding: 24,
              width: "100%",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.15,
              shadowRadius: 24,
              elevation: 10,
            }}
            onPress={() => {}}
          >
            <Text
              style={{
                fontSize: 17,
                fontFamily: "Inter_700Bold",
                color: colors.foreground,
                marginBottom: 4,
              }}
            >
              키워드 추가
            </Text>
            <Text
              style={{
                fontSize: 13,
                fontFamily: "Inter_400Regular",
                color: colors.mutedForeground,
                marginBottom: 16,
              }}
            >
              자주 쓰는 청소 항목을 저장해 두세요
            </Text>
            <TextInput
              style={{
                fontSize: 15,
                fontFamily: "Inter_400Regular",
                color: colors.foreground,
                borderWidth: 1.5,
                borderColor: colors.border,
                borderRadius: 12,
                paddingHorizontal: 14,
                paddingVertical: 12,
                marginBottom: 16,
              }}
              placeholder="예: 욕실 청소, 창문 닦기..."
              placeholderTextColor={colors.mutedForeground}
              value={newKeyword}
              onChangeText={setNewKeyword}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleAddKeyword}
            />
            <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 12,
                  backgroundColor: colors.muted,
                  alignItems: "center",
                }}
                onPress={() => { setShowAddKeyword(false); setNewKeyword(""); }}
              >
                <Text style={{ fontSize: 15, fontFamily: "Inter_600SemiBold", color: colors.foreground }}>
                  취소
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 12,
                  backgroundColor: color,
                  alignItems: "center",
                  opacity: newKeyword.trim() ? 1 : 0.5,
                }}
                onPress={handleAddKeyword}
              >
                <Text style={{ fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#fff" }}>
                  추가
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  );
}
