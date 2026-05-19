import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch } from "react-redux";
import { useTheme } from "../../../../context/ThemeContext";
import { fonts } from "../../../../constants/fonts";
import CommonHeader from "../../../../components/CommonHeader/CommonHeader";
import { RootStackParamList } from "../../../../navigation/RootStackParamsList";
import { AppDispatch } from "../../../../store/store";
import { setTheme } from "../../../../store/reducers/SystemIntitializationReducer";
import { ThemeMode } from "../../../../utils/theme";

type Props = NativeStackScreenProps<RootStackParamList, "SettingsScreen">;

const THEME_OPTIONS: {
  id: ThemeMode;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { id: "light", label: "Light", icon: "sunny-outline" },
  { id: "dark", label: "Dark", icon: "moon-outline" },
  { id: "system", label: "System", icon: "phone-portrait-outline" },
];

export default function SettingsScreen({ navigation }: Props) {
  const { paperTheme, currentThemeMode, resolvedTheme } = useTheme();
  const dispatch = useDispatch<AppDispatch>();

  function onThemeSelect(theme: ThemeMode) {
    dispatch(setTheme(theme));
  }

  function getThemeDescription(): string {
    if (currentThemeMode === "system") {
      return `Following device setting (${resolvedTheme})`;
    }
    return `Currently using ${currentThemeMode} mode`;
  }

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: paperTheme.colors.background }]}
    >
      <CommonHeader
        title="Settings"
        onPressLeftBtn={() => navigation.goBack()}
        iconColor={paperTheme.colors.secondary}
        titleColor={paperTheme.colors.secondary}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text
          style={[styles.sectionTitle, { color: paperTheme.colors.onSurfaceVariant }]}
        >
          Appearance
        </Text>

        <View
          style={[
            styles.card,
            {
              backgroundColor: paperTheme.colors.surface,
              borderColor: paperTheme.colors.outline,
            },
          ]}
        >
          <Text style={[styles.cardTitle, { color: paperTheme.colors.onSurface }]}>
            Theme
          </Text>
          <Text
            style={[styles.cardText, { color: paperTheme.colors.onSurfaceVariant }]}
          >
            {getThemeDescription()}
          </Text>

          <View style={styles.themeOptions}>
            {THEME_OPTIONS.map((option) => {
              const isSelected = currentThemeMode === option.id;

              return (
                <TouchableOpacity
                  key={option.id}
                  activeOpacity={0.85}
                  style={[
                    styles.themeOption,
                    {
                      backgroundColor: isSelected
                        ? paperTheme.colors.primaryContainer
                        : paperTheme.colors.surfaceVariant,
                      borderColor: isSelected
                        ? paperTheme.colors.primary
                        : paperTheme.colors.outline,
                    },
                  ]}
                  onPress={() => onThemeSelect(option.id)}
                >
                  <Ionicons
                    name={option.icon}
                    size={20}
                    color={
                      isSelected
                        ? paperTheme.colors.primary
                        : paperTheme.colors.onSurfaceVariant
                    }
                  />
                  <Text
                    style={[
                      styles.themeOptionLabel,
                      {
                        color: isSelected
                          ? paperTheme.colors.onPrimaryContainer
                          : paperTheme.colors.onSurface,
                      },
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <Text
          style={[styles.sectionTitle, { color: paperTheme.colors.onSurfaceVariant }]}
        >
          Security
        </Text>

        <TouchableOpacity
          activeOpacity={0.85}
          style={[
            styles.actionRow,
            {
              backgroundColor: paperTheme.colors.surface,
              borderColor: paperTheme.colors.outline,
            },
          ]}
          onPress={() => navigation.navigate("ChangePasswordScreen")}
        >
          <View
            style={[
              styles.actionIconWrap,
              { backgroundColor: paperTheme.colors.primaryContainer },
            ]}
          >
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color={paperTheme.colors.primary}
            />
          </View>

          <View style={styles.actionTextWrap}>
            <Text style={[styles.actionTitle, { color: paperTheme.colors.onSurface }]}>
              Change Password
            </Text>
            <Text
              style={[
                styles.actionSubtitle,
                { color: paperTheme.colors.onSurfaceVariant },
              ]}
            >
              Update your account password
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={18}
            color={paperTheme.colors.onSurfaceVariant}
          />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  sectionTitle: {
    marginBottom: 10,
    fontFamily: fonts.PoppinsMedium,
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  card: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 18,
    marginBottom: 22,
  },
  cardTitle: {
    fontFamily: fonts.PoppinsSemiBold,
    fontSize: 18,
    lineHeight: 24,
  },
  cardText: {
    marginTop: 6,
    fontFamily: fonts.InterRegular,
    fontSize: 13,
    lineHeight: 18,
  },
  themeOptions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  themeOption: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: "center",
    gap: 8,
  },
  themeOptionLabel: {
    fontFamily: fonts.PoppinsMedium,
    fontSize: 12,
    lineHeight: 16,
  },
  actionRow: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  actionIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  actionTextWrap: {
    flex: 1,
  },
  actionTitle: {
    fontFamily: fonts.PoppinsSemiBold,
    fontSize: 15,
    lineHeight: 20,
  },
  actionSubtitle: {
    marginTop: 2,
    fontFamily: fonts.InterRegular,
    fontSize: 12,
    lineHeight: 16,
  },
});
