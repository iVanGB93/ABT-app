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
import Toast from 'react-native-toast-message';

import {
  baseImageURL,
  darkSecondColor,
  darkTtextColor,
  lightSecondColor,
  lightTextColor,
} from '@/settings';
import axiosInstance from '@/axios';
import { RootState, useAppDispatch } from '@/app/(redux)/store';
import { useRouter } from 'expo-router';
import { ThemedView } from '../ThemedView';
import { ThemedText } from '../ThemedText';
import { ThemedSecondaryView } from '../ThemedSecondaryView';
import { commonStylesCards } from '@/constants/commonStylesCard';

function formatDate(dateString: string) {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

interface ItemCardProps {
  id: any;
  description: any;
  amount: any;
  date: any;
  image: any;
  category?: any;
  income?: boolean;
  inDetail?: boolean;
  deductible?: any;
}

export default function ExtrasCard({
  id,
  description,
  amount,
  date,
  income = false,
  image,
  category = '',
  inDetail = false,
  deductible = false,
}: ItemCardProps) {
  const { color, darkTheme, business } = useSelector((state: RootState) => state.settings);
  const [modalVisible, setModalVisible] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isBig, setIsBig] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const toggleImageSize = () => {
    setIsBig((prev) => !prev);
  };

  const handleDelete = () => {
    setModalVisible(true);
  };

  const deleteExtra = async () => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append('action', 'delete');
    formData.append('type', income ? 'income' : 'expense');
    formData.append('id', id);
    await axiosInstance
      .post(`business/extras/${business.name}/`, formData, {
        headers: {
          'content-Type': 'multipart/form-data',
        },
      })
      .then(function (response) {
        if (response.data) {
          Toast.show({
            type: 'success',
            text1: 'Success',
            text2: 'Extra deleted successfully',
          });
          router.replace('/(app)/(business)/businessDetails');
        } else {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: response.data.message,
          });
        }
        setIsLoading(false);
      })
      .catch(function (error) {
        console.error('Error deleting extra:', error);
        if (typeof error.response === 'undefined') {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2:
              'A server/network error occurred. Sorry about this - try again in a few minutes.',
          });
        } else {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: error.message,
          });
        }
        setIsLoading(false);
      });
  };

  return (
    <ThemedSecondaryView style={[commonStylesCards.card, { borderColor: color }]}>
      <View
        style={[
          commonStylesCards.nameContainer,
          { borderBottomColor: darkTheme ? darkTtextColor : lightTextColor },
        ]}
      >
        <ThemedText style={[commonStylesCards.name, { paddingLeft: 10 }]}>{description}</ThemedText>
      </View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          width: '100%',
          justifyContent: 'space-between',
          paddingHorizontal: 10,
        }}
      >
        <ThemedText style={[commonStylesCards.name, { flexShrink: 0 }]}>
          {formatDate(date)}
        </ThemedText>
        <ThemedText
          style={{
            flex: 1,
            textAlign: 'center',
            color: darkTheme ? darkTtextColor : lightTextColor,
            fontWeight: 'bold',
            letterSpacing: 2,
            fontSize: 18,
            includeFontPadding: false,
          }}
          numberOfLines={1}
          ellipsizeMode="clip"
        >
          {'.'.repeat(50)}
        </ThemedText>
        <ThemedText
          style={[
            commonStylesCards.name,
            { textAlign: 'right', flexShrink: 0, color: income ? 'green' : 'red' },
          ]}
        >
          $ {amount}
        </ThemedText>
      </View>
      {inDetail ? (
        <> 
          {income ? null : (
            <>
              <ThemedText style={{ alignSelf: 'flex-end' }} type="subtitle">{category}</ThemedText>
              {deductible ? <ThemedText style={{ alignSelf: 'flex-end' }} >Deductible</ThemedText> : null}
            </>
          )}
          <View style={{ alignContent: 'center', margin: 10 }}>
            {imageError ? (
              <ThemedText style={[commonStylesCards.LabelText, { alignSelf: 'center' }]}>
                image not found{' '}
              </ThemedText>
            ) : (
              <TouchableOpacity onPress={toggleImageSize}>
                <Image
                  style={commonStylesCards.imageJob}
                  source={{ uri: image }}
                  onError={() => setImageError(true)}
                />
              </TouchableOpacity>
            )}
          </View>
          <View style={[commonStylesCards.dataContainer, { justifyContent: 'space-evenly' }]}>
            <Pressable
              onPress={() =>
                router.navigate({
                  pathname: income
                    ? '/(app)/(business)/businessIncomeUpdate'
                    : '/(app)/(business)/businessExpenseUpdate',
                  params: { id: id },
                })
              }
            >
              <FontAwesome
                name="edit"
                color={darkTheme ? darkTtextColor : lightTextColor}
                size={30}
              />
            </Pressable>
            <Pressable onPress={() => handleDelete()}>
              <Ionicons name="trash" color="red" size={30} />
            </Pressable>
          </View>
        </>
      ) : null}
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
                Do you want to delete {description}?
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
                  onPress={() => deleteExtra()}
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
