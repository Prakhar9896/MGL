import { View, Text, TextInput, Button } from 'react-native'
import React, { useState } from 'react'
import secureStore from "../utils/secureStore"
import { router } from 'expo-router';

const SignIn = () => {

  const [email, setEmail]= useState('');
  const [pw, setPw]= useState('');

  const handlePress= async ()=>{
    const response= await fetch("http://192.168.1.12:3000/login",{
      method: 'POST',
      headers:{
        'Content-Type': 'application/json'
      },
      body:JSON.stringify({
        email: email,
        password: pw
      })
    });
    if(!response.ok) throw new Error(`Http Error , Status: ${response.status}`);

    const data= await response.json();

    console.log("Sign In Succesfull: ",data);

    const jwtoken= data.token;
    const user= data.user;
    await secureStore.setToken(jwtoken);
    await secureStore.setUser(user);
    await secureStore.setUserid(data.user.userid);
    router.replace('/home');
  }
    
  return (
    <View>
      <TextInput
      value={email}
      onChangeText={setEmail}
      placeholder='enter your email'
      />
      <TextInput
      value={pw}
      onChangeText={setPw}
      placeholder='enter your password'
      />
      <Button title='SignIn' onPress={handlePress}/>
    </View>
  )
}

export default SignIn