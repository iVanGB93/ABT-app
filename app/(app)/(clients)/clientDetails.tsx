import { StyleSheet, View, ActivityIndicator, Text, FlatList, TouchableOpacity, RefreshControl, Platform } from 'react-native';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import ClientCard from '@/components/clients/ClientCard';
import JobCard from '@/components/jobs/JobCard';
import { RootState, useAppDispatch } from "@/app/(redux)/store";
import { setJobs, jobSetLoading, jobFail, setJob } from '@/app/(redux)/jobSlice';
import axiosInstance from '@/axios';
import { darkMainColor, lightMainColor } from '@/settings';
import { commonStyles } from '@/constants/commonStyles';
import { clientSetMessage } from '@/app/(redux)/clientSlice';


export default function ClientDetail() {
    const { color, darkTheme } = useSelector((state: RootState) => state.settings);
    const { userName } = useSelector((state: RootState) => state.auth);
    const {clientMessage, client} = useSelector((state: RootState) => state.client);
    const {jobs, jobLoading} = useSelector((state: RootState) => state.job);
    const [ stateJobs, setStateJobs ] = useState<any>([]);
    const [error, setError] = useState<string>('');
    const dispatch = useAppDispatch()
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
            if (typeof error.response === 'undefined') {
                setError("Error fetching jobs, undefinded");
              } else {
                if (error.response.status === 401) {
                    router.push('/');
                } else {
                  setError(error.message);
                };
            };
        });
    };

    const fetchJobs = async () => {
        getJobs();
        let jobList = jobs.filter((jobs: { client: any; }) => jobs.client === client.name)
        console.log(jobs);
        setStateJobs(jobList);
    };

    useEffect(() => {
        if ( clientMessage) {
            Toast.show({
                type: 'success',
                text1: 'Success',
                text2: clientMessage
            });
            dispatch(clientSetMessage(null))
        };
        if (jobs.length === 0) {
            fetchJobs();
        } else {
            let jobList = jobs.filter((jobs: { client: any; }) => jobs.client === client.name)
            setStateJobs(jobList);
        };
    }, []);

    const handlePressable = (id: string) => {
        let job = jobs.find((job: { id: string; }) => job.id === id);
        dispatch(setJob(job));
        router.push('/(app)/(jobs)/jobDetails');
      };

    return (
        <ThemedView style={[styles.container, {backgroundColor:darkTheme ? darkMainColor: lightMainColor}]}>
            <ClientCard id={client.id} image={client.image} name={client.name} last_name={client.last_name} address={client.address} phone={client.phone} email={client.email}  inDetail={true}/>
            <ThemedText style={styles.headerText}>Jobs</ThemedText>
            { jobLoading ?
                <ActivityIndicator color={color} size="large" />
                :
                <FlatList
                data={stateJobs}
                renderItem={({ item }) => {
                    return (
                        <TouchableOpacity onPress={() => handlePressable(item.id)}>
                            <JobCard id={item.id} status={item.status} client={item.client} address={item.address} description={item.description} price={item.price} inDetail={false} image={item.image} date={item.date} isList={false} />
                        </TouchableOpacity>
                    );
                }}
                ItemSeparatorComponent={<View style={{height: 16,}}/>}
                ListEmptyComponent={
                    <View>
                        <ThemedText style={styles.headerText}>No jobs found, pull to refresh</ThemedText>
                    </View>
                }
                ListHeaderComponent={<View style={{margin: 5}} />}
                ListFooterComponent={<TouchableOpacity style={[commonStyles.button, {margin: 15, borderColor: color}]} onPress={() => router.push('(app)/(jobs)/jobCreate')}><ThemedText type="subtitle" style={{color: color}}>Add new Job</ThemedText></TouchableOpacity>}
                refreshControl={
                    <RefreshControl
                      refreshing={jobLoading}
                      onRefresh={() => fetchJobs()}
                      colors={[color]} // Colores del indicador de carga
                      tintColor={color} // Color del indicador de carga en iOS
                    />}
                />
            }
           {/*  {errorJobs ? (
                <Text style={styles.errorText}>{errorJobs}</Text>
            ) : null} */}
        </ThemedView>
    )
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 10,
    },
    headerText: {
        fontSize: 16,
        fontWeight: 'bold',
        alignSelf: "center",
        marginTop: 5,
    },
    loading: {
        flex: 1,
        verticalAlign: 'middle'
    },
    button: {
        backgroundColor: '#694fad',
        padding: 10,
        borderRadius: 16,
        margin: 5,
        ...Platform.select({
            ios: {
            shadowOffset: { width: 2, height: 2 },
            shadowColor: "#333",
            shadowOpacity: 0.3,
            shadowRadius: 4,
            },
            android: {
            elevation: 5,
            },
        }),
    },
    errorText: {
        color: "red",
        marginBottom: 5,
    },
});