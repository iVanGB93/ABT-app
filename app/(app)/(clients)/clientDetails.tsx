import {
  View,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Vibration,
} from 'react-native';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import ClientCard from '@/components/clients/ClientCard';
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

export default function ClientDetail() {
  const { color, darkTheme, business } = useSelector((state: RootState) => state.settings);
  const { clientMessage, client } = useSelector((state: RootState) => state.client);
  const { jobs } = useSelector((state: RootState) => state.job);
  const [stateJobs, setStateJobs] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
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
    if (jobs.length === 0) {
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

  return (
    <ThemedView
      style={[
        commonStylesDetails.container,
        { backgroundColor: darkTheme ? darkMainColor : lightMainColor },
      ]}
    >
      <ClientCard
        id={client.id}
        image={client.image}
        name={client.name}
        last_name={client.last_name}
        address={client.address}
        phone={client.phone}
        email={client.email}
        inDetail={true}
      />
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
              ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
              ListEmptyComponent={
                <View>
                  <ThemedText style={[commonStylesDetails.headerText, { marginTop: 50 }]}>
                    No jobs found, pull to refresh
                  </ThemedText>
                </View>
              }
              ListHeaderComponent={<View style={{ margin: 5 }} />}
              ListFooterComponent={
                <TouchableOpacity
                  style={[
                    commonStyles.button,
                    {
                      margin: 15,
                      borderColor: color,
                      backgroundColor: darkTheme ? darkSecondColor : lightSecondColor,
                    },
                  ]}
                  onPress={() => router.push('/(app)/(jobs)/jobCreate')}
                >
                  <ThemedText style={{ color: color }}>+ Job</ThemedText>
                </TouchableOpacity>
              }
              refreshControl={
                <RefreshControl
                  refreshing={isLoading}
                  onRefresh={() => fetchJobs()}
                  colors={[color]} // Colores del indicador de carga
                  tintColor={color} // Color del indicador de carga en iOS
                />
              }
            />
          </View>
        )}
        {/*  {errorJobs ? (
                    <Text style={styles.errorText}>{errorJobs}</Text>
                ) : null} */}
      </View>
    </ThemedView>
  );
}
