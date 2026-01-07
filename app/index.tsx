import { router } from "expo-router";
import LottieView from "lottie-react-native";
import React, { useState } from "react";
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const { width } = Dimensions.get("window");

export default function SplashScreen() {
  const [step, setStep] = useState(0);

  const screens = [
    {
      animation: require("../assets/Welcome Screen.json"),
      title: "Welcome to CinemaStream",
      subtitle: "Your personal gateway to the world of movies.",
    },
    {
      animation: require("../assets/Movie Theatre.json"),
      title: "Book Your Experience",
      subtitle: "Reserve the best seats in the house effortlessly.",
    },
    {
      animation: require("../assets/Popcorn.json"),
      title: "Sit Back & Relax",
      subtitle: "Grab your popcorn and enjoy the show!",
    },
  ];

  const next = () => {
    if (step < screens.length - 1) {
      setStep(step + 1);
    } else {
      router.replace("/(auth)/register");
    }
  };

  const prev = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  return (
    <View style={styles.container}>
      {/* Animation Section */}
      <View style={styles.animationContainer}>
        <LottieView
          source={screens[step].animation}
          autoPlay
          loop
          style={{ width: width * 0.8, height: 300 }} // Adjusted size
        />
      </View>

      {/* Text Section */}
      <View style={styles.textContainer}>
        <Text style={styles.title}>{screens[step].title}</Text>
        <Text style={styles.subtitle}>{screens[step].subtitle}</Text>
      </View>

      {/* Button Section */}
      <View style={styles.buttonContainer}>
        {/* Back Button (Only shows if NOT on first step) */}
        {step > 0 && (
          <TouchableOpacity style={[styles.btn, styles.backBtn]} onPress={prev}>
            <Text style={[styles.btnText, styles.backBtnText]}>Back</Text>
          </TouchableOpacity>
        )}

        {/* Next/Get Started Button */}
        <TouchableOpacity style={[styles.btn, styles.nextBtn]} onPress={next}>
          <Text style={styles.btnText}>
            {step === screens.length - 1 ? "Get Started" : "Next"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 50,
  },
  animationContainer: {
    flex: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
    paddingHorizontal: 30,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    color: "#0f172a",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 24,
  },
  
  // ✅ UPDATED BUTTON STYLES (Smaller & Centered)
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center", // Keeps buttons in the middle
    alignItems: "center",
    width: "100%",
    gap: 20, // Space between buttons
    marginBottom: 30,
  },
  btn: {
    width: 140, // Fixed smaller width
    height: 50, // Slightly smaller height
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  nextBtn: {
    backgroundColor: "#0f172a",
  },
  backBtn: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#0f172a",
  },
  btnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  backBtnText: {
    color: "#0f172a",
  },
});