import React, { useState, useEffect } from 'react';
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
import Toast from 'react-native-toast-message';

import Ionicons from '@expo/vector-icons/Ionicons';
import { commonStyles } from '@/constants/commonStyles';
import CustomAlert from '@/constants/customAlert';
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
} from '@/settings';
import { authSetMessage, setCodeAndEmail } from '../(redux)/authSlice';

interface Errors {
  code?: string;
}

export default function VerifyCode() {
  const { code, userEmail, authMessage, token } = useSelector((state: RootState) => state.auth);
  const { color, darkTheme } = useSelector((state: RootState) => state.settings);
  const [stateCode, setStateCode] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [errors, setErrors] = useState<Errors>({});
  const [alertVisible, setAlertVisible] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();

  useEffect(() => {
    if (token) {
      router.replace('/(businessSelect)');
    }
  }, [token]);

  useEffect(() => {
    if (!code) {
      router.navigate('/');
    }
    if (authMessage) {
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: authMessage,
      });
      dispatch(authSetMessage(null));
    }
  }, [authMessage]);

  const validateForm = () => {
    let errors: Errors = {};
    if (!stateCode) errors.code = 'Code is required!';
    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      setLoading(true);
      if (code) {
        if (stateCode === code.toString()) {
          dispatch(setCodeAndEmail({ code: null, email: userEmail }));
          router.navigate('./usernameAndPassword');
        } else {
          setError('Code is incorrect');
          setAlertVisible(true);
          setLoading(false);
        }
      }
    }
  };

  return (
    <ThemedView style={commonStyles.container}>
      <View style={commonStyles.header}>
        <Image style={commonStyles.imageCircle} source={require('../../assets/images/logo.png')} />
        <ThemedText type="title" style={commonStyles.text_header}>
          Confirm your email!
        </ThemedText>
        <ThemedText type="subtitle" style={commonStyles.sub_text_header}>
          Advance Business Tools
        </ThemedText>
      </View>
      <View
        style={[
          commonStyles.footerMiddle,
          { backgroundColor: darkTheme ? darkSecondColor : lightSecondColor, borderColor: color },
        ]}
      >
        <ScrollView keyboardShouldPersistTaps="handled">
          <ThemedText style={commonStyles.text_action} type="subtitle">
            {userEmail}
          </ThemedText>
          <ThemedText style={commonStyles.text_action} type="subtitle">
            Code
          </ThemedText>
          <View
            style={[commonStyles.action, { borderBottomColor: darkTheme ? '#f2f2f2' : '#000' }]}
          >
            <Ionicons
              name="mail-open-outline"
              color={darkTheme ? darkTextColor : lightTextColor}
              size={18}
            />
            <TextInput
              onChangeText={setStateCode}
              placeholder="type the code sent to your email..."
              placeholderTextColor={darkTheme ? darkTextSecondColor : lightTextColor}
              style={[
                commonStyles.textInput,
                { color: darkTheme ? darkTextColor : lightTextColor },
              ]}
              keyboardType="numeric"
            />
            {!errors.code && stateCode ? (
              <Ionicons name="checkmark-circle-outline" color={color} />
            ) : null}
          </View>
          {errors.code ? <Text style={commonStyles.errorMsg}>{errors.code}</Text> : null}
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
                <ThemedText type="subtitle">Validate</ThemedText>
              </TouchableOpacity>
              <View style={commonStyles.linkSection}>
                <ThemedText type="subtitle">Cancel and </ThemedText>
                <TouchableOpacity onPress={() => router.push('/')}>
                  <ThemedText type="subtitle" style={{ color: color }}>
                    Login!!
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </>
          )}
        </ScrollView>
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
