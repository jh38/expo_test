import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
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
import { PALETTE_COLORS, useCategories } from "@/contexts/CategoryContext";
import { useColors } from "@/hooks/useColors";

type Mode = "list" | "add" | "edit";

export default function CategoriesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { categories, addCategory, updateCategory, deleteCategory } = useCategories();

  const [mode, setMode] = useState<Mode>("list");
  const [editId, setEditId] = useState<string | null>(null);
  const [inputLabel, setInputLabel] = useState("");
  const [inputColor, setInputColor] = useState(PALETTE_COLORS[0]);

  const openAdd = () => {
    setEditId(null);
    setInputLabel("");
    setInputColor(PALETTE_COLORS[0]);
    setMode("add");
  };

  const openEdit = (id: string, label: string, color: string) => {
    setEditId(id);
    setInputLabel(label);
    setInputColor(color);
    setMode("edit");
  };

  const handleSave = async () => {
    if (!inputLabel.trim()) {
      Alert.alert("이름을 입력해 주세요");
      return;
    }
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (mode === "add") {
      await addCategory(inputLabel.trim(), inputColor);
    } else if (mode === "edit" && editId) {
      await updateCategory(editId, inputLabel.trim(), inputColor);
    }
    setMode("list");
  };

  const handleDelete = (id: string, label: string) => {
    Alert.alert("삭제", `'${label}' 카테고리를 삭제할까요?`, [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: async () => {
          if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          await deleteCategory(id);
        },
      },
    ]);
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
    backBtn: { padding: 6, marginRight: 12 },
    headerTitle: {
      flex: 1,
      fontSize: 18,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
    },
    addBtn: {
      backgroundColor: colors.primary,
      paddingHorizontal: 14,
      paddingVertical: 7,
      borderRadius: 18,
    },
    addBtnText: {
      fontSize: 13,
      fontFamily: "Inter_600SemiBold",
      color: "#fff",
    },
    scrollContent: { padding: 16, paddingBottom: 40 },
    catCard: {
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      flexDirection: "row",
      alignItems: "center",
      padding: 14,
      marginBottom: 10,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 1,
    },
    colorSwatch: {
      width: 32,
      height: 32,
      borderRadius: 16,
      marginRight: 12,
    },
    catLabel: {
      flex: 1,
      fontSize: 16,
      fontFamily: "Inter_500Medium",
      color: colors.foreground,
    },
    actions: { flexDirection: "row", gap: 8 },
    actionBtn: { padding: 6 },
    // Form
    formCard: {
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
    formLabel: {
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
    paletteGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
    },
    paletteDot: {
      width: 32,
      height: 32,
      borderRadius: 16,
    },
    preview: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      padding: 12,
      backgroundColor: colors.surface,
      borderRadius: 10,
      marginTop: 8,
    },
    previewText: {
      fontSize: 14,
      fontFamily: "Inter_500Medium",
      color: colors.foreground,
    },
    saveRow: { flexDirection: "row", gap: 10, marginTop: 16 },
    cancelBtn: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: colors.radius,
      backgroundColor: colors.muted,
      alignItems: "center",
    },
    cancelBtnText: {
      fontSize: 15,
      fontFamily: "Inter_600SemiBold",
      color: colors.mutedForeground,
    },
    saveBtn: {
      flex: 2,
      paddingVertical: 14,
      borderRadius: colors.radius,
      backgroundColor: colors.primary,
      alignItems: "center",
    },
    saveBtnText: {
      fontSize: 15,
      fontFamily: "Inter_600SemiBold",
      color: "#fff",
    },
    emptyBox: {
      alignItems: "center",
      paddingVertical: 48,
    },
    emptyText: {
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      marginTop: 8,
    },
  });

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={s.header}>
        <TouchableOpacity
          style={s.backBtn}
          onPress={() => (mode !== "list" ? setMode("list") : router.back())}
        >
          <Feather name={mode !== "list" ? "x" : "arrow-left"} size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>
          {mode === "add" ? "카테고리 추가" : mode === "edit" ? "카테고리 수정" : "카테고리 관리"}
        </Text>
        {mode === "list" && (
          <TouchableOpacity style={s.addBtn} onPress={openAdd}>
            <Text style={s.addBtnText}>+ 추가</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={s.scrollContent} keyboardShouldPersistTaps="handled">
        {mode === "list" ? (
          <>
            {categories.length === 0 ? (
              <View style={s.emptyBox}>
                <Feather name="tag" size={40} color={colors.mutedForeground} />
                <Text style={s.emptyText}>카테고리가 없어요</Text>
              </View>
            ) : (
              categories.map((cat) => (
                <View key={cat.id} style={s.catCard}>
                  <View style={[s.colorSwatch, { backgroundColor: cat.color }]} />
                  <Text style={s.catLabel}>{cat.label}</Text>
                  <View style={s.actions}>
                    <TouchableOpacity
                      style={s.actionBtn}
                      onPress={() => openEdit(cat.id, cat.label, cat.color)}
                    >
                      <Feather name="edit-2" size={17} color={colors.mutedForeground} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={s.actionBtn}
                      onPress={() => handleDelete(cat.id, cat.label)}
                    >
                      <Feather name="trash-2" size={17} color={colors.destructive} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </>
        ) : (
          <>
            <View style={s.formCard}>
              <Text style={s.formLabel}>카테고리 이름</Text>
              <TextInput
                style={s.input}
                placeholder="이름을 입력하세요"
                placeholderTextColor={colors.mutedForeground}
                value={inputLabel}
                onChangeText={setInputLabel}
                autoFocus
              />
            </View>

            <View style={s.formCard}>
              <Text style={s.formLabel}>색상 선택</Text>
              <View style={s.paletteGrid}>
                {PALETTE_COLORS.map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={[
                      s.paletteDot,
                      { backgroundColor: c },
                      inputColor === c && {
                        borderWidth: 3,
                        borderColor: colors.foreground,
                        transform: [{ scale: 1.15 }],
                      },
                    ]}
                    onPress={() => setInputColor(c)}
                  />
                ))}
              </View>
              {inputLabel.trim() && (
                <View style={s.preview}>
                  <View style={[s.colorSwatch, { backgroundColor: inputColor }]} />
                  <Text style={s.previewText}>{inputLabel}</Text>
                </View>
              )}
            </View>

            <View style={s.saveRow}>
              <TouchableOpacity style={s.cancelBtn} onPress={() => setMode("list")}>
                <Text style={s.cancelBtnText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.saveBtn} onPress={handleSave}>
                <Text style={s.saveBtnText}>저장</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
