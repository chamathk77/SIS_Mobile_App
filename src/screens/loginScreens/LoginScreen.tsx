import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  Modal,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TextInput as PaperTextInput, Portal } from "react-native-paper";
import { fonts } from "../../constants/fonts";
import { useTheme } from "../../context/ThemeContext";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import React, { useRef } from "react";
import { RootStackParamList } from "../../navigation/RootStackParamsList";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import LottieView from "lottie-react-native";
import { useFocusEffect } from "@react-navigation/native";
import { login_Service } from "../../services/AuthService";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import { getDeviceNameForApi } from "../../utils/getDeviceNameForApi";
import { devError, devLog } from "../../utils/devLog";
import { saveToken } from "../../utils/secureStorage";
import {
  setSchoolData,
  setStudentsData,
  setUserData,
} from "../../store/reducers/AuthReducer";
import { useCommonAlert } from "../../hooks/useCommonAlert";
import CommonAlert from "../../components/CommonAlert";

const appVersion = require("../../../package.json").version;

type Props = NativeStackScreenProps<RootStackParamList, "LoginScreen">;

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState("parent@zuse.lk");
  const [password, setPassword] = useState("Parent321@");
  const [showPassword, setShowPassword] = useState(false);
  const { paperTheme, resolvedTheme } = useTheme();
  const scrollRef = useRef<any>(null);
  const emailInputRef = useRef<any>(null);
  const passwordInputRef = useRef<any>(null);

  const { show_Alert, hideAlert, visible, alertConfig } = useCommonAlert();

  const dispatch = useDispatch<AppDispatch>();
  const isLoading = useSelector(
    (state: RootState) => state.AuthReducer.Login.loading,
  );

  useFocusEffect(
    useCallback(() => {
      const frameId = requestAnimationFrame(() => {
        scrollRef.current?.scrollToPosition?.(0, 0, true);
      });

      return () => cancelAnimationFrame(frameId);
    }, []),
  );

  const onLogin = async () => {
    if (!email.trim() || !password.trim()) {
      show_Alert(
        "error",
        "Validation",
        "Please enter both institutional email and password.",
        1,
      );
      return;
    }

    const loginData = {
      email: email,
      password: password,
      device_name: getDeviceNameForApi(),
    };

    try {
      devLog("loginData", loginData);
      const result = await dispatch(login_Service(loginData)).unwrap();

      devLog("result.data", JSON.stringify(result.data));

      if (result.success) {
        saveToken(result.data.token);
        dispatch(setUserData(result.data.user));
        dispatch(setSchoolData(result.data.schools));
        dispatch(setStudentsData(result.data.students));
        Keyboard.dismiss();
        setTimeout(() => {
          scrollRef.current?.scrollToPosition?.(0, 0, true);
          navigation.navigate("AuthenticationScreen");
        }, 500);
      }
      // navigation.navigate("AuthenticationScreen");
    } catch (error) {
      devError("error", error);
      show_Alert("error", "Error", error.message, 1);
      return;
    }
  };

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
      <StatusBar
        barStyle={resolvedTheme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={paperTheme.colors.background}
        translucent={false}
      />
      <SafeAreaView
        style={[
          styles.safeArea,
          { backgroundColor: paperTheme.colors.background },
        ]}
      >
        <KeyboardAwareScrollView
          contentContainerStyle={styles.scrollViewContent}
          bounces={false}
          showsVerticalScrollIndicator={false}
          enableOnAndroid={true}
          enableAutomaticScroll={true}
          enableResetScrollToCoords={false}
          extraScrollHeight={Platform.OS === "ios" ? 20 : 50}
          keyboardOpeningTime={0}
          keyboardShouldPersistTaps="handled"
          resetScrollToCoords={{ x: 0, y: 0 }}
          innerRef={(ref: any) => {
            // Assign ref to use for scrollToFocusedInput
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            scrollRef.current = ref;
          }}
        >
          <View style={styles.lottieContainer}>
            <LottieView
              source={require("../../Lottie/Student_Lottie.json")}
              autoPlay
              loop
              style={styles.lottie}
            />
          </View>
          <View
            style={[
              styles.container,
              { backgroundColor: paperTheme.colors.background },
            ]}
          >
            <View>
              <Text
                style={[styles.heading, { color: paperTheme.colors.onSurface }]}
              >
                Sign In
              </Text>
              <Text
                style={[
                  styles.subheading,
                  { color: paperTheme.colors.onSurfaceVariant },
                ]}
              >
                Please provide your academic credentials.
              </Text>

              <Text
                style={[
                  styles.label,
                  { color: paperTheme.colors.onSurfaceVariant },
                ]}
              >
                {" "}
                EMAIL
              </Text>
              <View style={styles.inputWrapper}>
                <PaperTextInput
                  ref={emailInputRef}
                  style={styles.input}
                  mode="flat"
                  underlineColor="transparent"
                  activeUnderlineColor="transparent"
                  contentStyle={styles.inputContent}
                  // left={<PaperTextInput.Icon icon="at" />}
                  placeholder="Enter your email"
                  placeholderTextColor="#9b9ca5"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                  cursorColor="#a16207"
                  theme={paperTheme}
                />
              </View>

              <View style={styles.passwordRow}>
                <Text
                  style={[
                    styles.label,
                    { color: paperTheme.colors.onSurfaceVariant },
                  ]}
                >
                  PASSWORD
                </Text>
              </View>

              <View style={[styles.inputWrapper]}>
                <PaperTextInput
                  ref={passwordInputRef}
                  style={styles.input}
                  mode="flat"
                  underlineColor="transparent"
                  activeUnderlineColor="transparent"
                  contentStyle={styles.inputContent}
                  // left={<PaperTextInput.Icon icon="lock-outline" />}
                  right={
                    <PaperTextInput.Icon
                      icon={showPassword ? "eye-off-outline" : "eye-outline"}
                      onPress={() => setShowPassword((prev) => !prev)}
                    />
                  }
                  placeholder="••••••••••••"
                  placeholderTextColor="#9b9ca5"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  cursorColor="#a16207"
                  theme={paperTheme}
                />
              </View>

              <TouchableOpacity
                style={styles.forgotPasswordContainer}
                onPress={() => navigation.navigate("EnterEmailScreen")}
              >
                <Text
                  style={[
                    styles.forgotPassword,
                    {
                      color: paperTheme.colors.onSurfaceVariant,
                      borderBottomWidth: 0.3,
                      borderBottomColor: paperTheme.colors.onSurfaceVariant,
                    },
                  ]}
                >
                  Forgot Password ?
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.button,
                  {
                    backgroundColor: paperTheme.colors.primary,
                    borderRadius: 15,
                  },
                  isLoading && styles.buttonDisabled,
                ]}
                onPress={onLogin}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.buttonText,
                    { color: paperTheme.colors.onPrimary, fontSize: 14 },
                  ]}
                >
                  SIGN IN &gt;
                </Text>
              </TouchableOpacity>

              <View style={styles.dividerRow}>
                <View style={styles.divider} />
                <Text
                  style={[
                    styles.dividerText,
                    { color: paperTheme.colors.onSurfaceVariant },
                  ]}
                >
                  INSTITUTIONAL ACCESS ONLY
                </Text>
                <View style={styles.divider} />
              </View>

              {/* <Text style={[styles.registerText, { color: paperTheme.colors.onSurfaceVariant }]}>
                New staff or student? <Text style={styles.registerLink}>Register Account</Text>
              </Text> */}
            </View>

            <Text
              style={[
                styles.encryptionText,
                { color: paperTheme.colors.onSurfaceVariant },
              ]}
            >
              APP VERSION {appVersion}
            </Text>
          </View>
        </KeyboardAwareScrollView>
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
    backgroundColor: "#eeedf5",
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 26,
    paddingTop: 20,
    paddingBottom: 20,
  },
  heading: {
    fontFamily: fonts.PoppinsBold,
    fontSize: 30,
    color: "#171717",
    marginBottom: 8,
  },
  subheading: {
    fontFamily: fonts.InterRegular,
    fontSize: 15,
    color: "#52525b",
    marginBottom: 30,
  },
  label: {
    fontFamily: fonts.PoppinsSemiBold,
    fontSize: 12,
    color: "#52525b",
    letterSpacing: 2.1,
    marginBottom: 8,
  },
  inputWrapper: {
    height: 66,
    backgroundColor: "#ececf1",
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    marginBottom: 20,
  },
  inputIcon: {
    fontFamily: fonts.PoppinsBold,
    fontSize: 30,
    color: "#57534e",
    marginRight: 12,
    width: 26,
    alignItems: "center",
  },
  input: {
    flex: 1,
    fontFamily: fonts.InterRegular,
    fontSize: 16,
    color: "#18181b",
    backgroundColor: "transparent",
  },
  inputContent: {
    fontFamily: fonts.InterRegular,
    fontSize: 17,
    color: "#18181b",
  },
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  forgotPassword: {
    fontFamily: fonts.PoppinsMedium,
    fontSize: 12,
    color: "#a16207",
  },
  forgotPasswordContainer: {
    alignSelf: "flex-end",
    marginTop: -12,
    marginBottom: 8,
  },
  button: {
    height: 60,
    backgroundColor: "#c48d00",
    borderRadius: 3,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
    marginBottom: 26,
    shadowColor: "#6b4f00",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 15,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.75,
  },
  buttonText: {
    fontFamily: fonts.PoppinsBold,
    color: "#ffffff",
    fontSize: 14,
    letterSpacing: 3,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 26,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#e4e4e7",
  },
  dividerText: {
    fontFamily: fonts.PoppinsMedium,
    fontSize: 10,
    color: "#9a9aa4",
    letterSpacing: 1.2,
    marginHorizontal: 10,
  },
  registerText: {
    fontFamily: fonts.InterRegular,
    fontSize: 14,
    color: "#3f3f46",
    textAlign: "center",
  },
  registerLink: {
    fontFamily: fonts.InterBold,
    color: "#8a6500",
  },
  encryptionText: {
    fontFamily: fonts.PoppinsMedium,
    fontSize: 10,
    color: "#9a9aa4",
    textAlign: "center",
    letterSpacing: 3,
  },
  lottieContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    flex: 1,
  },
  lottie: {
    width: 220,
    height: 300,
  },
  loadingOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.35)",
  },
});
