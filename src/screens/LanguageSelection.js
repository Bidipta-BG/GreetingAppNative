import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import apiClient from '../api/apiClient';
import { BannerAdSlot } from '../components/Ads';

const { width, height } = Dimensions.get('window');

export default function LanguageSelection({ navigation }) {
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savedLanguage, setSavedLanguage] = useState(null);

  useEffect(() => {
    checkSavedLanguage();
    fetchLanguages();
  }, []);

  const fetchLanguages = async () => {
    try {
      const res = await apiClient.get('/languages');
      setLanguages(res.data.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const checkSavedLanguage = async () => {
    const langData = await AsyncStorage.getItem('userLanguage');
    if (langData) {
      setSavedLanguage(JSON.parse(langData));
    }
  };

  const selectLanguage = async (langItem) => {
    await AsyncStorage.setItem('userLanguage', JSON.stringify(langItem));
    setSavedLanguage(langItem);
    navigation.navigate('CategorySelection', { selectedLanguage: langItem });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7B61FF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* 1. CUSTOM HEADER WITH FAV BUTTON */}
      <View style={styles.header}>
        <View style={styles.headerTextGroup}>
          <Text style={styles.brandTitle}>Greetings</Text>
          <Text style={styles.welcomeSub}>Choose your language</Text>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate('Favorites')}
          style={styles.headerFavBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="heart" size={16} color="#EF4444" />
          <Text style={styles.headerFavText}>
            {/* Logic to change text based on selected language */}
            {savedLanguage?.labels?.favourite_btn || "Favorite"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* <BannerAdSlot /> */}

      <FlatList
        data={languages}
        keyExtractor={(item) => item.code}
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        contentContainerStyle={styles.listPadding}
        ListHeaderComponent={
          <>
            {savedLanguage && (
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => navigation.navigate('CategorySelection', { selectedLanguage: savedLanguage })}
                style={styles.resumeCard}
              >
                <LinearGradient
                  colors={['#7B61FF', '#9333EA']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={styles.resumeGradient}
                >
                  <View>
                    <Text style={styles.resumeLabel}>CONTINUE WITH</Text>
                    <Text style={styles.resumeLang}>{savedLanguage.nativeName}</Text>
                  </View>
                  <Ionicons name="chevron-forward-circle" size={40} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            )}
            <Text style={styles.sectionTitle}>Other Languages</Text>
          </>
        }
        renderItem={({ item }) => {
          const isSelected = savedLanguage?.code === item.code;
          return (
            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.langCard, isSelected && styles.selectedCard]}
              onPress={() => selectLanguage(item)}
            >
              <View style={[styles.cardIcon, isSelected ? styles.cardIconActive : styles.cardIconInactive]}>
                <Text style={[styles.initials, isSelected && { color: '#fff' }]}>
                  {item.code.toUpperCase()}
                </Text>
              </View>
              <Text style={[styles.nativeName, isSelected && { color: '#7B61FF' }]}>{item.nativeName}</Text>
              <Text style={styles.englishName}>{item.name}</Text>
            </TouchableOpacity>
          );
        }}
      />

      <BannerAdSlot unitId="ca-app-pub-1193994269728560/1595311678" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FC' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Header Styling
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingTop: 60,
    paddingBottom: 20
  },
  headerTextGroup: { flex: 1 },
  brandTitle: { fontSize: 28, fontWeight: '900', color: '#1F2937', letterSpacing: -1 },
  welcomeSub: { fontSize: 15, color: '#6B7280', fontWeight: '500' },

  // NEW: Favorites Pill Button for Landing Screen
  headerFavBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    // Soft shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  headerFavText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginLeft: 6,
  },

  listPadding: { paddingHorizontal: 20, paddingBottom: 20 },

  // Resume Card
  resumeCard: { borderRadius: 20, overflow: 'hidden', marginBottom: 30, elevation: 8, shadowColor: '#7B61FF', shadowOpacity: 0.2, shadowRadius: 10 },
  resumeGradient: { padding: 25, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  resumeLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: 'bold', letterSpacing: 1 },
  resumeLang: { color: '#fff', fontSize: 26, fontWeight: 'bold' },

  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1F2937', marginBottom: 15 },

  // Grid Style
  gridRow: { justifyContent: 'space-between' },
  langCard: {
    width: (width - 55) / 2,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#F3F4F6'
  },
  selectedCard: { borderColor: '#7B61FF', backgroundColor: '#F5F3FF' },
  cardIcon: { width: 50, height: 50, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  cardIconInactive: { backgroundColor: '#F9FAFB' },
  cardIconActive: { backgroundColor: '#7B61FF' },
  initials: { fontWeight: 'bold', color: '#9CA3AF' },
  nativeName: { fontSize: 17, fontWeight: 'bold', color: '#374151' },
  englishName: { fontSize: 13, color: '#9CA3AF' }
});