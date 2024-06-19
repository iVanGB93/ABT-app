import { useSelector } from 'react-redux';
import { Stack } from "expo-router";
import { RootState } from '../../(redux)/store';

import { darkSecondColor, lightSecondColor } from "@/settings";


export default function ProfileLayout() {
  const {color, darkTheme} = useSelector((state:RootState) => state.settings);

  return (
    <Stack 
    screenOptions={{
      headerStyle: {
          backgroundColor: darkTheme ? darkSecondColor : lightSecondColor,
      },
    }}
    >
      <Stack.Screen name="index" options={{headerTitle: 'Profile'}} />
      <Stack.Screen name="businessSettings" options={{headerTitle: 'Update Account'}}/>
      <Stack.Screen name="styleSettings" options={{headerTitle: 'Update Business'}}/>
    </Stack>
  );
}
