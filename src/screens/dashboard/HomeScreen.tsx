import React, { useCallback, useState } from "react";
import {
  BackHandler,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  CommonActions,
  CompositeNavigationProp,
  useFocusEffect,
  useNavigation,
} from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { MainBottomTabParamList } from "../../navigation/BottomTabParamList";
import { RootStackParamList } from "../../navigation/RootStackParamsList";
import { useDispatch, useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import { Portal } from "react-native-paper";
import DashboardHeader from "../../components/DashboardHeader/DashboardHeader";
import SideMenu, { SideMenuRoute } from "./sidebar/SideMenu";
import { useTheme } from "../../context/ThemeContext";
import { fonts } from "../../constants/fonts";
import { logout } from "../../store/reducers/AuthReducer";
import { AppDispatch, RootState } from "../../store/store";
import { clearSavedToken } from "../../utils/secureStorage";
import {
  getInitials,
  getPersonName,
  getSelectedStudent,
  getStudentSchoolName,
} from "../../utils/profileHelpers";
import { useCommonAlert } from "../../hooks/useCommonAlert";
import CommonAlert from "../../components/CommonAlert";
import { DUMMY_DASHBOARD } from "../../data/dummyDashboardData";
import {
  formatCalendarDate,
  formatDashboardAmount,
  getGreeting,
} from "../../utils/dashboardHelpers";
import { formatInvoiceStatus } from "../../utils/invoiceHelpers";
import { DayOfWeek } from "../../type/timetable";
import { formatDayFull, formatPeriodTime } from "../../utils/timetableHelpers";
import { getEventIconName } from "../../utils/calendarHelpers";

type HomeScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainBottomTabParamList, "HomeScreen">,
  NativeStackNavigationProp<RootStackParamList>
>;

type TabRoute = Exclude<keyof MainBottomTabParamList, "HomeScreen">;

type StatCardProps = {
  label: string;
  value: string | number;
  accent: string;
  surface: string;
  border: string;
  text: string;
  muted: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
};

function StatCard({
  label,
  value,
  accent,
  surface,
  border,
  text,
  muted,
  icon,
  onPress,
}: StatCardProps) {
  return (
    <TouchableOpacity
      style={[styles.statCard, { backgroundColor: surface, borderColor: border }]}
      onPress={onPress}
      activeOpacity={onPress ? 0.85 : 1}
      disabled={!onPress}
    >
      <View style={[styles.statIcon, { backgroundColor: `${accent}18` }]}>
        <Ionicons name={icon} size={13} color={accent} />
      </View>
      <View style={styles.statTextCol}>
        <Text
          style={[styles.statValue, { color: text }]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.75}
        >
          {value}
        </Text>
        <Text style={[styles.statLabel, { color: muted }]} numberOfLines={1}>
          {label}
        </Text>
      </View>
      {onPress ? (
        <Ionicons
          name="chevron-forward"
          size={14}
          color={muted}
          style={styles.statChevron}
        />
      ) : null}
    </TouchableOpacity>
  );
}

type QuickActionProps = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  onPress: () => void;
};

function QuickAction({ label, icon, color, onPress }: QuickActionProps) {
  return (
    <TouchableOpacity style={styles.quickAction} onPress={onPress} activeOpacity={0.85}>
      <View style={[styles.quickActionIcon, { backgroundColor: `${color}22` }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={styles.quickActionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const { paperTheme, resolvedTheme } = useTheme();
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  const [menuVisible, setMenuVisible] = useState(false);

  const { alertConfig, visible, hideAlert, show_Alert } = useCommonAlert();
  const dashboard = DUMMY_DASHBOARD;

  const selectStudentData = useSelector(
    (state: RootState) => state.StudentDataReducer.SelectStudent.data,
  );
  const parentUser = useSelector(
    (state: RootState) => state.AuthReducer.Login.userData,
  );
  const studentsList = useSelector(
    (state: RootState) => state.AuthReducer.Login.studentsData ?? [],
  );
  const schools = useSelector(
    (state: RootState) => state.AuthReducer.Login.schoolsData ?? [],
  );

  const student = getSelectedStudent(selectStudentData);
  const studentName = getPersonName(student, "Student");
  const schoolName = getStudentSchoolName(student, studentsList, schools);
  const themeColors = paperTheme.colors as typeof paperTheme.colors & {
    success: string;
    successContainer: string;
    onSuccessContainer: string;
    tertiary: string;
    tertiaryContainer: string;
    onTertiaryContainer: string;
  };

  const navigateTab = useCallback(
    (route: TabRoute) => {
      navigation.navigate(route);
    },
    [navigation],
  );

  function onNavigate(route: SideMenuRoute) {
    navigation.navigate(route);
  }

  async function onLogout() {
    await clearSavedToken();
    dispatch(logout());
    navigation.getParent()?.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "LoginScreen" }],
      }),
    );
  }

  const oneGoBack = () => {
    show_Alert(
      "error",
      "Warning",
      "Are you sure you want to go back?",
      2,
      false,
      "Cancel",
      () => {},
      "Go Back",
      () => {
        navigation.getParent()?.goBack();
      },
    );
    return true;
  };

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== "android") {
        return undefined;
      }
      const sub = BackHandler.addEventListener("hardwareBackPress", oneGoBack);
      return () => sub.remove();
    }, []),
  );

  const weekDays: DayOfWeek[] = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  const todayLabel = formatDayFull(weekDays[new Date().getDay()]);

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

      <DashboardHeader
        studentName={studentName}
        schoolName={schoolName}
        onGoBack={oneGoBack}
        onOpenMenu={() => setMenuVisible(true)}
        paperTheme={paperTheme}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.welcomeCard,
            {
              backgroundColor: paperTheme.colors.primaryContainer,
              borderColor: paperTheme.colors.primary,
            },
          ]}
        >
          <View style={styles.welcomeMain}>
            <View
              style={[
                styles.avatar,
                { backgroundColor: paperTheme.colors.primary },
              ]}
            >
              <Text
                style={[styles.avatarText, { color: paperTheme.colors.onPrimary }]}
              >
                {getInitials(studentName)}
              </Text>
            </View>
            <View style={styles.welcomeText}>
              <Text
                style={[
                  styles.greeting,
                  { color: paperTheme.colors.onPrimaryContainer },
                ]}
              >
                {getGreeting()}
              </Text>
              <Text
                style={[
                  styles.welcomeName,
                  { color: paperTheme.colors.onPrimaryContainer },
                ]}
                numberOfLines={1}
              >
                {studentName}
              </Text>
              <Text
                style={[
                  styles.welcomeMeta,
                  { color: paperTheme.colors.onPrimaryContainer },
                ]}
                numberOfLines={1}
              >
                {dashboard.classInfo.name} · {dashboard.classInfo.academic_year}
              </Text>
            </View>
          </View>
          <View
            style={[
              styles.demoBadge,
              { backgroundColor: paperTheme.colors.primary },
            ]}
          >
            <Text style={[styles.demoBadgeText, { color: paperTheme.colors.onPrimary }]}>
              Demo
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.overviewWrap,
            {
              backgroundColor: paperTheme.colors.surfaceVariant,
              borderColor: paperTheme.colors.outline,
            },
          ]}
        >
          <View style={styles.overviewHeader}>
            <Text
              style={[
                styles.overviewHeaderTitle,
                { color: paperTheme.colors.onSurface },
              ]}
            >
              Overview
            </Text>
            <Text
              style={[
                styles.overviewHeaderMeta,
                { color: paperTheme.colors.onSurfaceVariant },
              ]}
            >
              {dashboard.attendance.monthLabel}
            </Text>
          </View>
          <View style={styles.statsGrid}>
            <StatCard
              label="Present"
              value={dashboard.attendance.present}
              accent={themeColors.success}
              surface={paperTheme.colors.surface}
              border={paperTheme.colors.outline}
              text={paperTheme.colors.onSurface}
              muted={paperTheme.colors.onSurfaceVariant}
              icon="checkmark-circle"
              onPress={() => navigateTab("Attendance")}
            />
            <StatCard
              label="Absent"
              value={dashboard.attendance.absent}
              accent={paperTheme.colors.error}
              surface={paperTheme.colors.surface}
              border={paperTheme.colors.outline}
              text={paperTheme.colors.onSurface}
              muted={paperTheme.colors.onSurfaceVariant}
              icon="close-circle"
              onPress={() => navigateTab("Attendance")}
            />
            <StatCard
              label="Outstanding"
              value={formatDashboardAmount(dashboard.finance.outstanding_total)}
              accent={paperTheme.colors.primary}
              surface={paperTheme.colors.surface}
              border={paperTheme.colors.outline}
              text={paperTheme.colors.onSurface}
              muted={paperTheme.colors.onSurfaceVariant}
              icon="wallet"
              onPress={() => navigateTab("Finance")}
            />
            <StatCard
              label="Overdue"
              value={formatDashboardAmount(dashboard.finance.overdue_total)}
              accent={paperTheme.colors.error}
              surface={paperTheme.colors.surface}
              border={paperTheme.colors.outline}
              text={paperTheme.colors.onSurface}
              muted={paperTheme.colors.onSurfaceVariant}
              icon="alert-circle"
              onPress={() => navigateTab("Finance")}
            />
          </View>
        </View>

        <Text
          style={[styles.sectionTitle, { color: paperTheme.colors.onSurfaceVariant }]}
        >
          Quick actions
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickActionsRow}
        >
          <QuickAction
            label="Attendance"
            icon="checkmark-circle-outline"
            color={themeColors.success}
            onPress={() => navigateTab("Attendance")}
          />
          <QuickAction
            label="Finance"
            icon="wallet-outline"
            color={paperTheme.colors.primary}
            onPress={() => navigateTab("Finance")}
          />
          <QuickAction
            label="Timetable"
            icon="time-outline"
            color={themeColors.tertiary}
            onPress={() => navigateTab("TimeTable")}
          />
          <QuickAction
            label="Calendar"
            icon="calendar-outline"
            color="#0891b2"
            onPress={() => navigateTab("Calendar")}
          />
        </ScrollView>

        {dashboard.highlightInvoice ? (
          <>
            <View style={styles.sectionHeader}>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: paperTheme.colors.onSurfaceVariant },
                ]}
              >
                Payment reminder
              </Text>
              <TouchableOpacity onPress={() => navigateTab("Finance")}>
                <Text style={[styles.sectionLink, { color: paperTheme.colors.primary }]}>
                  View all
                </Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={[
                styles.reminderCard,
                {
                  backgroundColor: paperTheme.colors.surface,
                  borderColor: paperTheme.colors.outline,
                },
              ]}
              onPress={() => navigateTab("Finance")}
              activeOpacity={0.85}
            >
              <View
                style={[
                  styles.reminderIcon,
                  { backgroundColor: paperTheme.colors.tertiaryContainer },
                ]}
              >
                <Ionicons
                  name="document-text-outline"
                  size={22}
                  color={paperTheme.colors.onTertiaryContainer}
                />
              </View>
              <View style={styles.reminderBody}>
                <Text
                  style={[styles.reminderTitle, { color: paperTheme.colors.onSurface }]}
                >
                  {dashboard.highlightInvoice.invoice_number}
                </Text>
                <Text
                  style={[
                    styles.reminderSubtitle,
                    { color: paperTheme.colors.onSurfaceVariant },
                  ]}
                >
                  {dashboard.highlightInvoice.title ?? "Invoice"} ·{" "}
                  {formatInvoiceStatus(dashboard.highlightInvoice.status)}
                </Text>
                <Text
                  style={[styles.reminderAmount, { color: paperTheme.colors.error }]}
                >
                  Balance{" "}
                  {formatDashboardAmount(dashboard.highlightInvoice.balance_due)}
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={paperTheme.colors.onSurfaceVariant}
              />
            </TouchableOpacity>
          </>
        ) : null}

        <View style={styles.sectionHeader}>
          <Text
            style={[styles.sectionTitle, { color: paperTheme.colors.onSurfaceVariant }]}
          >
            Today's schedule
          </Text>
          <TouchableOpacity onPress={() => navigateTab("TimeTable")}>
            <Text style={[styles.sectionLink, { color: paperTheme.colors.primary }]}>
              Timetable
            </Text>
          </TouchableOpacity>
        </View>

        <View
          style={[
            styles.scheduleCard,
            {
              backgroundColor: paperTheme.colors.surface,
              borderColor: paperTheme.colors.outline,
            },
          ]}
        >
          <Text style={[styles.scheduleDay, { color: paperTheme.colors.primary }]}>
            {todayLabel}
          </Text>
          {dashboard.todaySchedule.length > 0 ? (
            dashboard.todaySchedule.slice(0, 3).map((slot) => (
              <View key={slot.id} style={styles.scheduleRow}>
                <Text
                  style={[
                    styles.scheduleTime,
                    { color: paperTheme.colors.onSurfaceVariant },
                  ]}
                >
                  {formatPeriodTime(slot.period.start_time, slot.period.end_time)}
                </Text>
                <View style={styles.scheduleDetail}>
                  <Text
                    style={[
                      styles.scheduleSubject,
                      { color: paperTheme.colors.onSurface },
                    ]}
                  >
                    {slot.subject?.name ?? slot.period.name}
                  </Text>
                  <Text
                    style={[
                      styles.scheduleMeta,
                      { color: paperTheme.colors.onSurfaceVariant },
                    ]}
                  >
                    {slot.teacher?.name} · {slot.room}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Text
              style={[
                styles.emptyInline,
                { color: paperTheme.colors.onSurfaceVariant },
              ]}
            >
              No classes scheduled today.
            </Text>
          )}
        </View>

        <View style={styles.sectionHeader}>
          <Text
            style={[styles.sectionTitle, { color: paperTheme.colors.onSurfaceVariant }]}
          >
            Upcoming events
          </Text>
          <TouchableOpacity onPress={() => navigateTab("Calendar")}>
            <Text style={[styles.sectionLink, { color: paperTheme.colors.primary }]}>
              Calendar
            </Text>
          </TouchableOpacity>
        </View>

        {dashboard.upcomingEvents.length > 0 ? (
          dashboard.upcomingEvents.map((event) => (
            <TouchableOpacity
              key={event.id}
              style={[
                styles.eventRow,
                {
                  backgroundColor: paperTheme.colors.surface,
                  borderColor: paperTheme.colors.outline,
                },
              ]}
              onPress={() => navigateTab("Calendar")}
              activeOpacity={0.85}
            >
              <View
                style={[
                  styles.eventIcon,
                  { backgroundColor: `${event.color}22` },
                ]}
              >
                <Ionicons
                  name={getEventIconName(event.icon)}
                  size={18}
                  color={event.color}
                />
              </View>
              <View style={styles.eventBody}>
                <Text
                  style={[styles.eventName, { color: paperTheme.colors.onSurface }]}
                >
                  {event.name}
                </Text>
                <Text
                  style={[
                    styles.eventDate,
                    { color: paperTheme.colors.onSurfaceVariant },
                  ]}
                >
                  {formatCalendarDate(event.date)}
                  {event.closes_school ? " · School closed" : ""}
                </Text>
              </View>
              <View
                style={[styles.eventDot, { backgroundColor: event.color }]}
              />
            </TouchableOpacity>
          ))
        ) : (
          <View
            style={[
              styles.emptyCard,
              { backgroundColor: paperTheme.colors.surfaceVariant },
            ]}
          >
            <Text
              style={[styles.emptyText, { color: paperTheme.colors.onSurfaceVariant }]}
            >
              No upcoming events.
            </Text>
          </View>
        )}

        <View
          style={[
            styles.attendanceStrip,
            { backgroundColor: themeColors.tertiaryContainer },
          ]}
        >
          <Ionicons
            name="stats-chart-outline"
            size={18}
            color={themeColors.onTertiaryContainer}
          />
          <Text
            style={[
              styles.attendanceStripText,
              { color: themeColors.onTertiaryContainer },
            ]}
          >
            {dashboard.attendance.monthLabel}: {dashboard.attendance.present} present ·{" "}
            {dashboard.attendance.late} late · {dashboard.attendance.excused} excused ·{" "}
            {dashboard.attendance.total} total days
          </Text>
        </View>
      </ScrollView>

      <SideMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onNavigate={onNavigate}
        onLogout={onLogout}
        parentUser={parentUser}
        studentName={studentName}
        schoolName={schoolName}
        paperTheme={paperTheme}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 28,
  },
  welcomeCard: {
    marginTop: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    gap: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: { elevation: 3 },
    }),
  },
  welcomeMain: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontFamily: fonts.PoppinsBold,
    fontSize: 18,
  },
  welcomeText: {
    flex: 1,
    gap: 2,
  },
  greeting: {
    fontFamily: fonts.InterRegular,
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.9,
  },
  welcomeName: {
    fontFamily: fonts.PoppinsBold,
    fontSize: 20,
    lineHeight: 26,
  },
  welcomeMeta: {
    fontFamily: fonts.InterRegular,
    fontSize: 12,
    lineHeight: 16,
    opacity: 0.85,
  },
  demoBadge: {
    alignSelf: "flex-start",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  demoBadgeText: {
    fontFamily: fonts.PoppinsSemiBold,
    fontSize: 11,
    letterSpacing: 0.5,
  },
  sectionTitle: {
    fontFamily: fonts.PoppinsMedium,
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    marginTop: 8,
  },
  sectionLink: {
    fontFamily: fonts.PoppinsSemiBold,
    fontSize: 13,
  },
  overviewWrap: {
    marginBottom: 20,
    borderWidth: 1,
    borderRadius: 12,
    padding: 8,
    gap: 6,
  },
  overviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 2,
  },
  overviewHeaderTitle: {
    fontFamily: fonts.PoppinsSemiBold,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  overviewHeaderMeta: {
    fontFamily: fonts.InterRegular,
    fontSize: 11,
    lineHeight: 14,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  statCard: {
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
  statIcon: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  statTextCol: {
    flex: 1,
    gap: 1,
    minWidth: 0,
  },
  statValue: {
    fontFamily: fonts.PoppinsBold,
    fontSize: 17,
    lineHeight: 20,
  },
  statLabel: {
    fontFamily: fonts.InterRegular,
    fontSize: 10,
    lineHeight: 12,
  },
  statChevron: {
    marginLeft: -2,
  },
  quickActionsRow: {
    gap: 12,
    paddingBottom: 20,
  },
  quickAction: {
    alignItems: "center",
    width: 72,
    gap: 8,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  quickActionLabel: {
    fontFamily: fonts.PoppinsMedium,
    fontSize: 11,
    lineHeight: 14,
    textAlign: "center",
    color: "#71717A",
  },
  reminderCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 8,
  },
  reminderIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  reminderBody: {
    flex: 1,
    gap: 2,
  },
  reminderTitle: {
    fontFamily: fonts.PoppinsSemiBold,
    fontSize: 14,
    lineHeight: 18,
  },
  reminderSubtitle: {
    fontFamily: fonts.InterRegular,
    fontSize: 12,
    lineHeight: 16,
  },
  reminderAmount: {
    fontFamily: fonts.PoppinsSemiBold,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
  scheduleCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 8,
    gap: 12,
  },
  scheduleDay: {
    fontFamily: fonts.PoppinsSemiBold,
    fontSize: 14,
    lineHeight: 18,
  },
  scheduleRow: {
    flexDirection: "row",
    gap: 12,
  },
  scheduleTime: {
    width: 88,
    fontFamily: fonts.InterRegular,
    fontSize: 11,
    lineHeight: 16,
  },
  scheduleDetail: {
    flex: 1,
    gap: 2,
  },
  scheduleSubject: {
    fontFamily: fonts.PoppinsMedium,
    fontSize: 14,
    lineHeight: 18,
  },
  scheduleMeta: {
    fontFamily: fonts.InterRegular,
    fontSize: 11,
    lineHeight: 15,
  },
  emptyInline: {
    fontFamily: fonts.InterRegular,
    fontSize: 13,
  },
  eventRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
  },
  eventIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  eventBody: {
    flex: 1,
    gap: 2,
  },
  eventName: {
    fontFamily: fonts.PoppinsSemiBold,
    fontSize: 14,
    lineHeight: 18,
  },
  eventDate: {
    fontFamily: fonts.InterRegular,
    fontSize: 12,
    lineHeight: 16,
  },
  eventDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  emptyCard: {
    borderRadius: 14,
    padding: 20,
    alignItems: "center",
    marginBottom: 8,
  },
  emptyText: {
    fontFamily: fonts.InterRegular,
    fontSize: 14,
  },
  attendanceStrip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },
  attendanceStripText: {
    flex: 1,
    fontFamily: fonts.InterRegular,
    fontSize: 12,
    lineHeight: 16,
  },
});
