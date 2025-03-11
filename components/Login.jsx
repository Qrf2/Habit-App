import {
  StyleSheet,
  Text,
  View,
  Image,
  Alert,
  TextInput,
  TouchableOpacity,
} from "react-native";
import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { auth } from "../firebaseConfig";
import { CommonActions } from "@react-navigation/native";
import { signInWithEmailAndPassword } from "firebase/auth";
import AntDesign from "@expo/vector-icons/AntDesign";

const Login = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      Alert.alert("Success", "Logged in successfully!");
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "BottomNavigationBar" }], // Replace 'HT' with the actual name of your HT screen
        })
      );
    } catch (error) {
      Alert.alert("Login Failed", error.message);
    }
  };
  return (
    <View className="">
      {/* logo */}
      <View className="justify-center items-center mb-9">
        <Image
          source={require("../assets/images/Habity.png")}
          className=" w-48 h-40 "
        />
      </View>
      {/* login box */}
      <View className="ml-5">
        <Text className="font-medium text-xl ">Login to your Account</Text>
      </View>
      <View className="items-center mt-5">
        <TextInput
          placeholder="Email"
          placeholderTextColor={"#000"}
          cursorColor={"#000"}
          value={email}
          onChangeText={setEmail}
          className="h-14 w-96 border border-gray-200 m-5 pl-5"
        />
        <View className="flex-row items-center">
          <TextInput
            placeholder="Password"
            placeholderTextColor={"#000"}
            cursorColor={"#000"}
            secureTextEntry={!passwordVisible}
            value={password}
            onChangeText={setPassword}
            className="h-14 w-80 border border-gray-200 pl-6"
          />
          <TouchableOpacity
            onPress={() => setPasswordVisible(!passwordVisible)}
            className="ml-2"
          >
            <AntDesign
              name={passwordVisible ? "eye" : "eyeo"}
              size={20}
              color="#011a42"
            />
          </TouchableOpacity>
        </View>
      </View>
      {/* Button */}
      <View className="justify-center items-center">
        <TouchableOpacity
          className="bg-blue-950 h-14 w-96 m-9 rounded-lg"
          onPress={handleLogin}
        >
          <View className="flex-1 justify-center">
            <Text className="text-white text-center text-base">Sign in</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Account signup */}
      <View className="items-center m-20">
        <Text>Don't have an account?</Text>

        <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
          <Text className="text-blue-600">Sign up</Text>
        </TouchableOpacity>
      </View>
      {/* END */}
    </View>
  );
};

export default Login;

const styles = StyleSheet.create({});
