import { View, Text, FlatList, ActivityIndicator, TextInput, Button } from 'react-native';
import React, { useEffect, useState } from 'react';
import GameCard from '@/component/gameCard';

const LIMIT = 20;

const home = () => {
  const [games, setGames] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [search,setSearch]= useState('');
  const [searched, setSearched]=useState([]);
  const [searching ,setSearching]= useState(false);
  const[ispressed,setispressed]=useState(false);

  const fetchData = async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    try {
      const response = await fetch(`http://192.168.1.12:3000/games?limit=${LIMIT}&offset=${page}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      const newGames = data.results || [];

      const updatedGames = [...games, ...newGames];
      setGames(updatedGames);
      setPage(prevPage => prevPage + LIMIT);
      if (newGames.length < LIMIT) setHasMore(false);
    } catch (err) {
      console.log('error in retrieving the data: ', err);
    } finally {
      setLoading(false);
    }
  };

  const searchName= async()=>{
    setispressed(true);
    setSearching(true);
    const response= await fetch(`http://192.168.1.12:3000/games?search=${encodeURIComponent(search)}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data= await response.json();
    const searchGames= await data.results;
    setSearched(searchGames);
    setSearching(false);
  }

  useEffect(() => {
    fetchData();
  }, []);
  
  useEffect(()=>{
    if(search===''){
      setSearched([]);
      setispressed(false);
    }
  },[search,ispressed])

  const renderFooter = () => {
    return loading ? <ActivityIndicator size="large" color="#0000ff" /> : null;
  };

  return (
    <View>
      <TextInput
      value={search}
      onChangeText={setSearch}
      placeholder="Search games by name..."
      />
      <Button title='search' onPress={searchName}/>
      <Text style={{ fontSize: 24, fontWeight: 'bold', margin: 10 }}>Games List</Text>
      { searching ?<Text>Searching....</Text> : search==='' || !ispressed ? <FlatList
        data={games}
        renderItem={({ item }) => (
          <GameCard name={item.name} img={item.image.original_url} guid={item.guid} />
        )}
        keyExtractor={item => item.id}
        numColumns={2}
        onEndReached={fetchData}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
      /> :
      <FlatList
      data={searched}
      renderItem={({ item }) => (
          <GameCard name={item.name} img={item.image.original_url} guid={item.guid} />
      )}
      keyExtractor={item=>item.id}
      numColumns={2}
      onEndReachedThreshold={0.5}
      ListFooterComponent={renderFooter}
      />
      }
    </View>
  );
};

export default home;
