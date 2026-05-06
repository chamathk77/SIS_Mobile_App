import React from "react";
import {
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useSelector } from "react-redux";
import { RootStackParamList } from "../../navigation/RootStackParamsList";
import { RootState } from "../../store/store";
import { useTheme } from "../../context/ThemeContext";
import { fonts } from "../../constants/fonts";
import CommonHeader from "../../components/CommonHeader/CommonHeader";

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

function getGrade(student: any): string {
  const grade = student?.grade ?? student?.class ?? student?.standard;
  if (grade == null || String(grade).trim() === "") {
    return "Grade not available";
  }
  return `Grade: ${String(grade)}`;
}

export default function StudentSelectionScreen({ navigation }: Props) {
  const { paperTheme, resolvedTheme } = useTheme();
  const students = useSelector(
    (state: RootState) => state.AuthReducer.Login.studentsData ?? [],
  );

  return (
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
          String(item?.id ?? item?.student_id ?? `student-${index}`)
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
            onPress={() => navigation.navigate("AuthenticationScreen")}
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
              {getGrade(item)}
            </Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
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
});
