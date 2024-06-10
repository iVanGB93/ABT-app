import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { View, TouchableOpacity, Text, TextInput, StyleSheet, Platform, ActivityIndicator, StatusBar } from "react-native";
import { Link, Redirect, useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as SplashScreen from 'expo-splash-screen';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { RootState, useAppDispatch } from "./(redux)/store";
import { authSetLoading, authSuccess, authFail } from "./(redux)/authSlice";
import axiosInstance from "@/axios";


interface Errors {
  username?: string;
  password?: string;
}

export default function Login() {
  const {token, authError, authLoading} = useSelector((state: RootState) => state.auth);
  const {color} = useSelector((state: RootState) => state.settings);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(true);
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
      dispatch(authSetLoading(true));
      await axiosInstance
      .post("token/", {username: username, password: password})
      .then(function(response) {
          if (response.data.access !== undefined) {
              dispatch(authSuccess({username: username, token: response.data.access, refreshToken: response.data.refresh}));
          } else {
              dispatch(authFail(response.data.message))
          }
      })
      .catch(function(error) {
          console.error('Error logging in:', error.response, error.message);
          if (typeof error.response === 'undefined') {
              dispatch(authFail("Error logging in, undefinded"));
          } else {
              if (error.response.status === 401) {
                  dispatch(authFail("Username or Password incorrect"));
              } else {
                  dispatch(authFail(error.message));
              };
          };
      });
    }
  };

  return (
    token ? (
      <Redirect href={'/(app)/(clients)'}/>
    ) : (
    <ThemedView style={[styles.container, {backgroundColor: color}]}>
      <View style={styles.header}>
        <Text style={styles.text_header}>Welcome!</Text>
        {authError ? (
          <Text style={{color: 'white', textAlign: 'center', fontSize: 15, marginTop: 10}}>{authError}</Text>
        ) : null}
      </View>
      <ThemedView style={styles.footer}>        
        <Text style={styles.text_footer}>User</Text>
        <View style={styles.action}>
          <Ionicons name="person"/>
          <TextInput 
            onChangeText={setUsername}
            value={username}
            placeholder='type your username...' 
            style={styles.textInput} autoCapitalize='none'/>
          { username ?
          <Ionicons name="checkmark-circle-outline" />
          : null}
          
        </View>
        {errors.username ? (
          <Text style={{color: 'red'}}>{errors.username}</Text>
        ) : null}
        <Text style={[styles.text_footer, { marginTop: 35 }]}>Password</Text>
        <View style={styles.action}>
          <Ionicons name="lock-closed"/>
          <TextInput 
            onChangeText={setPassword}
            value={password}
            placeholder='type your password...' 
            secureTextEntry={secureTextEntry ? true : false} 
            style={styles.textInput} autoCapitalize='none'
            />
          <TouchableOpacity onPress={() => setSecureTextEntry(!secureTextEntry)}>
            {secureTextEntry ? <Ionicons size={15} name="eye-off-outline"/> : <Ionicons size={15} name="eye-outline"/>}
          </TouchableOpacity>
        </View>
        {errors.password ? (
          <Text style={{color: 'red'}}>{errors.password}</Text>
        ) : null}
        {authLoading ?
        <ActivityIndicator style={styles.button} size="large" color={color} />
        :
        <TouchableOpacity style={[styles.button, { backgroundColor: color}]} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Login</Text> 
        </TouchableOpacity>
        }
        <TouchableOpacity style={[styles.button, { backgroundColor: color}]} onPress={() => router.push('register')}>
          <Text style={styles.buttonText}>I'm new, create account!!</Text>
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
    )
  );
}

const styles = StyleSheet.create ({
  container: {
    flex: 1, 
  },
  containerActivity: {
    flex: 1, 
    backgroundColor: '#0034',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
      flex: 1,
      justifyContent: 'flex-end',
      paddingHorizontal: 20,
      paddingBottom: 50
  },
  footer: {
      flex: 3,
      backgroundColor: '#fff',
      borderTopLeftRadius: 30,
      borderTopRightRadius: 30,
      paddingHorizontal: 20,
      paddingVertical: 30
  },
  text_header: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 30
  },
  text_footer: {
      color: '#05375a',
      fontSize: 18
  },
  action: {
      flexDirection: 'row',
      marginTop: 10,
      borderBottomWidth: 1,
      borderBottomColor: '#f2f2f2',
      paddingBottom: 5
  },
  actionError: {
      flexDirection: 'row',
      marginTop: 10,
      borderBottomWidth: 1,
      borderBottomColor: '#FF0000',
      paddingBottom: 5
  },
  textInput: {
      flex: 1,
      marginTop: Platform.OS === 'ios' ? 0 : -12,
      paddingLeft: 10,
      color: '#05375a',
  },
  errorMsg: {
      color: '#FF0000',
      fontSize: 14,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    marginTop: 50,
    width: '100%',
    borderRadius: 10,
  },
  buttonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  }
})