import { StyleSheet, View, ActivityIndicator, Text, FlatList, TouchableOpacity, RefreshControl, Platform } from 'react-native';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

import ItemCard from '@/components/items/ItemCard';
import JobCard from '@/components/jobs/JobCard';
import { RootState, useAppDispatch } from '@/app/(redux)/store';
import axiosInstance from '@/axios';
import { setUsedItems } from '@/app/(redux)/itemSlice';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { darkMainColor, lightMainColor } from '@/settings';
import { ThemedText } from '@/components/ThemedText';
import { setJob } from '@/app/(redux)/jobSlice';
import { commonStylesDetails } from '@/constants/commonStylesDetails';


export default function ItemDetail() {
    const { color, darkTheme } = useSelector((state: RootState) => state.settings);
    const { item, usedItems, itemMessage } = useSelector((state: RootState) => state.item);
    const [isLoading, setIsLoading] = useState(true);
    const dispatch = useAppDispatch();
    const router = useRouter();

    const fetchUsedItems = async () => {
        await axiosInstance
        .get(`items/used/${item.id}/`)
        .then(function(response) {
            const uniqueItems = response.data.filter((item: { id: any; }, index: any, self: any[]) =>
                index === self.findIndex((t) => (
                  t.id === item.id
                ))
            );
            dispatch(setUsedItems(uniqueItems));
            setIsLoading(false);
        })
        .catch(function(error) {
            console.error('Error fetching items:', error.message);
            dispatch(setUsedItems([]));
            setIsLoading(false);
            /* dispatch({
                type: CHANGE_ERROR,
                payload: error.message
            }) */
        });
    };

    useEffect(() => {
        fetchUsedItems();
    }, []);

    const handlePressable = (id: string) => {
        let job = usedItems.find((job: {id: string; }) => job.id === id);
        dispatch(setJob(job));
        router.push('(app)/(jobs)/jobDetails');
    };

    return (
        <ThemedView style={[commonStylesDetails.container, {backgroundColor:darkTheme ? darkMainColor: lightMainColor}]}>
            <ItemCard id={item.id} name={item.name} image={item.image} description={item.description} price={item.price} amount={item.amount} inDetail={true} date={item.date}/>
            <View style={commonStylesDetails.bottom}>
                <ThemedText type='subtitle'>Used in</ThemedText>
                { isLoading ? 
                    <ActivityIndicator style={commonStylesDetails.loading} size="large" />
                    :
                <View style={commonStylesDetails.list}>
                    <FlatList
                    data={usedItems}
                    renderItem={({ item }) => {
                        return (
                            <TouchableOpacity onPress={() => handlePressable(item.id)}>
                                <JobCard isList={true} id={item.id} status={item.status} image={item.image} client={item.client} address={item.address} description={item.description} price={item.price} date={item.date} inDetail={true} />
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
                    ListEmptyComponent={
                        <View>
                            <ThemedText style={[commonStylesDetails.headerText, {marginTop: 50}]}>No used yet, pull to refresh</ThemedText>
                        </View>
                    }
                    ListHeaderComponent={<View style={{margin: 5}} />}
                    ListFooterComponent={<TouchableOpacity style={{margin: 5}} />}
                    refreshControl={
                        <RefreshControl
                        refreshing={isLoading}
                        onRefresh={() => fetchUsedItems()}
                        colors={[color]} // Colores del indicador de carga
                        tintColor={color} // Color del indicador de carga en iOS
                        />}
                    />
                </View>
                }
            </View>
        </ThemedView>
    )
};