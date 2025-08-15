import React from 'react';
import { View, Image } from 'react-native';
import { useSelector } from 'react-redux';

import { ThemedText } from '@/components/ThemedText';
import { RootState} from '@/app/(redux)/store';
import { ThemedSecondaryView } from '../ThemedSecondaryView';
import { commonStylesCards } from '@/constants/commonStylesCard';
import { Ionicons } from '@expo/vector-icons';

interface ClientCardProps {
  image: any;
  name: any;
  last_name: any;
}

export default function ClientCard({ image, name, last_name }: ClientCardProps) {
  const { color, darkTheme } = useSelector((state: RootState) => state.settings);

  return (
    <ThemedSecondaryView
      style={[
        commonStylesCards.card,
        { borderColor: color, shadowColor: darkTheme ? '#fff' : '#000' },
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {image ? (
          <Image style={{ width: 40, height: 40, borderRadius: 75 }} source={{ uri: image }} />
        ) : (
          <View style={{ 
            width: 40, 
            height: 40, 
            borderRadius: 75, 
            backgroundColor: darkTheme ? '#444' : '#ddd',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <Ionicons name="person" size={20} color={darkTheme ? '#888' : '#666'} />
          </View>
        )}
        <View style={{ flex: 1, marginLeft: 10 }}>
          <ThemedText type="subtitle">
            {name} {last_name ? last_name : ''}{' '}
          </ThemedText>
        </View>
        <Ionicons name="chevron-forward" size={16} color={darkTheme ? '#666' : '#999'} />
      </View>
    </ThemedSecondaryView>
  );
}
