import * as Location from'expo-location';

export async function getCurrentLocation() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted'){
        // throw new Error
    }
    return await Location.getCurrentPositionAsync({});
}