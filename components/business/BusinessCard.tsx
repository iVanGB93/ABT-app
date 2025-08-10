import React, { useState } from 'react';
import {
  View,
  Text,
  Linking,
  Image,
  ActivityIndicator,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { useSelector } from 'react-redux';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { baseImageURL } from '@/settings';
import { darkTextColor, lightTextColor } from '../../settings';
import { RootState, useAppDispatch } from '@/app/(redux)/store';
import { ThemedSecondaryView } from '../ThemedSecondaryView';
import { commonStylesCards } from '@/constants/commonStylesCard';
import { setBusiness } from '@/app/(redux)/settingSlice';
import { Ionicons } from '@expo/vector-icons';

interface BusinessCardProps {
  logo: any;
  id: any;
  name: any;
  description: any;
  address: any;
  phone: any;
  email: any;
  owners: any;
  website: any;
  created_at: any;
  updated_at: any;
  inDetail?: boolean;
}

export default function BusinessCard({
  logo,
  id,
  name,
  description,
  address,
  phone,
  email,
  owners,
  website,
  created_at,
  updated_at,
  inDetail,
}: BusinessCardProps) {
  const { color, darkTheme } = useSelector((state: RootState) => state.settings);
  const { businesses } = useSelector((state: RootState) => state.business);
  const [modalVisible, setModalVisible] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isBig, setIsBig] = useState(false);
  const router = useRouter();
  const dispatch = useAppDispatch();

  const editBusiness = (id: string) => {
    let business = businesses.find((business: { id: string }) => business.id === id);
    dispatch(setBusiness(business));
    router.navigate('/(app)/(business)/businessUpdate');
  };

  const detailBusiness = (id: string) => {
    let business = businesses.find((business: { id: string }) => business.id === id);
    dispatch(setBusiness(business));
    router.navigate('/(app)/(business)/businessDetails');
  };

  const toggleImageSize = () => {
    setIsBig((prev) => !prev);
  };

  return (
    <ThemedSecondaryView
      style={[
        commonStylesCards.card,
        { borderColor: color, shadowColor: darkTheme ? '#fff' : '#000' },
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {logo ? (
          <Image source={{ uri: logo }} style={commonStylesCards.businessLogo} />
        ) : (
          <View style={[commonStylesCards.businessLogo, { backgroundColor: color + '20' }]}>
            <Ionicons name="briefcase-outline" size={32} color={color} />
          </View>
        )}
        <View style={{ flex: 1, paddingRight: 10 }}>
          <ThemedText type="subtitle">{name}</ThemedText>
          {phone && (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="call-outline" size={16} color={color} />
              <ThemedText type="default">{phone}</ThemedText>
            </View>
          )}
          {address && (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="location-outline" size={16} color={color} />
              <ThemedText type="default">{address}</ThemedText>
            </View>
          )}
        </View>
        <Ionicons name="chevron-forward" size={16} color={darkTheme ? '#666' : '#999'} />
      </View>
    </ThemedSecondaryView>
  );
}
