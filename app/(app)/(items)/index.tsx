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
import { setItem, setItemMessage } from '@/app/(redux)/itemSlice';
import ItemCard from '@/components/items/ItemCard';
import { commonStyles } from '@/constants/commonStyles';
import { useItems } from '@/hooks';

export default function Items() {
  const { color, darkTheme, business } = useSelector((state: RootState) => state.settings);
  const { itemMessage, itemLoading, itemError } = useSelector((state: RootState) => state.item);
  const [search, setSearch] = useState('');
  const dispatch = useAppDispatch();
  const router = useRouter();

  const {
    items,
    refresh: refreshItems,
  } = useItems(search);

  useEffect(() => {
    if (itemMessage) {
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: itemMessage,
      });
      dispatch(setItemMessage(null));
    }
  }, [itemMessage, dispatch]);

  const handlePressable = (id: string) => {
    let item = items.find((item: any) => item.id === parseInt(id));
    dispatch(setItem(item));
    router.navigate('/(app)/(items)/itemDetails');
  };

  const handleRefresh = () => {
    refreshItems();
  };

  return (
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
      {itemError ? (
        <>
          <ThemedText>{itemError}</ThemedText>
          <TouchableOpacity
            style={[commonStyles.button, { backgroundColor: color }]}
            onPress={() => handleRefresh()}
          >
            <ThemedText>Try again</ThemedText>
          </TouchableOpacity>
        </>
      ) : itemLoading ? (
        <ActivityIndicator style={commonStyles.containerCentered} color={color} size="large" />
      ) : (
        <>
          <FlatList
            data={items}
            renderItem={({ item }) => {
              return (
                <TouchableOpacity onPress={() => handlePressable(item.id.toString())}>
                  <ItemCard
                    id={item.id}
                    name={item.name}
                    amount={item.amount || item.stock_quantity || 0}
                    price={item.price}
                    description={item.description}
                    date={item.date || item.created_at}
                    image={item.image || ''}
                  />
                </TouchableOpacity>
              );
            }}
            ItemSeparatorComponent={() => <View style={{ height: 5 }} />}
            contentContainerStyle={
              items.length === 0
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
                refreshing={itemLoading}
                onRefresh={() => handleRefresh()}
                colors={[color]} // Colores del indicador de carga
                tintColor={color} // Color del indicador de carga en iOS
              />
            }
          />
          <TouchableOpacity
            style={[commonStyles.createButton, { backgroundColor: color }]}
            onPress={() => router.navigate('/(app)/(items)/itemCreate')}
          >
            <Ionicons name="add" size={36} color="#FFF" />
          </TouchableOpacity>
        </>
      )}
    </ThemedView>
  );
}
