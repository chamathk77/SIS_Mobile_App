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
import InvoiceScreen from "../screens/dashboard/FinanceScreen";
import TimeTableScreen from "../screens/dashboard/TimeTableScreen";
import CalendarScreen from "../screens/dashboard/CalendarScreen";




const Tab = createBottomTabNavigator<MainBottomTabParamList>();


const TAB_BAR_BG_LIGHT = "#27272A";
const TAB_BAR_BG_DARK = "#09090B";
const TAB_LABEL_ACTIVE = "#FFFFFF";
const TAB_LABEL_INACTIVE = "rgba(255, 255, 255, 0.58)";

export default function MainBottomTabNavigator() {
  const { resolvedTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const tabBarBackground =
    resolvedTheme === "dark" ? TAB_BAR_BG_DARK : TAB_BAR_BG_LIGHT;

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
          } else if (route.name === "Finance") {
            iconName = focused ? "wallet" : "wallet-outline";
          } else if (route.name === "TimeTable") {
            iconName = focused ? "time" : "time-outline";
          } else if (route.name === "Calendar") {
            iconName = focused ? "calendar" : "calendar-outline";
          } else {
            iconName = "help-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: TAB_LABEL_ACTIVE,
        tabBarInactiveTintColor: TAB_LABEL_INACTIVE,
        tabBarHideOnKeyboard: true,
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: fonts.PoppinsRegular,
          lineHeight: 15,

        },
        tabBarStyle: {
          backgroundColor: tabBarBackground,
          borderTopWidth: 0,
          // borderTopLeftRadius: 20,
          // borderTopRightRadius: 20,
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
          backgroundColor: "transparent",
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
                {
                  fontSize: 12,
                  textAlign: "center",
                  color: focused ? TAB_LABEL_ACTIVE : TAB_LABEL_INACTIVE,
                },
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
                {
                  fontSize: 12,
                  textAlign: "center",
                  color: focused ? TAB_LABEL_ACTIVE : TAB_LABEL_INACTIVE,
                },
                { fontWeight: focused ? "700" : "400" },
              ]}
            >
              Attendance
            </Text>
          ),
        }}
      />

      <Tab.Screen
        name="Finance"
        component={InvoiceScreen}
        options={{
          tabBarLabel: ({ focused }) => (
            <Text
              style={[
                {
                  fontSize: 12,
                  textAlign: "center",
                  color: focused ? TAB_LABEL_ACTIVE : TAB_LABEL_INACTIVE,
                },
                { fontWeight: focused ? "700" : "400" },
              ]}
            >
              Finance
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
                {
                  fontSize: 12,
                  textAlign: "center",
                  color: focused ? TAB_LABEL_ACTIVE : TAB_LABEL_INACTIVE,
                },
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
                {
                  fontSize: 12,
                  textAlign: "center",
                  color: focused ? TAB_LABEL_ACTIVE : TAB_LABEL_INACTIVE,
                },
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
