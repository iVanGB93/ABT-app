import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { View, TouchableOpacity, Text, TextInput, StyleSheet, Platform, ActivityIndicator, StatusBar } from "react-native";
import { Link, Redirect, useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as SplashScreen from 'expo-splash-screen';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { RootState, useAppDispatch } from "./(redux)/store";
import { authSuccess } from "./(redux)/authSlice";
import {commonStyles} from '@/constants/commonStyles';
import axiosInstance from "@/axios";


interface Errors {
  username?: string;
  password?: string;
}

export default function Login() {
  const {token} = useSelector((state: RootState) => state.auth);
  const {color} = useSelector((state: RootState) => state.settings);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [errors, setErrors] = useState<Errors>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();

/*   useEffect(() => {
    setTimeout(() => {
      setLoading(false);
      SplashScreen.hideAsync();
    }, 3000);
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
          } else {
            setError(response.data.message);
          }
      })
      .catch(function(error) {
          console.error('Error logging in:', error.response, error.message);
          if (typeof error.response === 'undefined') {
            setError("Error logging in, undefinded");
          } else {
            if (error.response.status === 401) {
              setError("Username or Password incorrect");
            } else {
              setError(error.message);
            };
          };
      });
    }
  };

  return (
    token ? (
      <Redirect href={'/(app)/(clients)'}/>
    ) : (
    <ThemedView style={[commonStyles.container, {backgroundColor: color}]}>
      <View style={commonStyles.header}>
        <Text style={commonStyles.text_header}>Welcome!</Text>
        {error ? (
          <Text style={{color: 'white', textAlign: 'center', fontSize: 15, marginTop: 10}}>{error}</Text>
        ) : null}
      </View>
      <ThemedView style={commonStyles.footer}>        
        <Text style={commonStyles.text_footer}>User</Text>
        <View style={commonStyles.action}>
          <Ionicons name="person"/>
          <TextInput 
            onChangeText={setUsername}
            value={username}
            placeholder='type your username...' 
            style={commonStyles.textInput} autoCapitalize='none'/>
          { username ?
          <Ionicons name="checkmark-circle-outline" />
          : null}
          
        </View>
        {errors.username ? (
          <Text style={{color: 'red'}}>{errors.username}</Text>
        ) : null}
        <Text style={[commonStyles.text_footer, { marginTop: 35 }]}>Password</Text>
        <View style={commonStyles.action}>
          <Ionicons name="lock-closed"/>
          <TextInput 
            onChangeText={setPassword}
            value={password}
            placeholder='type your password...' 
            secureTextEntry={secureTextEntry ? true : false} 
            style={commonStyles.textInput} autoCapitalize='none'
            />
          <TouchableOpacity onPress={() => setSecureTextEntry(!secureTextEntry)}>
            {secureTextEntry ? <Ionicons size={15} name="eye-off-outline"/> : <Ionicons size={15} name="eye-outline"/>}
          </TouchableOpacity>
        </View>
        {errors.password ? (
          <Text style={{color: 'red'}}>{errors.password}</Text>
        ) : null}
        {loading ?
        <ActivityIndicator style={commonStyles.button} size="large" color={color} />
        :
        <TouchableOpacity style={[commonStyles.button, { backgroundColor: color}]} onPress={handleSubmit}>
          <Text style={commonStyles.buttonText}>Login</Text> 
        </TouchableOpacity>
        }
        <TouchableOpacity style={[commonStyles.button, { backgroundColor: color}]} onPress={() => router.push('register')}>
          <Text style={commonStyles.buttonText}>I'm new, create account!!</Text>
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
    )
  );
};