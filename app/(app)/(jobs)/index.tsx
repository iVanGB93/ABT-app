import { StyleSheet, Text, View, TouchableOpacity, FlatList, SafeAreaView, ActivityIndicator, RefreshControl } from 'react-native';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import JobCard from '@/components/jobs/JobCard';
import { jobFail, jobSetLoading, setJobs, setJob } from '@/app/(redux)/jobSlice';
import { useAppDispatch, RootState } from '@/app/(redux)/store';
import { darkMainColor, darkSecondColor } from '@/settings';
import axiosInstance from '@/axios';


export default function Jobs() {
  const { color, darkTheme } = useSelector((state: RootState) => state.settings);
  const { userName } = useSelector((state: RootState) => state.auth);
  const { jobs, jobLoading, jobError } = useSelector((state: RootState) => state.job);
  const dispatch = useAppDispatch();
  const router = useRouter();

    const getJobs = async () => {
        dispatch(jobSetLoading(true));
        await axiosInstance
        .get(`jobs/list/${userName}/`)
        .then(function(response) {
            if (response.data) {
                dispatch(setJobs(response.data));
            } else {
                dispatch(jobFail(response.data.message));
            }
        })
        .catch(function(error) {
            console.error('Error fetching jobs:', error);
            try {
                const message = error.data.message;
                dispatch(jobFail(message));
            } catch(e) {
                dispatch(jobFail("Error getting your jobs."));
            }
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
      fetchJobs();
  }, []);

  const handlePressable = (id: string) => {
    let job = jobs.find((job: { id: string; }) => job.id === id);
    dispatch(setJob(job));
    router.push('/(app)/(jobs)/jobDetails');
  };

  return (
    <ThemedView style={[styles.container, {backgroundColor:darkTheme ? darkMainColor: color}]}>
      { jobError ? 
      <>
        <ThemedText>{jobError}</ThemedText>
        <TouchableOpacity style={[styles.updateButton, {backgroundColor: color}]} onPress={() => fetchJobs()}>
        <ThemedText>Try againg</ThemedText>
        </TouchableOpacity>
      </>
      :
      jobLoading ? 
      <ActivityIndicator color={color} size="large" />
      :
      <>
      <FlatList
        data={jobs}
        renderItem={({ item }) => {
            return (
                <TouchableOpacity onPress={() => handlePressable(item.id)}>
                    <JobCard image={item.image} id={item.id} status={item.status} client={item.client} address={item.address} description={item.description} price={item.price} inDetail={true} date={item.date} isList={true} />
                </TouchableOpacity>
            );
        }}
        ItemSeparatorComponent={
            <View
            style={{
                height: 16,
            }}
            />
        }
        ListEmptyComponent={<Text style={styles.loading}>{ jobError ? jobError.toString() + ", pull to refresh" : "No jobs found"}</Text>}
        ListHeaderComponent={<View style={{margin: 5}} />}
        ListFooterComponent={<View style={{margin: 5}} />}
        refreshControl={
            <RefreshControl
                refreshing={jobLoading}
                onRefresh={() => getJobs()}
                colors={[color]} // Colores del indicador de carga
                tintColor={color} // Color del indicador de carga en iOS
            />}
        />
        <TouchableOpacity style={[styles.button, {backgroundColor: color}]} onPress={() => router.push('/(app)/(jobs)/jobCreate')}>
            <Ionicons name="add" size={30} color="#FFF" />
        </TouchableOpacity>
        </>
        }
    </ThemedView>
  )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    loading: {
        flex: 1,
        verticalAlign: 'middle',
        alignSelf: 'center',
    },
    button: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 5,
      },
      updateButton: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 50,
        marginTop: 50,
        width: '80%',
        borderRadius: 10,
      },
})