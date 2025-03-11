import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
import { DeviceEventEmitter } from 'react-native';

// Action Types
export const ADD_HABIT = "ADD_HABIT";
export const TOGGLE_HABIT_COMPLETION = "TOGGLE_HABIT_COMPLETION";
export const SET_HABITS = "SET_HABITS";
export const DELETE_HABIT = "DELETE_HABIT";
export const RESET_HABITS_FOR_NEW_DAY = "RESET_HABITS_FOR_NEW_DAY";
export const UPDATE_HABIT_PROGRESS = "UPDATE_HABIT_PROGRESS";
export const UPDATE_STREAK = "UPDATE_STREAK";

// Helper function to update habit history
const updateHabitHistory = async (habits) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const historicalData = JSON.parse(await AsyncStorage.getItem('habitHistory') || '{}');
    
    // Calculate today's stats
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

    // Update history
    historicalData[today] = {
      completionRate,
      totalHabits,
      completedHabits,
      habits: habits.map(h => ({
        id: h.id,
        name: h.name,
        completed: h.completed,
        progress: h.progress || 0,
      }))
    };

    await AsyncStorage.setItem('habitHistory', JSON.stringify(historicalData));
    
    // Check if at least one habit is completed for streak update
    if (completedHabits > 0) {
      await updateStreakCount();
    } else {
      // Reset streak to 0 if no habits were completed today
      await resetStreakCount();
    }
  } catch (error) {
    console.error('Error updating habit history:', error);
  }
};

// Helper function to update streak count
const updateStreakCount = async () => {
  try {
    // Get current streak
    const streakData = JSON.parse(await AsyncStorage.getItem('streakData') || '{"currentStreak": 0, "lastUpdated": null}');
    const today = new Date().toISOString().split('T')[0];
    
    // Check if this is the first update or if we need to check for streak continuity
    if (!streakData.lastUpdated) {
      // First time tracking streak
      streakData.currentStreak = 1;
      streakData.lastUpdated = today;
    } else {
      const lastDate = new Date(streakData.lastUpdated);
      const currentDate = new Date(today);
      
      // Calculate the difference in days
      const timeDiff = currentDate.getTime() - lastDate.getTime();
      const dayDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
      
      if (dayDiff === 1) {
        // Consecutive day, increment streak
        streakData.currentStreak += 1;
        streakData.lastUpdated = today;
      } else if (dayDiff === 0) {
        // Same day, don't increment but update date
        streakData.lastUpdated = today;
      } else {
        // Streak broken, reset to 1
        streakData.currentStreak = 1;
        streakData.lastUpdated = today;
      }
    }
    
    // Save updated streak data
    await AsyncStorage.setItem('streakData', JSON.stringify(streakData));
    
    // Notify components that streak has been updated
    DeviceEventEmitter.emit('streakUpdated', streakData.currentStreak);
    
    return streakData.currentStreak;
  } catch (error) {
    console.error('Error updating streak:', error);
    return 0;
  }
};

// Helper function to reset streak count to 0
const resetStreakCount = async () => {
  try {
    const streakData = { currentStreak: 0, lastUpdated: new Date().toISOString().split('T')[0] };
    await AsyncStorage.setItem('streakData', JSON.stringify(streakData));
    
    // Notify components that streak has been reset
    DeviceEventEmitter.emit('streakUpdated', 0);
    
    return 0;
  } catch (error) {
    console.error('Error resetting streak:', error);
    return 0;
  }
};

// Helper function to check if a habit is completed
const isHabitCompleted = (habit) => {
  if (habit.trackingType === 'check') {
    return habit.completed;
  } else if (habit.trackingType === 'counter' && habit.counterGoal) {
    return (habit.progress || 0) >= habit.counterGoal;
  } else if (habit.trackingType === 'timer' && habit.timerGoal) {
    return (habit.progress || 0) >= habit.timerGoal;
  }
  return false;
};

// Action Creators with AsyncStorage
export const addHabit = (habit) => async (dispatch) => {
  try {
    const newHabit = { 
      ...habit, 
      id: Date.now().toString(), 
      completed: false,
      progress: 0 
    };
    
    const habits = JSON.parse(await AsyncStorage.getItem("habits") || "[]");
    habits.push(newHabit);
    await AsyncStorage.setItem("habits", JSON.stringify(habits));
    await updateHabitHistory(habits);

    dispatch({
      type: ADD_HABIT,
      payload: newHabit,
    });
  } catch (error) {
    console.error("Error adding habit to AsyncStorage:", error);
    Alert.alert("Error", "Failed to add habit. Please try again.");
  }
};

export const toggleHabitCompletion = (id) => async (dispatch, getState) => {
  try {
    dispatch({
      type: TOGGLE_HABIT_COMPLETION,
      payload: id,
    });
    
    const habits = getState().habits.habits;
    await AsyncStorage.setItem("habits", JSON.stringify(habits));
    await updateHabitHistory(habits);
  } catch (error) {
    console.error("Error updating habit completion:", error);
    Alert.alert("Error", "Failed to update habit. Please try again.");
  }
};

export const loadHabits = () => async (dispatch) => {
  try {
    const habits = JSON.parse(await AsyncStorage.getItem("habits") || "[]");
    dispatch({
      type: SET_HABITS,
      payload: habits,
    });
    await updateHabitHistory(habits);
  } catch (error) {
    console.error("Error loading habits from AsyncStorage:", error);
    Alert.alert("Error", "Failed to load habits. Please try again.");
  }
};

export const deleteHabit = (id) => async (dispatch) => {
  try {
    // Get current habits
    const storedHabits = await AsyncStorage.getItem("habits");
    let habits = storedHabits ? JSON.parse(storedHabits) : [];
    
    // Find the habit to be deleted
    const habitToDelete = habits.find(habit => habit.id === id);
    
    // Filter out the habit to delete
    habits = habits.filter((habit) => habit.id !== id);
    
    // Save updated habits
    await AsyncStorage.setItem("habits", JSON.stringify(habits));
    
    // Update habit history after deletion
    await updateHabitHistory(habits);
    
    // If we deleted a completed habit and there are no more completed habits,
    // we need to check if we should reset the streak
    const today = new Date().toISOString().split('T')[0];
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
    
    // If the deleted habit was completed and now there are no completed habits,
    // reset the streak
    if (habitToDelete && isHabitCompleted(habitToDelete) && completedHabits === 0) {
      await resetStreakCount();
    }
    
    dispatch({
      type: DELETE_HABIT,
      payload: id,
    });
    
    return habits;
  } catch (error) {
    console.error("Error deleting habit:", error);
    Alert.alert("Error", "Failed to delete habit. Please try again.");
    return [];
  }
};

export const resetHabitsForNewDay = () => async (dispatch, getState) => {
  try {
    dispatch({
      type: RESET_HABITS_FOR_NEW_DAY,
    });
    
    const habits = getState().habits.habits;
    await AsyncStorage.setItem("habits", JSON.stringify(habits));
    await updateHabitHistory(habits);
  } catch (error) {
    console.error("Error resetting habits:", error);
    Alert.alert("Error", "Failed to reset habits. Please try again.");
  }
};

export const updateHabitProgress = (habitId, progress) => async (dispatch, getState) => {
  try {
    dispatch({
      type: UPDATE_HABIT_PROGRESS,
      payload: { habitId, progress }
    });

    const habits = getState().habits.habits;
    await AsyncStorage.setItem("habits", JSON.stringify(habits));
    await updateHabitHistory(habits);
  } catch (error) {
    console.error("Error updating habit progress:", error);
    Alert.alert("Error", "Failed to update progress. Please try again.");
  }
};

export const getStreakCount = () => async () => {
  try {
    const streakData = JSON.parse(await AsyncStorage.getItem('streakData') || '{"currentStreak": 0, "lastUpdated": null}');
    return streakData.currentStreak;
  } catch (error) {
    console.error('Error getting streak count:', error);
    return 0;
  }
};
