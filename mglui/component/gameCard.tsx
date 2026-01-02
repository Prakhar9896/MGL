import { View, Text, Image, Pressable, StyleSheet } from 'react-native'
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

  const imageUri = img || 'https://via.placeholder.com/300x170?text=No+Image'

  return (
    <Pressable onPress={handlePress} style={styles.wrapper}>
      <View style={styles.card}>
        <Image source={{uri: imageUri}} style={styles.image} resizeMode="cover" />
        <View style={styles.meta}>
          <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">{name}</Text>
        </View>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    padding: 8,
    width: '50%', // two columns in FlatList
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    // shadow (iOS)
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    // elevation (Android)
    elevation: 3,
    alignItems: 'center',
  },
  image: {
    width: '100%',
    aspectRatio: 16/10,
    backgroundColor: '#e6eef8',
  },
  meta: {
    padding: 10,
    width: '100%',
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0f172a',
    lineHeight: 18,
  },
});

export default GameCard;