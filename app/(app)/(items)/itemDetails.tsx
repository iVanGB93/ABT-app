import {
  View,
  ActivityIndicator,
  SectionList,
  TouchableOpacity,
  RefreshControl,
  Image,
  Modal,
} from 'react-native';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

import JobCard from '@/components/jobs/JobCard';
import { RootState, useAppDispatch } from '@/app/(redux)/store';
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
import { useItemDetails } from '@/hooks';

export default function ItemDetail() {
  const { color, darkTheme, business } = useSelector((state: RootState) => state.settings);
  const { item, usedItems, itemLoading } = useSelector((state: RootState) => state.item);
  const [modalVisible, setModalVisible] = useState(false);
  const [isBig, setIsBig] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { usedItems: hookUsedItems, loading, error, refresh, deleteItem: deleteItemAction } = useItemDetails(item?.id);

  useEffect(() => {
    if (item?.id) {
      refresh();
    }
  }, [item?.id, refresh]);

  const handlePressable = (id: string) => {
    let job = usedItems.find((job: { id: string }) => job.id === id);
    dispatch(setJob(job));
    router.push('/(app)/(jobs)/jobDetails');
  };

  const handleDeleteItem = async () => {
    if (!item?.id) return;
    
    setModalVisible(false);
    try {
      const success = await deleteItemAction(item.id);
      if (success) {
        dispatch(setItemMessage('Elemento eliminado con éxito'));
        router.push('/(app)/(items)');
      }
    } catch (error: any) {
      console.error('Error deleting item:', error);
      dispatch(setItemMessage('Error al eliminar el elemento'));
    }
  };

  const handleDelete = () => {
    setModalVisible(true);
  };

  const toggleImageSize = () => {
    setIsBig((prev) => !prev);
  };

  // --- Grouping logic ---
  const groupedUsedItems = (() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const buckets: Record<string, { order: number; items: any[] }> = {};

    const getKey = (dateStr: string) => {
      const d = new Date(dateStr);
      const jobDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const diffMs = today.getTime() - jobDay.getTime();
      const diffDays = Math.round(diffMs / 86400000);

      if (diffDays === 0) return { label: 'Today', order: 0 };
      if (diffDays === 1) return { label: 'Yesterday', order: 1 };
      if (diffDays < 7) return { label: dayNames[d.getDay()], order: diffDays };
      if (d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth())
        return { label: 'This Month', order: 7 };
      return {
        label: d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        order: 8 + (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth()),
      };
    };

    [...usedItems]
      .sort((a, b) => new Date(b.date || b.updated_at).getTime() - new Date(a.date || a.updated_at).getTime())
      .forEach((job) => {
        const { label, order } = getKey(job.date || job.updated_at);
        if (!buckets[label]) buckets[label] = { order, items: [] };
        buckets[label].items.push(job);
      });

    return Object.entries(buckets)
      .sort(([, a], [, b]) => a.order - b.order)
      .map(([title, { items }]) => ({ title, data: items }));
  })();

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
          <ThemedText type="subtitle">Used in {usedItems.length} jobs</ThemedText>
          {loading ? (
            <ActivityIndicator style={commonStyles.loading} size="large" />
          ) : (
            <View style={commonStylesDetails.list}>
              <SectionList
                sections={groupedUsedItems}
                keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                renderSectionHeader={({ section: { title, data } }) => (
                  <View
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 5,
                      marginTop: 8,
                      marginBottom: 2,
                      borderLeftWidth: 3,
                      borderLeftColor: color,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <ThemedText style={{ fontWeight: '700', fontSize: 13, opacity: 0.75, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                      {title}
                    </ThemedText>
                    <View style={{
                      backgroundColor: color,
                      borderRadius: 10,
                      minWidth: 20,
                      height: 20,
                      paddingHorizontal: 6,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                      <ThemedText style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>
                        {data.length}
                      </ThemedText>
                    </View>
                  </View>
                )}
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
                      date={item.updated_at}
                      inDetail={true}
                    />
                  </TouchableOpacity>
                )}
                ItemSeparatorComponent={() => <View style={{ height: 5 }} />}
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
                    refreshing={loading}
                    onRefresh={() => refresh()}
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
            {loading ? (
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
                    onPress={() => handleDeleteItem()}
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
