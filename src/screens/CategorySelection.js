import { Ionicons } from '@expo/vector-icons';
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

const { width } = Dimensions.get('window');

export default function CategorySelection({ route, navigation }) {
    const { selectedLanguage } = route.params;
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Dynamic title based on selected language
        const nativeTitle = selectedLanguage?.labels?.select_category || "Select Category";
        
        navigation.setOptions({
            title: nativeTitle,
            headerStyle: { backgroundColor: '#F8F9FC', elevation: 0, shadowOpacity: 0 },
            headerTitleStyle: { fontSize: 20, fontWeight: '900', color: '#1F2937' },
            headerTintColor: '#7B61FF',
            // ADDED: Favorites button in the top right header
            headerRight: () => (
                <TouchableOpacity 
                    onPress={() => navigation.navigate('Favorites')}
                    style={{ marginRight: 20 }}
                    activeOpacity={0.7}
                >
                    <Ionicons name="heart" size={28} color="#EF4444" />
                </TouchableOpacity>
            ),
        });
    }, [navigation, selectedLanguage]);

    useEffect(() => {
        // Fetch categories from your backend
        apiClient.get('/categories')
            .then(res => { if (res.data.success) setCategories(res.data.data); })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    // Helper to generate different background colors for icons
    const getIconBg = (index) => {
        const colors = ['#F5F3FF', '#ECFDF5', '#FFF7ED', '#FEF2F2', '#F0F9FF'];
        return colors[index % colors.length];
    };

    // Helper to generate matching icon colors
    const getIconColor = (index) => {
        const colors = ['#7B61FF', '#10B981', '#F59E0B', '#EF4444', '#0EA5E9'];
        return colors[index % colors.length];
    };

    if (loading) return (
        <View style={styles.center}>
            <ActivityIndicator size="large" color="#7B61FF" />
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* 1. TOP AD SLOT */}
            <View style={styles.adPlaceholderTop}>
                <Text style={styles.adLabel}>Top Banner Ad</Text>
            </View>

            <FlatList
                data={categories}
                keyExtractor={item => item.slug}
                numColumns={2}
                columnWrapperStyle={styles.row}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listPadding}
                renderItem={({ item, index }) => {
                    // Get text based on language, fallback to English
                    const mainText = item.name[selectedLanguage.code] || item.name['en'];
                    
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
                                <Ionicons 
                                    name={item.slug.includes('birthday') ? 'gift-outline' : 'sparkles-outline'} 
                                    size={30} 
                                    color={getIconColor(index)} 
                                />
                            </View>
                            
                            <Text style={styles.categoryText} numberOfLines={1}>
                                {mainText}
                            </Text>
                            
                            <View style={styles.arrowCircle}>
                                <Ionicons name="chevron-forward" size={12} color="#9CA3AF" />
                            </View>
                        </TouchableOpacity>
                    );
                }}
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
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    // AD SLOTS
    adPlaceholderTop: { 
        height: 60, 
        backgroundColor: '#fff', 
        marginHorizontal: 15, 
        marginTop: 10,
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
        // Shadow for iOS
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3.84,
        // Elevation for Android
        elevation: 2,
    },
    
    iconContainer: {
        width: 60,
        height: 60,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    
    categoryText: {
        fontSize: 15,
        fontWeight: '800',
        color: '#374151',
        textAlign: 'center',
        marginBottom: 10,
    },
    
    arrowCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#F9FAFB',
        justifyContent: 'center',
        alignItems: 'center',
    }
});