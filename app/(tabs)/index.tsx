import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import { Animated, Dimensions, FlatList, Image, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { movies } from "../../assets/data/movies";

const screenWidth = Dimensions.get("window").width;

// 1. "POP" ANIMATION CARD COMPONENT
const MovieCard = ({ item, onPress }: any) => {
  const scaleValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 1.05,
      useNativeDriver: true,
      friction: 3,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
      friction: 3,
    }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={{ flex: 1, margin: 8 }}
    >
      <Animated.View style={[styles.card, { transform: [{ scale: scaleValue }] }]}>
        <Image source={item.image} style={styles.image} resizeMode="cover" />
        
        <LinearGradient
          colors={['transparent', 'rgba(15, 23, 42, 0.9)', '#0f172a']} 
          style={styles.gradientOverlay}
        >
          <Text style={styles.genre}>{item.genre.split(',')[0]}</Text> 
          <Text style={styles.movieName} numberOfLines={1}>{item.name}</Text>
          <View style={styles.ratingContainer}>
             <Ionicons name="star" size={12} color="#facc15" />
             <Text style={styles.ratingText}> 4.8</Text>
          </View>
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
};

// 2. MAIN HOME SCREEN
export default function MovieHome() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const filteredMovies = movies.filter(
    (movie) =>
      movie.name.toLowerCase().includes(search.toLowerCase()) ||
      movie.genre.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerSubtitle}>Welcome back 👋</Text>
        <Text style={styles.header}>CinemaStream</Text>
      </View>

      {/* Search Bar with Clear Button */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#94a3b8" style={{ marginRight: 10 }} />
        
        <TextInput
          placeholder="Find your next favorite..."
          placeholderTextColor="#64748b"
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
        />

        {/* ✅ CLEAR BUTTON: Only shows when typing */}
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Ionicons name="close-circle" size={20} color="#94a3b8" />
          </TouchableOpacity>
        )}
      </View>

      {/* Movie List */}
      <FlatList
        data={filteredMovies}
        renderItem={({ item }) => (
          <MovieCard item={item} onPress={() => router.push(`/movie/${item.id}`)} />
        )}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 50 }}>
            <Ionicons name="film-outline" size={50} color="#334155" />
            <Text style={styles.noResults}>No movies found</Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a", paddingHorizontal: 16, paddingTop: 60 },
  
  headerContainer: { marginBottom: 20 },
  headerSubtitle: { color: "#94a3b8", fontSize: 14, fontWeight: "600", textTransform: "uppercase", letterSpacing: 1 },
  header: { fontSize: 32, fontWeight: "800", color: "#fff", letterSpacing: 0.5 },

  searchContainer: { 
    backgroundColor: "#1e293b", 
    borderRadius: 16, 
    paddingHorizontal: 16, 
    paddingVertical: 12, 
    marginBottom: 24, 
    flexDirection: "row", 
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155"
  },
  searchInput: { flex: 1, color: "#fff", fontSize: 16 },
  
  card: { 
    borderRadius: 20, 
    overflow: "hidden", 
    height: 280, 
    backgroundColor: "#1e293b",
    elevation: 8, 
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  image: { width: "100%", height: "100%" },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
    justifyContent: 'flex-end',
    padding: 12,
  },
  genre: {
    color: "#38bdf8", 
    fontSize: 10,
    fontWeight: "700",
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden'
  },
  movieName: { 
    color: "#fff", 
    fontSize: 16, 
    fontWeight: "bold", 
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10
  },
  ratingContainer: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { color: "#cbd5e1", fontSize: 12, fontWeight: "600" },
  
  noResults: { textAlign: "center", color: "#64748b", fontSize: 16, marginTop: 10 },
});