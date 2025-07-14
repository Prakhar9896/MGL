import { View, Text, Button } from 'react-native'
import React, { useState } from 'react'
import secureStore from '@/utils/secureStore'
import { useRouter } from 'expo-router'

const profile = () => {

    const router= useRouter();

    const [user, setUser]= useState('');

    const checkUser = async () => {
        const userStr = await secureStore.getItem('user');
        const user = userStr ? JSON.parse(userStr):null ;
        setUser(user);
    }
    checkUser();
    if(user == null){
        secureStore.delToken('token');
        secureStore.delToken('user');
        router.replace('/');
        return
    }
    const userName= user.username;
    const email= user.email;
    
    const logOutbutton=()=>{
        secureStore.delToken('token');
        secureStore.delToken('user');
        console.log(`user: ${userName} LoggedOuT Succesfully`);
        router.replace('/');
    }
  return (
    <View>
      <Text>profile</Text>
      <Text>User Name: {userName}</Text>
      <Text>Email: {email}</Text>
      <Button
      title='logOut'
      onPress={logOutbutton}
      />
    </View>
  )
}

export default profile