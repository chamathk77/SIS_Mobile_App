import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useFocusEffect } from "@react-navigation/native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { Portal } from "react-native-paper";
import { useTheme } from "../../../context/ThemeContext";
import { useCommonAlert } from "../../../hooks/useCommonAlert";
import CommonAlert from "../../../components/CommonAlert";
import { AppDispatch, RootState } from "../../../store/store";
import { GetReceipts_Service } from "../../../services/ReceiptService";
import {
  Receipt,
  RECEIPT_PAYMENT_METHODS,
  ReceiptPaymentMethod,
} from "../../../type/receipt";
import {
  applyAttendanceDateChange,
  formatDateForApi,
  getToday,
} from "../../../utils/attendanceHelpers";
import {
  formatInvoiceAmount,
  formatInvoiceDate,
} from "../../../utils/invoiceHelpers";
import {
  formatByMethodSummary,
  formatPaymentMethod,
  formatReceiptStatus,
  getReceiptCurrency,
  getReceiptInvoiceNumber,
  getReceiptLastPage,
  getReceiptPaymentDate,
  getReceiptSubtitle,
  getReceiptTitle,
} from "../../../utils/receiptHelpers";
import { AmountRow, DateField, SummaryCard } from "./FinanceUi";
import { uiStyles } from "./FinanceUi";
import { financeStyles } from "./financeStyles";
import { AppliedReceiptFilters, PickerTarget } from "./types";

export default function ReceiptTab() {
  const { paperTheme, resolvedTheme } = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const { alertConfig, visible, hideAlert, show_Alert } = useCommonAlert();

  const selectedStudentId = useSelector(
    (state: RootState) =>
      state.StudentDataReducer.SelectStudent.selectedStudentId,
  );
  const receiptPayload = useSelector(
    (state: RootState) => state.ReceiptReducer.data,
  );
  const isLoading = useSelector(
    (state: RootState) => state.ReceiptReducer.loading,
  );
  const receiptError = useSelector(
    (state: RootState) => state.ReceiptReducer.error,
  );

  const today = useMemo(() => getToday(), []);
  const [draftMethod, setDraftMethod] = useState<ReceiptPaymentMethod | "">("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [appliedFilters, setAppliedFilters] = useState<AppliedReceiptFilters>({});
  const [filterError, setFilterError] = useState<string | null>(null);
  const [methodPickerVisible, setMethodPickerVisible] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<PickerTarget>(null);
  const [iosPickerDraft, setIosPickerDraft] = useState<Date | null>(null);

  const appliedFiltersRef = useRef(appliedFilters);
  appliedFiltersRef.current = appliedFilters;
  const pendingPageRef = useRef(1);

  const receipts = receiptPayload?.data?.receipts ?? [];
  const meta = receiptPayload?.data?.meta;
  const summary = meta?.summary;
  const hasStudent = Boolean(selectedStudentId?.trim());
  const lastPage = getReceiptLastPage(meta);
  const canLoadMore = meta != null && meta.current_page < lastPage;

  const themeColors = paperTheme.colors as typeof paperTheme.colors & {
    success: string;
    successContainer: string;
    onSuccessContainer: string;
    primary: string;
    primaryContainer: string;
    onPrimaryContainer: string;
  };

  const fetchReceipts = useCallback(
    async (page = 1, filters?: AppliedReceiptFilters) => {
      pendingPageRef.current = page;

      try {
        const id = selectedStudentId?.trim();
        if (!id) {
          return;
        }

        const activeFilters = filters ?? appliedFiltersRef.current;
        await dispatch(
          GetReceipts_Service({
            student_id: String(id),
            page,
            ...(activeFilters.from ? { from: activeFilters.from } : {}),
            ...(activeFilters.to ? { to: activeFilters.to } : {}),
            ...(activeFilters.method ? { method: activeFilters.method } : {}),
          }),
        ).unwrap();
      } catch (error: any) {
        show_Alert(
          "error",
          "Error",
          error?.message || "Failed to fetch receipts.",
          1,
          false,
          "OK",
        );
      }
    },
    [dispatch, selectedStudentId, show_Alert],
  );

  useFocusEffect(
    useCallback(() => {
      if (selectedStudentId?.trim()) {
        void fetchReceipts(1);
      }
    }, [selectedStudentId, fetchReceipts]),
  );

  const loadMoreReceipts = useCallback(() => {
    if (!canLoadMore || isLoading || !hasStudent) {
      return;
    }
    void fetchReceipts((meta?.current_page ?? 1) + 1);
  }, [canLoadMore, isLoading, hasStudent, meta?.current_page, fetchReceipts]);

  const hasActiveFilters = Boolean(
    appliedFilters.from || appliedFilters.to || appliedFilters.method,
  );

  const draftMethodLabel = draftMethod
    ? formatPaymentMethod(draftMethod)
    : "All methods";

  const handleSearch = useCallback(() => {
    const hasStart = startDate != null;
    const hasEnd = endDate != null;

    if (hasStart !== hasEnd) {
      setFilterError("Select both start and end date.");
      return;
    }

    if (hasStart && hasEnd && startDate! > endDate!) {
      setFilterError("Start date must be on or before end date.");
      return;
    }

    if (hasStart && hasEnd && (startDate! > today || endDate! > today)) {
      setFilterError("Dates cannot be in the future.");
      return;
    }

    if (!draftMethod && !hasStart && !hasEnd) {
      setFilterError("Select a payment method and/or date range.");
      return;
    }

    setFilterError(null);
    const filters: AppliedReceiptFilters = {
      ...(draftMethod ? { method: draftMethod } : {}),
      ...(hasStart && hasEnd
        ? { from: formatDateForApi(startDate!), to: formatDateForApi(endDate!) }
        : {}),
    };
    setAppliedFilters(filters);
    void fetchReceipts(1, filters);
  }, [draftMethod, startDate, endDate, today, fetchReceipts]);

  const handleClearFilters = useCallback(() => {
    setDraftMethod("");
    setStartDate(null);
    setEndDate(null);
    setAppliedFilters({});
    setFilterError(null);
    void fetchReceipts(1, {});
  }, [fetchReceipts]);

  const openDatePicker = useCallback(
    (target: "start" | "end") => {
      setPickerTarget(target);
      const initial =
        target === "start"
          ? startDate ?? endDate ?? today
          : endDate ?? startDate ?? today;
      setIosPickerDraft(initial);
    },
    [startDate, endDate, today],
  );

  const onPickerChange = useCallback(
    (event: DateTimePickerEvent, date?: Date) => {
      if (Platform.OS === "android") {
        setPickerTarget(null);
        if (event.type === "dismissed" || !date) {
          return;
        }

        if (pickerTarget === "start") {
          if (endDate) {
            const next = applyAttendanceDateChange(date, endDate, "start", date);
            setStartDate(next.from);
            setEndDate(next.to);
          } else {
            setStartDate(date);
          }
        } else if (pickerTarget === "end") {
          if (startDate) {
            const next = applyAttendanceDateChange(startDate, date, "end", date);
            setStartDate(next.from);
            setEndDate(next.to);
          } else {
            setEndDate(date);
          }
        }
        return;
      }

      if (date) {
        setIosPickerDraft(date);
      }
    },
    [pickerTarget, startDate, endDate],
  );

  const confirmIosPicker = useCallback(() => {
    if (iosPickerDraft && pickerTarget === "start") {
      if (endDate) {
        const next = applyAttendanceDateChange(
          iosPickerDraft,
          endDate,
          "start",
          iosPickerDraft,
        );
        setStartDate(next.from);
        setEndDate(next.to);
      } else {
        setStartDate(iosPickerDraft);
      }
      setFilterError(null);
    } else if (iosPickerDraft && pickerTarget === "end") {
      if (startDate) {
        const next = applyAttendanceDateChange(
          startDate,
          iosPickerDraft,
          "end",
          iosPickerDraft,
        );
        setStartDate(next.from);
        setEndDate(next.to);
      } else {
        setEndDate(iosPickerDraft);
      }
      setFilterError(null);
    }
    setPickerTarget(null);
    setIosPickerDraft(null);
  }, [iosPickerDraft, pickerTarget, startDate, endDate]);

  const cancelIosPicker = useCallback(() => {
    setPickerTarget(null);
    setIosPickerDraft(null);
  }, []);

  const pickerValue =
    iosPickerDraft ??
    (pickerTarget === "start"
      ? startDate ?? endDate ?? today
      : endDate ?? startDate ?? today);
  const pickerMaximumDate =
    pickerTarget === "end"
      ? today
      : pickerTarget === "start"
        ? endDate && endDate < today
          ? endDate
          : today
        : today;
  const pickerMinimumDate = pickerTarget === "end" ? startDate ?? undefined : undefined;

  const methodSummary = formatByMethodSummary(summary?.by_method);

  const summaryCards = useMemo(() => {
    if (!summary) {
      return [];
    }

    const cards = [
      {
        key: "total_paid",
        label: "Total paid",
        value: formatInvoiceAmount(summary.total_paid_in_range),
        accent: themeColors.success,
        background: themeColors.successContainer,
        textColor: themeColors.onSuccessContainer,
      },
    ];

    if (methodSummary) {
      cards.push({
        key: "by_method",
        label: "By method",
        value: methodSummary,
        accent: themeColors.primary,
        background: themeColors.primaryContainer,
        textColor: themeColors.onPrimaryContainer,
      });
    }

    return cards;
  }, [summary, methodSummary, themeColors]);

  const renderReceipt = useCallback(
    ({ item }: { item: Receipt }) => {
      const currency = getReceiptCurrency(item);
      const title = getReceiptTitle(item);
      const subtitle = getReceiptSubtitle(item);

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
                {title}
              </Text>
              {subtitle ? (
                <Text
                  style={[
                    financeStyles.recordSubtitle,
                    { color: paperTheme.colors.onSurfaceVariant },
                  ]}
                >
                  {subtitle}
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
                {formatReceiptStatus(item.status)}
              </Text>
            </View>
          </View>

          <Text
            style={[financeStyles.recordMeta, { color: paperTheme.colors.onSurfaceVariant }]}
          >
            Invoice {getReceiptInvoiceNumber(item)} ·{" "}
            {formatInvoiceDate(getReceiptPaymentDate(item))}
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
              value={formatPaymentMethod(item.payment_method)}
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
      ) : (
        <View
          style={[
            financeStyles.filterCard,
            {
              backgroundColor: paperTheme.colors.surface,
              borderColor: paperTheme.colors.outline,
            },
          ]}
        >
          <Text
            style={[financeStyles.filterTitle, { color: paperTheme.colors.onSurface }]}
          >
            Filter receipts
          </Text>

          <TouchableOpacity
            style={[
              financeStyles.statusField,
              {
                borderColor: paperTheme.colors.outline,
                backgroundColor: paperTheme.colors.surfaceVariant,
              },
            ]}
            onPress={() => setMethodPickerVisible(true)}
            activeOpacity={0.85}
          >
            <Text
              style={[
                uiStyles.dateFieldLabel,
                { color: paperTheme.colors.onSurfaceVariant },
              ]}
            >
              Payment method
            </Text>
            <View style={uiStyles.dateFieldRow}>
              <Text
                style={[
                  uiStyles.dateFieldValue,
                  { color: paperTheme.colors.onSurface },
                ]}
              >
                {draftMethodLabel}
              </Text>
              <Ionicons
                name="chevron-down"
                size={18}
                color={paperTheme.colors.onSurfaceVariant}
              />
            </View>
          </TouchableOpacity>

          <View style={financeStyles.dateRow}>
            <DateField
              label="From"
              value={startDate}
              onPress={() => openDatePicker("start")}
              borderColor={paperTheme.colors.outline}
              backgroundColor={paperTheme.colors.surfaceVariant}
              labelColor={paperTheme.colors.onSurfaceVariant}
              valueColor={paperTheme.colors.onSurface}
            />
            <DateField
              label="To"
              value={endDate}
              onPress={() => openDatePicker("end")}
              borderColor={paperTheme.colors.outline}
              backgroundColor={paperTheme.colors.surfaceVariant}
              labelColor={paperTheme.colors.onSurfaceVariant}
              valueColor={paperTheme.colors.onSurface}
            />
          </View>

          {filterError ? (
            <Text style={[financeStyles.filterError, { color: paperTheme.colors.error }]}>
              {filterError}
            </Text>
          ) : null}

          <View style={financeStyles.filterActions}>
            <TouchableOpacity
              style={[
                financeStyles.searchButton,
                { backgroundColor: paperTheme.colors.primary },
              ]}
              onPress={handleSearch}
              activeOpacity={0.85}
            >
              <Ionicons name="search" size={18} color={paperTheme.colors.onPrimary} />
              <Text
                style={[
                  financeStyles.searchButtonText,
                  { color: paperTheme.colors.onPrimary },
                ]}
              >
                Search
              </Text>
            </TouchableOpacity>

            {hasActiveFilters ? (
              <TouchableOpacity
                style={[
                  financeStyles.resetButton,
                  { borderColor: paperTheme.colors.outline },
                ]}
                onPress={handleClearFilters}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    financeStyles.resetButtonText,
                    { color: paperTheme.colors.onSurface },
                  ]}
                >
                  Clear
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {hasActiveFilters ? (
            <Text
              style={[
                financeStyles.activeFiltersLabel,
                { color: paperTheme.colors.onSurfaceVariant },
              ]}
            >
              {[
                appliedFilters.method
                  ? formatPaymentMethod(appliedFilters.method)
                  : null,
                appliedFilters.from && appliedFilters.to
                  ? `${formatInvoiceDate(appliedFilters.from)} – ${formatInvoiceDate(appliedFilters.to)}`
                  : null,
              ]
                .filter(Boolean)
                .join(" · ")}
            </Text>
          ) : null}
        </View>
      )}

      {summary ? (
        <View style={financeStyles.summaryGrid}>
          {summaryCards.map(({ key, ...card }) => (
            <SummaryCard key={key} {...card} />
          ))}
        </View>
      ) : null}

      {receipts.length > 0 ? (
        <Text
          style={[
            financeStyles.sectionTitle,
            { color: paperTheme.colors.onSurfaceVariant },
          ]}
        >
          Receipt history
          {meta ? ` · ${meta.total} receipts` : ""}
        </Text>
      ) : null}
    </View>
  );

  const listEmpty =
    !isLoading && hasStudent ? (
      <View
        style={[
          financeStyles.emptyCard,
          { backgroundColor: paperTheme.colors.surfaceVariant },
        ]}
      >
        <Text
          style={[financeStyles.emptyText, { color: paperTheme.colors.onSurfaceVariant }]}
        >
          {receiptError ?? "No receipts found."}
        </Text>
      </View>
    ) : null;

  const listFooter = useMemo(() => {
    if (receipts.length === 0) {
      return <View style={financeStyles.footerSpacer} />;
    }

    const isLoadingMore =
      isLoading && receipts.length > 0 && pendingPageRef.current > 1;

    if (isLoadingMore) {
      return (
        <View style={financeStyles.listFooter}>
          <ActivityIndicator size="small" color={paperTheme.colors.primary} />
          <Text
            style={[
              financeStyles.listFooterLoadingText,
              { color: paperTheme.colors.onSurfaceVariant },
            ]}
          >
            Loading more receipts…
          </Text>
        </View>
      );
    }

    if (!canLoadMore) {
      return (
        <View style={financeStyles.listFooter}>
          <Ionicons
            name="checkmark-circle-outline"
            size={22}
            color={paperTheme.colors.onSurfaceVariant}
          />
          <Text
            style={[
              financeStyles.listEndTitle,
              { color: paperTheme.colors.onSurfaceVariant },
            ]}
          >
            You're all caught up
          </Text>
          <Text
            style={[
              financeStyles.listEndSubtitle,
              { color: paperTheme.colors.onSurfaceVariant },
            ]}
          >
            {meta?.total != null
              ? `All ${meta.total} receipt${meta.total === 1 ? "" : "s"} loaded`
              : "No more receipts to load"}
          </Text>
        </View>
      );
    }

    return <View style={financeStyles.footerSpacer} />;
  }, [receipts.length, isLoading, canLoadMore, meta?.total, paperTheme.colors]);

  return (
    <View style={styles.container}>
      <Modal
        visible={isLoading && receipts.length === 0}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <View style={financeStyles.loadingOverlay}>
          <ActivityIndicator size="large" color={paperTheme.colors.primary} />
        </View>
      </Modal>

      <Modal
        visible={methodPickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setMethodPickerVisible(false)}
      >
        <Pressable
          style={financeStyles.pickerBackdrop}
          onPress={() => setMethodPickerVisible(false)}
        >
          <Pressable
            style={[
              financeStyles.pickerSheet,
              { backgroundColor: paperTheme.colors.surface },
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={financeStyles.pickerHeader}>
              <TouchableOpacity onPress={() => setMethodPickerVisible(false)}>
                <Text
                  style={[
                    financeStyles.pickerAction,
                    { color: paperTheme.colors.onSurfaceVariant },
                  ]}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              <Text
                style={[financeStyles.pickerTitle, { color: paperTheme.colors.onSurface }]}
              >
                Payment method
              </Text>
              <View style={financeStyles.pickerAction} />
            </View>
            <ScrollView style={financeStyles.statusList}>
              <TouchableOpacity
                style={[
                  financeStyles.statusOption,
                  !draftMethod && {
                    backgroundColor: paperTheme.colors.primaryContainer,
                  },
                ]}
                onPress={() => {
                  setDraftMethod("");
                  setMethodPickerVisible(false);
                }}
              >
                <Text
                  style={[
                    financeStyles.statusOptionText,
                    { color: paperTheme.colors.onSurface },
                  ]}
                >
                  All methods
                </Text>
              </TouchableOpacity>
              {RECEIPT_PAYMENT_METHODS.map((method) => (
                <TouchableOpacity
                  key={method}
                  style={[
                    financeStyles.statusOption,
                    draftMethod === method && {
                      backgroundColor: paperTheme.colors.primaryContainer,
                    },
                  ]}
                  onPress={() => {
                    setDraftMethod(method);
                    setMethodPickerVisible(false);
                  }}
                >
                  <Text
                    style={[
                      financeStyles.statusOptionText,
                      { color: paperTheme.colors.onSurface },
                    ]}
                  >
                    {formatPaymentMethod(method)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {Platform.OS === "ios" ? (
        <Modal
          visible={pickerTarget != null}
          transparent
          animationType="slide"
          onRequestClose={cancelIosPicker}
        >
          <Pressable style={financeStyles.pickerBackdrop} onPress={cancelIosPicker}>
            <Pressable
              style={[
                financeStyles.pickerSheet,
                { backgroundColor: paperTheme.colors.surface },
              ]}
              onPress={(e) => e.stopPropagation()}
            >
              <View style={financeStyles.pickerHeader}>
                <TouchableOpacity onPress={cancelIosPicker}>
                  <Text
                    style={[
                      financeStyles.pickerAction,
                      { color: paperTheme.colors.onSurfaceVariant },
                    ]}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>
                <Text
                  style={[financeStyles.pickerTitle, { color: paperTheme.colors.onSurface }]}
                >
                  {pickerTarget === "start" ? "From date" : "To date"}
                </Text>
                <TouchableOpacity onPress={confirmIosPicker}>
                  <Text
                    style={[
                      financeStyles.pickerAction,
                      { color: paperTheme.colors.primary },
                    ]}
                  >
                    Done
                  </Text>
                </TouchableOpacity>
              </View>
              {pickerTarget != null ? (
                <DateTimePicker
                  value={pickerValue}
                  mode="date"
                  display="spinner"
                  maximumDate={pickerMaximumDate}
                  minimumDate={pickerMinimumDate}
                  onChange={onPickerChange}
                  themeVariant={resolvedTheme === "dark" ? "dark" : "light"}
                />
              ) : null}
            </Pressable>
          </Pressable>
        </Modal>
      ) : null}

      {Platform.OS === "android" && pickerTarget != null ? (
        <DateTimePicker
          value={pickerValue}
          mode="date"
          display="default"
          maximumDate={pickerMaximumDate}
          minimumDate={pickerMinimumDate}
          onChange={onPickerChange}
        />
      ) : null}

      <FlatList
        data={receipts}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderReceipt}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={listEmpty}
        ListFooterComponent={listFooter}
        contentContainerStyle={financeStyles.listContent}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMoreReceipts}
        onEndReachedThreshold={0.35}
        refreshControl={
          <RefreshControl
            refreshing={isLoading && receipts.length > 0 && pendingPageRef.current === 1}
            onRefresh={() => void fetchReceipts(1)}
            tintColor={paperTheme.colors.primary}
          />
        }
      />

      <Portal>
        {alertConfig && (
          <CommonAlert
            visible={visible}
            type={alertConfig.type}
            title={alertConfig.title}
            message={alertConfig.message}
            buttons={alertConfig.buttons}
            positiveButtonText={alertConfig.positiveButtonText}
            negativeButtonText={alertConfig.negativeButtonText}
            onPositivePress={alertConfig.onPositivePress}
            onNegativePress={alertConfig.onNegativePress}
            onClose={hideAlert}
          />
        )}
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
