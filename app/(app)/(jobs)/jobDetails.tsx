import {
  View,
  ActivityIndicator,
  RefreshControl,
  FlatList,
  TouchableOpacity,
  Vibration,
  Image,
  Modal,
} from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useRouter, useFocusEffect } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import SpentCard from '@/components/jobs/SpentCard';
import { useAppDispatch, RootState } from '@/app/(redux)/store';
import { darkMainColor, darkSecondColor, lightMainColor, lightSecondColor } from '@/settings';
import { setUsedItems } from '@/app/(redux)/itemSlice';
import { commonStylesDetails } from '@/constants/commonStylesDetails';
import { commonStyles } from '@/constants/commonStyles';
import { Ionicons } from '@expo/vector-icons';
import { ThemedSecondaryView } from '@/components/ThemedSecondaryView';
import { setClient } from '@/app/(redux)/clientSlice';
import { setJobMessage } from '@/app/(redux)/jobSlice';
import { commonStylesCards } from '@/constants/commonStylesCard';
import { formatDate } from '@/utils/formatDate';
import { useJobSpents, useJobActions } from '@/hooks/useJobs';

export default function JobDetail() {
  const { color, darkTheme } = useSelector((state: RootState) => state.settings);
  const { job, jobLoading } = useSelector((state: RootState) => state.job);
  const { clients } = useSelector((state: RootState) => state.client);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalVisibleFinish, setModalVisibleFinish] = useState(false);
  const [isBig, setIsBig] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();

  // Use job spents hook and actions
  const { spents, loading: isLoading, error, refresh: refreshSpents } = useJobSpents(job?.id || null);
  const { deleteJob: deleteJobAction, createUpdateJob } = useJobActions();

  // Auto-refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (job?.id) {
        refreshSpents();
      }
    }, [job?.id, refreshSpents])
  );

  // Update Redux store with spents (maintain compatibility)
  useEffect(() => {
    if (spents) {
      dispatch(setUsedItems(spents));
    }
  }, [spents, dispatch]);

  const deleteJob = async () => {
    if (!job?.id) return;

    const formData = new FormData();
    formData.append('action', 'delete');
    formData.append('job_id', job.id.toString());
    
    const success = await createUpdateJob(formData);
    if (success) {
      dispatch(setJobMessage('Job deleted successfully'));
      router.replace('/(app)/(jobs)');
    }
  };

  const closeJob = async () => {
    if (!job?.id) return;
    
    const formData = new FormData();
    formData.append('action', 'close');
    formData.append('job_id', job.id.toString());
    
    const updatedJob = await createUpdateJob(formData);
    
    if (updatedJob) {
      setModalVisibleFinish(false);
      dispatch(setJobMessage('Job closed successfully'));
      router.replace('/(app)/(jobs)');
    } else {
      setModalVisibleFinish(false);
    }
  };

  const handleDelete = () => {
    setModalVisible(true);
  };

  const handleClose = () => {
    setModalVisibleFinish(true);
  };

  const handleInvoice = () => {
    let pickedClient = clients.find(
      (pickedClient: { id: any }) => pickedClient.id === job.client_id,
    );
    dispatch(setClient(pickedClient));
    router.navigate('/(app)/(jobs)/invoice');
  };

  const toggleImageSize = () => {
    setIsBig((prev) => !prev);
  };

  return (
    <>
      <ThemedView style={commonStyles.tabHeader}>
        <TouchableOpacity
          onPress={() => {
            router.replace('/(app)/(jobs)');
          }}
        >
          <Ionicons name="arrow-back" size={24} color={darkTheme ? '#fff' : '#000'} />
        </TouchableOpacity>
        <ThemedText type="subtitle">Job Details</ThemedText>
        <ThemedText type="subtitle"></ThemedText>
      </ThemedView>
      <ThemedView
        style={[
          commonStylesDetails.container,
          { backgroundColor: darkTheme ? darkMainColor : lightMainColor },
        ]}
      >
        <ThemedSecondaryView
          style={{
            borderRadius: 15,
            padding: 14,
            margin: 10,
            marginTop: 0,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.12,
            shadowRadius: 8,
            elevation: 6,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <ThemedText type="subtitle" style={{ fontWeight: 'bold', flex: 1 }}>
                  {job.description}
                </ThemedText>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <Ionicons name="person" size={16} color={color} style={{ marginRight: 4 }} />
                <ThemedText style={{ marginRight: 12 }}>{job.client}</ThemedText>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <Ionicons name="pricetag" size={16} color={color} style={{ marginRight: 4 }} />
                <ThemedText style={{ fontWeight: 'bold' }}>${job.price}</ThemedText>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <Ionicons name="calendar" size={16} color={color} style={{ marginRight: 4 }} />
                <ThemedText>{formatDate(job.created_at)}</ThemedText>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <Ionicons name="location" size={16} color={color} style={{ marginRight: 4 }} />
                <ThemedText style={{ flex: 1 }}>{job.address ?? 'No address provided'}</ThemedText>
              </View>
            </View>
            <View style={{ alignItems: 'flex-end', justifyContent: 'flex-start', minWidth: 60 }}>
              <View
                style={{
                  backgroundColor: job.status === 'completed' ? '#4caf50' : color + '33',
                  paddingHorizontal: 12,
                  paddingVertical: 2,
                  borderRadius: 10,
                  marginBottom: 8,
                }}
              >
                <ThemedText
                  style={{
                    color: job.status === 'completed' ? '#fff' : color,
                    fontWeight: 'bold',
                    fontSize: 13,
                  }}
                >
                  {job.status === 'in_progress' ? 'in progress' : job.status}
                </ThemedText>
              </View>
              {job.image ? (
                <TouchableOpacity onPress={toggleImageSize} style={{ marginTop: 10 }}>
                  <Image
                    source={{ uri: job.image }}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 8,
                      backgroundColor: '#eee',
                    }}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ) : null}
              {job.status !== 'completed' ? (
                <TouchableOpacity
                  onPress={() => handleClose()}
                  style={[commonStyles.button, { marginTop: 30, padding: 0, borderColor: color }]}
                >
                  <ThemedText>Close Job</ThemedText>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        </ThemedSecondaryView>
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
            onPress={() => router.navigate('/(app)/(jobs)/jobUpdate')}
          >
            <Ionicons name="create-outline" size={28} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              commonStyles.button,
              {
                borderColor: color,
                margin: 0,
                backgroundColor: darkTheme ? darkSecondColor : lightSecondColor,
              },
            ]}
            onPress={() => handleInvoice()}
          >
            <ThemedText>Invoice</ThemedText>
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
        <ThemedText type="subtitle" style={{ marginTop: 15, alignSelf: 'center' }}>
          Spents
        </ThemedText>
        {isLoading ? (
          <ActivityIndicator style={commonStylesDetails.loading} size="large" />
        ) : (
          <FlatList
            data={spents}
            renderItem={({ item }) => {
              return (
                <SpentCard
                  id={item.id}
                  description={item.description}
                  amount={item.amount}
                  image={item.image}
                  date={item.date}
                />
              );
            }}
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
                  No spents found, create a new one
                </ThemedText>
              </View>
            }
            ListHeaderComponent={<View style={{ margin: 5 }} />}
            ListFooterComponent={<View style={{ margin: 5 }} />}
            refreshControl={
              <RefreshControl
                refreshing={isLoading}
                onRefresh={() => refreshSpents()}
                colors={[color]} // Colores del indicador de carga
                tintColor={color} // Color del indicador de carga en iOS
              />
            }
          />
        )}
      </ThemedView>
      {job.status !== 'completed' ? (
        <TouchableOpacity
          style={[
            commonStyles.button,
            {
              position: 'absolute',
              bottom: 20,
              right: 20,
              borderColor: color,
              backgroundColor: darkTheme ? darkSecondColor : lightSecondColor,
            },
          ]}
          onPress={() => router.push('/(app)/(jobs)/spentCreate')}
        >
          <ThemedText>Create Spent</ThemedText>
        </TouchableOpacity>
      ) : null}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={commonStylesCards.centeredView}>
          {jobLoading ? (
            <ActivityIndicator style={commonStylesCards.loading} size="large" />
          ) : (
            <ThemedSecondaryView style={[commonStylesCards.card, { padding: 10 }]}>
              <ThemedText style={[commonStylesCards.name, { padding: 10 }]}>
                Do you want to delete this job?
              </ThemedText>
              <View
                style={[
                  commonStylesCards.dataContainer,
                  { padding: 10, justifyContent: 'space-evenly' },
                ]}
              >
                <TouchableOpacity
                  style={[
                    commonStylesCards.button,
                    {
                      borderColor: color,
                      backgroundColor: darkTheme ? darkMainColor : lightMainColor,
                    },
                  ]}
                  onPress={() => setModalVisible(!modalVisible)}
                >
                  <ThemedText>Cancel</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    commonStylesCards.button,
                    {
                      borderColor: 'red',
                      backgroundColor: darkTheme ? darkMainColor : lightMainColor,
                    },
                  ]}
                  onPress={() => deleteJob()}
                >
                  <ThemedText style={{ color: 'red', textAlign: 'center' }}>DELETE</ThemedText>
                </TouchableOpacity>
              </View>
            </ThemedSecondaryView>
          )}
        </View>
      </Modal>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisibleFinish}
        onRequestClose={() => {
          setModalVisibleFinish(!modalVisibleFinish);
        }}
      >
        <View style={commonStylesCards.centeredView}>
          {jobLoading ? (
            <ActivityIndicator style={commonStylesCards.loading} size="large" />
          ) : (
            <ThemedSecondaryView style={[commonStylesCards.card, { padding: 10 }]}>
              <ThemedText style={[commonStylesCards.name, { padding: 10 }]}>
                Did you finish this job?
              </ThemedText>
              <View
                style={[
                  commonStylesCards.dataContainer,
                  { padding: 5, justifyContent: 'space-evenly' },
                ]}
              >
                <TouchableOpacity
                  style={[
                    commonStylesCards.button,
                    {
                      borderColor: color,
                      backgroundColor: darkTheme ? darkMainColor : lightMainColor,
                      marginHorizontal: 5,
                    },
                  ]}
                  onPress={() => setModalVisibleFinish(!modalVisibleFinish)}
                >
                  <ThemedText style={{ textAlign: 'center' }}>No</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    commonStylesCards.button,
                    {
                      borderColor: 'red',
                      backgroundColor: darkTheme ? darkMainColor : lightMainColor,
                      marginHorizontal: 5,
                    },
                  ]}
                  onPress={() => closeJob()}
                >
                  <ThemedText style={{ color: 'red', textAlign: 'center' }}>
                    Yes, close it
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </ThemedSecondaryView>
          )}
        </View>
      </Modal>
      <Modal transparent={true} animationType="fade" visible={isBig}>
        <View style={commonStylesCards.modalContainer}>
          <TouchableOpacity onPress={toggleImageSize} style={commonStylesCards.expandedImage}>
            <Image source={{ uri: job.image }} style={commonStylesCards.expandedImage} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[commonStylesCards.button, { marginHorizontal: 5, flex: 1 }]}
            onPress={() => setIsBig(!isBig)}
          >
            <ThemedText type="subtitle">Close</ThemedText>
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
}
