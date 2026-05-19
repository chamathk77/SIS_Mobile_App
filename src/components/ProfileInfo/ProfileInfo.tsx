import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { MD3Theme } from "react-native-paper";
import { fonts } from "../../constants/fonts";

type ProfileInfoRowProps = {
  label: string;
  value: string;
  paperTheme: MD3Theme;
};

export function ProfileInfoRow({
  label,
  value,
  paperTheme,
}: ProfileInfoRowProps) {
  return (
    <View
      style={[
        styles.row,
        {
          backgroundColor: paperTheme.colors.surface,
          borderColor: paperTheme.colors.outline,
        },
      ]}
    >
      <Text
        style={[styles.label, { color: paperTheme.colors.onSurfaceVariant }]}
      >
        {label}
      </Text>
      <Text style={[styles.value, { color: paperTheme.colors.onSurface }]}>
        {value}
      </Text>
    </View>
  );
}

type ProfileHeroCardProps = {
  name: string;
  subtitle: string;
  initials: string;
  paperTheme: MD3Theme;
};

export function ProfileHeroCard({
  name,
  subtitle,
  initials,
  paperTheme,
}: ProfileHeroCardProps) {
  return (
    <View
      style={[
        styles.heroCard,
        { backgroundColor: paperTheme.colors.primaryContainer },
      ]}
    >
      <View
        style={[styles.avatar, { backgroundColor: paperTheme.colors.primary }]}
      >
        <Text style={[styles.avatarText, { color: paperTheme.colors.onPrimary }]}>
          {initials}
        </Text>
      </View>
      <Text
        style={[styles.heroName, { color: paperTheme.colors.onPrimaryContainer }]}
      >
        {name}
      </Text>
      <Text
        style={[
          styles.heroSubtitle,
          { color: paperTheme.colors.onPrimaryContainer },
        ]}
      >
        {subtitle}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    borderRadius: 22,
    padding: 22,
    alignItems: "center",
    marginBottom: 18,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  avatarText: {
    fontFamily: fonts.PoppinsBold,
    fontSize: 24,
  },
  heroName: {
    fontFamily: fonts.PoppinsBold,
    fontSize: 24,
    lineHeight: 30,
    textAlign: "center",
  },
  heroSubtitle: {
    marginTop: 6,
    fontFamily: fonts.InterRegular,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    opacity: 0.92,
  },
  row: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
  },
  label: {
    fontFamily: fonts.InterRegular,
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 4,
  },
  value: {
    fontFamily: fonts.PoppinsMedium,
    fontSize: 15,
    lineHeight: 21,
  },
});
