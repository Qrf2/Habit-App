import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Icon from '../animation/Icon';
import { useDispatch } from 'react-redux';
import { updateHabitProgress } from '../../redux/actions';

const HabitItem = ({ habit }) => {
  const dispatch = useDispatch();
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentCount, setCurrentCount] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Animation value for smooth expansion
  const [animation] = useState(new Animated.Value(0));

  // Load saved progress when component mounts
  useEffect(() => {
    if (habit.progress) {
      if (habit.trackingType === 'counter') {
        setCurrentCount(habit.progress);
      } else if (habit.trackingType === 'timer') {
        setElapsedTime(habit.progress);
      }
    }
  }, [habit]);

  const toggleExpand = () => {
    const toValue = isExpanded ? 0 : 1;
    Animated.spring(animation, {
      toValue,
      useNativeDriver: false,
    }).start();
    setIsExpanded(!isExpanded);
  };

  // Handle counter increment/decrement
  const handleCounter = (increment) => {
    const newCount = increment 
      ? Math.min(currentCount + 1, habit.counterGoal)
      : Math.max(currentCount - 1, 0);
    
    setCurrentCount(newCount);
    dispatch(updateHabitProgress(habit.id, newCount));
  };

  // Timer functions
  const toggleTimer = () => {
    if (!isTimerRunning) {
      setIsTimerRunning(true);
      startTimer();
    } else {
      setIsTimerRunning(false);
    }
  };

  const startTimer = () => {
    const interval = setInterval(() => {
      setElapsedTime(prev => {
        if (prev >= habit.timerGoal) {
          clearInterval(interval);
          setIsTimerRunning(false);
          return prev;
        }
        const newTime = prev + 1;
        dispatch(updateHabitProgress(habit.id, newTime));
        return newTime;
      });
    }, 1000);
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View className="mb-4">
      {/* Main Habit Card */}
      <TouchableOpacity
        onPress={toggleExpand}
        className="flex-row items-center p-4 rounded-lg"
        style={{ backgroundColor: habit.color }}
      >
        <View className="w-10 h-10 justify-center items-center bg-white/20 rounded-full">
          {habit.icon ? (
            <Icon type={habit.icon.type} name={habit.icon.name} color="white" />
          ) : (
            <Text className="text-white text-xl">🤠</Text>
          )}
        </View>
        <Text className="text-white text-lg font-semibold ml-3 flex-1">
          {habit.name}
        </Text>
        <MaterialCommunityIcons
          name={isExpanded ? "chevron-up" : "chevron-down"}
          size={24}
          color="white"
        />
      </TouchableOpacity>

      {/* Expandable Tracking Section */}
      <Animated.View
        className="rounded-b-lg overflow-hidden"
        style={{
          backgroundColor: `${habit.color}80`,
          transform: [{
            translateY: animation.interpolate({
              inputRange: [0, 1],
              outputRange: [-20, 0],
            })
          }],
          opacity: animation,
          height: animation.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 150],
          }),
        }}
      >
        <View className="p-4">
          {habit.trackingType === 'counter' && (
            <View className="flex-row items-center justify-between">
              <TouchableOpacity
                onPress={() => handleCounter(false)}
                className="bg-white/20 p-3 rounded-full"
              >
                <MaterialCommunityIcons name="minus" size={24} color="white" />
              </TouchableOpacity>
              
              <View className="items-center">
                <Text className="text-white text-3xl font-bold">
                  {currentCount}/{habit.counterGoal}
                </Text>
                <Text className="text-white/80">Progress</Text>
              </View>

              <TouchableOpacity
                onPress={() => handleCounter(true)}
                className="bg-white/20 p-3 rounded-full"
              >
                <MaterialCommunityIcons name="plus" size={24} color="white" />
              </TouchableOpacity>
            </View>
          )}

          {habit.trackingType === 'timer' && (
            <View className="items-center">
              <Text className="text-white text-3xl font-bold">
                {formatTime(elapsedTime)}
              </Text>
              <Text className="text-white/80 mb-2">
                Goal: {formatTime(habit.timerGoal)}
              </Text>
              <TouchableOpacity
                onPress={toggleTimer}
                className="bg-white/20 px-6 py-2 rounded-full"
              >
                <Text className="text-white font-medium">
                  {isTimerRunning ? 'Stop' : 'Start'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Animated.View>
    </View>
  );
};

export default HabitItem; 