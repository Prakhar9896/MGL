import { View, Text, Image, Button } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import secureStore from '@/utils/secureStore';

const GameInfo = () => {
  const { guid } = useLocalSearchParams();
  const [gameInfo, setGameInfo] = useState(null);
  const[showoptions,setShowoptions]= useState(false);
  const[added,setAdded]= useState(false);

  const fetchGameInfo = async () => {
    try {
      const response = await fetch(`http://192.168.1.12:3000/game/${guid}`);

      if (!response.ok) {
        throw new Error(`HTTP error. status: ${response.status}`);
      }

      const data = await response.json();
      const infoObject = data.results || {};
      setGameInfo(infoObject);
      console.log(infoObject.name);
      console.log(infoObject.image?.super_url);
    } catch (err) {
      console.log("error in retrieving data ", err);
    }
  };

  useEffect(() => {
    fetchGameInfo();
  }, [guid]);

  const handlePress=()=>{
    setShowoptions(!showoptions);
  }

  const handleOptions= async(option: string)=>{
    try{
      const userID= await secureStore.getItem('userid');
      const response= await fetch(`http://192.168.1.12:3000/user/${userID}/list`,{
        method: 'PATCH',
        headers: {
          'Content-Type':'application/json'
        },
        body:JSON.stringify({
          guid: guid,
          status: option,
        })
      });

      if(!response.ok) throw new Error("http error: "+ response.status);
      const data= await response.json();
      console.log("List updated: ",data);
      setAdded(true);
      setTimeout(() => {
        setAdded(false);
      }, 3000);
    }
    catch(err){
      console.log("Error: ",err);
    }
  }

  if (!gameInfo) {
    return <Text>Loading...</Text>;
  }

  return (
    <View>
      {gameInfo.image?.super_url && (
        <Image
          source={{ uri: gameInfo.image.super_url }}
          style={{ width: 300, height: 400 }}
        />
      )}
      <Text>{gameInfo.name}</Text>

      <Button title='Add to List' onPress={handlePress}/>
        {showoptions && 
        <View>
        <Button
        title='Completed'
        onPress={()=>handleOptions('Completed')}
        />
        <Button
        title='Playing'
        onPress={()=>handleOptions('Playing')}/>
        <Button
        title='WishList'
        onPress={()=>handleOptions('Wishlist')}/>
        </View>
      }

      {added && <Text style={{ color: 'green', fontWeight: 'bold' }}>Game added to list!</Text>}
    </View>
  );
};

export default GameInfo;
