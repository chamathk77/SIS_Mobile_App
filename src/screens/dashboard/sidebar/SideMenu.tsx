import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MD3Theme } from "react-native-paper";
import { fonts } from "../../../constants/fonts";
import { getInitials, getPersonName } from "../../../utils/profileHelpers";

const DRAWER_WIDTH = Math.min(Dimensions.get("window").width * 0.84, 320);

export type SideMenuRoute =
  | "SettingsScreen"
  | "ParentProfileScreen"
  | "StudentProfileScreen";

type MenuItem = {
  id: SideMenuRoute;
  label: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const MENU_ITEMS: MenuItem[] = [
  {
    id: "ParentProfileScreen",
    label: "Parent Profile",
    subtitle: "View your account details",
    icon: "person-circle-outline",
  },
  {
    id: "StudentProfileScreen",
    label: "Student Profile",
    subtitle: "View selected student details",
    icon: "school-outline",
  },
  {
    id: "SettingsScreen",
    label: "Settings",
    subtitle: "App preferences and options",
    icon: "settings-outline",
  },
];

type SideMenuProps = {
  visible: boolean;
  onClose: () => void;
  onNavigate: (route: SideMenuRoute) => void;
  onLogout: () => void;
  parentUser: any;
  studentName: string;
  schoolName: string;
  paperTheme: MD3Theme;
};

export default function SideMenu({
  visible,
  onClose,
  onNavigate,
  onLogout,
  parentUser,
  studentName,
  schoolName,
  paperTheme,
}: SideMenuProps) {
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const parentName = getPersonName(parentUser, "Parent");

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 260,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 260,
          useNativeDriver: true,
        }),
      ]).start();
      return;
    }

    slideAnim.setValue(-DRAWER_WIDTH);
    fadeAnim.setValue(0);
  }, [visible, slideAnim, fadeAnim]);

  function handleNavigate(route: SideMenuRoute) {
    onClose();
    onNavigate(route);
  }

  function handleLogout() {
    onClose();
    onLogout();
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlayRoot}>
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        <Animated.View
          style={[
            styles.drawer,
            {
              width: DRAWER_WIDTH,
              paddingTop: insets.top + 12,
              paddingBottom: insets.bottom + 16,
              backgroundColor: paperTheme.colors.surface,
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
          <View style={styles.drawerContent}>
            <View style={styles.drawerHeader}>
              <TouchableOpacity
                onPress={onClose}
                style={[
                  styles.closeButton,
                  { backgroundColor: paperTheme.colors.surfaceVariant },
                ]}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="close"
                  size={20}
                  color={paperTheme.colors.onSurfaceVariant}
                />
              </TouchableOpacity>
            </View>

            <View
              style={[
                styles.profileCard,
                { backgroundColor: paperTheme.colors.primaryContainer },
              ]}
            >
              <View
                style={[
                  styles.avatar,
                  { backgroundColor: paperTheme.colors.primary },
                ]}
              >
                <Text
                  style={[
                    styles.avatarText,
                    { color: paperTheme.colors.onPrimary },
                  ]}
                >
                  {getInitials(parentName)}
                </Text>
              </View>

              <Text
                style={[
                  styles.parentName,
                  { color: paperTheme.colors.onPrimaryContainer },
                ]}
                numberOfLines={1}
              >
                {parentName}
              </Text>
              <Text
                style={[
                  styles.studentLine,
                  { color: paperTheme.colors.onPrimaryContainer },
                ]}
                numberOfLines={1}
              >
                {studentName}
              </Text>
              <Text
                style={[
                  styles.schoolLine,
                  { color: paperTheme.colors.onPrimaryContainer },
                ]}
                numberOfLines={2}
              >
                {schoolName}
              </Text>
            </View>

            <Text
              style={[
                styles.sectionLabel,
                { color: paperTheme.colors.onSurfaceVariant },
              ]}
            >
              Menu
            </Text>

            <View style={styles.menuList}>
              {MENU_ITEMS.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.85}
                  style={[
                    styles.menuItem,
                    {
                      backgroundColor: paperTheme.colors.surfaceVariant,
                      borderColor: paperTheme.colors.outline,
                    },
                  ]}
                  onPress={() => handleNavigate(item.id)}
                >
                  <View
                    style={[
                      styles.menuIconWrap,
                      { backgroundColor: paperTheme.colors.background },
                    ]}
                  >
                    <Ionicons
                      name={item.icon}
                      size={22}
                      color={paperTheme.colors.primary}
                    />
                  </View>

                  <View style={styles.menuTextWrap}>
                    <Text
                      style={[
                        styles.menuLabel,
                        { color: paperTheme.colors.onSurface },
                      ]}
                    >
                      {item.label}
                    </Text>
                    <Text
                      style={[
                        styles.menuSubtitle,
                        { color: paperTheme.colors.onSurfaceVariant },
                      ]}
                    >
                      {item.subtitle}
                    </Text>
                  </View>

                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={paperTheme.colors.onSurfaceVariant}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            style={[
              styles.logoutButton,
              {
                backgroundColor: paperTheme.colors.errorContainer,
                borderColor: paperTheme.colors.error,
              },
            ]}
            onPress={handleLogout}
          >
            <View
              style={[
                styles.menuIconWrap,
                { backgroundColor: paperTheme.colors.surface },
              ]}
            >
              <Ionicons
                name="log-out-outline"
                size={22}
                color={paperTheme.colors.error}
              />
            </View>

            <View style={styles.menuTextWrap}>
              <Text
                style={[
                  styles.menuLabel,
                  { color: paperTheme.colors.onErrorContainer },
                ]}
              >
                Log Out
              </Text>
              <Text
                style={[
                  styles.menuSubtitle,
                  { color: paperTheme.colors.onErrorContainer },
                ]}
              >
                Sign out of your account
              </Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlayRoot: {
    flex: 1,
    flexDirection: "row",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },
  drawer: {
    flex: 1,
    paddingHorizontal: 18,
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 12,
    justifyContent: "space-between",
  },
  drawerContent: {
    flex: 1,
  },
  drawerHeader: {
    alignItems: "flex-end",
    marginBottom: 8,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  profileCard: {
    borderRadius: 20,
    padding: 18,
    marginBottom: 22,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  avatarText: {
    fontFamily: fonts.PoppinsBold,
    fontSize: 18,
  },
  parentName: {
    fontFamily: fonts.PoppinsBold,
    fontSize: 20,
    lineHeight: 26,
  },
  studentLine: {
    marginTop: 4,
    fontFamily: fonts.PoppinsSemiBold,
    fontSize: 14,
    lineHeight: 20,
  },
  schoolLine: {
    marginTop: 2,
    fontFamily: fonts.InterRegular,
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.9,
  },
  sectionLabel: {
    marginBottom: 10,
    fontFamily: fonts.PoppinsMedium,
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  menuList: {
    gap: 10,
  },
  menuItem: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  menuTextWrap: {
    flex: 1,
  },
  menuLabel: {
    fontFamily: fonts.PoppinsSemiBold,
    fontSize: 15,
    lineHeight: 20,
  },
  menuSubtitle: {
    marginTop: 2,
    fontFamily: fonts.InterRegular,
    fontSize: 12,
    lineHeight: 16,
  },
  logoutButton: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 16,
  },
});
