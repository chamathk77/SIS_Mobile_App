import { useState } from 'react';
import { Alert, Platform, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TextInput as PaperTextInput } from 'react-native-paper';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import CommonHeader from '../../components/CommonHeader/CommonHeader';
import { RootStackParamList } from '../../navigation/RootStackParamsList';
import { useTheme } from '../../context/ThemeContext';
import { fonts } from '../../constants/fonts';
import { devError, devLog } from '../../utils/devLog';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import { ForgotPassword_CreateNewPassword_Service } from '../../services/AuthService';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateNewPasswordScreen'>;

export default function CreateNewPasswordScreen({ navigation }: Props) {
  const { paperTheme, resolvedTheme } = useTheme();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  const email = useSelector((state: RootState) => state.AuthReducer.ForgotPasswordEnterEmail.email);
  const reset_token = useSelector((state: RootState) => state.AuthReducer.ForgotPasswordEnterPin.reset_token);
  
  const onPressResetPassword = async () => {
    try {
      const forgotPasswordData = {
        email: email,
        reset_token: reset_token,
        password: password,
        password_confirmation: confirmPassword,
      };
      const result = await dispatch(ForgotPassword_CreateNewPassword_Service(forgotPasswordData)).unwrap();
      devLog('result', result);
      if (result.success) {
        navigation.navigate('LoginScreen');
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      devError('error', error);
      Alert.alert('Error', error.message);
      
    }
  }

  return (
    <>
      <StatusBar
        barStyle={resolvedTheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={paperTheme.colors.background}
        translucent={false}
      />
      <SafeAreaView style={[styles.safeArea, { backgroundColor: paperTheme.colors.background }]}>
        <CommonHeader
          title="Create New Password"
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
          extraScrollHeight={Platform.OS === 'ios' ? 20 : 50}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            <View>
              <Text style={[styles.title, { color: paperTheme.colors.onSurface }]}>Set a strong password</Text>
              <Text style={[styles.subtitle, { color: paperTheme.colors.onSurfaceVariant }]}>
                Your new password must be different from previous passwords.
              </Text>

              <Text style={[styles.inputLabel, { color: paperTheme.colors.onSurfaceVariant }]}>New Password</Text>
              <PaperTextInput
                style={[styles.input, { backgroundColor: paperTheme.colors.surfaceVariant }]}
                mode="flat"
                underlineColor="transparent"
                activeUnderlineColor="transparent"
                contentStyle={[styles.inputContent, { color: paperTheme.colors.onSurface }]}
                placeholder="Enter new password"
                placeholderTextColor={paperTheme.colors.onSurfaceVariant}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                right={
                  <PaperTextInput.Icon
                    icon={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    onPress={() => setShowPassword((prev) => !prev)}
                    color={paperTheme.colors.onSurfaceVariant}
                  />
                }
                theme={{ ...paperTheme, roundness: 12 }}
              />

              <Text style={[styles.inputLabel, { color: paperTheme.colors.onSurfaceVariant }]}>Confirm Password</Text>
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
                    icon={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                    onPress={() => setShowConfirmPassword((prev) => !prev)}
                    color={paperTheme.colors.onSurfaceVariant}
                  />
                }
                theme={{ ...paperTheme, roundness: 12 }}
              />
            </View>

            <TouchableOpacity style={[styles.primaryButton, { backgroundColor: paperTheme.colors.primary }]} 
            onPress={ onPressResetPassword }
            >
              <Text style={[styles.primaryButtonText, { color: paperTheme.colors.onPrimary }]}>RESET PASSWORD &gt;</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAwareScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
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
    overflow: 'hidden',
  },
  inputContent: {
    fontFamily: fonts.InterRegular,
    fontSize: 15,
    paddingVertical: 12,
  },
  primaryButton: {
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
  },
  primaryButtonText: {
    fontFamily: fonts.PoppinsSemiBold,
    fontSize: 14,
    letterSpacing: 1.2,
  },
});
