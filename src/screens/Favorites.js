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

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 45) / 2;
const CARD_HEIGHT = COLUMN_WIDTH; // Keeping it square like the Image Grid

export default function Favorites({ navigation }) {
    const [favorites, setFavorites] = useState([]);
    const [userLanguage, setUserLanguage] = useState(null);
    const [loading, setLoading] = useState(true);
    const isFocused = useIsFocused();

    useEffect(() => {
        if (isFocused) {
            loadInitialData();
        }
    }, [isFocused]);

    const loadInitialData = async () => {
        try {
            setLoading(true);
            // 1. Load Saved Language for Translations
            const langData = await AsyncStorage.getItem('userLanguage');
            const parsedLang = langData ? JSON.parse(langData) : null;
            setUserLanguage(parsedLang);

            // 2. Set Header Title Dynamically
            navigation.setOptions({
                title: parsedLang?.labels?.favorites_title || "My Favorites",
                headerStyle: { backgroundColor: '#F8F9FC', elevation: 0, shadowOpacity: 0 },
                headerTitleStyle: { fontSize: 18, fontWeight: '800', color: '#1F2937' },
                headerTintColor: '#7B61FF',
            });

            // 3. Load Favorites
            const savedFavs = await AsyncStorage.getItem('user_favorites');
            if (savedFavs) {
                setFavorites(JSON.parse(savedFavs));
            }
        } catch (error) {
            console.error("Error loading Favorites page:", error);
        } finally {
            setLoading(false);
        }
    };

    const removeFavorite = async (uri) => {
        const updatedFavs = favorites.filter(item => item !== uri);
        setFavorites(updatedFavs);
        await AsyncStorage.setItem('user_favorites', JSON.stringify(updatedFavs));
    };

    if (loading) return (
        <View style={styles.center}>
            <ActivityIndicator size="large" color="#7B61FF" />
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <FlatList
                data={favorites}
                numColumns={2}
                keyExtractor={(item) => item}
                columnWrapperStyle={styles.row}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        activeOpacity={0.9}
                        style={[styles.card, { height: CARD_HEIGHT }]}
                        onPress={() => navigation.navigate('Editor', {
                            imageUri: item,
                            selectedLanguage: userLanguage // PASSING REAL LANGUAGE TO EDITOR
                        })}
                    >
                        <Image source={{ uri: item }} style={styles.img} resizeMode="cover" />
                        <TouchableOpacity
                            style={styles.removeBtn}
                            onPress={() => removeFavorite(item)}
                        >
                            <Ionicons name="heart" size={18} color="#EF4444" />
                        </TouchableOpacity>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="heart-dislike-outline" size={80} color="#D1D5DB" />
                        <Text style={styles.emptyText}>
                            {userLanguage?.labels?.no_favorites_msg || "No favorites saved yet."}
                        </Text>
                        <Text style={styles.subText}>
                            {userLanguage?.labels?.favorites_limit_msg || "You can save up to 10 images."}
                        </Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FC' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContent: { padding: 15 },
    row: { justifyContent: 'space-between' },
    card: {
        width: COLUMN_WIDTH,
        marginBottom: 15,
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#F3F4F6',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2
    },
    img: { width: '100%', height: '100%' },
    removeBtn: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderRadius: 15,
        padding: 5,
        elevation: 3
    },
    emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 100 },
    emptyText: { fontSize: 18, fontWeight: 'bold', color: '#374151', marginTop: 20, textAlign: 'center' },
    subText: { color: '#9CA3AF', marginTop: 8, textAlign: 'center' },
    exploreBtn: { marginTop: 25, paddingVertical: 12, paddingHorizontal: 25, borderRadius: 20, backgroundColor: '#F3F0FF' },
    exploreText: { color: '#7B61FF', fontWeight: 'bold' }
});