import React from 'react';
import { View, Image } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { darkSecondColor, darkTextColor, lightSecondColor, lightTextColor } from '../../settings';
import { RootState } from '@/app/(redux)/store';
import { ThemedView } from '../ThemedView';
import { ThemedText } from '../ThemedText';
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
  const { color, darkTheme } = useSelector((state: RootState) => state.settings);

  return (
    <ThemedView style={[commonStylesCards.card, { borderColor: color, padding: 0 }]}>
      <View
        style={[
          commonStylesCards.nameContainer,
          { borderBottomColor: darkTheme ? darkTextColor : lightTextColor },
        ]}
      >
        <View style={commonStylesCards.dataContainer}>
          <Image
            style={[
              commonStylesCards.imageJob,
              {
                width: 80,
                height: 64,
                borderTopRightRadius: 0,
                borderBottomRightRadius: 0,
                backgroundColor: '#eee',
              },
            ]}
            source={{ uri: image }}
          />
        </View>
        <View style={{ flex: 1, paddingLeft: 5 }}>
          <ThemedText type="subtitle">{name}</ThemedText>
          <ThemedText type="default">{description ? description : 'no description'}</ThemedText>
          <ThemedText style={commonStylesCards.LabelText}>Price: ${price}</ThemedText>
        </View>
      </View>
    </ThemedView>
  );
}
