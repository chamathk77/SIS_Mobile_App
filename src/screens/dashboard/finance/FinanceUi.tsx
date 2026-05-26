import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { fonts } from "../../../constants/fonts";
import { formatDateForDisplay } from "../../../utils/attendanceHelpers";

export function SummaryCard({
  label,
  value,
  accent,
  background,
  textColor,
}: {
  label: string;
  value: string;
  accent: string;
  background: string;
  textColor: string;
}) {
  return (
    <View style={[uiStyles.summaryCard, { backgroundColor: background, borderColor: accent }]}>
      <Text style={[uiStyles.summaryValue, { color: textColor }]} numberOfLines={1}>
        {value}
      </Text>
      <Text style={[uiStyles.summaryLabel, { color: textColor }]}>{label}</Text>
    </View>
  );
}

export function AmountRow({
  label,
  value,
  labelColor,
  valueColor,
  emphasized,
}: {
  label: string;
  value: string;
  labelColor: string;
  valueColor: string;
  emphasized?: boolean;
}) {
  return (
    <View style={uiStyles.amountRow}>
      <Text
        style={[
          uiStyles.amountLabel,
          { color: labelColor },
          emphasized && uiStyles.amountLabelEmphasis,
        ]}
      >
        {label}
      </Text>
      <Text
        style={[
          uiStyles.amountValue,
          { color: valueColor },
          emphasized && uiStyles.amountValueEmphasis,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

export function DateField({
  label,
  value,
  onPress,
  borderColor,
  backgroundColor,
  labelColor,
  valueColor,
}: {
  label: string;
  value: Date | null;
  onPress: () => void;
  borderColor: string;
  backgroundColor: string;
  labelColor: string;
  valueColor: string;
}) {
  return (
    <TouchableOpacity
      style={[uiStyles.dateField, { borderColor, backgroundColor }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Text style={[uiStyles.dateFieldLabel, { color: labelColor }]}>{label}</Text>
      <View style={uiStyles.dateFieldRow}>
        <Text style={[uiStyles.dateFieldValue, { color: valueColor }]}>
          {value ? formatDateForDisplay(value) : "Select date"}
        </Text>
        <Ionicons name="calendar-outline" size={18} color={labelColor} />
      </View>
    </TouchableOpacity>
  );
}

export const uiStyles = StyleSheet.create({
  summaryCard: {
    width: "48%",
    flexGrow: 1,
    flexBasis: "46%",
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  summaryValue: {
    fontFamily: fonts.PoppinsBold,
    fontSize: 16,
    lineHeight: 22,
    textAlign: "center",
  },
  summaryLabel: {
    marginTop: 4,
    fontFamily: fonts.PoppinsMedium,
    fontSize: 12,
    lineHeight: 16,
    textAlign: "center",
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  amountLabel: {
    fontFamily: fonts.InterRegular,
    fontSize: 13,
    lineHeight: 18,
  },
  amountLabelEmphasis: {
    fontFamily: fonts.PoppinsMedium,
  },
  amountValue: {
    fontFamily: fonts.PoppinsMedium,
    fontSize: 13,
    lineHeight: 18,
  },
  amountValueEmphasis: {
    fontFamily: fonts.PoppinsSemiBold,
    fontSize: 14,
  },
  dateField: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 4,
  },
  dateFieldLabel: {
    fontFamily: fonts.InterRegular,
    fontSize: 11,
    lineHeight: 14,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  dateFieldRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
  },
  dateFieldValue: {
    flex: 1,
    fontFamily: fonts.PoppinsMedium,
    fontSize: 13,
    lineHeight: 18,
  },
});
