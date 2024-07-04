import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform, Pressable, Linking, Image, Modal, Alert, ActivityIndicator, TouchableOpacity } from "react-native";
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { baseImageURL } from "../../settings";
import axiosInstance from "../../axios";
import { darkMainColor, darkSecondColor, darkTtextColor, lightMainColor, lightSecondColor, lightTextColor } from '../../settings';
import { RootState, useAppDispatch } from '@/app/(redux)/store';
import { ThemedView } from '../ThemedView';
import { ThemedText } from '../ThemedText';
import { setClient } from '@/app/(redux)/clientSlice';
import { commonStyles } from '@/constants/commonStyles';
import { ThemedSecondaryView } from '../ThemedSecondaryView';
import { setJobMessage } from '@/app/(redux)/jobSlice';
import { commonStylesCards } from '@/constants/commonStylesCard';


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
};

export default function JobCard({id, status, client, address, description, price, image, date, closed, inDetail, isList}: JobCardProps) {
  const { color, darkTheme } = useSelector((state: RootState) => state.settings);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalVisibleFinish, setModalVisibleFinish] = useState(false);
  const clients = useSelector((state: RootState) => state.client.clients);
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const imageObj = {'uri': baseImageURL + image};
  const [isBig, setIsBig] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const statusIcon = (status:string) => {
    if (status === 'active') {
      return <FontAwesome name="wrench" color='orange' size={20} />
    } else if ( status === 'new') {
      return <FontAwesome style={{color: 'red', fontSize: 20}} name='exclamation'/>
    } else {
      return <Ionicons style={{color: 'green', fontSize: 20}} name='checkmark-done-sharp'/>
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

  const deleteJob = async () => {
    setIsLoading(true);
    await axiosInstance
    .post(`jobs/delete/${id}/`, { action: 'delete'},
    { headers: {
      'content-Type': 'multipart/form-data',
    }})
    .then(function(response) {
      if (response.data.OK) {
        setIsLoading(false);
        dispatch(setJobMessage(response.data.message));
        router.push('/(app)/(jobs)');
      }
    })
    .catch(function(error) {
        setIsLoading(false);
        console.error('Error deleting a job:', error.message);
        Alert.alert(`Error deleting a job: ${error.message}`);
    });
  };

  const closeJob = async () => {
    setIsLoading(true);
    await axiosInstance
    .post(`jobs/update/${id}/`, { action: 'close'},
    { headers: {
      'content-Type': 'multipart/form-data',
    }})
    .then(function(response) {
      if (response.data.OK) {
        setIsLoading(false);
        dispatch(setJobMessage(response.data.message));
        router.push('/(app)/(jobs)');
      }
    })
    .catch(function(error) {
        setIsLoading(false);
        setModalVisible(false);
        console.error('Error closing a job:', error.message);
        Alert.alert(`Error closing a job: ${error.message}`);
    });
  };

  const handleDelete = () => {
    setModalVisible(true)
  };

  const handleClose = () => {
    setModalVisibleFinish(true);
  };

  const handleInvoice = () => {
    let pickedClient = clients.find((pickedClient: { name: any; }) => pickedClient.name === client);
    dispatch(setClient(pickedClient));
    router.push('(app)/(jobs)/invoice');
  };

  const toggleImageSize = () => {
    setIsBig((prev) => !prev);
  };

  return (
    <ThemedSecondaryView style={[commonStylesCards.card, {borderColor: color, shadowColor: darkTheme ? '#fff' : '#000'}]}>
        <View style={[commonStylesCards.nameContainer, {borderBottomColor:darkTheme ? darkTtextColor: lightTextColor}]}>
            <ThemedText style={commonStylesCards.name}>
            { inDetail ? 
            <ThemedText style={commonStylesCards.name}>{statusIcon(status)} - {client}</ThemedText>
            : 
            description
            }
            </ThemedText>
            <Pressable onPress={() => router.push('/(app)/(jobs)/jobUpdate')}><FontAwesome name="edit" color={darkTheme ? darkTtextColor: lightTextColor} size={30} /></Pressable>
        </View>
        { inDetail ?
        <View style={commonStylesCards.dataContainer}>
            <ThemedText style={[commonStylesCards.LabelText, {fontSize: 20, marginTop: 5}]}>{description}</ThemedText>
        </View>
        : null }
        <View style={commonStylesCards.dataContainer}>
            <ThemedText style={commonStylesCards.LabelText}>Address: </ThemedText>
            <Pressable onPress={() => Linking.openURL(`https://www.google.com/maps?q=${address}`)}><ThemedText type='link'>{address}</ThemedText></Pressable>
        </View>
        <View style={commonStylesCards.dataContainer}>
            <ThemedText style={commonStylesCards.LabelText}>Price: </ThemedText>
            <ThemedText>${price}</ThemedText>
        </View>
        <View style={commonStylesCards.dataContainer}>
            <ThemedText style={commonStylesCards.LabelText}>Date: </ThemedText>
            <ThemedText>{formattedDate}</ThemedText>
        </View>
        { isList ? null
        :
        ( inDetail ?
        (<View style={commonStylesCards.dataContainer}>
          <View>
            {imageError ?
            <ThemedText style={[commonStylesCards.LabelText, { alignSelf: 'center'}]}>image not found </ThemedText>
            :
            <TouchableOpacity onPress={toggleImageSize}>
              <Image 
              style={commonStylesCards.imageJob} 
              source={{ uri: imageObj.uri }}
              onError={() => setImageError(true)}
              />
            </TouchableOpacity>
            }
          </View>
          <View style={{flexDirection: 'column',}}>
            <View style={commonStylesCards.dataContainer}>
              { (status === 'finished') ?
                (<ThemedText style={{color: color}}>Job finished</ThemedText>)
              :
                <TouchableOpacity style={[commonStylesCards.button, {borderColor: 'red'}]} onPress={() => handleClose()}><ThemedText style={{color: 'red'}}>Close</ThemedText></TouchableOpacity>
              }
              <TouchableOpacity style={[commonStylesCards.button, {borderColor: color}]} onPress={() => handleInvoice()}><ThemedText style={commonStylesCards.LabelText}>Invoice</ThemedText></TouchableOpacity>
            </View>
            <TouchableOpacity style={{alignSelf: 'flex-end', marginBottom: 0, marginTop: 10}} onPress={() => handleDelete()}><Ionicons name="trash" color='red' size={30} /></TouchableOpacity>
          </View>
        </View>)
        : null)
        } 
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
            <ThemedText style={[commonStylesCards.name, {padding: 10}]}>Do you want to delete this job?</ThemedText>
            <View style={[commonStylesCards.dataContainer, {padding: 10, justifyContent: 'space-evenly'}]}>
              <TouchableOpacity
                style={[commonStylesCards.button, {borderColor: color}]}
                onPress={() => setModalVisible(!modalVisible)}>
                <ThemedText style={{color: color, textAlign: 'center'}}>Cancel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[commonStylesCards.button, {borderColor: 'red'}]}
                onPress={() => deleteJob()}>
                <ThemedText style={{color:'red', textAlign: 'center'}}>DELETE</ThemedText>
              </TouchableOpacity>
            </View>
          </ThemedSecondaryView>
          }
        </View>
      </Modal>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisibleFinish}
        onRequestClose={() => {
          setModalVisibleFinish(!modalVisibleFinish);
        }}>
        <View style={commonStylesCards.centeredView}>
          { isLoading ?
          <ActivityIndicator style={commonStylesCards.loading} size="large" />
          :
          <ThemedSecondaryView style={[commonStylesCards.card, {padding: 10}]}>
            <ThemedText style={[commonStylesCards.name, {padding: 10, }]}>Did you finish this job?</ThemedText>
            <View style={[commonStylesCards.dataContainer, {padding: 10, justifyContent: 'space-evenly'}]}>
              <TouchableOpacity
                style={[commonStylesCards.button, {borderColor: color}]}
                onPress={() => setModalVisibleFinish(!modalVisibleFinish)}>
                <ThemedText style={{textAlign: 'center'}}>No</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[commonStylesCards.button, {borderColor: 'red'}]}
                onPress={() => closeJob()}>
                <ThemedText style={{color:'red', textAlign: 'center'}}>Yes, close it</ThemedText>
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