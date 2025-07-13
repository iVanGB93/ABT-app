import { Redirect, Stack } from "expo-router";
import { useSelector } from 'react-redux';
import { RootState } from '../../(redux)/store';
import { ScrollView, View } from "react-native";

import { darkSecondColor, lightSecondColor } from "@/settings";
import { ThemedText } from "@/components/ThemedText";


function BusinessNameHeader({ name }: { name: string }) {
  return (
    <View style={{ minWidth: 120, maxWidth: 250, marginLeft: 40, paddingRight: 8 }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <ThemedText
          numberOfLines={1}
          style={{
            fontWeight: 'bold',
            fontSize: 18,
            textAlign: 'right',
          }}
        >
          {name}
        </ThemedText>
      </ScrollView>
    </View>
  );
}

export default function ItemLayout() {
  const {color, darkTheme, business} = useSelector((state:RootState) => state.settings);
  
  if (!business || Object.keys(business).length === 0) {
    return <Redirect href={'/(businessSelect)'}/>
  }
  
  return (
    <Stack 
      screenOptions={{
        headerStyle: {
          backgroundColor: darkTheme ? darkSecondColor : lightSecondColor,
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerTitle: 'Items',
          headerRight: () => <BusinessNameHeader name={business.name} />,
        }}
      />
      <Stack.Screen name="itemDetails" options={{headerTitle: 'Item Details'}}/>
      <Stack.Screen name="itemCreate" options={{headerTitle: 'Add new Item'}}/>
      <Stack.Screen name="itemUpdate" options={{headerTitle: 'Update Item'}}/>
    </Stack>
  );
}
