import React, { useState } from 'react';
import { View, Text, FlatList, Button, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import RNPrint from 'react-native-print';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore, doc, updateDoc } from "firebase/firestore";
import app from '../firebase'
const db = getFirestore(app);

export default function OrderDetailsScreen({ route }) {
    const { order } = route.params;
    const [selectedTime, setSelectedTime] = useState('15'); // default time set to 15 minutes
    const [orderAccepted, setOrderAccepted] = useState(order.orderStatus); // New state for order acceptance
    const [loading, setLoading] = useState(false); // New state for loading

    // Extract customer and items for easier reference
    const { customer, items } = order;

    async function printReceipt(order, selectedTime) {
        const { customer, items } = order;

        let itemsContent = '';
        items.forEach(item => {
            itemsContent += `<p>${item.quantity}x ${item.name} - $${parseFloat(item.price).toFixed(2)}</p>`;
        });

        const htmlContent = `
      <h2>Receipt</h2>
      <p style="font-weight:700; text-align:center;">Order ID: ${order.id.slice(-4).toUpperCase()}</p>
      <p>Total Amount: ${(order.totalAmount / 100).toFixed(2)}</p>
  
      <h3>Customer Details</h3>
      <p>Name: ${customer.name}</p>
      <p>Email: ${customer.email}</p>
      <p>Phone: ${customer.phone}</p>
      <p>Address: ${customer.address1}, ${customer.address2 ? customer.address2 + ',' : ''} ${customer.townCity}, ${customer.postcode}</p>
      <p>Notes: <i>${order.customerNotes}</i></p>
      <h3>Items Ordered</h3>
      ${itemsContent}
  
      <p>Expected Ready Time: ${selectedTime} minutes</p>
    `;

        await RNPrint.print({ htmlContent });
    }
    const setSelectedTimeValue = async (value) => {
        setSelectedTime(value);
        const timeData = {
            id: order.id,
            time: value
        };
    
        try {
            await AsyncStorage.setItem('@selectedTime', JSON.stringify(timeData));
        } catch (error) {
            console.error("Failed to save selected time:", error);
        }
    }
    // async function refresh(){
    //     const ordersResponse = await axios.get(`https://us-central1-the-fusion-ad4ed.cloudfunctions.net/api/order/all`);

    //     if (ordersResponse.status !== 200) {
    //         throw new Error('Failed to fetch updated orders.');
    //     }

    //     // Extract the updated order from the list of all orders
    //     const updatedOrder = ordersResponse.data.find(o => o.id === order.id);

    //     // Update the order accepted state based on the fetched order data
    //     if (updatedOrder) {
    //         setOrderAccepted(updatedOrder.orderStatus);
    //     } else {
    //         throw new Error('Updated order not found in the list of orders.');
    //     }
    // }
    async function acceptOrder() {
        setLoading(true);
        try {
            // Reference to the specific order document in Firestore
            const orderRef = doc(db, "OrdersDb", order.id);
    
            // Update the order status in Firestore
            await updateDoc(orderRef, {
                orderStatus: true
            });
    
            // If you get to this line, it means the update was successful
            setOrderAccepted(true);
        } catch (error) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    }
  
    React.useEffect(() => {
        const fetchSelectedTime = async () => {
            try {
                const storedSelectedTime = await AsyncStorage.getItem('@selectedTime');
                if (storedSelectedTime !== null) {
                    const timeData = JSON.parse(storedSelectedTime);
                    if(order.id === timeData.id){
                        setSelectedTime(timeData.time);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch selected time:", error);
            }
        };
        

        fetchSelectedTime();
        //refresh();       
    }, [])
    
    

    return (
        <View style={{ padding: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Order ID: {order.id.slice(-4).toUpperCase()}</Text>
            <Text>Order Type: {order.orderType}</Text>
            <Text>Customer Notes: {order.customerNotes}</Text>

            {/* Customer Details */}
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginTop: 20 }}>Customer Details</Text>
            <Text>Name: {customer.name}</Text>
            <Text>Email: {customer.email}</Text>
            <Text>Phone: {customer.phone}</Text>
            <Text>Address: {customer.address1}, {customer.address2}, {customer.townCity}</Text>
            <Text>Post Code: {customer.postcode}</Text>

            {/* Items Details */}
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginTop: 20 }}>Items</Text>
            <FlatList
                data={items}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={{ flexDirection: 'row', marginBottom: 10, justifyContent: 'space-between' }}>
                        <Text style={{fontSize:16}}>{item.quantity}x  {item.name}</Text>
                        <Text style={{ fontSize:16,fontWeight: 'bold' }}>${parseFloat(item.price).toFixed(2)}</Text>
                    </View>
                )}
            />
            <Text style={{ borderTopWidth:1,borderTopColor: '#E0E0E0',fontSize: 16, fontWeight: 'bold', marginTop: 10,paddingTop:5 ,textAlign:'right'}}>Total Amount: ${(order.totalAmount / 100).toFixed(2)}</Text>
            <View style={{ marginTop: 20 }}>
    
                {orderAccepted ? (
                    <Text style={{ fontSize: 18, marginTop: 10 ,marginBottom:10,color:'brown'}}>
                        Order Ready Time: {selectedTime} minutes
                    </Text>
                ) : (
                    <>
                    <Text>Accept within:</Text>
                        <Picker
                            selectedValue={selectedTime}
                            onValueChange={(itemValue) => setSelectedTimeValue(itemValue)}
                        >
                            <Picker.Item label="15 minutes" value="15" />
                            <Picker.Item label="30 minutes" value="30" />
                            <Picker.Item label="45 minutes" value="45" />
                            <Picker.Item label="1 hour" value="60" />
                        </Picker>
                    </>
                )}
                    <Button
                        style={{ marginTop: 20 }}
                        title={orderAccepted ? "Order Accepted" : "Accept Order"}
                        onPress={acceptOrder}
                        disabled={loading || orderAccepted} // Disable if loading or order is accepted
                    />
            </View>

        </View>
    );
}
