import { StyleSheet, View, ActivityIndicator, Text, FlatList, TouchableOpacity, RefreshControl, Platform } from 'react-native';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import BusinessCard from '@/components/business/BusinessCard';
import { RootState, useAppDispatch } from "@/app/(redux)/store";
import { darkMainColor, darkSecondColor, lightMainColor, lightSecondColor } from '@/settings';
import { commonStyles } from '@/constants/commonStyles';
import { businessSetMessage } from '@/app/(redux)/businessSlice';
import { commonStylesDetails } from '@/constants/commonStylesDetails';


export default function BusinessDetails() {
    const { color, darkTheme } = useSelector((state: RootState) => state.settings);
    const { userName } = useSelector((state: RootState) => state.auth);
    const {businessMessage, business} = useSelector((state: RootState) => state.business);
    const {jobs } = useSelector((state: RootState) => state.job);
    const [ stateJobs, setStateJobs ] = useState<any>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string>('');
    const dispatch = useAppDispatch();
    const router = useRouter();


    useEffect(() => {
        if ( businessMessage) {
            Toast.show({
                type: 'success',
                text1: 'Success',
                text2: businessMessage
            });
            dispatch(businessSetMessage(null))
        };       
    }, []);

    return (
        <ThemedView style={[commonStylesDetails.container, {backgroundColor:darkTheme ? darkMainColor: lightMainColor}]}>
            <BusinessCard id={business.id} logo={business.logo} name={business.name} description={business.description} address={business.address} phone={business.phone} email={business.email} inDetail={true} owners={undefined} website={undefined} created_at={undefined} updated_at={undefined}/>
        </ThemedView>
    )
};

