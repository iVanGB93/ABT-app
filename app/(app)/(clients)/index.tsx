import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  RefreshControl,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useSelector } from 'react-redux';
import { useRouter, useFocusEffect } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import Toast from 'react-native-toast-message';
import { Vibration } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { RootState, useAppDispatch } from '@/app/(redux)/store';
import { clientSetMessage, setClient } from '@/app/(redux)/clientSlice';
import ClientCard from '@/components/clients/ClientCard';
import { commonStyles } from '@/constants/commonStyles';
import { useClients } from '@/hooks';

export default function Clients() {
  const { color, business, darkTheme } = useSelector((state: RootState) => state.settings);
  const { clientMessage } = useSelector((state: RootState) => state.client);
  const [search, setSearch] = useState('');
  const dispatch = useAppDispatch();
  const router = useRouter();

  const {
    clients,
    loading: clientsLoading,
    error: clientsError,
    refresh: refreshClients,
  } = useClients(search);

  // Mostrar mensajes de éxito
  useEffect(() => {
    if (clientMessage) {
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: clientMessage,
      });
      dispatch(clientSetMessage(null));
    }
  }, [clientMessage]);

  // Refresca la lista cuando se enfoca la pantalla
  useFocusEffect(
    React.useCallback(() => {
      // Refrescar la lista cuando se regresa a esta pantalla
      refreshClients();
    }, [refreshClients])
  );

  // Manejar errores del hook
  useEffect(() => {
    if (clientsError) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: clientsError,
      });
    }
  }, [clientsError]);

  const handlePressable = (id: number) => {
    let client = clients.find((client: any) => client.id === id);
    dispatch(setClient(client));
    router.navigate('/(app)/(clients)/clientDetails');
  };

  const handleRefresh = async () => {
    Vibration.vibrate(15);
    await refreshClients();
  };

  return (
    <ThemedView style={commonStyles.container}>
      <View style={commonStyles.tabHeader}>
        <ThemedText type="subtitle">Clients</ThemedText>
        <ThemedText type="subtitle">{business.name}</ThemedText>
      </View>
      <View style={{ paddingHorizontal: 10, marginBottom: 5 }}>
        <TextInput
          placeholder="Search by name, last name, email, phone or address"
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
      {clientsLoading ? (
        <ActivityIndicator style={commonStyles.containerCentered} color={color} size="large" />
      ) : clientsError ? (
        <View style={commonStyles.containerCentered}>
          <ThemedText>{clientsError}</ThemedText>
          <TouchableOpacity
            style={[commonStyles.button, { borderColor: color }]}
            onPress={() => handleRefresh()}
          >
            <ThemedText>Try again</ThemedText>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={clients}
            keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
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
            contentContainerStyle={
              clients.length === 0
                ? { flexGrow: 1, justifyContent: 'center', alignItems: 'center' }
                : undefined
            }
            ListEmptyComponent={
              <View style={{ alignItems: 'center', justifyContent: 'center', padding: 16 }}>
                <ThemedText type="subtitle" style={{ textAlign: 'center' }}>
                  {clientMessage
                    ? clientMessage.toString() + ', pull to refresh'
                    : 'No clients found, create your first one'}
                </ThemedText>
              </View>
            }
            ListHeaderComponent={<View style={{ margin: 5 }} />}
            ListFooterComponent={<View style={{ margin: 5 }} />}
            refreshControl={
              <RefreshControl
                refreshing={clientsLoading}
                onRefresh={() => handleRefresh()}
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
