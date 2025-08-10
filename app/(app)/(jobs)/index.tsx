import {
  TextInput,
  View,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Vibration,
} from 'react-native';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { StatusBar } from 'expo-status-bar';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import JobCard from '@/components/jobs/JobCard';
import { jobFail, setJobs, setJob, setJobMessage } from '@/app/(redux)/jobSlice';
import { useAppDispatch, RootState } from '@/app/(redux)/store';
import axiosInstance from '@/axios';
import { commonStyles } from '@/constants/commonStyles';
import { authLogout, authSetMessage } from '@/app/(redux)/authSlice';
import { setBusiness } from '@/app/(redux)/settingSlice';

export default function Jobs() {
  const { color, darkTheme, business } = useSelector((state: RootState) => state.settings);
  const { jobs, jobMessage, jobError } = useSelector((state: RootState) => state.job);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
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
        console.error('Error fetching jobs:', error);
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
            setError('Error getting your jobs.');
          }
        }
        setIsLoading(false);
      });
  };

  const fetchJobs = () => {
    getJobs();
    /* if (jobs.length !== 0) {
        console.log("SAME JOBS");
    } else {
        getJobs();
    } */
  };

  useEffect(() => {
    if (jobMessage) {
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: jobMessage,
      });
      dispatch(setJobMessage(null));
    }
    fetchJobs();
  }, []);

  const filteredJobs = [...jobs]
    .filter(
      (job) =>
        job.description.toLowerCase().includes(search.toLowerCase()) ||
        job.client.toLowerCase().includes(search.toLowerCase()),
    )
    .sort((a, b) => a.date.localeCompare(b.date));

  const handlePressable = (id: string) => {
    let job = jobs.find((job: { id: string }) => job.id === id);
    dispatch(setJob(job));
    router.push('/(app)/(jobs)/jobDetails');
  };

  return (
    <>
      <ThemedView style={commonStyles.container}>
        <View style={commonStyles.tabHeader}>
          <ThemedText type="subtitle">Jobs</ThemedText>
          <ThemedText type="subtitle">{business.name}</ThemedText>
        </View>
        <View style={{ paddingHorizontal: 10, marginBottom: 5 }}>
          <TextInput
            placeholder="Search by description or client"
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
        {isLoading ? (
          <ActivityIndicator style={commonStyles.containerCentered} color={color} size="large" />
        ) : jobError ? (
          <View style={commonStyles.containerCentered}>
            <ThemedText>{jobError}</ThemedText>
            <TouchableOpacity
              style={[commonStyles.button, { backgroundColor: color }]}
              onPress={() => fetchJobs()}
            >
              <ThemedText>Try again</ThemedText>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <FlatList
              data={filteredJobs}
              renderItem={({ item }) => {
                return (
                  <TouchableOpacity onPress={() => handlePressable(item.id)}>
                    <JobCard
                      image={item.image}
                      id={item.id}
                      status={item.status}
                      client={item.client}
                      address={item.address}
                      description={item.description}
                      price={item.price}
                      inDetail={true}
                      date={item.date}
                      isList={true}
                    />
                  </TouchableOpacity>
                );
              }}
              ItemSeparatorComponent={() => <View style={{ height: 5 }} />}
              contentContainerStyle={
                filteredJobs.length === 0
                  ? { flexGrow: 1, justifyContent: 'center', alignItems: 'center' }
                  : undefined
              }
              ListEmptyComponent={
                <View style={{ alignItems: 'center', justifyContent: 'center', padding: 16 }}>
                  <ThemedText type="subtitle" style={{ textAlign: 'center' }}>
                    {jobError
                      ? jobError.toString() + ', pull to refresh'
                      : 'No jobs found, create your first one'}
                  </ThemedText>
                </View>
              }
              ListHeaderComponent={<View style={{ margin: 5 }} />}
              ListFooterComponent={<View style={{ margin: 5 }} />}
              refreshControl={
                <RefreshControl
                  refreshing={isLoading}
                  onRefresh={() => getJobs()}
                  colors={[color]} // Colores del indicador de carga
                  tintColor={color} // Color del indicador de carga en iOS
                />
              }
            />
            <TouchableOpacity
              style={[commonStyles.createButton, { backgroundColor: color }]}
              onPress={() => router.push('/(app)/(jobs)/jobCreate')}
            >
              <Ionicons name="add" size={36} color="#FFF" />
            </TouchableOpacity>
          </>
        )}
      </ThemedView>
    </>
  );
}
