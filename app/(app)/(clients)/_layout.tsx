import { Redirect, Stack } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '../../(redux)/store';
import { ScrollView, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { darkSecondColor, lightSecondColor } from '@/settings';
import { ThemedText } from '@/components/ThemedText';

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
  const token = useSelector((state: RootState) => state.auth.token);
  const { darkTheme, business } = useSelector((state: RootState) => state.settings);

  if (!token) {
    return <Redirect href="/" />;
  }
  if (!business || Object.keys(business).length === 0) {
    return <Redirect href="/(businessSelect)" />;
  }

  return (
    <>
      <StatusBar style={darkTheme ? 'light' : 'dark'} />
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
            headerTitle: 'Clients',
            headerLeft: () => null,
            headerRight: () => <BusinessNameHeader name={business.name} />,
          }}
        />
        <Stack.Screen name="clientDetails" options={{ headerTitle: 'Client Details' }} />
        <Stack.Screen name="clientCreate" options={{ headerTitle: 'Add New Client' }} />
        <Stack.Screen name="clientUpdate" options={{ headerTitle: 'Update Client' }} />
      </Stack>
    </>
  );
}
