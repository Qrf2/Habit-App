import {
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
} from "react-native";
import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import AntDesign from "@expo/vector-icons/AntDesign";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { fetchSignInMethodsForEmail } from "firebase/auth";

const Signup = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);

  // Function to handle user signup
  const firesignup = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !password || !confirmPassword) {
      Alert.alert("Error", "All fields are required.");
      return;
    }

    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Please enter a valid email address.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match!");
      return;
    }

    try {
      // Check if the email already exists
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);
      if (signInMethods.length > 0) {
        Alert.alert("Error", "Email already exists.");
        return;
      }
      // Attempt user signup with Firebase Authentication
      await createUserWithEmailAndPassword(auth, email, password);
      handleSignup(); // Show modal and navigate
    } catch (error) {
      Alert.alert("Signup Failed", error.message);
    }
  };

  const handleSignup = () => {
    setModalVisible(true);
    setTimeout(() => {
      setModalVisible(false);
      navigation.navigate("Login");
    }, 3000); // Show the modal for 3 seconds
  };
  return (
    <View className="flex-1">
      <TouchableOpacity
        className="m-3"
        onPress={() => navigation.navigate("Login")}
      >
        <AntDesign name="arrowleft" size={24} color="#011a42" />
      </TouchableOpacity>
      {/* logo */}
      <View className="justify-center items-center mb-9">
        <Image
          source={require("../assets/images/Habity.png")}
          className=" w-48 h-40 "
        />
      </View>
      {/* login box */}
      <View className="ml-5">
        <Text className="font-medium text-xl ">Create your Account</Text>
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
        {password.length > 0 && password.length < 6 && (
          <Text className="text-red-500 text-sm mt-1">
            Password must be at least 6 characters
          </Text>
        )}

        <View className="flex-row items-center m-5">
          <TextInput
            placeholder="Confirm Password"
            placeholderTextColor={"#000"}
            cursorColor={"#000"}
            secureTextEntry={!confirmPasswordVisible}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            className="h-14 w-80 border border-gray-200 pl-6"
          />
          <TouchableOpacity
            onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
            className="ml-2"
          >
            <AntDesign
              name={confirmPasswordVisible ? "eye" : "eyeo"}
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
          onPress={firesignup}
        >
          <View className="flex-1 justify-center">
            <Text className="text-white text-center text-base">Sign up</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* END */}

      {/* Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-white bg-opacity-50">
          <View className="w-72 p-5 bg-blue-950 rounded-lg items-center">
            <AntDesign name="checkcircle" size={37} color="white" />
            <Text className="mt-2 text-xl text-center text-white">Welcome</Text>
            <Text className="text-white"> {email}!</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Signup;

const styles = StyleSheet.create({});
