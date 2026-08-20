import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import FAB from "@/components/FAB";
import MemoCard from "@/components/MemoCard";
import { useMemos } from "@/contexts/MemoContext";
import { useColors } from "@/hooks/useColors";

export default function MemosTab() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { memos, deleteMemo } = useMemos();
  const [search, setSearch] = useState("");

  const filtered = memos.filter(
    (m) =>
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.content.toLowerCase().includes(search.toLowerCase()) ||
      m.category.includes(search)
  );

  const handleDelete = (id: string) => {
    Alert.alert("삭제", "이 메모를 삭제할까요?", [
      { text: "취소", style: "cancel" },
      { text: "삭제", style: "destructive", onPress: () => deleteMemo(id) },
    ]);
  };

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    topBar: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingTop: Platform.OS === "web" ? insets.top + 8 : 8,
      paddingBottom: 8,
      gap: 8,
    },
    searchBox: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      paddingHorizontal: 12,
      paddingVertical: 9,
      gap: 8,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 4,
      elevation: 1,
    },
    searchInput: {
      flex: 1,
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      color: colors.foreground,
    },
    catMgmtBtn: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: colors.card,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 4,
      elevation: 1,
    },
    scrollContent: {
      paddingHorizontal: 16,
      paddingTop: 8,
      paddingBottom: 120,
    },
    emptyBox: { alignItems: "center", paddingVertical: 64 },
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
    countText: {
      fontSize: 13,
      fontFamily: "Inter_500Medium",
      color: colors.mutedForeground,
      marginBottom: 12,
    },
  });

  return (
    <View style={s.container}>
      <View style={s.topBar}>
        <View style={s.searchBox}>
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            style={s.searchInput}
            placeholder="메모 검색..."
            placeholderTextColor={colors.mutedForeground}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <Feather
              name="x"
              size={16}
              color={colors.mutedForeground}
              onPress={() => setSearch("")}
            />
          )}
        </View>
        <TouchableOpacity
          style={s.catMgmtBtn}
          onPress={() => router.push("/categories")}
        >
          <Feather name="tag" size={18} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length > 0 && (
          <Text style={s.countText}>총 {filtered.length}개의 메모</Text>
        )}

        {filtered.length === 0 ? (
          <View style={s.emptyBox}>
            <Feather name="file-text" size={48} color={colors.mutedForeground} />
            <Text style={s.emptyTitle}>
              {search ? "검색 결과가 없어요" : "메모가 없어요"}
            </Text>
            <Text style={s.emptyText}>
              {search
                ? "다른 키워드로 검색해 보세요"
                : "청소 방법이나 팁을 메모해 보세요"}
            </Text>
          </View>
        ) : (
          filtered.map((memo) => (
            <MemoCard
              key={memo.id}
              memo={memo}
              onPress={() =>
                router.push({ pathname: "/memo-form", params: { id: memo.id } })
              }
              onDelete={() => handleDelete(memo.id)}
            />
          ))
        )}
      </ScrollView>

      <FAB icon="plus" onPress={() => router.push("/memo-form")} />
    </View>
  );
}
