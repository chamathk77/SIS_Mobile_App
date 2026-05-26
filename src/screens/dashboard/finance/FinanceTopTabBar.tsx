import React from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { fonts } from "../../../constants/fonts";
import { FinanceTab } from "./types";

type FinanceTopTabBarProps = {
  activeTab: FinanceTab;
  onChange: (tab: FinanceTab) => void;
  surfaceVariant: string;
  surface: string;
  primary: string;
  onSurfaceVariant: string;
};

const TABS: { key: FinanceTab; label: string }[] = [
  { key: "invoice", label: "Invoice" },
  { key: "receipt", label: "Receipt" },
  
];

export default function FinanceTopTabBar({
  activeTab,
  onChange,
  surfaceVariant,
  surface,
  primary,
  onSurfaceVariant,
}: FinanceTopTabBarProps) {
  return (
    <View style={[styles.tabBar, { backgroundColor: surfaceVariant }]}>
      {TABS.map(({ key, label }) => {
        const isActive = activeTab === key;
        return (
          <TouchableOpacity
            key={key}
            style={[
              styles.tabItem,
              isActive && [styles.tabItemActive, { backgroundColor: surface }],
            ]}
            onPress={() => onChange(key)}
            activeOpacity={0.85}
          >
            <Text
              style={[
                styles.tabLabel,
                { color: isActive ? primary : onSurfaceVariant },
                isActive && styles.tabLabelActive,
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
  },
  tabItemActive: {
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: { elevation: 2 },
    }),
  },
  tabLabel: {
    fontFamily: fonts.PoppinsMedium,
    fontSize: 14,
    lineHeight: 18,
  },
  tabLabelActive: {
    fontFamily: fonts.PoppinsSemiBold,
  },
});
