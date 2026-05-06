import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";
import { fonts } from "../../constants/fonts";

export default function AttendanceScreen() {
  const { paperTheme } = useTheme();
  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: paperTheme.colors.background }]}
    >
      <View style={styles.container}>
        <Text style={[styles.title, { color: paperTheme.colors.secondary }]}>
          Attendance
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontFamily: fonts.PoppinsSemiBold, fontSize: 20 },
});
