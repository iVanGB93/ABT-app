import { Stack, Redirect } from 'expo-router';
import { RootState } from '../(redux)/store';
import { useSelector } from 'react-redux';

export default function BusinessSelectLayout() {
  const token = useSelector((state: RootState) => state.auth.token);

  if (!token) {
    console.log(token, 'No token found, redirecting to login');
    
    return <Redirect href="/" />;
  } 

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="businessCreate" />
    </Stack>
  );
}
