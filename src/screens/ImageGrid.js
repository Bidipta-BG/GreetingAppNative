import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import apiClient from '../api/apiClient';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 45) / 2;

export default function ImageGrid({ route, navigation }) {
    const { language, category, selectedLanguage } = route.params;
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [favorites, setFavorites] = useState([]);
    
    // Hook to detect when the screen is active (important for refreshing heart icons on back navigation)
    const isFocused = useIsFocused();

    useEffect(() => {
        // Set Header Title
        const nativeTitle = selectedLanguage?.labels?.choose_image || "Choose Image";
        navigation.setOptions({
            title: nativeTitle,
            headerStyle: { backgroundColor: '#F8F9FC', elevation: 0, shadowOpacity: 0 },
            headerTitleStyle: { fontSize: 18, fontWeight: '800', color: '#1F2937' },
            headerTintColor: '#7B61FF',
        });

        // Fetch Images from API
        apiClient.get(`/images?language=${language}&category=${category}`)
            .then(res => { if (res.data.success) setImages(res.data.data); })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, [language, category]);

    // Load favorites from local storage whenever the screen is focused
    useEffect(() => {
        if (isFocused) {
            loadFavorites();
        }
    }, [isFocused]);

    const loadFavorites = async () => {
        try {
            const savedFavs = await AsyncStorage.getItem('user_favorites');
            if (savedFavs) {
                setFavorites(JSON.parse(savedFavs));
            } else {
                setFavorites([]);
            }
        } catch (error) {
            console.error("Error loading favorites in grid:", error);
        }
    };

    if (loading) return (
        <View style={styles.centerLoader}>
            <ActivityIndicator size="large" color="#7B61FF" />
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />
            
            {/* 1. TOP AD SLOT (Fixed below Header) */}
            <View style={styles.adPlaceholderTop}>
                <Text style={styles.adLabel}>Top Banner Ad</Text>
            </View>

            <FlatList 
                data={images}
                numColumns={2}
                keyExtractor={item => item._id}
                columnWrapperStyle={styles.row}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                renderItem={({item, index}) => {
                    // Check if this specific image URL exists in the favorites array
                    const isFav = favorites.includes(item.imageUrl);

                    return (
                        <TouchableOpacity 
                            activeOpacity={0.9}
                            style={[styles.card, { height: index % 3 === 0 ? 260 : 200 }]} 
                            onPress={() => navigation.navigate('Editor', { 
                                imageUri: item.imageUrl,
                                selectedLanguage: selectedLanguage 
                            })}
                        >
                            <Image source={{ uri: item.imageUrl }} style={styles.img} />
                            
                            <View style={styles.overlay}>
                                <View style={styles.favCircle}>
                                    <Ionicons 
                                        name={isFav ? "heart" : "heart-outline"} 
                                        size={16} 
                                        color={isFav ? "#EF4444" : "#7B61FF"} 
                                    />
                                </View>
                            </View>
                        </TouchableOpacity>
                    );
                }}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="images-outline" size={60} color="#D1D5DB" />
                        <Text style={styles.emptyText}>
                            {selectedLanguage?.labels?.no_regional_msg || "No greetings found."}
                        </Text>
                        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                            <Text style={styles.backBtnText}>Go Back</Text>
                        </TouchableOpacity>
                    </View>
                }
            />

            {/* 2. STICKY BOTTOM AD SLOT */}
            <View style={styles.adPlaceholderBottom}>
                 <Text style={styles.adLabel}>Bottom Banner Ad</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FC' },
    centerLoader: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    // AD SLOTS
    adPlaceholderTop: { 
        height: 60, 
        backgroundColor: '#fff', 
        marginHorizontal: 15, 
        marginVertical: 10,
        borderRadius: 12, 
        justifyContent: 'center', 
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderStyle: 'dashed'
    },
    adPlaceholderBottom: { 
        height: 70, 
        backgroundColor: '#fff', 
        justifyContent: 'center', 
        alignItems: 'center',
        borderTopWidth: 1,
        borderColor: '#E5E7EB'
    },
    adLabel: { fontSize: 10, color: '#9CA3AF', fontWeight: 'bold', letterSpacing: 1 },

    listContent: { paddingHorizontal: 15, paddingBottom: 20 },
    row: { justifyContent: 'space-between' },
    
    card: { 
        width: COLUMN_WIDTH, 
        marginBottom: 15, 
        borderRadius: 20, 
        backgroundColor: '#fff', 
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#F3F4F6'
    },
    
    img: { width: '100%', height: '100%', resizeMode: 'cover' },
    
    overlay: { position: 'absolute', top: 10, right: 10 },
    favCircle: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2
    },

    emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 50 },
    emptyText: { fontSize: 16, color: '#6B7280', textAlign: 'center', marginTop: 15 },
    backBtn: { marginTop: 20, padding: 10 },
    backBtnText: { color: '#7B61FF', fontWeight: 'bold' }
});