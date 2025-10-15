import * as Notifications from 'expo-notifications';
import mongoose from 'mongoose';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Important primary function to alert for expiring foods
// Try to take a date and just subtract a week to start notifying
export const expireNotification = async (date, title, body) => {
    await Notifications.scheduleNotificationAsync({
        content: {
            title: "Items Expiring!",
            body: {/* Eventually put the exact items from data base*/},
        },
        trigger: date,
    });
}


// Primary focus on alerting if ingredients are low!
export async function reminderNotification() {
    const { status } = await Notifications.requestPermissionsAsync()
        if (status !== 'granted') {
            throw new Error('No Permission');
        }
    const token = (await Notifications.getExpoPushTokenAsync()).data;
    return token;
}

// Eventual alert system based on proximety check
export async function reminderNotification() {
    const { status } = await Notifications.requestPermissionsAsync()
        if (status !== 'granted') {
            throw new Error('No Permission');
        }
    const token = (await Notifications.getExpoPushTokenAsync()).data;
    return token;
}