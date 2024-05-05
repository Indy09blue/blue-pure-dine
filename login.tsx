import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { Text, View } from "@/components/Themed";

import React, { useState } from "react";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { auth } from "@/config/firebaseConfig";
import {
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from "firebase/auth";
import Divider from "@/components/Divider";

import { useFormik } from "formik";
import * as yup from "yup";
import Apple from "@/components/auth-providers/Apple";
import Google from "@/components/auth-providers/Google";
import Facebook from "@/components/auth-providers/Facebook";
import Yahoo from "@/components/auth-providers/Yahoo";

export const loginValidationSchema = yup.object({
  email: yup
    .string()
    .email("Please enter a valid email")
    .required("Email address is required."),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

export default function LoginScreen() {
  const [loading, setLoading] = useState<boolean>(false);
  const navigation = useNavigation<NavigationProp<any>>();

  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema: loginValidationSchema,
    onSubmit: async (values) => {
      handleLogin(values.email, values.password);
    },
  });

  const handleSignup = async () => {
    navigation.navigate("Sign Up");
  };

  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    try {
      const user = await signInWithEmailAndPassword(
        auth,
        formik.values.email,
        formik.values.password
      );
      setLoading(false);
      if (user) navigation.navigate("Home");
    } catch (error: any) {
      setLoading(false);
      const typedError = error as { code: string; message: string };
      if (
        typedError.code === "auth/user-not-found" ||
        typedError.code === "auth/wrong-password"
      ) {
        alert("Invalid email or password. Please try again.");
      } else if (typedError.code === "auth/too-many-requests") {
        alert("Too many unsuccessful login attempts. Please try again later.");
      } else {
        alert("Sign-in error: " + typedError.message);
      }
    }
  };

  const handleForgotPassword = async () => {
    if (!formik.values.email) {
      Alert.alert("Input Required", "Please enter your email address.");
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, formik.values.email);
      setLoading(false);
      Alert.alert(
        "Check your Email",
        "A link to reset your password has been sent."
      );
    } catch (error: any) {
      setLoading(false);

      if (error.code === "auth/user-not-found") {
        Alert.alert("Error", "No user found with this email address.");
      } else {
        Alert.alert(
          "Error",
          "Failed to send password reset email. Please try again later."
        );
      }
    }
  };

  const handleFormSubmit = () => {
    if (!formik.isValid || !formik.dirty) {
      Alert.alert("Invalid", "Please fill in all fields correctly.");
      return;
    }
    formik.handleSubmit();
  };

  return (
    <>
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
        <View style={styles.container}>
          <Image
            source={require("@/assets/images/logo.png")}
            style={styles.image}
          />
          <Text style={styles.heading}>Sign In</Text>
          <View>
            <Text style={{ marginTop: 8 }}>Email</Text>
            <TextInput
              value={formik.values.email}
              onChangeText={formik.handleChange("email")}
              onBlur={formik.handleBlur("email")}
              style={styles.input}
              placeholder="Enter your Email...."
              autoCapitalize="none"
            />
            {formik.touched.email && formik.errors.email && (
              <Text style={styles.errorText}>{formik.errors.email}</Text>
            )}
            <Text style={{ marginTop: 8 }}>Password</Text>
            <TextInput
              secureTextEntry={true}
              value={formik.values.password}
              onChangeText={formik.handleChange("password")}
              onBlur={formik.handleBlur("password")}
              style={styles.input}
              placeholder="Enter your Password..."
              autoCapitalize="none"
            />
            {formik.touched.password && formik.errors.password && (
              <Text style={styles.errorText}>{formik.errors.password}</Text>
            )}
            <TouchableOpacity
              onPress={handleForgotPassword}
              style={{ alignItems: "flex-end", marginVertical: 4 }}
            >
              <Text style={{ color: "#356ec3" }}>Forgot Password?</Text>
            </TouchableOpacity>
            {loading ? (
              <ActivityIndicator
                size="large"
                color="#0000ff"
                style={{ marginTop: 4 }}
              />
            ) : (
              <>
                <TouchableOpacity
                  style={styles.buttonContainer}
                  onPress={handleFormSubmit}
                >
                  <Text style={styles.buttonText}>Login</Text>
                </TouchableOpacity>
              </>
            )}
            <View
              style={{
                width: "100%",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                marginVertical: 6,
              }}
            >
              <Divider />
              <Text style={{ marginHorizontal: 6 }}>or Sign In with</Text>
              <Divider />
            </View>
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
              }}
            >
              <Apple />
              <Google />
              <Facebook />
              <Yahoo />
            </View>
          </View>

          <StatusBar style="auto" />
        </View>
      </KeyboardAvoidingView>
      <View style={styles.route}>
        <Text>Don't have an account?</Text>
        <TouchableOpacity onPress={handleSignup}>
          <Text style={{ color: "#356ec3" }}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  errorText: {
    fontSize: 12,
    color: "red",
  },
  container: {
    paddingHorizontal: 20,
    flex: 1,
    justifyContent: "center",
  },
  heading: {
    alignSelf: "center",
    marginBottom: 24,
    fontSize: 28,
  },
  image: {
    alignSelf: "center",
    transform: [{ scale: 0.5 }],
  },
  input: {
    marginVertical: 6,
    height: 50,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    backgroundColor: "#fff",
  },
  buttonContainer: {
    width: "auto",
    marginVertical: 10,
    padding: 12,
    backgroundColor: "#356ec3",
    borderRadius: 8,
  },
  buttonText: {
    alignSelf: "center",
    fontWeight: "bold",
    color: "#fff",
    fontSize: 16,
  },
  route: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    justifyContent: "flex-end",
    alignItems: "center",
  },
});
