import { View, Text, Image, Pressable } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router';

interface gcParameter{
    name: string,
    img: string,
    guid: any
}

const GameCard = ({name, img, guid}: gcParameter) => {

  const router= useRouter();
  const handlePress = () => {
    router.push(`/gameInfo/${guid}`);
  }
  return (
    <Pressable onPress={handlePress}>
      <View style={{padding:10, width:110, height:210}}>
      <Image source={{uri: img}} style={{width:100, height:100, borderRadius: 5}}/>
      <Text style={{}}>{name}</Text>
      </View>
    </Pressable>
  )
}

export default GameCard; 