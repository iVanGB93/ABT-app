import React, { useEffect, useState } from 'react';
import { View, RefreshControl, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import Toast from 'react-native-toast-message';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { RootState, useAppDispatch } from '@/app/(redux)/store';
import { businessSetMessage, setBusinesses } from '@/app/(redux)/businessSlice';
import axiosInstance from '@/axios';
import { setBusiness, setMessage, cleanSettings } from '@/app/(redux)/settingSlice';
import BusinessCard from '@/components/business/BusinessCard';
import { commonStyles } from '@/constants/commonStyles';
import { darkSecondColor, lightSecondColor } from '@/settings';
import { authLogout } from '../../(redux)/authSlice';


export default function IndexBusiness() {
  const { color, darkTheme, business } = useSelector((state: RootState) => state.settings);
  const { userName } = useSelector((state: RootState) => state.auth);
  const { businesses, businessMessage } = useSelector((state: RootState) => state.business);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const hasBusiness = !!business && Object.keys(business).length > 0;

  const getBusinesses = async () => {
    if (hasBusiness) return; // evita cargar lista si ya hay uno seleccionado
    setIsLoading(true);
    await axiosInstance
      .get(`business/${userName}/`)
      .then(function (response) {
        if (response.data) {
          setError(null);
          dispatch(setBusinesses(response.data));
        } else {
          dispatch(businessSetMessage(response.data.message));
        }
      })
      .catch(function (error) {
        console.error('Error fetching business:', error?.config);
        if (typeof error.response === 'undefined') {
          setError(
            'A server/network error occurred. Sorry about this - try again in a few minutes.',
          );
        } else {
          if (error.response?.status === 401) {
            dispatch(setMessage('Unauthorized, please login again'));
            router.replace('/'); // usa replace
          } else {
            setError('Error getting your businesses.');
          }
        }
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    if (!hasBusiness) {
      if (userName) {
        getBusinesses();
      } else {
        router.replace('/(auth)/login');
      }
    }
  }, [userName, hasBusiness]);

  useEffect(() => {
    if (hasBusiness) {
      router.replace('/(app)/(business)/businessDetails');
    }
  }, [hasBusiness]);

  useEffect(() => {
    if (businessMessage) {
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: businessMessage,
      });
      dispatch(businessSetMessage(null));
    }
  }, [businessMessage]);

  const handlePressable = (id: string) => {
    const picked = businesses.find((b: { id: string }) => b.id === id);
    if (picked) {
      dispatch(setBusiness(picked));
      router.replace('/(app)/(business)/businessDetails');
    }
  };

  const handleLogout = async () => {
    dispatch(authLogout());
    dispatch(cleanSettings());
    router.replace('/(auth)/login');
  };

  return hasBusiness ? null : (
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
            <ThemedText>Try again</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              commonStyles.button,
              {
                borderColor: color,
                marginTop: 50,
                backgroundColor: darkTheme ? darkSecondColor : lightSecondColor,
              },
            ]}
            onPress={() => handleLogout()}
          >
            <ThemedText>Log Out</ThemedText>
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
            ListFooterComponent={<View style={{ margin: 5 }} />}
            refreshControl={
              <RefreshControl
                refreshing={isLoading}
                onRefresh={() => getBusinesses()}
                colors={[color]}
                tintColor={color}
              />
            }
          />
          <TouchableOpacity
            style={[
              commonStyles.button,
              {
                position: 'absolute',
                bottom: 30,
                borderColor: color,
                backgroundColor: darkTheme ? darkSecondColor : lightSecondColor,
              },
            ]}
            onPress={() => handleLogout()}
          >
            <ThemedText>Log Out</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[commonStyles.createButton, { backgroundColor: color }]}
            onPress={() => router.navigate('/(app)/(business)/businessCreate')}
          >
            <Ionicons name="add" size={36} color="#FFF" />
          </TouchableOpacity>
        </>
      )}
    </ThemedView>
  );
}
