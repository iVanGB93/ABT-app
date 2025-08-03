import { Stack } from 'expo-router';


export default function AuthLayout() {
  
    return (
        <Stack
            screenOptions={{
                headerShown: false
            }}
            >
            <Stack.Screen options={{ animation: 'slide_from_right' }} name="login" />
            <Stack.Screen options={{ animation: 'slide_from_left' }} name="register" />
            <Stack.Screen options={{ animation: 'slide_from_right' }} name="verifyCode" />
            <Stack.Screen options={{ animation: 'slide_from_right' }} name="usernameAndPassword" />
            <Stack.Screen options={{ animation: 'slide_from_bottom' }} name="accountDetails" />
        </Stack>
    );
}
