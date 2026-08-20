import { Feather } from "@expo/vector-icons";
import { reloadAppAsync } from "expo";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { exportBackup, pickBackup, restoreBackup } from "@/utils/backup";

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [busy, setBusy] = useState(false);

  const handleExport = async () => {
    try {
      setBusy(true);
      const result = await exportBackup();
      if (result === "saved") {
        Alert.alert("백업 완료", "백업 파일이 앱 저장공간에 저장되었습니다.");
      }
    } catch {
      Alert.alert("백업 실패", "백업 파일을 만들지 못했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      setBusy(false);
    }
  };

  const handleImport = async () => {
    try {
      setBusy(true);
      const backup = await pickBackup();
      if (!backup) return;

      Alert.alert(
        "데이터 복원",
        "현재 저장된 일정, 메모, 카테고리, 빠른 키워드가 백업 파일의 내용으로 교체됩니다. 계속할까요?",
        [
          { text: "취소", style: "cancel" },
          {
            text: "복원하기",
            style: "destructive",
            onPress: async () => {
              try {
                await restoreBackup(backup);
                if (Platform.OS !== "web") {
                  await reloadAppAsync();
                } else {
                  Alert.alert("복원 완료", "앱을 다시 열면 복원된 데이터가 표시됩니다.");
                }
              } catch {
                Alert.alert("복원 실패", "백업 데이터를 저장하지 못했어요.");
              } finally {
                setBusy(false);
              }
            },
          },
        ],
      );
    } catch (error) {
      setBusy(false);
      Alert.alert(
        "파일을 읽을 수 없어요",
        error instanceof Error ? error.message : "올바른 백업 파일인지 확인해 주세요.",
      );
    }
  };

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: {
      padding: 20,
      paddingTop: Platform.OS === "web" ? insets.top + 20 : 20,
      paddingBottom: 32,
    },
    back: { flexDirection: "row", alignItems: "center", marginBottom: 24 },
    backText: {
      marginLeft: 8,
      color: colors.foreground,
      fontFamily: "Inter_500Medium",
      fontSize: 15,
    },
    title: {
      color: colors.foreground,
      fontFamily: "Inter_700Bold",
      fontSize: 28,
      marginBottom: 8,
    },
    subtitle: {
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      fontSize: 14,
      lineHeight: 21,
      marginBottom: 24,
    },
    card: {
      backgroundColor: colors.card,
      borderColor: colors.border,
      borderRadius: 18,
      borderWidth: 1,
      padding: 18,
      marginBottom: 14,
    },
    cardTitle: {
      color: colors.foreground,
      fontFamily: "Inter_700Bold",
      fontSize: 17,
      marginBottom: 7,
    },
    cardText: {
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      fontSize: 13,
      lineHeight: 20,
      marginBottom: 16,
    },
    button: {
      alignItems: "center",
      backgroundColor: colors.primary,
      borderRadius: 12,
      flexDirection: "row",
      justifyContent: "center",
      minHeight: 48,
      paddingHorizontal: 16,
    },
    secondaryButton: { backgroundColor: colors.primary + "18" },
    buttonText: {
      color: "#fff",
      fontFamily: "Inter_600SemiBold",
      fontSize: 15,
    },
    secondaryButtonText: { color: colors.primary },
    buttonIcon: { marginRight: 8 },
    note: {
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      fontSize: 12,
      lineHeight: 18,
      marginTop: 10,
    },
  });

  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={s.content}>
        <TouchableOpacity style={s.back} onPress={() => router.back()} accessibilityLabel="뒤로 가기">
          <Feather name="arrow-left" size={22} color={colors.foreground} />
          <Text style={s.backText}>달력으로 돌아가기</Text>
        </TouchableOpacity>

        <Text style={s.title}>데이터 관리</Text>
        <Text style={s.subtitle}>
          앱에 저장된 청소 일정과 메모를 파일로 안전하게 보관하고, 새로 설치한 앱에서 다시 불러올 수 있어요.
        </Text>

        <View style={s.card}>
          <Text style={s.cardTitle}>데이터 백업</Text>
          <Text style={s.cardText}>
            일정, 메모, 카테고리, 빠른 키워드를 하나의 JSON 파일로 저장합니다. 파일을 나에게 보내기나 클라우드에 보관해 두세요.
          </Text>
          <TouchableOpacity style={s.button} onPress={handleExport} disabled={busy}>
            {busy ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Feather name="download" size={18} color="#fff" style={s.buttonIcon} />
                <Text style={s.buttonText}>백업 파일 만들기</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>데이터 복원</Text>
          <Text style={s.cardText}>
            이전에 만들어 둔 JSON 백업 파일을 선택합니다. 복원하면 현재 데이터가 백업 파일 내용으로 바뀝니다.
          </Text>
          <TouchableOpacity
            style={[s.button, s.secondaryButton]}
            onPress={handleImport}
            disabled={busy}
          >
            <Feather name="upload" size={18} color={colors.primary} style={s.buttonIcon} />
            <Text style={[s.buttonText, s.secondaryButtonText]}>백업 파일 불러오기</Text>
          </TouchableOpacity>
        </View>

        <Text style={s.note}>
          백업 파일에는 앱에 저장한 내용이 들어 있으므로 다른 사람과 공유할 때 주의하세요. 복원 전에는 현재 데이터를 먼저 백업해 두는 것을 권장합니다.
        </Text>
      </ScrollView>
    </View>
  );
}