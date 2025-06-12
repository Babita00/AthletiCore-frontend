import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Animated,
  Pressable,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "expo-router";
import { theme } from "@/constants/theme"; // Import the theme

const colors = theme.dark; // Use dark theme colors

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const logoOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(logoOpacity, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleResetPassword = () => {
    if (!email.includes("@")) {
      setEmailError("Enter a valid email address.");
      return;
    }
    setEmailError("");

    // Simulate sending reset link
    setEmail("");

    router.push("/(auth)/reset-password");
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", paddingHorizontal: 24, backgroundColor: colors.background }}>
      {/* Logo */}
      <Animated.View
        style={{ opacity: logoOpacity, alignItems: "center", marginBottom: 24 }}
      >
        <Image
          source={require("../assets/images/image.png")}
          style={{ width: 100, height: 100, borderRadius: 100 }}
        />
      </Animated.View>

      <Text style={{ fontSize: 28, fontWeight: "bold", color: colors.onSurface, textAlign: "center", marginBottom: 32 }}>
        Forgot Password
      </Text>

      {/* Email Input */}
      <TextInput
        style={{
          backgroundColor: colors.surface,
          color: colors.onSurface,
          borderRadius: 8,
          padding: 16,
          marginBottom: 4,
        }}
        placeholder="Enter your email"
        placeholderTextColor={colors.onSurfaceVariant}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      {emailError ? (
        <Text style={{ color: colors.error, marginBottom: 16 }}>{emailError}</Text>
      ) : (
        <View style={{ marginBottom: 16 }} />
      )}

      {/* Reset Button */}
      <TouchableOpacity
        onPress={handleResetPassword}
        style={{
          backgroundColor: colors.primary,
          paddingVertical: 16,
          borderRadius: 8,
          marginBottom: 16,
        }}
      >
        <Text style={{ textAlign: "center", color: colors.onSurface, fontWeight: "bold", fontSize: 18 }}>
          Reset Password
        </Text>
      </TouchableOpacity>

      {/* Back to Login */}
      <Pressable onPress={() => router.push("./(auth)/login")}>
        <Text style={{ textAlign: "center", color: colors.onSurfaceVariant, marginTop: 8 }}>
          Remembered your password?{" "}
          <Text style={{ color: colors.onSurface, fontWeight: "600", textDecorationLine: "underline" }}>
            Login
          </Text>
        </Text>
      </Pressable>
    </View>
  );
}
