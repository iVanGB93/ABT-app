import { darkSecondColor } from "@/settings";
import { Stack } from "expo-router";


export default function JobLayout() {
  return (
    <Stack 
      screenOptions={{
        headerStyle: {
          backgroundColor: darkSecondColor,
        },
      }}
    >
      <Stack.Screen name="index" options={{headerTitle: 'Jobs'}}/>
      <Stack.Screen name="jobDetails" options={{headerTitle: 'Job Details'}}/>
      <Stack.Screen name="jobCreate" options={{headerTitle: 'Add New Job'}}/>
      <Stack.Screen name="jobUpdate" options={{headerTitle: 'Update Job'}}/>
      <Stack.Screen name="invoice" options={{headerTitle: 'Invoice'}}/>
    </Stack>
  );
}
