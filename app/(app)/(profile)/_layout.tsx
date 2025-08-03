import { useSelector } from 'react-redux';
import { Stack, Redirect } from 'expo-router';
import { RootState } from '../../(redux)/store';


export default function ProfileLayout() {
  const { business } = useSelector((state: RootState) => state.settings);
  const token = useSelector((state: RootState) => state.auth.token);

  if (!token) {
    return <Redirect href="/" />;
  }
  if (!business || Object.keys(business).length === 0) {
    return <Redirect href="/(businessSelect)" />;
  }

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="businessSettings" options={{ headerShown: false }} />
      <Stack.Screen name="profileSettings" options={{ headerShown: false }} />
      <Stack.Screen name="styleSettings" options={{ headerShown: false }} />
    </Stack>
  );
}
