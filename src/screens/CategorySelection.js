import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Image, // Added for S3 URL rendering
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import apiClient from '../api/apiClient';
import { BannerAdSlot } from '../components/Ads';

const { width } = Dimensions.get('window');

// Mapping simple backend strings to actual Ionicons names
const ICON_MAP = {
    "sun": "sunny-outline",
    "moon": "moon-outline",
    "sunset": "partly-sunny-outline",
    "sunrise": "cloudy-night-outline",
    "birthday": "gift-outline",
};

export default function CategorySelection({ route, navigation }) {
    const { selectedLanguage } = route.params;
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const nativeTitle = selectedLanguage?.labels?.select_category || "Select Category";
        const favLabel = selectedLanguage?.labels?.favourite_btn || "Saved";

        navigation.setOptions({
            title: nativeTitle,
            headerStyle: { backgroundColor: '#F8F9FC', elevation: 0, shadowOpacity: 0 },
            headerTitleStyle: { fontSize: 20, fontWeight: '900', color: '#1F2937' },
            headerTintColor: '#7B61FF',

            headerRight: () => (
                <TouchableOpacity
                    onPress={() => navigation.navigate('Favorites')}
                    style={styles.headerFavBtn}
                    activeOpacity={0.7}
                >
                    <Ionicons name="heart" size={16} color="#EF4444" />
                    <Text style={styles.headerFavText}>{favLabel}</Text>
                </TouchableOpacity>
            ),
        });
    }, [navigation, selectedLanguage]);

    useEffect(() => {
        apiClient.get('/categories')
            .then(res => { if (res.data.success) setCategories(res.data.data); })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const getIconBg = (index) => {
        const colors = ['#F5F3FF', '#ECFDF5', '#FFF7ED', '#FEF2F2', '#F0F9FF'];
        return colors[index % colors.length];
    };

    const getIconColor = (index) => {
        const colors = ['#7B61FF', '#10B981', '#F59E0B', '#EF4444', '#0EA5E9'];
        return colors[index % colors.length];
    };

    if (loading) return (
        <View style={styles.center}>
            <ActivityIndicator size="large" color="#7B61FF" />
        </View>
    );

    const filteredCategories = categories.filter(item => {
        const mainText = (item.name[selectedLanguage.code] || item.name['en'] || '').toLowerCase();
        return mainText.includes(searchQuery.toLowerCase());
    });

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* <BannerAdSlot /> */}

            <View style={styles.searchContainer}>
                <Ionicons name="search-outline" size={20} color="#9CA3AF" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder={selectedLanguage?.labels?.search || "Search categories..."}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor="#9CA3AF"
                    clearButtonMode="while-editing"
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <Ionicons name="close-circle" size={18} color="#9CA3AF" />
                    </TouchableOpacity>
                )}
            </View>

            <FlatList
                data={filteredCategories}
                keyExtractor={item => item.slug}
                numColumns={2}
                columnWrapperStyle={styles.row}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listPadding}
                renderItem={({ item, index }) => {
                    const mainText = item.name[selectedLanguage.code] || item.name['en'];

                    // Logic to check if the icon is a URL or a mapping key
                    const isUrl = item.icon && item.icon.startsWith('http');
                    const iconName = ICON_MAP[item.icon] || 'sparkles-outline';

                    return (
                        <TouchableOpacity
                            activeOpacity={0.8}
                            style={styles.card}
                            onPress={() => navigation.navigate('ImageGrid', {
                                language: selectedLanguage.code,
                                category: item.slug,
                                selectedLanguage: selectedLanguage
                            })}
                        >
                            <View style={[styles.iconContainer, { backgroundColor: getIconBg(index) }]}>
                                {isUrl ? (
                                    <Image
                                        source={{ uri: item.icon }}
                                        style={styles.dynamicIcon}
                                        resizeMode="contain"
                                    />
                                ) : (
                                    <Ionicons
                                        name={iconName}
                                        size={30}
                                        color={getIconColor(index)}
                                    />
                                )}
                            </View>
                            <Text style={styles.categoryText} numberOfLines={1}>{mainText}</Text>
                            <View style={styles.arrowCircle}>
                                <Ionicons name="chevron-forward" size={12} color="#9CA3AF" />
                            </View>
                        </TouchableOpacity>
                    );
                }}
            />

            <BannerAdSlot unitId="ca-app-pub-1193994269728560/8434453703" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FC' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    headerFavBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        marginRight: 15,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    headerFavText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#374151',
        marginLeft: 6,
    },
    adPlaceholderTop: {
        height: 60, backgroundColor: '#fff', marginHorizontal: 15, marginTop: 10,
        borderRadius: 12, justifyContent: 'center', alignItems: 'center',
        borderWidth: 1, borderColor: '#E5E7EB', borderStyle: 'dashed'
    },
    adPlaceholderBottom: {
        height: 70, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center',
        borderTopWidth: 1, borderColor: '#E5E7EB'
    },
    adLabel: { fontSize: 10, color: '#9CA3AF', fontWeight: 'bold', letterSpacing: 1 },
    listPadding: { padding: 15, paddingBottom: 20 },
    row: { justifyContent: 'space-between' },
    card: {
        backgroundColor: '#fff',
        width: (width - 45) / 2,
        padding: 20,
        borderRadius: 24,
        marginBottom: 15,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F3F4F6',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3.84,
        elevation: 2,
    },
    iconContainer: {
        width: 60, height: 60, borderRadius: 18,
        justifyContent: 'center', alignItems: 'center', marginBottom: 12,
    },
    dynamicIcon: {
        width: 35,
        height: 35,
    },
    categoryText: { fontSize: 15, fontWeight: '800', color: '#374151', textAlign: 'center', marginBottom: 10 },
    arrowCircle: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#F9FAFB', justifyContent: 'center', alignItems: 'center' },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        marginHorizontal: 15,
        marginTop: 15,
        marginBottom: 5,
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#1F2937',
        fontWeight: '500',
        paddingVertical: 0, // Fix for Android vertical padding
    },
});