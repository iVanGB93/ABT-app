import {
  View,
  Text,
  Image,
  ActivityIndicator,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { useState } from 'react';
import { useSelector } from 'react-redux';

import { darkTextColor, lightTextColor } from '@/settings';
import { RootState, useAppDispatch } from '@/app/(redux)/store';
import { ThemedText } from '../ThemedText';
import { useRouter } from 'expo-router';
import { ThemedSecondaryView } from '../ThemedSecondaryView';
import { commonStylesCards } from '@/constants/commonStylesCard';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '../ThemedView';
import { formatDate } from '@/utils/formatDate';
import { useJobSpentActions } from '@/hooks/useJobs';
import { useItemActions } from '@/hooks/useItems';

interface SpentCardProps {
  image: any;
  id: any;
  name?: any;
  description: any;
  price: any;
  date: any;
}

export default function SpentCard({ image, id, name, description, price, date }: SpentCardProps) {
  const { color, darkTheme } = useSelector((state: RootState) => state.settings);
  const [modalVisible, setModalVisible] = useState(false);
  const spents = useSelector((state: RootState) => state.item.usedItems);
  const [isBig, setIsBig] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const { deleteSpent } = useJobSpentActions();
  const { deleteItem } = useItemActions();

  const handleDelete = () => {
    setModalVisible(true);
  };

  const handleConfirmedDelete = async () => {
    setIsLoading(true);
    setModalVisible(false);
    let success;
    if (name) {
      console.log('Deleting item:', id);
      success = await deleteItem(id);
    } else {
      success = await deleteSpent(id);
    }
    if (success) {
      router.push('/(app)/(jobs)/jobDetails');
    } else {
      console.error('Error deleting spent');
    }
    setIsLoading(false);
  };

  const toggleImageSize = () => {
    setIsBig((prev) => !prev);
  };

  return (
    <ThemedView
      style={[
        commonStylesCards.card,
        { borderColor: color, shadowColor: darkTheme ? '#fff' : '#000', padding: 0 },
      ]}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          borderBottomColor: darkTheme ? darkTextColor : lightTextColor,
        }}
      >
        <TouchableOpacity onPress={toggleImageSize} style={{ marginRight: 12 }}>
          <Image
            style={[
              commonStylesCards.imageJob,
              { width: 80, height: 64, borderTopRightRadius: 0, borderBottomRightRadius: 0, backgroundColor: '#eee' },
            ]}
            source={{ uri: image }}
          />
        </TouchableOpacity>
        <TouchableOpacity onLongPress={() => handleDelete()}>
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <ThemedText style={commonStylesCards.name}>{name ? name : description}</ThemedText>
            <ThemedText style={commonStylesCards.LabelText}>Price: ${price}</ThemedText>
            <ThemedText style={commonStylesCards.LabelText}>{formatDate(date)}</ThemedText>
          </View>
        </TouchableOpacity>
      </View>
      {/* <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'flex-end' }}>
      <Pressable onPress={handleDelete} style={{ alignSelf: 'flex-end' }}>
        <Ionicons name="trash-outline" color="red" size={30} />
      </Pressable>
    </View> */}
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
                Do you want to delete this spent?
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
                  <ThemedText>No</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[commonStylesCards.button, { borderColor: 'red' }]}
                  onPress={() => handleConfirmedDelete()}
                >
                  <ThemedText style={{ color: 'red', textAlign: 'center' }}>Delete</ThemedText>
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
          <TouchableOpacity
            style={[commonStylesCards.button, { marginHorizontal: 5, flex: 1 }]}
            onPress={() => setIsBig(!isBig)}
          >
            <Text style={{ color: 'white', textAlign: 'center', fontSize: 20 }}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </ThemedView>
  );
}
