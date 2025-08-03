import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  Pressable,
  Image,
  ActivityIndicator,
  Modal,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';

import {
  baseImageURL,
  darkSecondColor,
  darkTextColor,
  lightSecondColor,
  lightTextColor,
} from '../../settings';
import axiosInstance from '@/axios';
import { RootState, useAppDispatch } from '@/app/(redux)/store';
import { useRouter } from 'expo-router';
import { ThemedView } from '../ThemedView';
import { ThemedText } from '../ThemedText';
import { ThemedSecondaryView } from '../ThemedSecondaryView';
import { setItemMessage } from '@/app/(redux)/itemSlice';
import { commonStylesCards } from '@/constants/commonStylesCard';

interface ItemCardProps {
  image: any;
  id: any;
  name: any;
  description: any;
  amount: any;
  price: any;
  date: any;
  inDetail?: boolean;
}

export default function ItemCard({
  image,
  id,
  name,
  description,
  amount,
  price,
  date,
  inDetail,
}: ItemCardProps) {
  const { color, darkTheme, business } = useSelector((state: RootState) => state.settings);
  const [modalVisible, setModalVisible] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isBig, setIsBig] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const deleteItem = async () => {
    setIsLoading(true);
    await axiosInstance
      .post(
        `items/delete/${business.name}/`,
        { action: 'delete', id: id },
        {
          headers: {
            'content-Type': 'multipart/form-data',
          },
        },
      )
      .then(function (response) {
        if (response.data.OK) {
          dispatch(setItemMessage(response.data.message));
          setIsLoading(false);
          router.push('/(app)/(items)');
        }
      })
      .catch(function (error) {
        console.error('Error deleting a client:', error);
        setIsLoading(false);
      });
  };

  const handleDelete = () => {
    setModalVisible(true);
  };

  const toggleImageSize = () => {
    setIsBig((prev) => !prev);
  };

  return (
    <ThemedSecondaryView style={[commonStylesCards.card, { borderColor: color }]}>
      <View
        style={[
          commonStylesCards.nameContainer,
          { borderBottomColor: darkTheme ? darkTextColor : lightTextColor },
        ]}
      >
        <ThemedText style={[commonStylesCards.name, { paddingLeft: 10 }]}>{name}</ThemedText>
        <ThemedText style={commonStylesCards.name}>Stock: {amount}</ThemedText>
      </View>
      <View style={commonStylesCards.dataContainer}>
        <View style={commonStylesCards.dataContainer}>
          {imageError ? (
            <ThemedText style={[commonStylesCards.LabelText, { alignSelf: 'center' }]}>
              image not found{' '}
            </ThemedText>
          ) : (
            <Pressable onPress={toggleImageSize}>
              <Image
                style={commonStylesCards.imageJob}
                source={{ uri: image }}
                onError={() => setImageError(true)}
              />
            </Pressable>
          )}
        </View>
        <View style={{ flex: 1, paddingLeft: 5 }}>
          <ThemedText style={[commonStylesCards.name, { textAlign: 'left' }]}>
            {description ? description : 'no description'}
          </ThemedText>
          <ThemedText style={commonStylesCards.LabelText}>Price: ${price}</ThemedText>
          {inDetail ? (
            <View style={[commonStylesCards.dataContainer, { justifyContent: 'space-evenly' }]}>
              <Pressable onPress={() => router.push('/(app)/(items)/itemUpdate')}>
                <FontAwesome
                  name="edit"
                  color={darkTheme ? darkTextColor : lightTextColor}
                  size={30}
                />
              </Pressable>
              <Pressable onPress={() => handleDelete()}>
                <Ionicons name="trash" color="red" size={30} />
              </Pressable>
            </View>
          ) : null}
        </View>
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={commonStylesCards.centeredView}>
          {isLoading ? (
            <ActivityIndicator style={commonStylesCards.loading} size="large" />
          ) : (
            <ThemedSecondaryView style={[commonStylesCards.card, { padding: 10 }]}>
              <ThemedText style={[commonStylesCards.name, { padding: 10 }]}>
                Do you want to delete {name}?
              </ThemedText>
              <View
                style={[
                  commonStylesCards.dataContainer,
                  { padding: 10, justifyContent: 'space-evenly' },
                ]}
              >
                <TouchableOpacity
                  style={[commonStylesCards.button, { borderColor: color }]}
                  onPress={() => setModalVisible(!modalVisible)}
                >
                  <Text style={{ color: 'white', textAlign: 'center' }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[commonStylesCards.button, { borderColor: 'red' }]}
                  onPress={() => deleteItem()}
                >
                  <Text style={{ color: 'red', textAlign: 'center' }}>DELETE</Text>
                </TouchableOpacity>
              </View>
            </ThemedSecondaryView>
          )}
        </View>
      </Modal>
      <Modal transparent={true} animationType="fade" visible={isBig}>
        <View style={commonStylesCards.modalContainer}>
          <TouchableOpacity onPress={toggleImageSize} style={commonStylesCards.expandedImage}>
            <Image source={{ uri: image }} style={commonStylesCards.expandedImage} />
          </TouchableOpacity>
          <Pressable
            style={[commonStylesCards.button, { marginHorizontal: 5, flex: 1 }]}
            onPress={() => setIsBig(!isBig)}
          >
            <Text style={{ color: 'white', textAlign: 'center', fontSize: 20 }}>Close</Text>
          </Pressable>
        </View>
      </Modal>
    </ThemedSecondaryView>
  );
}
