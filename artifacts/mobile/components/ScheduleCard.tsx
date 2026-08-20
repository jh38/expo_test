import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useRef } from "react";
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useColors } from "@/hooks/useColors";
import { RECURRENCE_LABELS, Schedule } from "@/contexts/ScheduleContext";

interface ScheduleCardProps {
  schedule: Schedule;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function ScheduleCard({
  schedule,
  onToggle,
  onEdit,
  onDelete,
}: ScheduleCardProps) {
  const colors = useColors();
  const scale = useRef(new Animated.Value(1)).current;

  const handleToggle = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.95, duration: 80, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();
    onToggle();
  };

  const s = StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      flexDirection: "row",
      alignItems: "center",
      padding: 14,
      marginBottom: 10,
      borderLeftWidth: 4,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    checkBtn: {
      width: 26,
      height: 26,
      borderRadius: 13,
      borderWidth: 2,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    content: { flex: 1 },
    title: {
      fontSize: 15,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
      marginBottom: 2,
    },
    completedText: {
      textDecorationLine: "line-through",
      color: colors.mutedForeground,
    },
    desc: {
      fontSize: 13,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
    },
    badgeRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginTop: 5,
      flexWrap: "wrap",
    },
    badge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 3,
      paddingHorizontal: 7,
      paddingVertical: 2,
      borderRadius: 8,
      backgroundColor: colors.muted,
    },
    badgeText: {
      fontSize: 11,
      fontFamily: "Inter_500Medium",
      color: colors.mutedForeground,
    },
    actions: { flexDirection: "row", gap: 8, marginLeft: 8 },
    actionBtn: { padding: 6 },
  });

  const hasRecurrence = schedule.recurrence && schedule.recurrence !== "none";

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <View style={[s.card, { borderLeftColor: schedule.color }]}>
        <TouchableOpacity
          style={[
            s.checkBtn,
            {
              borderColor: schedule.completed ? schedule.color : colors.border,
              backgroundColor: schedule.completed ? schedule.color : "transparent",
            },
          ]}
          onPress={handleToggle}
        >
          {schedule.completed && <Feather name="check" size={14} color="#fff" />}
        </TouchableOpacity>

        <Pressable style={s.content} onPress={onEdit}>
          <Text
            style={[s.title, schedule.completed && s.completedText]}
            numberOfLines={1}
          >
            {schedule.title}
          </Text>
          {!!schedule.description && (
            <Text style={s.desc} numberOfLines={1}>
              {schedule.description}
            </Text>
          )}
          {(hasRecurrence || (schedule.notificationEnabled && schedule.notificationTime)) && (
            <View style={s.badgeRow}>
              {hasRecurrence && (
                <View style={[s.badge, { backgroundColor: schedule.color + "20" }]}>
                  <Feather name="repeat" size={10} color={schedule.color} />
                  <Text style={[s.badgeText, { color: schedule.color }]}>
                    {RECURRENCE_LABELS[schedule.recurrence]}
                  </Text>
                </View>
              )}
              {schedule.notificationEnabled && schedule.notificationTime && (
                <View style={s.badge}>
                  <Feather name="bell" size={10} color={colors.primary} />
                  <Text style={[s.badgeText, { color: colors.primary }]}>
                    {schedule.notificationTime}
                  </Text>
                </View>
              )}
            </View>
          )}
        </Pressable>

        <View style={s.actions}>
          <TouchableOpacity style={s.actionBtn} onPress={onEdit}>
            <Feather name="edit-2" size={16} color={colors.mutedForeground} />
          </TouchableOpacity>
          <TouchableOpacity style={s.actionBtn} onPress={onDelete}>
            <Feather name="trash-2" size={16} color={colors.destructive} />
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}
