import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs, Redirect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSelector } from 'react-redux';
import { RootState } from '../(redux)/store';

import { darkSecondColor } from '@/settings';


export default function TabLayout() {
  const token = useSelector((state:RootState) => state.auth.token);
  if (!token) {
    return <Redirect href="/" />;
  }
  return (
    <>
    <StatusBar style="light" />
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#6A5ACD',
        tabBarStyle: {backgroundColor: darkSecondColor},
      }}
    >
      <Tabs.Screen
        name="(clients)"
        options={{
          title: 'Clients',
          headerShown: false,
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="users" color={color} />,
        }}
      />
      <Tabs.Screen
        name="(jobs)"
        options={{
          title: 'Jobs',
          headerShown: false,
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="id-card" color={color} />,
        }}
      />
      <Tabs.Screen
        name="(profile)"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="cogs" color={color} />,
        }}
      />
    </Tabs>
    </>
  );
}
