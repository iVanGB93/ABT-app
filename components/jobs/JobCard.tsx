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
    if (status === 'active') {
      return <FontAwesome name="wrench" color="orange" size={20} />;
    } else if (status === 'new') {
      return <FontAwesome style={{ color: 'red', fontSize: 20 }} name="exclamation" />;
    } else {
      return <Ionicons style={{ color: 'green', fontSize: 20 }} name="checkmark-done-sharp" />;
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
