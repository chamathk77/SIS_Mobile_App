import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { fonts } from "../../constants/fonts";
import { AppDispatch, RootState } from "../../store/store";
import { GetCalendarEvents_Service } from "../../services/CalendarService";
import {
  AppliedCalendarFilters,
  CALENDAR_EVENT_TYPES,
  CalendarEvent,
  CalendarEventType,
} from "../../type/calendar";
import { getToday } from "../../utils/attendanceHelpers";
import {
  filterEventsByMonth,
  formatCalendarDate,
  formatEventDateRange,
  formatEventTime,
  formatEventType,
  formatMonthYear,
  getCalendarLastPage,
  getEventIconForType,
  getEventTitle,
  getEventTypeColor,
  getMonthBounds,
  groupEventsByDate,
  isSchoolClosedEvent,
  resolveCalendarColor,
  resolveCalendarIcon,
  addMonths,
  toDateKey,
} from "../../utils/calendarHelpers";
import { uiStyles } from "./finance/FinanceUi";
import { financeStyles } from "./finance/financeStyles";

export default function CalendarScreen() {
  const { paperTheme, resolvedTheme } = useTheme();
  const dispatch = useDispatch<AppDispatch>();

  const selectedStudentId = useSelector(
    (state: RootState) => state.StudentDataReducer.SelectStudent.selectedStudentId,
  );
  const calendarPayload = useSelector(
    (state: RootState) => state.CalendarReducer.data,
  );
  const isLoading = useSelector(
    (state: RootState) => state.CalendarReducer.loading,
  );
  const calendarError = useSelector(
    (state: RootState) => state.CalendarReducer.error,
  );

  const hasStudent = Boolean(selectedStudentId?.trim());
  const allEvents = calendarPayload?.data ?? [];
  const meta = calendarPayload?.meta;
  const lastPage = getCalendarLastPage(meta);
  const canLoadMore = meta != null && meta.current_page < lastPage;

  const [currentMonth, setCurrentMonth] = useState(() => getToday());
  const [draftType, setDraftType] = useState<CalendarEventType | "">("");
  const [appliedFilters, setAppliedFilters] = useState<AppliedCalendarFilters>({});
  const [typePickerVisible, setTypePickerVisible] = useState(false);

  const appliedFiltersRef = useRef(appliedFilters);
  appliedFiltersRef.current = appliedFilters;
  const pendingPageRef = useRef(1);

  const monthYear = currentMonth.getFullYear();
  const monthIndex = currentMonth.getMonth();

  const monthRange = useMemo(() => {
    const { start, end } = getMonthBounds(monthYear, monthIndex);
    return { from: toDateKey(start), to: toDateKey(end) };
  }, [monthYear, monthIndex]);

  const fetchEvents = useCallback(
    async (page = 1, filters?: AppliedCalendarFilters) => {
      pendingPageRef.current = page;

      const id = selectedStudentId?.trim();
      if (!id) {
        return;
      }

      const activeFilters = filters ?? appliedFiltersRef.current;

      await dispatch(
        GetCalendarEvents_Service({
          student_id: String(id),
          page,
          from: monthRange.from,
          to: monthRange.to,
          ...(activeFilters.type ? { type: activeFilters.type } : {}),
        }),
      ).unwrap();
    },
    [dispatch, selectedStudentId, monthRange],
  );

  useFocusEffect(
    useCallback(() => {
      if (selectedStudentId?.trim()) {
        void fetchEvents(1);
      }
    }, [selectedStudentId, fetchEvents]),
  );

  useEffect(() => {
    if (hasStudent) {
      void fetchEvents(1);
    }
  }, [monthRange, hasStudent, fetchEvents]);

  const monthEvents = useMemo(
    () => filterEventsByMonth(allEvents, monthYear, monthIndex),
    [allEvents, monthYear, monthIndex],
  );

  const groupedEvents = useMemo(
    () => groupEventsByDate(monthEvents),
    [monthEvents],
  );

  const hasActiveFilters = Boolean(appliedFilters.type);

  const draftTypeLabel = draftType ? formatEventType(draftType) : "All types";

  const loadMoreEvents = useCallback(() => {
    if (!canLoadMore || isLoading || !hasStudent) {
      return;
    }
    void fetchEvents((meta?.current_page ?? 1) + 1);
  }, [canLoadMore, isLoading, hasStudent, meta?.current_page, fetchEvents]);

  const handlePrevMonth = () => {
    setCurrentMonth((prev) => addMonths(prev, -1));
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => addMonths(prev, 1));
  };

  const handleSearch = useCallback(() => {
    const filters: AppliedCalendarFilters = draftType ? { type: draftType } : {};
    setAppliedFilters(filters);
    void fetchEvents(1, filters);
  }, [draftType, fetchEvents]);

  const handleClearFilters = useCallback(() => {
    setDraftType("");
    setAppliedFilters({});
    void fetchEvents(1, {});
  }, [fetchEvents]);

  function renderEvent(event: CalendarEvent) {
    const color = resolveCalendarColor(event.color) ?? getEventTypeColor(event.type);
    const iconName = resolveCalendarIcon(event.icon) ?? getEventIconForType(event.type);

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
        <View style={[styles.eventAccent, { backgroundColor: color }]} />
        <View style={styles.eventBody}>
          <View style={styles.eventHeader}>
            <View
              style={[styles.eventIconWrap, { backgroundColor: `${color}22` }]}
            >
              <Ionicons name={iconName} size={18} color={color} />
            </View>
            <View style={styles.eventHeaderMain}>
              <Text style={[styles.eventName, { color }]}>
                {getEventTitle(event)}
              </Text>
              <Text
                style={[
                  styles.eventType,
                  { color: paperTheme.colors.onSurfaceVariant },
                ]}
              >
                {formatEventType(event.type)}
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
            {isSchoolClosedEvent(event) ? (
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
            {event.category ? (
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
                  {event.category
                    .split("_")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                    .join(" ")}
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
        visible={isLoading && allEvents.length === 0}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <View style={financeStyles.loadingOverlay}>
          <ActivityIndicator size="large" color={paperTheme.colors.primary} />
        </View>
      </Modal>

      <Modal
        visible={typePickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setTypePickerVisible(false)}
      >
        <Pressable
          style={financeStyles.pickerBackdrop}
          onPress={() => setTypePickerVisible(false)}
        >
          <Pressable
            style={[
              financeStyles.pickerSheet,
              { backgroundColor: paperTheme.colors.surface },
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={financeStyles.pickerHeader}>
              <TouchableOpacity onPress={() => setTypePickerVisible(false)}>
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
                Event type
              </Text>
              <View style={financeStyles.pickerAction} />
            </View>
            <ScrollView style={financeStyles.statusList}>
              <TouchableOpacity
                style={[
                  financeStyles.statusOption,
                  !draftType && {
                    backgroundColor: paperTheme.colors.primaryContainer,
                  },
                ]}
                onPress={() => {
                  setDraftType("");
                  setTypePickerVisible(false);
                }}
              >
                <Text
                  style={[
                    financeStyles.statusOptionText,
                    { color: paperTheme.colors.onSurface },
                  ]}
                >
                  All types
                </Text>
              </TouchableOpacity>
              {CALENDAR_EVENT_TYPES.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    financeStyles.statusOption,
                    draftType === type && {
                      backgroundColor: paperTheme.colors.primaryContainer,
                    },
                  ]}
                  onPress={() => {
                    setDraftType(type);
                    setTypePickerVisible(false);
                  }}
                >
                  <Text
                    style={[
                      financeStyles.statusOptionText,
                      { color: paperTheme.colors.onSurface },
                    ]}
                  >
                    {formatEventType(type)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Pressable>

        </Pressable>
      </Modal>

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
          refreshControl={
            <RefreshControl
              refreshing={isLoading && allEvents.length > 0 && pendingPageRef.current === 1}
              onRefresh={() => void fetchEvents(1)}
              tintColor={paperTheme.colors.primary}
            />
          }
          onScroll={({ nativeEvent }) => {
            const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
            const nearBottom =
              layoutMeasurement.height + contentOffset.y >= contentSize.height - 120;
            if (nearBottom) {
              loadMoreEvents();
            }
          }}
          scrollEventThrottle={400}
        >
          <Text style={[styles.screenTitle, { color: paperTheme.colors.onSurface }]}>
            Calendar
          </Text>

          {!hasStudent ? (
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
                  Filter events
                </Text>

                <TouchableOpacity
                  style={[
                    financeStyles.statusField,
                    {
                      borderColor: paperTheme.colors.outline,
                      backgroundColor: paperTheme.colors.surfaceVariant,
                    },
                  ]}
                  onPress={() => setTypePickerVisible(true)}
                  activeOpacity={0.85}
                >
                  <Text
                    style={[
                      uiStyles.dateFieldLabel,
                      { color: paperTheme.colors.onSurfaceVariant },
                    ]}
                  >
                    Event type
                  </Text>
                  <View style={uiStyles.dateFieldRow}>
                    <Text
                      style={[ 
                        uiStyles.dateFieldValue,
                        { color: paperTheme.colors.onSurface },
                      ]}
                    >
                      {draftTypeLabel}
                    </Text>
                    <Ionicons
                      name="chevron-down"
                      size={18}
                      color={paperTheme.colors.onSurfaceVariant}
                    />
                  </View>
                </TouchableOpacity>

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
                    {formatEventType(appliedFilters.type!)}
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
                    {calendarError ??
                      `No events for ${formatMonthYear(monthYear, monthIndex)}${hasActiveFilters ? " with these filters" : ""}.`}
                  </Text>
                </View>
              )}

              {canLoadMore && !isLoading ? (
                <View style={financeStyles.listFooter}>
                  <Text
                    style={[
                      financeStyles.listFooterLoadingText,
                      { color: paperTheme.colors.onSurfaceVariant },
                    ]}
                  >
                    Scroll for more events…
                  </Text>
                </View>
              ) : null}

              {!canLoadMore && allEvents.length > 0 && !isLoading ? (
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
                  {meta?.total != null ? (
                    <Text
                      style={[
                        financeStyles.listEndSubtitle,
                        { color: paperTheme.colors.onSurfaceVariant },
                      ]}
                    >
                      {meta.total} event{meta.total === 1 ? "" : "s"} loaded
                    </Text>
                  ) : null}
                </View>
              ) : null}

              {isLoading && allEvents.length > 0 && pendingPageRef.current > 1 ? (
                <View style={financeStyles.listFooter}>
                  <ActivityIndicator size="small" color={paperTheme.colors.primary} />
                </View>
              ) : null}
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
});
