import React, { useCallback, useEffect } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useDispatch, useSelector } from "react-redux";
import { Portal } from "react-native-paper";
import { useTheme } from "../../../context/ThemeContext";
import CommonHeader from "../../../components/CommonHeader/CommonHeader";
import {
  ProfileHeroCard,
  ProfileInfoRow,
} from "../../../components/ProfileInfo/ProfileInfo";
import { RootStackParamList } from "../../../navigation/RootStackParamsList";
import { AppDispatch, RootState } from "../../../store/store";
import {
  getEnrollmentSummary,
  getInitials,
  getPersonName,
  getProfileField,
  getSelectedStudent,
  getStudentSchoolName,
} from "../../../utils/profileHelpers";
import { GetStudentProfile_Service } from "../../../services/AuthService";
import { useCommonAlert } from "../../../hooks/useCommonAlert";
import CommonAlert from "../../../components/CommonAlert";

type Props = NativeStackScreenProps<RootStackParamList, "StudentProfileScreen">;

function titleCase(value: string): string {
  const t = value.trim();
  if (!t) return t;
  return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
}

export default function StudentProfileScreen({ navigation }: Props) {
  const { paperTheme } = useTheme();
  const { alertConfig, visible, hideAlert, show_Alert } = useCommonAlert();
  const dispatch = useDispatch<AppDispatch>();

  const selectedStudentId = useSelector(
    (state: RootState) => state.StudentDataReducer.SelectStudent.selectedStudentId,
  );
  const profilePayload = useSelector(
    (state: RootState) => state.StudentDataReducer.GetStudentProfile.data,
  );
  const isLoading = useSelector(
    (state: RootState) => state.StudentDataReducer.GetStudentProfile.loading,
  );
  const studentsList = useSelector(
    (state: RootState) => state.AuthReducer.Login.studentsData ?? [],
  );
  const schools = useSelector(
    (state: RootState) => state.AuthReducer.Login.schoolsData ?? [],
  );

  const student = getSelectedStudent(profilePayload);
  const studentName = getPersonName(student, "Student");
  const schoolName = getStudentSchoolName(student, studentsList, schools);
  const enrollmentLine =
    student?.enrollment != null
      ? getEnrollmentSummary(student.enrollment)
      : "";

  const fetchStudentProfile = useCallback(async () => {
    const id = selectedStudentId?.trim();
    if (!id) {
      navigation.goBack();
      return;
    }
    try {
      await dispatch(
        GetStudentProfile_Service({ student_id: String(id) }),
      ).unwrap();
    } catch (error: any) {
      const msg =
        typeof error?.message === "string"
          ? error.message
          : "Failed to fetch student profile";
      show_Alert(
        "error",
        "Error",
        msg,
        1,
        false,
        "OK",
        () => {},
      );
    }
  }, [dispatch, navigation, selectedStudentId, show_Alert]);

  useEffect(() => {
    void fetchStudentProfile();
  }, [fetchStudentProfile]);

  const admission = student?.admission;
  const admissionLine =
    admission && typeof admission === "object"
      ? [
          admission.status != null && String(admission.status),
          admission.payment_status != null &&
            `Payment: ${String(admission.payment_status)}`,
          admission.fee_total != null && `Fee: ${String(admission.fee_total)}`,
        ]
          .filter(Boolean)
          .join(" · ")
      : "";

  const admissionDisplay =
    admission == null ? "No admission record" : admissionLine || "—";

  return (
    <>
      <Modal
        visible={isLoading}
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
      >
        <CommonHeader
          title="Student Profile"
          onPressLeftBtn={() => navigation.goBack()}
          iconColor={paperTheme.colors.secondary}
          titleColor={paperTheme.colors.secondary}
        />

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {student ? (
            <>
              <ProfileHeroCard
                name={studentName}
                subtitle={schoolName}
                initials={getInitials(studentName)}
                paperTheme={paperTheme}
              />

              <View style={styles.infoList}>
                <ProfileInfoRow
                  label="School"
                  value={schoolName}
                  paperTheme={paperTheme}
                />
                {enrollmentLine ? (
                  <ProfileInfoRow
                    label="Class & enrollment"
                    value={enrollmentLine}
                    paperTheme={paperTheme}
                  />
                ) : null}

                <ProfileInfoRow
                  label="Gender"
                  value={getProfileField(
                    student.gender ? titleCase(String(student.gender)) : null,
                  )}
                  paperTheme={paperTheme}
                />
                <ProfileInfoRow
                  label="Date of birth"
                  value={getProfileField(student.date_of_birth)}
                  paperTheme={paperTheme}
                />
                <ProfileInfoRow
                  label="Blood group"
                  value={getProfileField(student.blood_group)}
                  paperTheme={paperTheme}
                />
                <ProfileInfoRow
                  label="Nationality"
                  value={getProfileField(student.nationality)}
                  paperTheme={paperTheme}
                />
                <ProfileInfoRow
                  label="Religion"
                  value={getProfileField(student.religion)}
                  paperTheme={paperTheme}
                />
                <ProfileInfoRow
                  label="Email"
                  value={getProfileField(student.email)}
                  paperTheme={paperTheme}
                />
                <ProfileInfoRow
                  label="Phone"
                  value={getProfileField(student.phone)}
                  paperTheme={paperTheme}
                />
                <ProfileInfoRow
                  label="Address"
                  value={getProfileField(student.address)}
                  paperTheme={paperTheme}
                />
                <ProfileInfoRow
                  label="Admission number"
                  value={getProfileField(student.admission_number)}
                  paperTheme={paperTheme}
                />
                <ProfileInfoRow
                  label="Registration number"
                  value={getProfileField(student.registration_number)}
                  paperTheme={paperTheme}
                />
                <ProfileInfoRow
                  label="Enrolled at"
                  value={getProfileField(student.enrolled_at)}
                  paperTheme={paperTheme}
                />
                <ProfileInfoRow
                  label="Status"
                  value={getProfileField(
                    student.status ? titleCase(String(student.status)) : null,
                  )}
                  paperTheme={paperTheme}
                />
                <ProfileInfoRow
                  label="Admission"
                  value={admissionDisplay}
                  paperTheme={paperTheme}
                />
              </View>
            </>
          ) : !isLoading ? (
            <View style={styles.emptyPad} />
          ) : null}
        </ScrollView>

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
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  infoList: {
    gap: 0,
  },
  loadingOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.35)",
  },
  emptyPad: {
    minHeight: 24,
  },
});
