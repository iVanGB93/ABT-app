import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { View, TouchableOpacity, Text, TextInput, StyleSheet, Platform, ActivityIndicator, StatusBar, Image, ScrollView } from "react-native";
import { Link, Redirect, useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as SplashScreen from 'expo-splash-screen';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { RootState, useAppDispatch } from "./(redux)/store";
import { authSuccess } from "./(redux)/authSlice";
import {commonStyles} from '@/constants/commonStyles';
import CustomAlert from '@/constants/customAlert';
import axiosInstance from "@/axios";
import { darkSecondColor, darkTtextColor, lightSecondColor, lightTextColor } from "@/settings";
import { ThemedSecondaryView } from "@/components/ThemedSecondaryView";
import { useTheme } from '@react-navigation/native';
import { setDarkTheme } from "./(redux)/settingSlice";


SplashScreen.preventAutoHideAsync();

interface Errors {
  username?: string;
  password?: string;
}

export default function Login() {
  const {token} = useSelector((state: RootState) => state.auth);
  const {color, darkTheme} = useSelector((state: RootState) => state.settings);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [errors, setErrors] = useState<Errors>({});
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const theme = useTheme()

  useEffect(() => {
    if (theme.dark) {
        dispatch(setDarkTheme(true));
    } else {
      dispatch(setDarkTheme(false));
    }
    SplashScreen.hideAsync();
  }, []);

  /* useEffect(() => {
    setTimeout(() => {
      setLoading(false);
      SplashScreen.hideAsync();
    }, 1000);
    if (token != null) {
      router.push('/(app)/(clients)');
    }
  }, [token]); */

  const validateForm = () => {
    let errors: Errors = {};
    if (!username) errors.username = "Username is required!";
    if (!password) errors.password = "Password is required!";
    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      setLoading(true);
      await axiosInstance
      .post("token/", {username: username, password: password})
      .then(function(response) {
          if (response.data.access !== undefined) {
            dispatch(authSuccess({username: username, token: response.data.access, refreshToken: response.data.refresh}));
            router.push('(app)/(clients)');
          } else {
            setError(response.data.message);
            setLoading(false);
            setAlertVisible(true);
          }
      })
      .catch(function(error) {
          console.error('Error logging in:', error.response, error.message);
          if (typeof error.response === 'undefined') {
            setError("Error logging in, undefinded");
            setLoading(false);
          } else {
            if (error.response.status === 401) {
              setError("Username or Password incorrect");
              setLoading(false);
              setAlertVisible(true);
            } else {
              setError(error.message);
              setLoading(false);
              setAlertVisible(true);
            };
          };
      });
    }
  };

  return (
    token ? (
      <Redirect href={'/(app)/(clients)'}/>
    ) : (
    <ThemedView style={commonStyles.container}>
      <View style={commonStyles.header}>
        <Image style={commonStyles.image} source={require('../assets/images/icon.png')} />
        <ThemedText type="title" style={commonStyles.text_header}>Welcome!</ThemedText>
        <ThemedText type="subtitle" style={commonStyles.sub_text_header}>Advance Business Tools</ThemedText>
      </View>
      <ThemedSecondaryView style={[commonStyles.footer, {borderColor: color}]}>
        <ScrollView>       
          <ThemedText type="subtitle">User</ThemedText>
          <View style={commonStyles.action}>
            <Ionicons name="person" color={darkTheme ? darkTtextColor: lightTextColor} />
            <TextInput 
              onChangeText={setUsername}
              value={username}
              placeholder='type your username...'
              placeholderTextColor={darkTheme ? darkTtextColor: lightTextColor}
              style={[commonStyles.textInput, {color: darkTheme ? darkTtextColor: lightTextColor}]} autoCapitalize='none'/>
            { username ?
            <Ionicons name="checkmark-circle-outline" color={color} />
            : null}
          </View>
          {errors.username ? (
            <Text style={{color: 'red'}}>{errors.username}</Text>
          ) : null}
          <ThemedText type="subtitle">Password</ThemedText>
          <View style={commonStyles.action}>
            <Ionicons name="lock-closed" color={darkTheme ? darkTtextColor: lightTextColor} />
            <TextInput 
              onChangeText={setPassword}
              value={password}
              placeholder='type your password...' 
              placeholderTextColor={darkTheme ? darkTtextColor: lightTextColor}
              secureTextEntry={secureTextEntry ? true : false} 
              style={[commonStyles.textInput, {color: darkTheme ? darkTtextColor: lightTextColor}]} autoCapitalize='none'
              />
            <TouchableOpacity onPress={() => setSecureTextEntry(!secureTextEntry)}>
              {secureTextEntry ? 
              <Ionicons size={15} name="eye-off-outline" color={darkTheme ? darkTtextColor: lightTextColor} /> 
              : 
              <Ionicons size={15} name="eye-outline" color={darkTheme ? darkTtextColor: lightTextColor} />}
            </TouchableOpacity>
          </View>
          {errors.password ? (
            <Text style={{color: 'red'}}>{errors.password}</Text>
          ) : null}
          {loading ?
          <ActivityIndicator style={commonStyles.button} size="large" color={color} />
          : 
          <>
          <TouchableOpacity style={[commonStyles.button, { backgroundColor: color}]} onPress={handleSubmit}>
            <Text style={commonStyles.buttonText}>Login</Text> 
          </TouchableOpacity>
          <TouchableOpacity style={[commonStyles.button, { backgroundColor: color}]} onPress={() => router.push('register')}>
            <Text style={commonStyles.buttonText}>I'm new, create account!!</Text>
          </TouchableOpacity>
          </>
          }
        </ScrollView>
      </ThemedSecondaryView>
      <CustomAlert
        title='Login'
        visible={alertVisible}
        message={error}
        onClose={() => setAlertVisible(false)}
      />
    </ThemedView>
    )
  );
};