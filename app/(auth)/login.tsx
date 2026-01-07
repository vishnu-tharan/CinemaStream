import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import LottieView from "lottie-react-native";
import React, { useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { auth } from "../firebaseconfig";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(""); // ✅ NEW: Variable for error text

  const handleLogin = async () => {
    setErrorMsg(""); // Clear previous errors
    
    if (!email || !password) {
      setErrorMsg("⚠️ Please enter both email and password.");
      return;
    }
    
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      setLoading(false);
      router.replace("/(tabs)"); 
    } catch (error: any) {
      setLoading(false);
      console.log("Login Error:", error.code); 

      // ✅ SHOW ERROR ON SCREEN INSTEAD OF ALERT
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setErrorMsg("❌ Incorrect email or password.");
      } 
      else if (error.code === 'auth/invalid-email') {
        setErrorMsg("⚠️ Invalid email format.");
      } 
      else if (error.code === 'auth/too-many-requests') {
        setErrorMsg("🔒 Account temporarily locked. Try again later.");
      }
      else {
        setErrorMsg("❌ " + error.message);
      }
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      style={styles.container}
    >
      <View style={styles.content}>
        
        <View style={styles.animationContainer}>
          <LottieView
            source={require("../../assets/Movie Theatre.json")} 
            autoPlay
            loop
            style={{ width: 280, height: 280 }}
          />
        </View>

        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Your seat is reserved. Enjoy the show.</Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email Address"
            placeholderTextColor="#94a3b8"
            value={email}
            onChangeText={(text) => { setEmail(text); setErrorMsg(""); }} // Clear error when typing
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#94a3b8"
            value={password}
            secureTextEntry
            onChangeText={(text) => { setPassword(text); setErrorMsg(""); }}
          />
        </View>

        {/* ✅ ERROR MESSAGE SECTION */}
        {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

        <TouchableOpacity onPress={handleLogin} style={styles.buttonWrapper} disabled={loading}>
          <LinearGradient
            colors={['#ec4899', '#8b5cf6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientButton}
          >
            {loading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.buttonText}>Sign In</Text>}
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
          <Text style={styles.linkText}>
            New here? <Text style={styles.linkBold}>Create an account</Text>
          </Text>
        </TouchableOpacity>

      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" },
  content: { flex: 1, justifyContent: "center", alignItems: "center", padding: 30 },
  animationContainer: { marginBottom: 10 },
  title: { fontSize: 36, fontWeight: "800", color: "#fff", marginBottom: 5, textAlign: "center" },
  subtitle: { fontSize: 16, color: "#cbd5e1", marginBottom: 30, textAlign: "center" },
  inputContainer: { width: "100%", marginBottom: 10 },
  input: { width: "100%", height: 55, backgroundColor: "#1e293b", borderRadius: 12, paddingHorizontal: 15, marginBottom: 15, fontSize: 16, color: "#fff", borderWidth: 1, borderColor: "#334155" },
  
  // New Error Text Style
  errorText: { color: "#ef4444", fontSize: 14, marginBottom: 15, fontWeight: "bold", textAlign: "center" },

  buttonWrapper: { width: "100%", borderRadius: 12, overflow: 'hidden', marginBottom: 20 },
  gradientButton: { paddingVertical: 18, alignItems: "center", justifyContent: "center" },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  linkText: { color: "#94a3b8", fontSize: 15 },
  linkBold: { color: "#f472b6", fontWeight: "bold" },
});