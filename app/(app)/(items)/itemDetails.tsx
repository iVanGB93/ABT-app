import {
  View,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Image,
  Modal,
} from 'react-native';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

import JobCard from '@/components/jobs/JobCard';
import { RootState, useAppDispatch } from '@/app/(redux)/store';
import axiosInstance from '@/axios';
import { setItemMessage, setUsedItems } from '@/app/(redux)/itemSlice';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { darkMainColor, darkSecondColor, lightMainColor, lightSecondColor } from '@/settings';
import { ThemedText } from '@/components/ThemedText';
import { setJob } from '@/app/(redux)/jobSlice';
import { commonStylesDetails } from '@/constants/commonStylesDetails';
import { commonStyles } from '@/constants/commonStyles';
import { Ionicons } from '@expo/vector-icons';
import { commonStylesCards } from '@/constants/commonStylesCard';
import { ThemedSecondaryView } from '@/components/ThemedSecondaryView';
import { formatDate } from '@/utils/formatDate';

export default function ItemDetail() {
  const { color, darkTheme, business } = useSelector((state: RootState) => state.settings);
  const { item, usedItems, itemMessage } = useSelector((state: RootState) => state.item);
  const [isLoading, setIsLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [isBig, setIsBig] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const fetchUsedItems = async () => {
    await axiosInstance
      .get(`items/used/${item.id}/`)
      .then(function (response) {
        const uniqueItems = response.data.filter(
          (item: { id: any }, index: any, self: any[]) =>
            index === self.findIndex((t) => t.id === item.id),
        );
        dispatch(setUsedItems(uniqueItems));
        setIsLoading(false);
      })
      .catch(function (error) {
        console.error('Error fetching items:', error.message);
        dispatch(setUsedItems([]));
        setIsLoading(false);
        /* dispatch({
                type: CHANGE_ERROR,
                payload: error.message
            }) */
      });
  };

  useEffect(() => {
    fetchUsedItems();
  }, []);

  const handlePressable = (id: string) => {
    let job = usedItems.find((job: { id: string }) => job.id === id);
    dispatch(setJob(job));
    router.push('/(app)/(jobs)/jobDetails');
  };

  const deleteItem = async () => {
    setIsLoading(true);
    await axiosInstance
      .post(
        `items/delete/${business.name}/`,
        { action: 'delete', id: item.id },
        {
          headers: {
            'content-Type': 'multipart/form-data',
          },
        },
      )
      .then(function (response) {
        if (response.data.OK) {
          dispatch(setItemMessage(response.data.message));
          setIsLoading(false);
          router.push('/(app)/(items)');
        }
      })
      .catch(function (error) {
        console.error('Error deleting a client:', error);
        setIsLoading(false);
      });
  };

  const handleDelete = () => {
    setModalVisible(true);
  };

  const toggleImageSize = () => {
    setIsBig((prev) => !prev);
  };

  return (
    <>
      <ThemedView style={commonStyles.tabHeader}>
        <TouchableOpacity
          onPress={() => {
            router.replace('/(app)/(items)');
          }}
        >
          <Ionicons name="arrow-back" size={24} color={darkTheme ? '#fff' : '#000'} />
        </TouchableOpacity>
        <ThemedText type="subtitle">Item Details</ThemedText>
        <ThemedText type="subtitle"></ThemedText>
      </ThemedView>
      <ThemedView
        style={[
          commonStylesDetails.container,
          { backgroundColor: darkTheme ? darkMainColor : lightMainColor },
        ]}
      >
        <View
          style={{
            backgroundColor: darkTheme ? '#23272e' : '#fff',
            borderRadius: 15,
            padding: 10,
            margin: 10,
            marginTop: 0,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.12,
            shadowRadius: 8,
            elevation: 6,
            flexDirection: 'row',
            gap: 18,
          }}
        >
          <TouchableOpacity onPress={toggleImageSize}>
            <Image
              source={{ uri: item.image }}
              style={{
                width: 80,
                height: 80,
                borderRadius: 10,
                backgroundColor: '#eee',
                marginRight: 10,
                alignSelf: 'flex-start',
              }}
              resizeMode="cover"
            />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <ThemedText type="subtitle" style={{ marginBottom: 2 }}>
              {item.name}
            </ThemedText>
            <ThemedText style={{ marginBottom: 6 }}>{item.description}</ThemedText>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <Ionicons name="pricetag" size={16} color={color} style={{ marginRight: 4 }} />
              <ThemedText style={{ fontWeight: 'bold', marginRight: 12 }}>${item.price}</ThemedText>
              <Ionicons name="cube" size={16} color={color} style={{ marginRight: 4 }} />
              <ThemedText style={{ fontWeight: 'bold' }}>{item.amount} units</ThemedText>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="calendar" size={16} color={color} style={{ marginRight: 4 }} />
              <ThemedText>{formatDate(item.date)}</ThemedText>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
          <TouchableOpacity
            style={[
              commonStyles.button,
              {
                borderColor: color,
                margin: 0,
                backgroundColor: darkTheme ? darkSecondColor : lightSecondColor,
              },
            ]}
            onPress={() => router.navigate('/(app)/(items)/itemUpdate')}
          >
            <Ionicons name="create-outline" size={28} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              commonStyles.button,
              {
                margin: 0,
                borderColor: 'red',
                backgroundColor: darkTheme ? darkSecondColor : lightSecondColor,
              },
            ]}
            onPress={() => handleDelete()}
          >
            <Ionicons name="trash-outline" size={28} color="red" />
          </TouchableOpacity>
        </View>

        <View style={commonStylesDetails.bottom}>
          <ThemedText type="subtitle">Used in</ThemedText>
          {isLoading ? (
            <ActivityIndicator style={commonStyles.loading} size="large" />
          ) : (
            <View style={commonStylesDetails.list}>
              <FlatList
                data={usedItems}
                renderItem={({ item }) => (
                  <TouchableOpacity onPress={() => handlePressable(item.id)}>
                    <JobCard
                      isList={true}
                      id={item.id}
                      status={item.status}
                      image={item.image}
                      client={item.client}
                      address={item.address}
                      description={item.description}
                      price={item.price}
                      date={item.date}
                      inDetail={true}
                    />
                  </TouchableOpacity>
                )}
                ItemSeparatorComponent={() => (
                  <View
                    style={{
                      height: 16,
                    }}
                  />
                )}
                ListEmptyComponent={
                  <View>
                    <ThemedText style={[commonStylesDetails.headerText, { marginTop: 50 }]}>
                      No used yet, pull to refresh
                    </ThemedText>
                  </View>
                }
                ListHeaderComponent={<View style={{ margin: 5 }} />}
                ListFooterComponent={<TouchableOpacity style={{ margin: 5 }} />}
                refreshControl={
                  <RefreshControl
                    refreshing={isLoading}
                    onRefresh={() => fetchUsedItems()}
                    colors={[color]}
                    tintColor={color}
                  />
                }
              />
            </View>
          )}
        </View>
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(!modalVisible);
          }}
        >
          <View style={commonStylesCards.centeredView}>
            {isLoading ? (
              <ActivityIndicator style={commonStylesCards.loading} size="large" />
            ) : (
              <ThemedSecondaryView style={[commonStylesCards.card, { padding: 10 }]}>
                <ThemedText style={[commonStylesCards.name, { padding: 10 }]}>
                  Do you want to delete {item.name}?
                </ThemedText>
                <View
                  style={[
                    commonStylesCards.dataContainer,
                    { padding: 10, justifyContent: 'space-evenly' },
                  ]}
                >
                  <TouchableOpacity
                    style={[commonStylesCards.button, { borderColor: color }]}
                    onPress={() => setModalVisible(!modalVisible)}
                  >
                    <ThemedText>Cancel</ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[commonStylesCards.button, { borderColor: 'red' }]}
                    onPress={() => deleteItem()}
                  >
                    <ThemedText style={{ color: 'red', textAlign: 'center' }}>DELETE</ThemedText>
                  </TouchableOpacity>
                </View>
              </ThemedSecondaryView>
            )}
          </View>
        </Modal>
        <Modal transparent={true} animationType="fade" visible={isBig}>
          <View style={commonStylesCards.modalContainer}>
            <TouchableOpacity onPress={toggleImageSize} style={commonStylesCards.expandedImage}>
              <Image source={{ uri: item.image }} style={commonStylesCards.expandedImage} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[commonStylesCards.button, { marginHorizontal: 5, flex: 1 }]}
              onPress={() => setIsBig(!isBig)}
            >
              <ThemedText style={{ color: 'white', textAlign: 'center', fontSize: 20 }}>
                Close
              </ThemedText>
            </TouchableOpacity>
          </View>
        </Modal>
      </ThemedView>
    </>
  );
}
