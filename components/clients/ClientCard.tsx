import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform, Pressable, Linking, Image, ActivityIndicator, Modal, Alert } from "react-native";
import { useDispatch, useSelector } from 'react-redux';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { baseImageURL } from "@/settings";
import axiosInstance from "../../axios";
import { setClient } from '../../app/(redux)/clientSlice';
import { darkMainColor, darkSecondColor, darkTtextColor, lightMainColor, lightSecondColor, lightTextColor } from '../../settings';
import { RootState, useAppDispatch } from '@/app/(redux)/store';
import { FontAwesome } from '@expo/vector-icons';


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
  const router = useRouter();

  const deleteClient = async () => {
    setLoading(true);
    await axiosInstance
    .post(`clients/delete/${id}/`, { action: 'delete'},
    { headers: {
      'content-Type': 'multipart/form-data',
    }})
    .then(function(response) {
      if (response.data.OK) {
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

  return (
    <View style={[styles.card, {borderColor: color, backgroundColor:darkTheme ? darkSecondColor: lightSecondColor}]}>
      <View style={[styles.nameContainer, {borderBottomColor:darkTheme ? darkTtextColor: lightTextColor}]}>
          <Text style={[styles.name, {color:darkTheme ? darkTtextColor: lightTextColor}]}>{name} {last_name ? last_name  : null}</Text>
          { inDetail ?
          <Pressable onPress={() => router.push('/(app)/(clients)/clientUpdate')}><FontAwesome name="edit" color={darkTheme ? darkTtextColor: lightTextColor} size={30} /></Pressable>
          :
          <Image 
          style={{width: 30, height: 30, borderRadius: 75}} 
          source={{ uri: imageObj }}
          onError={() => setImageError(true)}
          />
          }
      </View>
      <View style={styles.dataContainer}>
          <Text style={[styles.LabelText, {color:darkTheme ? darkTtextColor: lightTextColor}]}>Address: </Text>
          <Pressable onPress={() => Linking.openURL(`https://www.google.com/maps?q=${address}`)}><ThemedText type='link'>{address ? address : 'No address saved'}</ThemedText></Pressable>
      </View>
      <View style={styles.dataContainer}>
          <Text style={[styles.LabelText, {color:darkTheme ? darkTtextColor: lightTextColor}]}>Phone: </Text>
          <Pressable onPress={() => Linking.openURL(`tel:${phone}`)}><ThemedText type='link'>{phone ? phone : 'No phone saved'}</ThemedText></Pressable>
      </View>
      <View style={styles.dataContainer}>
          <Text style={[styles.LabelText, {color:darkTheme ? darkTtextColor: lightTextColor}]}>Email: </Text>
          <Pressable onPress={() => Linking.openURL(`mailto:${email}`)}><ThemedText type='link'>{email ? email : 'No email saved'}</ThemedText></Pressable>
      </View>
      {inDetail ?
      <View style={styles.dataContainer}>
        <View style={{width:30}}></View>
        {imageError ?
        <ThemedText style={[styles.LabelText, { alignSelf: 'center'}]}>image not found </ThemedText>
        :
        <Image 
        style={styles.image} 
        source={{ uri: imageObj }}
        onError={() => setImageError(true)}
        />
        }
        <Pressable style={{alignSelf: 'flex-end', width:30}} onPress={() => handleDelete()}><Ionicons name="trash" color='red' size={30} /></Pressable>
      </View>
      : null}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(!modalVisible)}
      >
        <View style={styles.centeredView}>
          { loading ?
          <ActivityIndicator color={color} size="large" />
          :
          <View style={[styles.card, {padding: 10, backgroundColor: darkMainColor}]}>
            <ThemedText style={[styles.name, {padding: 10}]}>Do you want to delete {name}?</ThemedText>
            <View style={[styles.dataContainer, {padding: 10, justifyContent: 'space-evenly'}]}>
              <Pressable
                style={[styles.button, {marginHorizontal: 5, flex: 1, backgroundColor: color}]}
                onPress={() => setModalVisible(!modalVisible)}>
                <Text style={{color:'white', textAlign: 'center'}}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[[styles.button, {backgroundColor: 'red', marginHorizontal: 5, flex: 1}]]}
                onPress={() => deleteClient()}>
                <Text style={{color:'white', textAlign: 'center'}}>DELETE</Text>
              </Pressable>
            </View>
          </View>
          }
        </View>
      </Modal>
    </View>
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
      fontSize: 14,
  },
  image: {
    width: 100, 
    height: 100,
    alignSelf: 'center',
    borderRadius: 75,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },    
  button: {
    backgroundColor: '#694fad',
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