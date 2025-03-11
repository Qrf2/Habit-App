import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  Image,
  ScrollView,
  Animated,
  PanResponder,
  Dimensions,
  Platform,
  Linking,
  DeviceEventEmitter
} from "react-native";
import React, { useState, useEffect, useContext, useRef } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import Qoute from "../animation/Qoute";
import AddHabit from "../habits/AddHabit";
import { useSelector, useDispatch } from "react-redux";
import {
  toggleHabitCompletion,
  deleteHabit,
  resetHabitsForNewDay,
  updateHabitProgress,
} from "../redux/actions";
import AntDesign from "@expo/vector-icons/AntDesign"; // Import AntDesign for power icon
import Modal from "react-native-modal";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import dayjs from "dayjs";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Ionicons from "@expo/vector-icons/Ionicons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Icon from "../animation/Icon";
import { ProfileContext } from "../../context/ProfileContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SWIPE_THRESHOLD = -80;

const HabitItem = ({ item, onDelete, onToggleCompletion }) => {
  const dispatch = useDispatch();
  const pan = useRef(new Animated.ValueXY()).current;
  const [isDeleteVisible, setIsDeleteVisible] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentCount, setCurrentCount] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [animation] = useState(new Animated.Value(0));
  const intervalRef = useRef(null);

  // Load saved progress when component mounts
  useEffect(() => {
    if (item.progress) {
      if (item.trackingType === 'counter') {
        setCurrentCount(item.progress);
      } else if (item.trackingType === 'timer') {
        setElapsedTime(item.progress);
      }
    }
  }, [item]);

  // Cleanup interval when component unmounts
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const swipeThreshold = -80;
  const maxSwipe = -80;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to horizontal movements
        return Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx < 0) {
          // Only allow left swipe
          // Limit the swipe to maxSwipe
          const newX = Math.max(gestureState.dx, maxSwipe);
          pan.setValue({ x: newX, y: 0 });
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < swipeThreshold) {
          // If swiped past threshold, snap to delete position
          Animated.spring(pan, {
            toValue: { x: maxSwipe, y: 0 },
            useNativeDriver: false,
            bounciness: 0,
            speed: 20,
          }).start(() => setIsDeleteVisible(true));
        } else {
          // If not swiped past threshold, snap back
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
            bounciness: 0,
            speed: 20,
          }).start(() => setIsDeleteVisible(false));
        }
      },
      onPanResponderTerminate: () => {
        // Handle when gesture is terminated
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
          bounciness: 0,
          speed: 20,
        }).start(() => setIsDeleteVisible(false));
      },
      onPanResponderTerminateRequest: () => {
        // Handle when gesture is terminated by system
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
          bounciness: 0,
          speed: 20,
        }).start(() => setIsDeleteVisible(false));
      },
    })
  ).current;

  const handleDelete = () => {
    Animated.timing(pan, {
      toValue: { x: -SCREEN_WIDTH, y: 0 },
      duration: 200,
      useNativeDriver: false,
    }).start(() => {
      onDelete(item.id);
      setIsDeleteVisible(false);
    });
  };

  const resetPosition = () => {
    Animated.spring(pan, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: false,
      bounciness: 0,
      speed: 20,
    }).start(() => setIsDeleteVisible(false));
  };

  const rightSwipeOpacity = pan.x.interpolate({
    inputRange: [maxSwipe, maxSwipe / 2, 0],
    outputRange: [1, 0.5, 0],
    extrapolate: "clamp",
  });

  const handleTogglePress = () => {
    if (isToggling) return; // Prevent multiple rapid presses
    setIsToggling(true);
    onToggleCompletion(item.id);
    // Reset the toggle state after a short delay
    setTimeout(() => setIsToggling(false), 300);
  };

  const toggleExpand = () => {
    const toValue = isExpanded ? 0 : 1;
    Animated.spring(animation, {
      toValue,
      useNativeDriver: false,
      stiffness: 100,  // Controls the spring stiffness
      damping: 10,     // Controls how quickly the spring settles
      mass: 1,         // Controls the mass of the spring
    }).start();
    setIsExpanded(!isExpanded);
  };

  // Handle counter increment/decrement
  const handleCounter = (increment) => {
    const newCount = increment 
      ? Math.min(currentCount + 1, item.counterGoal)
      : Math.max(currentCount - 1, 0);
    
    setCurrentCount(newCount);
    dispatch(updateHabitProgress(item.id, newCount));
  };

  // Timer functions
  const toggleTimer = () => {
    if (!isTimerRunning) {
      setIsTimerRunning(true);
      startTimer();
    } else {
      setIsTimerRunning(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  };

  const startTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      setElapsedTime(prev => {
        if (prev >= item.timerGoal) {
          clearInterval(intervalRef.current);
          setIsTimerRunning(false);
          return prev;
        }
        const newTime = prev + 1;
        // Only dispatch if the time has actually changed
        if (newTime !== prev) {
          dispatch(updateHabitProgress(item.id, newTime));
        }
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

  const resetTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setIsTimerRunning(false);
    setElapsedTime(0);
    dispatch(updateHabitProgress(item.id, 0));
  };

  return (
    <View style={{ position: "relative" }}>
      <Animated.View
        style={{
          position: "absolute",
          right: 0,
          height: "85%",
          width: 80,
          backgroundColor: "red",
          justifyContent: "center",
          alignItems: "center",
          borderRadius: 8,
          opacity: rightSwipeOpacity,
        }}
      >
        {isDeleteVisible && (
          <TouchableOpacity
            onPress={handleDelete}
            style={{
              width: "100%",
              height: "100%",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <AntDesign name="delete" size={20} color="white" />
            <Text style={{ color: "white", marginTop: 4, fontSize: 12 }}>
              Delete
            </Text>
          </TouchableOpacity>
        )}
      </Animated.View>

      <Animated.View
        style={{
          transform: [{ translateX: pan.x }],
        }}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={isDeleteVisible ? resetPosition : toggleExpand}
        >
          <View
            className="p-4 mb-3 rounded-lg"
            style={{
              position: "relative",
              backgroundColor: `${item.color}20`,
            }}
          >
            {/* Expand indicator bar */}
            <View
              style={{
                position: "absolute",
                right: 0,
                top: 0,
                bottom: 0,
                width: 4,
                backgroundColor: item.color,
                borderTopRightRadius: 8,
                borderBottomRightRadius: 8,
                opacity: 0.5,
              }}
            />
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center">
                {item.icon && (
                  <Icon
                    type={item.icon.type}
                    name={item.icon.name}
                    color={item.color}
                  />
                )}
                <Text className="text-lg font-medium text-gray-900 ml-2">
                  {item.name}
                </Text>
              </View>
              <View className="flex-row items-center">
                <MaterialCommunityIcons
                  name={isExpanded ? "chevron-up" : "chevron-down"}
                  size={24}
                  color={item.color}
                />
                <TouchableOpacity
                  className={`px-4 py-2 rounded-lg ml-2 ${
                    item.completed ? "bg-green-500" : "bg-red-500"
                  }`}
                  onPress={handleTogglePress}
                  disabled={isToggling}
                  style={{ opacity: isToggling ? 0.7 : 1 }}
                >
                  <Text className="text-white">
                    {item.completed ? "Completed" : "Incomplete"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* Expandable Tracking Section - Now narrower */}
        <Animated.View
          className="rounded-b-lg overflow-hidden"
          style={{
            backgroundColor: `${item.color}80`,
            transform: [{
              translateY: animation.interpolate({
                inputRange: [0, 1],
                outputRange: [-10, 0],
              })
            }],
            opacity: animation.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0, 0.5, 1],
            }),
            height: animation.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 120],
            }),
            width: '80%',
            alignSelf: 'center',
          }}
        >
          <View className="p-3">
            {item.trackingType === 'counter' && (
              <View className="flex-row items-center justify-between">
                <TouchableOpacity
                  onPress={() => handleCounter(false)}
                  className="bg-white/20 p-2 rounded-full"
                >
                  <MaterialCommunityIcons name="minus" size={20} color="white" />
                </TouchableOpacity>
                
                <View className="items-center">
                  <Text className="text-white text-2xl font-bold">
                    {currentCount}/{item.counterGoal}
                  </Text>
                  <Text className="text-white/80 text-sm">Progress</Text>
                </View>

                <TouchableOpacity
                  onPress={() => handleCounter(true)}
                  className="bg-white/20 p-2 rounded-full"
                >
                  <MaterialCommunityIcons name="plus" size={20} color="white" />
                </TouchableOpacity>
              </View>
            )}

            {item.trackingType === 'timer' && (
              <View className="items-center">
                <Text className="text-white text-2xl font-bold">
                  {formatTime(elapsedTime)}
                </Text>
                <Text className="text-white/80 text-sm mb-3">
                  Goal: {formatTime(item.timerGoal)}
                </Text>
                <View className="flex-row space-x-2">
                  <TouchableOpacity
                    onPress={toggleTimer}
                    className="bg-white/20 px-4 py-1.5 rounded-full"
                  >
                    <Text className="text-white font-medium text-sm">
                      {isTimerRunning ? 'Stop' : 'Start'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={resetTimer}
                    className="bg-white/20 px-4 py-1.5 rounded-full"
                  >
                    <Text className="text-white font-medium text-sm">
                      Reset
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </Animated.View>
      </Animated.View>
    </View>
  );
};

const HT = () => {
  const { profileImage, updateProfileImage } = useContext(ProfileContext);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isLogoutModalVisible, setLogoutModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [lastCheckDate, setLastCheckDate] = useState(null);
  const [userName, setUserName] = useState("NPC");

  const navigation = useNavigation();
  const route = useRoute();
  const habits = useSelector((state) => state.habits.habits);
  const dispatch = useDispatch();

  useEffect(() => {
    const loadUserName = async () => {
      try {
        const savedName = await AsyncStorage.getItem("profileName");
        if (savedName) setUserName(savedName);
      } catch (error) {
        console.error("Error loading user name:", error);
      }
    };

    loadUserName();

    const handleNameChange = (newName) => {
      setUserName(newName);
    };

    const subscription = DeviceEventEmitter.addListener('nameChanged', handleNameChange);

    return () => {
      subscription.remove();
    };
  }, []);

  // Check for new day and reset habits if needed
  useEffect(() => {
    const today = dayjs().format("YYYY-MM-DD");

    // If this is the first time running the app
    if (!lastCheckDate) {
      setLastCheckDate(today);
      return;
    }

    // If it's a new day
    if (today !== lastCheckDate) {
      Alert.alert(
        "New Day!",
        "Your habits have been reset for the new day. Keep up the good work!",
        [{ text: "OK" }]
      );
      dispatch(resetHabitsForNewDay());
      setLastCheckDate(today);
    }
  }, [lastCheckDate]);

  const getWeekDays = () => {
    const week = [];
    for (let i = -2; i <= 2; i++) {
      const date = dayjs().add(i, "day");
      week.push({
        dayName: date.format("ddd").toUpperCase(),
        dateNumber: date.format("D"),
        fullDate: date.format("YYYY-MM-DD"),
      });
    }
    return week;
  };

  const requestPermissions = async () => {
    try {
      const { status: cameraStatus } =
        await ImagePicker.requestCameraPermissionsAsync();
      const { status: galleryStatus } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (cameraStatus !== "granted" || galleryStatus !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please enable camera and gallery access in your device settings to use this feature.",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Settings",
              onPress: () => {
                if (Platform.OS === "ios") {
                  Linking.openURL("app-settings:");
                } else {
                  Linking.openSettings();
                }
              },
            },
          ]
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error("Error requesting permissions:", error);
      Alert.alert("Error", "Failed to request permissions. Please try again.");
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
            updateProfileImage(require("../../assets/images/dp.jpg"));
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

  const handleToggleCompletion = (id) => {
    dispatch(toggleHabitCompletion(id));
  };

  const handleLogout = () => {
    setLogoutModalVisible(false);
    navigation.navigate("Login");
  };

  const renderItem = ({ item }) => (
    <HabitItem
      item={item}
      onDelete={(id) => dispatch(deleteHabit(id))}
      onToggleCompletion={handleToggleCompletion}
    />
  );

  return (
    <View className="flex-1 bg-white p-5">
      {/* TOP BAR */}
      <View className="flex-row justify-between items-center mb-5">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={handleProfilePicPress}>
            <View className="h-12 w-12 bg-blue-100 rounded-full overflow-hidden">
              <Image source={profileImage} className="h-full w-full" />
            </View>
          </TouchableOpacity>
          <View className="ml-2">
            <Text className="text-black">{userName}</Text>
            <Text className="text-xs text-gray-500">
              {dayjs().format("MMMM D, YYYY")}
            </Text>
          </View>
        </View>
        <View className="flex-row items-center">
          <TouchableOpacity
            className="mr-4"
            onPress={() => navigation.navigate("AddHabit")}
          >
            <AntDesign name="plus" size={24} color="#037bfc" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setLogoutModalVisible(true)}>
            <SimpleLineIcons name="options" size={15} color="gray" />
          </TouchableOpacity>
        </View>
      </View>

      <View>
        <Text className="text-4xl font-extralight mb-4">Your Habits</Text>

        {/* Calendar */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-4"
        >
          {getWeekDays().map((item, index) => (
            <View
              key={index}
              className={`w-24 h-9 m-1 rounded-full justify-center items-center ${
                item.fullDate === dayjs().format("YYYY-MM-DD")
                  ? "bg-blue-600"
                  : "bg-gray-300"
              }`} // Highlight the current date in blue, others in gray
            >
              <View className="flex-row items-center">
                <Text
                  className={`text-center text-sm font-bold m-2 ${
                    item.fullDate === dayjs().format("YYYY-MM-DD")
                      ? "text-white"
                      : "text-gray-500"
                  }`}
                >
                  {item.dayName}
                </Text>
                <Text
                  className={`text-center text-base font-bold ${
                    item.fullDate === dayjs().format("YYYY-MM-DD")
                      ? "text-white"
                      : "text-black"
                  }`}
                >
                  • {item.dateNumber}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
      {/* EMPTY STATE or HABIT LIST */}
      <View className="flex-1 justify-between">
        {habits.length === 0 ? (
          <View className="flex-1 justify-center items-center -mt-20">
            <Image
              source={require("../../assets/images/ufo.png")}
              className="w-72 h-72"
            />
            <Text className="text-2xl font-bold">No habits yet!</Text>
            <Text className="text-base text-gray-400">
              No habits yet! Add one to get started.
            </Text>
          </View>
        ) : (
          <View className="flex-1">
            <FlatList
              data={habits}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
            />
          </View>
        )}

        {/* Quote */}
        <View className="pt-4">
          <Qoute />
        </View>
      </View>

      {/* Logout Modal */}
      <Modal
        isVisible={isLogoutModalVisible}
        onBackdropPress={() => setLogoutModalVisible(false)}
        backdropOpacity={0.3}
        style={{ justifyContent: "center", alignItems: "center" }}
      >
        <View className="w-64 p-5 bg-blue-900 rounded-lg shadow-lg">
          <Text className="text-lg text-center mb-3 text-white">
            Are you sure you want to logout?
          </Text>

          <TouchableOpacity
            className="bg-gray-300 px-4 py-2 rounded-2xl mb-2"
            onPress={handleLogout}
          >
            <Text className="text-black text-center font-bold">Logout</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-gray-300 px-4 py-2 rounded-2xl"
            onPress={() => setLogoutModalVisible(false)}
          >
            <Text className="text-black text-center">Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

export default HT;
