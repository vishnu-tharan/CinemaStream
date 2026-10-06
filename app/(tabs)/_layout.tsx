import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { cinema as c } from '../../constants/cinema';
export default function TabLayout() {
  return <Tabs screenOptions={{
    headerShown: false, tabBarActiveTintColor: c.accent, tabBarInactiveTintColor: c.muted,
    tabBarStyle: { backgroundColor: c.surface, borderTopColor: c.border, paddingTop: 10 },
    tabBarLabelStyle: { fontSize: 10, fontWeight: '600', marginTop: 3 },
    tabBarItemStyle: { paddingBottom: 5 },
  }}>
    <Tabs.Screen name="index" options={{ title: 'Discover', tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? 'compass' : 'compass-outline'} size={23} color={color} /> }} />
    <Tabs.Screen name="favorites" options={{ title: 'My collection', tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? 'bookmark' : 'bookmark-outline'} size={22} color={color} /> }} />
    <Tabs.Screen name="profile" options={{ title: 'Account', tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? 'person-circle' : 'person-circle-outline'} size={24} color={color} /> }} />
    <Tabs.Screen name="home" options={{ href: null }} />
  </Tabs>;
}
