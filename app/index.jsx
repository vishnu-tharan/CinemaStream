import { Redirect } from 'expo-router';
import { useAuth } from '../src/contexts/auth';
export default function Index() {
  const { user, guest } = useAuth();
  return <Redirect href={user || guest ? '/(tabs)' : '/(auth)/login'} />;
}
