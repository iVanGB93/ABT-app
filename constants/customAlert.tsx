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
                <View style={[styles.alertBox, {borderColor: color}]}>
                    <Text style={styles.alertTitle}>{title}</Text>
                    <Text style={styles.alertMessage}>{message}</Text>
                    <TouchableOpacity style={[styles.okButton, {backgroundColor: color}]} onPress={onClose}>
                        <Text style={styles.okButtonText}>OK</Text>
                    </TouchableOpacity>
                </View>
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
      borderWidth: 1,
      borderRadius: 10,
      alignItems: 'center',
      backgroundColor: '#f5f5f5',
    },
    alertTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 10,
      borderBottomColor: 'black',
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