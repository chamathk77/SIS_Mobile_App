// src/navigation/AppNavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { navigationRef } from './RootNavigation';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/loginScreens/LoginScreen';
import { RootStackParamList } from './RootStackParamsList';
import AuthenticationScrees from '../screens/loginScreens/AuthenticationScrees';
import StudentSelectionScreen from '../screens/loginScreens/StudentSelectionScreen';
import EnterEmailScreen from '../screens/forgot password/EnterEmailScreen';
import EnterPinScreen from '../screens/forgot password/EnterPinScreen';
import CreateNewPasswordScreen from '../screens/forgot password/CreateNewPasswordScreen';
import MainBottomTabNavigator from './MainBottomTabNavigator';
import SettingsScreen from '../screens/dashboard/sidebar/settings/SettingsScreen';
import ChangePasswordScreen from '../screens/dashboard/sidebar/settings/ChangePasswordScreen';
import ParentProfileScreen from '../screens/dashboard/sidebar/ParentProfileScreen';
import StudentProfileScreen from '../screens/dashboard/sidebar/StudentProfileScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const initialRoute: keyof RootStackParamList = 'LoginScreen';

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator id="RootStack" initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
        <Stack.Screen name="LoginScreen" component={LoginScreen} />
        <Stack.Screen name="StudentSelectionScreen" component={StudentSelectionScreen} />
        <Stack.Screen name="AuthenticationScreen" component={AuthenticationScrees} />
        <Stack.Screen name="EnterEmailScreen" component={EnterEmailScreen} />
        <Stack.Screen name="EnterPinScreen" component={EnterPinScreen} />
        <Stack.Screen name="CreateNewPasswordScreen" component={CreateNewPasswordScreen} />
        <Stack.Screen name="MainBottomTabs" component={MainBottomTabNavigator} />
        <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
        <Stack.Screen name="ChangePasswordScreen" component={ChangePasswordScreen} />
        <Stack.Screen name="ParentProfileScreen" component={ParentProfileScreen} />
        <Stack.Screen name="StudentProfileScreen" component={StudentProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
