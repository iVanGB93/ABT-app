import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  RefreshControl,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Animated,
  Modal,
  Vibration,
} from 'react-native';
import { useSelector } from 'react-redux';
import { useRouter, useFocusEffect } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import Toast from 'react-native-toast-message';
import * as Contacts from 'expo-contacts';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { RootState, useAppDispatch } from '@/app/(redux)/store';
import { clientFail, clientSetMessage, setClient } from '@/app/(redux)/clientSlice';
import ClientCard from '@/components/clients/ClientCard';
import { commonStyles } from '@/constants/commonStyles';
import { useClients } from '@/hooks';

export default function Clients() {
  const { color, business, darkTheme } = useSelector((state: RootState) => state.settings);
  const { clientMessage, clientLoading, clientError } = useSelector((state: RootState) => state.client);
  const [search, setSearch] = useState('');
  const dispatch = useAppDispatch();
  const router = useRouter();

  // FAB speed dial
  const [fabOpen, setFabOpen] = useState(false);
  const fabAnimation = useRef(new Animated.Value(0)).current;

  const toggleFab = () => {
    const toValue = fabOpen ? 0 : 1;
    Animated.spring(fabAnimation, {
      toValue,
      useNativeDriver: true,
      friction: 6,
      tension: 80,
    }).start();
    setFabOpen(!fabOpen);
  };

  const closeFab = () => {
    Animated.spring(fabAnimation, {
      toValue: 0,
      useNativeDriver: true,
      friction: 6,
    }).start();
    setFabOpen(false);
  };

  const fabRotation = fabAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  const miniFabOpacity = fabAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });

  const newClientTranslateY = fabAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -160],
  });

  const importContactsTranslateY = fabAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -85],
  });

  // Contacts picker
  const [contactsModalVisible, setContactsModalVisible] = useState(false);
  const [allContacts, setAllContacts] = useState<Contacts.ExistingContact[]>([]);
  const [contactSearch, setContactSearch] = useState('');

  const filteredContacts = allContacts.filter((c) => {
    const fullName = `${c.firstName || ''} ${c.lastName || ''}`.toLowerCase();
    return fullName.includes(contactSearch.toLowerCase());
  });

  const handleImportFromContacts = async () => {
    closeFab();
    const { status } = await Contacts.requestPermissionsAsync();
    if (status !== 'granted') {
      Toast.show({ type: 'error', text1: 'Permission denied', text2: 'Contacts access is required' });
      return;
    }
    const { data } = await Contacts.getContactsAsync({
      fields: [Contacts.Fields.FirstName, Contacts.Fields.LastName, Contacts.Fields.PhoneNumbers, Contacts.Fields.Emails],
    });
    setAllContacts(data.filter((c) => c.firstName || c.lastName));
    setContactSearch('');
    setContactsModalVisible(true);
  };

  const handleSelectContact = (contact: Contacts.ExistingContact) => {
    setContactsModalVisible(false);
    router.navigate({
      pathname: '/(app)/(clients)/clientCreate',
      params: {
        prefillName: contact.firstName || '',
        prefillLastName: contact.lastName || '',
        prefillPhone: contact.phoneNumbers?.[0]?.number || '',
        prefillEmail: contact.emails?.[0]?.email || '',
      },
    });
  };

  const { clients, refresh: refreshClients } = useClients(search);

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

  useEffect(() => {
    if (clientError) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: clientError,
      });
    dispatch(clientFail(null));
    }
  }, [clientError]);
  
  useFocusEffect(
    React.useCallback(() => {
      refreshClients();
    }, [refreshClients]),
  );

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
      {clientLoading ? (
        <ActivityIndicator style={commonStyles.containerCentered} color={color} size="large" />
      ) : clientError ? (
        <View style={commonStyles.containerCentered}>
          <ThemedText>{clientError}</ThemedText>
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
                  <ClientCard name={item.name} last_name={item.last_name} image={item.image} />
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
                refreshing={clientLoading || false}
                onRefresh={() => handleRefresh()}
                colors={[color]} // Colores del indicador de carga
                tintColor={color} // Color del indicador de carga en iOS
              />
            }
          />
          {/* FAB backdrop */}
          {fabOpen && (
            <TouchableOpacity
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.35)' }}
              activeOpacity={1}
              onPress={closeFab}
            />
          )}

          {/* Mini FAB: New Client */}
          <Animated.View
            style={{
              position: 'absolute',
              bottom: 30,
              right: 30,
              alignItems: 'center',
              opacity: miniFabOpacity,
              transform: [{ translateY: newClientTranslateY }],
            }}
            pointerEvents={fabOpen ? 'auto' : 'none'}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={{
                backgroundColor: darkTheme ? '#333' : '#fff',
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 20,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.3,
                shadowRadius: 2,
                elevation: 4,
              }}>
                <ThemedText style={{ fontSize: 13, fontWeight: '600' }}>New Client</ThemedText>
              </View>
              <TouchableOpacity
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: color,
                  justifyContent: 'center',
                  alignItems: 'center',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.4,
                  shadowRadius: 3,
                  elevation: 6,
                }}
                onPress={() => { closeFab(); router.navigate('/(app)/(clients)/clientCreate'); }}
              >
                <Ionicons name="person-add" size={22} color="#FFF" />
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Mini FAB: Import from Contacts */}
          <Animated.View
            style={{
              position: 'absolute',
              bottom: 30,
              right: 30,
              alignItems: 'center',
              opacity: miniFabOpacity,
              transform: [{ translateY: importContactsTranslateY }],
            }}
            pointerEvents={fabOpen ? 'auto' : 'none'}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={{
                backgroundColor: darkTheme ? '#333' : '#fff',
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 20,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.3,
                shadowRadius: 2,
                elevation: 4,
              }}>
                <ThemedText style={{ fontSize: 13, fontWeight: '600' }}>Import from Contacts</ThemedText>
              </View>
              <TouchableOpacity
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: color,
                  justifyContent: 'center',
                  alignItems: 'center',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.4,
                  shadowRadius: 3,
                  elevation: 6,
                }}
                onPress={handleImportFromContacts}
              >
                <Ionicons name="people" size={22} color="#FFF" />
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Main FAB */}
          <TouchableOpacity
            style={[commonStyles.createButton, { backgroundColor: color }]}
            onPress={toggleFab}
          >
            <Animated.View style={{ transform: [{ rotate: fabRotation }] }}>
              <Ionicons name="add" size={36} color="#FFF" />
            </Animated.View>
          </TouchableOpacity>

          {/* Contacts Picker Modal */}
          <Modal
            visible={contactsModalVisible}
            animationType="slide"
            onRequestClose={() => setContactsModalVisible(false)}
          >
            <View style={{ flex: 1, backgroundColor: darkTheme ? '#111' : '#f5f5f5' }}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 16,
                paddingTop: 50,
                backgroundColor: darkTheme ? '#1a1a1a' : '#fff',
                borderBottomWidth: 1,
                borderBottomColor: darkTheme ? '#333' : '#ddd',
              }}>
                <TouchableOpacity onPress={() => setContactsModalVisible(false)} style={{ marginRight: 12 }}>
                  <Ionicons name="close" size={26} color={color} />
                </TouchableOpacity>
                <ThemedText type="subtitle" style={{ flex: 1 }}>Select a Contact</ThemedText>
              </View>
              <View style={{ padding: 12 }}>
                <TextInput
                  placeholder="Search contacts..."
                  placeholderTextColor="#888"
                  value={contactSearch}
                  onChangeText={setContactSearch}
                  style={{
                    backgroundColor: darkTheme ? '#222' : '#fff',
                    color: darkTheme ? '#fff' : '#000',
                    borderRadius: 10,
                    padding: 10,
                    borderWidth: 1,
                    borderColor: darkTheme ? '#444' : '#ccc',
                  }}
                />
              </View>
              <FlatList
                data={filteredContacts}
                keyExtractor={(item) => item.id ?? Math.random().toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => handleSelectContact(item)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      borderBottomWidth: 1,
                      borderBottomColor: darkTheme ? '#222' : '#eee',
                    }}
                  >
                    <View style={{
                      width: 42,
                      height: 42,
                      borderRadius: 21,
                      backgroundColor: color,
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: 14,
                    }}>
                      <ThemedText style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
                        {(item.firstName?.[0] || item.lastName?.[0] || '?').toUpperCase()}
                      </ThemedText>
                    </View>
                    <View>
                      <ThemedText style={{ fontWeight: '600', fontSize: 15 }}>
                        {`${item.firstName || ''} ${item.lastName || ''}`.trim()}
                      </ThemedText>
                      {item.phoneNumbers?.[0]?.number && (
                        <ThemedText style={{ fontSize: 13, color: '#888' }}>
                          {item.phoneNumbers[0].number}
                        </ThemedText>
                      )}
                    </View>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <View style={{ alignItems: 'center', padding: 32 }}>
                    <ThemedText>No contacts found</ThemedText>
                  </View>
                }
              />
            </View>
          </Modal>
        </>
      )}
    </ThemedView>
  );
}
