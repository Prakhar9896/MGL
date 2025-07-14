import { View, Text, Button, FlatList } from 'react-native';
import React, { useEffect, useState } from 'react';
import secureStore from '@/utils/secureStore';
import GameCard from '@/component/gameCard';

const List = () => {
  const [userList, setUserList] = useState({
    Completed: [],
    Playing: [],
    Wishlist: [],
  });
  const [gamesData, setGamesData] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('Completed');
  const [loading, setLoading] = useState(true);

  const fetchList = async () => {
    try {
      const userId = await secureStore.getItem('userid');
      const response = await fetch(`http://192.168.1.12:3000/list?userId=${userId}`);
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      const data = await response.json();
      setUserList(data.list || {});
    } catch (err) {
      console.error("Error fetching list:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchGameDetails = async () => {
    try {
      const guids = userList[selectedStatus] || [];
      const promises = guids.map(guid =>
        fetch(`http://192.168.1.12:3000/game/${guid}`).then(res => res.json())
      );
      const results = await Promise.all(promises);
      const formatted = results.map(r => r.results);
      setGamesData(formatted);
    } catch (err) {
      console.error("Error fetching game details:", err);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  useEffect(() => {
    fetchGameDetails();
  }, [userList, selectedStatus]);

  const renderGameItem = ({ item }: any) => (
    <GameCard name={item.name} img={item.image?.original_url} guid={item.guid} />
  );

  return (
    <View style={{ padding: 16, flex: 1 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 10 }}>Your Game List</Text>

      <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 10 }}>
        <Button title="Completed" onPress={() => setSelectedStatus('Completed')} />
        <Button title="Playing" onPress={() => setSelectedStatus('Playing')} />
        <Button title="Wishlist" onPress={() => setSelectedStatus('Wishlist')} />
      </View>

      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>{selectedStatus}</Text>

      {loading ? (
        <Text>Loading...</Text>
      ) : gamesData.length === 0 ? (
        <Text>No games in {selectedStatus}</Text>
      ) : (
        <FlatList
          data={gamesData}
          keyExtractor={(item, index) => item.guid || index.toString()}
          renderItem={renderGameItem}
          numColumns={2}
          contentContainerStyle={{ gap: 8 }}
        />
      )}
    </View>
  );
};

export default List;
