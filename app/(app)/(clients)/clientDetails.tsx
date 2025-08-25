import {
  View,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Image,
  Linking,
  Modal,
} from 'react-native';
import { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import JobCard from '@/components/jobs/JobCard';
import { RootState, useAppDispatch } from '@/app/(redux)/store';
import { setJob } from '@/app/(redux)/jobSlice';
import { darkMainColor, darkSecondColor, lightMainColor, lightSecondColor } from '@/settings';
import { commonStyles } from '@/constants/commonStyles';
import { clientFail, clientSetMessage } from '@/app/(redux)/clientSlice';
import { commonStylesDetails } from '@/constants/commonStylesDetails';
import { Ionicons } from '@expo/vector-icons';
import { ThemedSecondaryView } from '@/components/ThemedSecondaryView';
import { commonStylesCards } from '@/constants/commonStylesCard';
import { useClientActions } from '@/hooks';
import { useJobs } from '@/hooks';

export default function ClientDetail() {
  const { color, darkTheme, business } = useSelector((state: RootState) => state.settings);
  const { clientMessage, client, clientLoading, clientError } = useSelector(
    (state: RootState) => state.client,
  );
  const { jobLoading, jobError } = useSelector((state: RootState) => state.job);
  const [modalVisible, setModalVisible] = useState(false);
  const [isBig, setIsBig] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { jobs, refresh } = useJobs();
  const { deleteClient: deleteClientAction } = useClientActions();

  // Filtrar trabajos del cliente específico
  const clientJobs = useMemo(() => {
    if (!client?.id || !jobs || jobs.length === 0) {
      return [];
    }
    return jobs.filter((job: any) => job.client_id === client.id);
  }, [jobs, client?.id]);

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

  const handlePressable = (id: number) => {
    let job = clientJobs.find((job) => job.id === id);
    dispatch(setJob(job));
    router.navigate('/(app)/(jobs)/jobDetails');
  };

  const handleDeleteClient = async () => {
    if (!client?.id) return;

    setModalVisible(false);
    try {
      const success = await deleteClientAction(client.id);
      if (success) {
        dispatch(clientSetMessage('Client deleted successfully'));
        router.push('/(app)/(clients)');
      }
    } catch (error: any) {
      console.error('Error deleting client:', error);
      dispatch(clientSetMessage('Error deleting client'));
    }
  };

  const handleDelete = () => {
    setModalVisible(true);
  };

  const toggleImageSize = () => {
    setIsBig((prev) => !prev);
  };

  const handleCreateJob = () => {
    router.navigate({
      pathname: '/(app)/(jobs)/jobCreate',
      params: {
        clientId: String(client.id),
        clientName: `${client.name} ${client.last_name}`,
      },
    });
  };

  return (
    <>
      <ThemedView style={commonStyles.tabHeader}>
        <TouchableOpacity
          onPress={() => {
            router.replace('/(app)/(clients)');
          }}
        >
          <Ionicons name="arrow-back" size={24} color={darkTheme ? '#fff' : '#000'} />
        </TouchableOpacity>
        <ThemedText type="subtitle">Client Details</ThemedText>
        <ThemedText type="subtitle"></ThemedText>
      </ThemedView>
      {clientLoading ? (
        <ActivityIndicator style={commonStyles.loading} color={color} size="large" />
      ) : (
        <ThemedView
          style={[
            commonStylesDetails.container,
            { backgroundColor: darkTheme ? darkMainColor : lightMainColor },
          ]}
        >
          <ThemedSecondaryView
            style={{
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
            }}
          >
            <TouchableOpacity onPress={toggleImageSize}>
              <Image
                source={{ uri: client.image }}
                style={{
                  width: 90,
                  height: 90,
                  borderRadius: 45,
                  marginBottom: 12,
                  borderWidth: 3,
                  borderColor: color,
                }}
              />
            </TouchableOpacity>
            <ThemedText type="title" style={{ marginBottom: 2 }}>
              {client.name} {client.last_name}
            </ThemedText>
            <TouchableOpacity onPress={() => Linking.openURL(`mailto:${client.email}`)}>
              <ThemedText type="default" style={{ color: color, marginBottom: 8 }}>
                {client.email ? client.email : 'No email saved'}
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}
              onPress={() => Linking.openURL(`tel:${client.phone}`)}
            >
              <Ionicons name="call" size={18} color={color} style={{ marginRight: 6 }} />
              <ThemedText>{client.phone ? client.phone : 'No phone saved'}</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => Linking.openURL(`https://www.google.com/maps?q=${client.address}`)}
              style={{ flexDirection: 'row', alignItems: 'center' }}
            >
              <Ionicons name="location" size={18} color={color} style={{ marginRight: 6 }} />
              <ThemedText>{client.address ? client.address : 'No address saved'}</ThemedText>
            </TouchableOpacity>
            {client.address2 && client.address2 !== 'no extra address saved' ? (
              <ThemedText>{client.address2}</ThemedText>
            ) : null}
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
              onPress={() => router.navigate('/(app)/(clients)/clientUpdate')}
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
            <ThemedText type="subtitle">Jobs</ThemedText>
            {jobLoading ? (
              <ActivityIndicator
                style={commonStyles.containerCentered}
                color={color}
                size="large"
              />
            ) : (
              <View style={commonStylesDetails.list}>
                <FlatList
                  data={clientJobs}
                  renderItem={({ item }) => {
                    return (
                      <TouchableOpacity onPress={() => handlePressable(item.id)}>
                        <JobCard
                          id={item.id}
                          status={item.status}
                          client={item.client_name_lastName || 'Unknown Client'}
                          address={item.address}
                          description={item.description}
                          price={item.price}
                          inDetail={false}
                          image={item.image}
                          date={item.created_at}
                          isList={false}
                        />
                      </TouchableOpacity>
                    );
                  }}
                  ItemSeparatorComponent={() => <View style={{ height: 5 }} />}
                  ListEmptyComponent={
                    <View>
                      <ThemedText style={[commonStylesDetails.headerText, { marginTop: 50 }]}>
                        No jobs for {client.name}, create your first one
                      </ThemedText>
                    </View>
                  }
                  ListHeaderComponent={<View style={{ margin: 5 }} />}
                  ListFooterComponent={<View style={{ margin: 5 }} />}
                  refreshControl={
                    <RefreshControl
                      refreshing={jobLoading}
                      onRefresh={() => refresh()}
                      colors={[color]}
                      tintColor={color}
                    />
                  }
                />
              </View>
            )}
            {/*  {errorJobs ? (
                    <Text style={styles.errorText}>{errorJobs}</Text>
                ) : null} */}
          </View>
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
            onPress={() => handleCreateJob()}
          >
            <ThemedText>Create Job</ThemedText>
          </TouchableOpacity>
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(!modalVisible)}
          >
            <View style={commonStylesCards.centeredView}>
              {clientLoading ? (
                <ActivityIndicator color={color} size="large" />
              ) : (
                <ThemedSecondaryView style={[commonStylesCards.card, { padding: 10 }]}>
                  <ThemedText style={[commonStylesCards.name, { padding: 10 }]}>
                    Do you want to delete {client.name}?
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
                      <ThemedText style={{ color: color }}>Cancel</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[commonStylesCards.button, { borderColor: 'red' }]}
                      onPress={() => handleDeleteClient()}
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
                <Image source={{ uri: client.image }} style={commonStylesCards.expandedImage} />
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
      )}
    </>
  );
}
