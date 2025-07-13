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

export default function JobLayout() {
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
          headerTitle: 'Jobs',
          headerRight: () => <BusinessNameHeader name={business.name} />,
        }}
      />
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
