import { View, Text, Image, Button, StyleSheet, ScrollView, Pressable, ActivityIndicator, Platform } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import secureStore from '@/utils/secureStore';

const GameInfo = () => {
  const { guid } = useLocalSearchParams();
  const [gameInfo, setGameInfo] = useState<any>(null);
  const [showOptions, setShowOptions] = useState(false);
  const [added, setAdded] = useState(false);
  const IP= "10.93.1.235" ;
  const fetchGameInfo = async () => {
    try {
      const response = await fetch(`http://${IP}:3000/game/${guid}`);

      if (!response.ok) {
        throw new Error(`HTTP error. status: ${response.status}`);
      }

      const data = await response.json();
      const infoObject = await data.results || {};
      setGameInfo(infoObject);
      console.log(infoObject.image);
    } catch (err) {
      console.log("Error in retrieving data:", err);
    }
  };

  useEffect(() => {
    fetchGameInfo();
  }, [guid]);

  const handlePress = () => {
    setShowOptions(!showOptions);
  };

  const handleOptions = async (option: string) => {
    try {
      const userID = await secureStore.getItem('userid');
      if (!userID || !gameInfo) return;

      const response = await fetch(`http://${IP}:3000/user/${userID}/list`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: option,
          guid: guid,
          name: gameInfo.name,
          image: gameInfo.image.original_url
        })
      });

      if (!response.ok) throw new Error("HTTP error: " + response.status);
      const data = await response.json();
      console.log("List updated:", data);
      setAdded(true);
      setTimeout(() => {
        setAdded(false);
      }, 3000);
    } catch (err) {
      console.log("Error:", err);
    }
  };

  if (!gameInfo) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading game...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.media}>
        {gameInfo.image?.super_url ? (
          <Image
            source={{ uri: gameInfo.image.super_url }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.noImage}>
            <Text style={styles.noImageText}>No image</Text>
          </View>
        )}
      </View>

      <View style={styles.meta}>
        <Text style={styles.title} numberOfLines={2}>{gameInfo.name}</Text>
        {gameInfo.deck ? <Text style={styles.deck}>{gameInfo.deck}</Text> : null}
        {gameInfo.description ? (
          <Text style={styles.description} numberOfLines={8}>
            {/* description may contain HTML; keep raw text */}
            {gameInfo.description.replace(/<[^>]*>/g, '')}
          </Text>
        ) : null}
      </View>

      <View style={styles.actionsRow}>
        <Pressable style={({pressed})=>[styles.addButton, pressed && styles.pressed]} onPress={handlePress}>
          <Text style={styles.addButtonText}>Add to List</Text>
        </Pressable>

        {showOptions && (
          <View style={styles.options}>
            <Pressable style={({pressed})=>[styles.optionButton, pressed && styles.optionPressed]} onPress={() => handleOptions('Completed')}>
              <Text style={styles.optionText}>Completed</Text>
            </Pressable>
            <Pressable style={({pressed})=>[styles.optionButton, pressed && styles.optionPressed]} onPress={() => handleOptions('Playing')}>
              <Text style={styles.optionText}>Playing</Text>
            </Pressable>
            <Pressable style={({pressed})=>[styles.optionButton, pressed && styles.optionPressed]} onPress={() => handleOptions('Wishlist')}>
              <Text style={styles.optionText}>Wishlist</Text>
            </Pressable>
          </View>
        )}
      </View>

      {added && <Text style={styles.addedText}>✓ Game added to list</Text>}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  loadingWrap: {
    flex: 1,
    minHeight: 200,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f8fafc'
  },
  loadingText: {
    marginTop: 10,
    color: '#475569'
  },
  container: {
    padding: 18,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
  },
  media: {
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#e6eef8',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 420,
    backgroundColor: '#e6eef8',
  },
  noImage: {
    width: '100%',
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e6eef8'
  },
  noImageText: {
    color: '#64748b'
  },
  meta: {
    width: '100%',
    marginTop: 14,
    paddingHorizontal: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 6
  },
  deck: {
    color: '#475569',
    marginBottom: 8,
    fontSize: 14
  },
  description: {
    color: '#334155',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 6
  },
  actionsRow: {
    width: '100%',
    marginTop: 16,
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 10,
    alignItems: 'center',
    minWidth: 160
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16
  },
  pressed: {
    opacity: Platform.OS === 'android' ? 0.9 : 0.8
  },
  options: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  optionButton: {
    flex: 1,
    marginHorizontal: 6,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  optionPressed: {
    backgroundColor: '#eef2ff'
  },
  optionText: {
    color: '#0f172a',
    fontWeight: '600'
  },
  addedText: {
    marginTop: 12,
    color: 'green',
    fontWeight: '700'
  }
});

export default GameInfo;
