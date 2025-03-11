import React from "react";
import { View, Text } from "react-native";
import {
  MaterialCommunityIcons,
  Ionicons,
  AntDesign,
  FontAwesome,
} from "@expo/vector-icons";

const ICON_COLOR = "#ab6700"; // Light blue color

export const HABIT_ICONS = [
  { type: "MaterialCommunityIcons", name: "meditation", label: "Meditation" },
  { type: "MaterialCommunityIcons", name: "run-fast", label: "Jogging" },
  { type: "MaterialCommunityIcons", name: "bike", label: "Cycling" },
  { type: "MaterialCommunityIcons", name: "dumbbell", label: "Weightlifting" },
  {
    type: "MaterialCommunityIcons",
    name: "fruit-watermelon",
    label: "Healthy Eating",
  },
  { type: "MaterialCommunityIcons", name: "apple", label: "Diet" },
  { type: "MaterialCommunityIcons", name: "arm-flex", label: "Exercise" },
  { type: "MaterialCommunityIcons", name: "brain", label: "Brain Training" },
  { type: "MaterialCommunityIcons", name: "calendar-check", label: "Planning" },
  {
    type: "MaterialCommunityIcons",
    name: "check-circle",
    label: "Task Completion",
  },
  { type: "MaterialCommunityIcons", name: "clock", label: "Time Management" },
  {
    type: "MaterialCommunityIcons",
    name: "coffee-outline",
    label: "Coffee Break",
  },
  { type: "MaterialCommunityIcons", name: "comment-text", label: "Journaling" },
  { type: "MaterialCommunityIcons", name: "desktop-mac", label: "Screen Time" },
  { type: "MaterialCommunityIcons", name: "dog-service", label: "Dog Walking" },
  {
    type: "MaterialCommunityIcons",
    name: "emoticon-happy",
    label: "Positivity",
  },
  { type: "MaterialCommunityIcons", name: "finance", label: "Budgeting" },
  { type: "MaterialCommunityIcons", name: "food-apple", label: "Nutrition" },
  {
    type: "MaterialCommunityIcons",
    name: "glass-cocktail",
    label: "Moderation",
  },
  { type: "MaterialCommunityIcons", name: "hand-heart", label: "Volunteering" },
  { type: "MaterialCommunityIcons", name: "headphones", label: "Listening" },
  { type: "MaterialCommunityIcons", name: "home-heart", label: "Family Time" },
  {
    type: "MaterialCommunityIcons",
    name: "human-greeting",
    label: "Socializing",
  },
  {
    type: "MaterialCommunityIcons",
    name: "language-python",
    label: "Learning Programming",
  },
  { type: "MaterialCommunityIcons", name: "leaf-maple", label: "Eco-Friendly" },
  { type: "MaterialCommunityIcons", name: "lightbulb-on", label: "Creativity" },
  { type: "MaterialCommunityIcons", name: "map-marker", label: "Exploring" },
  {
    type: "MaterialCommunityIcons",
    name: "microphone",
    label: "Public Speaking",
  },
  {
    type: "MaterialCommunityIcons",
    name: "music-note",
    label: "Playing Music",
  },
  { type: "MaterialCommunityIcons", name: "notebook", label: "Note-Taking" },
  { type: "MaterialCommunityIcons", name: "palette", label: "Painting" },
  { type: "MaterialCommunityIcons", name: "pencil-ruler", label: "Designing" },
  { type: "MaterialCommunityIcons", name: "pill", label: "Taking Vitamins" },
  {
    type: "MaterialCommunityIcons",
    name: "script-text",
    label: "Creative Writing",
  },
  { type: "MaterialCommunityIcons", name: "shoe-print", label: "Walking" },
  { type: "MaterialCommunityIcons", name: "spa", label: "Self-Care" },
  { type: "MaterialCommunityIcons", name: "television", label: "Watching TV" },
  { type: "MaterialCommunityIcons", name: "water-outline", label: "Hydration" },
  { type: "MaterialCommunityIcons", name: "weight", label: "Fitness" },
  { type: "MaterialCommunityIcons", name: "yoga", label: "Yoga Practice" },
  { type: "FontAwesome", name: "book", label: "Reading Books" },
  { type: "FontAwesome", name: "cutlery", label: "Cooking" },
  { type: "FontAwesome", name: "film", label: "Watching Movies" },
  { type: "FontAwesome", name: "gamepad", label: "Gaming" },
  { type: "FontAwesome", name: "globe", label: "Learning Languages" },
  { type: "FontAwesome", name: "heart", label: "Relationships" },
  { type: "FontAwesome", name: "leaf", label: "Gardening" },
  { type: "FontAwesome", name: "music", label: "Listening to Music" },
  { type: "FontAwesome", name: "paint-brush", label: "Drawing" },
  { type: "FontAwesome", name: "paw", label: "Pet Care" },
  { type: "FontAwesome", name: "pencil", label: "Sketching" },
  { type: "FontAwesome", name: "road", label: "Traveling" },
  { type: "FontAwesome", name: "shopping-cart", label: "Shopping" },
  { type: "FontAwesome", name: "spoon", label: "Baking" },
  { type: "FontAwesome", name: "tree", label: "Hiking" },
  { type: "FontAwesome", name: "university", label: "Studying" },
  { type: "FontAwesome", name: "video-camera", label: "Filmmaking" },
  { type: "FontAwesome", name: "wifi", label: "Networking" },
  { type: "FontAwesome", name: "camera", label: "Photography" },
  { type: "FontAwesome", name: "coffee", label: "Coffee Time" },
];

const Icon = ({
  type = "MaterialCommunityIcons",
  name,
  size = 28,
  color = ICON_COLOR,
  label,
  showLabel = false,
}) => {
  const renderIcon = () => {
    switch (type) {
      case "MaterialCommunityIcons":
        return <MaterialCommunityIcons name={name} size={size} color={color} />;
      case "Ionicons":
        return <Ionicons name={name} size={size} color={color} />;
      case "AntDesign":
        return <AntDesign name={name} size={size} color={color} />;
      case "FontAwesome":
        return <FontAwesome name={name} size={size} color={color} />;
      default:
        return <MaterialCommunityIcons name={name} size={size} color={color} />;
    }
  };

  return (
    <View className="items-center w-20">
      {renderIcon()}
      {showLabel && label && (
        <Text className="text-xs mt-2 text-black text-center w-full px-1 mb-1">
          {label}
        </Text>
      )}
    </View>
  );
};

export default Icon;
