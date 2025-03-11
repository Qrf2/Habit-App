import { View, Text, Animated } from "react-native";
import { useState, useEffect, useRef } from "react";

const quotes = [
  "We are what we repeatedly do. Excellence, then, is not an act, but a habit.",
  "Success is the sum of small efforts, repeated day in and day out.",
  "Your future is created by what you do today, not tomorrow.",
  "Motivation gets you started, but habit keeps you going.",
  "Small daily improvements are the key to staggering long-term results.",
];

const QuoteComponent = () => {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      // Fade out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 1000, // 1 second fade-out
        useNativeDriver: true,
      }).start(() => {
        // Change quote
        setQuoteIndex((prevIndex) => (prevIndex + 1) % quotes.length);

        // Fade in
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000, // 1 second fade-in
          useNativeDriver: true,
        }).start();
      });
    }, 10000); // Change every 10 seconds

    return () => clearInterval(interval);
  }, [fadeAnim]);

  return (
    <View className="items-center justify-center mt-5">
      <Animated.Text
        style={{ opacity: fadeAnim }}
        className="text-center text-base text-gray-700 italic px-4"
      >
        <Text>"{quotes[quoteIndex]}"</Text>
      </Animated.Text>
    </View>
  );
};

export default QuoteComponent;
