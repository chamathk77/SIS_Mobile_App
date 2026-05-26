import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { useFocusEffect } from "@react-navigation/native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { fonts } from "../../constants/fonts";
import { AppDispatch, RootState } from "../../store/store";
import { GetAttendance_Service } from "../../services/AttendanceService";
import { AttendanceRecord } from "../../type/attendance";
import {
  applyAttendanceDateChange,
  AttendanceDateRange,
  formatAttendanceDate,
  formatAttendanceStatus,
  formatDateForApi,
  formatDateForDisplay,
  formatDateRangeLabel,
  getAttendanceStatusColors,
  getExcusedCount,
  getMonthDateRange,
  getToday,
  isSameDateRange,
} from "../../utils/attendanceHelpers";

type SummaryCardProps = {
  label: string;
  value: number;
  accent: string;
  surface: string;
  border: string;
  text: string;
  muted: string;
  icon: keyof typeof Ionicons.glyphMap;
  shareLabel?: string;
};

type PickerTarget = "start" | "end" | null;

function SummaryCard({
  label,
  value,
  accent,
  surface,
  border,
  text,
  muted,
  icon,
  shareLabel,
}: SummaryCardProps) {
  return (
    <View
      style={[
        styles.summaryCard,
        { backgroundColor: surface, borderColor: border },
      ]}
    >
      <View style={[styles.summaryIcon, { backgroundColor: `${accent}18` }]}>
        <Ionicons name={icon} size={13} color={accent} />
      </View>
      <View style={styles.summaryTextCol}>
        <View style={styles.summaryValueRow}>
          <Text style={[styles.summaryValue, { color: text }]}>{value}</Text>
          {shareLabel ? (
            <Text style={[styles.summaryShare, { color: accent }]}>
              {shareLabel}
            </Text>
          ) : null}
        </View>
        <Text style={[styles.summaryLabel, { color: muted }]} numberOfLines={1}>
          {label}
        </Text>
      </View>
    </View>
  );
}

function DateField({
  label,
  value,
  onPress,
  borderColor,
  backgroundColor,
  labelColor,
  valueColor,
}: {
  label: string;
  value: Date;
  onPress: () => void;
  borderColor: string;
  backgroundColor: string;
  labelColor: string;
  valueColor: string;
}) {
  return (
    <TouchableOpacity
      style={[styles.dateField, { borderColor, backgroundColor }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Text style={[styles.dateFieldLabel, { color: labelColor }]}>{label}</Text>
      <View style={styles.dateFieldRow}>
        <Text style={[styles.dateFieldValue, { color: valueColor }]}>
          {formatDateForDisplay(value)}
        </Text>
        <Ionicons name="calendar-outline" size={18} color={labelColor} />
      </View>
    </TouchableOpacity>
  );
}

export default function AttendanceScreen() {
  const { paperTheme, resolvedTheme } = useTheme();
  const dispatch = useDispatch<AppDispatch>();

  const today = useMemo(() => getToday(), []);
  const currentMonthRange = useMemo(() => getMonthDateRange(today), [today]);

  const selectedStudentId = useSelector(
    (state: RootState) => state.StudentDataReducer.SelectStudent.selectedStudentId,
  );
  const attendancePayload = useSelector(
    (state: RootState) => state.AttendanceReducer.data,
  );
  const isLoading = useSelector(
    (state: RootState) => state.AttendanceReducer.loading,
  );

  const [startDate, setStartDate] = useState(currentMonthRange.from);
  const [endDate, setEndDate] = useState(currentMonthRange.to);
  const [appliedRange, setAppliedRange] =
    useState<AttendanceDateRange>(currentMonthRange);
  const [pickerTarget, setPickerTarget] = useState<PickerTarget>(null);
  const [iosPickerDraft, setIosPickerDraft] = useState<Date | null>(null);
  const [rangeError, setRangeError] = useState<string | null>(null);

  const appliedRangeRef = useRef(appliedRange);
  appliedRangeRef.current = appliedRange;

  const attendanceData = attendancePayload?.data;
  const summary = attendanceData?.summary;
  const records = attendanceData?.records ?? [];
  const meta = attendanceData?.meta;

  const canLoadMore =
    meta != null && meta.current_page < meta.last_page;

  const isCustomRange = useMemo(
    () => !isSameDateRange(appliedRange, getMonthDateRange(new Date())),
    [appliedRange],
  );

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

  const fetchAttendance = useCallback(
    async (page = 1, range?: AttendanceDateRange) => {
      const id = selectedStudentId?.trim();
      if (!id) {
        return;
      }

      const activeRange = range ?? appliedRangeRef.current;
      await dispatch(
        GetAttendance_Service({
          student_id: String(id),
          page,
          from: formatDateForApi(activeRange.from),
          to: formatDateForApi(activeRange.to),
        }),
      ).unwrap();

    },
    [dispatch, selectedStudentId],
  );

  useFocusEffect(
    useCallback(() => {
      if (selectedStudentId?.trim()) {
        void fetchAttendance(1);
      }
    }, [selectedStudentId, fetchAttendance]),
  );

  const applyDateSelection = useCallback(
    (changed: "start" | "end", date: Date) => {
      const next = applyAttendanceDateChange(startDate, endDate, changed, date);
      setStartDate(next.from);
      setEndDate(next.to);
      setRangeError(null);
    },
    [startDate, endDate],
  );

  const handleSearch = useCallback(() => {
    const from = new Date(startDate);
    from.setHours(0, 0, 0, 0);
    const to = new Date(endDate);
    to.setHours(23, 59, 59, 999);

    if (from > today || to > today) {
      setRangeError("Dates cannot be in the future.");
      return;
    }

    if (from > to) {
      setRangeError("Start date must be on or before end date.");
      return;
    }

    setRangeError(null);
    const range = { from, to };
    setAppliedRange(range);
    void fetchAttendance(1, range);
  }, [startDate, endDate, fetchAttendance, today]);

  const handleResetToCurrentMonth = useCallback(() => {
    const range = getMonthDateRange(new Date());
    setStartDate(range.from);
    setEndDate(range.to);
    setAppliedRange(range);
    setRangeError(null);
    void fetchAttendance(1, range);
  }, [fetchAttendance]);

  const openPicker = useCallback((target: "start" | "end") => {
    setPickerTarget(target);
    setIosPickerDraft(target === "start" ? startDate : endDate);
  }, [startDate, endDate]);

  const onPickerChange = useCallback(
    (event: DateTimePickerEvent, date?: Date) => {
      if (Platform.OS === "android") {
        setPickerTarget(null);
        if (event.type === "dismissed" || !date) {
          return;
        }
        if (pickerTarget === "start" || pickerTarget === "end") {
          applyDateSelection(pickerTarget, date);
        }
        return;
      }

      if (date) {
        setIosPickerDraft(date);
      }
    },
    [pickerTarget, applyDateSelection],
  );

  const confirmIosPicker = useCallback(() => {
    if (iosPickerDraft && (pickerTarget === "start" || pickerTarget === "end")) {
      applyDateSelection(pickerTarget, iosPickerDraft);
    }
    setPickerTarget(null);
    setIosPickerDraft(null);
  }, [iosPickerDraft, pickerTarget, applyDateSelection]);

  const cancelIosPicker = useCallback(() => {
    setPickerTarget(null);
    setIosPickerDraft(null);
  }, []);

  const excusedCount = useMemo(
    () => (summary ? getExcusedCount(summary, records) : 0),
    [summary, records],
  );

  const formatShare = useCallback((count: number, total: number) => {
    if (total <= 0) {
      return undefined;
    }
    const pct = Math.round((count / total) * 100);
    return `${pct}%`;
  }, []);

  const summaryCards = useMemo(() => {
    if (!summary) {
      return [];
    }
    const total = summary.total > 0 ? summary.total : 0;
    const surface = paperTheme.colors.surface;
    const border = paperTheme.colors.outline;
    const text = paperTheme.colors.onSurface;
    const muted = paperTheme.colors.onSurfaceVariant;

    return [
      {
        key: "present",
        label: "Present",
        value: summary.present,
        icon: "checkmark-circle" as const,
        accent: themeColors.success,
        surface,
        border,
        text,
        muted,
        shareLabel: formatShare(summary.present, total),
      },
      {
        key: "absent",
        label: "Absent",
        value: summary.absent,
        icon: "close-circle" as const,
        accent: themeColors.error,
        surface,
        border,
        text,
        muted,
        shareLabel: formatShare(summary.absent, total),
      },
      {
        key: "late",
        label: "Late",
        value: summary.late,
        icon: "time" as const,
        accent: themeColors.tertiary,
        surface,
        border,
        text,
        muted,
        shareLabel: formatShare(summary.late, total),
      },
      {
        key: "excused",
        label: "Excused",
        value: excusedCount,
        icon: "document-text" as const,
        accent: themeColors.secondary,
        surface,
        border,
        text,
        muted,
        shareLabel: formatShare(excusedCount, total),
      },
    ];
  }, [summary, excusedCount, themeColors, formatShare, paperTheme.colors]);

  function renderRecord({ item }: { item: AttendanceRecord }) {
    const statusColors = getAttendanceStatusColors(item.status, {
      successContainer: themeColors.successContainer,
      onSuccessContainer: themeColors.onSuccessContainer,
      errorContainer: themeColors.errorContainer,
      onErrorContainer: themeColors.onErrorContainer,
      tertiaryContainer: themeColors.tertiaryContainer,
      onTertiaryContainer: themeColors.onTertiaryContainer,
      secondaryContainer: themeColors.secondaryContainer,
      onSecondaryContainer: themeColors.onSecondaryContainer,
      surfaceVariant: paperTheme.colors.surfaceVariant,
      onSurfaceVariant: paperTheme.colors.onSurfaceVariant,
    });

    return (
      <View
        style={[
          styles.recordCard,
          {
            backgroundColor: paperTheme.colors.surface,
            borderColor: paperTheme.colors.outline,
          },
        ]}
      >
        <View style={styles.recordMain}>
          <Text style={[styles.recordDate, { color: paperTheme.colors.onSurface }]}>
            {formatAttendanceDate(item.date)}
          </Text>
          {item.remarks ? (
            <Text
              style={[
                styles.recordRemarks,
                { color: paperTheme.colors.onSurfaceVariant },
              ]}
              numberOfLines={2}
            >
              {item.remarks}
            </Text>
          ) : null}
        </View>
        <View
          style={[styles.statusBadge, { backgroundColor: statusColors.background }]}
        >
          <Text style={[styles.statusText, { color: statusColors.text }]}>
            {formatAttendanceStatus(item.status)}
          </Text>
        </View>
      </View>
    );
  }

  const listHeader = (
    <View style={styles.listHeader}>
      <Text style={[styles.screenTitle, { color: paperTheme.colors.onSurface }]}>
        Attendance
      </Text>

      {!selectedStudentId ? (
        <Text
          style={[
            styles.hintText,
            { color: paperTheme.colors.onSurfaceVariant },
          ]}
        >
          Select a student to view attendance.
        </Text>
      ) : (
        <View
          style={[
            styles.filterCard,
            {
              backgroundColor: paperTheme.colors.surface,
              borderColor: paperTheme.colors.outline,
            },
          ]}
        >
          <Text
            style={[
              styles.filterTitle,
              { color: paperTheme.colors.onSurface },
            ]}
          >
            Search by date
          </Text>

          <View style={styles.dateRow}>
            <DateField
              label="Start date"
              value={startDate}
              onPress={() => openPicker("start")}
              borderColor={paperTheme.colors.outline}
              backgroundColor={paperTheme.colors.surfaceVariant}
              labelColor={paperTheme.colors.onSurfaceVariant}
              valueColor={paperTheme.colors.onSurface}
            />
            <DateField
              label="End date"
              value={endDate}
              onPress={() => openPicker("end")}
              borderColor={paperTheme.colors.outline}
              backgroundColor={paperTheme.colors.surfaceVariant}
              labelColor={paperTheme.colors.onSurfaceVariant}
              valueColor={paperTheme.colors.onSurface}
            />
          </View>

          {rangeError ? (
            <Text style={[styles.rangeError, { color: paperTheme.colors.error }]}>
              {rangeError}
            </Text>
          ) : null}

          <View style={styles.filterActions}>
            <TouchableOpacity
              style={[
                styles.searchButton,
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
                  styles.searchButtonText,
                  { color: paperTheme.colors.onPrimary },
                ]}
              >
                Search
              </Text>
            </TouchableOpacity>

            {isCustomRange ? (
              <TouchableOpacity
                style={[
                  styles.resetButton,
                  { borderColor: paperTheme.colors.outline },
                ]}
                onPress={handleResetToCurrentMonth}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.resetButtonText,
                    { color: paperTheme.colors.onSurface },
                  ]}
                >
                  This month
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>

          <Text
            style={[
              styles.periodLabel,
              { color: paperTheme.colors.onSurfaceVariant },
            ]}
          >
            {isCustomRange
              ? `Showing ${formatDateRangeLabel(appliedRange)}`
              : `Showing current month · ${formatDateRangeLabel(appliedRange)}`}
          </Text>
        </View>
      )}

      {summary ? (
        <View
          style={[
            styles.summaryWrap,
            {
              backgroundColor: paperTheme.colors.surfaceVariant,
              borderColor: paperTheme.colors.outline,
            },
          ]}
        >
          <View style={styles.summaryHeader}>
            <Text
              style={[
                styles.summaryHeaderTitle,
                { color: paperTheme.colors.onSurface },
              ]}
            >
              Summary
            </Text>
            <Text
              style={[
                styles.summaryHeaderMeta,
                { color: paperTheme.colors.onSurfaceVariant },
              ]}
            >
              {summary.total} days
            </Text>
          </View>
          <View style={styles.summaryGrid}>
            {summaryCards.map(({ key, ...card }) => (
              <SummaryCard key={key} {...card} />
            ))}
          </View>
        </View>
      ) : null}

      {records.length > 0 ? (
        <Text
          style={[
            styles.sectionTitle,
            { color: paperTheme.colors.onSurfaceVariant },
          ]}
        >
          Attendance history
          {meta ? ` · ${meta.total} records` : ""}
        </Text>
      ) : null}
    </View>
  );

  const listEmpty =
    !isLoading && selectedStudentId ? (
      <View
        style={[
          styles.emptyCard,
          { backgroundColor: paperTheme.colors.surfaceVariant },
        ]}
      >
        <Text
          style={[
            styles.emptyText,
            { color: paperTheme.colors.onSurfaceVariant },
          ]}
        >
          No attendance records found for this period.
        </Text>
      </View>
    ) : null;

  const listFooter =
    canLoadMore && !isLoading ? (
      <TouchableOpacity
        style={[
          styles.loadMoreButton,
          {
            backgroundColor: paperTheme.colors.primary,
            borderColor: paperTheme.colors.primary,
          },
        ]}
        activeOpacity={0.85}
        onPress={() => void fetchAttendance((meta?.current_page ?? 1) + 1)}
      >
        <Text style={[styles.loadMoreText, { color: paperTheme.colors.onPrimary }]}>
          Load more
        </Text>
      </TouchableOpacity>
    ) : (
      <View style={styles.footerSpacer} />
    );

  const pickerValue =
    iosPickerDraft ?? (pickerTarget === "start" ? startDate : endDate);
  const pickerMaximumDate =
    pickerTarget === "end"
      ? today
      : pickerTarget === "start"
        ? endDate > today
          ? today
          : endDate
        : today;
  const pickerMinimumDate = pickerTarget === "end" ? startDate : undefined;

  return (
    <>
      <Modal
        visible={isLoading && records.length === 0}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={paperTheme.colors.primary} />
        </View>
      </Modal>

      {Platform.OS === "ios" ? (
        <Modal
          visible={pickerTarget != null}
          transparent
          animationType="slide"
          onRequestClose={cancelIosPicker}
        >
          <Pressable style={styles.pickerBackdrop} onPress={cancelIosPicker}>
            <Pressable
              style={[
                styles.pickerSheet,
                { backgroundColor: paperTheme.colors.surface },
              ]}
              onPress={(e) => e.stopPropagation()}
            >
              <View style={styles.pickerHeader}>
                <TouchableOpacity onPress={cancelIosPicker}>
                  <Text
                    style={[
                      styles.pickerAction,
                      { color: paperTheme.colors.onSurfaceVariant },
                    ]}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>
                <Text
                  style={[
                    styles.pickerTitle,
                    { color: paperTheme.colors.onSurface },
                  ]}
                >
                  {pickerTarget === "start" ? "Start date" : "End date"}
                </Text>
                <TouchableOpacity onPress={confirmIosPicker}>
                  <Text
                    style={[
                      styles.pickerAction,
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

      <SafeAreaView
        style={[
          styles.safeArea,
          { backgroundColor: paperTheme.colors.background },
        ]}
        edges={["top"]}
      >
        <StatusBar
          barStyle={resolvedTheme === "dark" ? "light-content" : "dark-content"}
          backgroundColor={paperTheme.colors.background}
          translucent={false}
        />

        <FlatList
          data={records}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderRecord}
          ListHeaderComponent={listHeader}
          ListEmptyComponent={listEmpty}
          ListFooterComponent={listFooter}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isLoading && records.length > 0}
              onRefresh={() => void fetchAttendance(1)}
              tintColor={paperTheme.colors.primary}
            />
          }
        />

        {isLoading && records.length > 0 ? (
          <View style={styles.inlineLoader}>
            <ActivityIndicator size="small" color={paperTheme.colors.primary} />
          </View>
        ) : null}
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  listHeader: {
    paddingTop: 16,
    paddingBottom: 8,
  },
  screenTitle: {
    fontFamily: fonts.PoppinsBold,
    fontSize: 28,
    lineHeight: 34,
    marginBottom: 16,
  },
  hintText: {
    fontFamily: fonts.InterRegular,
    fontSize: 14,
    marginBottom: 16,
  },
  filterCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
    gap: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
    }),
  },
  filterTitle: {
    fontFamily: fonts.PoppinsSemiBold,
    fontSize: 15,
    lineHeight: 20,
  },
  dateRow: {
    flexDirection: "row",
    gap: 10,
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
  rangeError: {
    fontFamily: fonts.InterRegular,
    fontSize: 12,
    lineHeight: 16,
  },
  filterActions: {
    flexDirection: "row",
    gap: 10,
  },
  searchButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 12,
    paddingVertical: 12,
  },
  searchButtonText: {
    fontFamily: fonts.PoppinsSemiBold,
    fontSize: 14,
    lineHeight: 18,
  },
  resetButton: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: "center",
  },
  resetButtonText: {
    fontFamily: fonts.PoppinsSemiBold,
    fontSize: 14,
    lineHeight: 18,
  },
  periodLabel: {
    fontFamily: fonts.InterRegular,
    fontSize: 12,
    lineHeight: 16,
  },
  summaryWrap: {
    marginBottom: 16,
    borderWidth: 1,
    borderRadius: 12,
    padding: 8,
    gap: 6,
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 2,
  },
  summaryHeaderTitle: {
    fontFamily: fonts.PoppinsSemiBold,
    fontSize: 12,
    lineHeight: 16,
  },
  summaryHeaderMeta: {
    fontFamily: fonts.InterRegular,
    fontSize: 11,
    lineHeight: 14,
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  summaryCard: {
    width: "48%",
    flexGrow: 1,
    flexBasis: "46%",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 7,
    paddingHorizontal: 8,
  },
  summaryIcon: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryTextCol: {
    flex: 1,
    gap: 1,
  },
  summaryValueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  summaryValue: {
    fontFamily: fonts.PoppinsBold,
    fontSize: 17,
    lineHeight: 20,
  },
  summaryShare: {
    fontFamily: fonts.PoppinsMedium,
    fontSize: 10,
    lineHeight: 12,
  },
  summaryLabel: {
    fontFamily: fonts.InterRegular,
    fontSize: 10,
    lineHeight: 12,
  },
  sectionTitle: {
    marginBottom: 10,
    fontFamily: fonts.PoppinsMedium,
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  recordCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 10,
    gap: 12,
  },
  recordMain: {
    flex: 1,
  },
  recordDate: {
    fontFamily: fonts.PoppinsSemiBold,
    fontSize: 15,
    lineHeight: 20,
  },
  recordRemarks: {
    marginTop: 4,
    fontFamily: fonts.InterRegular,
    fontSize: 12,
    lineHeight: 16,
  },
  statusBadge: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statusText: {
    fontFamily: fonts.PoppinsSemiBold,
    fontSize: 12,
    lineHeight: 16,
  },
  emptyCard: {
    borderRadius: 14,
    padding: 20,
    marginTop: 8,
  },
  emptyText: {
    fontFamily: fonts.InterRegular,
    fontSize: 14,
    textAlign: "center",
  },
  loadMoreButton: {
    marginTop: 8,
    marginBottom: 16,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
  },
  loadMoreText: {
    fontFamily: fonts.PoppinsSemiBold,
    fontSize: 14,
    letterSpacing: 0.5,
  },
  footerSpacer: {
    height: 16,
  },
  loadingOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.35)",
  },
  inlineLoader: {
    position: "absolute",
    bottom: 24,
    alignSelf: "center",
    padding: 10,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.9)",
  },
  pickerBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  pickerSheet: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: Platform.OS === "ios" ? 24 : 0,
  },
  pickerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(128,128,128,0.3)",
  },
  pickerTitle: {
    fontFamily: fonts.PoppinsSemiBold,
    fontSize: 15,
  },
  pickerAction: {
    fontFamily: fonts.PoppinsMedium,
    fontSize: 15,
  },
});
