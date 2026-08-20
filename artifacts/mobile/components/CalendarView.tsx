import { Feather } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useColors } from "@/hooks/useColors";
import { Schedule } from "@/contexts/ScheduleContext";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];
const MONTHS = ["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"];

function toDateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function getTodayStr(): string {
  const d = new Date();
  return toDateStr(d.getFullYear(), d.getMonth() + 1, d.getDate());
}

interface CalendarViewProps {
  getSchedulesForDate: (date: string) => Schedule[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

export default function CalendarView({
  getSchedulesForDate,
  selectedDate,
  onSelectDate,
}: CalendarViewProps) {
  const colors = useColors();
  const todayStr = getTodayStr();

  const [viewYear, setViewYear] = useState(() => parseInt(selectedDate.split("-")[0], 10));
  const [viewMonth, setViewMonth] = useState(() => parseInt(selectedDate.split("-")[1], 10));
  const [showPicker, setShowPicker] = useState(false);
  const [pickerYear, setPickerYear] = useState(viewYear);

  const { cells, startOffset } = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth - 1, 1).getDay();
    const totalDays = new Date(viewYear, viewMonth, 0).getDate();
    const arr: Array<number | null> = [];
    for (let i = 0; i < firstDay; i++) arr.push(null);
    for (let d = 1; d <= totalDays; d++) arr.push(d);
    while (arr.length % 7 !== 0) arr.push(null);
    return { cells: arr, startOffset: firstDay };
  }, [viewYear, viewMonth]);

  const prevMonth = () => {
    if (viewMonth === 1) { setViewYear((y) => y - 1); setViewMonth(12); }
    else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 12) { setViewYear((y) => y + 1); setViewMonth(1); }
    else setViewMonth((m) => m + 1);
  };

  const goToday = () => {
    const today = new Date();
    const y = today.getFullYear();
    const m = today.getMonth() + 1;
    setViewYear(y);
    setViewMonth(m);
    setShowPicker(false);
    onSelectDate(getTodayStr());
  };

  const selectYearMonth = (month: number) => {
    setViewYear(pickerYear);
    setViewMonth(month);
    setShowPicker(false);
  };

  const s = StyleSheet.create({
    container: {
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      padding: 14,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 12,
    },
    navBtn: { padding: 6 },
    titleArea: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      flex: 1,
      justifyContent: "center",
    },
    monthTitle: {
      fontSize: 17,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
    },
    chevron: { opacity: 0.6 },
    todayBtn: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
      backgroundColor: colors.primary + "20",
    },
    todayBtnText: {
      fontSize: 12,
      fontFamily: "Inter_600SemiBold",
      color: colors.primary,
    },
    weekRow: {
      flexDirection: "row",
      marginBottom: 6,
    },
    weekDay: {
      flex: 1,
      textAlign: "center",
      fontSize: 11,
      fontFamily: "Inter_600SemiBold",
      color: colors.mutedForeground,
    },
    row: { flexDirection: "row" },
    cell: {
      flex: 1,
      aspectRatio: 1,
      alignItems: "center",
      justifyContent: "flex-start",
      paddingTop: 2,
    },
    dayPressable: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: "center",
      justifyContent: "center",
    },
    dayText: {
      fontSize: 13,
      fontFamily: "Inter_400Regular",
      color: colors.foreground,
    },
    todayRing: {
      borderWidth: 1.5,
      borderColor: colors.primary,
    },
    selectedBg: { backgroundColor: colors.primary },
    selectedText: { color: "#fff", fontFamily: "Inter_700Bold" },
    dots: {
      flexDirection: "row",
      gap: 2,
      marginTop: 1,
      height: 5,
    },
    dot: { width: 4, height: 4, borderRadius: 2 },
    // Year/month picker
    picker: {
      marginTop: 10,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: 12,
    },
    yearRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 12,
    },
    yearNav: { padding: 6 },
    yearText: {
      fontSize: 18,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
    },
    monthGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
    },
    monthBtn: {
      width: "25%",
      padding: 8,
      alignItems: "center",
    },
    monthBtnInner: {
      paddingVertical: 8,
      paddingHorizontal: 4,
      borderRadius: 10,
      width: "100%",
      alignItems: "center",
    },
    monthBtnText: {
      fontSize: 14,
      fontFamily: "Inter_500Medium",
      color: colors.foreground,
    },
    monthBtnActive: { backgroundColor: colors.primary },
    monthBtnActiveText: { color: "#fff", fontFamily: "Inter_700Bold" },
    monthBtnCurrent: { backgroundColor: colors.primary + "20" },
  });

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity style={s.navBtn} onPress={prevMonth}>
          <Feather name="chevron-left" size={22} color={colors.foreground} />
        </TouchableOpacity>

        <TouchableOpacity
          style={s.titleArea}
          onPress={() => {
            setPickerYear(viewYear);
            setShowPicker((v) => !v);
          }}
        >
          <Text style={s.monthTitle}>{viewYear}년 {viewMonth}월</Text>
          <Feather
            name={showPicker ? "chevron-up" : "chevron-down"}
            size={14}
            color={colors.mutedForeground}
            style={s.chevron}
          />
        </TouchableOpacity>

        <TouchableOpacity style={s.todayBtn} onPress={goToday}>
          <Text style={s.todayBtnText}>오늘</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.navBtn} onPress={nextMonth}>
          <Feather name="chevron-right" size={22} color={colors.foreground} />
        </TouchableOpacity>
      </View>

      {showPicker && (
        <View style={s.picker}>
          <View style={s.yearRow}>
            <TouchableOpacity style={s.yearNav} onPress={() => setPickerYear((y) => y - 1)}>
              <Feather name="chevron-left" size={20} color={colors.foreground} />
            </TouchableOpacity>
            <Text style={s.yearText}>{pickerYear}년</Text>
            <TouchableOpacity style={s.yearNav} onPress={() => setPickerYear((y) => y + 1)}>
              <Feather name="chevron-right" size={20} color={colors.foreground} />
            </TouchableOpacity>
          </View>
          <View style={s.monthGrid}>
            {MONTHS.map((label, i) => {
              const m = i + 1;
              const isActive = pickerYear === viewYear && m === viewMonth;
              const isCurrent = pickerYear === new Date().getFullYear() && m === new Date().getMonth() + 1;
              return (
                <View key={m} style={s.monthBtn}>
                  <TouchableOpacity
                    style={[
                      s.monthBtnInner,
                      isActive && s.monthBtnActive,
                      !isActive && isCurrent && s.monthBtnCurrent,
                    ]}
                    onPress={() => selectYearMonth(m)}
                  >
                    <Text style={[s.monthBtnText, isActive && s.monthBtnActiveText]}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {!showPicker && (
        <>
          <View style={s.weekRow}>
            {WEEKDAYS.map((d, i) => (
              <Text
                key={d}
                style={[
                  s.weekDay,
                  i === 0 && { color: colors.destructive },
                  i === 6 && { color: colors.accent },
                ]}
              >
                {d}
              </Text>
            ))}
          </View>

          {Array.from({ length: cells.length / 7 }, (_, row) => (
            <View key={row} style={s.row}>
              {cells.slice(row * 7, row * 7 + 7).map((day, col) => {
                if (!day) return <View key={col} style={s.cell} />;
                const dateStr = toDateStr(viewYear, viewMonth, day);
                const isSelected = dateStr === selectedDate;
                const isToday = dateStr === todayStr;
                const daySchedules = getSchedulesForDate(dateStr);
                const colorDots = daySchedules.slice(0, 3).map((s) => s.color);
                const isSunday = col === 0;
                const isSaturday = col === 6;
                return (
                  <View key={col} style={s.cell}>
                    <Pressable
                      style={[
                        s.dayPressable,
                        isToday && !isSelected && s.todayRing,
                        isSelected && s.selectedBg,
                      ]}
                      onPress={() => onSelectDate(dateStr)}
                    >
                      <Text
                        style={[
                          s.dayText,
                          isSelected && s.selectedText,
                          !isSelected && isToday && { color: colors.primary, fontFamily: "Inter_700Bold" },
                          !isSelected && isSunday && { color: colors.destructive },
                          !isSelected && isSaturday && { color: colors.accent },
                        ]}
                      >
                        {day}
                      </Text>
                    </Pressable>
                    {colorDots.length > 0 && (
                      <View style={s.dots}>
                        {colorDots.map((c, i) => (
                          <View key={i} style={[s.dot, { backgroundColor: c }]} />
                        ))}
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          ))}
        </>
      )}
    </View>
  );
}
