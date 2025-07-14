import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  RefreshControl,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useSelector } from 'react-redux';
import { Redirect, useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import Toast from 'react-native-toast-message';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { RootState, useAppDispatch } from '@/app/(redux)/store';
import { businessSetMessage, setBusinesses } from '@/app/(redux)/businessSlice';
import axiosInstance from '@/axios';
import { setBusiness, setMessage } from '@/app/(redux)/settingSlice';
import BusinessCard from '@/components/business/BusinessCard';
import { commonStyles } from '@/constants/commonStyles';
import { darkSecondColor, lightSecondColor } from '@/settings';
import { authLogout } from '../(redux)/authSlice';

export default function BusinessSelect() {
  const { color, darkTheme, business } = useSelector((state: RootState) => state.settings);
  const { userName } = useSelector((state: RootState) => state.auth);
  const { businesses, businessMessage } = useSelector((state: RootState) => state.business);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const getBusinesses = async () => {
    setIsLoading(true);
    await axiosInstance
      .get(`business/${userName}/`)
      .then(function (response) {
        if (response.data) {
          setError(null);
          dispatch(setBusinesses(response.data));
          setIsLoading(false);
        } else {
          dispatch(businessSetMessage(response.data.message));
          setIsLoading(false);
        }
      })
      .catch(function (error) {
        console.error('Error fetching business:', error);
        if (typeof error.response === 'undefined') {
          setError(
            'A server/network error occurred. ' + 'Sorry about this - try againg in a few minutes.',
          );
          setIsLoading(false);
        } else {
          if (error.status === 401) {
            setIsLoading(false);
            dispatch(setMessage('Unauthorized, please login againg'));
            router.navigate('/');
          } else {
            setError('Error getting your businesses.');
            setIsLoading(false);
          }
        }
      });
  };

  useEffect(() => {
    if (business && Object.keys(business).length > 0) {
      router.navigate('/(app)/(business)/businessDetails');
      return;
    }
    if (businessMessage) {
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: businessMessage,
      });
      dispatch(businessSetMessage(null));
    }
    getBusinesses();
  }, []);

  const handlePressable = (id: string) => {
    let business = businesses.find((business: { id: string }) => business.id === id);
    dispatch(setBusiness(business));
    router.navigate('/(app)/(business)/businessDetails');
  };

  const handleLogout = async () => {
    dispatch(authLogout());
    router.replace('/(auth)/login');
  };

  return (
    <ThemedView style={[commonStyles.containerCentered, { marginTop: 100 }]}>
      {error ? (
        <>
          <ThemedText>{error}</ThemedText>
          <TouchableOpacity
            style={[
              commonStyles.button,
              {
                borderColor: color,
                marginTop: 50,
                backgroundColor: darkTheme ? darkSecondColor : lightSecondColor,
              },
            ]}
            onPress={() => getBusinesses()}
          >
            <ThemedText>Try againg</ThemedText>
          </TouchableOpacity>
        </>
      ) : isLoading ? (
        <ActivityIndicator color={color} size="large" />
      ) : (
        <>
          <ThemedText type="title">Select a business</ThemedText>
          <FlatList
            data={businesses}
            renderItem={({ item }) => {
              return (
                <TouchableOpacity onPress={() => handlePressable(item.id)}>
                  <BusinessCard
                    inDetail
                    id={item.id}
                    name={item.name}
                    description={item.description}
                    address={item.address}
                    phone={item.phone}
                    email={item.email}
                    logo={item.logo}
                    owners={item.owners}
                    website={item.website}
                    created_at={item.created_at}
                    updated_at={item.updated_at}
                  />
                </TouchableOpacity>
              );
            }}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            ListEmptyComponent={
              <ThemedText style={commonStyles.loading}>
                {businessMessage
                  ? businessMessage.toString() + ', pull to refresh'
                  : 'No business found, pull to refresh or create one'}
              </ThemedText>
            }
            ListHeaderComponent={<View style={{ margin: 5 }} />}
            ListFooterComponent={
              <TouchableOpacity style={[commonStyles.button, { borderColor: color, margin: 15 }]} onPress={() => handleLogout()}>
                <ThemedText>Change user</ThemedText>
              </TouchableOpacity>
            }
            refreshControl={
              <RefreshControl
                refreshing={isLoading}
                onRefresh={() => getBusinesses()}
                colors={[color]} // Colores del indicador de carga
                tintColor={color} // Color del indicador de carga en iOS
              />
            }
          />
          <TouchableOpacity
            style={[commonStyles.createButton, { backgroundColor: color }]}
            onPress={() => router.navigate('/(businessSelect)/businessCreate')}
          >
            <Ionicons name="add" size={30} color="#FFF" />
          </TouchableOpacity>
        </>
      )}
    </ThemedView>
  );
}
