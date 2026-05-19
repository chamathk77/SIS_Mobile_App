import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TextInput as PaperTextInput } from "react-native-paper";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useDispatch } from "react-redux";
import CommonHeader from "../../../../components/CommonHeader/CommonHeader";
import { RootStackParamList } from "../../../../navigation/RootStackParamsList";
import { useTheme } from "../../../../context/ThemeContext";
import { fonts } from "../../../../constants/fonts";
import { devError } from "../../../../utils/devLog";
import { AppDispatch } from "../../../../store/store";


type Props = NativeStackScreenProps<RootStackParamList, "ChangePasswordScreen">;

export default function ChangePasswordScreen({ navigation }: Props) {
  const { paperTheme, resolvedTheme } = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function onPressChangePassword() {
    if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      Alert.alert("Validation", "Please fill in all password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Validation", "New password and confirmation do not match.");
      return;
    }

    // try {
    //   setIsLoading(true);
    //   const result = await dispatch(
    //     ChangePassword_Service({
    //       current_password: currentPassword,
    //       password: newPassword,
    //       password_confirmation: confirmPassword,
    //     }),
    //   ).unwrap();

    //   if (result.success) {
    //     Alert.alert("Success", result.message || "Password updated successfully.", [
    //       { text: "OK", onPress: () => navigation.goBack() },
    //     ]);
    //   } else {
    //     Alert.alert("Error", result.message || "Failed to change password.");
    //   }
    // } catch (error: any) {
    //   devError("change password error", error);
    //   Alert.alert("Error", error.message || "Failed to change password.");
    // } finally {
    //   setIsLoading(false);
    // }
  }

  return (
    <>
      <Modal visible={isLoading} transparent animationType="fade" statusBarTranslucent>
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
        style={[styles.safeArea, { backgroundColor: paperTheme.colors.background }]}
      >
        <CommonHeader
          title="Change Password"
          onPressLeftBtn={() => navigation.goBack()}
          iconColor={paperTheme.colors.secondary}
          titleColor={paperTheme.colors.secondary}
        />

        <KeyboardAwareScrollView
          contentContainerStyle={styles.scrollViewContent}
          bounces={false}
          showsVerticalScrollIndicator={false}
          enableOnAndroid
          enableAutomaticScroll
          enableResetScrollToCoords={false}
          extraScrollHeight={Platform.OS === "ios" ? 20 : 50}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            <View>
              <Text style={[styles.title, { color: paperTheme.colors.onSurface }]}>
                Update your password
              </Text>
              <Text
                style={[styles.subtitle, { color: paperTheme.colors.onSurfaceVariant }]}
              >
                Enter your current password and choose a new secure password.
              </Text>

              <Text
                style={[styles.inputLabel, { color: paperTheme.colors.onSurfaceVariant }]}
              >
                Current Password
              </Text>
              <PaperTextInput
                style={[styles.input, { backgroundColor: paperTheme.colors.surfaceVariant }]}
                mode="flat"
                underlineColor="transparent"
                activeUnderlineColor="transparent"
                contentStyle={[styles.inputContent, { color: paperTheme.colors.onSurface }]}
                placeholder="Enter current password"
                placeholderTextColor={paperTheme.colors.onSurfaceVariant}
                secureTextEntry={!showCurrentPassword}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                right={
                  <PaperTextInput.Icon
                    icon={showCurrentPassword ? "eye-off-outline" : "eye-outline"}
                    onPress={() => setShowCurrentPassword((prev) => !prev)}
                    color={paperTheme.colors.onSurfaceVariant}
                  />
                }
                theme={{ ...paperTheme, roundness: 12 }}
              />

              <Text
                style={[styles.inputLabel, { color: paperTheme.colors.onSurfaceVariant }]}
              >
                New Password
              </Text>
              <PaperTextInput
                style={[styles.input, { backgroundColor: paperTheme.colors.surfaceVariant }]}
                mode="flat"
                underlineColor="transparent"
                activeUnderlineColor="transparent"
                contentStyle={[styles.inputContent, { color: paperTheme.colors.onSurface }]}
                placeholder="Enter new password"
                placeholderTextColor={paperTheme.colors.onSurfaceVariant}
                secureTextEntry={!showNewPassword}
                value={newPassword}
                onChangeText={setNewPassword}
                right={
                  <PaperTextInput.Icon
                    icon={showNewPassword ? "eye-off-outline" : "eye-outline"}
                    onPress={() => setShowNewPassword((prev) => !prev)}
                    color={paperTheme.colors.onSurfaceVariant}
                  />
                }
                theme={{ ...paperTheme, roundness: 12 }}
              />

              <Text
                style={[styles.inputLabel, { color: paperTheme.colors.onSurfaceVariant }]}
              >
                Confirm New Password
              </Text>
              <PaperTextInput
                style={[styles.input, { backgroundColor: paperTheme.colors.surfaceVariant }]}
                mode="flat"
                underlineColor="transparent"
                activeUnderlineColor="transparent"
                contentStyle={[styles.inputContent, { color: paperTheme.colors.onSurface }]}
                placeholder="Re-enter new password"
                placeholderTextColor={paperTheme.colors.onSurfaceVariant}
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                right={
                  <PaperTextInput.Icon
                    icon={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                    onPress={() => setShowConfirmPassword((prev) => !prev)}
                    color={paperTheme.colors.onSurfaceVariant}
                  />
                }
                theme={{ ...paperTheme, roundness: 12 }}
              />
            </View>

            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: paperTheme.colors.primary }]}
              onPress={onPressChangePassword}
              disabled={isLoading}
            >
              <Text style={[styles.primaryButtonText, { color: paperTheme.colors.onPrimary }]}>
                UPDATE PASSWORD
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAwareScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollViewContent: { flexGrow: 1 },
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },
  title: {
    fontFamily: fonts.PoppinsBold,
    fontSize: 28,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: fonts.InterRegular,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 24,
  },
  inputLabel: {
    fontFamily: fonts.PoppinsSemiBold,
    fontSize: 12,
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderRadius: 12,
    overflow: "hidden",
  },
  inputContent: {
    fontFamily: fonts.InterRegular,
    fontSize: 15,
    paddingVertical: 12,
  },
  primaryButton: {
    height: 56,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 30,
  },
  primaryButtonText: {
    fontFamily: fonts.PoppinsSemiBold,
    fontSize: 14,
    letterSpacing: 1.2,
  },
  loadingOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.35)",
  },
});
