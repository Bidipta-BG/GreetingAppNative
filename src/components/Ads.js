import Constants from 'expo-constants';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

let BannerAd, BannerAdSize, TestIds;

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

// Default ID (used if no specific ID is passed to the component)
const DEFAULT_BANNER_ID = 'ca-app-pub-1193994269728560/1595311678';

// We accept "unitId" as a prop now
export const BannerAdSlot = ({ unitId }) => {
  const [adError, setAdError] = useState(false);
  const insets = useSafeAreaInsets(); // Hook for safe area

  // Logic: Use Test ID in Dev mode, otherwise use the provided unitId or the Default one
  // const finalAdUnitId = unitId || DEFAULT_BANNER_ID; //for real ads in dev mode
  const finalAdUnitId = (TestIds) ? (__DEV__ ? TestIds.BANNER : (unitId || DEFAULT_BANNER_ID)) : null;

  if (!BannerAd || !finalAdUnitId || Constants.appOwnership === 'expo') {
    return (
      <View style={[styles.placeholder, { marginBottom: insets.bottom }]}>
        <Text style={styles.placeholderText}>Ad Slot (Preview Mode)</Text>
      </View>
    );
  }

  if (adError) return null;

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <BannerAd
        unitId={finalAdUnitId}
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