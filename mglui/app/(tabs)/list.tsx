import { SafeAreaView, View, Text, ScrollView, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import secureStore from '@/utils/secureStore'
import { useFocusEffect } from 'expo-router'
import GameCard from '@/component/gameCard'

const List = () => {
  const [userList, setUserList] = useState({
    Completed: [],
    Playing: [],
    Wishlist: [],
  })
  const [status, setStatus] = useState("Playing")
  const [userID, setUserID] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const IP = "10.93.1.235";
  const getUserList = async () => {
    try {
      setLoading(true)
      const userId = await secureStore.getItem('userid')
      if (!userId) return
      setUserID(userId)

      const response = await fetch(`http://${IP}:3000/list/?userId=${userId}`)
      if (!response.ok) throw new Error("Failed to fetch list")
      const data = await response.json()

      setUserList(data.list || { Completed: [], Playing: [], Wishlist: [] })
    } catch (err) {
      console.log("Error fetching user list:", err)
    } finally {
      setLoading(false)
    }
  }

  useFocusEffect(
    useCallback(() => {
      getUserList()
    }, [])
  )

  const tabs = ["Completed", "Playing", "Wishlist"]

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>My List</Text>
        <Text style={styles.subtitle}>Manage your game collection</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsContainer}
      >
        {tabs.map((item) => {
          const active = item === status
          return (
            <TouchableOpacity
              key={item}
              style={[styles.tab, active && styles.tabActive]}
              onPress={() => setStatus(item)}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, active && styles.tabTextActive]}>{item}</Text>
            </TouchableOpacity>
          )
        })}
      </ScrollView>

      <View style={styles.listWrap}>
        {loading ? (
          <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={userList[status] || []}
            renderItem={({ item }) => (
              <GameCard
                name={item.name}
                img={typeof item.image === 'string' ? item.image : (item.image?.original_url || item.image?.super_url || '')}
                guid={item.guid}
              />
            )}
            keyExtractor={(item, idx) => String(item.guid ?? item.name ?? idx)}
            numColumns={2}
            contentContainerStyle={styles.listContent}
            columnWrapperStyle={styles.column}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyWrapper}>
                <Text style={styles.emptyTitle}>No games yet</Text>
                <Text style={styles.emptySubtitle}>Add games to your {status} list</Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f3f6fb',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 2,    // reduced to bring tabs closer
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 2,     // smaller spacing under title
  },
  subtitle: {
    fontSize: 13,
    color: '#64748b',
  },

  tabsContainer: {
    paddingHorizontal: 12,
    paddingVertical: 2,   // reduced from 4 → tighter spacing
    alignItems: 'flex-start',
    marginBottom: 0,      // reduced from 6 → removes extra gap
  },
  
  tab: {
    backgroundColor: '#fff',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 999,
    marginRight: 10,
    minWidth: 92,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  tabActive: {
    backgroundColor: '#2563eb',
    transform: [{ translateY: -2 }],
    shadowOpacity: 0.12,
    elevation: 4,
  },
  tabText: {
    color: '#0f172a',
    fontWeight: '700',
    fontSize: 13,
  },
  tabTextActive: {
    color: '#fff',
  },

  listWrap: {
  flex: 1,
  paddingHorizontal: 8,
  paddingTop: 0,        // reduced from 2 → removes vertical space
  paddingBottom: 24,
  },

  listContent: {
    paddingBottom: 120,
    paddingTop: 2,      // minimal spacing at top of list
  },
  column: {
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  emptyWrapper: {
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 6,
  },
  emptySubtitle: {
    color: '#64748b',
    textAlign: 'center',
  },
})

export default List