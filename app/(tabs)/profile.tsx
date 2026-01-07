import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { auth } from "../firebaseconfig"; // Ensure this path is correct
import { signOut } from "firebase/auth";

export default function Profile() {
  const router = useRouter();
  const user = auth.currentUser; // Get the logged-in user

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace("/(auth)/login");
    } catch (error) {
      console.error(error);
    }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Random avatar based on user ID or a default one */}
      <Image
        source={{ uri: `https://ui-avatars.com/api/?name=${user.displayName}&background=random` }}
        style={styles.avatar}
      />
      
      {/* SHOW FIREBASE USERNAME HERE */}
      <Text style={styles.name}>{user.displayName || "Movie Fan"}</Text>
      <Text style={styles.email}>{user.email}</Text>

      <View style={styles.statsContainer}>
        <View style={styles.infoBox}>
          <Ionicons name="film" size={20} color="#38bdf8" />
          <Text style={styles.infoText}>Watched: 12</Text>
        </View>
        <View style={styles.infoBox}>
          <Ionicons name="heart" size={20} color="#ef4444" />
          <Text style={styles.infoText}>Liked: 5</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.buttonText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a", alignItems: "center", paddingTop: 80 },
  avatar: { width: 120, height: 120, borderRadius: 60, marginBottom: 20, borderWidth: 2, borderColor: "#38bdf8" },
  name: { color: "#fff", fontSize: 24, fontWeight: "700", marginBottom: 5 },
  email: { color: "#94a3b8", marginBottom: 30, fontSize: 16 },
  statsContainer: { width: "100%", alignItems: "center", marginBottom: 40 },
  infoBox: { flexDirection: "row", alignItems: "center", backgroundColor: "#1e293b", padding: 15, borderRadius: 12, width: "80%", marginBottom: 10 },
  infoText: { color: "#fff", fontSize: 16, marginLeft: 15, fontWeight: "500" },
  logoutButton: { backgroundColor: "#ef4444", paddingVertical: 15, paddingHorizontal: 60, borderRadius: 30, elevation: 5 },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});