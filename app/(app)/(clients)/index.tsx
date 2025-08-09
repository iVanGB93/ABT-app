import React, { useEffect, useState } from 'react';
import { View, RefreshControl, FlatList, ActivityIndicator, TouchableOpacity, TextInput } from 'react-native';
import { useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import Toast from 'react-native-toast-message';
import { Vibration } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { RootState, useAppDispatch } from '@/app/(redux)/store';
import { clientSetMessage, setClient, setClients } from '@/app/(redux)/clientSlice';
import ClientCard from '@/components/clients/ClientCard';
import axiosInstance from '@/axios';
import { setBusiness, setMessage } from '@/app/(redux)/settingSlice';
import { commonStyles } from '@/constants/commonStyles';
import { authLogout, authSetMessage } from '@/app/(redux)/authSlice';

export default function Clients() {
  const { color, business, darkTheme } = useSelector((state: RootState) => state.settings);
  const { clients, clientMessage } = useSelector((state: RootState) => state.client);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const dispatch = useAppDispatch();
  const router = useRouter();

  const getClients = async () => {
    setIsLoading(true);
    await axiosInstance
      .get(`clients/${business.name}/`)
      .then(function (response) {
        Vibration.vibrate(15);
        if (response.data) {
          dispatch(setClients(response.data));
          setIsLoading(false);
        } else {
          dispatch(clientSetMessage(response.data.message));
          setIsLoading(false);
        }
      })
      .catch(function (error) {
        Vibration.vibrate(60);
        console.error('Error fetching clients:', error);
        if (typeof error.response === 'undefined') {
          setError(
            'A server/network error occurred. ' + 'Sorry about this - try againg in a few minutes.',
          );
        } else {
          if (error.status === 401) {
            dispatch(authSetMessage('Unauthorized, please login againg'));
            dispatch(setBusiness([]));
            dispatch(authLogout());
            router.replace('/');
          } else {
            setError('Error getting your clients.');
          }
        }
        setIsLoading(false);
      });
  };

  const fetchClients = () => {
    getClients();
    /* if (clients.length !== 0) {
        console.log("SAME CLIENTS");
    } else {
        getClients();
    } */
  };

  useEffect(() => {
    if (clientMessage) {
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: clientMessage,
      });
      dispatch(clientSetMessage(null));
    }
    fetchClients();
  }, []);

  const filteredClients = [...clients].filter(
    (client) =>
      client.name.toLowerCase().includes(search.toLowerCase()) ||
      client.last_name.toLowerCase().includes(search.toLowerCase()) ||
      client.phone.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => a.name.localeCompare(b.name));


  const handlePressable = (id: string) => {
    let client = clients.find((client: { id: string }) => client.id === id);
    dispatch(setClient(client));
    router.navigate('/(app)/(clients)/clientDetails');
  };

  return (
      <ThemedView style={commonStyles.container}>
        <View style={commonStyles.tabHeader}>
          <ThemedText type="subtitle">Clients</ThemedText>
          <ThemedText type="subtitle">{business.name}</ThemedText>
        </View>
        <View style={{ paddingHorizontal: 10, marginBottom: 5 }}>
          <TextInput
            placeholder="Search by name, last name or phone"
            placeholderTextColor="#888"
            value={search}
            onChangeText={setSearch}
            style={{
              backgroundColor: darkTheme ? '#222' : '#f2f2f2',
              color: darkTheme ? '#fff' : '#000',
              borderRadius: 8,
              padding: 10,
              borderWidth: 1,
              borderColor: darkTheme ? '#444' : '#ccc',
            }}
          />
        </View>
        {isLoading ? (
          <ActivityIndicator style={commonStyles.containerCentered} color={color} size="large" />
        ) : error ? (
          <View style={commonStyles.containerCentered}>
            <ThemedText>{error}</ThemedText>
            <TouchableOpacity
              style={[commonStyles.button, { borderColor: color }]}
              onPress={() => fetchClients()}
            >
              <ThemedText>Try againg</ThemedText>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <FlatList
              data={filteredClients}
              renderItem={({ item }) => {
                return (
                  <TouchableOpacity onPress={() => handlePressable(item.id)}>
                    <ClientCard
                      name={item.name}
                      last_name={item.last_name}
                      image={item.image}
                    />
                  </TouchableOpacity>
                );
              }}
              ItemSeparatorComponent={() => <View style={{ height: 5 }} />}
              ListEmptyComponent={
                <ThemedText style={commonStyles.loading}>
                  {clientMessage
                    ? clientMessage.toString() + ', pull to refresh'
                    : 'No clients found, pull to refresh or create a new one'}
                </ThemedText>
              }
              ListHeaderComponent={<View style={{ margin: 5 }} />}
              ListFooterComponent={<View style={{ margin: 5 }} />}
              refreshControl={
                <RefreshControl
                  refreshing={isLoading}
                  onRefresh={() => getClients()}
                  colors={[color]} // Colores del indicador de carga
                  tintColor={color} // Color del indicador de carga en iOS
                />
              }
            />
            <TouchableOpacity
              style={[commonStyles.createButton, { backgroundColor: color }]}
              onPress={() => router.navigate('/(app)/(clients)/clientCreate')}
            >
              <Ionicons name="add" size={36} color="#FFF" />
            </TouchableOpacity>
          </>
        )}
      </ThemedView>
  );
}
