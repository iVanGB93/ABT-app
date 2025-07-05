import React, { useState } from 'react';
import { View, Text, Linking, Image, ActivityIndicator, Modal, TouchableOpacity } from "react-native";
import { useSelector } from 'react-redux';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { baseImageURL } from "@/settings";
import axiosInstance from "../../axios";
import { clientSetMessage } from '../../app/(redux)/clientSlice';
import { darkTtextColor, lightTextColor } from '../../settings';
import { RootState, useAppDispatch } from '@/app/(redux)/store';
import { FontAwesome } from '@expo/vector-icons';
import { ThemedSecondaryView } from '../ThemedSecondaryView';
import { commonStylesCards } from '@/constants/commonStylesCard';
import { setBusiness } from '@/app/(redux)/settingSlice';


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
};

export default function BusinessCard({logo, id, name, description, address, phone, email, owners, website, created_at, updated_at, inDetail}: BusinessCardProps) {
    const { color, darkTheme } = useSelector((state: RootState) => state.settings);
    const { businesses } = useSelector((state: RootState) => state.business);
    const [modalVisible, setModalVisible] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [loading, setLoading] = useState(false);
    const imageObj = baseImageURL + logo;
    const [isBig, setIsBig] = useState(false);
    const router = useRouter();
    const dispatch = useAppDispatch();

    const editBusiness = (id: string) => {
        let business = businesses.find((business: { id: string; }) => business.id === id);
        dispatch(setBusiness(business));
        router.navigate('/(app)/(business)/businessUpdate');
    };

    const toggleImageSize = () => {
        setIsBig((prev) => !prev);
    };

  return (
    <ThemedSecondaryView style={[commonStylesCards.card, {borderColor: color, shadowColor: darkTheme ? '#fff' : '#000'}]}>
      <View style={[commonStylesCards.nameContainer, {borderBottomColor:darkTheme ? darkTtextColor: lightTextColor}]}>
          <Text style={[commonStylesCards.name, {color:darkTheme ? darkTtextColor: lightTextColor}]}>{name}</Text>
          <Image 
          style={{width: 30, height: 30, borderRadius: 75}} 
          source={{ uri: imageObj }}
          onError={() => setImageError(true)}
          />
          <TouchableOpacity onPress={() => editBusiness(id)}><FontAwesome name="edit" color={darkTheme ? darkTtextColor: lightTextColor} size={30} /></TouchableOpacity>
      </View>
      <View style={commonStylesCards.dataContainer}>
          <Text style={[commonStylesCards.LabelText, {color:darkTheme ? darkTtextColor: lightTextColor}]}>Address: </Text>
          <TouchableOpacity onPress={() => Linking.openURL(`https://www.google.com/maps?q=${address}`)}>
            <ThemedText style={commonStylesCards.dataText} type='link'>{address ? address : 'No address saved'}</ThemedText>
          </TouchableOpacity>
      </View>
      <View style={commonStylesCards.dataContainer}>
          <Text style={[commonStylesCards.LabelText, {color:darkTheme ? darkTtextColor: lightTextColor}]}>Phone: </Text>
          <TouchableOpacity onPress={() => Linking.openURL(`tel:${phone}`)}>
            <ThemedText style={commonStylesCards.dataText} type='link'>{phone ? phone : 'No phone saved'}</ThemedText>
          </TouchableOpacity>
      </View>
      <View style={commonStylesCards.dataContainer}>
          <Text style={[commonStylesCards.LabelText, {color:darkTheme ? darkTtextColor: lightTextColor}]}>Email: </Text>
          <TouchableOpacity onPress={() => Linking.openURL(`mailto:${email}`)}>
            <ThemedText style={commonStylesCards.dataText} type='link'>{email ? email : 'No email saved'}</ThemedText>
          </TouchableOpacity>
      </View>
      {inDetail ?
      <>
      <View style={commonStylesCards.dataContainer}>
          <Text style={[commonStylesCards.LabelText, {color:darkTheme ? darkTtextColor: lightTextColor}]}>Owners: </Text>
          <ThemedText style={commonStylesCards.dataText}>{owners && owners.length > 0 ? owners.join(', ') : 'No owners saved'}</ThemedText>
      </View>
      <View style={commonStylesCards.dataContainer}>
          <Text style={[commonStylesCards.LabelText, {color:darkTheme ? darkTtextColor: lightTextColor}]}>Website: </Text>
          <ThemedText style={commonStylesCards.dataText}>{website ? website : 'No website saved'}</ThemedText>
      </View>
      <View style={commonStylesCards.dataContainer}>
          <Text style={[commonStylesCards.LabelText, {color:darkTheme ? darkTtextColor: lightTextColor}]}>Date Created: </Text>
          <ThemedText style={commonStylesCards.dataText}>{created_at ? created_at : 'No date saved'}</ThemedText>
      </View>
      <View style={commonStylesCards.dataContainer}>
        <View style={{width:30}}></View>
        {imageError ?
        <ThemedText style={[commonStylesCards.LabelText, { alignSelf: 'center'}]}>image not found </ThemedText>
        :
        <TouchableOpacity onPress={toggleImageSize}>
          <Image 
          style={commonStylesCards.imageUser} 
          source={{ uri: imageObj }}
          onError={() => setImageError(true)}
          />
        </TouchableOpacity>
        }
      </View>
      </>
      : null}
      <Modal 
        transparent={true} 
        animationType="fade"
        visible={isBig}
        >
        <View style={commonStylesCards.modalContainer}>
          <TouchableOpacity onPress={toggleImageSize} style={commonStylesCards.expandedImage}>
            <Image
              source={{ uri: imageObj }}
              style={commonStylesCards.expandedImage}
            />
          </TouchableOpacity>
          <TouchableOpacity
          style={[commonStylesCards.button, {marginHorizontal: 5, flex: 1}]}
          onPress={() => setIsBig(!isBig)}>
            <Text style={{color:'white', textAlign: 'center', fontSize: 20}}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </ThemedSecondaryView>
  )
};