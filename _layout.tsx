import React from "react";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";
import HistoryScreen from "./history";
import ScannerScreen from "./scanner";
import ProfileScreen from "./profile";

function FA5Icon(props: React.ComponentProps<typeof FontAwesome5>) {
  return <FontAwesome5 size={24} style={{ marginBottom: -3 }} {...props} />;
}

const Tab = createBottomTabNavigator();

export default function Home() {
  const getActiveColor = (
    routeName: string,
    colorScheme: "light" | "dark"
  ): string => {
    const colorConfig: Record<string, string> = {
      history: Colors[colorScheme].historyActive,
      scanner: Colors[colorScheme].scannerActive,
      profile: Colors[colorScheme].profileActive,
    };
    return colorConfig[routeName] || Colors[colorScheme].tabIconDefault;
  };

  const getTabIcon = (
    routeName: string,
    focused: boolean,
    color: string
  ): JSX.Element => {
    const iconConfig: Record<string, JSX.Element> = {
      history: (
        <FA5Icon
          name="history"
          size={24}
          style={{ marginBottom: -3 }}
          color={focused ? Colors[colorScheme].historyActive : color}
        />
      ),
      scanner: (
        <Ionicons
          name="barcode-outline"
          size={30}
          style={{ marginBottom: -3 }}
          color={focused ? Colors[colorScheme].scannerActive : color}
        />
      ),
      profile: (
        <FA5Icon
          name="user"
          size={24}
          style={{ marginBottom: -3 }}
          color={focused ? Colors[colorScheme].profileActive : color}
        />
      ),
    };
    return (
      iconConfig[routeName] || (
        <Ionicons
          name="alert"
          size={30}
          style={{ marginBottom: -3 }}
          color={color}
        />
      )
    );
  };

  const colorScheme = useColorScheme() || "light";

  return (
    <Tab.Navigator
      initialRouteName="scanner"
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: getActiveColor(route.name, colorScheme),
        headerShown: false,
        tabBarIcon: ({ focused, color }) =>
          getTabIcon(route.name, focused, color),
      })}
    >
      <Tab.Screen
        name="history"
        component={HistoryScreen}
        options={{ title: "History" }}
      />
      <Tab.Screen
        name="scanner"
        component={ScannerScreen}
        options={{ title: "Scanner" }}
      />
      <Tab.Screen
        name="profile"
        component={ProfileScreen}
        options={{ title: "Profile" }}
      />
    </Tab.Navigator>
  );
}
