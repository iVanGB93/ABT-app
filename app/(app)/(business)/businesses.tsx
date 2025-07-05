import React, { useEffect, useState } from 'react';
import { StyleSheet, View, RefreshControl, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useSelector } from "react-redux";
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import Toast from 'react-native-toast-message';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { RootState, useAppDispatch } from "@/app/(redux)/store";
import { businessSetMessage, setBusiness, setBusinesses } from "@/app/(redux)/businessSlice";
import axiosInstance from '@/axios';
import { setMessage } from '@/app/(redux)/settingSlice';
import BusinessCard from '@/components/business/BusinessCard';


export default function Businesses() {
  const { color, darkTheme } = useSelector((state: RootState) => state.settings);
  const { userName } = useSelector((state: RootState) => state.auth);
  const {businesses, businessMessage} = useSelector((state: RootState) => state.business);
  const [isLoading, setIsLoading] = useState(false);
  const [ error, setError ] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const getBusinesses = async() => {
    setIsLoading(true);
    await axiosInstance
    .get(`business/${userName}/`)
    .then(function(response) {
        if (response.data) {
          dispatch(setBusinesses(response.data));
          setIsLoading(false);
        } else {
          dispatch(businessSetMessage(response.data.message));
          setIsLoading(false);
        }
    })
    .catch(function(error) {
        console.error('Error fetching business:', error);
        if (typeof error.response === 'undefined') {
          setError('A server/network error occurred. ' + 'Sorry about this - try againg in a few minutes.');
          setIsLoading(false);
        } else {
          if (error.status === 401) {
            setIsLoading(false);
            dispatch(setMessage('Unauthorized, please login againg'))
            router.push('/');
          } else {
            setError("Error getting your businesses.");
            setIsLoading(false);
          }
        };
    });
  };
  
  const fetchBusinesses = () => {
    getBusinesses();
    /* if (clients.length !== 0) {
        console.log("SAME CLIENTS");
    } else {
        getClients();
    } */
  };
  
  useEffect(() => {
    if ( businessMessage) {
      Toast.show({
          type: 'success',
          text1: 'Success',
          text2: businessMessage
      });
      dispatch(businessSetMessage(null))
    };
    fetchBusinesses();
  }, []);

  const handlePressable = (id: string) => {
    let business = businesses.find((business: { id: string; }) => business.id === id);
    dispatch(setBusiness(business));
    router.navigate('/(app)/(clients)');
  };

  return (
    <ThemedView style={styles.container}>
      {error ?
      <>
        <ThemedText>{error}</ThemedText>
        <TouchableOpacity style={[styles.updateButton, {backgroundColor: color}]} onPress={() => fetchBusinesses()}>
        <ThemedText>Try againg</ThemedText>
        </TouchableOpacity>
      </>
      :
      isLoading ? 
      <ActivityIndicator color={color} size="large" />
      :
      <>
      <FlatList
        data={businesses}
        renderItem={({ item }) => {
          return (
            <TouchableOpacity onPress={() => handlePressable(item.id)}>
              <BusinessCard id={item.id} name={item.name} description={item.description} address={item.address} phone={item.phone} email={item.email} logo={item.logo} owners={item.owners} website={item.website} created_at={item.created_at} updated_at={item.updated_at}/>
            </TouchableOpacity>
          );
        }}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListEmptyComponent={<ThemedText style={styles.loading}>{ businessMessage ? businessMessage.toString() + ", pull to refresh" : "No clients found, pull to refresh"}</ThemedText>}
        ListHeaderComponent={<View style={{margin: 5}} />}
        ListFooterComponent={<View style={{margin: 5}} />}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() => getBusinesses()}
            colors={[color]} // Colores del indicador de carga
            tintColor={color} // Color del indicador de carga en iOS
        />}
      />
      <TouchableOpacity style={[styles.button, {backgroundColor: color}]} onPress={() => router.navigate('/businessCreate')}>
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