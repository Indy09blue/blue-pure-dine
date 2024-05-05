import React from "react";

import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "../screens/login";
import RegisterScreen from "../screens/register";
import QuestionnaireScreen from "../screens/questionnaire";

const Stack = createStackNavigator();

export default function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Sign In" component={LoginScreen} />
      <Stack.Screen name="Sign Up" component={RegisterScreen} />
    </Stack.Navigator>
  );
}
