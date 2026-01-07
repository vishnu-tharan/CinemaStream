import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import LottieView from "lottie-react-native";
import React, { useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { auth, db } from "../firebaseconfig";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(""); // ✅ NEW Error Variable

  const handleRegister = async () => {
    setErrorMsg(""); // Clear errors
    
    if (!name.trim() || !email.trim() || !password.trim()) {
      setErrorMsg("⚠️ Please fill in all fields.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMsg("⚠️ Invalid email format.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("⚠️ Password must be at least 6 characters.");
      return;
    }

    const hasUpperCase = /[A-Z]/.test(password);
    if (!hasUpperCase) {
      setErrorMsg("⚠️ Password needs 1 uppercase letter.");
      return;
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      
      await setDoc(doc(db, "users", userCredential.user.uid), {
        name,
        email,
        createdAt: new Date(),
      });

      setLoading(false);
      router.replace("/(auth)/login");
    } catch (error: any) {
      setLoading(false);
      if (error.code === 'auth/email-already-in-use') {
         setErrorMsg("❌ Email is already registered.");
      } else {
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
            source={require("../../assets/Popcorn.json")} 
            autoPlay
            loop
            style={{ width: 200, height: 200 }}
          />
        </View>

        <Text style={styles.title}>Join the Premiere</Text>
        <Text style={styles.subtitle}>Get your VIP pass to endless entertainment.</Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor="#94a3b8"
            value={name}
            onChangeText={(t) => { setName(t); setErrorMsg(""); }}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#94a3b8"
            value={email}
            onChangeText={(t) => { setEmail(t); setErrorMsg(""); }}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#94a3b8"
            value={password}
            onChangeText={(t) => { setPassword(t); setErrorMsg(""); }}
            secureTextEntry
          />
        </View>

        {/* ✅ SHOW ERROR HERE */}
        {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

        <TouchableOpacity onPress={handleRegister} style={styles.buttonWrapper} disabled={loading}>
          <LinearGradient
            colors={['#3b82f6', '#06b6d4']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientButton}
          >
            {loading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.buttonText}>Create Account</Text>}
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
          <Text style={styles.linkText}>
            Already a member? <Text style={styles.linkBold}>Login here</Text>
          </Text>
        </TouchableOpacity>
        
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" },
  content: { flex: 1, justifyContent: "center", alignItems: "center", padding: 30 },
  animationContainer: { marginBottom: 20 },
  title: { fontSize: 32, fontWeight: "800", color: "#fff", marginBottom: 5, textAlign: "center" },
  subtitle: { fontSize: 16, color: "#cbd5e1", marginBottom: 30, textAlign: "center" },
  inputContainer: { width: "100%", marginBottom: 10 },
  input: { width: "100%", height: 55, backgroundColor: "#1e293b", borderRadius: 12, paddingHorizontal: 15, marginBottom: 15, fontSize: 16, color: "#fff", borderWidth: 1, borderColor: "#334155" },
  
  errorText: { color: "#ef4444", fontSize: 14, marginBottom: 15, fontWeight: "bold", textAlign: "center" },

  buttonWrapper: { width: "100%", borderRadius: 12, overflow: 'hidden', marginBottom: 20 },
  gradientButton: { paddingVertical: 18, alignItems: "center", justifyContent: "center" },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  linkText: { color: "#94a3b8", fontSize: 15 },
  linkBold: { color: "#60a5fa", fontWeight: "bold" },
});