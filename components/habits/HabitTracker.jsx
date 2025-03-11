import React from 'react';
import { View, ScrollView, Text } from 'react-native';
import { useSelector } from 'react-redux';
import HabitItem from './HabitItem';

const HabitTracker = () => {
  const habits = useSelector(state => state.habits);

  // Add console.log to debug
  console.log('Current habits:', habits);

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 p-4">
        {habits.length === 0 ? (
          <View className="flex-1 items-center justify-center py-8">
            <Text className="text-gray-500 text-lg">No habits added yet</Text>
          </View>
        ) : (
          habits.map(habit => (
            <HabitItem 
              key={habit.id} 
              habit={habit}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
};

export default HabitTracker; 