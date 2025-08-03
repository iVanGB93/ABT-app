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
import { useRouter, usePathname } from 'expo-router';
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
} from '@/settings';

interface Errors {
  username?: string;
  password?: string;
}

export default function UsernameAndPassword() {
  const { userEmail, token } = useSelector((state: RootState) => state.auth);
  const { color, darkTheme } = useSelector((state: RootState) => state.settings);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [errors, setErrors] = useState<Errors>({});
  const [alertVisible, setAlertVisible] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (token) {
      router.replace('/(businessSelect)');
    }
  }, [token]);

  const validateForm = () => {
    let errors: Errors = {};
    if (!username) errors.username = 'Username is required!';
    if (password.length < 8) errors.password = 'Password must be at least 8 characters!';
    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      setLoading(true);
      await axiosInstance
        .post('user/register/', {
          username: username,
          password: password,
          email: userEmail,
          action: 'new',
        })
        .then(function (response) {
          if (response.status === 201) {
            dispatch(authSetMessage('Account created, please login!'));
            dispatch(setCodeAndEmail({ code: null, email: null }));
            router.replace('/');
          }
          if (response.status === 203) {
            setError(response.data.message);
            setAlertVisible(true);
            setLoading(false);
          }
        })
        .catch(function (error) {
          console.error('Error registering:', error.response, error.message);
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
          Account details!
        </ThemedText>
        <ThemedText type="subtitle" style={commonStyles.sub_text_header}>
          Advance Business Tools
        </ThemedText>
      </View>
      <View
        style={[
          commonStyles.footer,
          { backgroundColor: darkTheme ? darkSecondColor : lightSecondColor, borderColor: color },
        ]}
      >
        <ScrollView keyboardShouldPersistTaps="handled">
          <ThemedText style={commonStyles.text_action} type="subtitle">
            Create your username and password
          </ThemedText>
          <ThemedText style={commonStyles.text_action} type="subtitle">
            User
          </ThemedText>
          <View
            style={[commonStyles.action, { borderBottomColor: darkTheme ? '#f2f2f2' : '#000' }]}
          >
            <Ionicons name="person" color={darkTheme ? darkTextColor : lightTextColor} size={18} />
            <TextInput
              onChangeText={text => setUsername(text.replace(/\s+$/, ''))}
              value={username}
              placeholder="type your username..."
              placeholderTextColor={darkTheme ? darkTextSecondColor : lightTextColor}
              style={[
                commonStyles.textInput,
                { color: darkTheme ? darkTextColor : lightTextColor },
              ]}
            />
            {username ? <Ionicons name="checkmark-circle-outline" color={color} /> : null}
          </View>
          {errors.username ? <Text style={commonStyles.errorMsg}>{errors.username}</Text> : null}
          <ThemedText style={commonStyles.text_action} type="subtitle">
            Password
          </ThemedText>
          <View
            style={[commonStyles.action, { borderBottomColor: darkTheme ? '#f2f2f2' : '#000' }]}
          >
            <Ionicons
              name="lock-closed"
              color={darkTheme ? darkTextColor : lightTextColor}
              size={18}
            />
            <TextInput
              onChangeText={setPassword}
              placeholder="type your password..."
              placeholderTextColor={darkTheme ? darkTextSecondColor : lightTextColor}
              secureTextEntry={secureTextEntry ? true : false}
              style={[
                commonStyles.textInput,
                { color: darkTheme ? darkTextColor : lightTextColor },
              ]}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setSecureTextEntry(!secureTextEntry)}>
              {secureTextEntry ? (
                <Ionicons
                  size={20}
                  name="eye-off-outline"
                  color={darkTheme ? darkTextColor : lightTextColor}
                />
              ) : (
                <Ionicons
                  size={20}
                  name="eye-outline"
                  color={darkTheme ? darkTextColor : lightTextColor}
                />
              )}
            </TouchableOpacity>
          </View>
          {errors.password ? <Text style={commonStyles.errorMsg}>{errors.password}</Text> : null}
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
                <ThemedText type="subtitle">Save</ThemedText>
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
