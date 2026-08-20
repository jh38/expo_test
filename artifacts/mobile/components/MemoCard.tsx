import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useColors } from "@/hooks/useColors";
import { Memo } from "@/contexts/MemoContext";

interface MemoCardProps {
  memo: Memo;
  onPress: () => void;
  onDelete: () => void;
}

export default function MemoCard({ memo, onPress, onDelete }: MemoCardProps) {
  const colors = useColors();

  const styles = StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      padding: 16,
      marginBottom: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 6,
      elevation: 2,
    },
    header: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 8,
    },
    categoryBadge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 8,
      marginRight: 8,
      alignSelf: "flex-start",
    },
    categoryText: {
      fontSize: 11,
      fontFamily: "Inter_600SemiBold",
      color: "#fff",
    },
    titleRow: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    title: {
      fontSize: 15,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
      flex: 1,
    },
    deleteBtn: {
      padding: 4,
      marginLeft: 8,
    },
    content: {
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      lineHeight: 20,
    },
    footer: {
      marginTop: 10,
      flexDirection: "row",
      justifyContent: "flex-end",
    },
    date: {
      fontSize: 11,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
    },
    accentBar: {
      width: 4,
      borderRadius: 2,
      marginRight: 12,
      alignSelf: "stretch",
    },
    row: {
      flexDirection: "row",
      flex: 1,
    },
  });

  const updatedDate = new Date(memo.updatedAt).toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
  });

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.row}>
        <View style={[styles.accentBar, { backgroundColor: memo.color }]} />
        <View style={{ flex: 1 }}>
          <View style={styles.header}>
            <View style={[styles.categoryBadge, { backgroundColor: memo.color }]}>
              <Text style={styles.categoryText}>{memo.category}</Text>
            </View>
            <View style={styles.titleRow}>
              <Text style={styles.title} numberOfLines={1}>
                {memo.title}
              </Text>
              <TouchableOpacity style={styles.deleteBtn} onPress={onDelete}>
                <Feather name="trash-2" size={15} color={colors.destructive} />
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.content} numberOfLines={3}>
            {memo.content}
          </Text>
          <View style={styles.footer}>
            <Text style={styles.date}>{updatedDate}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
