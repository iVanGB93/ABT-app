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

export default function ClientLayout() {
  const {color, darkTheme} = useSelector((state:RootState) => state.settings);
  const {business} = useSelector((state:RootState) => state.business);
  
  if (!business || Object.keys(business).length === 0) {
    return <Redirect href={'/(app)/(business)/businesses'}/>
  }

  return (
    <Stack 
      screenOptions={{
        headerStyle: {
          backgroundColor: darkTheme ? darkSecondColor : lightSecondColor,
        }
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerTitle: 'Clients',
          headerRight: () => <BusinessNameHeader name={business.name} />,
        }}
      />
      <Stack.Screen name="clientDetails" options={{headerTitle: 'Client Details'}}/>
      <Stack.Screen name="clientCreate" options={{headerTitle: 'Add New Client'}}/>
      <Stack.Screen name="clientUpdate" options={{headerTitle: 'Update Client'}}/>
    </Stack>
  );
}
