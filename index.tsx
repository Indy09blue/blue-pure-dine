import React from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/config/firebaseConfig";
import AuthStack from "./authStack";
import UserStack from "./userStack";
import { NavigationContainer } from "@react-navigation/native";
import { useColorScheme } from "@/components/useColorScheme";
import { DarkTheme, DefaultTheme } from "@react-navigation/native";

export default function RootNavigation() {
  const colorScheme = useColorScheme();

  const [user, setUser] = React.useState<User>();

  React.useEffect(() => {
    const unsubscribeFromAuthStatuChanged = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        setUser(user);
      } else {
        // User is signed out
        setUser(undefined);
      }
    });
    return unsubscribeFromAuthStatuChanged;
  }, []);

  return (
    <NavigationContainer
      independent={true}
      theme={colorScheme === "dark" ? DarkTheme : DefaultTheme}
    >
      {user ? <UserStack /> : <AuthStack />}
    </NavigationContainer>
  );
}
