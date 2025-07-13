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
      <Stack.Screen name="businessDetails" options={{headerTitle: 'Details'}}/>
      <Stack.Screen name="businessExpenseCreate" options={{headerTitle: 'Add New Business Expense'}}/>
      <Stack.Screen name="businessIncomeCreate" options={{headerTitle: 'Add New Business Income'}}/>
      <Stack.Screen name="businessUpdate" options={{headerTitle: 'Update Business'}}/>
    </Stack>
  );
}
