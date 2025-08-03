import { Redirect, Stack } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '../../(redux)/store';



export default function ItemLayout() {
  const token = useSelector((state: RootState) => state.auth.token);
  const { business } = useSelector((state: RootState) => state.settings);

  if (!token) {
    return <Redirect href="/" />;
  }
  if (!business || Object.keys(business).length === 0) {
    return <Redirect href="/(businessSelect)" />;
  }

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="itemDetails" options={{ headerShown: false }} />
      <Stack.Screen name="itemCreate" options={{ headerShown: false, animation: 'fade' }} />
      <Stack.Screen name="itemUpdate" options={{ headerShown: false, animation: 'fade' }} />
    </Stack>
  );
}
