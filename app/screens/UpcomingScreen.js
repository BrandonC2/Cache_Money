import React, {useState, useLayoutEffect, useEffect } from "react";
import {
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  View,
  FlatList,
  ActivityIndicator,
  Image,
  Text,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "../lib/apiClient";
// import { icon_search } from './IconLookupFunction';

/* 
  Upcoming functions:
  - For now a place holder for navagation bar
  - Show items that are about to expire for that week

  Necessary:
  - Users can see what foods are going to expire sooner than others 
*/

export default function UpcomingScreen({navigation}) {
  
  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Used to load all of the data onto the screen
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchAllItems();
    });
    return unsubscribe;
  }, [navigation]);

  const fetchAllItems = async () => {
    setLoading(true);
    try {
      // Retrieve the list of rooms the user is in
      const visitedRoomsStr = await AsyncStorage.getItem("visitedRooms")
      const visitedRooms = visitedRoomsStr ? JSON.parse(visitedRoomsStr) : [];

      let allItems = [];

      // Next take all items from each room
      for (const room of visitedRooms){
        try {
          const res = await apiClient.get(`/inventory?room=${encodeURIComponent(room.name)}`);
          allItems = [...allItems, ...res.data];
        } catch (e) {
          console.log(`Skipping room ${room.name}:`, e.message);
        }
      }
      // Remove any items that don't have any dates associated with them
      const sortedItems = allItems
        .filter(item => item.expirationDate)
        .sort((a,b) => new Date(a.expirationDate) - new Date(b.expirationDate));

      setItems(sortedItems);
    } catch (err) {
      console.error("Error fetching upcoming items: " ,err)
    } finally {
      setLoading(false);
    }
  };

  // used to determine border color for expiring items
  const getBorderColor = (dateString) => {
    const today = new Date();
    const expDate = new Date (dateString);

    // difference in time in milliseconds
    const diffTime = expDate - today;
    // converts the time into days
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 1) return "FF5252"; // Gives the border the color red
    if (diffDays <= 3) return "FFD700"; // gives the border yellow color
    return "4D693A"; // border is green
  };

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderItem = ({ item }) => {
    const borderColor = getBorderColor(item.expirationDate);
    const dateObj = new Date(item.expirationDate);
    const dateFormatted = `${dateObj.getMonth() + 1}/${dateObj.getDate()}/${dateObj.getFullYear()}`;

    return (
      <View style = {styles.itemRow}>
        {/* Holds the image and the colored border */}
        <View styles = {[styles.imageContainer, {borderColor:borderColor}]}>
          <Image
            source = {icon_search(item.name)}
            style = {styles.foodIcon}/>
        </View>

        {/* Displays the date of the item */}
        <View styles = {styles.dateContainer}>
          <Text styles = {styles.dateText}>{dateFormatted}</Text>
        </View>
      </View>
    )
  };

// START HERE
return (
    <View style={styles.container}>
      
      {/* --- HEADER SECTION --- */}
      <View style={styles.headerContainer}>
        {/* Logo */}
        <Image source={require('../assets/basket.png')} style={styles.logo} />
        
        {/* Location (Static for now, can be dynamic later) */}
        <View style={styles.locationContainer}>
            <Ionicons name="location-sharp" size={18} color="#444" />
            <Text style={styles.locationText}>Long Beach, CA</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#000" style={{marginRight: 10}} />
            <TextInput 
                placeholder="Search Pantry" 
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#999"
            />
        </View>
      </View>

      {/* --- TRASH ICON (Action Placeholder) --- */}
      <View style={styles.actionRow}>
        <View style={{flex: 1}} /> 
        <TouchableOpacity>
            <Ionicons name="trash-outline" size={28} color="#7fa668" />
        </TouchableOpacity>
      </View>

      {/* --- LIST SECTION --- */}
      {loading ? (
        <ActivityIndicator size="large" color="#4D693A" style={{marginTop: 50}} />
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item._id || Math.random().toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No upcoming expirations found!</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2ECD5",
    paddingTop: 60,
  },
  headerContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  logo: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  locationText: {
    fontSize: 16,
    fontFamily: "alexandria_regular",
    color: "#444",
    marginLeft: 5,
  },
  searchBar: {
    flexDirection: 'row',
    backgroundColor: '#F0F0F0',
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
    width: '100%',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333'
  },
  actionRow: {
    flexDirection: 'row',
    paddingHorizontal: 25,
    paddingBottom: 10,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    justifyContent: 'space-between'
  },
  imageContainer: {
    width: 70,
    height: 70,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  foodIcon: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  dateContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  dateText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  separator: {
    height: 1,
    backgroundColor: '#E0E0E0',
    width: '100%',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    color: '#888',
    fontSize: 16,
  }
});