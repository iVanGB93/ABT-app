import React, { useEffect, useState } from 'react';
import {
  View,
  RefreshControl,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import Toast from 'react-native-toast-message';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { RootState, useAppDispatch } from '@/app/(redux)/store';
import axiosInstance from '@/axios';
import { setMessage } from '@/app/(redux)/settingSlice';
import { setItem, setItemMessage, setItems } from '@/app/(redux)/itemSlice';
import ItemCard from '@/components/items/ItemCard';
import { commonStyles } from '@/constants/commonStyles';

export default function Items() {
  const { color, darkTheme, business } = useSelector((state: RootState) => state.settings);
  const { items, itemMessage } = useSelector((state: RootState) => state.item);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const dispatch = useAppDispatch();
  const router = useRouter();

  const getItems = async () => {
    setIsLoading(true);
    await axiosInstance
      .get(`items/list/${business.name}/`)
      .then(function (response) {
        if (response.data) {
          dispatch(setItems(response.data));
        } else {
          dispatch(setItemMessage(response.data.message));
        }
        setIsLoading(false);
      })
      .catch(function (error) {
        console.error('Error fetching items:', error);
        if (typeof error.response === 'undefined') {
          setError(
            'A server/network error occurred. ' + 'Sorry about this - try againg in a few minutes.',
          );
          setIsLoading(false);
        } else {
          if (error.status === 401) {
            setIsLoading(false);
            dispatch(setMessage('Unauthorized, please login againg'));
            router.push('/');
          } else {
            setError('Error getting your items.');
            setIsLoading(false);
          }
        }
      });
  };

  const fetchItems = () => {
    getItems();
  };

  useEffect(() => {
    if (itemMessage) {
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: itemMessage,
      });
      dispatch(setItemMessage(null));
    }
    fetchItems();
  }, []);

  const handlePressable = (id: string) => {
    let item = items.find((item: { id: string }) => item.id === id);
    dispatch(setItem(item));
    router.push('/(app)/(items)/itemDetails');
  };

  const filteredItems = [...items]
    .filter((item) => item.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <>
      <ThemedView style={commonStyles.container}>
        <View style={commonStyles.tabHeader}>
          <ThemedText type="subtitle">Items</ThemedText>
          <ThemedText type="subtitle">{business.name}</ThemedText>
        </View>
        <View style={{ paddingHorizontal: 10, marginBottom: 5 }}>
          <TextInput
            placeholder="Search by name"
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
        {error ? (
          <>
            <ThemedText>{error}</ThemedText>
            <TouchableOpacity
              style={[commonStyles.button, { backgroundColor: color }]}
              onPress={() => fetchItems()}
            >
              <ThemedText>Try againg</ThemedText>
            </TouchableOpacity>
          </>
        ) : isLoading ? (
          <ActivityIndicator style={commonStyles.containerCentered} color={color} size="large" />
        ) : (
          <>
            <FlatList
              data={filteredItems}
              renderItem={({ item }) => {
                return (
                  <TouchableOpacity onPress={() => handlePressable(item.id)}>
                    <ItemCard
                      id={item.id}
                      name={item.name}
                      amount={item.amount}
                      price={item.price}
                      description={item.description}
                      date={item.date}
                      image={item.image}
                    />
                  </TouchableOpacity>
                );
              }}
              ItemSeparatorComponent={() => <View style={{ height: 5 }} />}
              contentContainerStyle={
                filteredItems.length === 0
                  ? { flexGrow: 1, justifyContent: 'center', alignItems: 'center' }
                  : undefined
              }
              ListEmptyComponent={
                <View style={{ alignItems: 'center', justifyContent: 'center', padding: 16 }}>
                  <ThemedText type="subtitle" style={{ textAlign: 'center' }}>
                    {itemMessage
                      ? itemMessage.toString() + ', pull to refresh'
                      : 'No items found, create your first one'}
                  </ThemedText>
                </View>
              }
              ListHeaderComponent={<View style={{ margin: 5 }} />}
              ListFooterComponent={<View style={{ margin: 5 }} />}
              refreshControl={
                <RefreshControl
                  refreshing={isLoading}
                  onRefresh={() => getItems()}
                  colors={[color]} // Colores del indicador de carga
                  tintColor={color} // Color del indicador de carga en iOS
                />
              }
            />
            <TouchableOpacity
              style={[commonStyles.createButton, { backgroundColor: color }]}
              onPress={() => router.push('/(app)/(items)/itemCreate')}
            >
              <Ionicons name="add" size={36} color="#FFF" />
            </TouchableOpacity>
          </>
        )}
      </ThemedView>
    </>
  );
}
