import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { BarChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getStreakCount } from "./redux/actions";
import { DeviceEventEmitter } from 'react-native';

const screenWidth = Dimensions.get("window").width;

const Progress = () => {
  const habits = useSelector((state) => state.habits?.habits || []);
  const [selectedTimeframe, setSelectedTimeframe] = useState("daily");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [historicalData, setHistoricalData] = useState({});
  const [streakCount, setStreakCount] = useState(0);
  const [streakUpdated, setStreakUpdated] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    loadHistoricalData();
    loadStreakData();
    
    // Listen for data cleared event
    const progressDataClearedSubscription = DeviceEventEmitter.addListener(
      'progressDataCleared', 
      () => {
        // Reset historical data and streak count
        setHistoricalData({});
        setStreakCount(0);
      }
    );
    
    // Listen for streak updates
    const streakUpdatedSubscription = DeviceEventEmitter.addListener(
      'streakUpdated',
      (newStreakCount) => {
        setStreakCount(newStreakCount);
        // Trigger animation effect when streak updates
        setStreakUpdated(true);
        setTimeout(() => setStreakUpdated(false), 2000);
      }
    );
    
    return () => {
      progressDataClearedSubscription.remove();
      streakUpdatedSubscription.remove();
    };
  }, [dispatch]);

  const loadHistoricalData = async () => {
    try {
      const data = await AsyncStorage.getItem('habitHistory');
      if (data) {
        setHistoricalData(JSON.parse(data));
      }
    } catch (error) {
      console.error('Error loading historical data:', error);
    }
  };
  
  const loadStreakData = async () => {
    try {
      // Wrap in a setTimeout to ensure it doesn't happen during render
      setTimeout(async () => {
        const streak = await dispatch(getStreakCount());
        setStreakCount(streak);
      }, 0);
    } catch (error) {
      console.error('Error loading streak data:', error);
    }
  };
  
  // Calculate completion stats
  const calculateStats = () => {
    const totalHabits = habits.length;
    const completedHabits = habits.filter(habit => {
      if (habit.trackingType === 'check') {
        return habit.completed;
      } else if (habit.trackingType === 'counter' && habit.counterGoal) {
        return (habit.progress || 0) >= habit.counterGoal;
      } else if (habit.trackingType === 'timer' && habit.timerGoal) {
        return (habit.progress || 0) >= habit.timerGoal;
      }
      return false;
    }).length;

    const completionRate = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0;
    return { totalHabits, completedHabits, completionRate };
  };

  const { totalHabits, completedHabits, completionRate } = calculateStats();

  // Get unique categories from habits
  const categories = ["All", ...new Set(habits.map(habit => 
    habit.name.split(' ')[0]
  ))];

  // Filter habits by category
  const filteredHabits = selectedCategory === "All" 
    ? habits 
    : habits.filter(habit => habit.name.toLowerCase().includes(selectedCategory.toLowerCase()));

  // Generate chart data based on habit completion
  const getDayLabel = (daysAgo) => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const chartData = {
    labels: Array(7).fill().map((_, i) => getDayLabel(6 - i)),
    datasets: [{
      data: Array(7).fill().map((_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        const dateKey = date.toISOString().split('T')[0];
        return historicalData[dateKey]?.completionRate || 0;
      })
    }]
  };

  // Render streak section with animation
  const renderStreakSection = () => {
    return (
      <View className={`flex-row items-center justify-center mb-4 p-3 rounded-lg ${streakUpdated ? 'bg-yellow-100' : 'bg-orange-50'}`}>
        <Text className="text-lg font-bold mr-2">Current Streak:</Text>
        <View className="flex-row items-center">
          <Text className={`text-2xl font-bold ${streakUpdated ? 'text-red-500' : 'text-orange-600'}`} 
                style={{ transform: [{ scale: streakUpdated ? 1.2 : 1 }] }}>
            {streakCount}
          </Text>
          <Text className="text-2xl ml-1">🔥</Text>
        </View>
      </View>
    );
  };

  return (
    <ScrollView className="flex-1 bg-white p-4">
      <Text className="text-2xl font-bold mb-4 text-center">Progress Tracker</Text>
      
      {/* Streak Display - Always visible */}
      {renderStreakSection()}

      {/* Stats Cards */}
      <View className="flex-row justify-between mb-6">
        <View className="bg-blue-50 p-4 rounded-xl flex-1 mr-2">
          <Text className="text-gray-700 mb-1">Completion Rate</Text>
          <Text className="text-2xl font-bold">{completionRate}%</Text>
        </View>
        <View className="bg-green-50 p-4 rounded-xl flex-1 ml-2">
          <Text className="text-gray-700 mb-1">Habits Completed</Text>
          <Text className="text-2xl font-bold">{completedHabits}/{totalHabits}</Text>
        </View>
      </View>

      {/* Time Frame Filter */}
      <View className="flex-row justify-around px-4 mb-6">
        {["daily", "weekly", "monthly"].map((timeframe) => (
          <TouchableOpacity
            key={timeframe}
            onPress={() => setSelectedTimeframe(timeframe)}
            className={`px-6 py-2 rounded-full ${
              selectedTimeframe === timeframe ? "bg-blue-500" : "bg-gray-200"
            }`}
          >
            <Text
              className={`capitalize ${
                selectedTimeframe === timeframe ? "text-white" : "text-gray-700"
              }`}
            >
              {timeframe}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Progress Overview */}
      <View className="bg-blue-50 mx-4 p-6 rounded-xl mb-6">
        <Text className="text-lg font-semibold mb-2">Today's Progress</Text>
        <View className="flex-row justify-between items-center">
          <Text className="text-3xl font-bold">
            {completedHabits}/{totalHabits}
          </Text>
          <Text className="text-lg text-blue-600">
            {completionRate}% Complete
          </Text>
        </View>
      </View>

      {/* Category Filter */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        className="px-4 mb-6"
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            onPress={() => setSelectedCategory(category)}
            className={`mr-2 px-4 py-2 rounded-full ${
              selectedCategory === category ? "bg-blue-500" : "bg-gray-200"
            }`}
          >
            <Text
              className={`${
                selectedCategory === category ? "text-white" : "text-gray-700"
              }`}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Progress Chart */}
      <View className="mx-4 mb-6">
        <Text className="text-lg font-semibold mb-4">Progress Over Time</Text>
        <BarChart
          data={chartData}
          width={screenWidth - 32}
          height={200}
          yAxisSuffix="%"
          chartConfig={{
            backgroundColor: "#fff",
            backgroundGradientFrom: "#fff",
            backgroundGradientTo: "#fff",
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16,
            },
          }}
          style={{
            marginVertical: 8,
            borderRadius: 16,
          }}
        />
      </View>

      {/* Habit List with Progress */}
      <View className="mx-4 mb-6">
        <Text className="text-lg font-semibold mb-4">Habit Progress</Text>
        {filteredHabits.map((habit) => {
          let progress = 0;
          if (habit.trackingType === 'check') {
            progress = habit.completed ? 100 : 0;
          } else if (habit.trackingType === 'counter' && habit.counterGoal) {
            progress = Math.min(100, ((habit.progress || 0) / habit.counterGoal) * 100);
          } else if (habit.trackingType === 'timer' && habit.timerGoal) {
            progress = Math.min(100, ((habit.progress || 0) / habit.timerGoal) * 100);
          }

          return (
            <View key={habit.id} className="mb-4 bg-gray-50 p-4 rounded-lg">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="font-medium">{habit.name}</Text>
                <Text className="text-blue-600">{Math.round(progress)}%</Text>
              </View>
              <View className="h-2 bg-gray-200 rounded-full">
                <View
                  className="h-2 bg-blue-500 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
};

export default Progress;
