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
import { BannerAdSlot } from '../components/Ads';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 45) / 2;
const CARD_HEIGHT = COLUMN_WIDTH;

export default function ImageGrid({ route, navigation }) {
    const { language, category, selectedLanguage } = route.params;
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [favorites, setFavorites] = useState([]);

    const isFocused = useIsFocused();

    useEffect(() => {
        const nativeTitle = selectedLanguage?.labels?.choose_image || "Choose Image";
        navigation.setOptions({
            title: nativeTitle,
            headerStyle: { backgroundColor: '#F8F9FC', elevation: 0, shadowOpacity: 0 },
            headerTitleStyle: { fontSize: 18, fontWeight: '800', color: '#1F2937' },
            headerTintColor: '#7B61FF',
        });

        // Backend call to fetch images for this category/language
        apiClient.get(`/images?language=${language}&category=${category}`)
            .then(res => { if (res.data.success) setImages(res.data.data); })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, [language, category]);

    useEffect(() => {
        if (isFocused) {
            loadFavorites();
        }
    }, [isFocused]);

    const loadFavorites = async () => {
        try {
            const savedFavs = await AsyncStorage.getItem('user_favorites');
            setFavorites(savedFavs ? JSON.parse(savedFavs) : []);
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

            {/* <BannerAdSlot /> */}

            <FlatList
                data={images}
                numColumns={2}
                keyExtractor={item => item._id}
                columnWrapperStyle={styles.row}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => {
                    const isFav = favorites.includes(item.imageUrl);

                    return (
                        <TouchableOpacity
                            activeOpacity={0.9}
                            style={[styles.card, { height: CARD_HEIGHT }]}
                            onPress={() => navigation.navigate('Editor', {
                                imageUri: item.imageUrl,
                                greetingId: item._id, // UPDATED: Pass the mongo _id to editor
                                selectedLanguage: selectedLanguage
                            })}
                        >
                            <Image source={{ uri: item.imageUrl }} style={styles.img} resizeMode="cover" />

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

            <BannerAdSlot unitId="ca-app-pub-1193994269728560/4141035227" />

        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FC' },
    centerLoader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    adPlaceholderTop: {
        height: 60, backgroundColor: '#fff', marginHorizontal: 15, marginVertical: 10,
        borderRadius: 12, justifyContent: 'center', alignItems: 'center',
        borderWidth: 1, borderColor: '#E5E7EB', borderStyle: 'dashed'
    },
    adPlaceholderBottom: {
        height: 70, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center',
        borderTopWidth: 1, borderColor: '#E5E7EB'
    },
    adLabel: { fontSize: 10, color: '#9CA3AF', fontWeight: 'bold', letterSpacing: 1 },
    listContent: { paddingHorizontal: 15, paddingBottom: 20 },
    row: { justifyContent: 'space-between' },
    card: {
        width: COLUMN_WIDTH, marginBottom: 15, borderRadius: 20,
        backgroundColor: '#eee', overflow: 'hidden', borderWidth: 1, borderColor: '#F3F4F6'
    },
    img: { width: '100%', height: '100%' },
    overlay: { position: 'absolute', top: 10, right: 10 },
    favCircle: {
        width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(255, 255, 255, 0.9)',
        justifyContent: 'center', alignItems: 'center', elevation: 3
    },
    emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 50 },
    emptyText: { fontSize: 16, color: '#6B7280', textAlign: 'center', marginTop: 15 },
    backBtn: { marginTop: 20, padding: 10 },
    backBtnText: { color: '#7B61FF', fontWeight: 'bold' }
});