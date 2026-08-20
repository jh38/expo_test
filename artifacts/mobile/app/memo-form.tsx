import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCategories } from "@/contexts/CategoryContext";
import { useMemos } from "@/contexts/MemoContext";
import { useColors } from "@/hooks/useColors";

export default function MemoFormScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id?: string }>();
  const { memos, addMemo, updateMemo } = useMemos();
  const { categories } = useCategories();

  const existing = params.id ? memos.find((m) => m.id === params.id) : null;
  const defaultCat = categories[0] ?? { label: "기타", color: "#718096" };

  const [title, setTitle] = useState(existing?.title ?? "");
  const [content, setContent] = useState(existing?.content ?? "");
  const [category, setCategory] = useState(existing?.category ?? defaultCat.label);
  const [color, setColor] = useState(existing?.color ?? defaultCat.color);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert("제목을 입력해 주세요");
      return;
    }
    if (!content.trim()) {
      Alert.alert("내용을 입력해 주세요");
      return;
    }
    if (Platform.OS !== "web")
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const data = { title: title.trim(), content: content.trim(), category, color };
    if (existing) {
      await updateMemo(existing.id, data);
    } else {
      await addMemo(data);
    }
    router.back();
  };

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
      minHeight: 160,
      textAlignVertical: "top",
      lineHeight: 22,
    },
    categoryRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    catBtn: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 2,
    },
    catText: { fontSize: 14, fontFamily: "Inter_500Medium" },
    previewBar: { height: 5, borderRadius: 3, marginTop: 12 },
    noCatsHint: {
      fontSize: 13,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      fontStyle: "italic",
    },
    manageCatBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginTop: 10,
      alignSelf: "flex-end",
    },
    manageCatText: {
      fontSize: 12,
      fontFamily: "Inter_500Medium",
      color: colors.primary,
    },
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
        <Text style={s.headerTitle}>{existing ? "메모 수정" : "메모 추가"}</Text>
        <TouchableOpacity style={s.saveBtn} onPress={handleSave}>
          <Text style={s.saveBtnText}>저장</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={s.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={s.section}>
          <Text style={s.label}>카테고리</Text>
          {categories.length === 0 ? (
            <Text style={s.noCatsHint}>카테고리가 없어요. 메모 탭에서 추가해 보세요.</Text>
          ) : (
            <View style={s.categoryRow}>
              {categories.map((cat) => {
                const selected = category === cat.label;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      s.catBtn,
                      {
                        backgroundColor: selected ? cat.color : "transparent",
                        borderColor: cat.color,
                      },
                    ]}
                    onPress={() => {
                      setCategory(cat.label);
                      setColor(cat.color);
                    }}
                  >
                    <Text
                      style={[s.catText, { color: selected ? "#fff" : cat.color }]}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
          <View style={[s.previewBar, { backgroundColor: color }]} />
          <TouchableOpacity
            style={s.manageCatBtn}
            onPress={() => router.push("/categories")}
          >
            <Feather name="settings" size={12} color={colors.primary} />
            <Text style={s.manageCatText}>카테고리 관리</Text>
          </TouchableOpacity>
        </View>

        <View style={s.section}>
          <Text style={s.label}>제목</Text>
          <TextInput
            style={s.input}
            placeholder="청소 방법 제목을 입력해 주세요"
            placeholderTextColor={colors.mutedForeground}
            value={title}
            onChangeText={setTitle}
            returnKeyType="next"
            autoFocus={!existing}
          />
        </View>

        <View style={s.section}>
          <Text style={s.label}>청소 방법</Text>
          <TextInput
            style={s.textArea}
            placeholder="청소 방법, 순서, 팁 등을 자유롭게 적어 보세요"
            placeholderTextColor={colors.mutedForeground}
            value={content}
            onChangeText={setContent}
            multiline
            numberOfLines={8}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
