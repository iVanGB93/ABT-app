import React, { useEffect } from 'react';
import { StyleSheet, Text, View, RefreshControl, FlatList, SafeAreaView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useSelector } from "react-redux";
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { RootState, useAppDispatch } from "@/app/(redux)/store";
import { clientFail, clientSetLoading, setClient, setClients } from "@/app/(redux)/clientSlice";
import ClientCard from '@/components/clients/ClientCard';
import { darkMainColor, darkSecondColor } from '@/settings';
import axiosInstance from '@/axios';


interface Client {
  id: string;
  user: string;
  address: string;
  phone: string;
  email: string;
  image: string;
};

export default function Clients() {
  const { color, darkTheme } = useSelector((state: RootState) => state.settings);
  const { userName } = useSelector((state: RootState) => state.auth);
  const {clients, clientLoading, clientError} = useSelector((state: RootState) => state.client);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const getClients = async() => {
    dispatch(clientSetLoading(true));
    await axiosInstance
    .get(`user/clients/${userName}/`)
    .then(function(response) {
        if (response.data) {
          dispatch(setClients(response.data));
        } else {
          dispatch(clientFail(response.data.message));
        }
    })
    .catch(function(error) {
        console.error('Error fetching clients:', error);
        try {
            const message = error.data.message;
            dispatch(clientFail(message));
        } catch(e) {
            dispatch(clientFail("Error getting your clients."));
        }
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
    fetchClients();
  }, []);

  const handlePressable = (id: string) => {
    let client = clients.find((client: { id: string; }) => client.id === id);
    dispatch(setClient(client));
    router.push('/(app)/(clients)/clientDetails');
  };

  return (
    <ThemedView style={[styles.container, {backgroundColor:darkTheme ? darkMainColor: color}]}>
      {clientError ?
      <>
        <ThemedText>{clientError}</ThemedText>
        <TouchableOpacity style={[styles.updateButton, {backgroundColor: color}]} onPress={() => fetchClients()}>
        <ThemedText>Try againg</ThemedText>
        </TouchableOpacity>
      </>
      :
      clientLoading ? 
      <ActivityIndicator color={color} size="large" />
      :
      <>
      <FlatList
        data={clients}
        renderItem={({ item }) => {
          return (
            <TouchableOpacity onPress={() => handlePressable(item.id)}>
              <ClientCard id={item.id} name={item.user} address={item.address} phone={item.phone} email={item.email} image={item.image}/>
            </TouchableOpacity>
          );
        }}
        ItemSeparatorComponent={<View style={{ height: 10}}/>}
        ListEmptyComponent={<ThemedText style={styles.loading}>{ clientError ? clientError.toString() + ", pull to refresh" : "No clients found"}</ThemedText>}
        ListHeaderComponent={<View style={{margin: 5}} />}
        ListFooterComponent={<View style={{margin: 5}} />}
        refreshControl={
          <RefreshControl
            refreshing={clientLoading}
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
    shadowRadius: 2,
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