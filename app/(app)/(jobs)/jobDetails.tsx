import {
  View,
  ActivityIndicator,
  RefreshControl,
  FlatList,
  TouchableOpacity,
  Vibration,
} from 'react-native';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import JobCard from '@/components/jobs/JobCard';
import SpentCard from '@/components/jobs/SpentCard';
import { useAppDispatch, RootState } from '@/app/(redux)/store';
import { darkMainColor, darkSecondColor, lightMainColor, lightSecondColor } from '@/settings';
import axiosInstance from '@/axios';
import { setItemMessage, setUsedItems } from '@/app/(redux)/itemSlice';
import { commonStylesDetails } from '@/constants/commonStylesDetails';
import { commonStyles } from '@/constants/commonStyles';
import { authLogout, authSetMessage } from '@/app/(redux)/authSlice';
import { setBusiness } from '@/app/(redux)/settingSlice';
import { Ionicons } from '@expo/vector-icons';


export default function JobDetail() {
  const { color, darkTheme } = useSelector((state: RootState) => state.settings);
  const { job } = useSelector((state: RootState) => state.job);
  const { usedItems } = useSelector((state: RootState) => state.item);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const dispatch = useAppDispatch();
  const router = useRouter();

  const fetchSpents = async () => {
    setIsLoading(true);
    await axiosInstance
      .get(`jobs/spents/list/${job.id}/`)
      .then(function (response) {
        Vibration.vibrate(15);
        if (response.data) {
          dispatch(setUsedItems(response.data));
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

  useEffect(() => {
    fetchSpents();
  }, []);

  return (
    <>
      <StatusBar style={darkTheme ? 'light' : 'dark'} />
      <ThemedView style={commonStyles.tabHeader}>
        <TouchableOpacity
          onPress={() => {
            router.replace('/(app)/(jobs)');
          }}
        >
          <Ionicons name="arrow-back" size={24} color={darkTheme ? '#fff' : '#000'} />
        </TouchableOpacity>
        <ThemedText type="subtitle">Job Details</ThemedText>
        <ThemedText type="subtitle"></ThemedText>
      </ThemedView>
    <ThemedView
      style={[
        commonStylesDetails.container,
        { backgroundColor: darkTheme ? darkMainColor : lightMainColor },
      ]}
    >
      <JobCard
        id={job.id}
        status={job.status}
        client={job.client}
        address={job.address}
        description={job.description}
        price={job.price}
        inDetail={true}
        date={job.date}
        image={job.image}
        isList={undefined}
      />
      <ThemedText type="subtitle" style={{ marginTop: 15, alignSelf: 'center' }}>
        Spents
      </ThemedText>
      {isLoading ? (
        <ActivityIndicator style={commonStylesDetails.loading} size="large" />
      ) : (
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
          ItemSeparatorComponent={() => (
            <View
              style={{
                height: 16,
              }}
            />
          )}
          ListEmptyComponent={
            <View>
              <ThemedText style={[commonStylesDetails.headerText, { marginTop: 50 }]}>
                No spents found, pull to refresh
              </ThemedText>
            </View>
          }
          ListHeaderComponent={<View style={{ margin: 5 }} />}
          ListFooterComponent={
            job.status !== 'finished' ? (
              <TouchableOpacity
                style={[
                  commonStyles.button,
                  {
                    marginTop: 20,
                    marginHorizontal: 'auto',
                    borderColor: color,
                    backgroundColor: darkTheme ? darkSecondColor : lightSecondColor,
                  },
                ]}
                onPress={() => router.push('/(app)/(jobs)/spentCreate')}
              >
                <ThemedText>+ Spent</ThemedText>
              </TouchableOpacity>
            ) : null
          }
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={() => fetchSpents()}
              colors={[color]} // Colores del indicador de carga
              tintColor={color} // Color del indicador de carga en iOS
            />
          }
        />
      )}
    </ThemedView>
    </>
  );
}
