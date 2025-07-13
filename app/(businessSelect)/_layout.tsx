import { Stack } from 'expo-router';


export default function BusinessSelectLayout() {
  
    return (
        <Stack
            screenOptions={{
                headerShown: false
            }}
            >
            <Stack.Screen name="index" />
            <Stack.Screen name="businessCreate" />
        </Stack>
    );
}
