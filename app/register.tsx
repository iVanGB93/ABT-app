import React, {useState, useEffect} from 'react';
import { Text, View, Platform, TouchableOpacity, TextInput, StyleSheet, ActivityIndicator } from "react-native";
import { useSelector } from "react-redux";
import { useRouter } from 'expo-router';
import { useAppDispatch, RootState } from './(redux)/store';
import Ionicons from '@expo/vector-icons/Ionicons';
import { authFail, authSetLoading } from './(redux)/authSlice';
import axiosInstance from "@/axios";


interface Errors {
  username?: string;
  password?: string;
  email?: string;
}

export default function Register() {
  const {token, authError, authLoading} = useSelector((state: RootState) => state.auth);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [errors, setErrors] = useState<Errors>({});
  const color = '#6A5ACD';
  const dispatch = useAppDispatch();
  const router = useRouter();

  useEffect(() => {
    if (token != null) {
      router.push('/(app)/(clients)');
    }
  }, [token]);

  const validateForm = () => {
    let errors: Errors = {};
    if (!username) errors.username = "Username is required!";
    if (!password) errors.password = "Password is required!";
    if (!email) errors.email = "Email is required!";
    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      dispatch(authSetLoading(true));
      await axiosInstance
      .post("user/register/", {username: username, password: password, email: email})
      .then(function(response) {
          if (response.status === 201) {
            router.push('/');
          } 
          if (response.status === 203) {
            dispatch(authFail(response.data.message));
          }
      })
      .catch(function(error) {
          console.error('Error registering:', error.response, error.message);
          if (typeof error.response === 'undefined') {
            dispatch(authFail("Error logging in, undefinded"));
          } else {
            dispatch(authFail(error.message));
          };
      });
    }
  };

  return (
    <View style={[styles.container, {backgroundColor: color}]}>
        
      <View style={styles.header}>
        <Text style={styles.text_header}>Hello, please register!</Text>
        {authError ? (
            <Text style={{color: 'white', textAlign: 'center', fontSize: 15, marginTop: 10}}>{authError}</Text>
        ) : null}
      </View>     
      <View style={styles.footer}>        
        <Text style={styles.text_footer}>User</Text>
        <View style={styles.action}>
          <Ionicons name="person"/>
          <TextInput 
            onChangeText={setUsername} 
            placeholder='type your username...' 
            style={styles.textInput} autoCapitalize='none'/>
          { username ?
          <Ionicons name="checkmark-circle-outline" />
          : null}
        </View>
        {errors.username ? (
            <Text style={{color: 'red'}}>{errors.username}</Text>
        ) : null}
        <Text style={[styles.text_footer, { marginTop: 35 }]}>Email</Text>
        <View style={styles.action}>
          <Ionicons name="mail"/>
          <TextInput 
            onChangeText={setEmail} 
            placeholder='type your email...' 
            style={styles.textInput} autoCapitalize='none'/>
          { username ?
          <Ionicons name="checkmark-circle-outline" />
          : null}
        </View>
        {errors.email ? (
            <Text style={{color: 'red'}}>{errors.email}</Text>
        ) : null}
        <Text style={[styles.text_footer, { marginTop: 35 }]}>Password</Text>
        <View style={styles.action}>
          <Ionicons name="lock-closed"/>
          <TextInput 
            onChangeText={setPassword} 
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
          <Text style={styles.buttonText}>Register</Text> 
        </TouchableOpacity>
        }
        <TouchableOpacity style={[styles.button, { backgroundColor: color}]}
          onPress={() => router.push('/')}>
          <Text style={styles.buttonText}>Go to Login!!</Text>
        </TouchableOpacity>
      </View>
    </View>
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