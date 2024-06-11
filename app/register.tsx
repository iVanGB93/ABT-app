import React, {useState, useEffect} from 'react';
import { Text, View, TouchableOpacity, TextInput, ActivityIndicator } from "react-native";
import { useSelector } from "react-redux";
import { useRouter } from 'expo-router';
import { useAppDispatch, RootState } from './(redux)/store';
import Ionicons from '@expo/vector-icons/Ionicons';
import {commonStyles} from '@/constants/commonStyles';
import CustomAlert from '@/constants/customAlert';
import axiosInstance from "@/axios";
import { authSetMessage } from './(redux)/authSlice';

interface Errors {
  username?: string;
  password?: string;
  email?: string;
}

export default function Register() {
  const {token} = useSelector((state: RootState) => state.auth);
  const {color} = useSelector((state: RootState) => state.settings);
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
      setLoading(true);
      await axiosInstance
      .post("user/register/", {username: username, password: password, email: email})
      .then(function(response) {
          if (response.status === 201) {
            dispatch(authSetMessage("Account created!!!"));
            router.push('initialSettings');
          } 
          if (response.status === 203) {
            setLoading(false);
            setError(response.data.message);
            setAlertVisible(true);
          }
      })
      .catch(function(error) {
          console.error('Error registering:', error.response, error.message);
          setLoading(false);
          if (typeof error.response === 'undefined') {
            setError("Error registering, undefinded");
          } else {
            setError(error.message);
          };
          setAlertVisible(true);
      });
    }
  };

  return (
    <View style={[commonStyles.container, {backgroundColor: color}]}>
      <View style={commonStyles.header}>
        <Text style={commonStyles.text_header}>Hello, please register!</Text>
      </View>     
      <View style={commonStyles.footer}>     
        <Text style={commonStyles.text_footer}>User</Text>
        <View style={commonStyles.action}>
          <Ionicons name="person"/>
          <TextInput 
            onChangeText={setUsername} 
            placeholder='type your username...' 
            style={commonStyles.textInput} autoCapitalize='none'/>
          { username ?
          <Ionicons name="checkmark-circle-outline" />
          : null}
        </View>
        {errors.username ? (
            <Text style={{color: 'red'}}>{errors.username}</Text>
        ) : null}
        <Text style={[commonStyles.text_footer, { marginTop: 35 }]}>Email</Text>
        <View style={commonStyles.action}>
          <Ionicons name="mail"/>
          <TextInput 
            onChangeText={setEmail} 
            placeholder='type your email...' 
            style={commonStyles.textInput} autoCapitalize='none'/>
          { username ?
          <Ionicons name="checkmark-circle-outline" />
          : null}
        </View>
        {errors.email ? (
            <Text style={{color: 'red'}}>{errors.email}</Text>
        ) : null}
        <Text style={[commonStyles.text_footer, { marginTop: 35 }]}>Password</Text>
        <View style={commonStyles.action}>
          <Ionicons name="lock-closed"/>
          <TextInput 
            onChangeText={setPassword} 
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
          <Text style={commonStyles.buttonText}>Register</Text> 
        </TouchableOpacity>
        }
        <TouchableOpacity style={[commonStyles.button, { backgroundColor: color}]}
          onPress={() => router.push('/')}>
          <Text style={commonStyles.buttonText}>Go to Login!!</Text>
        </TouchableOpacity>
      </View>
      <CustomAlert
        title='Registration error'
        visible={alertVisible}
        message={error}
        onClose={() => setAlertVisible(false)}
      />
    </View>
  );
};