import React, { useState } from 'react';
import { View, Text, Linking, Image, ActivityIndicator, Modal, TouchableOpacity } from "react-native";
import { useSelector } from 'react-redux';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { baseImageURL } from "@/settings";
import { darkTtextColor, lightTextColor } from '../../settings';
import { RootState, useAppDispatch } from '@/app/(redux)/store';
import { ThemedSecondaryView } from '../ThemedSecondaryView';
import { commonStylesCards } from '@/constants/commonStylesCard';
import { setBusiness } from '@/app/(redux)/businessSlice';


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

    const detailBusiness = (id: string) => {
        let business = businesses.find((business: { id: string; }) => business.id === id);
        dispatch(setBusiness(business));
        router.navigate('/(app)/(business)/businessDetails');
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
      </View>
      <View style={commonStylesCards.dataContainer}>
          <Text style={[commonStylesCards.LabelText, {color:darkTheme ? darkTtextColor: lightTextColor}]}>Address: </Text>
          <TouchableOpacity onPress={() => Linking.openURL(`https://www.google.com/maps?q=${address}`)}>
            <ThemedText style={commonStylesCards.dataText}>{address ? address : 'No address saved'}</ThemedText>
          </TouchableOpacity>
      </View>
      <View style={commonStylesCards.dataContainer}>
          <Text style={[commonStylesCards.LabelText, {color:darkTheme ? darkTtextColor: lightTextColor}]}>Phone: </Text>
          <TouchableOpacity onPress={() => Linking.openURL(`tel:${phone}`)}>
            <ThemedText style={commonStylesCards.dataText}>{phone ? phone : 'No phone saved'}</ThemedText>
          </TouchableOpacity>
      </View>
      <View style={commonStylesCards.dataContainer}>
          <Text style={[commonStylesCards.LabelText, {color:darkTheme ? darkTtextColor: lightTextColor}]}>Email: </Text>
          <TouchableOpacity onPress={() => Linking.openURL(`mailto:${email}`)}>
            <ThemedText style={commonStylesCards.dataText}>{email ? email : 'No email saved'}</ThemedText>
          </TouchableOpacity>
      </View>
      <View style={commonStylesCards.dataContainer}>
          <Text style={[commonStylesCards.LabelText, {color:darkTheme ? darkTtextColor: lightTextColor}]}>Website: </Text>
          <ThemedText style={commonStylesCards.dataText}>{website ? website : 'No website saved'}</ThemedText>
      </View>
      <View style={commonStylesCards.dataContainer}>
          <Text style={[commonStylesCards.LabelText, {color:darkTheme ? darkTtextColor: lightTextColor}]}>Owners: </Text>
          <ThemedText style={commonStylesCards.dataText}>{owners && owners.length > 0 ? owners.join(', ') : 'No owners saved'}</ThemedText>
      </View>
      {inDetail ?
      null
      : 
      <View style={[commonStylesCards.dataContainer, {padding: 5, justifyContent: 'space-evenly'}]}>
        <TouchableOpacity style={[commonStylesCards.button, {borderColor: color}]} onPress={() => detailBusiness(id)}>
            <ThemedText type="subtitle" style={{color: color}}>Details</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={[commonStylesCards.button, {borderColor: color}]} onPress={() => editBusiness(id)}>
            <ThemedText type="subtitle" style={{color: color}}>Edit</ThemedText>
          </TouchableOpacity>
      </View>
      }
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