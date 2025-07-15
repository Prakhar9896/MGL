import { View, Text, Button } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import secureStore from '@/utils/secureStore'
import { useFocusEffect } from 'expo-router';
import GameList from '@/component/gameList';

const list = () => {
  const [userList, setuserList]= useState({});
  const [status,setStatus]=useState("Playing");
  const userId= await secureStore.getItem('userid');
  const getuserlist= async ()=>{
    const response= await fetch(`http://192.168.1.6:3000/list/?userId=${userId}`);
    const data = await response.json();
    setuserList(data.list || {});
  }

  useFocusEffect(
    useCallback(()=>{
      getuserlist();
    },[])
  )

  useEffect(()=>{

  },[status]);

  return (
    <View>
      <Text>list</Text>
      <Button title='Completed' onPress={()=>setStatus("Completed")}/>
      <Button title='Playing' onPress={()=>setStatus("Playing")}/>
      <Button title='Wishlist' onPress={()=>setStatus("Wishlist")}/>
      <GameList status={status} userId={userId}/>
    </View>
  )
}

export default list