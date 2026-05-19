import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { IconButton } from "react-native-paper";
import { MD3Theme } from "react-native-paper";
import { fonts } from "../../constants/fonts";

type DashboardHeaderProps = {
  studentName: string;
  schoolName: string;
  onGoBack: () => void;
  onOpenMenu: () => void;
  paperTheme: MD3Theme;
};

export default function DashboardHeader({
  studentName,
  schoolName,
  onGoBack,
  onOpenMenu,
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

      <IconButton
        icon="menu"
        iconColor={paperTheme.colors.secondary}
        size={24}
        onPress={onOpenMenu}
        style={styles.iconButton}
      />
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
