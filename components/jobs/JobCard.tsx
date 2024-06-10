import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform, Pressable, Linking, Image, Modal, Alert, ActivityIndicator } from "react-native";
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
  const {job, jobLoading} = useSelector((state: RootState) => state.job);
  const [imageError, setImageError] = useState(false);
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
    //dispatch(changeLoading(true));
    await axiosInstance
    .post(`jobs/delete/${id}/`, { action: 'delete'},
    { headers: {
      'content-Type': 'multipart/form-data',
    }})
    .then(function(response) {
      if (response.data.OK) {
        //dispatch(changeLoading(false));
        //dispatch(getJobs());
        router.push('/(app)/(jobs)');
        Alert.alert(response.data.message);
      }
    })
    .catch(function(error) {
        //dispatch(changeLoading(false));
        console.error('Error deleting a job:', error.message);
        Alert.alert(`Error deleting a job: ${error.message}`);
    });
  };

  const closeJob = async () => {
    //dispatch(changeLoading(true));
    await axiosInstance
    .post(`jobs/update/${id}/`, { action: 'close'},
    { headers: {
      'content-Type': 'multipart/form-data',
    }})
    .then(function(response) {
      if (response.data.OK) {
        //dispatch(changeLoading(false));
        /* dispatch(getJob(id)); */
        router.push('/(app)/(jobs)');
        Alert.alert(response.data.message);
      }
    })
    .catch(function(error) {
        //dispatch(changeLoading(false));
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
    let pickedClient = clients.find((pickedClient: { user: any; }) => pickedClient.user === client);
    dispatch(setClient(pickedClient));
    router.push('(app)/(jobs)/invoice');
  };

  return (
    <ThemedView style={[styles.card, {borderColor: color, backgroundColor:darkTheme ? darkSecondColor: lightSecondColor}]}>
        <View style={[styles.nameContainer, {borderBottomColor:darkTheme ? darkTtextColor: lightTextColor}]}>
            <ThemedText style={styles.name}>
            { inDetail ? 
            <ThemedText>{statusIcon(status)} - {client}</ThemedText>
            : 
            description
            }
            </ThemedText>
            <Pressable onPress={() => router.push('/(app)/(jobs)/jobUpdate')}><FontAwesome name="edit" color={darkTheme ? darkTtextColor: lightTextColor} size={30} /></Pressable>
        </View>
        { inDetail ?
        <View style={styles.dataContainer}>
            <ThemedText style={[styles.LabelText, {fontSize: 22, margin: 10}]}>{description}</ThemedText>
        </View>
        : null }
        <View style={styles.dataContainer}>
            <ThemedText style={styles.LabelText}>Address: </ThemedText>
            <Pressable onPress={() => Linking.openURL(`https://www.google.com/maps?q=${address}`)}><ThemedText style={[styles.dataText, {color:darkTheme ? darkTtextColor: lightTextColor}]}>{address}</ThemedText></Pressable>
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
        (<View>
          <View style={{textAlign: 'center'}}>
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
          <View style={[styles.dataContainer, { justifyContent: 'space-between'}]}>
            { (status === 'finished') ?
              (<ThemedText style={{color: 'red'}}>Closed</ThemedText>)
            :
              <Pressable style={{alignSelf: 'flex-start'}} onPress={() => handleClose()}><ThemedText style={{flex: 1, verticalAlign: 'middle', alignSelf: 'center', fontSize: 18, fontWeight: 'bold', color: 'red'}}><Ionicons name="close" color='red' size={30} /></ThemedText></Pressable>
            }
            <Pressable onPress={() => handleInvoice()}><ThemedText style={styles.LabelText}>Invoice</ThemedText></Pressable>
            <Pressable style={{alignSelf: 'flex-end'}} onPress={() => handleDelete()}><Ionicons name="trash" color='red' size={30} /></Pressable>
          </View>
        </View>)
        : null)
        } 
        <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          Alert.alert('Action canceled.');
          setModalVisible(!modalVisible);
        }}>
        <View style={styles.centeredView}>
          { jobLoading ?
          <ActivityIndicator style={styles.loading} size="large" />
          :
          <View style={[styles.card, {padding: 10, backgroundColor:darkTheme ? darkSecondColor: lightSecondColor}]}>
            <ThemedText style={[styles.name, {padding: 10}]}>Do you want to delete this job?</ThemedText>
            <View style={[styles.dataContainer, {padding: 10, justifyContent: 'space-evenly'}]}>
              <Pressable
                style={[styles.button, {marginHorizontal: 5, flex: 1, backgroundColor: color}]}
                onPress={() => setModalVisible(!modalVisible)}>
                <ThemedText style={{color:'white', textAlign: 'center'}}>Cancel</ThemedText>
              </Pressable>
              <Pressable
                style={[[styles.button, {backgroundColor: 'red', marginHorizontal: 5, flex: 1}]]}
                onPress={() => deleteJob()}>
                <ThemedText style={{color:'white', textAlign: 'center'}}>DELETE</ThemedText>
              </Pressable>
            </View>
          </View>
          }
        </View>
      </Modal>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisibleFinish}
        onRequestClose={() => {
          Alert.alert('Action canceled.');
          setModalVisibleFinish(!modalVisibleFinish);
        }}>
        <ThemedView style={styles.centeredView}>
          { jobLoading ?
          <ActivityIndicator style={styles.loading} size="large" />
          :
          <View style={[styles.card, {padding: 10, backgroundColor:darkTheme ? darkSecondColor: lightSecondColor}]}>
            <ThemedText style={[styles.name, {padding: 10, }]}>Did you finish this job?</ThemedText>
            <View style={[styles.dataContainer, {padding: 10, justifyContent: 'space-evenly'}]}>
              <Pressable
                style={[styles.button, {marginHorizontal: 5, flex: 1, backgroundColor: color}]}
                onPress={() => setModalVisibleFinish(!modalVisibleFinish)}>
                <ThemedText style={{color:'white', textAlign: 'center'}}>No</ThemedText>
              </Pressable>
              <Pressable
                style={[[styles.button, {backgroundColor: 'red', marginHorizontal: 5, flex: 1}]]}
                onPress={() => closeJob()}>
                <ThemedText style={{color:'white', textAlign: 'center'}}>Yes, close it</ThemedText>
              </Pressable>
            </View>
          </View>
          }
        </ThemedView>
      </Modal>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
    card: {
      borderRadius: 16,
      borderWidth: 2,
      marginHorizontal: 10,
      padding: 10,
      ...Platform.select({
        ios: {
          shadowOffset: { width: 2, height: 2 },
          shadowColor: "#333",
          shadowOpacity: 0.3,
          shadowRadius: 4,
        },
        android: {
          elevation: 5,
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
      borderRadius: 16,
      padding: 10,
      margin: 5,
      ...Platform.select({
        ios: {
        shadowOffset: { width: 2, height: 2 },
        shadowColor: "#333",
        shadowOpacity: 0.3,
        shadowRadius: 4,
        },
        android: {
        elevation: 5,
        },
      }),
    },
    loading: {
      flex: 1,
      verticalAlign: 'middle'
    },
});