import { Stack } from "expo-router";
import { useSelector } from 'react-redux';
import { RootState } from '../../(redux)/store';

import { darkSecondColor, lightSecondColor } from "@/settings";


export default function BusinessLayout() {
  const {color, darkTheme} = useSelector((state:RootState) => state.settings);
  
  return (
    <Stack 
      screenOptions={{
        headerStyle: {
          backgroundColor: darkTheme ? darkSecondColor : lightSecondColor,
        },
      }}
    >
      <Stack.Screen name="businesses" options={{headerTitle: 'Businesses'}}/>
      <Stack.Screen name="businessDetails" options={{headerTitle: 'Details'}}/>
      <Stack.Screen name="businessCreate" options={{headerTitle: 'Add New Business'}}/>
      <Stack.Screen name="businessUpdate" options={{headerTitle: 'Update Business'}}/>
    </Stack>
  );
}
