import React, { useState, useEffect, useContext } from "react";
import { View, Text, TouchableOpacity, Image, TextInput, Alert, Platform, Linking, Switch, DeviceEventEmitter } from "react-native";
import { Ionicons, MaterialIcons, Feather, AntDesign } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { ProfileContext } from "../context/ProfileContext";

const Setting = () => {
  const { profileImage, updateProfileImage } = useContext(ProfileContext);
  const [name, setName] = useState("User");
  const [showAccount, setShowAccount] = useState(false);
  const [showSecurity, setShowSecurity] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [email, setEmail] = useState("User@example.com");
  const [password, setPassword] = useState("");
  const [pin, setPin] = useState("");
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);
  const [isHabitRemindersEnabled, setIsHabitRemindersEnabled] = useState(true);
  const [isEmailNotificationsEnabled, setIsEmailNotificationsEnabled] = useState(false);
  const [isDataSharingEnabled, setIsDataSharingEnabled] = useState(false);

  const requestPermissions = async () => {
    try {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: galleryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (cameraStatus !== "granted" || galleryStatus !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please enable camera and gallery access in your device settings.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Settings", onPress: () => Linking.openSettings() },
          ]
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error("Error requesting permissions:", error);
      Alert.alert("Error", "Failed to request permissions.");
      return false;
    }
  };

  const handleProfilePicPress = async () => {
    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) return;

      Alert.alert("Profile Picture", "Choose an option", [
        {
          text: "Take Photo",
          onPress: async () => {
            try {
              const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
              });

              if (!result.canceled && result.assets && result.assets[0]) {
                updateProfileImage({ uri: result.assets[0].uri });
              }
            } catch (error) {
              console.error("Error launching camera:", error);
              Alert.alert("Error", "Failed to open camera. Please try again.");
            }
          },
        },
        {
          text: "Choose from Gallery",
          onPress: async () => {
            try {
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
              });

              if (!result.canceled && result.assets && result.assets[0]) {
                updateProfileImage({ uri: result.assets[0].uri });
              }
            } catch (error) {
              console.error("Error launching image library:", error);
              Alert.alert("Error", "Failed to open gallery. Please try again.");
            }
          },
        },
        {
          text: "Remove Profile Picture",
          onPress: () => {
            updateProfileImage(require("../assets/images/dp.jpg"));
          },
        },
        {
          text: "Cancel",
          onPress: () => {},
          style: "cancel",
          icon: () => <AntDesign name="close" size={20} color="red" />,
        },
      ]);
    } catch (error) {
      console.error("Error in handleProfilePicPress:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  };

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        const savedImage = await AsyncStorage.getItem("profileImage");
        const savedName = await AsyncStorage.getItem("profileName");
        if (savedImage) updateProfileImage({ uri: savedImage });
        if (savedName) setName(savedName || "User");
      } catch (error) {
        console.log("Error loading profile data:", error);
      }
    };
    loadProfileData();
  }, []);

  const handleNameChange = async (newName) => {
    setName(newName);
    await AsyncStorage.setItem("profileName", newName);
    // Notify HT screen of the name change
    DeviceEventEmitter.emit('nameChanged', newName);
  };

  const handleLogout = async () => {
    await AsyncStorage.clear();
    Alert.alert("Logout", "Logged out successfully. Restart app to see changes.");
  };

  const handleSyncAccount = () => {
    Alert.alert("Sync Account", "Account synced successfully with 5 habits.", [
      { text: "OK", style: "default" },
    ]);
  };

  const handleClearData = () => {
    Alert.alert("Clear Data", "Are you sure? This will clear all saved data.", [
      { text: "Cancel", style: "cancel" },
      { text: "Yes", onPress: async () => {
        await AsyncStorage.clear();
        Alert.alert("Data Cleared", "All data has been cleared.");
      }},
    ]);
  };

  const openEmailSupport = () => {
    Linking.openURL("mailto:support@habityapp.com");
  };

  return (
    <View className="flex-1 bg-white">
      {/* Profile Section */}
      <View className="items-center mb-10">
        <TouchableOpacity onPress={handleProfilePicPress}>
          <View className="relative">
            <Image source={profileImage} className="h-20 w-20 rounded-full" />
            <View className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-1">
              <Feather name="camera" size={16} color="white" />
            </View>
          </View>
        </TouchableOpacity>
        <TextInput
          style={{ fontSize: 20, fontWeight: "bold", marginTop: 10, color: "black", textAlign: "center" }}
          value={name || ""}
          onChangeText={handleNameChange}
          placeholder="Enter name"
          cursorColor={"#000"}
        />
        <Text className="text-red-600 text-xs ">edit</Text>
      </View>

      {/* Settings List */}
      <View className="bg-gray-50 rounded-lg p-4 mx-2 shadow-md mb-6">
        {/* Account */}
        <TouchableOpacity className="flex-row items-center justify-between py-4 border-b border-gray-200 mb-2" activeOpacity={0.7} onPress={() => setShowAccount(!showAccount)}>
          <View className="flex-row items-center">
            <Ionicons name="person-outline" size={22} color="black" />
            <Text className="ml-2 text-base text-black">Account</Text>
          </View>
          <Feather name={showAccount ? "chevron-up" : "chevron-down"} size={20} color="gray" />
        </TouchableOpacity>
        {showAccount && (
          <View className="ml-8 mb-2">
            <TextInput
              style={{ fontSize: 16, color: "black", borderBottomWidth: 1, borderColor: "gray", marginBottom: 8 }}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter new email"
            />
            <TouchableOpacity className="bg-blue-400 p-2 rounded w-44" onPress={handleSyncAccount}>
              <Text className="text-white text-center">Sync Account</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Security */}
        <TouchableOpacity className="flex-row items-center justify-between py-4 border-b border-gray-200 mb-2" activeOpacity={0.7} onPress={() => setShowSecurity(!showSecurity)}>
          <View className="flex-row items-center">
            <MaterialIcons name="security" size={22} color="black" />
            <Text className="ml-2 text-base text-black">Security</Text>
          </View>
          <Feather name={showSecurity ? "chevron-up" : "chevron-down"} size={20} color="gray" />
        </TouchableOpacity>
        {showSecurity && (
          <View className="ml-8 mb-2">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-base text-black">Enable 2FA</Text>
              <Switch 
                value={is2FAEnabled} 
                onValueChange={setIs2FAEnabled}
                trackColor={{ false: "#767577", true: "#b4d3de" }}
                thumbColor={is2FAEnabled ? "#f5f5f5" : "#f4f3f4"}
              />
            </View>
            
          </View>
        )}

        {/* Notifications */}
        <TouchableOpacity className="flex-row items-center justify-between py-4 border-b border-gray-200 mb-2" activeOpacity={0.7} onPress={() => setShowNotifications(!showNotifications)}>
          <View className="flex-row items-center">
            <Ionicons name="notifications-outline" size={22} color="black" />
            <Text className="ml-2 text-base text-black">Notifications</Text>
          </View>
          <Feather name={showNotifications ? "chevron-up" : "chevron-down"} size={20} color="gray" />
        </TouchableOpacity>
        {showNotifications && (
          <View className="ml-8 mb-2">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-base text-black">Enable Notifications</Text>
              <Switch 
                value={isNotificationsEnabled} 
                onValueChange={setIsNotificationsEnabled}
                trackColor={{ false: "#767577", true: "#b4d3de" }}
                thumbColor={isNotificationsEnabled ? "#f5f5f5" : "#f4f3f4"}
              />
            </View>
          </View>
        )}

        {/* Privacy */}
        <TouchableOpacity className="flex-row items-center justify-between py-4 border-b border-gray-200 mb-2" activeOpacity={0.7} onPress={() => setShowPrivacy(!showPrivacy)}>
          <View className="flex-row items-center">
            <MaterialIcons name="privacy-tip" size={22} color="black" />
            <Text className="ml-2 text-base text-black">Privacy</Text>
          </View>
          <Feather name={showPrivacy ? "chevron-up" : "chevron-down"} size={20} color="gray" />
        </TouchableOpacity>
        {showPrivacy && (
          <View className="ml-8 mb-2">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-base text-black">Data Sharing</Text>
              <Switch 
                value={isDataSharingEnabled} 
                onValueChange={setIsDataSharingEnabled}
                trackColor={{ false: "#767577", true: "#b4d3de" }}
                thumbColor={isDataSharingEnabled ? "#f5f5f5" : "#f4f3f4"}
              />
            </View>
            
            <TouchableOpacity className="bg-red-500 p-2 rounded mt-2" onPress={handleClearData}>
              <Text className="text-white text-center">Clear Data</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Help Center */}
        <TouchableOpacity className="flex-row items-center justify-between py-4 mb-2" activeOpacity={0.7} onPress={() => setShowHelp(!showHelp)}>
          <View className="flex-row items-center">
            <Ionicons name="help-circle-outline" size={22} color="black" />
            <Text className="ml-2 text-base text-black">Help Center</Text>
          </View>
          <Feather name={showHelp ? "chevron-up" : "chevron-down"} size={20} color="gray" />
        </TouchableOpacity>
        {showHelp && (
          <View className="ml-8 mb-2">
            <Text className="text-base text-black mb-2">FAQ:</Text>
            <Text className="text-sm text-gray-600 mb-1">How to add a habit? Tap the + button on the home screen.</Text>
            <Text className="text-sm text-gray-600 mb-1">Forgot password? Use the login screen's reset option.</Text>
            <TouchableOpacity className="bg-gray-200 p-2 rounded mt-2" onPress={openEmailSupport}>
              <Text className="text-center">Contact Support</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <TouchableOpacity
        className="bg-blue-500 p-3 rounded-full mx-auto  w-40 flex items-center"
        onPress={handleLogout}
      >
        <Text className="text-white text-center font-bold">Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Setting;