import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  TouchableOpacity,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/auth-context";
import { useEffect, useRef, useState } from "react";
import Feather from "react-native-vector-icons/Feather";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { theme } from "@/constants/theme"; 

const colors = theme.dark; 

export default function SignInScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const logoOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(logoOpacity, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    (async () => {
      const savedEmail = await AsyncStorage.getItem("rememberedEmail");
      if (savedEmail) {
        setEmail(savedEmail);
        setRememberMe(true);
      }
    })();
  }, []);

  const handleLogin = async () => {
    let valid = true;

    if (!email.includes("@")) {
      setEmailError("Enter a valid email address.");
      valid = false;
    } else {
      setEmailError("");
    }

    if (password.length < 4) {
      setPasswordError("Password must be at least 4 characters.");
      valid = false;
    } else {
      setPasswordError("");
    }

    if (!valid) return;

    if (email === "user@player.com" && password === "Player") {
      if (rememberMe) {
        await AsyncStorage.setItem("rememberedEmail", email);
      } else {
        await AsyncStorage.removeItem("rememberedEmail");
      }

      login({ name: "Demo Player", email, role: "player" });
      router.replace("/(tabs)/events");

    } else if (email === "user@official.com" && password === "Official") {
      if (rememberMe) {
        await AsyncStorage.setItem("rememberedEmail", email);
      } else {
        await AsyncStorage.removeItem("rememberedEmail");
      }

      login({ name: "Judge John", email, role: "official" });
      router.replace("/(official)/dashboard");

    } else {
      Alert.alert("Invalid credentials", "Please check your email and password.");
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", paddingHorizontal: 24, backgroundColor: colors.background }}>
      <Text style={{ fontSize: 28, fontWeight: "bold", color: colors.onSurface, textAlign: "center", marginBottom: 16 }}>
        Welcome To Athleticore
      </Text>
      <Text style={{ fontSize: 28, fontWeight: "bold", color: colors.onSurface, textAlign: "center", marginBottom: 16 }}>
        Login Page
      </Text>

      {/* Email */}
      <TextInput
        style={{
          backgroundColor: colors.surface,
          color: colors.onSurface,
          borderRadius: 8,
          padding: 16,
          marginBottom: 4,
        }}
        placeholder="Email"
        placeholderTextColor={colors.onSurfaceVariant}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      {emailError ? (
        <Text style={{ color: colors.error, marginBottom: 8 }}>{emailError}</Text>
      ) : (
        <View style={{ marginBottom: 8 }} />
      )}

      {/* Password */}
      <View style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.surface,
        borderRadius: 8,
        paddingHorizontal: 16,
        marginBottom: 4
      }}>
        <TextInput
          style={{ flex: 1, color: colors.onSurface, paddingVertical: 16 }}
          placeholder="Password"
          placeholderTextColor={colors.onSurfaceVariant}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Feather
            name={showPassword ? "eye-off" : "eye"}
            size={20}
            color={colors.onSurfaceVariant}
          />
        </TouchableOpacity>
      </View>
      {passwordError ? (
        <Text style={{ color: colors.error, marginBottom: 8 }}>{passwordError}</Text>
      ) : (
        <View style={{ marginBottom: 8 }} />
      )}

      {/* Remember Me + Forgot Password */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <TouchableOpacity
          onPress={() => setRememberMe(!rememberMe)}
          style={{
            paddingHorizontal: 16,
            paddingVertical: 8,
            backgroundColor: colors.surfaceVariant,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: colors.onSurface, fontWeight: "600" }}>Remember Me</Text>
        </TouchableOpacity>

        <Pressable onPress={() => router.push("/(auth)/forgot-password")}>
          <Text style={{ color: colors.onSurface, fontWeight: "600" }}>Forgot Password</Text>
        </Pressable>
      </View>

      {/* Login Button */}
      <TouchableOpacity
        onPress={handleLogin}
        style={{
          backgroundColor: colors.primary,
          paddingVertical: 16,
          borderRadius: 8,
          marginBottom: 16,
        }}
      >
        <Text style={{ textAlign: "center", color: colors.onSurface, fontWeight: "bold", fontSize: 18 }}>
          Login
        </Text>
      </TouchableOpacity>

      {/* Sign Up */}
      <Pressable onPress={() => router.push("/(auth)/register")}>
        <Text style={{ textAlign: "center", color: colors.onSurfaceVariant, marginTop: 8 }}>
          Don’t have an account?{" "}
          <Text style={{ color: colors.onSurface, fontWeight: "600", textDecorationLine: "underline" }}>
            Sign Up
          </Text>
        </Text>
      </Pressable>
    </View>
  );
}
