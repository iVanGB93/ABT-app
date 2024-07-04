import { StyleSheet, Text, View, ActivityIndicator, RefreshControl, Platform, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import JobCard from '@/components/jobs/JobCard';
import SpentCard from '@/components/jobs/SpentCard';
import { useAppDispatch, RootState } from '@/app/(redux)/store';
import { setJob } from '@/app/(redux)/jobSlice';
import { darkMainColor, darkSecondColor, lightMainColor, lightSecondColor } from '@/settings';
import axiosInstance from '@/axios';
import { setItemMessage, setUsedItems } from '@/app/(redux)/itemSlice';
import { commonStylesDetails } from '@/constants/commonStylesDetails';
import { commonStyles } from '@/constants/commonStyles';


export default function JobDetail() {
    const { color, darkTheme } = useSelector((state: RootState) => state.settings);
    const {clients} = useSelector((state: RootState) => state.client);
    const {jobs, jobError, job} = useSelector((state: RootState) => state.job);
    const {usedItems} = useSelector((state: RootState) => state.item);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const dispatch = useAppDispatch();
    const router = useRouter();

    const fetchSpents = async () => {
        setIsLoading(true);
        await axiosInstance
        .get(`jobs/spents/list/${job.id}/`)
        .then(function(response) {
            if (response.data) {
                dispatch(setUsedItems(response.data));
            };
            setIsLoading(false);
        })
        .catch(function(error) {
            console.error('Error fetching spents:', error);
            dispatch(setItemMessage(error.response))
            setIsLoading(false);
        });
    };

    useEffect(() => {
        fetchSpents();
    }, []);

    return (
        <ThemedView style={[commonStylesDetails.container, {backgroundColor:darkTheme ? darkMainColor: lightMainColor}]}>
            <JobCard id={job.id} status={job.status} client={job.client} address={job.address} description={job.description} price={job.price} inDetail={true} date={job.date} image={job.image} isList={undefined}/>
                <ThemedText type='subtitle' style={{marginTop: 15, alignSelf: 'center'}}>Spents</ThemedText>
                { isLoading ? 
                    <ActivityIndicator style={commonStylesDetails.loading} size="large" />
                    :
                    <FlatList
                    data={usedItems}
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
                    ItemSeparatorComponent={
                        <View
                        style={{
                            height: 16,
                        }}
                        />
                    }
                    ListEmptyComponent={<View><ThemedText style={[commonStylesDetails.headerText, {marginTop: 50}]}>No spents found, pull to refresh</ThemedText></View>}
                    ListHeaderComponent={<View style={{margin: 5}} />}
                    ListFooterComponent={job.status !== 'finished' ? <TouchableOpacity style={[commonStyles.button, {marginTop: 20, marginHorizontal: 'auto', borderColor: color, backgroundColor: darkTheme ? darkSecondColor : lightSecondColor}]} onPress={() => router.push('spentCreate')}><Text style={[commonStylesDetails.headerText, {color: color}]}>Add new spent</Text></TouchableOpacity>: null}
                    refreshControl={
                        <RefreshControl
                        refreshing={isLoading}
                        onRefresh={() => fetchSpents()}
                        colors={[color]} // Colores del indicador de carga
                        tintColor={color} // Color del indicador de carga en iOS
                        />}
                    />
                }
        </ThemedView>
    )
};