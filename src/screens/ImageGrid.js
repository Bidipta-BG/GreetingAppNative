import {
    AbrilFatface_400Regular, Acme_400Regular, AmaticSC_700Bold, ArchitectsDaughter_400Regular,
    Bangers_400Regular, BebasNeue_400Regular, Caveat_700Bold, Chewy_400Regular, Cinzel_700Bold,
    Comfortaa_700Bold, Cookie_400Regular, Creepster_400Regular, DancingScript_700Bold,
    FrederickatheGreat_400Regular, GloriaHallelujah_400Regular, GreatVibes_400Regular,
    Handlee_400Regular, IndieFlower_400Regular, KaushanScript_400Regular, LilitaOne_400Regular,
    Lobster_400Regular, LobsterTwo_700Bold_Italic, LuckiestGuy_400Regular, Monoton_400Regular,
    Orbitron_700Bold, Pacifico_400Regular, PatuaOne_400Regular, PermanentMarker_400Regular,
    PlayfairDisplay_700Bold, PressStart2P_400Regular, Righteous_400Regular, Sacramento_400Regular,
    Satisfy_400Regular, ShadowsIntoLight_400Regular, SpecialElite_400Regular
} from '@expo-google-fonts/dev';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import Constants from 'expo-constants';
import { useFonts } from 'expo-font';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    ImageBackground,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import apiClient from '../api/apiClient';
import { BannerAdSlot } from '../components/Ads';

let useInterstitialAd, TestIds;
if (Constants.appOwnership !== 'expo') {
    try {
        const AdLib = require('react-native-google-mobile-ads');
        useInterstitialAd = AdLib.useInterstitialAd;
        TestIds = AdLib.TestIds;
    } catch (e) {
        console.warn("AdMob library not found in native binary.");
    }
}

// Interstitial Ad IDs Rotation
const INTERSTITIAL_IDS = [
    'ca-app-pub-1193994269728560/6348136406',
    'ca-app-pub-1193994269728560/4644182237',
    'ca-app-pub-1193994269728560/7924951695'
];

const getRandomAdId = () => {
    if (!TestIds) return null;
    if (__DEV__) return TestIds.INTERSTITIAL;
    return INTERSTITIAL_IDS[Math.floor(Math.random() * INTERSTITIAL_IDS.length)];
};

const interstitialAdUnitId = getRandomAdId();

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 45) / 2;
const CARD_HEIGHT = COLUMN_WIDTH * 1.25; // Matching Editor.js aspect ratio (4:5)
const EDITOR_WIDTH = width - 20;
const SCALE = COLUMN_WIDTH / EDITOR_WIDTH;

// --- OPTIMIZED IMAGE CARD COMPONENT ---
// Keeps its own loading state to prevent whole grid re-renders
const ImageCard = memo(({ item, isFav, onPress }) => {
    const [isLoading, setIsLoading] = useState(true);

    return (
        <TouchableOpacity
            activeOpacity={0.9}
            style={[styles.card, { height: CARD_HEIGHT }]}
            onPress={() => onPress(item)}
        >
            {isLoading && (
                <View style={styles.imageLoaderContainer}>
                    <ActivityIndicator size="small" color="#7B61FF" />
                </View>
            )}

            <ImageBackground
                source={{ uri: item.imageUrl }}
                style={styles.img}
                resizeMode="cover"
                onLoadStart={() => setIsLoading(true)}
                onLoadEnd={() => setIsLoading(false)}
            >
                {item.isTemplate && item.textLayers && (
                    <View style={styles.templateOverlay}>
                        {item.textLayers.map((layer, idx) => (
                            <View key={layer.id || idx} style={[
                                styles.miniDraggable,
                                {
                                    transform: [
                                        { translateX: (layer.x / 100) * COLUMN_WIDTH - (COLUMN_WIDTH / 2) },
                                        { translateY: (layer.y / 100) * CARD_HEIGHT - (CARD_HEIGHT / 2) }
                                    ]
                                }
                            ]}>
                                <Text style={{
                                    color: layer.color || layer.hex || '#fff',
                                    fontSize: (layer.fontSize || 28) * SCALE,
                                    fontFamily: layer.fontFamily || 'System',
                                    textAlign: 'center'
                                }}>
                                    {layer.text}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}
            </ImageBackground>

            {item.isTemplate && (
                <View style={styles.premiumOverlay}>
                    <View style={styles.premiumCircle}>
                        <FontAwesome5 name="crown" size={10} color="#fff" />
                    </View>
                </View>
            )}

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
}, (prev, next) => {
    return prev.item._id === next.item._id && prev.isFav === next.isFav;
});

export default function ImageGrid({ route, navigation }) {
    const { language, category, selectedLanguage } = route.params;
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [favorites, setFavorites] = useState([]);
    // Removed specific imageLoadingStates - now handled inside ImageCard
    const [unlockedTemplates, setUnlockedTemplates] = useState([]);
    const [pendingTemplate, setPendingTemplate] = useState(null);
    const [showAdPopup, setShowAdPopup] = useState(false);
    const [isWaitingForAd, setIsWaitingForAd] = useState(false);
    const [isProcessingReward, setIsProcessingReward] = useState(false); // New state to show loader during delay
    const [isAdWatched, setIsAdWatched] = useState(false);

    const adTimeoutRef = useRef(null);

    const isFocused = useIsFocused();

    let [fontsLoaded] = useFonts({
        AbrilFatface_400Regular, Acme_400Regular, AmaticSC_700Bold, ArchitectsDaughter_400Regular,
        Bangers_400Regular, BebasNeue_400Regular, Caveat_700Bold, Chewy_400Regular, Cinzel_700Bold,
        Comfortaa_700Bold, Cookie_400Regular, Creepster_400Regular, DancingScript_700Bold,
        FrederickatheGreat_400Regular, GloriaHallelujah_400Regular, GreatVibes_400Regular,
        Handlee_400Regular, IndieFlower_400Regular, KaushanScript_400Regular, LilitaOne_400Regular,
        Lobster_400Regular, LobsterTwo_700Bold_Italic, LuckiestGuy_400Regular, Monoton_400Regular,
        Orbitron_700Bold, Pacifico_400Regular, PatuaOne_400Regular, PermanentMarker_400Regular,
        PlayfairDisplay_700Bold, PressStart2P_400Regular, Righteous_400Regular, Sacramento_400Regular,
        Satisfy_400Regular, ShadowsIntoLight_400Regular, SpecialElite_400Regular
    });

    // 2. INTERSTITIAL AD HOOK LOGIC
    const interstitial = (useInterstitialAd && interstitialAdUnitId) ? useInterstitialAd(interstitialAdUnitId, {
        requestNonPersonalizedAdsOnly: true,
    }) : { load: () => { }, show: () => { }, isLoaded: false, isClosed: false, error: null };

    const { isLoaded, show, load, isClosed, error } = interstitial;

    useEffect(() => {
        if (isWaitingForAd && isLoaded) {
            if (adTimeoutRef.current) clearTimeout(adTimeoutRef.current);
            setIsWaitingForAd(false);
            show();
        }
    }, [isLoaded, isWaitingForAd, show]);

    // Auto-load the ad when the screen opens
    useEffect(() => {
        if (useInterstitialAd) load();
    }, [load]);

    // Grant the "reward" (unlock) when the interstitial is closed
    useEffect(() => {
        if (isClosed) {
            setIsProcessingReward(true); // Show loader immediately
            // Add a small delay to allow Ad Activity to fully close prevents "Activity destroyed" crashes
            const timer = setTimeout(() => {
                if (pendingTemplate) {
                    navigateToEditor(pendingTemplate);
                }
                setIsWaitingForAd(false);
                setIsProcessingReward(false); // Hide loader
                setPendingTemplate(null);
                load();
            }, 500); // 500ms delay

            return () => clearTimeout(timer);
        }
    }, [isClosed, load, pendingTemplate]);

    useEffect(() => {
        const nativeTitle = selectedLanguage?.labels?.choose_image || "Choose Template";
        navigation.setOptions({
            title: nativeTitle,
            headerStyle: { backgroundColor: '#F8F9FC', elevation: 0, shadowOpacity: 0 },
            headerTitleStyle: { fontSize: 18, fontWeight: '800', color: '#1F2937' },
            headerTintColor: '#7B61FF',
        });

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

    // Callback for card press - memoized to prevent re-creation
    const handleCardPress = useCallback((item) => {
        // Direct entry if already unlocked OR not a template
        if (!item.isTemplate || unlockedTemplates.includes(item.imageUrl)) {
            navigateToEditor(item);
            return;
        }

        // Otherwise show supportive popup
        setPendingTemplate(item);
        setShowAdPopup(true);
    }, [unlockedTemplates, navigateToEditor]); // Depend on unlock state

    const handleWatchAdClick = () => {
        setShowAdPopup(false);
        setIsProcessingReward(true); // Show loader immediately even before ad starts

        // Small delay to allow popup to close smoothness
        setTimeout(() => {
            setIsWaitingForAd(true);
            // If checking for timeout, we can set it here
            if (!isLoaded) {
                // 10 Second safety fallback
                adTimeoutRef.current = setTimeout(() => {
                    setIsWaitingForAd(false);
                    setIsProcessingReward(false); // Hide loader if ad fails
                    if (pendingTemplate) {
                        navigateToEditor(pendingTemplate);
                    }
                    setPendingTemplate(null);
                }, 10000);
            }
        }, 300);
    };

    const navigateToEditor = useCallback((item) => {
        navigation.navigate('Editor', {
            imageUri: item.imageUrl,
            greetingId: item._id,
            selectedLanguage: selectedLanguage,
            isTemplate: item.isTemplate,
            textLayers: item.textLayers
        });
    }, [navigation, selectedLanguage]);

    const renderItem = useCallback(({ item }) => (
        <ImageCard
            item={item}
            isFav={favorites.includes(item.imageUrl)}
            onPress={handleCardPress}
        />
    ), [favorites, handleCardPress]);

    const getItemLayout = useCallback((data, index) => ({
        length: CARD_HEIGHT + 15, // Height + MarginBottom
        offset: (CARD_HEIGHT + 15) * Math.floor(index / 2), // 2 Columns
        index,
    }), []);

    if (loading || !fontsLoaded) return (
        <View style={styles.centerLoader}>
            <ActivityIndicator size="large" color="#7B61FF" />
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />

            <FlatList
                data={images}
                numColumns={2}
                keyExtractor={item => item._id}
                columnWrapperStyle={styles.row}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                renderItem={renderItem}
                initialNumToRender={8} // Render screen worth first
                maxToRenderPerBatch={8}
                windowSize={5} // Keep less offscreen
                removeClippedSubviews={true} // Unmount offscreen
                getItemLayout={getItemLayout} // Optimize scrolling
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

            {showAdPopup && (
                <View style={styles.qualityOverlay}>
                    <View style={styles.qualityPopup}>
                        <View style={styles.popupIconWrapper}>
                            <FontAwesome5 name="magic" size={30} color="#7B61FF" />
                        </View>
                        <Text style={styles.qualityTitle}>Premium Template</Text>
                        <Text style={styles.adPopupText}>
                            Watch a short video to use this professional template.
                        </Text>
                        <View style={styles.qualityActions}>
                            <TouchableOpacity
                                style={styles.qualityCancelBtn}
                                onPress={() => {
                                    setShowAdPopup(false);
                                    setPendingTemplate(null);
                                }}
                            >
                                <Text style={styles.qualityCancelText}>Not Now</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.qualityConfirmBtn}
                                onPress={handleWatchAdClick}
                                disabled={isWaitingForAd}
                            >
                                {isWaitingForAd ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <>
                                        <FontAwesome5 name="play" size={12} color="#fff" />
                                        <Text style={[styles.qualityConfirmText, { marginLeft: 8 }]}>Watch Ad</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )}

            {isWaitingForAd && !showAdPopup && (
                <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }]}>
                    <ActivityIndicator size="large" color="#7B61FF" />
                    <Text style={{ color: '#fff', marginTop: 15, fontWeight: 'bold' }}>Loading Ad...</Text>
                </View>
            )}

            {isProcessingReward && (
                <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', zIndex: 1001 }]}>
                    <ActivityIndicator size="large" color="#22C55E" />
                    <Text style={{ color: '#fff', marginTop: 15, fontWeight: 'bold', fontSize: 16 }}>Unlocking Template...</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FC' },
    centerLoader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    imageLoaderContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#eee',
        zIndex: 1
    },
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
        backgroundColor: '#eee', overflow: 'hidden', borderWidth: 1, borderColor: '#F3F4F6',
        elevation: 2
    },
    img: { width: '100%', height: '100%' },
    templateOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center'
    },
    miniDraggable: {
        position: 'absolute',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center'
    },
    overlay: { position: 'absolute', top: 10, right: 10, zIndex: 2 },
    favCircle: {
        width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(255, 255, 255, 0.9)',
        justifyContent: 'center', alignItems: 'center', elevation: 3
    },
    emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 50 },
    emptyText: { fontSize: 16, color: '#6B7280', textAlign: 'center', marginTop: 15 },
    backBtn: { marginTop: 20, padding: 10 },
    backBtnText: { color: '#7B61FF', fontWeight: 'bold' },
    premiumOverlay: { position: 'absolute', top: 10, left: 10, zIndex: 2 },
    premiumCircle: {
        width: 26, height: 26, borderRadius: 13, backgroundColor: '#7B61FF',
        justifyContent: 'center', alignItems: 'center', elevation: 3,
        borderWidth: 1, borderColor: '#fff'
    },
    qualityOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    qualityPopup: { width: '85%', backgroundColor: '#fff', borderRadius: 25, padding: 25, alignItems: 'center' },
    popupIconWrapper: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#F5F3FF', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
    qualityTitle: { fontSize: 22, fontWeight: '800', color: '#111827', marginBottom: 8 },
    adPopupText: { textAlign: 'center', color: '#4B5563', fontSize: 15, lineHeight: 22, marginBottom: 20 },
    qualityActions: { flexDirection: 'row', width: '100%', justifyContent: 'space-between' },
    qualityCancelBtn: { flex: 1, paddingVertical: 12, alignItems: 'center' },
    qualityCancelText: { color: '#6B7280', fontWeight: 'bold', fontSize: 16 },
    qualityConfirmBtn: { flex: 1.2, backgroundColor: '#7B61FF', paddingVertical: 12, borderRadius: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
    qualityConfirmText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});