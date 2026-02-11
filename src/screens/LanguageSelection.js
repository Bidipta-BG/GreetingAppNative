import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Linking,
  Modal,
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
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateMetadata, setUpdateMetadata] = useState(null);

  useEffect(() => {
    checkSavedLanguage();
    fetchLanguages();
  }, []);

  const fetchLanguages = async () => {
    try {
      const res = await apiClient.get('/languages');
      const { metadata, data } = res.data;

      // Check for Force Update
      if (metadata) {
        setUpdateMetadata(metadata);
        const currentVersion = Constants.expoConfig?.version || "1.0.0";
        const minVersion = metadata.androidMinVersion;

        if (metadata.forceUpdate && compareVersions(currentVersion, minVersion) < 0) {
          setShowUpdateModal(true);
        }
      }

      setLanguages(data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // Helper to compare semantic versions (e.g. "1.0.3" vs "1.0.4")
  const compareVersions = (v1, v2) => {
    if (!v1 || !v2) return 0;
    const v1Parts = v1.split('.').map(Number);
    const v2Parts = v2.split('.').map(Number);

    for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
      const val1 = v1Parts[i] || 0;
      const val2 = v2Parts[i] || 0;
      if (val1 > val2) return 1;
      if (val1 < val2) return -1;
    }
    return 0;
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
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* FORCE UPDATE MODAL */}
      <Modal visible={showUpdateModal} transparent={false} animationType="slide">
        <View style={styles.updateContainer}>
          <LinearGradient
            colors={['#6366F1', '#4F46E5']}
            style={styles.updateIconCircle}
          >
            <Ionicons name="cloud-download" size={60} color="#fff" />
          </LinearGradient>
          <Text style={styles.updateTitle}>Update Required</Text>
          <Text style={styles.updateMsg}>
            A new version of TemplatePro is available. Please update to access the latest features and improvements.
          </Text>

          <View style={styles.versionBadge}>
            <Text style={styles.versionText}>Latest: v{updateMetadata?.androidMinVersion}</Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.updateBtn}
            onPress={() => Linking.openURL(updateMetadata?.updateUrl)}
          >
            <Text style={styles.updateBtnText}>Update Now</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </Modal>

      {/* 1. CUSTOM HEADER WITH FAV BUTTON */}
      <View style={styles.header}>
        <View style={styles.headerTextGroup}>
          <Text style={styles.brandTitle}>TemplatePro</Text>
          <Text style={styles.welcomeSub}>Select Design Language</Text>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate('Favorites')}
          style={styles.headerFavBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="heart" size={18} color="#EF4444" />
          <Text style={styles.headerFavText}>
            {savedLanguage?.labels?.favourite_btn || "Saved Designs"}
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
                  colors={['#6366F1', '#4F46E5']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={styles.resumeGradient}
                >
                  <View>
                    <Text style={styles.resumeLabel}>CONTINUE DESIGNING IN</Text>
                    <Text style={styles.resumeLang}>{savedLanguage.nativeName}</Text>
                  </View>
                  <Ionicons name="arrow-forward-circle" size={42} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            )}
            <Text style={styles.sectionTitle}>Global Libraries</Text>
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
              <Text style={[styles.nativeName, isSelected && { color: '#6366F1' }]}>{item.nativeName}</Text>
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
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // UPDATE MODAL
  updateContainer: {
    flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', padding: 30
  },
  updateIconCircle: {
    width: 120, height: 120, borderRadius: 60, justifyContent: 'center', alignItems: 'center',
    marginBottom: 30, elevation: 20, shadowColor: '#6366F1', shadowOpacity: 0.4, shadowRadius: 20
  },
  updateTitle: { fontSize: 28, fontWeight: '900', color: '#1E293B', marginBottom: 15, textAlign: 'center' },
  updateMsg: {
    fontSize: 16, color: '#64748B', textAlign: 'center', lineHeight: 24, marginBottom: 30, paddingHorizontal: 10
  },
  versionBadge: {
    backgroundColor: '#EEF2FF', paddingVertical: 6, paddingHorizontal: 16, borderRadius: 20, marginBottom: 40
  },
  versionText: { color: '#6366F1', fontWeight: '700', fontSize: 14 },
  updateBtn: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F59E0B',
    paddingVertical: 16, paddingHorizontal: 40, borderRadius: 30,
    elevation: 8, shadowColor: '#F59E0B', shadowOpacity: 0.4, shadowRadius: 10
  },
  updateBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 18, marginRight: 10 },

  // Header Styling
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingTop: 65,
    paddingBottom: 25
  },
  headerTextGroup: { flex: 1 },
  brandTitle: { fontSize: 32, fontWeight: '900', color: '#1E293B', letterSpacing: -1.5 },
  welcomeSub: { fontSize: 16, color: '#64748B', fontWeight: '600', marginTop: 2 },

  // NEW: Favorites Pill Button for Landing Screen
  headerFavBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
    elevation: 4,
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  headerFavText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E293B',
    marginLeft: 8,
  },

  listPadding: { paddingHorizontal: 20, paddingBottom: 30 },

  // Resume Card
  resumeCard: {
    borderRadius: 24, overflow: 'hidden', marginBottom: 35,
    elevation: 12, shadowColor: '#6366F1', shadowOpacity: 0.25, shadowRadius: 12
  },
  resumeGradient: { padding: 30, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  resumeLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '900', letterSpacing: 1.5 },
  resumeLang: { color: '#fff', fontSize: 28, fontWeight: '900', marginTop: 4 },

  sectionTitle: { fontSize: 20, fontWeight: '900', color: '#1E293B', marginBottom: 20, marginLeft: 5 },

  // Grid Style
  gridRow: { justifyContent: 'space-between' },
  langCard: {
    width: (width - 55) / 2,
    backgroundColor: '#fff',
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10
  },
  selectedCard: { borderColor: '#6366F1', backgroundColor: '#EEF2FF' },
  cardIcon: { width: 56, height: 56, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  cardIconInactive: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#F1F5F9' },
  cardIconActive: { backgroundColor: '#6366F1' },
  initials: { fontWeight: '900', color: '#94A3B8', fontSize: 16 },
  nativeName: { fontSize: 18, fontWeight: '900', color: '#1E293B' },
  englishName: { fontSize: 13, color: '#64748B', fontWeight: '500', marginTop: 2 }
});