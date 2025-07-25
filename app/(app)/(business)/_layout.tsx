import { Stack, Redirect } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../(redux)/store';
import { StatusBar } from 'expo-status-bar';

import { darkSecondColor, darkTtextColor, lightSecondColor, lightTextColor } from '@/settings';
import { Pressable, View } from 'react-native';
import { setBusiness } from '@/app/(redux)/settingSlice';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';

export default function BusinessLayout() {
  const { darkTheme, business } = useSelector((state: RootState) => state.settings);
  const token = useSelector((state: RootState) => state.auth.token);
  const dispatch = useDispatch();

  if (!token) {
    return <Redirect href="/" />;
  }
  if (!business || Object.keys(business).length === 0) {
    return <Redirect href="/(businessSelect)" />;
  }

  const handleChangeBusiness = async () => {
    dispatch(setBusiness({}));
  };

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
          name="businessDetails"
          options={{
            headerTitle: 'Details',
            headerRight: () => (
              <Pressable
                onPress={() => {
                  handleChangeBusiness();
                }}
                style={{ marginRight: 10 }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <ThemedText>Exit</ThemedText>
                  <Ionicons
                    name="exit"
                    size={24}
                    color={darkTheme ? darkTtextColor : lightTextColor}
                  />
                </View>
              </Pressable>
            ),
          }}
        />
        <Stack.Screen
          name="businessExpenseCreate"
          options={{ headerTitle: 'Add New Business Expense' }}
        />
        <Stack.Screen
          name="businessIncomeCreate"
          options={{ headerTitle: 'Add New Business Income' }}
        />
        <Stack.Screen
          name="businessIncomeUpdate"
          options={{ headerTitle: 'Update Business Income' }}
        />
        <Stack.Screen
          name="businessExpenseUpdate"
          options={{ headerTitle: 'Update Business Expense' }}
        />
        <Stack.Screen name="businessUpdate" options={{ headerTitle: 'Update Business' }} />
      </Stack>
    </>
  );
}
