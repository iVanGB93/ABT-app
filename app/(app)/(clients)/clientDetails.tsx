import { StyleSheet, View, ActivityIndicator, Text, FlatList, TouchableOpacity, RefreshControl, Platform } from 'react-native';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import ClientCard from '@/components/clients/ClientCard';
import JobCard from '@/components/jobs/JobCard';
import { RootState, useAppDispatch } from "@/app/(redux)/store";
import { setJobs, jobSetLoading, jobFail, setJob } from '@/app/(redux)/jobSlice';
import axiosInstance from '@/axios';
import { darkMainColor } from '@/settings';


export default function ClientDetail() {
    const { color, darkTheme } = useSelector((state: RootState) => state.settings);
    const { userName } = useSelector((state: RootState) => state.auth);
    const {clients, clientLoading, clientError, client} = useSelector((state: RootState) => state.client);
    const {jobs, jobLoading, jobError} = useSelector((state: RootState) => state.job);
    const [ stateJobs, setStateJobs ] = useState<any>([]);
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
            try {
                const message = error.data.message;
                dispatch(jobFail(message));
            } catch(e) {
                dispatch(jobFail("Error getting your jobs."));
            }
        });
    };

    const fetchJobs = async () => {
        getJobs();
        let jobList = jobs.filter((jobs: { client: any; }) => jobs.client === client.user)
        setStateJobs(jobList);
    };

    useEffect(() => {
        if (jobs.length === 0) {
            getJobs();
        };
        let jobList = jobs.filter((jobs: { client: any; }) => jobs.client === client.user)
        setStateJobs(jobList);
    }, []);

    const handlePressable = (id: string) => {
        let job = jobs.find((job: { id: string; }) => job.id === id);
        dispatch(setJob(job));
        router.push('/(app)/(jobs)/jobDetails');
      };

    return (
        <ThemedView style={[styles.container, {backgroundColor:darkTheme ? darkMainColor: color}]}>
            {clientError ? (
                <ThemedText style={styles.errorText}>{clientError}</ThemedText>
            ) : null}
            { clientLoading ? 
            <ActivityIndicator style={styles.loading} size="large" />
            :
            <ClientCard id={client.id} image={client.image} name={client.user} address={client.address} phone={client.phone} email={client.email}  inDetail={true}/>
            }
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
                        <ThemedText style={styles.headerText}>No jobs found</ThemedText>
                    </View>
                }
                ListHeaderComponent={<View style={{margin: 5}} />}
                ListFooterComponent={<TouchableOpacity style={[styles.button, {margin: 15, backgroundColor: color}]} onPress={() => router.push('(app)/(jobs)/jobCreate')}><Text style={[styles.headerText, {color: 'white'}]}>Add new Job</Text></TouchableOpacity>}
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