import { Alert, StyleSheet, TouchableOpacity, Text } from "react-native";
import { Text as StyledText, View } from "@/components/Themed";

import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { CheckIcon } from "lucide-react-native";

import { auth, db } from "@/config/firebaseConfig";
import { doc, updateDoc } from "firebase/firestore";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import DietaryPreferences, {
  SelectedOptions,
} from "@/components/DietaryPreferences";

export default function QuestionnaireScreen() {
  const navigation = useNavigation<NavigationProp<any>>();
  const [selectedOptions, setSelectedOptions] = useState<SelectedOptions>({});
  const [noneApply, setNoneApply] = useState(false);

  const handleSavePreferences = async () => {
    if (auth.currentUser) {
      try {
        const userRef = doc(db, "users", auth.currentUser?.uid);

        await updateDoc(userRef, {
          dietaryPreferences: selectedOptions,
        });

        navigation.navigate("Home");
        Alert.alert("Success", "Your dietary preferences have been saved.");
      } catch (error) {
        console.error("Error writing document: ", error);
        Alert.alert("Error", "There was a problem saving your preferences.");
      }
    } else {
      Alert.alert("Error", "You must be logged in to save preferences.");
    }
  };

  const handleToggle = (key: string) => {
    if (noneApply) {
      setNoneApply(false);
    }
    setSelectedOptions((prevState: any) => ({
      ...prevState,
      [key]: !prevState[key],
    }));
  };

  const handleNoneApplyToggle = () => {
    setNoneApply(!noneApply);
    setSelectedOptions({});
  };

  const isAnyOptionsSelected =
    noneApply || Object.values(selectedOptions).some((value) => value);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <StyledText style={styles.title}>
          Do any of the following apply to you?
        </StyledText>
        <Text style={styles.subtitle}>
          Don't worry, you can always edit this later.
        </Text>
      </View>
      <View style={{ flex: 4 }}>
        <DietaryPreferences
          selectedOptions={selectedOptions}
          onToggle={handleToggle}
          noneApply={noneApply}
          onNoneApplyToggle={handleNoneApplyToggle}
          isEditable={true}
        />
      </View>
      <TouchableOpacity
        style={[
          styles.continueButton,
          !isAnyOptionsSelected ? styles.buttonDisabled : null,
        ]}
        onPress={handleSavePreferences}
        disabled={!isAnyOptionsSelected}
      >
        <CheckIcon color="black" />
        <Text style={styles.continueButtonText}>Finished</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 40,
    paddingVertical: 40,
  },
  header: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingHorizontal: 22,
    paddingTop: 70,
  },
  title: {
    fontSize: 22,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 12,
    color: "gray",
    marginTop: 14,
  },
  continueButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#9AEF66",
    padding: 10,
    borderRadius: 10,
  },
  continueButtonText: { marginLeft: 5, fontSize: 16 },
  buttonDisabled: {
    backgroundColor: "gainsboro",
    width: "auto",
    padding: 10,
    borderRadius: 10,
  },
});
