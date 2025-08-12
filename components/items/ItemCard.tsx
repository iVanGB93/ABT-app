import React from 'react';
import { View, Image } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { darkSecondColor, darkTextColor, lightSecondColor, lightTextColor } from '../../settings';
import { RootState } from '@/app/(redux)/store';
import { ThemedSecondaryView } from '../ThemedSecondaryView';
import { ThemedText } from '../ThemedText';
import { commonStylesCards } from '@/constants/commonStylesCard';
import { Ionicons } from '@expo/vector-icons';

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
  const { color, darkTheme } = useSelector((state: RootState) => state.settings);

  return (
    <ThemedSecondaryView style={[commonStylesCards.card, { borderColor: color, padding: 0 }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Image
          style={{
            width: 80,
            borderRadius: 10,

            height: '100%',
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,
            backgroundColor: '#eee',
          }}
          source={{ uri: image }}
        />
        <View style={{ flex: 1, paddingLeft: 5 }}>
          <ThemedText type="subtitle">{name}</ThemedText>
          <ThemedText type="default">{description ? description : 'no description'}</ThemedText>
          <ThemedText style={commonStylesCards.LabelText}>Price: ${price}</ThemedText>
        </View>
        <Ionicons name="chevron-forward" size={16} color={darkTheme ? '#666' : '#999'} />
      </View>
    </ThemedSecondaryView>
  );
}
