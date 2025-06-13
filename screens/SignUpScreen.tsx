import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  SafeAreaView,
  Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { theme } from "@/constants/theme";

const colors = theme.dark;

interface FormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
  contactNumber: string;
  profilePicture: any;
  gender?: string;
  weight?: string;
  age?: string;
}

type FormField = keyof Omit<FormData, "profilePicture">;

const SignUpPage: React.FC = () => {
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    contactNumber: "",
    profilePicture: null,
    gender: "",
    weight: "",
    age: "",
  });

  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showGenderDropdown, setShowGenderDropdown] = useState(false);

  // const roles = ["Player", "Organizer", "Judge/Official"];
    const roles = ["Player", "Official"];

  const genders = ["Male", "Female", "Other"];

  const handleInputChange = (field: FormField, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleRoleSelect = (role: string) => {
    setFormData((prev) => ({ ...prev, role }));
    setShowRoleDropdown(false);
  };

  const handleGenderSelect = (gender: string) => {
    setFormData((prev) => ({ ...prev, gender }));
    setShowGenderDropdown(false);
  };

  const handleNext = async () => {
    const { fullName, email, password, confirmPassword, role, contactNumber } =
      formData;

    if (!fullName || !email || !password || !confirmPassword || !role || !contactNumber) {
      Alert.alert("Missing Fields", "Please fill in all required fields.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Password Mismatch", "Passwords do not match.");
      return;
    }

    if (!agreedToTerms) {
      Alert.alert("Terms", "Please agree to the terms to continue.");
      return;
    }

    try {
      console.log("Sign Up Data:", formData);
      Alert.alert("Success", "Account created successfully.");
      router.push("/(auth)");
    } catch (error) {
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={{ fontSize: 24, color: colors.onSurface, fontWeight: "bold", marginTop: 40, marginBottom: 20 }}>
          Create Account
        </Text>

        {/* Form Field */}
        {[
          { label: "Full Name", key: "fullName", keyboard: "default" },
          { label: "Email", key: "email", keyboard: "email-address" },
          { label: "Phone Number", key: "contactNumber", keyboard: "phone-pad" },
        ].map((field) => (
          <View key={field.key} style={styles.inputGroup}>
            <Text style={styles.label}>{field.label}</Text>
            <TextInput
              style={styles.input}
              placeholder={`Enter your ${field.label.toLowerCase()}`}
              placeholderTextColor={colors.onSurfaceVariant}
              keyboardType={field.keyboard as any}
              autoCapitalize="none"
              value={formData[field.key as FormField]}
              onChangeText={(text) => handleInputChange(field.key as FormField, text)}
            />
          </View>
        ))}

        {/* Role Dropdown */}
        <Text style={styles.label}>Role</Text>
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setShowRoleDropdown(!showRoleDropdown)}
        >
          <Text style={styles.dropdownText}>
            {formData.role || "Select your role"}
          </Text>
          <Text style={{ color: colors.onSurface }}>{showRoleDropdown ? "▲" : "▼"}</Text>
        </TouchableOpacity>
        {showRoleDropdown && (
          <View style={styles.dropdownList}>
            {roles.map((role, idx) => (
              <TouchableOpacity
                key={role}
                style={[styles.dropdownItem, idx !== roles.length - 1 && styles.borderBottom]}
                onPress={() => handleRoleSelect(role)}
              >
                <Text style={{ color: colors.onSurface }}>{role}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Conditional Fields for Player */}
        {formData.role === "Player" && (
          <>
            {/* Gender */}
            <Text style={styles.label}>Gender</Text>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setShowGenderDropdown(!showGenderDropdown)}
            >
              <Text style={styles.dropdownText}>
                {formData.gender || "Select your gender"}
              </Text>
              <Text style={{ color: colors.onSurface }}>{showGenderDropdown ? "▲" : "▼"}</Text>
            </TouchableOpacity>
            {showGenderDropdown && (
              <View style={styles.dropdownList}>
                {genders.map((gender, idx) => (
                  <TouchableOpacity
                    key={gender}
                    style={[styles.dropdownItem, idx !== genders.length - 1 && styles.borderBottom]}
                    onPress={() => handleGenderSelect(gender)}
                  >
                    <Text style={{ color: colors.onSurface }}>{gender}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Weight + Age */}
            {["weight", "age"].map((key) => (
              <View key={key} style={styles.inputGroup}>
                <Text style={styles.label}>{key === "weight" ? "Weight" : "Age"}</Text>
                <TextInput
                  style={styles.input}
                  placeholder={`Enter your ${key}`}
                  placeholderTextColor={colors.onSurfaceVariant}
                  keyboardType="numeric"
                  value={formData[key as FormField]}
                  onChangeText={(text) => handleInputChange(key as FormField, text)}
                />
              </View>
            ))}
          </>
        )}

        {/* Password Fields */}
        {["password", "confirmPassword"].map((key, idx) => (
          <View key={key} style={styles.inputGroup}>
            <Text style={styles.label}>{idx === 0 ? "Password" : "Confirm Password"}</Text>
            <TextInput
              style={styles.input}
              placeholder={idx === 0 ? "Enter your password" : "Re-enter your password"}
              placeholderTextColor={colors.onSurfaceVariant}
              secureTextEntry
              value={formData[key as FormField]}
              onChangeText={(text) => handleInputChange(key as FormField, text)}
            />
          </View>
        ))}

        {/* Terms & Agreement */}
        <TouchableOpacity
          onPress={() => setAgreedToTerms(!agreedToTerms)}
          style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}
        >
          <View
            style={{
              width: 20,
              height: 20,
              borderWidth: 2,
              borderColor: agreedToTerms ? colors.primary : colors.border,
              backgroundColor: agreedToTerms ? colors.primary : "transparent",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 10,
            }}
          >
            {agreedToTerms && <Feather name="check" size={12} color="#fff" />}
          </View>
          <Text style={{ color: colors.onSurface }}>I agree to the Terms and Conditions</Text>
        </TouchableOpacity>

        {/* Sign Up Button */}
        <TouchableOpacity
          onPress={handleNext}
          style={{
            backgroundColor: colors.primary,
            paddingVertical: 16,
            borderRadius: 8,
            marginBottom: 16,
          }}
        >
          <Text style={{ color: "#fff", textAlign: "center", fontSize: 16, fontWeight: "bold" }}>
            Sign Up
          </Text>
        </TouchableOpacity>

        {/* Login Redirect */}
        <Pressable onPress={() => router.push("/(auth)")}>
          <Text style={{ textAlign: "center", color: colors.secondary }}>
            Already have an account? <Text style={{ color: colors.accent }}>Login</Text>
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  inputGroup: { marginBottom: 20 },
  label: {
    color: colors.onSurfaceVariant,
    fontSize: 14,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.surface,
    color: colors.onSurface,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dropdown: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  dropdownText: {
    fontSize: 16,
    color: colors.onSurface,
  },
  dropdownList: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
  },
  dropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
});

export default SignUpPage;

// -----If we have backend API--------//
// import {
//   View,
//   Text,
//   TextInput,
//   Pressable,
//   Alert,
//   TouchableOpacity,
//   Animated,
// } from "react-native";
// import { useRouter } from "expo-router";
// import { useAuth } from "@/context/auth-context";
// import { useEffect, useRef, useState } from "react";
// import Feather from "react-native-vector-icons/Feather";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import axios from "axios";

// // Optional: Replace with your API base URL
// const API_URL = "https://your-api.com/api";

// export default function SignInScreen() {
//   const router = useRouter();
//   const { login } = useAuth();

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [rememberMe, setRememberMe] = useState(false);
//   const [emailError, setEmailError] = useState("");
//   const [passwordError, setPasswordError] = useState("");

//   const logoOpacity = useRef(new Animated.Value(0)).current;

//   useEffect(() => {
//     Animated.timing(logoOpacity, {
//       toValue: 1,
//       duration: 800,
//       useNativeDriver: true,
//     }).start();

//     (async () => {
//       const savedEmail = await AsyncStorage.getItem("rememberedEmail");
//       if (savedEmail) {
//         setEmail(savedEmail);
//         setRememberMe(true);
//       }
//     })();
//   }, []);

//   const handleLogin = async () => {
//     setEmailError("");
//     setPasswordError("");

//     if (!email.includes("@")) {
//       setEmailError("Enter a valid email address.");
//       return;
//     }
//     if (password.length < 4) {
//       setPasswordError("Password must be at least 4 characters.");
//       return;
//     }

//     try {
//       const response = await axios.post(`${API_URL}/login`, {
//         email,
//         password,
//       });

//       const { name, email: userEmail, role, token } = response.data;

//       // Save token
//       await AsyncStorage.setItem("authToken", token);

//       // Remember email if selected
//       if (rememberMe) {
//         await AsyncStorage.setItem("rememberedEmail", userEmail);
//       } else {
//         await AsyncStorage.removeItem("rememberedEmail");
//       }

//       // Update auth context
//       login({
//         name,
//         email: userEmail,
//         role,
//       });

//       // Navigate based on role
//       if (role === "official") {
//         router.replace("/(official)/dashboard");
//       } else {
//         router.replace("/(tabs)/events");
//       }

//     } catch (error: any) {
//       const message = error.response?.data?.message || "Invalid credentials";
//       Alert.alert("Login Failed", message);
//     }
//   };

//   return (
//     <View className="flex-1 justify-center px-6 bg-[#000000]">
//       <Text className="text-3xl font-bold text-white text-center mb-8">
//         Welcome To Athleticore
//       </Text>
//       <Text className="text-3xl font-bold text-white text-center mb-8">
//         Login Page
//       </Text>

//       {/* Email */}
//       <TextInput
//         className="bg-[#171717] text-white rounded-md p-4 mb-1"
//         placeholder="Email"
//         placeholderTextColor="#C5BFBF"
//         value={email}
//         onChangeText={setEmail}
//         keyboardType="email-address"
//         autoCapitalize="none"
//       />
//       {emailError ? (
//         <Text className="text-red-400 mb-2">{emailError}</Text>
//       ) : (
//         <View className="mb-2" />
//       )}

//       {/* Password */}
//       <View className="flex-row items-center bg-[#171717] rounded-md px-4 mb-1">
//         <TextInput
//           className="flex-1 text-white py-4"
//           placeholder="Password"
//           placeholderTextColor="#C5BFBF"
//           value={password}
//           onChangeText={setPassword}
//           secureTextEntry={!showPassword}
//         />
//         <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
//           <Feather
//             name={showPassword ? "eye-off" : "eye"}
//             size={20}
//             color="#C5BFBF"
//           />
//         </TouchableOpacity>
//       </View>
//       {passwordError ? (
//         <Text className="text-red-400 mb-2">{passwordError}</Text>
//       ) : (
//         <View className="mb-2" />
//       )}

//       {/* Remember Me + Forgot Password */}
//       <View className="flex-row justify-between items-center mb-6">
//         <TouchableOpacity
//           onPress={() => setRememberMe(!rememberMe)}
//           className="px-4 py-2 bg-[#211c1c] rounded-md"
//         >
//           <Text className="text-white font-semibold">Remember Me</Text>
//         </TouchableOpacity>

//         <Pressable onPress={() => router.push("/(auth)/forgot-password")}>
//           <Text className="text-white font-semibold">Forgot Password</Text>
//         </Pressable>
//       </View>

//       {/* Login Button */}
//       <TouchableOpacity
//         onPress={handleLogin}
//         className="bg-[#0c0c0c] py-4 rounded-md mb-4 active:opacity-80"
//       >
//         <Text className="text-center text-white font-bold text-lg">Login</Text>
//       </TouchableOpacity>

//       {/* Sign Up */}
//       <Pressable onPress={() => router.push("/(auth)/register")}>
//         <Text className="text-center text-gray-300 mt-2">
//           Don’t have an account?{" "}
//           <Text className="text-white font-semibold underline">Sign Up</Text>
//         </Text>
//       </Pressable>
//     </View>
//   );
// }
// -----If we have backend API--------//