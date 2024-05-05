import React, { useEffect, useState } from "react";
import {
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useNavigation, NavigationProp } from "@react-navigation/native";

import { signOut, User, sendPasswordResetEmail } from "firebase/auth";
import { auth, db, storage } from "@/config/firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, getDoc, updateDoc } from "firebase/firestore";

import { CheckIcon, PencilIcon, XCircleIcon } from "lucide-react-native";
import { Text, View } from "@/components/Themed";
import DietaryPreferences, {
  SelectedOptions,
} from "@/components/DietaryPreferences";

type UserDetails = {
  fullName: string;
  email: string;
  dietaryPreferences: {};
  profilePicture?: string;
};

export default function ProfileScreen() {
  const navigation = useNavigation<NavigationProp<any>>();
  const [userDetails, setUserDetails] = useState<UserDetails>({
    fullName: "",
    email: "",
    dietaryPreferences: {},
  });
  const [selectedOptions, setSelectedOptions] = useState<SelectedOptions>({});
  const [noneApply, setNoneApply] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const toggleEditMode = () => {
    setIsEditMode((prevMode) => !prevMode);
  };

  const handlePasswordReset = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      console.log("Password reset email sent successfully");
      // Show some success message
    } catch (error) {
      console.error("Error sending password reset email: ", error);
      // Handle errors here, such as showing an alert to the user
    }
  };

  const fetchUserDetails = async (user: User) => {
    if (!user) {
      console.log("No user available");
      return;
    }

    const userDocRef = doc(db, "users", user.uid);
    const userSnapshot = await getDoc(userDocRef);

    if (userSnapshot.exists()) {
      const data = userSnapshot.data();
      setUserDetails({
        fullName: data.fullName,
        email: data.email,
        dietaryPreferences: data.dietaryPreferences || {},
        profilePicture: data.profilePicture || "",
      });
      // Update the selected options for dietary preferences
      setSelectedOptions(data.dietaryPreferences || {});
    } else {
      console.log("No data exists for user");
    }
  };

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      fetchUserDetails(user);
    } else {
      console.log("User is not logged in");
    }
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth); // Call the signOut function from firebaseConfig
      navigation.navigate("Sign In"); // Use replace to prevent going back to the profile after logging out
    } catch (error) {
      console.error("Error signing out: ", error);
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

  const handleSelectImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission to access camera roll is required!");
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    // Check if the operation was canceled
    if (pickerResult.canceled) {
      return;
    }

    // Ensure that there is at least one result in the assets array
    const uri =
      pickerResult.assets && pickerResult.assets.length > 0
        ? pickerResult.assets[0].uri
        : null;
    if (uri) {
      await uploadImage(uri);
    }
  };

  const uploadImage = async (uri: string) => {
    const user = auth.currentUser;
    if (user) {
      const storageRef = ref(storage, `profile_pictures/${user.uid}.jpg`);
      const response = await fetch(uri);
      const blob = await response.blob();

      await uploadBytes(storageRef, blob);

      const downloadURL = await getDownloadURL(storageRef);
      await updateUserProfile(downloadURL);
    }
  };

  const updateUserProfile = async (imageUrl: string) => {
    const user = auth.currentUser;
    if (user) {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        profilePicture: imageUrl,
      });
      setUserDetails({ ...userDetails, profilePicture: imageUrl });
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <View>
            <TouchableOpacity
              style={styles.editIcon}
              onPress={handleSelectImage}
            >
              <PencilIcon size={26} color="#fff" />
            </TouchableOpacity>
            <Image
              style={styles.image}
              source={
                userDetails.profilePicture
                  ? { uri: userDetails.profilePicture }
                  : require("@/assets/images/default_pfp.jpg")
              }
            />
          </View>

          <Text style={styles.profileName}>{userDetails.fullName}</Text>
        </View>

        <View style={styles.accountContent}>
          <Text style={styles.accountText}>Account Information</Text>
          <View>
            <Text>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="current value for email"
              value={userDetails.email}
              editable={false}
            />
            <Text>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="current value for password"
              editable={false}
              value="●●●●●●●●●●"
            />
            <TouchableOpacity
              onPress={() => handlePasswordReset(userDetails.email)}
              style={{ alignItems: "flex-end", marginVertical: 2 }}
            >
              <Text style={{ color: "#4b84d9" }}>Reset Password</Text>
            </TouchableOpacity>
            <Text style={styles.dietaryText}>Dietary Preferences</Text>
            <DietaryPreferences
              selectedOptions={selectedOptions}
              onToggle={handleToggle}
              noneApply={noneApply}
              onNoneApplyToggle={handleNoneApplyToggle}
              isEditable={isEditMode}
            />
            <View style={{ display: "flex", flexDirection: "row" }}>
              <TouchableOpacity
                onPress={toggleEditMode}
                style={[
                  styles.editButton,
                  isEditMode ? styles.saveButton : styles.editButton,
                ]}
              >
                {isEditMode ? (
                  <CheckIcon color="#fff" />
                ) : (
                  <PencilIcon color="#fff" />
                )}
                <Text style={styles.editButtonText}>
                  {isEditMode ? "Save" : "Edit"}
                </Text>
              </TouchableOpacity>
              {isEditMode && (
                <TouchableOpacity
                  onPress={() => setIsEditMode(false)}
                  style={styles.cancelButton}
                >
                  <XCircleIcon color="#fff" />
                  <Text style={styles.editButtonText}>Cancel</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
          <Text style={styles.buttonText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 70,
  },
  contentContainer: {
    paddingBottom: 30,
  },
  header: {
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: 240,
    height: 240,
    borderRadius: 220 / 2,
  },
  editIcon: {
    position: "absolute",
    zIndex: 99,
    bottom: 0,
    right: 30,
    backgroundColor: "#3bc44b",
    padding: 14,
    borderRadius: 999,
  },
  profileName: {
    marginTop: 10,
    marginBottom: 40,
    fontSize: 32,
    fontWeight: "700",
  },
  accountContent: {
    marginHorizontal: 40,
  },
  accountText: {
    marginBottom: 16,
    fontSize: 16,
    fontWeight: "500",
  },
  input: {
    marginVertical: 7,
    height: 40,
    width: "auto",
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    backgroundColor: "#fff",
  },
  dietaryText: {
    marginTop: 14,
    fontSize: 16,
    fontWeight: "500",
  },
  editButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFA500",
    padding: 8,
    borderRadius: 10,
    marginTop: 14,
    width: "100%",
  },
  saveButton: {
    backgroundColor: "#32CD32",
    marginTop: 14,
    padding: 8,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "45%",
  },
  editButtonText: {
    color: "#fff",
    textAlign: "center",
    marginLeft: 5,
    fontSize: 16,
    fontWeight: "500",
  },
  cancelButton: {
    backgroundColor: "#f35e43",
    padding: 8,
    marginTop: 14,
    marginLeft: 35,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "45%",
  },
  settingContent: {
    marginHorizontal: 40,
  },
  settingText: {
    marginVertical: 14,
    fontSize: 16,
    fontWeight: "500",
  },
  signOutButton: {
    marginTop: 20,
    marginHorizontal: 40,
    padding: 10,
    backgroundColor: "red",
    borderRadius: 6,
    marginBottom: 20,
  },
  buttonText: {
    color: "white",
    alignSelf: "center",
    fontWeight: "700",
  },
});
