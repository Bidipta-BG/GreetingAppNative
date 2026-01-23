import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Constants from 'expo-constants'; // Added this
import { useEffect } from 'react';
import 'react-native-gesture-handler';

// Screen Imports
import CategorySelection from './src/screens/CategorySelection';
import Editor from './src/screens/Editor';
import Favorites from './src/screens/Favorites';
import ImageGrid from './src/screens/ImageGrid';
import LanguageSelection from './src/screens/LanguageSelection';

const Stack = createStackNavigator();

export default function App() {
  
  useEffect(() => {
    const initAds = async () => {
      // ONLY attempt to initialize if NOT in Expo Go
      if (Constants.appOwnership !== 'expo') {
        try {
          const adsModule = require('react-native-google-mobile-ads');
          const mobileAds = adsModule.default;
          await mobileAds().initialize();
          console.log("AdMob Initialized");
        } catch (error) {
          console.log("Native AdMob module not found.");
        }
      } else {
        console.log("Running in Expo Go: AdMob initialization skipped.");
      }
    };

    initAds();
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