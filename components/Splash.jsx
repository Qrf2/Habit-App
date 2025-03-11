import { StyleSheet, Text, View, Animated } from "react-native";
import React, { useEffect, useRef } from "react";

const Splash = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <View style={styles.container}>
      <Animated.Text style={[styles.welcomeText, { opacity: fadeAnim }]}>
        <Text>Habity</Text>
      </Animated.Text>
    </View>
  );
};

export default Splash;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white", // Change this to your desired background color
  },
  welcomeText: {
    fontSize: 32,
    color: "#133b7d", // Blue color for the welcome text
  },
});
