import React, { useCallback, useState } from "react";
import {
  BackHandler,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  CommonActions,
  useFocusEffect,
  useNavigation,
} from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import DashboardHeader from "../../components/DashboardHeader/DashboardHeader";
import SideMenu, { SideMenuRoute } from "./sidebar/SideMenu";
import { useTheme } from "../../context/ThemeContext";
import { fonts } from "../../constants/fonts";
import { logout } from "../../store/reducers/AuthReducer";
import { AppDispatch, RootState } from "../../store/store";
import { clearSavedToken } from "../../utils/secureStorage";
import {
  getPersonName,
  getSelectedStudent,
  getStudentSchoolName,
} from "../../utils/profileHelpers";
import { useCommonAlert } from "../../hooks/useCommonAlert";
import CommonAlert from "../../components/CommonAlert";
import { Portal } from "react-native-paper";

export default function HomeScreen() {
  const { paperTheme, resolvedTheme } = useTheme();
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const [menuVisible, setMenuVisible] = useState(false);

  const { alertConfig, visible, hideAlert, show_Alert } = useCommonAlert();

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



  function onNavigate(route: SideMenuRoute) {
    navigation.getParent()?.navigate(route);
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
      () => {
        
      },
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
 
   

      const sub = BackHandler.addEventListener(
        "hardwareBackPress",
        oneGoBack,
      );
      return () => sub.remove();
    }, []),
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

      <DashboardHeader
        studentName={studentName}
        schoolName={schoolName}
        onGoBack={oneGoBack}
        onOpenMenu={() => setMenuVisible(true)}
        paperTheme={paperTheme}
      />

      <View style={styles.container}>
        <Text style={[styles.title, { color: paperTheme.colors.secondary }]}>
          Home
        </Text>
      </View>

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
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontFamily: fonts.PoppinsSemiBold, fontSize: 20 },
});
