import Constants from 'expo-constants';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

let BannerAd, BannerAdSize, TestIds;

// ONLY require the library if we are NOT in Expo Go
if (Constants.appOwnership !== 'expo') {
  try {
    const AdLib = require('react-native-google-mobile-ads');
    BannerAd = AdLib.BannerAd;
    BannerAdSize = AdLib.BannerAdSize;
    TestIds = AdLib.TestIds;
  } catch (e) {
    console.warn("AdMob library not found in native binary.");
  }
}

const REAL_AD_UNIT_ID = 'ca-app-pub-1193994269728560/1595311678'; 
const adUnitId = (TestIds) ? (__DEV__ ? TestIds.BANNER : REAL_AD_UNIT_ID) : null;

export const BannerAdSlot = () => {
  const [adError, setAdError] = useState(false);

  // Scenario 1: We are in Expo Go (BannerAd is undefined)
  // Scenario 2: Native build but missing module
  if (!BannerAd || !adUnitId || Constants.appOwnership === 'expo') {
    return (
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>Ad Slot (Preview Mode)</Text>
      </View>
    );
  }

  if (adError) return null;

  return (
    <View style={styles.container}>
      <BannerAd
        unitId={adUnitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        onAdFailedToLoad={(error) => {
          console.warn('AdMob Error:', error.message);
          setAdError(true);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: '100%', alignItems: 'center', justifyContent: 'center', minHeight: 50, paddingVertical: 5 },
  placeholder: {
    width: '100%',
    height: 50,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
    marginVertical: 5,
  },
  placeholderText: { color: '#9ca3af', fontSize: 10, fontWeight: 'bold' },
});