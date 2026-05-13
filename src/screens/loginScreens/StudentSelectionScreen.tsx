import React, { useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useDispatch, useSelector } from "react-redux";
import { RootStackParamList } from "../../navigation/RootStackParamsList";
import { AppDispatch, RootState } from "../../store/store";
import { useTheme } from "../../context/ThemeContext";
import { fonts } from "../../constants/fonts";
import CommonHeader from "../../components/CommonHeader/CommonHeader";
import { devError, devLog } from "../../utils/devLog";
import { SelectStudent_Service } from "../../services/AuthService";

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

function getSchoolLabel(student: any): string {
  const school = student?.school;
  const name =
    typeof school === "string"
      ? school
      : (school?.name ?? school?.title ?? student?.school_name);

  if (name == null || String(name).trim() === "") {
    return "School not available";
  }
  return `School: ${String(name)}`;
}

export default function StudentSelectionScreen({ navigation }: Props) {
  const { paperTheme, resolvedTheme } = useTheme();
  const students = useSelector(
    (state: RootState) => state.AuthReducer.Login.studentsData ?? [],
  );
  const isLoading = useSelector(
    (state: RootState) => state.AuthReducer.SelectStudent.loading,
  );

  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    devLog("students", students);
  }, [students]);

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
        onPressLeftBtn={() => navigation.goBack()}
        iconColor={paperTheme.colors.secondary}
        titleColor={paperTheme.colors.secondary}
      />

      <View style={styles.header}>
        <Text style={[styles.title, { color: paperTheme.colors.onSurface }]}>
          Select Student
        </Text>
        <Text
          style={[
            styles.subtitle,
            { color: paperTheme.colors.onSurfaceVariant },
          ]}
        >
          Choose the student profile to continue.
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
              styles.card,
              {
                backgroundColor: paperTheme.colors.secondaryContainer,
                borderColor: paperTheme.colors.outlineVariant,
              },
            ]}
            onPress={() => OnSelectStudentPress(item.id)}
          >
            <Text
              style={[
                styles.studentName,
                { color: paperTheme.colors.onSecondaryContainer },
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
              {getSchoolLabel(item)}
            </Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
    
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
  title: {
    fontFamily: fonts.PoppinsBold,
    fontSize: 28,
  },
  subtitle: {
    marginTop: 6,
    fontFamily: fonts.InterRegular,
    fontSize: 14,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
    gap: 12,
  },
  card: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 18,
  },
  studentName: {
    fontFamily: fonts.PoppinsSemiBold,
    fontSize: 18,
  },
  studentMeta: {
    marginTop: 6,
    fontFamily: fonts.InterRegular,
    fontSize: 13,
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
