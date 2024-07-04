import { Stack } from "expo-router";
import { useSelector } from 'react-redux';
import { RootState } from '../../(redux)/store';

import { darkSecondColor, lightSecondColor } from "@/settings";


export default function ItemLayout() {
  const {color, darkTheme} = useSelector((state:RootState) => state.settings);
  
  return (
    <Stack 
      screenOptions={{
        headerStyle: {
          backgroundColor: darkTheme ? darkSecondColor : lightSecondColor,
        },
      }}
    >
      <Stack.Screen name="index" options={{headerTitle: 'Items'}}/>
      <Stack.Screen name="itemDetails" options={{headerTitle: 'Item Details'}}/>
      <Stack.Screen name="itemCreate" options={{headerTitle: 'Add new Item'}}/>
    </Stack>
  );
}
