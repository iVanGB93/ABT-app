import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { RootState } from '../app/(redux)/store';
import { useSelector } from "react-redux";

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';


interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
}

const CustomAlert: React.FC<CustomAlertProps> = ({ visible, title, message, onClose }) => {
    const {color} = useSelector((state: RootState) => state.settings);
    return (
        <Modal
        transparent={true}
        animationType="fade"
        visible={visible}
        onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <ThemedView style={[styles.alertBox, {borderColor: color}]}>
                    <ThemedText style={[styles.alertTitle, {borderBottomColor: color}]}>{title}</ThemedText>
                    <ThemedText style={styles.alertMessage}>{message}</ThemedText>
                    <TouchableOpacity style={[styles.okButton, {backgroundColor: color}]} onPress={onClose}>
                        <Text style={styles.okButtonText}>OK</Text>
                    </TouchableOpacity>
                </ThemedView>
            </View>
        </Modal>
  );
};

const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    alertBox: {
      width: 300,
      padding: 20,
      borderBottomWidth: 1,
      borderRightWidth: 1,
      borderRadius: 10,
      alignItems: 'center',
    },
    alertTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 10,
      borderBottomWidth: 1,
      width: '100%'
    },
    alertMessage: {
      fontSize: 16,
      marginBottom: 20,
    },
    okButton: {
      padding: 10,
      borderRadius: 10,
      width: 100,
    },
    okButtonText: {
      color: '#fff',
      fontSize: 16,
      textAlign: 'center',
    },
});
  
export default CustomAlert;