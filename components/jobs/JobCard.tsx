import React from 'react';
import {
  View,
} from 'react-native';
import { useSelector } from 'react-redux';
import { FontAwesome, Ionicons } from '@expo/vector-icons';

import { darkTextColor, lightTextColor } from '../../settings';
import { RootState } from '@/app/(redux)/store';
import { ThemedText } from '../ThemedText';
import { commonStylesCards } from '@/constants/commonStylesCard';
import { ThemedView } from '../ThemedView';
import { formatDate } from '@/utils/formatDate';
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
}

export default function JobCard({
  id,
  status,
  client,
  address,
  description,
  price,
  image,
  date,
  closed,
  inDetail,
  isList,
}: JobCardProps) {
  const { color, darkTheme } = useSelector((state: RootState) => state.settings);

  const statusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <FontAwesome name="clock-o" color="orange" size={20} />;
      case 'confirmed':
        return <FontAwesome name="check-circle" color="blue" size={20} />;
      case 'in_progress':
        return <FontAwesome name="wrench" color="orange" size={20} />;
      case 'on_hold':
        return <FontAwesome name="pause-circle" color="gray" size={20} />;
      case 'review':
        return <FontAwesome name="search" color="purple" size={20} />;
      case 'completed':
        return <Ionicons name="checkmark-done-sharp" color="green" size={20} />;
      case 'cancelled':
        return <FontAwesome name="times-circle" color="red" size={20} />;
      case 'invoiced':
        return <FontAwesome name="file-text" color="teal" size={20} />;
      case 'paid':
        return <FontAwesome name="money" color="green" size={20} />;
      default:
        return <FontAwesome name="question-circle" color="gray" size={20} />;
    }
  };

  return (
    <ThemedSecondaryView
      style={[
        commonStylesCards.card,
        { borderColor: color, shadowColor: darkTheme ? '#fff' : '#000', paddingHorizontal: 10 },
      ]}
    >
      <View
        style={[
          commonStylesCards.nameContainer,
          { borderBottomColor: darkTheme ? darkTextColor : lightTextColor },
        ]}
      >
        <ThemedText type='subtitle'>{description}</ThemedText>
        <ThemedText>{statusIcon(status)}</ThemedText>
      </View>
      { isList ?
      <View style={commonStylesCards.dataContainer}>
        <ThemedText>{client}</ThemedText>
      </View> : null}
      <View style={commonStylesCards.dataContainer}>
        <ThemedText style={commonStylesCards.dataText}>{formatDate(date)}</ThemedText>
        <ThemedText style={commonStylesCards.dataText}>${price}</ThemedText>
      </View>
    </ThemedSecondaryView>
  );
}
