import React, { useCallback, useMemo } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Platform,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { useTheme } from "../../context/ThemeContext";
import { fonts } from "../../constants/fonts";
import { AppDispatch, RootState } from "../../store/store";
import { GetAttendance_Service } from "../../services/AttendanceService";
import { AttendanceRecord } from "../../type/attendance";
import {
  formatAttendanceDate,
  formatAttendanceStatus,
  getAttendanceStatusColors,
} from "../../utils/attendanceHelpers";
import { useFocusEffect } from "@react-navigation/native";

type SummaryCardProps = {
  label: string;
  value: number;
  accent: string;
  background: string;
  textColor: string;
};

function SummaryCard({
  label,
  value,
  accent,
  background,
  textColor,
}: SummaryCardProps) {
  return (
    <View style={[styles.summaryCard, { backgroundColor: background, borderColor: accent }]}>
      <Text style={[styles.summaryValue, { color: textColor }]}>{value}</Text>
      <Text style={[styles.summaryLabel, { color: textColor }]}>{label}</Text>
    </View>
  );
}

export default function AttendanceScreen() {
  const { paperTheme, resolvedTheme } = useTheme();
  const dispatch = useDispatch<AppDispatch>();

  const selectedStudentId = useSelector(
    (state: RootState) => state.StudentDataReducer.SelectStudent.selectedStudentId,
  );
  const attendancePayload = useSelector(
    (state: RootState) => state.AttendanceReducer.data,
  );
  const isLoading = useSelector(
    (state: RootState) => state.AttendanceReducer.loading,
  );

  const attendanceData = attendancePayload?.data;
  const summary = attendanceData?.summary;
  const records = attendanceData?.records ?? [];
  const meta = attendanceData?.meta;

  const canLoadMore =
    meta != null && meta.current_page < meta.last_page;

  const themeColors = paperTheme.colors as typeof paperTheme.colors & {
    success: string;
    successContainer: string;
    onSuccessContainer: string;
    tertiaryContainer: string;
    onTertiaryContainer: string;
  };

  const fetchAttendance = useCallback(
    async (page = 1) => {
      const id = selectedStudentId?.trim();
      if (!id) {
        return;
      }
      await dispatch(
        GetAttendance_Service({ student_id: String(id), page }),
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

  const summaryCards = useMemo(() => {
    if (!summary) {
      return [];
    }
    return [
      {
        key: "present",
        label: "Present",
        value: summary.present,
        accent: themeColors.success,
        background: themeColors.successContainer,
        textColor: themeColors.onSuccessContainer,
      },
      {
        key: "absent",
        label: "Absent",
        value: summary.absent,
        accent: themeColors.error,
        background: themeColors.errorContainer,
        textColor: themeColors.onErrorContainer,
      },
      {
        key: "late",
        label: "Late",
        value: summary.late,
        accent: themeColors.tertiary,
        background: themeColors.tertiaryContainer,
        textColor: themeColors.onTertiaryContainer,
      },
      {
        key: "total",
        label: "Total",
        value: summary.total,
        accent: themeColors.primary,
        background: themeColors.primaryContainer,
        textColor: themeColors.onPrimaryContainer,
      },
    ];
  }, [summary, themeColors]);

  function renderRecord({ item }: { item: AttendanceRecord }) {

    const statusColors = getAttendanceStatusColors(item.status, {
      successContainer: themeColors.successContainer,
      onSuccessContainer: themeColors.onSuccessContainer,
      errorContainer: themeColors.errorContainer,
      onErrorContainer: themeColors.onErrorContainer,
      tertiaryContainer: themeColors.tertiaryContainer,
      onTertiaryContainer: themeColors.onTertiaryContainer,
      surfaceVariant: themeColors.surfaceVariant,
      onSurfaceVariant: themeColors.onSurfaceVariant,
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
      ) : null}

      {summary ? (
        <View style={styles.summaryGrid}>
          {summaryCards.map(({ key, ...card }) => (
            <SummaryCard key={key} {...card} />
          ))}
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
          No attendance records found.
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
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  summaryCard: {
    width: "48%",
    flexGrow: 1,
    flexBasis: "46%",
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 14,
    alignItems: "center",
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
  summaryValue: {
    fontFamily: fonts.PoppinsBold,
    fontSize: 26,
    lineHeight: 32,
  },
  summaryLabel: {
    marginTop: 4,
    fontFamily: fonts.PoppinsMedium,
    fontSize: 13,
    lineHeight: 18,
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
});
