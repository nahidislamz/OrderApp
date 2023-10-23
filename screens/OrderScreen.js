import React, { useEffect, useState ,useRef} from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import app from '../firebase'
import { getFirestore, collection,onSnapshot } from "firebase/firestore";
const db = getFirestore(app);
import Sound from 'react-native-sound';
const soundFile = require('../assets/sounds/ring.mp3');

export default function OrdersScreen({navigation}) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  // Reference to the sound instance
  const soundRef = useRef();

  useEffect(() => {
    soundRef.current = new Sound(soundFile, Sound.MAIN_BUNDLE, (error) => {
      if (error) {
        console.log('Failed to load the sound', error);
      }
    });
    // Clean up on component unmount
    return () => soundRef.current && soundRef.current.release();
  }, []);

  useEffect(() => {
    const ordersRef = collection(db, "OrdersDb");
    const unsubscribe = onSnapshot(ordersRef, (snapshot) => { 
      const fetchedOrders = [];
      snapshot.forEach((doc) => {
        const orderData = doc.data();
        fetchedOrders.push({ id: doc.id, ...orderData });
      });
      const data = JSON.stringify(fetchedOrders);
      const parsedOrders = JSON.parse(data);
      const sortedData = parsedOrders.sort((a, b) => {
        const timeA = (a.timestamp.seconds * 1000) + (a.timestamp.nanoseconds / 1000000);
        const timeB = (b.timestamp.seconds * 1000) + (b.timestamp.nanoseconds / 1000000);
      
        return timeB - timeA; // descending order
      });

      setOrders(sortedData);
      setLoading(false);
    }, (error) => {
      console.error(error);
      setLoading(false);
    });

    // Clean up the listener on component unmount
    return () => {
      unsubscribe();
    };

}, []);

    useEffect(() => {
        // Check for new orders or changes in order status
        if (orders.some(order => !order.orderStatus)) {
          soundRef.current.setNumberOfLoops(-1);
          soundRef.current.play(); // Play the ring sound for a new order
        } else {
          soundRef.current.stop(); // Stop the ring sound when all orders are accepted
        }
    }, [orders]);

  const renderItem = ({ item }) => (
    <TouchableOpacity 
        style={{ padding:10, borderBottomWidth: 1, borderBottomColor: '#ccc',
        flexDirection: 'row', marginBottom: 10, justifyContent: 'space-between' }}
        onPress={() => navigation.navigate('OrderDetails', { order: item })}
    >
    <View>
    <Text style={{fontSize:18, fontWeight: '500'}}>Order ID: {item.id.slice(-4).toUpperCase()}</Text>
    <Text style={{fontSize:16}}>Total Amount: ${item.totalAmount/100}</Text>
    {item.timestamp && (
        <>
            <Text style={{fontSize:14}}>Date: {new Date(item.timestamp.seconds * 1000).toLocaleDateString()}</Text>
            <Text style={{fontSize:14}}>Time: {new Date(item.timestamp.seconds * 1000).toLocaleTimeString()}</Text>
        </>
    )}
    </View>
    <Text 
      style={{
        textAlign:'right',
        color: item.orderType.toLowerCase() === 'collection' ? 'darkturquoise' : 'seagreen'
      }}
    >
      {item.orderType.toUpperCase()}
    </Text>
  </TouchableOpacity>
  );

  return (
    <View>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={orders}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
        />
      )}
    </View>
  );
}
