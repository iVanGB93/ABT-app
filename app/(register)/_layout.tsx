import { Stack } from 'expo-router';


export default function RegisterLayout() {
  
    return (
        <Stack
            screenOptions={{
                headerShown: false
            }}
            >
            <Stack.Screen name="index" />
            <Stack.Screen name="verifyCode" />
            <Stack.Screen name="userAndPassword" />
            <Stack.Screen name="initialSettings" />
            <Stack.Screen name="secondSettings" />
        </Stack>
    );
}
