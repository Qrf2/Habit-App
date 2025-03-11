import React from "react";
import { View } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Entypo from "@expo/vector-icons/Entypo";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Ionicons from "@expo/vector-icons/Ionicons";
import HT from "../homescreen/HT";
import Progress from "../Progress";
import Setting from "../Setting";
import { Platform } from "react-native";

const Tab = createBottomTabNavigator();

const BottomNavigationBar = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: "#1161d9",
        tabBarInactiveTintColor: "#616161",
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopWidth: 0,
          elevation: 10,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerShown: false,
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HT}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: focused ? "#b4d3de" : "#fff",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Entypo name="home" size={24} color={focused ? "#1161d9" : "#616161"} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Stopwatch"
        component={Progress}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: focused ? "#b4d3de" : "#fff",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <FontAwesome6 name="chart-simple" size={24} color={focused ? "#1161d9" : "#616161"} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={Setting}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: focused ? "#b4d3de" : "#fff",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Ionicons name="settings" size={24} color={focused ? "#1161d9" : "#616161"} />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomNavigationBar;