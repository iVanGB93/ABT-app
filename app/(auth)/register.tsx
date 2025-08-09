import React, { useState } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Image,
} from 'react-native';
import { useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import { useAppDispatch, RootState } from '../(redux)/store';

import Ionicons from '@expo/vector-icons/Ionicons';
import { commonStyles } from '@/constants/commonStyles';
import CustomAlert from '@/constants/customAlert';
import axiosInstance from '@/axios';
import { authSetMessage, setCodeAndEmail } from '../(redux)/authSlice';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import {
  darkSecondColor,
  darkThirdColor,
  darkTextColor,
  darkTextSecondColor,
  lightMainColor,
  lightSecondColor,
  lightTextColor,
  version,
} from '@/settings';

interface Errors {
  email?: string;
}

export default function Register() {
  const { color, darkTheme } = useSelector((state: RootState) => state.settings);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [errors, setErrors] = useState<Errors>({});
  const [alertVisible, setAlertVisible] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const validateEmail = () => {
    let errors: Errors = {};
    if (!email) {
      errors.email = 'Email is required!';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Email is invalid!';
    }
    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (validateEmail()) {
      setLoading(true);
      await axiosInstance
        .post('user/register/', { action: 'email', email: email })
        .then(function (response) {
          if (response.status === 200) {
            dispatch(authSetMessage('Code sent, check your email!!!'));
            dispatch(setCodeAndEmail({ code: response.data.code, email: response.data.email }));
            router.navigate('/verifyCode');
          }
          if (response.status === 203) {
            setError(response.data.message);
            setAlertVisible(true);
            setLoading(false);
          }
        })
        .catch(function (error) {
          console.error('Error registering email:', error.response, error.message);
          if (typeof error.response === 'undefined') {
            setError(
              'A server/network error occurred. ' +
                'Sorry about this - try againg in a few minutes.',
            );
          } else {
            setError(error.message);
          }
          setAlertVisible(true);
          setLoading(false);
        });
    }
  };

  return (
    <ThemedView style={commonStyles.container}>
      <View style={commonStyles.header}>
        <Image style={commonStyles.imageCircle} source={require('../../assets/images/logo.png')} />
        <ThemedText type="title" style={commonStyles.text_header}>
          Start registering!
        </ThemedText>
        <ThemedText type="subtitle" style={commonStyles.sub_text_header}>
          Advance Business Tools
        </ThemedText>
      </View>
      <View
        style={[
          commonStyles.footerLeft,
          { backgroundColor: darkTheme ? darkSecondColor : lightSecondColor, borderColor: color },
        ]}
      >
        <ScrollView keyboardShouldPersistTaps="handled">
          <ThemedText style={commonStyles.text_action} type="subtitle">
            Email
          </ThemedText>
          <View
            style={[commonStyles.action, { borderBottomColor: darkTheme ? '#f2f2f2' : '#000' }]}
          >
            <Ionicons name="mail" color={darkTheme ? darkTextColor : lightTextColor} size={18} />
            <TextInput
              onChangeText={setEmail}
              placeholder="type your email..."
              placeholderTextColor={darkTheme ? darkTextSecondColor : lightTextColor}
              style={[
                commonStyles.textInput,
                { color: darkTheme ? darkTextColor : lightTextColor },
              ]}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            {!errors.email && email ? (
              <Ionicons name="checkmark-circle-outline" color={color} />
            ) : null}
          </View>
          {errors.email ? <Text style={commonStyles.errorMsg}>{errors.email}</Text> : null}
          {loading ? (
            <ActivityIndicator
              style={[commonStyles.loading, { marginTop: 50 }]}
              size="large"
              color={color}
            />
          ) : (
            <>
              <TouchableOpacity
                style={[
                  commonStyles.button,
                  {
                    borderColor: color,
                    marginTop: 50,
                    backgroundColor: darkTheme ? darkThirdColor : lightMainColor,
                  },
                ]}
                onPress={handleSubmit}
              >
                <ThemedText type="subtitle">Register</ThemedText>
              </TouchableOpacity>
              <View style={commonStyles.linkSection}>
                <ThemedText type="subtitle">Do you have an account? </ThemedText>
                <TouchableOpacity onPress={() => router.navigate('/login')}>
                  <ThemedText type="subtitle" style={{ color: color }}>
                    Login!!
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </>
          )}
        </ScrollView>
        <ThemedText style={{ position: 'absolute', bottom: 5, left: 5 }}>{version}</ThemedText>
      </View>
      <CustomAlert
        title="Registration"
        visible={alertVisible}
        message={error}
        onClose={() => setAlertVisible(false)}
      />
    </ThemedView>
  );
}
