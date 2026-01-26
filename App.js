import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import 'react-native-gesture-handler';
import apiClient from './src/api/apiClient';

// Screen Imports
import CategorySelection from './src/screens/CategorySelection';
import Editor from './src/screens/Editor';
import Favorites from './src/screens/Favorites';
import ImageGrid from './src/screens/ImageGrid';
import LanguageSelection from './src/screens/LanguageSelection';

const Stack = createStackNavigator();

// 1. Set the global notification handler (How alerts show when app is open)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    // Existing AdMob Init logic
    const initAds = async () => {
      if (Constants.appOwnership !== 'expo') {
        try {
          const mobileAds = require('react-native-google-mobile-ads').default;
          await mobileAds().initialize();
          console.log("AdMob SDK Initialized");
        } catch (error) {
          console.error("AdMob Initialization Error", error);
        }
      }
    };
    initAds();

    // 2. Setup Notifications logic
    const setupNotifications = async () => {
      const token = await registerForPushNotificationsAsync();
      if (token) {
        console.log("Registered Token:", token);
        // Save to your backend
        try {
          await apiClient.post('/user/save-push-token', { token });
        } catch (err) {
          console.log("Backend token save failed:", err.message);
        }
      }
    };
    setupNotifications();

    // Listeners for when notifications arrive or are tapped
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log("Notification Recv:", notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log("Notification Tapped:", response);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="LanguageSelection">
        <Stack.Screen name="LanguageSelection" component={LanguageSelection} options={{ headerShown: false }} />
        <Stack.Screen name="CategorySelection" component={CategorySelection} options={{ title: 'Select Category' }} />
        <Stack.Screen name="ImageGrid" component={ImageGrid} options={{ title: 'Choose Image' }} />
        <Stack.Screen name="Editor" component={Editor} options={{ title: 'Preview & Share' }} />
        <Stack.Screen name="Favorites" component={Favorites} options={{ title: 'My Favorites' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// 3. Helper function to register for tokens
async function registerForPushNotificationsAsync() {
  let token;

  // Notification channels are required for Android
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token: Permission not granted');
      return;
    }

    try {
      // Use the Project ID from your Expo config
      const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
      token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    } catch (e) {
      console.error("Token Fetch Error:", e);
    }
  } else {
    console.log('Push Notifications require a physical device.');
  }

  return token;
}