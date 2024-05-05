import { View } from "react-native";
import React from "react";

interface DividerProps {
  width?: number;
  orientation?: "horizontal" | "vertical";
  color?: string;
  dividerStyle?: any;
}

export default function Divider<DividerProps>({
  width = 2,
  orientation = "horizontal",
  color = "#a9a9a9",
}) {
  return (
    <View
      style={[
        { width: orientation === "horizontal" ? "35%" : width },
        { height: orientation === "vertical" ? "100%" : width },
        { backgroundColor: color },
      ]}
    />
  );
}
