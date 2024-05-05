import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import Home from "../(home)/_layout";
import QuestionnaireScreen from "../screens/questionnaire";
import { ScannedProductsProvider } from "@/contexts/ScannedProductsContext";

const Stack = createStackNavigator();

export default function UserStack() {
  return (
    <ScannedProductsProvider>
      <Stack.Navigator>
        <Stack.Screen
          options={{ headerShown: false }}
          name="Home"
          component={Home}
        />
        <Stack.Screen
          options={{ headerShown: false }}
          name="Questionnaire"
          component={QuestionnaireScreen}
        />
      </Stack.Navigator>
    </ScannedProductsProvider>
  );
}
