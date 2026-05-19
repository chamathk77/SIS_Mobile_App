import React, { useCallback, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  FlatList,
  Modal,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CommonActions, useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useDispatch, useSelector } from "react-redux";
import { Portal } from "react-native-paper";
import { RootStackParamList } from "../../navigation/RootStackParamsList";
import { AppDispatch, RootState } from "../../store/store";
import { useTheme } from "../../context/ThemeContext";
import { fonts } from "../../constants/fonts";
import CommonHeader from "../../components/CommonHeader/CommonHeader";
import CommonAlert from "../../components/CommonAlert";
import { devError, devLog } from "../../utils/devLog";
import { SelectStudent_Service } from "../../services/AuthService";
import { logout } from "../../store/reducers/AuthReducer";
import { clearSavedToken } from "../../utils/secureStorage";
import { useCommonAlert } from "../../hooks/useCommonAlert";
import {
  getInitials,
  getPersonName,
  getStudentSchoolName,
} from "../../utils/profileHelpers";

type Props = NativeStackScreenProps<
  RootStackParamList,
  "StudentSelectionScreen"
>;

function getStudentName(student: any, index: number): string {
  if (!student || typeof student !== "object") {
    return `Student ${index + 1}`;
  }

  const fullName =
    student.full_name ??
    student.name ??
    student.student_name ??
    [student.first_name, student.last_name].filter(Boolean).join(" ");

  return typeof fullName === "string" && fullName.trim().length > 0
    ? fullName
    : `Student ${index + 1}`;
}

function getStudentInitials(student: any, index: number): string {
  return getInitials(getStudentName(student, index));
}

export default function StudentSelectionScreen({ navigation }: Props) {
  const { paperTheme, resolvedTheme } = useTheme();
  const students = useSelector(
    (state: RootState) => state.AuthReducer.Login.studentsData ?? [],
  );
  const parentUser = useSelector(
    (state: RootState) => state.AuthReducer.Login.userData,
  );
  const schools = useSelector(
    (state: RootState) => state.AuthReducer.Login.schoolsData ?? [],
  );
  const isLoading = useSelector(
    (state: RootState) => state.StudentDataReducer.SelectStudent.loading,
  );

  const dispatch = useDispatch<AppDispatch>();
  const { alertConfig, visible, hideAlert, show_Alert } = useCommonAlert();

  useEffect(() => {
    devLog("students", students);
  }, [students]);

  async function handleConfirmLogout() {
    await clearSavedToken();
    dispatch(logout());
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "LoginScreen" }],
      }),
    );
  }

  const handleBackPress = useCallback(() => {
    show_Alert(
      "error",
      "Log Out",
      "Are you sure you want to log out? You will need to sign in again.",
      2,
      false,
      "Log Out",
      () => {
        handleConfirmLogout();
      },
      "Cancel",
    );

    return true;
  }, [show_Alert]);

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== "android") {
        return undefined;
      }

      const sub = BackHandler.addEventListener(
        "hardwareBackPress",
        handleBackPress,
      );
      return () => sub.remove();
    }, [handleBackPress]),
  );

  async function OnSelectStudentPress(studentId: string) {
    try {
      devLog("studentId", studentId);
      const result = await dispatch(SelectStudent_Service({ student_id: studentId })).unwrap();
      devLog("result", JSON.stringify(result));
      if (result.success) {
        navigation.navigate("MainBottomTabs");
      }
    } catch (error) {
      devError("error", error);
      Alert.alert("Error", error.message);
    }
  }

  // const students = [
  //   {
  //     id: 1,
  //     name: "John Doe",
  //     grade: "10",
  //   },
  //   {
  //     id: 2,
  //     name: "Jane Doe",
  //     grade: "11",
  //   },
  //   {
  //     id: 3,
  //     name: "Jim Doe",
  //     grade: "12",
  //   },
  // ];

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
      <StatusBar
        barStyle={resolvedTheme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={paperTheme.colors.background}
        translucent={false}
      />

      <CommonHeader
        title="Student Selection"
        onPressLeftBtn={handleBackPress}
        iconColor={paperTheme.colors.secondary}
        titleColor={paperTheme.colors.secondary}
      />

      <View style={styles.header}>
        <Text
          style={[styles.welcomeLabel, { color: paperTheme.colors.primary }]}
        >
          Welcome back
        </Text>
        <Text
          style={[styles.parentName, { color: paperTheme.colors.onSurface }]}
        >
          {getPersonName(parentUser, "Parent")}
        </Text>
        <Text
          style={[
            styles.subtitle,
            { color: paperTheme.colors.onSurfaceVariant },
          ]}
        >
          Select a student profile to continue.
        </Text>
      </View>

      <FlatList
        data={students}
        keyExtractor={(item, index) =>
          String(item?.id ?? item?.id ?? `student-${index}`)
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View
            style={[
              styles.emptyCard,
              { backgroundColor: paperTheme.colors.secondaryContainer },
            ]}
          >
            <Text
              style={[
                styles.emptyText,
                { color: paperTheme.colors.onSecondaryContainer },
              ]}
            >
              No students found for this parent account.
            </Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <TouchableOpacity
            activeOpacity={0.85}
            style={[
              styles.studentCard,
              {
                backgroundColor: paperTheme.colors.surface,
                borderColor: paperTheme.colors.outlineVariant,
              },
            ]}
            onPress={() => OnSelectStudentPress(item.id)}
          >
            <View
              style={[
                styles.studentAvatar,
                { backgroundColor: paperTheme.colors.primaryContainer },
              ]}
            >
              <Text
                style={[
                  styles.studentAvatarText,
                  { color: paperTheme.colors.onPrimaryContainer },
                ]}
              >
                {getStudentInitials(item, index)}
              </Text>
            </View>

            <View style={styles.studentInfo}>
              <Text
                style={[
                  styles.studentName,
                  { color: paperTheme.colors.onSurface },
                ]}
              >
                {getStudentName(item, index)}
              </Text>
              <Text
                style={[
                  styles.studentMeta,
                  { color: paperTheme.colors.onSurfaceVariant },
                ]}
              >
                {getStudentSchoolName(item, students, schools)}
              </Text>
            </View>

            <Text
              style={[
                styles.chevron,
                { color: paperTheme.colors.onSurfaceVariant },
              ]}
            >
              ›
            </Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>

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

  </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 10,
  },
  welcomeLabel: {
    fontFamily: fonts.PoppinsMedium,
    fontSize: 13,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  parentName: {
    marginTop: 4,
    fontFamily: fonts.PoppinsBold,
    fontSize: 28,
    lineHeight: 34,
  },
  subtitle: {
    marginTop: 6,
    fontFamily: fonts.InterRegular,
    fontSize: 14,
    lineHeight: 20,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
    gap: 12,
  },
  studentCard: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  studentAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  studentAvatarText: {
    fontFamily: fonts.PoppinsBold,
    fontSize: 16,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontFamily: fonts.PoppinsSemiBold,
    fontSize: 17,
    lineHeight: 22,
  },
  studentMeta: {
    marginTop: 4,
    fontFamily: fonts.InterRegular,
    fontSize: 13,
    lineHeight: 18,
  },
  chevron: {
    fontFamily: fonts.PoppinsSemiBold,
    fontSize: 24,
    lineHeight: 24,
    marginRight: 2,
  },
  emptyCard: {
    borderRadius: 14,
    padding: 16,
    marginTop: 8,
  },
  emptyText: {
    fontFamily: fonts.InterRegular,
    fontSize: 14,
    textAlign: "center",
  },
  loadingOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.35)",
  },
});
