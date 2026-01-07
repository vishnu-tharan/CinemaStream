import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { movies } from "../../assets/data/movies";

const { height } = Dimensions.get("window");

export default function MovieDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const movie = movies.find((m) => m.id.toString() === id);

  if (!movie) {
    return (
      <View style={styles.notFound}>
        <Text style={{ color: "#fff", fontSize: 18 }}>Movie not found.</Text>
        <TouchableOpacity onPress={() => router.back()} style={{marginTop: 20}}>
            <Text style={{color: "#38bdf8"}}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back-circle" size={40} color="rgba(0,0,0,0.7)" />
      </TouchableOpacity>

      {/* Main Image with Resize Fix */}
      <Image 
        source={movie.image} 
        style={styles.image} 
        resizeMode="cover" 
      />

      <View style={styles.content}>
        <Text style={styles.title}>{movie.name}</Text>
        <Text style={styles.description}>{movie.description}</Text>

        <View style={styles.infoBox}>
          <InfoRow label="Cast" value={movie.cast} />
          <InfoRow label="Genre" value={movie.genre} />
          <InfoRow label="Release" value={movie.releaseDate} />
        </View>
      </View>
    </ScrollView>
  );
}

const InfoRow = ({ label, value }: { label: string, value: string }) => (
  <View style={{ marginBottom: 12 }}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" },
  backButton: { position: "absolute", top: 40, left: 20, zIndex: 10 },
  
  // --- IMAGE FIX ---
  image: { 
    width: "100%", 
    height: height * 0.6, // Takes up 60% of screen height
  },
  
  content: { 
    padding: 24, 
    marginTop: -30, // Pulls text up slightly over the image
    backgroundColor: "#0f172a", 
    borderTopLeftRadius: 30, 
    borderTopRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10
  },
  title: { color: "#fff", fontSize: 32, fontWeight: "800", marginBottom: 12, marginTop: 10 },
  description: { color: "#cbd5e1", fontSize: 16, marginBottom: 25, lineHeight: 26 },
  infoBox: { backgroundColor: "#1e293b", borderRadius: 16, padding: 20 },
  label: { color: "#94a3b8", fontSize: 14, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 },
  value: { color: "#fff", fontSize: 16, fontWeight: "600" },
  notFound: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0f172a" },
});