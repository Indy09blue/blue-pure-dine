import React from "react";
import {
  StyleSheet,
  Pressable,
  FlatList,
  Switch,
  Text,
  View,
} from "react-native";
import { Text as StyledText } from "@/components/Themed";
import {
  BeefIcon,
  HamIcon,
  MilkOffIcon,
  SaladIcon,
  VeganIcon,
  WheatOffIcon,
} from "lucide-react-native";
import FishIcon from "@/components/icons/FishIcon";
import PeanutIcon from "@/components/icons/PeanutIcon";
import SesameIcon from "@/components/icons/SesameIcon";
import ShellfishIcon from "@/components/icons/ShellfishIcon";
import SoyIcon from "@/components/icons/SoyIcon";

type DietaryPreferencesProps = {
  selectedOptions: SelectedOptions;
  onToggle: (key: string) => void;
  noneApply: boolean;
  onNoneApplyToggle: () => void;
  isEditable?: boolean;
};

type DietaryOption = {
  key: string;
  label: string;
  keywords: string[];
  icon: React.ElementType;
};

export type SelectedOptions = {
  [key: string]: boolean;
};

export const dietaryOptions: DietaryOption[] = [
  {
    key: "vegan",
    label: "Vegan",
    keywords: ["vegan", "eggs", "milk", "fish", "pork", "beef", "shellfish"],
    icon: VeganIcon,
  },
  {
    key: "vegatarian",
    label: "Vegetarian",
    keywords: ["pork", "beef", "fish", "shellfish"],
    icon: SaladIcon,
  },
  {
    key: "dairyFree",
    label: "Dairy-Free",
    keywords: ["milk", "whey"],
    icon: MilkOffIcon,
  },
  {
    key: "glutenFree",
    label: "Gluten-Free",
    keywords: ["yeast", "gluten", "wheat-gluten", "gelatin"],
    icon: WheatOffIcon,
  },
  { key: "noBeef", label: "No Beef", keywords: ["beef"], icon: BeefIcon },
  {
    key: "nut",
    label: "Nut Allergy",
    keywords: ["nuts", "peanuts", "hazelnuts", "cashew-nuts", "pine-nuts"],
    icon: PeanutIcon,
  },
  { key: "noPork", label: "No Pork", keywords: ["pork"], icon: HamIcon },
  { key: "noSoy", label: "No Soy", keywords: ["soybeans"], icon: SoyIcon },
  { key: "noFish", label: "No Fish", keywords: ["fish"], icon: FishIcon },
  {
    key: "noSesame",
    label: "No Sesame",
    keywords: ["sesame-seeds", "sesame-oil"],
    icon: SesameIcon,
  },
  {
    key: "noShell",
    label: "No Shellfish",
    keywords: ["shellfish"],
    icon: ShellfishIcon,
  },
];

export default function DietaryPreferences({
  selectedOptions,
  onToggle,
  noneApply,
  onNoneApplyToggle,
  isEditable = false,
}: DietaryPreferencesProps) {
  const renderItem = ({
    item,
    index,
  }: {
    item: DietaryOption;
    index: number;
  }) => {
    const IconComponent = item.icon;
    const isOdd = index % 2 !== 0;
    const isSelected = selectedOptions[item.key];
    const buttonStyles = [
      styles.optionButton,
      isSelected && styles.optionButtonSelected,
      !isEditable && styles.optionButtonReadOnly,
      isSelected && !isEditable && styles.optionButtonReadOnlySelected,
    ];

    return (
      <View style={[styles.itemContainer, isOdd ? styles.itemRight : null]}>
        <Pressable
          style={({ pressed }) => [
            ...buttonStyles,
            pressed && isEditable && styles.optionButtonPressed,
          ]}
          onPress={() => isEditable && onToggle(item.key)}
          disabled={noneApply || !isEditable}
        >
          {IconComponent && (
            <IconComponent color="black" height={24} width={24} />
          )}
          <Text style={styles.optionButtonText}>{item.label}</Text>
        </Pressable>
      </View>
    );
  };
  return (
    <>
      <View style={styles.content}>
        <FlatList
          data={dietaryOptions}
          renderItem={renderItem}
          keyExtractor={(item) => item.key}
          numColumns={2}
          columnWrapperStyle={styles.optionWrapper}
          scrollEnabled={false}
        />
      </View>
      <View style={styles.checkboxContainer}>
        <Switch
          value={noneApply}
          onValueChange={onNoneApplyToggle}
          disabled={!isEditable}
        />
        <StyledText style={styles.checkboxLabel}>
          None of these apply
        </StyledText>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    // flex: 4,
    marginTop: 15,
  },
  itemContainer: {
    width: "48%",
  },
  itemRight: {
    marginLeft: "5%",
  },
  optionWrapper: {
    justifyContent: "space-between",
    marginBottom: 20,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    margin: 5,
    padding: 10,
    paddingHorizontal: 20,
    backgroundColor: "#E7FCDA",
    borderRadius: 20,
  },
  optionButtonText: { marginLeft: 10 },
  optionButtonSelected: { backgroundColor: "#9AEF66" },
  optionButtonReadOnly: { backgroundColor: "#cccccc" },
  optionButtonReadOnlySelected: { backgroundColor: "#8c8c8c" },
  optionButtonPressed: { backgroundColor: "#BDF5BD" },
  checkboxContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
  },
  checkboxLabel: { marginLeft: 10 },
});
