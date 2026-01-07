import { Tabs } from "expo-router";
    import { Ionicons } from "@expo/vector-icons";

    export default function TabLayout() {
      return (
        <Tabs screenOptions={{
            headerShown: false,
            tabBarStyle: { backgroundColor: "#1e293b", borderTopColor: "#334155" },
            tabBarActiveTintColor: "#38bdf8",
            tabBarInactiveTintColor: "#94a3b8",
        }}>
          <Tabs.Screen name="index" options={{
              title: "Movies",
              tabBarIcon: ({ color }) => <Ionicons name="film" size={24} color={color} />
          }} />
          <Tabs.Screen name="favorites" options={{
              title: "Favorites",
              tabBarIcon: ({ color }) => <Ionicons name="heart" size={24} color={color} />
          }} />
          <Tabs.Screen name="profile" options={{
              title: "Profile",
              tabBarIcon: ({ color }) => <Ionicons name="person" size={24} color={color} />
          }} />
        </Tabs>
      );
    }