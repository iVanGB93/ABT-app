import { StyleSheet, Text, View, ActivityIndicator, RefreshControl, Platform, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import JobCard from '@/components/jobs/JobCard';
import { useAppDispatch, RootState } from '@/app/(redux)/store';
import { setJob } from '@/app/(redux)/jobSlice';
import { darkMainColor } from '@/settings';


export default function JobDetail() {
    const { color, darkTheme } = useSelector((state: RootState) => state.settings);
    const {clients} = useSelector((state: RootState) => state.client);
    const {jobs, jobLoading, jobError, job} = useSelector((state: RootState) => state.job);
/*     const spents = useSelector(state => state.spents.spents);
    const isLoadingSpents = useSelector(state => state.spents.loading);
    const SpentMessage = useSelector(state => state.spents.message); */
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const router = useRouter();

    const fetchJob = () => {
        /* let job = jobs.find((job: { id: any; }) => job.id === job.id)
        dispatch(setJob(job));
        dispatch(getSpents(job.id)); */
        setIsLoading(false); 
    };

    useEffect(() => {
        fetchJob();
    }, []);

    return (
        <ThemedView style={[styles.container, {backgroundColor:darkTheme ? darkMainColor: color}]}>
            { isLoading ? 
            <ActivityIndicator size="large" />
            :
            <JobCard id={job.id} status={job.status} client={job.client} address={job.address} description={job.description} price={job.price} inDetail={true} date={job.date} image={job.image} isList={undefined}/>
            }
            <Text style={styles.headerText}>Spents</Text>
           {/*  { SpentMessage ? Alert.alert(SpentMessage): null}
            { isLoadingSpents ? 
                <ActivityIndicator style={styles.loading} size="large" />
                :
                <FlatList
                data={spents}
                renderItem={({ item }) => {
                    return (
                        <SpentCard 
                            id={item.id} 
                            description={item.description} 
                            amount={item.amount} 
                            price={item.price} 
                            image={item.image} 
                            date={item.date}
                            navigation={navigation}
                        />
                    );
                }}
                ItemSeparatorComponent={
                    <View
                    style={{
                        height: 16,
                    }}
                    />
                }
                ListEmptyComponent={<View><Text style={styles.headerText}>No spents found</Text></View>}
                ListHeaderComponent={<View style={{margin: 5}} />}
                ListFooterComponent={<TouchableOpacity style={[styles.button, {margin: 15, backgroundColor: color}]} onPress={() => navigation.navigate('New Spent')}><Text style={[styles.headerText, {color: 'white'}]}>Add new spent</Text></TouchableOpacity>}
                refreshControl={
                    <RefreshControl
                      refreshing={isLoading}
                      onRefresh={() => fetchJob()}
                      colors={[color]} // Colores del indicador de carga
                      tintColor={color} // Color del indicador de carga en iOS
                    />}
                />
            } */}
        </ThemedView>
    )
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
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
});