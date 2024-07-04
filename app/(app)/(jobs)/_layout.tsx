import { Stack } from "expo-router";
import { useSelector } from 'react-redux';
import { RootState } from '../../(redux)/store';

import { darkSecondColor, lightSecondColor } from "@/settings";


export default function JobLayout() {
  const {color, darkTheme} = useSelector((state:RootState) => state.settings);

  return (
    <Stack 
      screenOptions={{
        headerStyle: {
          backgroundColor: darkTheme ? darkSecondColor : lightSecondColor,
        },
      }}
    >
      <Stack.Screen name="index" options={{headerTitle: 'Jobs'}}/>
      <Stack.Screen name="jobDetails" options={{headerTitle: 'Job Details'}}/>
      <Stack.Screen name="jobCreate" options={{headerTitle: 'Add New Job'}}/>
      <Stack.Screen name="jobUpdate" options={{headerTitle: 'Update Job'}}/>
      <Stack.Screen name="invoice" options={{headerTitle: 'Invoice'}}/>
      <Stack.Screen name="invoiceCreate" options={{headerTitle: 'Create Invoice'}}/>
      <Stack.Screen name="invoiceUpdate" options={{headerTitle: 'Update Invoice'}}/>
      <Stack.Screen name="spentCreate" options={{headerTitle: 'Add new Spent'}}/>
    </Stack>
  );
}
