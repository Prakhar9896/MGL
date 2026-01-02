import { View, Text, FlatList } from 'react-native'
import React from 'react'
import GameCard from './gameCard'

interface Game {
  name: string
  image: string
  guid: string
}

const GameList = ({ games }: { games: Game[] }) => {
  if (!games || games.length === 0) {
    return (
      <View style={{ padding: 10 }}>
        <Text>No games found for this list.</Text>
      </View>
    )
  }

  return (
    <FlatList
      data={games}
      keyExtractor={(item) => item.guid}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ padding: 10 }}
      renderItem={({ item }) => (
        <GameCard name={item.name} img={item.image} guid={item.guid} />
      )}
    />
  )
}

export default GameList
