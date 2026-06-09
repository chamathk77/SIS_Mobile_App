import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { IconButton } from "react-native-paper";
import { MD3Theme } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { fonts } from "../../constants/fonts";

type HeaderIconButtonProps = {
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  badgeCount?: number;
  accessibilityLabel: string;
  iconColor: string;
  badgeColor: string;
  badgeTextColor: string;
};

function HeaderIconButton({
  icon,
  onPress,
  badgeCount = 0,
  accessibilityLabel,
  iconColor,
  badgeColor,
  badgeTextColor,
}: HeaderIconButtonProps) {
  return (
    <TouchableOpacity
      style={styles.headerIconButton}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
      accessibilityLabel={accessibilityLabel}
      hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
    >
      <Ionicons name={icon} size={24} color={iconColor} />
      {badgeCount > 0 ? (
        <View style={[styles.headerBadge, { backgroundColor: badgeColor }]}>
          <Text style={[styles.headerBadgeText, { color: badgeTextColor }]}>
            {badgeCount > 9 ? "9+" : badgeCount}
          </Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

type DashboardHeaderProps = {
  studentName: string;
  schoolName: string;
  onGoBack: () => void;
  onOpenMenu: () => void;
  onOpenNotifications?: () => void;
  onOpenNotices?: () => void;
  notificationUnreadCount?: number;
  noticeUnreadCount?: number;
  paperTheme: MD3Theme;
};

export default function DashboardHeader({
  studentName,
  schoolName,
  onGoBack,
  onOpenMenu,
  onOpenNotifications,
  onOpenNotices,
  notificationUnreadCount = 0,
  noticeUnreadCount = 0,
  paperTheme,
}: DashboardHeaderProps) {
  return (
    <View style={styles.topBar}>
      <IconButton
        icon="arrow-left"
        iconColor={paperTheme.colors.secondary}
        size={23}
        onPress={onGoBack}
        style={styles.iconButton}
      />

      <View style={styles.infoBlock}>
        <Text
          style={[styles.studentName, { color: paperTheme.colors.onSurface }]}
          numberOfLines={1}
        >
          {studentName}
        </Text>
        <Text
          style={[
            styles.schoolName,
            { color: paperTheme.colors.onSurfaceVariant },
          ]}
          numberOfLines={1}
        >
          {schoolName}
        </Text>
      </View>

      <View style={styles.actions}>
        {onOpenNotifications != null ? (
          <HeaderIconButton
            icon="notifications-outline"
            onPress={onOpenNotifications}
            badgeCount={notificationUnreadCount}
            accessibilityLabel="Notifications"
            iconColor={paperTheme.colors.onSurface}
            badgeColor={paperTheme.colors.error}
            badgeTextColor={paperTheme.colors.onError}
          />
        ) : null}

        {onOpenNotices ? (
          <HeaderIconButton
            icon="megaphone-outline"
            onPress={onOpenNotices}
            badgeCount={noticeUnreadCount}
            accessibilityLabel="School notices"
            iconColor={paperTheme.colors.onSurface}
            badgeColor={paperTheme.colors.error}
            badgeTextColor={paperTheme.colors.onError}
          />
        ) : null}

        <IconButton
          icon="menu"
          iconColor={paperTheme.colors.secondary}
          size={24}
          onPress={onOpenMenu}
          style={styles.iconButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 4,
    paddingVertical: 4,
    minHeight: 56,
  },
  iconButton: {
    margin: 0,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerIconButton: {
    width: 40,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  headerBadge: {
    position: "absolute",
    top: 4,
    right: 2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  headerBadgeText: {
    fontFamily: fonts.PoppinsBold,
    fontSize: 9,
    lineHeight: 11,
  },
  infoBlock: {
    flex: 1,
    paddingHorizontal: 4,
  },
  studentName: {
    fontFamily: fonts.PoppinsSemiBold,
    fontSize: 16,
    lineHeight: 22,
  },
  schoolName: {
    marginTop: 2,
    fontFamily: fonts.InterRegular,
    fontSize: 12,
    lineHeight: 16,
  },
});
