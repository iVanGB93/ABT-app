import { View, Text, StyleSheet, Platform, Pressable, Image, ActivityIndicator, Modal, Alert, TouchableOpacity } from "react-native";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useState } from "react";
import { useDispatch, useSelector } from 'react-redux';

import { baseImageURL, darkSecondColor, darkTtextColor, lightSecondColor, lightTextColor } from "@/settings";
import { RootState, useAppDispatch } from "@/app/(redux)/store";
import { ThemedView } from "../ThemedView";
import { ThemedText } from "../ThemedText";
import axiosInstance from "@/axios";
import { useRouter } from "expo-router";
import { ThemedSecondaryView } from "../ThemedSecondaryView";
import { commonStylesCards } from "@/constants/commonStylesCard";


interface SpentCardProps {
  image: any;
  id: any;
  description: any;
  amount: any;
  date: any;
};

export default function SpentCard({image, id, description, amount, date}: SpentCardProps) {
  const { color, darkTheme } = useSelector((state: RootState) => state.settings);
  const [modalVisible, setModalVisible] = useState(false);
  const spents = useSelector((state: RootState) => state.item.usedItems);
  const [imageError, setImageError] = useState(false);
  const imageObj = {'uri': baseImageURL + image};
  const [isBig, setIsBig] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleDelete = () => {
    setModalVisible(true)
  };

  const handleEdit = () => {
    let spent = spents.find(spent => spent.id === id);
    dispatch(setSpent(spent));
    navigation.navigate('JobStack', {screen: 'Edit Spent', params: {id: id}})
  };

  const handleConfirmedDelete = async () => {
    setIsLoading(true);
    await axiosInstance
    .post(`jobs/spents/delete/${id}/`, { action: 'delete'},
    { headers: {
    'content-Type': 'multipart/form-data',
    }})
    .then(function(response) {
      if (response.data.OK) {
        router.push(('(app)/(jobs)/jobDetails'));
      }
    })
    .catch(function(error) {
        console.error('Error deleting a spent:', error);
    });
  };

  const toggleImageSize = () => {
    setIsBig((prev) => !prev);
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
    <ThemedSecondaryView style={[commonStylesCards.card, {borderColor: color, shadowColor: darkTheme ? '#fff' : '#000'}]}>
      <View style={[commonStylesCards.nameContainer, {borderBottomColor:darkTheme ? darkTtextColor: lightTextColor}]}>
          <ThemedText style={commonStylesCards.name}>{description}</ThemedText>
      </View>
        <View style={commonStylesCards.dataContainer}>
            <View style={commonStylesCards.dataContainer}>
                {imageError ?
                <ThemedText style={[commonStylesCards.LabelText, { alignSelf: 'center'}]}>image not found </ThemedText>
                :
                <Pressable onPress={toggleImageSize}>
                  <Image 
                  style={[commonStylesCards.imageJob, {width: 120, height: 80}]} 
                  source={{ uri: imageObj.uri }}
                  onError={() => setImageError(true)}
                  />
                </Pressable>
                }
            </View>
            <View style={{flex: 1, paddingLeft: 5}}>
                <ThemedText style={commonStylesCards.LabelText}>Amount: ${amount}</ThemedText>
                <ThemedText style={commonStylesCards.LabelText}>{formattedDate}</ThemedText>
                <View style={[commonStylesCards.dataContainer, {justifyContent: 'flex-end'}]}>
                  {/* <Pressable onPress={() => handleEdit()}><MaterialCommunityIcons name="clipboard-edit-outline" color={darkTheme ? darkTtextColor: lightTextColor} size={30} /></Pressable> */}
                  <Pressable onPress={() => handleDelete()}><MaterialCommunityIcons name="delete-outline" color='red' size={30} /></Pressable>
                </View>
            </View>
        </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}>
        <View style={commonStylesCards.centeredView}>
          { isLoading ?
          <ActivityIndicator style={commonStylesCards.loading} size="large" />
          :
          <ThemedSecondaryView style={[commonStylesCards.card, {padding: 10}]}>
            <ThemedText style={[commonStylesCards.name, {padding: 10}]}>Do you want to delete this spent?</ThemedText>
            <View style={[commonStylesCards.dataContainer, {padding: 10, justifyContent: 'space-evenly'}]}>
              <TouchableOpacity
                style={[commonStylesCards.button, {borderColor: color}]}
                onPress={() => setModalVisible(!modalVisible)}>
                <ThemedText style={{textAlign: 'center', color: color}}>No</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[commonStylesCards.button, {borderColor: 'red'}]}
                onPress={() => handleConfirmedDelete()}>
                <ThemedText style={{color:'red', textAlign: 'center'}}>Delete</ThemedText>
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
              source={{ uri: imageObj.uri }}
              style={commonStylesCards.expandedImage}
            />
          </TouchableOpacity>
          <Pressable
          style={[commonStylesCards.button, {marginHorizontal: 5, flex: 1}]}
          onPress={() => setIsBig(!isBig)}>
            <Text style={{color:'white', textAlign: 'center', fontSize: 20}}>Close</Text>
          </Pressable>
        </View>
      </Modal>
    </ThemedSecondaryView>
  )
};