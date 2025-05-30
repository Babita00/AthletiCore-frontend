import React from "react";
import { View, Text, Image, ImageSourcePropType } from "react-native";

interface EventCardProps {
  title: string;
  location: string;
  date: string;
  image: string | ImageSourcePropType;
  category?: string;
  weightCategory?: string;
  gender?: "Male" | "Female" | "All";
  registrationDeadline?: string;
}

export default function EventCard({
  title,
  location,
  date,
  image,
  category = "Powerlifting",
  weightCategory = "All",
  gender = "All",
  registrationDeadline = "N/A",
}: EventCardProps) {
  return (
    <View className="bg-gray-800 rounded-xl shadow-lg mb-4 mx-4 overflow-hidden">
      {/* Category Label */}
      <View className="px-4 pt-3 pb-1">
        <Text className="text-xs text-blue-400 font-medium uppercase tracking-wide">
          {category}
        </Text>
      </View>

      {/* Main Content */}
      <View className="flex-row p-4 pt-2">
        {/* Image Section */}
                <Image
          source={require("../assets/images/powerlifting.png")}
          className="w-20 h-20 rounded-md ml-2"
          resizeMode="cover"
        />

        {/* Event Details */}
        <View className="flex-1 justify-between py-1">
          <Text
            className="text-white font-bold text-lg leading-tight mb-1"
            numberOfLines={2}
          >
            {title}
          </Text>

          <Text className="text-gray-300 text-sm mb-1">📍 {location}</Text>
          <Text className="text-gray-400 text-sm mb-1">📅 {date}</Text>
          <Text className="text-gray-400 text-sm mb-1">
            🏋️ WeightCategory: {weightCategory}
          </Text>
          <Text className="text-gray-400 text-sm mb-1">
            🚻 Gender: {gender}
          </Text>
          <Text className="text-red-400 text-sm">
            🕒 Register by: {registrationDeadline}
          </Text>
        </View>
      </View>

      {/* Bottom Accent */}
      <View className="h-1 bg-gradient-to-r from-blue-500 to-purple-600" />
    </View>
  );
}
