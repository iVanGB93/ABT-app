import {
  View,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Vibration,
  Image,
  Linking,
  Modal,
} from 'react-native';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import JobCard from '@/components/jobs/JobCard';
import { RootState, useAppDispatch } from '@/app/(redux)/store';
import { setJobs, jobFail, setJob } from '@/app/(redux)/jobSlice';
import axiosInstance from '@/axios';
import { darkMainColor, darkSecondColor, lightMainColor, lightSecondColor } from '@/settings';
import { commonStyles } from '@/constants/commonStyles';
import { clientSetMessage } from '@/app/(redux)/clientSlice';
import { commonStylesDetails } from '@/constants/commonStylesDetails';
import { authLogout, authSetMessage } from '@/app/(redux)/authSlice';
import { setBusiness } from '@/app/(redux)/settingSlice';
import { Ionicons } from '@expo/vector-icons';
import { ThemedSecondaryView } from '@/components/ThemedSecondaryView';
import { commonStylesCards } from '@/constants/commonStylesCard';

export default function ClientDetail() {
  const { color, darkTheme, business } = useSelector((state: RootState) => state.settings);
  const { clientMessage, client } = useSelector((state: RootState) => state.client);
  const { jobs } = useSelector((state: RootState) => state.job);
  const [stateJobs, setStateJobs] = useState<any>([]);
  const [fetchTimes, setFetchTimes] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [modalVisible, setModalVisible] = useState(false);
  const [isBig, setIsBig] = useState(false);

  const dispatch = useAppDispatch();
  const router = useRouter();

  const getJobs = async () => {
    setIsLoading(true);
    await axiosInstance
      .get(`jobs/list/${business.name}/`)
      .then(function (response) {
        Vibration.vibrate(15);
        if (response.data) {
          dispatch(setJobs(response.data));
        } else {
          dispatch(jobFail(response.data.message));
        }
        setIsLoading(false);
      })
      .catch(function (error) {
        Vibration.vibrate(60);
        console.error('Error fetching spents:', error);
        if (typeof error.response === 'undefined') {
          setError(
            'A server/network error occurred. ' + 'Sorry about this - try againg in a few minutes.',
          );
        } else {
          if (error.status === 401) {
            dispatch(authSetMessage('Unauthorized, please login againg'));
            dispatch(setBusiness([]));
            dispatch(authLogout());
            router.replace('/');
          } else {
            setError('Error getting your spents.');
          }
        }
        setIsLoading(false);
      });
  };

  const fetchJobs = async () => {
    getJobs();
    let jobList = jobs.filter((jobs: { client: any }) => jobs.client === client.name);
    setStateJobs(jobList);
  };

  useEffect(() => {
    if (clientMessage) {
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: clientMessage,
      });
      dispatch(clientSetMessage(null));
    }
    if (jobs.length === 0 && fetchTimes === 0) {
      setFetchTimes(fetchTimes + 1);
      console.log(fetchTimes);

      fetchJobs();
    } else {
      let jobList = jobs.filter((jobs: { client: any }) => jobs.client === client.name);
      setStateJobs(jobList);
    }
  }, [clientMessage, jobs]);

  const handlePressable = (id: string) => {
    let job = jobs.find((job: { id: string }) => job.id === id);
    dispatch(setJob(job));
    router.push('/(app)/(jobs)/jobDetails');
  };

  const deleteClient = async () => {
    setIsLoading(true);
    await axiosInstance
      .post(
        `clients/delete/${client.id}/`,
        { action: 'delete' },
        {
          headers: {
            'content-Type': 'multipart/form-data',
          },
        },
      )
      .then(function (response) {
        if (response.data.OK) {
          dispatch(clientSetMessage(response.data.message));
          router.push('/(app)/(clients)');
        }
      })
      .catch(function (error) {
        setIsLoading(false);
        console.error('Error deleting a client:', error);
      });
  };

  const handleDelete = () => {
    setModalVisible(true);
  };

  const toggleImageSize = () => {
    setIsBig((prev) => !prev);
  };

  const handleCreateJob = () => {
    router.push({
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
          {isLoading ? (
            <ActivityIndicator style={commonStyles.containerCentered} color={color} size="large" />
          ) : (
            <View style={commonStylesDetails.list}>
              <FlatList
                data={stateJobs}
                renderItem={({ item }) => {
                  return (
                    <TouchableOpacity onPress={() => handlePressable(item.id)}>
                      <JobCard
                        id={item.id}
                        status={item.status}
                        client={item.client}
                        address={item.address}
                        description={item.description}
                        price={item.price}
                        inDetail={false}
                        image={item.image}
                        date={item.date}
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
                    refreshing={isLoading}
                    onRefresh={() => fetchJobs()}
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
            {isLoading ? (
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
                    onPress={() => deleteClient()}
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
    </>
  );
}
