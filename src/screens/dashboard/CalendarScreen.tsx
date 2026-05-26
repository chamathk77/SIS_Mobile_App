import React, { useCallback, useMemo, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { fonts } from "../../constants/fonts";
import { RootState } from "../../store/store";
import { DUMMY_CALENDAR } from "../../data/dummyCalendarData";
import { AppliedCalendarFilters, CalendarEvent } from "../../type/calendar";
import {
  applyAttendanceDateChange,
  formatDateForApi,
  getToday,
} from "../../utils/attendanceHelpers";
import {
  filterEventsByDateRange,
  filterEventsByMonth,
  formatCalendarDate,
  formatEventDateRange,
  formatEventTime,
  formatEventType,
  formatMonthYear,
  getEventIconName,
  groupEventsByDate,
  addMonths,
} from "../../utils/calendarHelpers";
import { DateField } from "./finance/FinanceUi";

type PickerTarget = "start" | "end" | null;

export default function CalendarScreen() {
  const { paperTheme, resolvedTheme } = useTheme();
  const today = useMemo(() => getToday(), []);

  const selectedStudentId = useSelector(
    (state: RootState) => state.StudentDataReducer.SelectStudent.selectedStudentId,
  );

  const showCalendar = Boolean(selectedStudentId?.trim()) || true;
  const allEvents = DUMMY_CALENDAR.events;

  const [currentMonth, setCurrentMonth] = useState(() => new Date(2026, 4, 1));
  const [draftFrom, setDraftFrom] = useState<Date | null>(null);
  const [draftTo, setDraftTo] = useState<Date | null>(null);
  const [appliedFilters, setAppliedFilters] = useState<AppliedCalendarFilters>({});
  const [filterError, setFilterError] = useState<string | null>(null);
  const [pickerTarget, setPickerTarget] = useState<PickerTarget>(null);
  const [iosPickerDraft, setIosPickerDraft] = useState<Date | null>(null);

  const monthYear = currentMonth.getFullYear();
  const monthIndex = currentMonth.getMonth();

  const monthEvents = useMemo(() => {
    const inMonth = filterEventsByMonth(allEvents, monthYear, monthIndex);
    return filterEventsByDateRange(
      inMonth,
      appliedFilters.from,
      appliedFilters.to,
    );
  }, [allEvents, monthYear, monthIndex, appliedFilters]);

  const groupedEvents = useMemo(
    () => groupEventsByDate(monthEvents),
    [monthEvents],
  );

  const hasActiveFilters = Boolean(appliedFilters.from || appliedFilters.to);

  const handlePrevMonth = () => {
    setCurrentMonth((prev) => addMonths(prev, -1));
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => addMonths(prev, 1));
  };

  const handleSearch = useCallback(() => {
    const hasStart = draftFrom != null;
    const hasEnd = draftTo != null;

    if (hasStart !== hasEnd) {
      setFilterError("Select both start and end date.");
      return;
    }

    if (hasStart && hasEnd && draftFrom! > draftTo!) {
      setFilterError("Start date must be on or before end date.");
      return;
    }

    if (hasStart && hasEnd && (draftFrom! > today || draftTo! > today)) {
      setFilterError("Dates cannot be in the future.");
      return;
    }

    setFilterError(null);
    setAppliedFilters(
      hasStart && hasEnd
        ? { from: formatDateForApi(draftFrom!), to: formatDateForApi(draftTo!) }
        : {},
    );
  }, [draftFrom, draftTo, today]);

  const handleClearFilters = useCallback(() => {
    setDraftFrom(null);
    setDraftTo(null);
    setAppliedFilters({});
    setFilterError(null);
  }, []);

  const openDatePicker = useCallback(
    (target: "start" | "end") => {
      setPickerTarget(target);
      setIosPickerDraft(
        target === "start" ? draftFrom ?? draftTo ?? today : draftTo ?? draftFrom ?? today,
      );
    },
    [draftFrom, draftTo, today],
  );

  const onPickerChange = useCallback(
    (event: DateTimePickerEvent, date?: Date) => {
      if (Platform.OS === "android") {
        setPickerTarget(null);
        if (event.type === "dismissed" || !date) {
          return;
        }
        if (pickerTarget === "start") {
          if (draftTo) {
            const next = applyAttendanceDateChange(date, draftTo, "start", date);
            setDraftFrom(next.from);
            setDraftTo(next.to);
          } else {
            setDraftFrom(date);
          }
        } else if (pickerTarget === "end") {
          if (draftFrom) {
            const next = applyAttendanceDateChange(draftFrom, date, "end", date);
            setDraftFrom(next.from);
            setDraftTo(next.to);
          } else {
            setDraftTo(date);
          }
        }
        setFilterError(null);
        return;
      }
      if (date) {
        setIosPickerDraft(date);
      }
    },
    [pickerTarget, draftFrom, draftTo],
  );

  const confirmIosPicker = useCallback(() => {
    if (iosPickerDraft && pickerTarget === "start") {
      if (draftTo) {
        const next = applyAttendanceDateChange(iosPickerDraft, draftTo, "start", iosPickerDraft);
        setDraftFrom(next.from);
        setDraftTo(next.to);
      } else {
        setDraftFrom(iosPickerDraft);
      }
      setFilterError(null);
    } else if (iosPickerDraft && pickerTarget === "end") {
      if (draftFrom) {
        const next = applyAttendanceDateChange(draftFrom, iosPickerDraft, "end", iosPickerDraft);
        setDraftFrom(next.from);
        setDraftTo(next.to);
      } else {
        setDraftTo(iosPickerDraft);
      }
      setFilterError(null);
    }
    setPickerTarget(null);
    setIosPickerDraft(null);
  }, [iosPickerDraft, pickerTarget, draftFrom, draftTo]);

  const cancelIosPicker = useCallback(() => {
    setPickerTarget(null);
    setIosPickerDraft(null);
  }, []);

  const pickerValue =
    iosPickerDraft ??
    (pickerTarget === "start"
      ? draftFrom ?? draftTo ?? today
      : draftTo ?? draftFrom ?? today);
  const pickerMaximumDate =
    pickerTarget === "end"
      ? today
      : pickerTarget === "start"
        ? draftTo && draftTo < today
          ? draftTo
          : today
        : today;
  const pickerMinimumDate = pickerTarget === "end" ? draftFrom ?? undefined : undefined;

  function renderEvent(event: CalendarEvent) {
    const iconName = getEventIconName(event.icon);

    return (
      <View
        key={event.id}
        style={[
          styles.eventCard,
          {
            backgroundColor: paperTheme.colors.surface,
            borderColor: paperTheme.colors.outline,
          },
        ]}
      >
        <View style={[styles.eventAccent, { backgroundColor: event.color }]} />
        <View style={styles.eventBody}>
          <View style={styles.eventHeader}>
            <View
              style={[
                styles.eventIconWrap,
                { backgroundColor: `${event.color}22` },
              ]}
            >
              <Ionicons name={iconName} size={18} color={event.color} />
            </View>
            <View style={styles.eventHeaderMain}>
              <Text style={[styles.eventName, { color: paperTheme.colors.onSurface }]}>
                {event.name}
              </Text>
              <Text
                style={[
                  styles.eventType,
                  { color: paperTheme.colors.onSurfaceVariant },
                ]}
              >
                {formatEventType(event.type)} · {event.category}
              </Text>
            </View>
          </View>

          <Text
            style={[styles.eventDateText, { color: paperTheme.colors.onSurface }]}
          >
            {formatEventDateRange(event)}
            {formatEventTime(event) ? ` · ${formatEventTime(event)}` : ""}
          </Text>

          {event.description ? (
            <Text
              style={[
                styles.eventDescription,
                { color: paperTheme.colors.onSurfaceVariant },
              ]}
            >
              {event.description}
            </Text>
          ) : null}

          <View style={styles.eventTags}>
            {event.is_all_day ? (
              <View
                style={[
                  styles.tag,
                  { backgroundColor: paperTheme.colors.surfaceVariant },
                ]}
              >
                <Text
                  style={[
                    styles.tagText,
                    { color: paperTheme.colors.onSurfaceVariant },
                  ]}
                >
                  All day
                </Text>
              </View>
            ) : null}
            {event.closes_school ? (
              <View
                style={[
                  styles.tag,
                  { backgroundColor: paperTheme.colors.errorContainer },
                ]}
              >
                <Text
                  style={[
                    styles.tagText,
                    { color: paperTheme.colors.onErrorContainer },
                  ]}
                >
                  School closed
                </Text>
              </View>
            ) : null}
            {event.is_recurring ? (
              <View
                style={[
                  styles.tag,
                  { backgroundColor: paperTheme.colors.primaryContainer },
                ]}
              >
                <Text
                  style={[
                    styles.tagText,
                    { color: paperTheme.colors.onPrimaryContainer },
                  ]}
                >
                  Recurring
                </Text>
              </View>
            ) : null}
          </View>

          {event.location ? (
            <View style={styles.locationRow}>
              <Ionicons
                name="location-outline"
                size={14}
                color={paperTheme.colors.onSurfaceVariant}
              />
              <Text
                style={[
                  styles.locationText,
                  { color: paperTheme.colors.onSurfaceVariant },
                ]}
              >
                {event.location}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    );
  }

  return (
    <>
      <Modal
        visible={pickerTarget != null && Platform.OS === "ios"}
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
                style={[styles.pickerTitle, { color: paperTheme.colors.onSurface }]}
              >
                {pickerTarget === "start" ? "Start date" : "End date"}
              </Text>
              <TouchableOpacity onPress={confirmIosPicker}>
                <Text
                  style={[styles.pickerAction, { color: paperTheme.colors.primary }]}
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
        style={[styles.safeArea, { backgroundColor: paperTheme.colors.background }]}
        edges={["top"]}
      >
        <StatusBar
          barStyle={resolvedTheme === "dark" ? "light-content" : "dark-content"}
          backgroundColor={paperTheme.colors.background}
          translucent={false}
        />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.screenTitle, { color: paperTheme.colors.onSurface }]}>
            Calendar
          </Text>

          {!showCalendar ? (
            <Text
              style={[styles.hintText, { color: paperTheme.colors.onSurfaceVariant }]}
            >
              Select a student to view calendar events.
            </Text>
          ) : (
            <>
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
                  style={[styles.filterTitle, { color: paperTheme.colors.onSurface }]}
                >
                  Filter by date range
                </Text>

                <View style={styles.dateRow}>
                  <DateField
                    label="From"
                    value={draftFrom}
                    onPress={() => openDatePicker("start")}
                    borderColor={paperTheme.colors.outline}
                    backgroundColor={paperTheme.colors.surfaceVariant}
                    labelColor={paperTheme.colors.onSurfaceVariant}
                    valueColor={paperTheme.colors.onSurface}
                  />
                  <DateField
                    label="To"
                    value={draftTo}
                    onPress={() => openDatePicker("end")}
                    borderColor={paperTheme.colors.outline}
                    backgroundColor={paperTheme.colors.surfaceVariant}
                    labelColor={paperTheme.colors.onSurfaceVariant}
                    valueColor={paperTheme.colors.onSurface}
                  />
                </View>

                {filterError ? (
                  <Text style={[styles.filterError, { color: paperTheme.colors.error }]}>
                    {filterError}
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

                  {hasActiveFilters ? (
                    <TouchableOpacity
                      style={[
                        styles.resetButton,
                        { borderColor: paperTheme.colors.outline },
                      ]}
                      onPress={handleClearFilters}
                      activeOpacity={0.85}
                    >
                      <Text
                        style={[
                          styles.resetButtonText,
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
                      styles.activeFiltersLabel,
                      { color: paperTheme.colors.onSurfaceVariant },
                    ]}
                  >
                    Showing {formatCalendarDate(appliedFilters.from!)} –{" "}
                    {formatCalendarDate(appliedFilters.to!)}
                  </Text>
                ) : null}
              </View>

              <View
                style={[
                  styles.monthNav,
                  {
                    backgroundColor: paperTheme.colors.surface,
                    borderColor: paperTheme.colors.outline,
                  },
                ]}
              >
                <TouchableOpacity
                  style={styles.monthArrow}
                  onPress={handlePrevMonth}
                  activeOpacity={0.85}
                  accessibilityLabel="Previous month"
                >
                  <Ionicons
                    name="chevron-back"
                    size={24}
                    color={paperTheme.colors.onSurface}
                  />
                </TouchableOpacity>

                <View style={styles.monthLabelWrap}>
                  <Text
                    style={[styles.monthLabel, { color: paperTheme.colors.onSurface }]}
                  >
                    {formatMonthYear(monthYear, monthIndex)}
                  </Text>
                  <Text
                    style={[
                      styles.monthCount,
                      { color: paperTheme.colors.onSurfaceVariant },
                    ]}
                  >
                    {monthEvents.length} event{monthEvents.length === 1 ? "" : "s"}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.monthArrow}
                  onPress={handleNextMonth}
                  activeOpacity={0.85}
                  accessibilityLabel="Next month"
                >
                  <Ionicons
                    name="chevron-forward"
                    size={24}
                    color={paperTheme.colors.onSurface}
                  />
                </TouchableOpacity>
              </View>

              {groupedEvents.length > 0 ? (
                groupedEvents.map((group) => (
                  <View key={group.date} style={styles.dayGroup}>
                    <Text
                      style={[
                        styles.dayGroupTitle,
                        { color: paperTheme.colors.onSurfaceVariant },
                      ]}
                    >
                      {formatCalendarDate(group.date)}
                    </Text>
                    {group.events.map(renderEvent)}
                  </View>
                ))
              ) : (
                <View
                  style={[
                    styles.emptyCard,
                    { backgroundColor: paperTheme.colors.surfaceVariant },
                  ]}
                >
                  <Ionicons
                    name="calendar-outline"
                    size={32}
                    color={paperTheme.colors.onSurfaceVariant}
                  />
                  <Text
                    style={[
                      styles.emptyText,
                      { color: paperTheme.colors.onSurfaceVariant },
                    ]}
                  >
                    No events for {formatMonthYear(monthYear, monthIndex)}
                    {hasActiveFilters ? " in this date range" : ""}.
                  </Text>
                </View>
              )}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
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
  },
  filterCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
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
  filterError: {
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
  activeFiltersLabel: {
    fontFamily: fonts.InterRegular,
    fontSize: 12,
    lineHeight: 16,
  },
  monthNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginBottom: 20,
  },
  monthArrow: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  monthLabelWrap: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  monthLabel: {
    fontFamily: fonts.PoppinsSemiBold,
    fontSize: 18,
    lineHeight: 24,
  },
  monthCount: {
    fontFamily: fonts.InterRegular,
    fontSize: 12,
    lineHeight: 16,
  },
  dayGroup: {
    marginBottom: 16,
    gap: 8,
  },
  dayGroupTitle: {
    fontFamily: fonts.PoppinsMedium,
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  eventCard: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: 14,
    overflow: "hidden",
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
  eventAccent: {
    width: 4,
  },
  eventBody: {
    flex: 1,
    padding: 12,
    gap: 8,
  },
  eventHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  eventIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  eventHeaderMain: {
    flex: 1,
    gap: 2,
  },
  eventName: {
    fontFamily: fonts.PoppinsSemiBold,
    fontSize: 15,
    lineHeight: 20,
  },
  eventType: {
    fontFamily: fonts.InterRegular,
    fontSize: 11,
    lineHeight: 14,
    textTransform: "capitalize",
  },
  eventDateText: {
    fontFamily: fonts.PoppinsMedium,
    fontSize: 13,
    lineHeight: 18,
  },
  eventDescription: {
    fontFamily: fonts.InterRegular,
    fontSize: 12,
    lineHeight: 16,
  },
  eventTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  tag: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tagText: {
    fontFamily: fonts.PoppinsSemiBold,
    fontSize: 10,
    lineHeight: 12,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  locationText: {
    fontFamily: fonts.InterRegular,
    fontSize: 12,
    lineHeight: 16,
  },
  emptyCard: {
    borderRadius: 14,
    padding: 28,
    alignItems: "center",
    gap: 12,
  },
  emptyText: {
    fontFamily: fonts.InterRegular,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
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
    minWidth: 60,
  },
});
