import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import Login from "../Login";
import Signup from "../Signup";
import BottomNavigationBar from "./BottomNavigationBar";
import AddHabit from "../habits/AddHabit";
import HT from "../homescreen/HT";
const Stack = createStackNavigator();

const Navigators = () => {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Signup" component={Signup} />
      <Stack.Screen
        name="BottomNavigationBar"
        component={BottomNavigationBar}
      />
      <Stack.Screen name="AddHabit" component={AddHabit} />
      <Stack.Screen name="HT" component={HT} />
    </Stack.Navigator>
  );
};

export default Navigators;
