import React, { useMemo, useState } from "react";
import {
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { fonts } from "../../constants/fonts";
import { RootState } from "../../store/store";
import { DUMMY_TIMETABLE } from "../../data/dummyTimetableData";
import { DayOfWeek, TimetableSlot } from "../../type/timetable";
import {
  formatDayFull,
  formatDayShort,
  formatPeriodTime,
  formatTimetableDate,
  formatTimetableWindow,
  getDaysWithSlots,
  getSlotsForDay,
  getSubjectColor,
} from "../../utils/timetableHelpers";

export default function TimeTableScreen() {
  const { paperTheme, resolvedTheme } = useTheme();

  const selectedStudentId = useSelector(
    (state: RootState) => state.StudentDataReducer.SelectStudent.selectedStudentId,
  );

  const timetable = DUMMY_TIMETABLE;
  const showTimetable = Boolean(selectedStudentId?.trim()) || true;

  const availableDays = useMemo(() => getDaysWithSlots(timetable), [timetable]);
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(
    availableDays[0] ?? "monday",
  );

  const daySlots = useMemo(
    () => getSlotsForDay(timetable, selectedDay),
    [timetable, selectedDay],
  );

  const specificOverrides = timetable.specific.filter(
    (slot) => slot.day_of_week === selectedDay,
  );

  function renderSlot(slot: TimetableSlot) {
    const isBreak = slot.period.is_break;
    const accent = isBreak
      ? paperTheme.colors.outline
      : getSubjectColor(slot.subject?.code);

    if (isBreak) {
      return (
        <View
          key={slot.id}
          style={[
            styles.breakCard,
            {
              backgroundColor: paperTheme.colors.surfaceVariant,
              borderColor: paperTheme.colors.outline,
            },
          ]}
        >
          <Ionicons
            name="cafe-outline"
            size={18}
            color={paperTheme.colors.onSurfaceVariant}
          />
          <View style={styles.breakContent}>
            <Text
              style={[styles.breakTitle, { color: paperTheme.colors.onSurface }]}
            >
              {slot.period.name}
            </Text>
            <Text
              style={[
                styles.breakTime,
                { color: paperTheme.colors.onSurfaceVariant },
              ]}
            >
              {formatPeriodTime(slot.period.start_time, slot.period.end_time)}
            </Text>
            {slot.notes ? (
              <Text
                style={[
                  styles.breakNotes,
                  { color: paperTheme.colors.onSurfaceVariant },
                ]}
              >
                {slot.notes}
              </Text>
            ) : null}
          </View>
        </View>
      );
    }

    return (
      <View
        key={slot.id}
        style={[
          styles.slotCard,
          {
            backgroundColor: paperTheme.colors.surface,
            borderColor: paperTheme.colors.outline,
          },
        ]}
      >
        <View style={[styles.slotAccent, { backgroundColor: accent }]} />

        <View style={styles.slotBody}>
          <View style={styles.slotHeader}>
            <View style={styles.slotHeaderMain}>
              <Text
                style={[styles.slotPeriod, { color: paperTheme.colors.onSurfaceVariant }]}
              >
                {slot.period.short_name} ·{" "}
                {formatPeriodTime(slot.period.start_time, slot.period.end_time)}
              </Text>
              <Text
                style={[styles.slotSubject, { color: paperTheme.colors.onSurface }]}
              >
                {slot.subject?.name ?? "—"}
              </Text>
              {slot.subject?.code ? (
                <Text
                  style={[
                    styles.slotCode,
                    { color: paperTheme.colors.onSurfaceVariant },
                  ]}
                >
                  {slot.subject.code}
                </Text>
              ) : null}
            </View>
            {slot.specific_date ? (
              <View
                style={[
                  styles.overrideBadge,
                  { backgroundColor: paperTheme.colors.tertiaryContainer },
                ]}
              >
                <Text
                  style={[
                    styles.overrideBadgeText,
                    { color: paperTheme.colors.onTertiaryContainer },
                  ]}
                >
                  Override
                </Text>
              </View>
            ) : null}
          </View>

          <View style={styles.slotMeta}>
            {slot.teacher ? (
              <View style={styles.metaRow}>
                <Ionicons
                  name="person-outline"
                  size={14}
                  color={paperTheme.colors.onSurfaceVariant}
                />
                <Text
                  style={[
                    styles.metaText,
                    { color: paperTheme.colors.onSurfaceVariant },
                  ]}
                >
                  {slot.teacher.name}
                </Text>
              </View>
            ) : null}
            {slot.room ? (
              <View style={styles.metaRow}>
                <Ionicons
                  name="location-outline"
                  size={14}
                  color={paperTheme.colors.onSurfaceVariant}
                />
                <Text
                  style={[
                    styles.metaText,
                    { color: paperTheme.colors.onSurfaceVariant },
                  ]}
                >
                  {slot.room}
                </Text>
              </View>
            ) : null}
          </View>

          {slot.notes ? (
            <Text
              style={[styles.slotNotes, { color: paperTheme.colors.onSurfaceVariant }]}
            >
              {slot.notes}
            </Text>
          ) : null}
        </View>
      </View>
    );
  }

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

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.screenTitle, { color: paperTheme.colors.onSurface }]}>
          Timetable
        </Text>

        {!showTimetable ? (
          <Text
            style={[styles.hintText, { color: paperTheme.colors.onSurfaceVariant }]}
          >
            Select a student to view timetable.
          </Text>
        ) : (
          <>
            <View
              style={[
                styles.classCard,
                {
                  backgroundColor: paperTheme.colors.primaryContainer,
                  borderColor: paperTheme.colors.primary,
                },
              ]}
            >
              <View style={styles.classCardMain}>
                <Text
                  style={[
                    styles.className,
                    { color: paperTheme.colors.onPrimaryContainer },
                  ]}
                >
                  {timetable.class.name}
                </Text>
                <Text
                  style={[
                    styles.classMeta,
                    { color: paperTheme.colors.onPrimaryContainer },
                  ]}
                >
                  {timetable.class.code} · {timetable.class.grade} ·{" "}
                  {timetable.class.academic_year}
                </Text>
              </View>
              <View
                style={[
                  styles.studentBadge,
                  { backgroundColor: paperTheme.colors.primary },
                ]}
              >
                <Ionicons
                  name="school-outline"
                  size={20}
                  color={paperTheme.colors.onPrimary}
                />
              </View>
            </View>

            <View
              style={[
                styles.windowCard,
                {
                  backgroundColor: paperTheme.colors.surface,
                  borderColor: paperTheme.colors.outline,
                },
              ]}
            >
              <Ionicons
                name="calendar-outline"
                size={18}
                color={paperTheme.colors.primary}
              />
              <Text
                style={[styles.windowText, { color: paperTheme.colors.onSurface }]}
              >
                Week of {formatTimetableWindow(timetable.window.from, timetable.window.to)}
              </Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.dayRow}
            >
              {availableDays.map((day) => {
                const isActive = selectedDay === day;
                return (
                  <TouchableOpacity
                    key={day}
                    style={[
                      styles.dayChip,
                      {
                        backgroundColor: isActive
                          ? paperTheme.colors.primary
                          : paperTheme.colors.surfaceVariant,
                        borderColor: isActive
                          ? paperTheme.colors.primary
                          : paperTheme.colors.outline,
                      },
                    ]}
                    onPress={() => setSelectedDay(day)}
                    activeOpacity={0.85}
                  >
                    <Text
                      style={[
                        styles.dayChipLabel,
                        {
                          color: isActive
                            ? paperTheme.colors.onPrimary
                            : paperTheme.colors.onSurfaceVariant,
                        },
                        isActive && styles.dayChipLabelActive,
                      ]}
                    >
                      {formatDayShort(day)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <Text
              style={[
                styles.sectionTitle,
                { color: paperTheme.colors.onSurfaceVariant },
              ]}
            >
              {formatDayFull(selectedDay)} schedule · {daySlots.length} periods
            </Text>

            {specificOverrides.length > 0 ? (
              <View
                style={[
                  styles.overrideBanner,
                  { backgroundColor: paperTheme.colors.tertiaryContainer },
                ]}
              >
                <Ionicons
                  name="information-circle-outline"
                  size={18}
                  color={paperTheme.colors.onTertiaryContainer}
                />
                <Text
                  style={[
                    styles.overrideBannerText,
                    { color: paperTheme.colors.onTertiaryContainer },
                  ]}
                >
                  {specificOverrides.length} date-specific change
                  {specificOverrides.length === 1 ? "" : "s"} this week
                </Text>
              </View>
            ) : null}

            {daySlots.length > 0 ? (
              <View style={styles.slotsList}>{daySlots.map(renderSlot)}</View>
            ) : (
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
                  No periods scheduled for {formatDayFull(selectedDay)}.
                </Text>
              </View>
            )}

            {timetable.specific.length > 0 ? (
              <View style={styles.specificSection}>
                <Text
                  style={[
                    styles.specificTitle,
                    { color: paperTheme.colors.onSurface },
                  ]}
                >
                  This week's changes
                </Text>
                {timetable.specific.map((slot) => (
                  <View
                    key={`specific-${slot.id}`}
                    style={[
                      styles.specificItem,
                      {
                        backgroundColor: paperTheme.colors.surface,
                        borderColor: paperTheme.colors.outline,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.specificDate,
                        { color: paperTheme.colors.primary },
                      ]}
                    >
                      {formatTimetableDate(slot.specific_date ?? "")}
                    </Text>
                    <Text
                      style={[
                        styles.specificDetail,
                        { color: paperTheme.colors.onSurface },
                      ]}
                    >
                      {slot.period.name}: {slot.subject?.name} · {slot.room}
                    </Text>
                    {slot.notes ? (
                      <Text
                        style={[
                          styles.specificNotes,
                          { color: paperTheme.colors.onSurfaceVariant },
                        ]}
                      >
                        {slot.notes}
                      </Text>
                    ) : null}
                  </View>
                ))}
              </View>
            ) : null}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
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
  classCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    gap: 12,
  },
  classCardMain: {
    flex: 1,
    gap: 4,
  },
  className: {
    fontFamily: fonts.PoppinsSemiBold,
    fontSize: 17,
    lineHeight: 22,
  },
  classMeta: {
    fontFamily: fonts.InterRegular,
    fontSize: 12,
    lineHeight: 16,
    opacity: 0.9,
  },
  studentBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  windowCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },
  windowText: {
    flex: 1,
    fontFamily: fonts.PoppinsMedium,
    fontSize: 13,
    lineHeight: 18,
  },
  dayRow: {
    gap: 8,
    paddingBottom: 16,
  },
  dayChip: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  dayChipLabel: {
    fontFamily: fonts.PoppinsMedium,
    fontSize: 13,
    lineHeight: 18,
  },
  dayChipLabelActive: {
    fontFamily: fonts.PoppinsSemiBold,
  },
  sectionTitle: {
    marginBottom: 12,
    fontFamily: fonts.PoppinsMedium,
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  overrideBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  overrideBannerText: {
    flex: 1,
    fontFamily: fonts.InterRegular,
    fontSize: 12,
    lineHeight: 16,
  },
  slotsList: {
    gap: 10,
  },
  slotCard: {
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
  slotAccent: {
    width: 4,
  },
  slotBody: {
    flex: 1,
    padding: 12,
    gap: 8,
  },
  slotHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
  },
  slotHeaderMain: {
    flex: 1,
    gap: 2,
  },
  slotPeriod: {
    fontFamily: fonts.InterRegular,
    fontSize: 11,
    lineHeight: 14,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  slotSubject: {
    fontFamily: fonts.PoppinsSemiBold,
    fontSize: 16,
    lineHeight: 22,
  },
  slotCode: {
    fontFamily: fonts.InterRegular,
    fontSize: 12,
    lineHeight: 16,
  },
  overrideBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  overrideBadgeText: {
    fontFamily: fonts.PoppinsSemiBold,
    fontSize: 10,
    lineHeight: 12,
  },
  slotMeta: {
    gap: 4,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    fontFamily: fonts.InterRegular,
    fontSize: 12,
    lineHeight: 16,
  },
  slotNotes: {
    fontFamily: fonts.InterRegular,
    fontSize: 12,
    lineHeight: 16,
    fontStyle: "italic",
  },
  breakCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderStyle: "dashed",
  },
  breakContent: {
    flex: 1,
    gap: 2,
  },
  breakTitle: {
    fontFamily: fonts.PoppinsMedium,
    fontSize: 14,
    lineHeight: 18,
  },
  breakTime: {
    fontFamily: fonts.InterRegular,
    fontSize: 12,
    lineHeight: 16,
  },
  breakNotes: {
    fontFamily: fonts.InterRegular,
    fontSize: 11,
    lineHeight: 14,
  },
  emptyCard: {
    borderRadius: 14,
    padding: 24,
    alignItems: "center",
  },
  emptyText: {
    fontFamily: fonts.InterRegular,
    fontSize: 14,
    textAlign: "center",
  },
  specificSection: {
    marginTop: 24,
    gap: 10,
  },
  specificTitle: {
    fontFamily: fonts.PoppinsSemiBold,
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 4,
  },
  specificItem: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  specificDate: {
    fontFamily: fonts.PoppinsSemiBold,
    fontSize: 12,
    lineHeight: 16,
  },
  specificDetail: {
    fontFamily: fonts.PoppinsMedium,
    fontSize: 14,
    lineHeight: 18,
  },
  specificNotes: {
    fontFamily: fonts.InterRegular,
    fontSize: 12,
    lineHeight: 16,
  },
});
