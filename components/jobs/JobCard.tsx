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
  const dispatch = useAppDispatch();
  const router = useRouter();

  const statusIcon = (status:string) => {
    if (status === 'active') {
      return <FontAwesome name="wrench" color='orange' size={30} />
    } else if ( status === 'new') {
      return <Text style={{color: 'red', fontSize: 20}}>New</Text>
    } else {
      return <Text style={{color: 'green', fontSize: 20}}>Done</Text>
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
        router.push('/(app)/(jobs)');
        Alert.alert(response.data.message);
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
        router.push('/(app)/(jobs)');
        Alert.alert(response.data.message);
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

  return (
    <ThemedView style={[styles.card, {borderColor: color, backgroundColor:darkTheme ? darkSecondColor: lightSecondColor}]}>
        <View style={[styles.nameContainer, {borderBottomColor:darkTheme ? darkTtextColor: lightTextColor}]}>
            <ThemedText style={styles.name}>
            { inDetail ? 
            <ThemedText style={styles.name}>{statusIcon(status)} - {client}</ThemedText>
            : 
            description
            }
            </ThemedText>
            <Pressable onPress={() => router.push('/(app)/(jobs)/jobUpdate')}><FontAwesome name="edit" color={darkTheme ? darkTtextColor: lightTextColor} size={30} /></Pressable>
        </View>
        { inDetail ?
        <View style={styles.dataContainer}>
            <ThemedText style={[styles.LabelText, {fontSize: 20, marginTop: 5}]}>{description}</ThemedText>
        </View>
        : null }
        <View style={styles.dataContainer}>
            <ThemedText style={styles.LabelText}>Address: </ThemedText>
            <Pressable onPress={() => Linking.openURL(`https://www.google.com/maps?q=${address}`)}><ThemedText type='link'>{address}</ThemedText></Pressable>
        </View>
        <View style={styles.dataContainer}>
            <ThemedText style={styles.LabelText}>Price: </ThemedText>
            <ThemedText>${price}</ThemedText>
        </View>
        <View style={styles.dataContainer}>
            <ThemedText style={styles.LabelText}>Date: </ThemedText>
            <ThemedText>{formattedDate}</ThemedText>
        </View>
        { isList ? null
        :
        ( inDetail ?
        (<View style={styles.dataContainer}>
          <View>
            {imageError ?
            <ThemedText style={[styles.LabelText, { alignSelf: 'center'}]}>image not found </ThemedText>
            :
            <Image 
            style={styles.image} 
            source={{ uri: imageObj.uri }}
            onError={() => setImageError(true)}
            />
            }
          </View>
          <View style={{flexDirection: 'column',}}>
            <View style={styles.dataContainer}>
              { (status === 'finished') ?
                (<ThemedText style={{color: color}}>Job finished</ThemedText>)
              :
                <TouchableOpacity style={[styles.button, {borderColor: 'red'}]} onPress={() => handleClose()}><ThemedText style={{color: 'red'}}>Close</ThemedText></TouchableOpacity>
              }
              <TouchableOpacity style={[styles.button, {borderColor: color}]} onPress={() => handleInvoice()}><ThemedText style={styles.LabelText}>Invoice</ThemedText></TouchableOpacity>
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
        <View style={styles.centeredView}>
          { isLoading ?
          <ActivityIndicator style={styles.loading} size="large" />
          :
          <ThemedSecondaryView style={[styles.card, {padding: 10}]}>
            <ThemedText style={[styles.name, {padding: 10}]}>Do you want to delete this job?</ThemedText>
            <View style={[styles.dataContainer, {padding: 10, justifyContent: 'space-evenly'}]}>
              <TouchableOpacity
                style={[styles.button, {borderColor: color}]}
                onPress={() => setModalVisible(!modalVisible)}>
                <ThemedText style={{color:'white', textAlign: 'center'}}>Cancel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, {borderColor: 'red'}]}
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
        <View style={styles.centeredView}>
          { isLoading ?
          <ActivityIndicator style={styles.loading} size="large" />
          :
          <ThemedSecondaryView style={[styles.card, {padding: 10}]}>
            <ThemedText style={[styles.name, {padding: 10, }]}>Did you finish this job?</ThemedText>
            <View style={[styles.dataContainer, {padding: 10, justifyContent: 'space-evenly'}]}>
              <TouchableOpacity
                style={[styles.button, {borderColor: color}]}
                onPress={() => setModalVisibleFinish(!modalVisibleFinish)}>
                <ThemedText style={{color:'white', textAlign: 'center'}}>No</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, {borderColor: 'red'}]}
                onPress={() => closeJob()}>
                <ThemedText style={{color:'red', textAlign: 'center'}}>Yes, close it</ThemedText>
              </TouchableOpacity>
            </View>
          </ThemedSecondaryView>
          }
        </View>
      </Modal>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
    card: {
      borderRadius: 10,
      marginHorizontal: 10,
      borderBottomWidth: 1,
      borderRightWidth: 1,
      shadowColor: "#fff",
      padding: 10,
      ...Platform.select({
        ios: {
          shadowOffset: { width: 2, height: 2 },
          shadowColor: "#fff",
          shadowOpacity: 0.3,
          shadowRadius: 4,
        },
        android: {
          elevation: 8,
        },
      }),
    },
    nameContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      width: "100%",
      borderBottomWidth: 1,
    },
    name: {
      fontSize: 20,
      fontWeight: "bold",
    },
    dataContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },    
    LabelText: {
      fontSize: 16,
      fontWeight: "bold",
    },  
    dataText: {
        fontSize: 12,
        color: "darkblue"
    }, 
    image: {
      width: 150, 
      height: 100,
      alignSelf: 'center',
      borderRadius: 15,
    },
    centeredView: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 22,
    },    
    button: {
      alignItems: 'center',
      justifyContent: 'center',
      height: 40,
      width: 100,
      borderRadius: 10,
      borderBottomWidth: 1,
      borderRightWidth: 1,
    },
    loading: {
      flex: 1,
      verticalAlign: 'middle'
    },
});