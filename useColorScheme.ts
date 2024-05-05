import { useColorScheme } from "react-native";

export { useColorScheme } from "react-native";

const lightTheme = {
  background: "#FFFFFF",
  text: "#000000",
};

const darkTheme = {
  background: "#000000",
  text: "#FFFFFF",
};

export function useTheme() {
  const scheme = useColorScheme();
  return scheme === "dark" ? darkTheme : lightTheme;
}
