import React, { useEffect, useState } from 'react';
import { StyleSheet, View, RefreshControl, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useSelector } from "react-redux";
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import Toast from 'react-native-toast-message';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { RootState, useAppDispatch } from "@/app/(redux)/store";
import { clientSetMessage, setClient, setClients } from "@/app/(redux)/clientSlice";
import ClientCard from '@/components/clients/ClientCard';
import axiosInstance from '@/axios';
import { setMessage } from '@/app/(redux)/settingSlice';


export default function Clients() {
  const { color, darkTheme } = useSelector((state: RootState) => state.settings);
  const { userName } = useSelector((state: RootState) => state.auth);
  const {clients, clientMessage} = useSelector((state: RootState) => state.client);
  const [isLoading, setIsLoading] = useState(false);
  const [ error, setError ] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const getClients = async() => {
    setIsLoading(true);
    await axiosInstance
    .get(`clients/${userName}/`)
    .then(function(response) {
        if (response.data) {
          dispatch(setClients(response.data));
          setIsLoading(false);
        } else {
          dispatch(clientSetMessage(response.data.message));
          setIsLoading(false);
        }
    })
    .catch(function(error) {
        console.error('Error fetching clients:', error);
        if (typeof error.response === 'undefined') {
          setError('A server/network error occurred. ' + 'Sorry about this - try againg in a few minutes.');
          setIsLoading(false);
        } else {
          if (error.status === 401) {
            setIsLoading(false);
            dispatch(setMessage('Unauthorized, please login againg'))
            router.push('/');
          } else {
            setError("Error getting your clients.");
            setIsLoading(false);
          }
        };
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
    if ( clientMessage) {
      Toast.show({
          type: 'success',
          text1: 'Success',
          text2: clientMessage
      });
      dispatch(clientSetMessage(null))
    };
    fetchClients();
  }, []);

  const handlePressable = (id: string) => {
    let client = clients.find((client: { id: string; }) => client.id === id);
    dispatch(setClient(client));
    router.push('/(app)/(clients)/clientDetails');
  };

  return (
    <ThemedView style={styles.container}>
      {error ?
      <>
        <ThemedText>{error}</ThemedText>
        <TouchableOpacity style={[styles.updateButton, {backgroundColor: color}]} onPress={() => fetchClients()}>
        <ThemedText>Try againg</ThemedText>
        </TouchableOpacity>
      </>
      :
      isLoading ? 
      <ActivityIndicator color={color} size="large" />
      :
      <>
      <FlatList
        data={clients}
        renderItem={({ item }) => {
          return (
            <TouchableOpacity onPress={() => handlePressable(item.id)}>
              <ClientCard id={item.id} name={item.name} last_name={item.last_name} address={item.address} phone={item.phone} email={item.email} image={item.image}/>
            </TouchableOpacity>
          );
        }}
        ItemSeparatorComponent={<View style={{ height: 10}}/>}
        ListEmptyComponent={<ThemedText style={styles.loading}>{ clientMessage ? clientMessage.toString() + ", pull to refresh" : "No clients found, pull to refresh"}</ThemedText>}
        ListHeaderComponent={<View style={{margin: 5}} />}
        ListFooterComponent={<View style={{margin: 5}} />}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() => getClients()}
            colors={[color]} // Colores del indicador de carga
            tintColor={color} // Color del indicador de carga en iOS
        />}
      />
      <TouchableOpacity style={[styles.button, {backgroundColor: color}]} onPress={() => router.push('/(app)/(clients)/clientCreate')}>
        <Ionicons name="add" size={30} color="#FFF" />
      </TouchableOpacity>
      </>
      }
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
  },
  loading: {
      flex: 1,
      verticalAlign: 'middle',
      alignSelf: 'center',
      fontSize: 18,
  },
  button: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 1,
    elevation: 5,
  },
  updateButton: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    marginTop: 50,
    width: '80%',
    borderRadius: 10,
  },
});