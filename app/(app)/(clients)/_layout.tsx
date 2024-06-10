import { Stack } from "expo-router";

import { darkSecondColor } from "@/settings";


export default function ClientLayout() {
  return (
    <Stack 
      screenOptions={{
        headerStyle: {
          backgroundColor: darkSecondColor,
        },
      }}
    >
      <Stack.Screen name="index" options={{headerTitle: 'Clients'}}/>
      <Stack.Screen name="clientDetails" options={{headerTitle: 'Client Details'}}/>
      <Stack.Screen name="clientCreate" options={{headerTitle: 'Add New Client'}}/>
      <Stack.Screen name="clientUpdate" options={{headerTitle: 'Update Client'}}/>
    </Stack>
  );
}
