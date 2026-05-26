import React, { useState } from "react";
import { StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";
import { fonts } from "../../constants/fonts";
import FinanceTopTabBar from "./finance/FinanceTopTabBar";
import InvoiceTab from "./finance/InvoiceTab";
import ReceiptTab from "./finance/ReceiptTab";
import { FinanceTab } from "./finance/types";

export default function InvoiceScreen() {
  const { paperTheme, resolvedTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<FinanceTab>("invoice");

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: paperTheme.colors.background }]}
      edges={["top"]}
    >
      <StatusBar
        barStyle={resolvedTheme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={paperTheme.colors.background}
        translucent={false}
      />

      <View style={styles.screenHeader}>
        <Text style={[styles.screenTitle, { color: paperTheme.colors.onSurface }]}>
          Finance
        </Text>
        <FinanceTopTabBar
          activeTab={activeTab}
          onChange={setActiveTab}
          surfaceVariant={paperTheme.colors.surfaceVariant}
          surface={paperTheme.colors.surface}
          primary={paperTheme.colors.primary}
          onSurfaceVariant={paperTheme.colors.onSurfaceVariant}
        />
      </View>

      {activeTab === "invoice" ? <InvoiceTab /> : <ReceiptTab />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  screenHeader: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 14,
  },
  screenTitle: {
    fontFamily: fonts.PoppinsBold,
    fontSize: 28,
    lineHeight: 34,
  },
});
