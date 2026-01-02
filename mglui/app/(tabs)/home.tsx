import { View, Text, FlatList, ActivityIndicator, TextInput, Button, StyleSheet, Platform } from 'react-native';
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
  const IP ="10.93.1.235";
  const fetchData = async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    try {
      const response = await fetch(`http://${IP}:3000/games?limit=${LIMIT}&offset=${page}`);
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
    const response= await fetch(`http://${IP}:3000/games?search=${encodeURIComponent(search)}`);
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
    return loading ? <ActivityIndicator size="large" color="#2563eb" style={styles.loader} /> : null;
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Games List</Text>
        <Text style={styles.sub}>Explore and add to your lists</Text>
      </View>

      <View style={styles.searchRow}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search games by name..."
          style={styles.searchInput}
          placeholderTextColor="#9ca3af"
        />
        <View style={styles.searchButton}>
          <Button title="Search" onPress={searchName} color={Platform.OS === 'ios' ? '#0ea5e9' : '#2563eb'} />
        </View>
      </View>

      { searching ? <Text style={styles.searchingText}>Searching...</Text> :
        (search==='' || !ispressed) ? (
          <FlatList
            data={games}
            renderItem={({ item }) => (
              <GameCard name={item.name} img={item.image.original_url} guid={item.guid} />
            )}
            keyExtractor={item => String(item.id)}
            numColumns={2}
            onEndReached={fetchData}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
            contentContainerStyle={styles.listContent}
            columnWrapperStyle={styles.column}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <FlatList
            data={searched}
            renderItem={({ item }) => (
              <GameCard name={item.name} img={item.image.original_url} guid={item.guid} />
            )}
            keyExtractor={item=>String(item.id)}
            numColumns={2}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
            contentContainerStyle={styles.listContent}
            columnWrapperStyle={styles.column}
            showsVerticalScrollIndicator={false}
          />
        )
      }
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 18,
    backgroundColor: '#f3f6fb',
  },
  headerRow: {
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
  },
  sub: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    height: 44,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  searchButton: {
    marginLeft: 10,
    borderRadius: 10,
    overflow: 'hidden',
    height: 44,
    justifyContent: 'center',
  },
  searchingText: {
    marginVertical: 12,
    color: '#64748b',
  },
  listContent: {
    paddingBottom: 120,
    paddingTop: 6,
  },
  column: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  loader: {
    marginVertical: 18,
  },
});

export default home;
