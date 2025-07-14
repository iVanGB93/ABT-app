import { Stack } from "expo-router";
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../(redux)/store';

import { darkSecondColor, darkTtextColor, lightSecondColor, lightTextColor } from "@/settings";
import { Pressable } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { setBusiness } from "@/app/(redux)/settingSlice";
import { Ionicons } from "@expo/vector-icons";


export default function BusinessLayout() {
  const {color, darkTheme} = useSelector((state:RootState) => state.settings);
  const dispatch = useDispatch();

  const handleChangeBusiness = async () => {
      dispatch(setBusiness({}));
  };
  
  return (
    <Stack 
      screenOptions={{
        headerStyle: {
          backgroundColor: darkTheme ? darkSecondColor : lightSecondColor,
        },
      }}
    >
      <Stack.Screen name="businessDetails" options={{headerTitle: 'Details', headerRight: () => (
        <Pressable onPress={() => {handleChangeBusiness()}} style={{marginRight: 10}}>
          <Ionicons name="exit" size={24} color={darkTheme ? darkTtextColor : lightTextColor} />
        </Pressable>
      )}}/>
      <Stack.Screen name="businessExpenseCreate" options={{headerTitle: 'Add New Business Expense'}}/>
      <Stack.Screen name="businessIncomeCreate" options={{headerTitle: 'Add New Business Income'}}/>
      <Stack.Screen name="businessIncomeUpdate" options={{headerTitle: 'Update Business Income'}}/>
      <Stack.Screen name="businessExpenseUpdate" options={{headerTitle: 'Update Business Expense'}}/>
      <Stack.Screen name="businessUpdate" options={{headerTitle: 'Update Business'}}/>
    </Stack>
  );
}
