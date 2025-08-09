import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Linking,
  Image,
  Modal,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { baseImageURL } from '../../settings';
import axiosInstance from '../../axios';
import { darkMainColor, darkTextColor, lightMainColor, lightTextColor } from '../../settings';
import { RootState, useAppDispatch } from '@/app/(redux)/store';
import { ThemedText } from '../ThemedText';
import { setClient } from '@/app/(redux)/clientSlice';
import { ThemedSecondaryView } from '../ThemedSecondaryView';
import { setJobMessage } from '@/app/(redux)/jobSlice';
import { commonStylesCards } from '@/constants/commonStylesCard';
import { ThemedView } from '../ThemedView';

interface JobCardProps {
  image: any;
  id: any;
  status: any;
  client: any;
  address: any;
  description: any;
  price: any;
  date: any;
  isList: any;
  closed?: boolean;
  inDetail?: boolean;
}

export default function JobCard({
  id,
  status,
  client,
  address,
  description,
  price,
  image,
  date,
  closed,
  inDetail,
  isList,
}: JobCardProps) {
  const { color, darkTheme } = useSelector((state: RootState) => state.settings);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalVisibleFinish, setModalVisibleFinish] = useState(false);
  const clients = useSelector((state: RootState) => state.client.clients);
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isBig, setIsBig] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const statusIcon = (status: string) => {
    if (status === 'active') {
      return <FontAwesome name="wrench" color="orange" size={20} />;
    } else if (status === 'new') {
      return <FontAwesome style={{ color: 'red', fontSize: 20 }} name="exclamation" />;
    } else {
      return <Ionicons style={{ color: 'green', fontSize: 20 }} name="checkmark-done-sharp" />;
    }
  };

  const newDate = new Date(date);
  const formattedDate = newDate.toLocaleDateString('en-EN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    /* second: '2-digit', */
  });

  return (
    <ThemedView
      style={[
        commonStylesCards.card,
        { borderColor: color, shadowColor: darkTheme ? '#fff' : '#000' },
      ]}
    >
      <View
        style={[
          commonStylesCards.nameContainer,
          { borderBottomColor: darkTheme ? darkTextColor : lightTextColor },
        ]}
      >
        <ThemedText type='subtitle'>{description}</ThemedText>
        <ThemedText>{statusIcon(status)}</ThemedText>
      </View>
      { isList ?
      <View style={commonStylesCards.dataContainer}>
        <TouchableOpacity onPress={() => router.navigate('/(app)/(clients)/clientDetails')}>
          <ThemedText>{client}</ThemedText>
        </TouchableOpacity>
      </View> : null}
      <View style={commonStylesCards.dataContainer}>
        <ThemedText style={commonStylesCards.dataText}>{formattedDate}</ThemedText>
        <ThemedText style={commonStylesCards.dataText}>${price}</ThemedText>
      </View>
    </ThemedView>
  );
}
