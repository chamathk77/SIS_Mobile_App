import React, { useCallback } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { useSelector } from "react-redux";
import { useTheme } from "../../../context/ThemeContext";
import { RootState } from "../../../store/store";
import { Receipt } from "../../../type/invoice";
import {
  formatInvoiceAmount,
  formatInvoiceDate,
} from "../../../utils/invoiceHelpers";
import { DUMMY_RECEIPTS, USE_DUMMY_INVOICE_DATA } from "../../../data/dummyInvoiceData";
import { AmountRow } from "./FinanceUi";
import { financeStyles } from "./financeStyles";
export default function ReceiptTab() {
  const { paperTheme } = useTheme();

  const selectedStudentId = useSelector(
    (state: RootState) => state.StudentDataReducer.SelectStudent.selectedStudentId,
  );

  const hasStudent = USE_DUMMY_INVOICE_DATA || Boolean(selectedStudentId?.trim());
  const receipts = USE_DUMMY_INVOICE_DATA ? DUMMY_RECEIPTS : [];

  const themeColors = paperTheme.colors as typeof paperTheme.colors & {
    success: string;
    successContainer: string;
    onSuccessContainer: string;
  };

  const renderReceipt = useCallback(
    ({ item }: { item: Receipt }) => {
      const currency = item.currency ?? "LKR";

      return (
        <View
          style={[
            financeStyles.recordCard,
            {
              backgroundColor: paperTheme.colors.surface,
              borderColor: paperTheme.colors.outline,
            },
          ]}
        >
          <View style={financeStyles.recordHeader}>
            <View style={financeStyles.recordHeaderMain}>
              <Text
                style={[financeStyles.recordTitle, { color: paperTheme.colors.onSurface }]}
              >
                {item.receipt_number}
              </Text>
              {item.title ? (
                <Text
                  style={[
                    financeStyles.recordSubtitle,
                    { color: paperTheme.colors.onSurfaceVariant },
                  ]}
                >
                  {item.title}
                </Text>
              ) : null}
            </View>
            <View
              style={[
                financeStyles.statusBadge,
                { backgroundColor: themeColors.successContainer },
              ]}
            >
              <Text
                style={[financeStyles.statusText, { color: themeColors.onSuccessContainer }]}
              >
                Paid
              </Text>
            </View>
          </View>

          <Text
            style={[financeStyles.recordMeta, { color: paperTheme.colors.onSurfaceVariant }]}
          >
            Invoice {item.invoice_number} · {formatInvoiceDate(item.paid_at)}
          </Text>

          <View style={financeStyles.amountBlock}>
            <AmountRow
              label="Amount"
              value={formatInvoiceAmount(item.amount, currency)}
              labelColor={paperTheme.colors.onSurface}
              valueColor={themeColors.success}
              emphasized
            />
            <AmountRow
              label="Payment method"
              value={item.payment_method}
              labelColor={paperTheme.colors.onSurfaceVariant}
              valueColor={paperTheme.colors.onSurface}
            />
          </View>
        </View>
      );
    },
    [paperTheme.colors, themeColors],
  );

  const listHeader = (
    <View style={financeStyles.tabListHeader}>
      {!hasStudent ? (
        <Text
          style={[financeStyles.hintText, { color: paperTheme.colors.onSurfaceVariant }]}
        >
          Select a student to view receipts.
        </Text>
      ) : receipts.length > 0 ? (
        <Text
          style={[
            financeStyles.sectionTitle,
            { color: paperTheme.colors.onSurfaceVariant },
          ]}
        >
          Receipt history · {receipts.length} receipts
        </Text>
      ) : null}
    </View>
  );

  const listEmpty = hasStudent ? (
    <View
      style={[
        financeStyles.emptyCard,
        { backgroundColor: paperTheme.colors.surfaceVariant },
      ]}
    >
      <Text
        style={[financeStyles.emptyText, { color: paperTheme.colors.onSurfaceVariant }]}
      >
        No receipts found.
      </Text>
    </View>
  ) : null;

  return (
    <View style={styles.container}>
      <FlatList
        data={receipts}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderReceipt}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={listEmpty}
        contentContainerStyle={financeStyles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
