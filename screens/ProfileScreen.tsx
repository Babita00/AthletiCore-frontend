// app/(tabs)/Profile.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  Animated,
  Easing,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LineChart } from "react-native-chart-kit";

const { width } = Dimensions.get("window");
const screenWidth = Dimensions.get("window").width;

const dummyData = {
  profileImage: "https://i.pravatar.cc/150",
  name: "Alex Johnson",
  email: "alex.johnson@email.com",
  gender: "Male",
  age: 28,
  weightCategory: "63kg",
  totalEvents: 12,
  liftingStats: {
    squat: { current: 315, pr: 325 },
    benchPress: { current: 225, pr: 235 },
    deadlift: { current: 405, pr: 415 },
    overhead: { current: 155, pr: 165 },
  },
  social: {
    friends: 47,
    followers: 128,
    following: 89,
    leaderboardRank: 12,
  },
  achievements: [
    {
      id: 1,
      name: "First Workout",
      icon: "🏃",
      unlocked: true,
      date: "Mar 15, 2024",
    },
    {
      id: 2,
      name: "Week Warrior",
      icon: "🔥",
      unlocked: true,
      date: "Mar 22, 2024",
    },
    {
      id: 3,
      name: "PR Crusher",
      icon: "💪",
      unlocked: true,
      date: "Apr 10, 2024",
    },
    {
      id: 4,
      name: "Consistency King",
      icon: "👑",
      unlocked: true,
      date: "Apr 16, 2024",
    },
    { id: 5, name: "300 Club", icon: "🏆", unlocked: false, progress: 85 },
    { id: 6, name: "Beast Mode", icon: "🦁", unlocked: false, progress: 60 },
  ],
  performance: {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        data: [100, 120, 300, 250, 450, 300, 350],
        color: () => `rgba(59, 130, 246, 0.8)`,
        strokeWidth: 3,
      },
    ],
  },
};

export default function Profile() {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const slideAnim = useState(new Animated.Value(-width))[0];

  const openDrawer = () => {
    setDrawerVisible(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  };

  const closeDrawer = () => {
    Animated.timing(slideAnim, {
      toValue: -width,
      duration: 300,
      easing: Easing.in(Easing.ease),
      useNativeDriver: false,
    }).start(() => setDrawerVisible(false));
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-700 bg-neutral-900">
        <TouchableOpacity onPress={openDrawer}>
          <Text className="text-white text-2xl">☰</Text>
        </TouchableOpacity>
        <Text className="text-white text-lg font-semibold">Profile</Text>
      </View>

      <ScrollView className="px-4" showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center py-4">
          <View className="relative">
            <Image
              source={{ uri: dummyData.profileImage }}
              className="w-20 h-20 rounded-full"
            />
            <View className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-green-500 border-2 border-black" />
          </View>
          <View className="ml-4">
            <Text className="text-white text-xl font-semibold">
              {dummyData.name}
            </Text>
            <Text className="text-gray-400">Active Member</Text>
          </View>
        </View>

        <View className="flex-row flex-wrap justify-between">
          {[
            { label: "Email", value: dummyData.email },
            { label: "Age", value: `${dummyData.age} years` },
            { label: "Gender", value: dummyData.gender },
            { label: "Weight", value: dummyData.weightCategory },
            { label: "Total Events", value: dummyData.totalEvents },
          ].map((item, index) => (
            <View
              key={index}
              className="w-[48%] bg-gray-800 rounded-lg p-3 mb-3"
            >
              <Text className="text-gray-400 text-xs">{item.label}</Text>
              <Text className="text-white font-semibold">{item.value}</Text>
            </View>
          ))}
        </View>

        <Text className="text-white text-lg mt-6 mb-2 font-semibold">
          📈 Lifting Stats
        </Text>
        <View className="flex-row flex-wrap justify-between">
          {Object.entries(dummyData.liftingStats).map(([key, value], index) => (
            <View
              key={index}
              className="w-[48%] rounded-lg p-3 mb-3"
              style={{
                backgroundColor: ["#7f1d1d", "#1e3a8a", "#14532d", "#581c87"][
                  index
                ],
              }}
            >
              <Text className="text-white font-bold capitalize">{key}</Text>
              <Text className="text-white">Current: {value.current} lbs</Text>
              <Text className="text-gray-200 text-xs">PR: {value.pr} lbs</Text>
            </View>
          ))}
        </View>

        <Text className="text-white text-lg mt-6 mb-2 font-semibold">
          👥 Social
        </Text>
        <View className="flex-row justify-between flex-wrap">
          {[
            { label: "Friends", value: dummyData.social.friends },
            { label: "Followers", value: dummyData.social.followers },
            { label: "Following", value: dummyData.social.following },
            { label: "Rank", value: `#${dummyData.social.leaderboardRank}` },
          ].map((item, index) => (
            <View
              key={index}
              className="w-[48%] bg-gray-800 rounded-lg p-4 mb-3"
            >
              <Text className="text-white text-2xl font-bold">
                {item.value}
              </Text>
              <Text className="text-gray-400">{item.label}</Text>
            </View>
          ))}
        </View>

        <Text className="text-white text-lg mt-6 mb-2 font-semibold">
          🏆 Achievements
        </Text>
        <View className="flex-row flex-wrap justify-between">
          {dummyData.achievements.map((ach) => (
            <View
              key={ach.id}
              className={`w-[48%] rounded-lg p-3 mb-3 ${
                ach.unlocked ? "bg-green-900" : "bg-gray-800"
              }`}
            >
              <View className="flex-row justify-between items-center">
                <Text className="text-2xl">{ach.icon}</Text>
                {ach.unlocked && <Text className="text-yellow-400">⭐</Text>}
              </View>
              <Text className="text-white font-semibold mt-1">{ach.name}</Text>
              {ach.unlocked ? (
                <Text className="text-gray-400 text-xs">
                  Unlocked {ach.date}
                </Text>
              ) : (
                <View className="mt-2">
                  <View className="h-2 bg-gray-600 rounded-full overflow-hidden">
                    <View className="h-2 bg-yellow-400" />
                  </View>
                  <Text className="text-xs text-gray-400 mt-1">
                    {ach.progress}% Complete
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>

        <Text className="text-white text-lg mt-6 mb-2 font-semibold">
          🏋️‍♂️ Performance Overview
        </Text>
        <LineChart
          data={dummyData.performance}
          width={screenWidth - 32}
          height={220}
          chartConfig={{
            backgroundColor: "#1f2937",
            backgroundGradientFrom: "#1f2937",
            backgroundGradientTo: "#1f2937",
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
            labelColor: () => "#fff",
            propsForDots: {
              r: "4",
              strokeWidth: "2",
              stroke: "#3b82f6",
            },
          }}
          bezier
          style={{ borderRadius: 16 }}
        />

        <TouchableOpacity className="mt-4 bg-blue-600 py-3 rounded-lg items-center mb-3">
          <Text className="text-white font-semibold">
            📊 View Detailed Stats
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {drawerVisible && (
        <View className="absolute inset-0 flex-row">
          {/* Drawer */}
          <Animated.View
            className="w-64 bg-neutral-900 p-4"
            style={{ transform: [{ translateX: slideAnim }] }}
          >
            <TouchableOpacity onPress={closeDrawer} className="mb-4 self-end">
              <Text className="text-white text-lg">✖</Text>
            </TouchableOpacity>
            {[
              "Update Profile",
              "Download Records",
              "Change Password",
              "Log Out",
            ].map((label, index) => (
              <TouchableOpacity key={index} className="py-2">
                <Text className="text-white text-base">• {label}</Text>
              </TouchableOpacity>
            ))}
          </Animated.View>

          {/* Transparent area to close the drawer */}
          <TouchableOpacity
            className="flex-1 bg-black/50"
            activeOpacity={1}
            onPress={closeDrawer}
          />
        </View>
      )}
    </SafeAreaView>
  );
}
