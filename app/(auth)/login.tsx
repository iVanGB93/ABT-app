import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  View,
  TouchableOpacity,
  Text,
  TextInput,
  ActivityIndicator,
  Image,
  ScrollView,
} from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from '@react-navigation/native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ThemedSecondaryView } from '@/components/ThemedSecondaryView';
import { RootState, useAppDispatch } from '../(redux)/store';
import { authSuccess } from '../(redux)/authSlice';
import { commonStyles } from '@/constants/commonStyles';
import CustomAlert from '@/constants/customAlert';
import axiosInstance from '@/axios';
import {
  darkMainColor,
  darkSecondColor,
  darkThirdColor,
  darkTtextColor,
  darkTtextSecondColor,
  lightMainColor,
  lightSecondColor,
  lightTextColor,
  version,
} from '@/settings';

interface Errors {
  username?: string;
  password?: string;
}

export default function Login() {
  const { token } = useSelector((state: RootState) => state.auth);
  const { color, darkTheme } = useSelector((state: RootState) => state.settings);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [errors, setErrors] = useState<Errors>({});
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const theme = useTheme();

  const validateForm = () => {
    let errors: Errors = {};
    if (!username) errors.username = 'Username is required!';
    if (!password) errors.password = 'Password is required!';
    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      setLoading(true);
      await axiosInstance
        .post('token/', { username: username, password: password })
        .then(function (response) {
          if (response.data.access !== undefined) {
            dispatch(
              authSuccess({
                username: username,
                token: response.data.access,
                refreshToken: response.data.refresh,
              }),
            );
            setLoading(false);
            router.navigate('/(businessSelect)');
          } else {
            setError(response.data.message);
            setAlertVisible(true);
            setLoading(false);
          }
        })
        .catch(function (error) {
          console.error('Error logging in:', error.response, error.message);
          if (typeof error.response === 'undefined') {
            setError(
              'A server/network error occurred. ' +
                'Sorry about this - try againg in a few minutes.',
            );
          } else {
            if (error.response.status === 401) {
              setError('Username or Password incorrect');
            } else {
              setError(error.message);
            }
          }
          setAlertVisible(true);
          setLoading(false);
        });
    }
  };

  return token ? (
    <Redirect href={'/(businessSelect)'} />
  ) : (
    <ThemedView style={commonStyles.container}>
      <View style={commonStyles.header}>
        <Image style={commonStyles.imageCircle} source={require('../../assets/images/logo.png')} />
        <ThemedText type="title" style={commonStyles.text_header}>
          Welcome!
        </ThemedText>
        <ThemedText type="subtitle" style={commonStyles.sub_text_header}>
          Advance Business Tools
        </ThemedText>
      </View>
      <ThemedSecondaryView style={[commonStyles.footer, { borderColor: color }]}>
        <ScrollView keyboardShouldPersistTaps='handled'>
          <ThemedText style={commonStyles.text_action} type="subtitle">
            Username
          </ThemedText>
          <View
            style={[commonStyles.action, { borderBottomColor: darkTheme ? '#f2f2f2' : '#000' }]}
          >
            <Ionicons name="person" color={darkTheme ? darkTtextColor : lightTextColor} size={18} />
            <TextInput
              onChangeText={setUsername}
              value={username}
              placeholder="type your username..."
              placeholderTextColor={darkTheme ? darkTtextSecondColor : lightTextColor}
              style={[
                commonStyles.textInput,
                { color: darkTheme ? darkTtextColor : lightTextColor },
              ]}
              autoCapitalize="none"
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
              color={darkTheme ? darkTtextColor : lightTextColor}
              size={18}
            />
            <TextInput
              onChangeText={setPassword}
              value={password}
              placeholder="type your password..."
              placeholderTextColor={darkTheme ? darkTtextSecondColor : lightTextColor}
              secureTextEntry={secureTextEntry ? true : false}
              style={[
                commonStyles.textInput,
                { color: darkTheme ? darkTtextColor : lightTextColor },
              ]}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setSecureTextEntry(!secureTextEntry)}>
              {secureTextEntry ? (
                <Ionicons
                  size={20}
                  name="eye-off-outline"
                  color={darkTheme ? darkTtextColor : lightTextColor}
                />
              ) : (
                <Ionicons
                  size={20}
                  name="eye-outline"
                  color={darkTheme ? darkTtextColor : lightTextColor}
                />
              )}
            </TouchableOpacity>
          </View>
          {errors.password ? <Text style={commonStyles.errorMsg}>{errors.password}</Text> : null}
          {loading ? (
            <ActivityIndicator style={commonStyles.loading} size="large" color={color} />
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
                <ThemedText type="subtitle" style={{ color: color }}>
                  Login
                </ThemedText>
              </TouchableOpacity>
              <View style={commonStyles.linkSection}>
                <ThemedText type="subtitle">I'm new, </ThemedText>
                <TouchableOpacity onPress={() => router.navigate('/register')}>
                  <ThemedText type="subtitle" style={{ color: color }}>
                    {' '}
                    create account!!
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </>
          )}
        </ScrollView>
        <ThemedText style={{ position: 'absolute', bottom: 5, right: 5 }}>{version}</ThemedText>
      </ThemedSecondaryView>
      <CustomAlert
        title="Login error"
        visible={alertVisible}
        message={error}
        onClose={() => setAlertVisible(false)}
      />
    </ThemedView>
  );
}
