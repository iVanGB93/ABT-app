import React, {useState, useEffect} from 'react';
import { Text, View, TouchableOpacity, TextInput, ActivityIndicator, ScrollView, Image } from "react-native";
import { useSelector } from "react-redux";
import { useRouter } from 'expo-router';
import { useAppDispatch, RootState } from './(redux)/store';

import Ionicons from '@expo/vector-icons/Ionicons';
import {commonStyles} from '@/constants/commonStyles';
import CustomAlert from '@/constants/customAlert';
import axiosInstance from "@/axios";
import { authSetMessage, authSuccess } from './(redux)/authSlice';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { darkSecondColor, darkTtextColor, lightSecondColor, lightTextColor } from "@/settings";

interface Errors {
  username?: string;
  password?: string;
  email?: string;
}

export default function Register() {
  const {token} = useSelector((state: RootState) => state.auth);
  const {color, darkTheme} = useSelector((state: RootState) => state.settings);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [errors, setErrors] = useState<Errors>({});
  const [alertVisible, setAlertVisible] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const validateForm = () => {
    let errors: Errors = {};
    if (!username) errors.username = "Username is required!";
    if (!password) errors.password = "Password is required!";
    if (!email) errors.email = "Email is required!";
    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const loginUser = async () => {
    setError('Account created, login in...');
    setAlertVisible(true);
    await axiosInstance
    .post("token/", {username: username, password: password})
    .then(function(response) {
      if (response.data.access !== undefined) {
        dispatch(authSuccess({username: username, token: response.data.access, refreshToken: response.data.refresh}));
        setAlertVisible(false);
        setLoading(false);
        router.push('initialSettings');
      } else {
        setError(response.data.message);
        setLoading(false);
      }
    })
    .catch(function(error) {
      console.error('Error logging in:', error.response, error.message);
      if (typeof error.response === 'undefined') {
        setError('A server/network error occurred. ' + 'Sorry about this - try againg in a few minutes.');
      } else {
        if (error.response.status === 401) {
          setError("Username or Password incorrect");
        } else {
          setError(error.message);
        };
      };
      setAlertVisible(false);
      setLoading(false);
      router.push('/');
    });
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      setLoading(true);
      await axiosInstance
      .post("user/register/", {username: username, password: password, email: email})
      .then(function(response) {
        if (response.status === 201) {
          dispatch(authSetMessage("Account created!!!"));
          loginUser();
        } 
        if (response.status === 203) {
          setError(response.data.message);
          setAlertVisible(true);
          setLoading(false);
        }
      })
      .catch(function(error) {
        console.error('Error registering:', error.response, error.message);
        if (typeof error.response === 'undefined') {
          setError('A server/network error occurred. ' + 'Sorry about this - try againg in a few minutes.');
        } else {
          setError(error.message);
        };
        setAlertVisible(true);
        setLoading(false);
      });
    }
  };

  return (
    <ThemedView style={commonStyles.container}>
      <View style={commonStyles.header}>
        <Image style={commonStyles.image} source={require('../assets/images/icon.png')} />
        <ThemedText type="title"  style={commonStyles.text_header}>Hello, please register!</ThemedText>
        <ThemedText type="subtitle" style={commonStyles.sub_text_header}>Advance Business Tools</ThemedText>
      </View>     
      <View style={[commonStyles.footer, {backgroundColor:darkTheme ? darkSecondColor: lightSecondColor, borderColor: color}]}>
        <ScrollView>  
          <ThemedText style={commonStyles.text_action} type="subtitle">User</ThemedText>
          <View style={commonStyles.action}>
            <Ionicons name="person" color={darkTheme ? darkTtextColor: lightTextColor} />
            <TextInput 
              onChangeText={setUsername} 
              placeholder='type your username...' 
              placeholderTextColor={darkTheme ? darkTtextColor: lightTextColor}
              style={[commonStyles.textInput, {color: darkTheme ? darkTtextColor: lightTextColor}]} autoCapitalize='none'/>
            { username ?
            <Ionicons name="checkmark-circle-outline" color={color} />
            : null}
          </View>
          {errors.username ? (
              <Text style={commonStyles.errorMsg}>{errors.username}</Text>
          ) : null}
          <ThemedText style={commonStyles.text_action} type="subtitle">Email</ThemedText>
          <View style={commonStyles.action}>
            <Ionicons name="mail" color={darkTheme ? darkTtextColor: lightTextColor} />
            <TextInput 
              onChangeText={setEmail} 
              placeholder='type your email...' 
              placeholderTextColor={darkTheme ? darkTtextColor: lightTextColor}
              style={[commonStyles.textInput, {color: darkTheme ? darkTtextColor: lightTextColor}]} autoCapitalize='none'
              />
            { email ?
            <Ionicons name="checkmark-circle-outline" color={color}/>
            : null}
          </View>
          {errors.email ? (
              <Text style={commonStyles.errorMsg}>{errors.email}</Text>
          ) : null}
          <ThemedText style={commonStyles.text_action} type="subtitle">Password</ThemedText>
          <View style={commonStyles.action}>
            <Ionicons name="lock-closed" color={darkTheme ? darkTtextColor: lightTextColor} />
            <TextInput 
              onChangeText={setPassword} 
              placeholder='type your password...' 
              placeholderTextColor={darkTheme ? darkTtextColor: lightTextColor}
              secureTextEntry={secureTextEntry ? true : false} 
              style={[commonStyles.textInput, {color: darkTheme ? darkTtextColor: lightTextColor}]} autoCapitalize='none'
              />
            <TouchableOpacity onPress={() => setSecureTextEntry(!secureTextEntry)}>
              {secureTextEntry ? 
                <Ionicons size={15} name="eye-off-outline" color={darkTheme ? darkTtextColor: lightTextColor} /> 
                : 
                <Ionicons size={15} name="eye-outline" color={darkTheme ? darkTtextColor: lightTextColor} />
              }
            </TouchableOpacity>
          </View>
          {errors.password ? (
              <Text style={commonStyles.errorMsg}>{errors.password}</Text>
          ) : null}
          {loading ?
          <ActivityIndicator style={commonStyles.button} size="large" color={color} />
          :
          <>
          <TouchableOpacity style={[commonStyles.button, { borderColor: color, marginTop: 50}]} onPress={handleSubmit}>
            <ThemedText type="subtitle" style={{color: color}}>Register</ThemedText> 
          </TouchableOpacity>
          <View style={commonStyles.linkSection}>
            <ThemedText type="subtitle">Go to </ThemedText>
            <TouchableOpacity
              onPress={() => router.push('/')}>
              <ThemedText type="subtitle" style={{color: color}}>Login!!</ThemedText>
            </TouchableOpacity>
          </View>
          </>
          }
        </ScrollView>
      </View>
      <CustomAlert
        title='Registration'
        visible={alertVisible}
        message={error}
        onClose={() => setAlertVisible(false)}
      />
    </ThemedView>
  );
};