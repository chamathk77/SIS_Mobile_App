import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TextInput as PaperTextInput } from 'react-native-paper';
import { useTheme } from '../../context/ThemeContext';
import { fonts } from '../../constants/fonts';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/RootStackParamsList';
import CommonHeader from '../../components/CommonHeader/CommonHeader';
import LottieView from 'lottie-react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { AppDispatch, RootState } from '../../store/store';
import { useDispatch, useSelector } from 'react-redux';
import { ForgotPassword_EnterEmail_Service } from '../../services/AuthService';
import { devError, devLog } from '../../utils/devLog';
import { setForgotPasswordEmail } from '../../store/reducers/AuthReducer';

type Props = NativeStackScreenProps<RootStackParamList, "EnterEmailScreen">;

export default function EnterEmailScreen({ navigation }: Props) {
    const [email, setEmail] = useState('sandev.net@gmail.com');
    const { resolvedTheme, paperTheme } = useTheme();
    const dispatch = useDispatch<AppDispatch>();
    const isLoading = useSelector(
        (state: RootState) => state.AuthReducer.ForgotPasswordEnterEmail.loading,
    );
  
    const onPressSendRecoveryPIN = async () => {
        try {
            if (!email.trim()) {
                Alert.alert('Validation', 'Please enter your email address');
                return;
            }

            const forgotPasswordData = {
                email: email,
            };

            const result = await dispatch(ForgotPassword_EnterEmail_Service(forgotPasswordData)).unwrap();
            devLog('result', result);

            dispatch(setForgotPasswordEmail(email));
            if (result.success) {
                navigation.navigate('EnterPinScreen');
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
            <Modal visible={isLoading} transparent animationType="fade" statusBarTranslucent>
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color={paperTheme.colors.primary} />
                </View>
            </Modal>
            <StatusBar
                barStyle={resolvedTheme === 'dark' ? 'light-content' : 'dark-content'}
                backgroundColor={paperTheme.colors.background}
                translucent={false}
            />
            <SafeAreaView style={[styles.safeArea, { backgroundColor: paperTheme.colors.background }]}>

                <CommonHeader
                    title="Verify Your Email"
                    onPressLeftBtn={() => navigation.goBack()}
                    iconColor={paperTheme.colors.secondary}
                    titleColor={paperTheme.colors.secondary}
                />
                <KeyboardAwareScrollView
                    contentContainerStyle={{ flex: 1 }}
                    bounces={false}
                    showsVerticalScrollIndicator={false}
                    enableOnAndroid={true}
                    enableAutomaticScroll={true}
                    enableResetScrollToCoords={false}
                    extraScrollHeight={Platform.OS === 'ios' ? 20 : 50}
                >

                    <View style={{ flex: 1 }}>
                        <View style={styles.lottieContainer}>
                            <LottieView
                                source={require('../../Lottie/Forgot_Password_Lottie.json')}
                                autoPlay
                                loop
                                style={styles.lottie}
                            />
                        </View>


                        <View style={[styles.container, { backgroundColor: paperTheme.colors.background }]}>

                            <View style={{ marginBottom: 20 }}>
                                <Text style={[styles.inputLabel, { color: paperTheme.colors.onSurfaceVariant }]}>Enter your Email Address</Text>
                                <PaperTextInput
                                    style={[styles.input, { backgroundColor: paperTheme.colors.surfaceVariant }]}
                                    mode="flat"
                                    underlineColor="transparent"
                                    activeUnderlineColor="transparent"
                                    contentStyle={[styles.inputContent, { color: paperTheme.colors.onSurface }]}
                                    placeholder="student.id@academy.edu"
                                    placeholderTextColor={paperTheme.colors.onSurfaceVariant}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    value={email}
                                    onChangeText={setEmail}
                                    right={<PaperTextInput.Icon icon="at" color={paperTheme.colors.onSurfaceVariant} />}
                                    theme={{ ...paperTheme, roundness: 20 }}
                                />
                            </View>

                            <TouchableOpacity style={[styles.primaryButton, { backgroundColor: paperTheme.colors.primary }, isLoading && styles.buttonDisabled]}
                                onPress={onPressSendRecoveryPIN}
                                disabled={isLoading}
                            >
                                <Text style={styles.primaryButtonText}>Send Recovery PIN  &gt;</Text>
                            </TouchableOpacity>


                        </View>

                    </View>
                </KeyboardAwareScrollView>
            </SafeAreaView >
        </>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,

    },
    lottieContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
        flex: 1,
    },
    lottie: {
        width: '100%',
        height: '100%',
    },
    container: {
        flex: 1,
        paddingHorizontal: 30,
        paddingTop: 8,
        paddingBottom: 18,
        justifyContent: 'space-between',
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 28,
    },
    backIcon: {
        fontSize: 26,
        color: '#4b5563',
        marginRight: 16,
        marginTop: -2,
    },
    headerTitle: {
        fontFamily: fonts.PoppinsMedium,
        fontSize: 38,
        color: '#6f5a15',
    },
    sectionLabel: {
        fontFamily: fonts.PoppinsSemiBold,
        fontSize: 12,
        letterSpacing: 3,
        color: '#565662',
        marginBottom: 12,
    },
    mainTitle: {
        fontFamily: fonts.PoppinsMedium,
        fontSize: 62,
        color: '#17171f',
        lineHeight: 68,
    },
    mainTitleAccent: {
        fontFamily: fonts.PoppinsBold,
        fontSize: 62,
        fontStyle: 'italic',
        color: '#a78500',
        lineHeight: 68,
        marginBottom: 14,
    },
    description: {
        fontFamily: fonts.InterRegular,
        fontSize: 15,
        lineHeight: 32,
        color: '#3f3f46',
        marginBottom: 16,
    },
    imageCard: {
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 16,
    },
    image: {
        width: '100%',
        height: 210,
    },
    inputLabel: {
        fontFamily: fonts.InterRegular,
        fontSize: 16,
        color: '#3f3f46',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#e7e6ee',
        borderRadius: 20,
        overflow: 'hidden',
    },
    inputContent: {
        fontFamily: fonts.InterRegular,
        fontSize: 15,
        color: '#1f2937',
        paddingVertical: 12,
    },
    exampleText: {
        marginTop: 8,
        fontFamily: fonts.InterRegular,
        fontStyle: 'italic',
        fontSize: 12,
        color: '#71717a',
    },
    primaryButton: {
        marginTop: 26,
        height: 52,
        borderRadius: 5,
        backgroundColor: '#c9a000',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#9a7b00',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.18,
        shadowRadius: 8,
        elevation: 3,
    },
    primaryButtonText: {
        fontFamily: fonts.PoppinsSemiBold,
        color: '#ffffff',
        fontSize: 18,
        letterSpacing: 1,
    },
    buttonDisabled: {
        opacity: 0.75,
    },
    loadingOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.35)',
    },
    backToLogin: {
        marginTop: 18,
        textAlign: 'center',
        fontFamily: fonts.InterRegular,
        fontSize: 15,
        color: '#2f2f37',
    },
    footerBadge: {
        alignSelf: 'center',
        borderRadius: 18,
        backgroundColor: '#f3f2f8',
        paddingHorizontal: 16,
        paddingVertical: 9,
    },
    footerBadgeText: {
        fontFamily: fonts.PoppinsMedium,
        fontSize: 12,
        color: '#565662',
        letterSpacing: 1.4,
    },
});
