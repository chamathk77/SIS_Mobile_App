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
import { useTheme } from "../../../context/ThemeContext";
import { AppDispatch, RootState } from "../../../store/store";
import { GetInvoices_Service } from "../../../services/InvoiceService";
import {
  Invoice,
  InvoiceFilterStatus,
  INVOICE_FILTER_STATUSES,
} from "../../../type/invoice";
import {
  applyAttendanceDateChange,
  formatDateForApi,
  getToday,
} from "../../../utils/attendanceHelpers";
import {
  formatInvoiceAmount,
  formatInvoiceDate,
  formatInvoiceStatus,
  getInvoiceBalance,
  getInvoiceCurrency,
  getInvoiceLastPage,
  getInvoicePaid,
  getInvoiceStatusColors,
  getInvoiceSubtitle,
} from "../../../utils/invoiceHelpers";
import { AmountRow, DateField, SummaryCard } from "./FinanceUi";
import { uiStyles } from "./FinanceUi";
import { financeStyles } from "./financeStyles";
import { AppliedInvoiceFilters, PickerTarget } from "./types";
import { useCommonAlert } from "../../../hooks/useCommonAlert";
import { Portal } from "react-native-paper";
import CommonAlert from "../../../components/CommonAlert";

export default function InvoiceTab() {
  const { paperTheme, resolvedTheme } = useTheme();
  const dispatch = useDispatch<AppDispatch>();

  const { alertConfig, visible, hideAlert, show_Alert } = useCommonAlert();

  const selectedStudentId = useSelector(
    (state: RootState) =>
      state.StudentDataReducer.SelectStudent.selectedStudentId,
  );

  const invoicePayload = useSelector(
    (state: RootState) => state.InvoiceReducer.data,
  );
  const isLoading = useSelector(
    (state: RootState) => state.InvoiceReducer.loading,
  );
  const invoiceError = useSelector(
    (state: RootState) => state.InvoiceReducer.error,
  );

  const [expandedInvoiceId, setExpandedInvoiceId] = useState<number | null>(
    null,
  );
  const today = useMemo(() => getToday(), []);

  const [draftStatus, setDraftStatus] = useState<InvoiceFilterStatus | "">("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [appliedFilters, setAppliedFilters] = useState<AppliedInvoiceFilters>(
    {},
  );
  const [filterError, setFilterError] = useState<string | null>(null);
  const [statusPickerVisible, setStatusPickerVisible] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<PickerTarget>(null);
  const [iosPickerDraft, setIosPickerDraft] = useState<Date | null>(null);

  const appliedFiltersRef = useRef(appliedFilters);
  appliedFiltersRef.current = appliedFilters;
  const pendingPageRef = useRef(1);

  const invoices = invoicePayload?.data?.invoices ?? [];
  const meta = invoicePayload?.data?.meta;
  const summary = meta?.summary;
  const hasStudent = Boolean(selectedStudentId?.trim());
  const lastPage = getInvoiceLastPage(meta);
  const canLoadMore = meta != null && meta.current_page < lastPage;

  const themeColors = paperTheme.colors as typeof paperTheme.colors & {
    success: string;
    successContainer: string;
    onSuccessContainer: string;
    tertiary: string;
    tertiaryContainer: string;
    onTertiaryContainer: string;
    secondary: string;
    secondaryContainer: string;
    onSecondaryContainer: string;
  };

  const fetchInvoices = useCallback(
    async (page = 1, filters?: AppliedInvoiceFilters) => {
      pendingPageRef.current = page;

      try {
        const id = selectedStudentId?.trim();
        if (!id) {
          return;
        }

        const activeFilters = filters ?? appliedFiltersRef.current;
        const response = await dispatch(
          GetInvoices_Service({
            student_id: String(id),
            page,
            ...(activeFilters.status ? { status: activeFilters.status } : {}),
            ...(activeFilters.from ? { from: activeFilters.from } : {}),
            ...(activeFilters.to ? { to: activeFilters.to } : {}),
          }),
        ).unwrap();
        console.log("response get invoices", JSON.stringify(response, null, 2));
          
      } catch (error) {
        console.log("error", error);
        show_Alert(
          "error",
          "Error",
          error.message || "Failed to fetch invoices.",
          1,
          false,
          "OK",
        );
        return;
      }
    
    },
    [dispatch, selectedStudentId],
  );

  useFocusEffect(
    useCallback(() => {
      if (selectedStudentId?.trim()) {
        void fetchInvoices(1);
      } else {
        show_Alert(
          "error",
          "No student selected",
          "Please select a student to view invoices.",
          1,
          false,
          "OK",
        );
      }
    }, [selectedStudentId, fetchInvoices, show_Alert]),
  );

  const loadMoreInvoices = useCallback(() => {
    if (!canLoadMore || isLoading || !hasStudent) {
      return;
    }
    void fetchInvoices((meta?.current_page ?? 1) + 1);
  }, [canLoadMore, isLoading, hasStudent, meta?.current_page, fetchInvoices]);

  const hasActiveFilters = Boolean(
    appliedFilters.status || appliedFilters.from || appliedFilters.to,
  );

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

    setFilterError(null);
    const filters: AppliedInvoiceFilters = {
      ...(draftStatus ? { status: draftStatus } : {}),
      ...(hasStart && hasEnd
        ? { from: formatDateForApi(startDate!), to: formatDateForApi(endDate!) }
        : {}),
    };
    setAppliedFilters(filters);
    void fetchInvoices(1, filters);
  }, [draftStatus, startDate, endDate, today, fetchInvoices]);

  const handleClearFilters = useCallback(() => {
    setDraftStatus("");
    setStartDate(null);
    setEndDate(null);
    setAppliedFilters({});
    setFilterError(null);
    void fetchInvoices(1, {});
  }, [fetchInvoices]);

  const openDatePicker = useCallback(
    (target: "start" | "end") => {
      setPickerTarget(target);
      const initial =
        target === "start"
          ? (startDate ?? endDate ?? today)
          : (endDate ?? startDate ?? today);
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
            const next = applyAttendanceDateChange(
              date,
              endDate,
              "start",
              date,
            );
            setStartDate(next.from);
            setEndDate(next.to);
          } else {
            setStartDate(date);
          }
        } else if (pickerTarget === "end") {
          if (startDate) {
            const next = applyAttendanceDateChange(
              startDate,
              date,
              "end",
              date,
            );
            setStartDate(next.from);
            setEndDate(next.to);
          } else {
            setEndDate(date);
          }
        }
        setFilterError(null);
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

  const draftStatusLabel = draftStatus
    ? formatInvoiceStatus(draftStatus)
    : "All statuses";

  const pickerValue =
    iosPickerDraft ??
    (pickerTarget === "start"
      ? (startDate ?? endDate ?? today)
      : (endDate ?? startDate ?? today));
  const pickerMaximumDate =
    pickerTarget === "end"
      ? today
      : pickerTarget === "start"
        ? endDate && endDate < today
          ? endDate
          : today
        : today;
  const pickerMinimumDate =
    pickerTarget === "end" ? (startDate ?? undefined) : undefined;

  const summaryCards = useMemo(() => {
    if (!summary) {
      return [];
    }

    return [
      {
        key: "outstanding",
        label: "Outstanding",
        value: formatInvoiceAmount(summary.outstanding_total),
        accent: themeColors.primary,
        background: paperTheme.colors.primaryContainer,
        textColor: paperTheme.colors.onPrimaryContainer,
      },
      {
        key: "overdue",
        label: "Overdue",
        value: formatInvoiceAmount(summary.overdue_total),
        accent: paperTheme.colors.error,
        background: paperTheme.colors.errorContainer,
        textColor: paperTheme.colors.onErrorContainer,
      },
      {
        key: "paid_ytd",
        label: "Paid (YTD)",
        value: formatInvoiceAmount(summary.paid_total_ytd),
        accent: themeColors.success,
        background: themeColors.successContainer,
        textColor: themeColors.onSuccessContainer,
      },
    ];
  }, [summary, themeColors, paperTheme.colors]);

  const toggleExpanded = useCallback((invoiceId: number) => {
    setExpandedInvoiceId((current) =>
      current === invoiceId ? null : invoiceId,
    );
  }, []);

  const renderInvoice = useCallback(
    ({ item }: { item: Invoice }) => {
      const isExpanded = expandedInvoiceId === item.id;
      const currency = getInvoiceCurrency(item);
      const paid = getInvoicePaid(item);
      const balance = getInvoiceBalance(item);
      const subtitle = getInvoiceSubtitle(item);
      const lineItems = item.items ?? [];
      const statusColors = getInvoiceStatusColors(item.status, {
        successContainer: themeColors.successContainer,
        onSuccessContainer: themeColors.onSuccessContainer,
        errorContainer: paperTheme.colors.errorContainer,
        onErrorContainer: paperTheme.colors.onErrorContainer,
        tertiaryContainer: themeColors.tertiaryContainer,
        onTertiaryContainer: themeColors.onTertiaryContainer,
        primaryContainer: paperTheme.colors.primaryContainer,
        onPrimaryContainer: paperTheme.colors.onPrimaryContainer,
        secondaryContainer: themeColors.secondaryContainer,
        onSecondaryContainer: themeColors.onSecondaryContainer,
        surfaceVariant: paperTheme.colors.surfaceVariant,
        onSurfaceVariant: paperTheme.colors.onSurfaceVariant,
      });

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
                style={[
                  financeStyles.recordTitle,
                  { color: paperTheme.colors.onSurface },
                ]}
              >
                {item.invoice_number}
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
                { backgroundColor: statusColors.background },
              ]}
            >
              <Text
                style={[financeStyles.statusText, { color: statusColors.text }]}
              >
                {formatInvoiceStatus(item.status)}
              </Text>
            </View>
          </View>

          <Text
            style={[
              financeStyles.recordMeta,
              { color: paperTheme.colors.onSurfaceVariant },
            ]}
          >
            Issued {formatInvoiceDate(item.issued_at)} · Due{" "}
            {formatInvoiceDate(item.due_date)}
            {item.paid_at ? ` · Paid ${formatInvoiceDate(item.paid_at)}` : ""}
          </Text>

          <View style={financeStyles.amountBlock}>
            <AmountRow
              label="Total"
              value={formatInvoiceAmount(item.total, currency)}
              labelColor={paperTheme.colors.onSurfaceVariant}
              valueColor={paperTheme.colors.onSurface}
            />
            <AmountRow
              label="Paid"
              value={formatInvoiceAmount(paid, currency)}
              labelColor={paperTheme.colors.onSurfaceVariant}
              valueColor={themeColors.success}
            />
            {balance > 0 ? (
              <AmountRow
                label="Balance"
                value={formatInvoiceAmount(balance, currency)}
                labelColor={paperTheme.colors.onSurface}
                valueColor={paperTheme.colors.error}
                emphasized
              />
            ) : null}
          </View>

          {lineItems.length > 0 ? (
            <>
              <TouchableOpacity
                style={financeStyles.itemsToggle}
                onPress={() => toggleExpanded(item.id)}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    financeStyles.itemsToggleText,
                    { color: paperTheme.colors.primary },
                  ]}
                >
                  {isExpanded
                    ? "Hide items"
                    : `View ${lineItems.length} item${lineItems.length === 1 ? "" : "s"}`}
                </Text>
                <Ionicons
                  name={isExpanded ? "chevron-up" : "chevron-down"}
                  size={18}
                  color={paperTheme.colors.primary}
                />
              </TouchableOpacity>

              {isExpanded ? (
                <View
                  style={[
                    financeStyles.itemsList,
                    { borderTopColor: paperTheme.colors.outline },
                  ]}
                >
                  {lineItems.map((line, index) => (
                    <View
                      key={`${item.id}-${index}`}
                      style={[
                        financeStyles.itemRow,
                        index < lineItems.length - 1 && {
                          borderBottomColor: paperTheme.colors.outline,
                          borderBottomWidth: StyleSheet.hairlineWidth,
                        },
                      ]}
                    >
                      <View style={financeStyles.itemMain}>
                        <Text
                          style={[
                            financeStyles.itemDescription,
                            { color: paperTheme.colors.onSurface },
                          ]}
                        >
                          {line.description}
                        </Text>
                        <Text
                          style={[
                            financeStyles.itemQty,
                            { color: paperTheme.colors.onSurfaceVariant },
                          ]}
                        >
                          Qty {line.quantity} ×{" "}
                          {formatInvoiceAmount(line.unit_price, currency)}
                        </Text>
                      </View>
                      <Text
                        style={[
                          financeStyles.itemAmount,
                          { color: paperTheme.colors.onSurface },
                        ]}
                      >
                        {formatInvoiceAmount(line.amount, currency)}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </>
          ) : null}
        </View>
      );
    },
    [expandedInvoiceId, paperTheme.colors, themeColors, toggleExpanded],
  );

  const listHeader = (
    <View style={financeStyles.tabListHeader}>
      {!hasStudent ? (
        <Text
          style={[
            financeStyles.hintText,
            { color: paperTheme.colors.onSurfaceVariant },
          ]}
        >
          Select a student to view invoices.
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
            style={[
              financeStyles.filterTitle,
              { color: paperTheme.colors.onSurface },
            ]}
          >
            Filter invoices
          </Text>

          <TouchableOpacity
            style={[
              financeStyles.statusField,
              {
                borderColor: paperTheme.colors.outline,
                backgroundColor: paperTheme.colors.surfaceVariant,
              },
            ]}
            onPress={() => setStatusPickerVisible(true)}
            activeOpacity={0.85}
          >
            <Text
              style={[
                uiStyles.dateFieldLabel,
                { color: paperTheme.colors.onSurfaceVariant },
              ]}
            >
              Status
            </Text>
            <View style={uiStyles.dateFieldRow}>
              <Text
                style={[
                  uiStyles.dateFieldValue,
                  { color: paperTheme.colors.onSurface },
                ]}
              >
                {draftStatusLabel}
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
            <Text
              style={[
                financeStyles.filterError,
                { color: paperTheme.colors.error },
              ]}
            >
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
              <Ionicons
                name="search"
                size={18}
                color={paperTheme.colors.onPrimary}
              />
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
                appliedFilters.status
                  ? formatInvoiceStatus(appliedFilters.status)
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

      {invoices.length > 0 ? (
        <Text
          style={[
            financeStyles.sectionTitle,
            { color: paperTheme.colors.onSurfaceVariant },
          ]}
        >
          Invoice history
          {meta ? ` · ${meta.total} invoices` : ""}
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
          style={[
            financeStyles.emptyText,
            { color: paperTheme.colors.onSurfaceVariant },
          ]}
        >
          {invoiceError ?? "No invoices found."}
        </Text>
      </View>
    ) : null;

  const listFooter = useMemo(() => {
    if (invoices.length === 0) {
      return <View style={financeStyles.footerSpacer} />;
    }

    const isLoadingMore =
      isLoading && invoices.length > 0 && pendingPageRef.current > 1;

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
            Loading more invoices…
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
              ? `All ${meta.total} invoice${meta.total === 1 ? "" : "s"} loaded`
              : "No more invoices to load"}
          </Text>
        </View>
      );
    }

    return <View style={financeStyles.footerSpacer} />;
  }, [
    invoices.length,
    isLoading,
    canLoadMore,
    meta?.total,
    paperTheme.colors,
  ]);

  return (
    <View style={tabStyles.container}>
      <Modal
        visible={isLoading && invoices.length === 0}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <View style={financeStyles.loadingOverlay}>
          <ActivityIndicator size="large" color={paperTheme.colors.primary} />
        </View>
      </Modal>

      <Modal
        visible={statusPickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setStatusPickerVisible(false)}
      >
        <Pressable
          style={financeStyles.pickerBackdrop}
          onPress={() => setStatusPickerVisible(false)}
        >
          <Pressable
            style={[
              financeStyles.pickerSheet,
              { backgroundColor: paperTheme.colors.surface },
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={financeStyles.pickerHeader}>
              <TouchableOpacity onPress={() => setStatusPickerVisible(false)}>
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
                style={[
                  financeStyles.pickerTitle,
                  { color: paperTheme.colors.onSurface },
                ]}
              >
                Status
              </Text>
              <View style={financeStyles.pickerAction} />
            </View>
            <ScrollView style={financeStyles.statusList}>
              <TouchableOpacity
                style={[
                  financeStyles.statusOption,
                  !draftStatus && {
                    backgroundColor: paperTheme.colors.primaryContainer,
                  },
                ]}
                onPress={() => {
                  setDraftStatus("");
                  setStatusPickerVisible(false);
                }}
              >
                <Text
                  style={[
                    financeStyles.statusOptionText,
                    { color: paperTheme.colors.onSurface },
                  ]}
                >
                  All statuses
                </Text>
              </TouchableOpacity>
              {INVOICE_FILTER_STATUSES.map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    financeStyles.statusOption,
                    draftStatus === status && {
                      backgroundColor: paperTheme.colors.primaryContainer,
                    },
                  ]}
                  onPress={() => {
                    setDraftStatus(status);
                    setStatusPickerVisible(false);
                  }}
                >
                  <Text
                    style={[
                      financeStyles.statusOptionText,
                      { color: paperTheme.colors.onSurface },
                    ]}
                  >
                    {formatInvoiceStatus(status)}
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
          <Pressable
            style={financeStyles.pickerBackdrop}
            onPress={cancelIosPicker}
          >
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
                  style={[
                    financeStyles.pickerTitle,
                    { color: paperTheme.colors.onSurface },
                  ]}
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
        data={invoices}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderInvoice}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={listEmpty}
        ListFooterComponent={listFooter}
        contentContainerStyle={financeStyles.listContent}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMoreInvoices}
        onEndReachedThreshold={0.35}
        refreshControl={
          <RefreshControl
            refreshing={
              isLoading && invoices.length > 0 && pendingPageRef.current === 1
            }
            onRefresh={() => void fetchInvoices(1)}
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

const tabStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
