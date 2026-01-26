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

// Set the global notification handler
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
  const isAdsInitialized = useRef(false); // Ref to track AdMob status

  useEffect(() => {
    // 1. Improved AdMob Init logic
    const initAds = async () => {
      // Only initialize if not in Expo Go and not already initialized
      if (Constants.appOwnership !== 'expo' && !isAdsInitialized.current) {
        try {
          const mobileAds = require('react-native-google-mobile-ads').default;
          await mobileAds().initialize();
          isAdsInitialized.current = true;
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
        try {
          // Verify this endpoint matches your backend exactly!
          await apiClient.post('/save-push-token', { token });
        } catch (err) {
          console.log("Backend token save failed:", err.message);
        }
      }
    };
    setupNotifications();

    // 3. Listeners for foreground notifications
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log("Notification Recv:", notification);
    });

    // 4. Listeners for when notification is tapped
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log("Notification Tapped:", response);
    });

    // CLEANUP: Correctly removing subscriptions
    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
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

async function registerForPushNotificationsAsync() {
  let token;

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