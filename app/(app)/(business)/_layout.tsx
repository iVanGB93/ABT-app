import { Stack, Redirect } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../(redux)/store';

export default function BusinessLayout() {
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
      <Stack.Screen name="businessDetails" options={{ headerShown: false }} />
      <Stack.Screen
        name="businessExpenseCreate"
        options={{ headerShown: false, animation: 'fade' }}
      />
      <Stack.Screen
        name="businessIncomeCreate"
        options={{ headerShown: false, animation: 'fade' }}
      />
      <Stack.Screen
        name="businessIncomeUpdate"
        options={{ headerShown: false, animation: 'fade' }}
      />
      <Stack.Screen
        name="businessExpenseUpdate"
        options={{ headerShown: false, animation: 'fade' }}
      />
      <Stack.Screen name="businessUpdate" options={{ headerShown: false, animation: 'fade' }} />
    </Stack>
  );
}
