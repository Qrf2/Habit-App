import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  Modal,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import { addHabit } from "../redux/actions";
import AntDesign from "@expo/vector-icons/AntDesign";
import Icon, { HABIT_ICONS } from "../animation/Icon";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const COLORS = [
  "#FF6F61", // Coral
  "#6B5B95", // Royal Purple
  "#88B04B", // Moss Green
  "#F7CAC9", // Rose Quartz
  "#92A8D1", // Serenity Blue
  "#955251", // Marsala
  "#B565A7", // Orchid
  "#009B77", // Teal
  "#DD4124", // Flame Orange
  "#45B8AC", // Turquoise
  "#EFC050", // Mimosa Yellow
  "#5B5EA6", // Iris Blue
  "#9B2335", // Crimson
  "#DFCFBE", // Sand
  "#BC243C", // Beet Red
];

const TRACKING_TYPES = [
  {
    id: 'counter',
    label: 'Counter',
    icon: 'counter',
    iconType: 'MaterialCommunityIcons',
    description: 'Track by counting (e.g., glasses of water)'
  },
  {
    id: 'timer',
    label: 'Stopwatch',
    icon: 'clockcircle',
    description: 'Track by time duration'
  },
  {
    id: 'check',
    label: 'Simple Check',
    icon: 'check',
    description: 'Just mark as done'
  }
];

const AddHabit = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const [habitName, setHabitName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState(null);
  const [selectedColor, setSelectedColor] = useState("#1d4ed8");
  const [trackingType, setTrackingType] = useState('check');
  const [nameError, setNameError] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  
  // New state for counter/timer settings
  const [counterGoal, setCounterGoal] = useState(1);
  const [timerGoal, setTimerGoal] = useState({
    hours: 0,
    minutes: 30,
    seconds: 0
  });

  const updateTimerValue = (field, value) => {
    const limits = {
      hours: { min: 0, max: 23 },
      minutes: { min: 0, max: 59 },
      seconds: { min: 0, max: 59 }
    };

    const newValue = Math.max(
      limits[field].min,
      Math.min(value, limits[field].max)
    );

    setTimerGoal(prev => ({
      ...prev,
      [field]: newValue
    }));
  };

  const handleSave = () => {
    if (!habitName.trim()) {
      setNameError(true);
      return;
    }

    setNameError(false);
    const newHabit = {
      id: Date.now().toString(),
      name: habitName.trim(),
      icon: selectedIcon,
      color: selectedColor,
      trackingType,
      counterGoal: trackingType === 'counter' ? counterGoal : null,
      timerGoal: trackingType === 'timer' ? 
        (timerGoal.hours * 3600 + timerGoal.minutes * 60 + timerGoal.seconds) : null,
      completed: false,
    };
    dispatch(addHabit(newHabit));
    navigation.navigate("BottomNavigationBar");
  };

  const handleIconSelect = (icon) => {
    setSelectedIcon(icon);
    if (!habitName.trim()) {
      setHabitName(icon.label);
    }
    setShowIconPicker(false);
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center p-4 border-b border-gray-200">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <AntDesign name="close" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-xl font-semibold ml-4">Create Habit</Text>
        <TouchableOpacity
          className="ml-auto bg-blue-600 px-4 py-2 rounded-full"
          onPress={handleSave}
        >
          <Text className="text-white font-medium">Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* Habit Name */}
        <View className="mb-6">
          <Text className="text-lg font-semibold mb-2">Habit Name</Text>
          <TextInput
            className={`border rounded-lg p-3 ${
              nameError ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Enter habit name"
            value={habitName}
            onChangeText={(text) => {
              setHabitName(text);
              setNameError(false);
            }}
          />
          {nameError && (
            <Text className="text-red-500 text-sm mt-1">
              Please enter a habit name
            </Text>
          )}
        </View>

        {/* Icon and Color Selection Row */}
        <View className="flex-row justify-between mb-6">
          {/* Icon Selection Box */}
          <TouchableOpacity
            className="flex-1 mr-2 bg-gray-200 rounded-lg p-3 items-center justify-center h-28"
            onPress={() => setShowIconPicker(true)}
          >
            <View className="items-center">
              {selectedIcon ? (
                <Icon type={selectedIcon.type} name={selectedIcon.name} />
              ) : (
                <Text className="text-gray-900 text-4xl">🤠</Text>
              )}
              <Text className="text-black text-lg mt-2">Icon</Text>
            </View>
          </TouchableOpacity>

          {/* Color Selection Box */}
          <TouchableOpacity
            className="flex-1 ml-2 bg-gray-200 rounded-lg p-3 items-center justify-center h-28"
            onPress={() => setShowColorPicker(true)}
          >
            <View className="items-center">
              <View
                className="w-11 h-11 rounded-full"
                style={{ backgroundColor: selectedColor }}
              />
              <Text className="text-gray-900 text-lg mt-2">Color</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* New Tracking Type Selection */}
        <View className="mb-6">
          <Text className="text-lg font-semibold mb-2">How do you want to track this habit?</Text>
          <View className="space-y-3">
            {TRACKING_TYPES.map((type) => (
              <TouchableOpacity
                key={type.id}
                className={`p-4 rounded-lg flex-row items-center ${
                  trackingType === type.id ? 'bg-blue-50 border border-blue-500' : 'bg-gray-50'
                }`}
                onPress={() => setTrackingType(type.id)}
              >
                {type.iconType === 'MaterialCommunityIcons' ? (
                  <MaterialCommunityIcons 
                    name={type.icon} 
                    size={24} 
                    color={trackingType === type.id ? '#1d4ed8' : '#666'} 
                  />
                ) : (
                  <AntDesign 
                    name={type.icon} 
                    size={24} 
                    color={trackingType === type.id ? '#1d4ed8' : '#666'} 
                  />
                )}
                <View className="ml-3">
                  <Text className={`font-medium ${trackingType === type.id ? 'text-blue-600' : 'text-gray-900'}`}>
                    {type.label}
                </Text>
                  <Text className="text-gray-500 text-sm">{type.description}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Conditional Goal Setting */}
        {trackingType === 'counter' && (
          <View className="mb-6">
            <Text className="text-lg font-semibold mb-2">Daily Goal</Text>
            <View className="bg-gray-50 rounded-2xl p-6">
              <View className="flex-row items-center justify-between">
                <TouchableOpacity
                  onPress={() => setCounterGoal(Math.max(1, counterGoal - 1))}
                  className="bg-white p-4 rounded-2xl shadow-sm"
                >
                  <MaterialCommunityIcons name="minus" size={28} color="#1d4ed8" />
                </TouchableOpacity>
                
                <View className="items-center">
                  <Text className="text-5xl font-bold text-gray-800">{counterGoal}</Text>
                  <Text className="text-gray-500 text-sm mt-1">times per day</Text>
                </View>

                <TouchableOpacity
                  onPress={() => setCounterGoal(counterGoal + 1)}
                  className="bg-white p-4 rounded-2xl shadow-sm"
                >
                  <MaterialCommunityIcons name="plus" size={28} color="#1d4ed8" />
                </TouchableOpacity>
              </View>

              {/* Quick Presets for Counter */}
              <View className="mt-6">
                <Text className="text-sm font-medium text-gray-600 mb-2">Quick Presets</Text>
                <View className="flex-row flex-wrap gap-2">
                  {[1, 2, 3, 5, 8, 10].map((count) => (
                    <TouchableOpacity
                      key={count}
                      onPress={() => setCounterGoal(count)}
                      className="bg-white px-3 py-2 rounded-full border border-gray-200"
                    >
                      <Text className="text-blue-600">{count}x</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          </View>
        )}

        {trackingType === 'timer' && (
          <View className="mb-6">
            <Text className="text-lg font-semibold mb-2">Time Goal</Text>
            <View className="bg-gray-50 rounded-2xl p-6">
              <View className="flex-row justify-center items-center space-x-4">
                {/* Hours */}
                <View className="items-center">
                  <TouchableOpacity
                    onPress={() => updateTimerValue('hours', timerGoal.hours + 1)}
                    className="bg-white w-16 h-12 rounded-t-lg items-center justify-center shadow-sm"
                  >
                    <AntDesign name="caretup" size={20} color="#1d4ed8" />
                  </TouchableOpacity>
                  <View className="bg-white w-16 h-16 items-center justify-center border-y border-gray-100">
                    <Text className="text-3xl font-bold text-gray-800">
                      {timerGoal.hours.toString().padStart(2, '0')}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => updateTimerValue('hours', timerGoal.hours - 1)}
                    className="bg-white w-16 h-12 rounded-b-lg items-center justify-center shadow-sm"
                  >
                    <AntDesign name="caretdown" size={20} color="#1d4ed8" />
                  </TouchableOpacity>
                  <Text className="text-sm text-gray-500 mt-2">Hours</Text>
                </View>

                <Text className="text-3xl font-bold text-gray-400">:</Text>

                {/* Minutes */}
                <View className="items-center">
                  <TouchableOpacity
                    onPress={() => updateTimerValue('minutes', timerGoal.minutes + 1)}
                    className="bg-white w-16 h-12 rounded-t-lg items-center justify-center shadow-sm"
                  >
                    <AntDesign name="caretup" size={20} color="#1d4ed8" />
                  </TouchableOpacity>
                  <View className="bg-white w-16 h-16 items-center justify-center border-y border-gray-100">
                    <Text className="text-3xl font-bold text-gray-800">
                      {timerGoal.minutes.toString().padStart(2, '0')}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => updateTimerValue('minutes', timerGoal.minutes - 1)}
                    className="bg-white w-16 h-12 rounded-b-lg items-center justify-center shadow-sm"
                  >
                    <AntDesign name="caretdown" size={20} color="#1d4ed8" />
                  </TouchableOpacity>
                  <Text className="text-sm text-gray-500 mt-2">Minutes</Text>
                </View>

                <Text className="text-3xl font-bold text-gray-400">:</Text>

                {/* Seconds */}
                <View className="items-center">
                  <TouchableOpacity
                    onPress={() => updateTimerValue('seconds', timerGoal.seconds + 1)}
                    className="bg-white w-16 h-12 rounded-t-lg items-center justify-center shadow-sm"
                  >
                    <AntDesign name="caretup" size={20} color="#1d4ed8" />
                  </TouchableOpacity>
                  <View className="bg-white w-16 h-16 items-center justify-center border-y border-gray-100">
                    <Text className="text-3xl font-bold text-gray-800">
                      {timerGoal.seconds.toString().padStart(2, '0')}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => updateTimerValue('seconds', timerGoal.seconds - 1)}
                    className="bg-white w-16 h-12 rounded-b-lg items-center justify-center shadow-sm"
                  >
                    <AntDesign name="caretdown" size={20} color="#1d4ed8" />
                  </TouchableOpacity>
                  <Text className="text-sm text-gray-500 mt-2">Seconds</Text>
                </View>
              </View>

              {/* Quick Presets */}
              <View className="mt-6">
                <Text className="text-sm font-medium text-gray-600 mb-2">Quick Presets</Text>
                <View className="flex-row flex-wrap gap-2">
                  {[5, 10, 15, 30, 45, 60].map((mins) => (
                    <TouchableOpacity
                      key={mins}
                      onPress={() => setTimerGoal({ hours: 0, minutes: mins, seconds: 0 })}
                      className="bg-white px-3 py-2 rounded-full border border-gray-200"
                    >
                      <Text className="text-blue-600">{mins} min</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
        </View>
        )}
      </ScrollView>

      {/* Icon Picker Modal */}
      <Modal
        visible={showIconPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowIconPicker(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl h-[80%]">
            <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
              <View className="flex-row items-center">
                <Text className="text-lg font-semibold">Select Icon</Text>
                {selectedIcon && (
                  <TouchableOpacity
                    className="ml-4 bg-red-100 px-3 py-1 rounded-full"
                    onPress={() => {
                      setSelectedIcon(null);
                      setShowIconPicker(false);
                    }}
                  >
                    <Text className="text-red-600 text-sm">None</Text>
                  </TouchableOpacity>
                )}
              </View>
              <TouchableOpacity onPress={() => setShowIconPicker(false)}>
                <AntDesign name="close" size={24} color="black" />
              </TouchableOpacity>
            </View>

            {/* Icon Grid */}
            <ScrollView className="flex-1 p-4">
              <View className="flex-row flex-wrap justify-between">
                {HABIT_ICONS.map((icon) => (
                  <TouchableOpacity
                    key={icon.name}
                    onPress={() => handleIconSelect(icon)}
                    className={`w-[22%] mb-4 rounded-lg justify-center items-center ${
                      selectedIcon?.name === icon.name
                        ? "bg-blue-50"
                        : "bg-gray-50"
                    }`}
                  >
                    <Icon
                      type={icon.type}
                      name={icon.name}
                      showLabel
                      label={icon.label}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Color Picker Modal */}
      <Modal
        visible={showColorPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowColorPicker(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-4">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-semibold">Choose Color</Text>
              <TouchableOpacity onPress={() => setShowColorPicker(false)}>
                <AntDesign name="close" size={24} color="black" />
              </TouchableOpacity>
            </View>
            <View className="flex-row flex-wrap justify-between">
              {COLORS.map((color) => (
                <TouchableOpacity
                  key={color}
                  onPress={() => {
                    setSelectedColor(color);
                    setShowColorPicker(false);
                  }}
                  className={`w-12 h-12 rounded-full mb-4 ${
                    selectedColor === color ? "border-2 border-gray-900" : ""
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default AddHabit;
