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


interface ClientCardProps {
  image: any;
  id: any;
  name: any;
  last_name: any;
  address: any;
  phone: any;
  email: any;
  inDetail?: boolean;
};

export default function ClientCard({image, id, name, last_name, address, phone, email, inDetail}: ClientCardProps) {
  const { color, darkTheme } = useSelector((state: RootState) => state.settings);
  const [modalVisible, setModalVisible] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [loading, setLoading] = useState(false);
  const imageObj = baseImageURL + image;
  const [isBig, setIsBig] = useState(false);
  const router = useRouter();
  const dispatch = useAppDispatch();

  const deleteClient = async () => {
    setLoading(true);
    await axiosInstance
    .post(`clients/delete/${id}/`, { action: 'delete'},
    { headers: {
      'content-Type': 'multipart/form-data',
    }})
    .then(function(response) {
      if (response.data.OK) {
        dispatch(clientSetMessage(response.data.message));
        router.push('/(app)/(clients)');
      }
    })
    .catch(function(error) {
      setLoading(false);
      console.error('Error deleting a client:', error);
    });
  };

  const handleDelete = () => {
    setModalVisible(true)
  };

  const toggleImageSize = () => {
    setIsBig((prev) => !prev);
  };

  return (
    <ThemedSecondaryView style={[commonStylesCards.card, {borderColor: color, shadowColor: darkTheme ? '#fff' : '#000'}]}>
      <View style={[commonStylesCards.nameContainer, {borderBottomColor:darkTheme ? darkTtextColor: lightTextColor}]}>
          <Text style={[commonStylesCards.name, {color:darkTheme ? darkTtextColor: lightTextColor}]}>{name} {last_name ? last_name  : null}</Text>
          { inDetail ?
          <TouchableOpacity onPress={() => router.push('/(app)/(clients)/clientUpdate')}><FontAwesome name="edit" color={darkTheme ? darkTtextColor: lightTextColor} size={30} /></TouchableOpacity>
          :
          <Image 
          style={{width: 30, height: 30, borderRadius: 75}} 
          source={{ uri: image }}
          onError={() => setImageError(true)}
          />
          }
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
            <ThemedText style={commonStylesCards.dataText} type='default'>{email ? email : 'No email saved'}</ThemedText>
          </TouchableOpacity>
      </View>
      {inDetail ?
      <View style={commonStylesCards.dataContainer}>
        <View style={{width:30}}></View>
        {imageError ?
        <ThemedText style={[commonStylesCards.LabelText, { alignSelf: 'center'}]}>image not found </ThemedText>
        :
        <TouchableOpacity onPress={toggleImageSize}>
          <Image 
          style={commonStylesCards.imageUser} 
          source={{ uri: image }}
          onError={() => setImageError(true)}
          />
        </TouchableOpacity>
        }
        <TouchableOpacity style={{alignSelf: 'flex-end', width:30}} onPress={() => handleDelete()}><Ionicons name="trash" color='red' size={30} /></TouchableOpacity>
      </View>
      : null}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(!modalVisible)}
      >
        <View style={commonStylesCards.centeredView}>
          { loading ?
          <ActivityIndicator color={color} size="large" />
          :
          <ThemedSecondaryView style={[commonStylesCards.card, {padding: 10}]}>
            <ThemedText style={[commonStylesCards.name, {padding: 10}]}>Do you want to delete {name}?</ThemedText>
            <View style={[commonStylesCards.dataContainer, {padding: 10, justifyContent: 'space-evenly'}]}>
              <TouchableOpacity
                style={[commonStylesCards.button, {borderColor: color}]}
                onPress={() => setModalVisible(!modalVisible)}>
                <ThemedText style={{color: color}}>Cancel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[commonStylesCards.button, {borderColor: 'red'}]}
                onPress={() => deleteClient()}>
                <Text style={{color:'red', textAlign: 'center'}}>DELETE</Text>
              </TouchableOpacity>
            </View>
          </ThemedSecondaryView>
          }
        </View>
      </Modal>
      <Modal 
        transparent={true} 
        animationType="fade"
        visible={isBig}
        >
        <View style={commonStylesCards.modalContainer}>
          <TouchableOpacity onPress={toggleImageSize} style={commonStylesCards.expandedImage}>
            <Image
              source={{ uri: image }}
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