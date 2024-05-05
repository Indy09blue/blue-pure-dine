import {
  ActivityIndicator,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
} from "react-native";
import { Text, View } from "@/components/Themed";
import React, { useState } from "react";
import { auth, db } from "@/config/firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { NavigationProp, useNavigation } from "@react-navigation/native";

import { useFormik } from "formik";
import * as yup from "yup";
import Divider from "@/components/Divider";
import Apple from "@/components/auth-providers/Apple";
import Google from "@/components/auth-providers/Google";
import Yahoo from "@/components/auth-providers/Yahoo";
import Facebook from "@/components/auth-providers/Facebook";

export const signupValidationSchema = yup.object({
  fullname: yup.string().required("Full Name is required"),
  email: yup
    .string()
    .email("Please enter a valid email")
    .required("Email is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Confirm Password is required"),
});

export default function RegisterScreen() {
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<NavigationProp<any>>();
  const formik = useFormik({
    initialValues: {
      fullname: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema: signupValidationSchema,
    onSubmit: async (values) => {
      if (values.password !== values.confirmPassword) {
        alert("Passwords do not match");
        return;
      }
      handleSignup();
    },
  });

  const handleLogin = async () => {
    navigation.navigate("Sign In");
  };

  const handleSignup = async () => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formik.values.email,
        formik.values.password
      );
      const user = userCredential.user;
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, {
        uid: user.uid,
        fullName: formik.values.fullname,
        email: formik.values.email,
      });
      console.log("Signup successful, user:", user);
      setLoading(false);
      navigation.navigate("Questionnaire");
    } catch (error) {
      console.error("Error during signup or user details addition:", error);
      setLoading(false);
      alert(
        `Signup error: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  };

  return (
    <>
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
        <View style={styles.container}>
          <Image
            source={require("@/assets/images/logo.png")}
            style={styles.image}
          />
          <Text style={styles.heading}>Create Account</Text>
          <View>
            <Text style={{ marginTop: 8 }}>Full Name</Text>
            <TextInput
              value={formik.values.fullname}
              style={styles.input}
              placeholder="Enter your Full Name..."
              onChangeText={formik.handleChange("fullname")}
              onBlur={formik.handleBlur("fullname")}
            />
            {formik.touched.fullname && formik.errors.fullname && (
              <Text style={styles.errorText}>{formik.errors.fullname}</Text>
            )}

            <Text style={{ marginTop: 8 }}>Email</Text>
            <TextInput
              value={formik.values.email}
              style={styles.input}
              placeholder="Enter your Email..."
              onChangeText={formik.handleChange("email")}
              onBlur={formik.handleBlur("email")}
              autoCapitalize="none"
            />
            {formik.touched.email && formik.errors.email && (
              <Text style={styles.errorText}>{formik.errors.email}</Text>
            )}

            <Text style={{ marginTop: 8 }}>Password</Text>
            <TextInput
              secureTextEntry={true}
              value={formik.values.password}
              style={styles.input}
              placeholder="Enter your Password..."
              onChangeText={formik.handleChange("password")}
              onBlur={formik.handleBlur("password")}
              autoCapitalize="none"
            />
            {formik.touched.password && formik.errors.password && (
              <Text style={styles.errorText}>{formik.errors.password}</Text>
            )}

            <Text style={{ marginTop: 8 }}>Confirm Password</Text>
            <TextInput
              secureTextEntry={true}
              value={formik.values.confirmPassword}
              style={styles.input}
              placeholder="Confirm your Password..."
              onChangeText={formik.handleChange("confirmPassword")}
              onBlur={formik.handleBlur("confirmPassword")}
              autoCapitalize="none"
            />
            {formik.touched.confirmPassword &&
              formik.errors.confirmPassword && (
                <Text style={styles.errorText}>
                  {formik.errors.confirmPassword}
                </Text>
              )}

            {loading ? (
              <ActivityIndicator size="large" color="#0000ff" />
            ) : (
              <TouchableOpacity
                style={styles.buttonContainer}
                onPress={() => handleSignup()}
              >
                <Text style={styles.buttonText}>Sign Up</Text>
              </TouchableOpacity>
            )}
          </View>
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
            <Text style={{ marginHorizontal: 6 }}>or Register with</Text>
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

        <View style={styles.route}>
          <Text>Already have an account?</Text>
          <TouchableOpacity onPress={handleLogin}>
            <Text style={{ color: "#356ec3" }}>Log In</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    justifyContent: "center",
    flex: 1,
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
