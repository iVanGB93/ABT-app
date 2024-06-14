import { Stack } from "expo-router";
import { useSelector } from 'react-redux';
import { RootState } from '../../(redux)/store';

import { darkSecondColor, lightSecondColor } from "@/settings";


export default function ClientLayout() {
  const {color, darkTheme} = useSelector((state:RootState) => state.settings);
  
  return (
    <Stack 
      screenOptions={{
        headerStyle: {
          backgroundColor: darkTheme ? darkSecondColor : lightSecondColor,
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
