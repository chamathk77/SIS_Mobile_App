import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { fonts } from "../constants/fonts";
import { useTheme } from "../context/ThemeContext";
import { MainBottomTabParamList } from "./BottomTabParamList";
import HomeScreen from "../screens/dashboard/HomeScreen";
import AttendanceScreen from "../screens/dashboard/AttendanceScreen";
import InvoiceScreen from "../screens/dashboard/InvoiceScreen";
import TimeTableScreen from "../screens/dashboard/TimeTableScreen";
import CalendarScreen from "../screens/dashboard/CalendarScreen";




const Tab = createBottomTabNavigator<MainBottomTabParamList>();


export default function MainBottomTabNavigator() {
  const { paperTheme } = useTheme();
  const insets = useSafeAreaInsets();
  
  return (
    <Tab.Navigator
      id="MainBottomTabs"
      initialRouteName="HomeScreen"
      screenOptions={({ route }) => ({
        headerShown: false,
      
        tabBarIcon: ({ focused, color }) => {
          const size = 30;
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === "HomeScreen") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Attendance") {
            iconName = focused ? "checkmark-circle" : "checkmark-circle-outline";
          } else if (route.name === "Invoice") {
            iconName = focused ? "document-text" : "document-text-outline";
          } else if (route.name === "TimeTable") {
            iconName = focused ? "time" : "time-outline";
          } else if (route.name === "Calendar") {
            iconName = focused ? "calendar" : "calendar-outline";
          } else {
            iconName = "help-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: paperTheme.colors.primary,
        tabBarInactiveTintColor: paperTheme.colors.outline,
        tabBarHideOnKeyboard: true,
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: fonts.PoppinsRegular,
          lineHeight: 15,

        },
        tabBarStyle: {
          backgroundColor: paperTheme.colors.secondary,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          height: 80 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 5,
          elevation: 8,
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        tabBarItemStyle: {
          justifyContent: "center",
          alignItems: "center",
          paddingVertical: 5,
          backgroundColor: paperTheme.colors.secondary ,

        },
        
      })}
    >
      
      {/* Home */}
      <Tab.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{
          tabBarLabel: ({ focused }) => (
            <Text
              style={[
                { fontSize: 12, textAlign: "center", color: paperTheme.colors.primary },
                { fontWeight: focused ? "700" : "400" },
              ]}
            >
              Home
            </Text>
          ),
        }}
      />

      <Tab.Screen
        name="Attendance"
        component={AttendanceScreen}
        options={{
          tabBarLabel: ({ focused }) => (
            <Text
              style={[
                { fontSize: 12, textAlign: "center", color: paperTheme.colors.primary },
                { fontWeight: focused ? "700" : "400" },
              ]}
            >
              Attendance
            </Text>
          ),
        }}
      />

      <Tab.Screen
        name="Invoice"
        component={InvoiceScreen}
        options={{
          tabBarLabel: ({ focused }) => (
            <Text
              style={[
                { fontSize: 12, textAlign: "center", color: paperTheme.colors.primary },
                { fontWeight: focused ? "700" : "400" },
              ]}
            >
              Invoice
            </Text>
          ),
        }}
      />

      <Tab.Screen
        name="TimeTable"
        component={TimeTableScreen}
        options={{
          tabBarLabel: ({ focused }) => (
            <Text
              style={[
                { fontSize: 12, textAlign: "center", color: paperTheme.colors.primary },
                { fontWeight: focused ? "700" : "400" },
              ]}
            >
              TimeTable
            </Text>
          ),
        }}
      />

      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{
          tabBarLabel: ({ focused }) => (
            <Text
              style={[
                { fontSize: 12, textAlign: "center", color: paperTheme.colors.primary },
                { fontWeight: focused ? "700" : "400" },
              ]}
            >
              Calendar
            </Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}
