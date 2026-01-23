import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import {
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

export default function Favorites({ navigation }) {
    const [favorites, setFavorites] = useState([]);
    const isFocused = useIsFocused();

    useEffect(() => {
        if (isFocused) {
            loadFavorites();
        }
    }, [isFocused]);

    const loadFavorites = async () => {
        const savedFavs = await AsyncStorage.getItem('user_favorites');
        if (savedFavs) {
            setFavorites(JSON.parse(savedFavs));
        }
    };

    const removeFavorite = async (uri) => {
        const updatedFavs = favorites.filter(item => item !== uri);
        setFavorites(updatedFavs);
        await AsyncStorage.setItem('user_favorites', JSON.stringify(updatedFavs));
    };

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
                        style={styles.card}
                        onPress={() => navigation.navigate('Editor', { imageUri: item, selectedLanguage: { code: 'en', labels: {} } })}
                    >
                        <Image source={{ uri: item }} style={styles.img} />
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
                        <Text style={styles.emptyText}>No favorites saved yet.</Text>
                        <Text style={styles.subText}>You can save up to 10 images.</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FC' },
    listContent: { padding: 15 },
    row: { justifyContent: 'space-between' },
    card: { width: COLUMN_WIDTH, height: 200, marginBottom: 15, borderRadius: 20, overflow: 'hidden', backgroundColor: '#fff' },
    img: { width: '100%', height: '100%' },
    removeBtn: { position: 'absolute', top: 10, right: 10, backgroundColor: '#fff', borderRadius: 15, padding: 5 },
    emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 100 },
    emptyText: { fontSize: 18, fontWeight: 'bold', color: '#374151', marginTop: 20 },
    subText: { color: '#9CA3AF', marginTop: 5 }
});