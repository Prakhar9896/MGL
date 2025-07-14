import React, { useEffect, useState } from 'react';
import { View, Button, Text } from 'react-native';
import SignIn from '@/component/signIn';
import SignUp from '@/component/signUp';
import secureStore from '@/utils/secureStore';
import { useRouter } from 'expo-router';

const AuthScreen = () => {

  const router= useRouter();
  const [checkingToken, setCheckingToken]= useState(true);
  const [isSignIn, setIsSignIn] = useState(true);
  useEffect(()=>{
    const checkToken= async () => {
      const token= await secureStore.getItem('token');
      if(!!token) router.replace('/home');
      else {
        await secureStore.delToken('token');
        await secureStore.delToken('user');
      }
    }
    checkToken();
    setCheckingToken(false);
  },[])

  if(checkingToken) {
    return (
      <Text>Loding....</Text>
    )
  }
  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Button
        title={isSignIn ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
        onPress={() => setIsSignIn(!isSignIn)}
      />
      <Text style={{ fontSize: 24, marginBottom: 20 }}>
        {isSignIn ? 'Sign In' : 'Sign Up'}
      </Text>

      {isSignIn ? <SignIn /> : <SignUp />}
    </View>
  );
};

export default AuthScreen;
