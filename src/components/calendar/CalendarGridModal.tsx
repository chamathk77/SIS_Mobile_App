import React, { useMemo, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MD3Theme } from "react-native-paper";
import { fonts } from "../../constants/fonts";
import { CalendarEvent } from "../../type/calendar";
import {
  CALENDAR_WEEKDAY_LABELS,
  addMonths,
  buildEventsByDateMap,
  buildMonthGrid,
  filterEventsByMonth,
  formatCalendarDate,
  formatEventTime,
  formatEventType,
  getEventTitle,
  getPrimaryEventColor,
  getEventIconForType,
  resolveCalendarIcon,
  formatMonthYear,
  toDateKey,
} from "../../utils/calendarHelpers";

type CalendarGridModalProps = {
  visible: boolean;
  onClose: () => void;
  events: CalendarEvent[];
  month: Date;
  onMonthChange: (month: Date) => void;
  theme: MD3Theme;
};

export default function CalendarGridModal({
  visible,
  onClose,
  events,
  month,
  onMonthChange,
  theme,
}: CalendarGridModalProps) {
  const todayKey = toDateKey(new Date());
  const monthYear = month.getFullYear();
  const monthIndex = month.getMonth();

  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);

  const monthEvents = useMemo(
    () => filterEventsByMonth(events, monthYear, monthIndex),
    [events, monthYear, monthIndex],
  );

  const eventsByDate = useMemo(
    () => buildEventsByDateMap(monthEvents),
    [monthEvents],
  );

  const gridCells = useMemo(
    () => buildMonthGrid(monthYear, monthIndex),
    [monthYear, monthIndex],
  );

  const selectedEvents = selectedDateKey
    ? (eventsByDate.get(selectedDateKey) ?? [])
    : [];

  React.useEffect(() => {
    if (!visible) {
      setSelectedDateKey(null);
      return;
    }

    const cells = buildMonthGrid(monthYear, monthIndex);
    const byDate = buildEventsByDateMap(filterEventsByMonth(events, monthYear, monthIndex));
    const defaultKey =
      cells.find((cell) => cell.inCurrentMonth && cell.dateKey === todayKey)?.dateKey ??
      cells.find((cell) => cell.inCurrentMonth && byDate.has(cell.dateKey))?.dateKey ??
      cells.find((cell) => cell.inCurrentMonth)?.dateKey ??
      null;

    setSelectedDateKey(defaultKey);
  }, [visible, monthYear, monthIndex, events, todayKey]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[styles.sheet, { backgroundColor: theme.colors.surface }]}
          onPress={(event) => event.stopPropagation()}
        >
          <View style={styles.handleWrap}>
            <View
              style={[styles.handle, { backgroundColor: theme.colors.outlineVariant }]}
            />
          </View>

          <View style={styles.header}>
            <View style={styles.headerTextWrap}>
              <Text style={[styles.title, { color: theme.colors.onSurface }]}>
                Month view
              </Text>
              <Text
                style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
              >
                Tap a date to see events
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.closeButton,
                { backgroundColor: theme.colors.surfaceVariant },
              ]}
              onPress={onClose}
              activeOpacity={0.85}
            >
              <Ionicons name="close" size={20} color={theme.colors.onSurface} />
            </TouchableOpacity>
          </View>

          <View
            style={[
              styles.monthNav,
              {
                backgroundColor: theme.colors.surfaceVariant,
                borderColor: theme.colors.outline,
              },
            ]}
          >
            <TouchableOpacity
              style={styles.monthArrow}
              onPress={() => onMonthChange(addMonths(month, -1))}
              activeOpacity={0.85}
            >
              <Ionicons name="chevron-back" size={22} color={theme.colors.onSurface} />
            </TouchableOpacity>
            <Text style={[styles.monthLabel, { color: theme.colors.onSurface }]}>
              {formatMonthYear(monthYear, monthIndex)}
            </Text>
            <TouchableOpacity
              style={styles.monthArrow}
              onPress={() => onMonthChange(addMonths(month, 1))}
              activeOpacity={0.85}
            >
              <Ionicons
                name="chevron-forward"
                size={22}
                color={theme.colors.onSurface}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.weekdayRow}>
            {CALENDAR_WEEKDAY_LABELS.map((label) => (
              <Text
                key={label}
                style={[styles.weekdayLabel, { color: theme.colors.onSurfaceVariant }]}
              >
                {label}
              </Text>
            ))}
          </View>

          <View style={styles.grid}>
            {gridCells.map((cell) => {
              const dayEvents = eventsByDate.get(cell.dateKey) ?? [];
              const hasEvents = dayEvents.length > 0;
              const isSelected = selectedDateKey === cell.dateKey;
              const isToday = cell.dateKey === todayKey;
              const accentColor = hasEvents
                ? getPrimaryEventColor(dayEvents[0])
                : theme.colors.primary;

              return (
                <TouchableOpacity
                  key={cell.dateKey}
                  style={styles.cell}
                  onPress={() => setSelectedDateKey(cell.dateKey)}
                  activeOpacity={0.75}
                >
                  <View
                    style={[
                      styles.cellInner,
                      hasEvents && {
                        backgroundColor: `${accentColor}18`,
                        borderColor: `${accentColor}55`,
                      },
                      isSelected && {
                        backgroundColor: theme.colors.primary,
                        borderColor: theme.colors.primary,
                      },
                      isToday && !isSelected && {
                        borderColor: theme.colors.primary,
                        borderWidth: 1.5,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.cellDay,
                        {
                          color: !cell.inCurrentMonth
                            ? theme.colors.outline
                            : isSelected
                              ? theme.colors.onPrimary
                              : theme.colors.onSurface,
                        },
                      ]}
                    >
                      {cell.day}
                    </Text>
                    {hasEvents ? (
                      <View style={styles.dotRow}>
                        {dayEvents.slice(0, 3).map((event) => {
                          const dotColor = getPrimaryEventColor(event);
                          return (
                            <View
                              key={event.id}
                              style={[
                                styles.dot,
                                {
                                  backgroundColor: isSelected
                                    ? theme.colors.onPrimary
                                    : dotColor,
                                },
                              ]}
                            />
                          );
                        })}
                      </View>
                    ) : (
                      <View style={styles.dotSpacer} />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={[styles.divider, { backgroundColor: theme.colors.outlineVariant }]} />

          <ScrollView
            style={styles.eventsScroll}
            contentContainerStyle={styles.eventsContent}
            showsVerticalScrollIndicator={false}
          >
            {selectedDateKey ? (
              <>
                <Text style={[styles.eventsTitle, { color: theme.colors.onSurface }]}>
                  {formatCalendarDate(selectedDateKey)}
                </Text>
                {selectedEvents.length > 0 ? (
                  selectedEvents.map((event) => {
                    const color = getPrimaryEventColor(event);
                    const iconName =
                      resolveCalendarIcon(event.icon) ??
                      getEventIconForType(event.type);

                    return (
                      <View
                        key={event.id}
                        style={[
                          styles.eventRow,
                          {
                            backgroundColor: theme.colors.surfaceVariant,
                            borderColor: theme.colors.outline,
                          },
                        ]}
                      >
                        <View
                          style={[styles.eventDot, { backgroundColor: color }]}
                        />
                        <View style={styles.eventIconWrap}>
                          <Ionicons name={iconName} size={16} color={color} />
                        </View>
                        <View style={styles.eventCopy}>
                          <Text
                            style={[styles.eventName, { color: theme.colors.onSurface }]}
                            numberOfLines={2}
                          >
                            {getEventTitle(event)}
                          </Text>
                          <Text
                            style={[
                              styles.eventMeta,
                              { color: theme.colors.onSurfaceVariant },
                            ]}
                          >
                            {formatEventType(event.type)}
                            {formatEventTime(event)
                              ? ` · ${formatEventTime(event)}`
                              : event.is_all_day
                                ? " · All day"
                                : ""}
                          </Text>
                        </View>
                      </View>
                    );
                  })
                ) : (
                  <Text
                    style={[
                      styles.emptyEvents,
                      { color: theme.colors.onSurfaceVariant },
                    ]}
                  >
                    No events on this date.
                  </Text>
                )}
              </>
            ) : null}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "92%",
    paddingBottom: Platform.OS === "ios" ? 28 : 20,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
      },
      android: { elevation: 12 },
    }),
  },
  handleWrap: {
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 4,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 12,
  },
  headerTextWrap: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: fonts.PoppinsBold,
    fontSize: 20,
    lineHeight: 26,
  },
  subtitle: {
    fontFamily: fonts.InterRegular,
    fontSize: 13,
    lineHeight: 18,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  monthNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  monthArrow: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  monthLabel: {
    fontFamily: fonts.PoppinsSemiBold,
    fontSize: 16,
    lineHeight: 22,
  },
  weekdayRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 6,
  },
  weekdayLabel: {
    flex: 1,
    textAlign: "center",
    fontFamily: fonts.PoppinsMedium,
    fontSize: 11,
    letterSpacing: 0.4,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 12,
  },
  cell: {
    width: `${100 / 7}%`,
    padding: 3,
  },
  cellInner: {
    minHeight: 46,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "transparent",
    gap: 4,
  },
  cellDay: {
    fontFamily: fonts.PoppinsSemiBold,
    fontSize: 14,
    lineHeight: 18,
  },
  dotRow: {
    flexDirection: "row",
    gap: 3,
    height: 5,
    alignItems: "center",
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  dotSpacer: {
    height: 5,
  },
  divider: {
    height: 1,
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 8,
  },
  eventsScroll: {
    maxHeight: 220,
  },
  eventsContent: {
    paddingHorizontal: 20,
    paddingBottom: 8,
    gap: 8,
  },
  eventsTitle: {
    fontFamily: fonts.PoppinsSemiBold,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  eventRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
  },
  eventDot: {
    width: 4,
    alignSelf: "stretch",
    borderRadius: 2,
  },
  eventIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  eventCopy: {
    flex: 1,
    gap: 2,
  },
  eventName: {
    fontFamily: fonts.PoppinsSemiBold,
    fontSize: 13,
    lineHeight: 18,
  },
  eventMeta: {
    fontFamily: fonts.InterRegular,
    fontSize: 11,
    lineHeight: 15,
  },
  emptyEvents: {
    fontFamily: fonts.InterRegular,
    fontSize: 13,
    lineHeight: 18,
  },
});
