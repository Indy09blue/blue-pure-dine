import { StyleSheet, TouchableHighlight, ViewStyle } from "react-native";
import React from "react";
import { FontAwesome5 } from "@expo/vector-icons";

function FA5Icon(props: {
  name: React.ComponentProps<typeof FontAwesome5>["name"];
  color: string;
}) {
  return (
    <FontAwesome5
      size={22}
      style={{
        marginBottom: -3,
      }}
      {...props}
    />
  );
}

interface Props {
  style?: ViewStyle;
  type: SocialType;
  onPress: () => void;
  loading?: boolean;
  children?: string;
}

type SocialType = "google" | "apple" | "facebook" | "yahoo";

function getSocialColor(type: SocialType): string {
  switch (type) {
    case "facebook":
      return "#4267B2";
    case "google":
      return "#F96458";
    case "apple":
      return "#000000";
    case "yahoo":
      return "#8742b2";
  }
}

export default function AuthProviderButton({
  style,
  type,
  onPress,
  loading,
}: Props) {
  return (
    <TouchableHighlight
      style={[styles.button, style, { backgroundColor: getSocialColor(type) }]}
      onPress={onPress}
    >
      <FA5Icon name={type} color="#fff" />
    </TouchableHighlight>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
    marginHorizontal: 10,
    borderRadius: 999,
    width: 50,
    height: 50,
  },
});
