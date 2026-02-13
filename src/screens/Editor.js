import {
    AbrilFatface_400Regular, Acme_400Regular,
    AmaticSC_700Bold,
    ArchitectsDaughter_400Regular,
    Bangers_400Regular,
    BebasNeue_400Regular,
    Caveat_700Bold,
    Chewy_400Regular,
    Cinzel_700Bold,
    Comfortaa_700Bold,
    Cookie_400Regular,
    Creepster_400Regular,
    DancingScript_700Bold,
    FrederickatheGreat_400Regular,
    GloriaHallelujah_400Regular,
    GreatVibes_400Regular,
    Handlee_400Regular,
    IndieFlower_400Regular, KaushanScript_400Regular, LilitaOne_400Regular,
    Lobster_400Regular,
    LobsterTwo_700Bold_Italic,
    LuckiestGuy_400Regular,
    Monoton_400Regular,
    Orbitron_700Bold,
    Pacifico_400Regular,
    PatuaOne_400Regular,
    PermanentMarker_400Regular,
    PlayfairDisplay_700Bold,
    PressStart2P_400Regular,
    Righteous_400Regular,
    // NEW MEGA EXPANSION FONTS
    Sacramento_400Regular,
    Satisfy_400Regular,
    ShadowsIntoLight_400Regular,
    SpecialElite_400Regular
} from '@expo-google-fonts/dev';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts } from 'expo-font';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import * as StoreReview from 'expo-store-review';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator, Alert, Animated, Dimensions, FlatList,
    ImageBackground, PanResponder, StatusBar, StyleSheet, Text,
    TextInput, TouchableOpacity, View
} from 'react-native';
import ViewShot from 'react-native-view-shot';
import apiClient from '../api/apiClient';

// 1. ADMOB NATIVE IMPORTS
import Constants from 'expo-constants';
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

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 20;
const CARD_HEIGHT = CARD_WIDTH * 1.25;

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
// const rewardedAdUnitId = 'ca-app-pub-1193994269728560/9611804004'

const COLORS = [
    '#FFFFFF', '#000000', '#7B61FF', '#22C55E', '#EF4444',
    '#3498DB', '#F1C40F', '#E67E22', '#9B59B6', '#1ABC9C',
    '#FF69B4', '#4B0082', '#FF5733', '#C70039', '#FFD700',
    '#8B4513', '#008080', '#D2691E', '#FF4500', '#2E8B57',
    // New Colors
    '#FF8C00', '#ADFF2F', '#00CED1', '#FF00FF', '#7FFF00',
    '#FF1493', '#00BFFF', '#FF4500', '#DA70D6', '#32CD32',
    '#FFDAB9', '#E6E6FA', '#FFFACD', '#F0FFF0', '#F0F8FF',
    '#B0C4DE', '#98FB98', '#FFB6C1', '#FFA07A', '#F4A460'
];

const STYLISH_FONTS = [
    { id: '1', name: 'Default', family: 'System' },
    { id: '2', name: 'Fancy', family: 'GreatVibes_400Regular' },
    { id: '3', name: 'Modern', family: 'Lobster_400Regular' },
    { id: '4', name: 'Script', family: 'Pacifico_400Regular' },
    { id: '5', name: 'Retro', family: 'Monoton_400Regular' },
    { id: '6', name: 'Bold', family: 'PermanentMarker_400Regular' },
    { id: '7', name: 'Artistic', family: 'KaushanScript_400Regular' },
    { id: '8', name: 'Serif', family: 'AbrilFatface_400Regular' },
    { id: '9', name: 'Cursive', family: 'DancingScript_700Bold' },
    { id: '10', name: 'Classic', family: 'PlayfairDisplay_700Bold' },
    // New Fonts
    { id: '11', name: 'Hand', family: 'IndieFlower_400Regular' },
    { id: '12', name: 'Happy', family: 'GloriaHallelujah_400Regular' },
    { id: '13', name: 'Clean', family: 'Acme_400Regular' },
    { id: '14', name: 'Cartoon', family: 'LilitaOne_400Regular' },
    { id: '15', name: 'Type', family: 'SpecialElite_400Regular' },
    { id: '16', name: 'Sweet', family: 'Cookie_400Regular' },
    { id: '17', name: 'Play', family: 'Chewy_400Regular' },
    { id: '18', name: 'Futur', family: 'Righteous_400Regular' },
    { id: '19', name: 'Hero', family: 'Bangers_400Regular' },
    { id: '20', name: 'Love', family: 'Caveat_700Bold' },
    // MEGA EXPANSION
    { id: '21', name: 'Thin', family: 'Sacramento_400Regular' },
    { id: '22', name: 'Tall', family: 'BebasNeue_400Regular' },
    { id: '23', name: 'Wobbly', family: 'AmaticSC_700Bold' },
    { id: '24', name: 'Royal', family: 'Cinzel_700Bold' },
    { id: '25', name: 'Pixel', family: 'PressStart2P_400Regular' },
    { id: '26', name: 'SciFi', family: 'Orbitron_700Bold' },
    { id: '27', name: 'Bubble', family: 'LuckiestGuy_400Regular' },
    { id: '28', name: 'Brush', family: 'Satisfy_400Regular' },
    { id: '29', name: 'Doodle', family: 'ShadowsIntoLight_400Regular' },
    { id: '30', name: 'School', family: 'Handlee_400Regular' },
    { id: '31', name: 'Arch', family: 'ArchitectsDaughter_400Regular' },
    { id: '32', name: 'Scary', family: 'Creepster_400Regular' },
    { id: '33', name: 'Curve', family: 'LobsterTwo_700Bold_Italic' },
    { id: '34', name: 'Sketch', family: 'FrederickatheGreat_400Regular' },
    { id: '35', name: 'Block', family: 'PatuaOne_400Regular' },
    { id: '36', name: 'Round', family: 'Comfortaa_700Bold' },
];

import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Editor({ route, navigation }) {
    const { imageUri, selectedLanguage, greetingId, isTemplate, textLayers } = route.params;
    const insets = useSafeAreaInsets();

    let [fontsLoaded] = useFonts({
        Lobster_400Regular, Pacifico_400Regular, GreatVibes_400Regular,
        PlayfairDisplay_700Bold, Monoton_400Regular, KaushanScript_400Regular,
        AbrilFatface_400Regular, PermanentMarker_400Regular, DancingScript_700Bold,
        Caveat_700Bold, IndieFlower_400Regular, GloriaHallelujah_400Regular,
        Acme_400Regular, LilitaOne_400Regular, SpecialElite_400Regular,
        Cookie_400Regular, Chewy_400Regular, Righteous_400Regular, Bangers_400Regular,
        Sacramento_400Regular, BebasNeue_400Regular, AmaticSC_700Bold, Cinzel_700Bold,
        PressStart2P_400Regular, Orbitron_700Bold, LuckiestGuy_400Regular, Satisfy_400Regular,
        ShadowsIntoLight_400Regular, Handlee_400Regular, ArchitectsDaughter_400Regular,
        Creepster_400Regular, LobsterTwo_700Bold_Italic, FrederickatheGreat_400Regular,
        PatuaOne_400Regular, Comfortaa_700Bold
    });

    const [layers, setLayers] = useState([]);
    const panRefs = useRef([]); // Will store { id, pan, responder } for each layer

    // Initialize layers
    useEffect(() => {
        let baseLayers = [];
        if (isTemplate && textLayers && textLayers.length > 0) {
            // Convert percentages to approximate pixel positions
            baseLayers = textLayers.map((l) => ({
                id: l.id || Math.random().toString(),
                text: l.text || l.value || '',
                color: l.color || l.colour || l.hex || '#FFFFFF',
                fontSize: l.fontSize || l.size || 28,
                fontFamily: l.fontFamily || l.font || 'System',
                pan: new Animated.ValueXY({
                    x: ((l.x || 50) / 100) * CARD_WIDTH - (CARD_WIDTH / 2),
                    y: ((l.y || 50) / 100) * CARD_HEIGHT - (CARD_HEIGHT / 2)
                }),
                isLocked: false,
                isManual: false
            }));
        }

        // Always add two manual layers for the user to use via bottom buttons
        const manualLayers = [
            {
                id: 'manual_1',
                text: '',
                color: '#FFFFFF',
                fontSize: 28,
                fontFamily: 'System',
                pan: new Animated.ValueXY({ x: 0, y: -40 }),
                isLocked: false,
                isManual: true
            },
            {
                id: 'manual_2',
                text: '',
                color: '#FFFFFF',
                fontSize: 28,
                fontFamily: 'System',
                pan: new Animated.ValueXY({ x: 0, y: 40 }),
                isLocked: false,
                isManual: true
            }
        ];

        setLayers([...baseLayers, ...manualLayers]);
    }, [isTemplate, textLayers]);

    const [editingTarget, setEditingTarget] = useState(null); // Now stores the INDEX in the layers array
    const [showInput, setShowInput] = useState(false);
    const [activeTab, setActiveTab] = useState('color');
    const [isFavorite, setIsFavorite] = useState(false);
    const [isText1Unlocked, setIsText1Unlocked] = useState(false);
    const [isText2Unlocked, setIsText2Unlocked] = useState(false);
    const [isFavUnlocked, setIsFavUnlocked] = useState(false);
    const [isEmergencyUnlocked, setIsEmergencyUnlocked] = useState(false); // New State for Strategy B
    const [pendingAction, setPendingAction] = useState(null); // 'text2' or 'download'
    const [previewUri, setPreviewUri] = useState(null);
    const [isLogoActive, setIsLogoActive] = useState(true);
    const [isLogoCrossVisible, setIsLogoCrossVisible] = useState(true);
    const [showAdPopup, setShowAdPopup] = useState(false);
    const [isWaitingForAd, setIsWaitingForAd] = useState(false);
    const [isProcessingReward, setIsProcessingReward] = useState(false); // New state to show loader during delay
    const [isAdWatched, setIsAdWatched] = useState(false);
    const [previewMode, setPreviewMode] = useState('share'); // 'share' or 'download'

    const viewShotRef = useRef();
    const previewShotRef = useRef();
    const adTimeoutRef = useRef(null);

    // 2. INTERSTITIAL AD HOOK LOGIC
    const interstitial = (useInterstitialAd && interstitialAdUnitId) ? useInterstitialAd(interstitialAdUnitId, {
        requestNonPersonalizedAdsOnly: true,
    }) : { load: () => { }, show: () => { }, isLoaded: false, isClosed: false };

    const { isLoaded, show, load, isClosed, error } = interstitial;

    useEffect(() => {
        if (isWaitingForAd && isLoaded) {
            if (adTimeoutRef.current) clearTimeout(adTimeoutRef.current);
            setIsWaitingForAd(false);
            show();
        }
    }, [isLoaded, isWaitingForAd, show]);

    // EMERGENCY UNLOCK TIMER LOGIC
    // Also unlock immediately if there's an ad loading error (No Fill, Network Error, etc.)
    useEffect(() => {
        if (error) {
            // console.log("Ad failed to load:", error);
            setIsEmergencyUnlocked(true);
        }
    }, [error]);

    useEffect(() => {
        let timer;
        if (!isText2Unlocked && !isLoaded) {
            timer = setTimeout(() => {
                // console.log("15 seconds passed, ad not loaded. Enabling Emergency Unlock.");
                setIsEmergencyUnlocked(true);
            }, 30000); // 30 seconds timeout
        }
        return () => {
            if (timer) clearTimeout(timer);
            if (adTimeoutRef.current) clearTimeout(adTimeoutRef.current);
        };
    }, [isLoaded, isText2Unlocked]);

    // Auto-load the ad when the screen opens
    useEffect(() => {
        if (useInterstitialAd) load();
    }, [load]);

    // Grant the "reward" (unlock) when the interstitial is closed
    useEffect(() => {
        if (isClosed) {
            // Keep loader active for logo removal, or trigger it for others if needed
            if (pendingAction === 'logo_removal') setIsProcessingReward(true);

            // Add a small delay to allow Ad Activity to fully close prevents "Activity destroyed" crashes
            const timer = setTimeout(() => {
                if (pendingAction?.startsWith('layer_')) {
                    const index = parseInt(pendingAction.split('_')[1]);
                    setIsText2Unlocked(true); // Unlocks ALL extra layers for the session
                    setEditingTarget(index);
                    setShowInput(true);
                } else if (pendingAction === 'share' || pendingAction === 'download') {
                    setIsAdWatched(true);
                } else if (pendingAction === 'logo_removal') {
                    setIsLogoActive(false);
                } else if (pendingAction === 'text1') {
                    setIsText1Unlocked(true);
                    handleAddOrSelectLayer(layers.length - 2);
                } else if (pendingAction === 'text2') {
                    setIsText2Unlocked(true);
                    handleAddOrSelectLayer(layers.length - 1);
                } else if (pendingAction === 'fav') {
                    setIsFavUnlocked(true);
                    toggleFavorite();
                }
                setIsEmergencyUnlocked(false);
                setIsWaitingForAd(false);
                setIsProcessingReward(false); // Hide loader
                if (adTimeoutRef.current) clearTimeout(adTimeoutRef.current);
                // Don't clear pendingAction if it's share or download, so Stage 2 can use it
                if (pendingAction !== 'share' && pendingAction !== 'download') {
                    setPendingAction(null);
                }
                load();
            }, 500); // 500ms delay

            return () => clearTimeout(timer);
        }
    }, [isClosed, load, pendingAction]);

    useEffect(() => {
        navigation.setOptions({
            title: selectedLanguage?.labels?.edit_greeting || "Edit Greeting",
            headerStyle: { backgroundColor: '#121212', elevation: 0 },
            headerTintColor: '#fff',
        });
    }, [navigation]);

    useEffect(() => {
        const checkStatus = async () => {
            const favs = await AsyncStorage.getItem('user_favorites');
            if (favs) {
                const favList = JSON.parse(favs);
                setIsFavorite(favList.includes(imageUri));
            }
        };
        checkStatus();
    }, [imageUri]);

    const backgroundPanResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderGrant: () => setEditingTarget(null),
        })
    ).current;

    // PanResponder factory for the layers
    const panResponders = useRef({});
    const pressTimeouts = useRef({});

    const getPanResponder = (index) => {
        if (!layers[index]) return null;
        if (!panResponders.current[index]) {
            const panValue = layers[index].pan;
            let startTime = 0;

            panResponders.current[index] = PanResponder.create({
                onStartShouldSetPanResponder: () => true,
                onMoveShouldSetPanResponder: () => true,
                onPanResponderGrant: () => {
                    startTime = Date.now();
                    setEditingTarget(index);
                    panValue.setOffset({ x: panValue.x._value, y: panValue.y._value });
                    panValue.setValue({ x: 0, y: 0 });
                },
                onPanResponderMove: Animated.event([null, { dx: panValue.x, dy: panValue.y }], { useNativeDriver: false }),
                onPanResponderRelease: (e, gestureState) => {
                    panValue.flattenOffset();
                    const duration = Date.now() - startTime;
                    // If tap is short and movement is minimal, open text input
                    if (duration < 200 && Math.abs(gestureState.dx) < 5 && Math.abs(gestureState.dy) < 5) {
                        setEditingTarget(index);
                        setShowInput(true);
                    }
                },
            });
        }
        return panResponders.current[index];
    };

    const toggleFavorite = async () => {
        try {
            const favs = await AsyncStorage.getItem('user_favorites');
            let favList = favs ? JSON.parse(favs) : [];
            if (isFavorite) {
                favList = favList.filter(uri => uri !== imageUri);
                setIsFavorite(false);
            } else {
                if (favList.length >= 10) {
                    Alert.alert("Limit Reached", "You can only save up to 10 favorite images.");
                    return;
                }
                favList.push(imageUri);
                setIsFavorite(true);
            }
            await AsyncStorage.setItem('user_favorites', JSON.stringify(favList));
        } catch (error) { console.error("Error updating favorites", error); }
    };



    const performFinalShare = async () => {
        try {
            setShowAdPopup(false);
            setIsLogoCrossVisible(false);

            // Small delay to ensure UI updates (cross button vanishes) before capture
            setTimeout(async () => {
                try {
                    const uri = await previewShotRef.current.capture({ format: "jpg", quality: 1.0 });
                    await Sharing.shareAsync(uri);

                    if (greetingId) {
                        apiClient.patch(`/images/${greetingId}/share`).catch(err => console.error(err));
                    }

                    // [NEW] Trigger In-App Review
                    if (await StoreReview.hasAction()) {
                        StoreReview.requestReview();
                    }

                    setPreviewUri(null); // Close preview after success
                } catch (err) {
                    Alert.alert("Error", "Could not capture image.");
                } finally {
                    setIsLogoCrossVisible(true);
                }
            }, 100);
        } catch (error) {
            Alert.alert("Error", "Could not share.");
            setIsLogoCrossVisible(true);
        }
    };

    const saveToGallery = async () => {
        setEditingTarget(null);

        // Request permissions
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert("Permission required", "We need permission to save images to your gallery.");
            return;
        }

        try {
            setShowAdPopup(false);
            setIsLogoCrossVisible(false);

            // Small delay to ensure UI updates (cross button vanishes) before capture
            setTimeout(async () => {
                try {
                    const uri = await previewShotRef.current.capture({ format: "jpg", quality: 1.0 });
                    await MediaLibrary.saveToLibraryAsync(uri);

                    if (greetingId) {
                        apiClient.patch(`/images/${greetingId}/share`).catch(err => console.error(err));
                    }

                    Alert.alert("Saved!", "Image saved to your gallery successfully! ✨");

                    // Trigger In-App Review
                    if (await StoreReview.hasAction()) {
                        StoreReview.requestReview();
                    }

                    setPreviewUri(null); // Close preview after success
                    setPendingAction(null);
                } catch (err) {
                    Alert.alert("Error", "Could not capture or save image.");
                } finally {
                    setIsLogoCrossVisible(true);
                }
            }, 100);
        } catch (error) {
            Alert.alert("Error", "Could not save image to gallery.");
            setIsLogoCrossVisible(true);
            console.error(error);
        }
    };

    const handleDownloadPress = () => {
        setEditingTarget(null);
        setIsAdWatched(false); // Reset ad status for new preview
        setPreviewMode('download');

        setTimeout(async () => {
            try {
                const uri = await viewShotRef.current.capture({ format: "jpg", quality: 1.0 });
                setPreviewUri(uri);
                setPendingAction('download');
            } catch (error) {
                Alert.alert("Error", "Could not prepare preview.");
            }
        }, 150);
    };

    const handleShare = () => {
        setEditingTarget(null);
        setIsAdWatched(false); // Reset ad status for new preview
        setPreviewMode('share');

        setTimeout(async () => {
            try {
                const uri = await viewShotRef.current.capture({ format: "jpg", quality: 1.0 });
                setPreviewUri(uri);
                setPendingAction('share');
            } catch (error) {
                Alert.alert("Error", "Could not prepare preview.");
            }
        }, 150);
    };

    const handleWatchAdClick = () => {
        setIsProcessingReward(true); // Show loader immediately
        // Small delay to allow popup to close smoothness
        setTimeout(() => {
            setIsWaitingForAd(true);
            if (!isLoaded) {
                // 10 Second safety fallback
                adTimeoutRef.current = setTimeout(() => {
                    setIsWaitingForAd(false);
                    setIsProcessingReward(false); // Hide loader if ad fails
                    if (pendingAction === 'logo_removal') {
                        setIsLogoActive(false);
                    } else {
                        setIsAdWatched(true);
                    }
                }, 10000);
            }
        }, 300);
    };

    const handleAdGatedLogoRemoval = () => {
        setPendingAction('logo_removal');
        setIsProcessingReward(true); // Show loader immediately
        setIsWaitingForAd(true);

        if (!isLoaded) {
            // 10 Second safety fallback
            adTimeoutRef.current = setTimeout(() => {
                setIsWaitingForAd(false);
                setIsProcessingReward(false); // Hide loader if ad fails
                setIsLogoActive(false);
                setPendingAction(null);
            }, 10000);
        }
    };

    const handleAdGatedAction = (action, isUnlocked, callback) => {
        if (isUnlocked || isEmergencyUnlocked) {
            callback();
        } else {
            setPendingAction(action);
            setIsWaitingForAd(true);

            if (!isLoaded) {
                adTimeoutRef.current = setTimeout(() => {
                    setIsWaitingForAd(false);
                    // Force unlock and trigger action
                    if (action === 'text1') {
                        setIsText1Unlocked(true);
                        handleAddOrSelectLayer(layers.length - 2);
                    } else if (action === 'text2') {
                        setIsText2Unlocked(true);
                        handleAddOrSelectLayer(layers.length - 1);
                    } else if (action === 'fav') {
                        setIsFavUnlocked(true);
                        toggleFavorite();
                    }
                    setPendingAction(null);
                }, 10000);
            }
        }
    };

    const handleAddOrSelectLayer = (index) => {
        const layer = layers[index];
        if (!layer) return;

        setEditingTarget(index);
        setShowInput(true);
        setPendingAction(null);
    };

    const updateLayer = (index, updates) => {
        setLayers(prev => prev.map((l, i) => i === index ? { ...l, ...updates } : l));
    };

    const updateActiveColor = (color) => {
        if (editingTarget !== null) updateLayer(editingTarget, { color });
    };

    const updateActiveFont = (fontFamily) => {
        if (editingTarget !== null) updateLayer(editingTarget, { fontFamily });
    };

    const updateActiveSize = (change) => {
        if (editingTarget !== null && layers[editingTarget]) {
            updateLayer(editingTarget, { fontSize: (layers[editingTarget].fontSize || 28) + change });
        }
    };

    if (!fontsLoaded) return <View style={styles.center}><ActivityIndicator color="#7B61FF" /></View>;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            <View style={styles.canvasWrapper}>
                <BannerAdSlot unitId="ca-app-pub-1193994269728560/9803375695" />

                <ViewShot ref={viewShotRef} options={{ format: "jpg", quality: 0.9 }} style={styles.viewShot}>
                    <ImageBackground source={{ uri: imageUri }} style={styles.mainImage} resizeMode="cover" onTouchStart={() => setEditingTarget(null)}>
                        {layers.map((layer, index) => {
                            const responder = getPanResponder(index);
                            if (!layer.text && index !== editingTarget) return null;

                            return (
                                <Animated.View
                                    key={layer.id || index}
                                    {...(responder ? responder.panHandlers : {})}
                                    style={[
                                        styles.draggable,
                                        { transform: layer.pan.getTranslateTransform() },
                                        editingTarget === index && styles.activeDraggable
                                    ]}
                                >
                                    <Text style={[styles.overlayText, {
                                        color: layer.color,
                                        fontSize: layer.fontSize,
                                        fontFamily: layer.fontFamily
                                    }]}>
                                        {layer.text || (index === editingTarget ? "..." : "")}
                                    </Text>
                                </Animated.View>
                            );
                        })}
                    </ImageBackground>
                </ViewShot>
            </View>

            {editingTarget !== null && (
                <View style={[styles.editorSettingsSheet, { bottom: 92 + insets.bottom }]}>
                    <View style={styles.tabHeader}>
                        {['color', 'font', 'size'].map(tab => {
                            const tabLabel = selectedLanguage?.labels?.[`tab_${tab}`] || tab.toUpperCase();
                            return (
                                <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)} style={[styles.tabBtn, activeTab === tab && styles.activeTab]}>
                                    <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                                        {tabLabel}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                    <View style={styles.toolContent}>
                        {activeTab === 'color' && (
                            <FlatList data={COLORS} horizontal showsHorizontalScrollIndicator={false}
                                renderItem={({ item }) => (
                                    <TouchableOpacity style={[
                                        styles.colorCircle,
                                        { backgroundColor: item },
                                        layers[editingTarget]?.color === item && styles.selectedColorCircle
                                    ]} onPress={() => updateActiveColor(item)} />
                                )}
                            />
                        )}
                        {activeTab === 'font' && (
                            <FlatList data={STYLISH_FONTS} horizontal showsHorizontalScrollIndicator={false}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={[styles.fontCard, layers[editingTarget]?.fontFamily === item.family && styles.activeFontCard]}
                                        onPress={() => updateActiveFont(item.family)}
                                    >
                                        <Text style={[
                                            styles.fontCardText,
                                            { fontFamily: item.family },
                                            layers[editingTarget]?.fontFamily === item.family && { color: '#fff' }
                                        ]}>{item.name}</Text>
                                    </TouchableOpacity>
                                )}
                            />
                        )}
                        {activeTab === 'size' && (
                            <View style={styles.sizeRow}>
                                <TouchableOpacity onPress={() => updateActiveSize(-2)}><Ionicons name="remove-circle" size={32} color="#7B61FF" /></TouchableOpacity>
                                <Text style={styles.sizeVal}>{layers[editingTarget]?.fontSize || 28}</Text>
                                <TouchableOpacity onPress={() => updateActiveSize(2)}><Ionicons name="add-circle" size={32} color="#7B61FF" /></TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>
            )}

            <View style={[styles.actionBar, { paddingBottom: insets.bottom, height: 90 + insets.bottom }]}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => handleAdGatedAction('text1', isText1Unlocked, () => handleAddOrSelectLayer(layers.length - 2))}>
                    <View style={styles.iconCircle}><Ionicons name="text" size={22} color="#7B61FF" /></View>
                    <Text style={styles.actionLabel}>{selectedLanguage?.labels?.add_text_1 || "Add Text 1"}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionBtn} onPress={() => handleAdGatedAction('text2', isText2Unlocked, () => handleAddOrSelectLayer(layers.length - 1))}>
                    <View style={styles.iconCircle}><Ionicons name="text-outline" size={22} color="#7B61FF" /></View>
                    <Text style={styles.actionLabel}>{selectedLanguage?.labels?.add_text_2 || "Add Text 2"}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionBtn} onPress={() => handleAdGatedAction('fav', isFavUnlocked, toggleFavorite)}>
                    <View style={styles.iconCircle}>
                        <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={22} color={isFavorite ? "#FF4444" : "#7B61FF"} />
                    </View>
                    <Text style={styles.actionLabel}>{selectedLanguage?.labels?.favourite || "Favourite"}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionBtn} onPress={handleDownloadPress}>
                    <View style={styles.iconCircle}>
                        <Ionicons name="cloud-download" size={22} color="#7B61FF" />
                    </View>
                    <Text style={styles.actionLabel}>{selectedLanguage?.labels?.download_btn || "Download"}</Text>
                </TouchableOpacity>


                <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
                    <FontAwesome5 name="whatsapp" size={20} color="#fff" />
                    <Text style={styles.shareBtnText}>{selectedLanguage?.labels?.whatsapp_btn || "Share"}</Text>
                </TouchableOpacity>
            </View>

            {showInput && editingTarget !== null && (
                <View style={styles.fullScreenInput}>
                    <TextInput
                        style={[styles.hugeInput, {
                            color: layers[editingTarget]?.color,
                            fontFamily: layers[editingTarget]?.fontFamily
                        }]}
                        placeholder={selectedLanguage?.labels?.type_placeholder || "Type here..."}
                        placeholderTextColor="rgba(255,255,255,0.3)"
                        value={layers[editingTarget]?.text}
                        onChangeText={(txt) => updateLayer(editingTarget, { text: txt })}
                        autoFocus
                        multiline
                    />
                    <TouchableOpacity style={styles.doneBtn} onPress={() => setShowInput(false)}>
                        <Text style={styles.doneBtnText}>{selectedLanguage?.labels?.done_btn || "DONE"}</Text>
                    </TouchableOpacity>
                </View>
            )}

            {previewUri && (
                <View style={styles.previewContainer}>
                    <View style={styles.previewHeader}>
                        <TouchableOpacity onPress={() => setPreviewUri(null)} style={styles.closePreviewBtn}>
                            <Ionicons name="close" size={28} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.previewTitle}>
                            {previewMode === 'download' ? "Download Preview" : "Share Preview"}
                        </Text>
                        <View style={{ width: 28 }} />
                    </View>

                    <ViewShot ref={previewShotRef} options={{ format: "jpg", quality: 0.9 }} style={styles.previewViewShot}>
                        <ImageBackground source={{ uri: previewUri }} style={styles.previewImage}>
                            {isLogoActive && (
                                <View style={styles.previewWatermark}>
                                    {isLogoCrossVisible && (
                                        <TouchableOpacity
                                            style={styles.logoRemovalBtn}
                                            onPress={handleAdGatedLogoRemoval}
                                            disabled={isWaitingForAd && pendingAction === 'logo_removal'}
                                        >
                                            {isWaitingForAd && pendingAction === 'logo_removal' ? (
                                                <ActivityIndicator size="small" color="#FF4444" />
                                            ) : (
                                                <Ionicons name="close-circle" size={18} color="#FF4444" />
                                            )}
                                        </TouchableOpacity>
                                    )}
                                    <View style={styles.watermarkInner}>
                                        <Text style={styles.watermarkText}>Made with Greetify</Text>
                                    </View>
                                </View>
                            )}
                        </ImageBackground>
                    </ViewShot>

                    <TouchableOpacity
                        style={[styles.finalShareBtn, previewMode === 'download' && { backgroundColor: '#7B61FF' }]}
                        onPress={() => {
                            setPendingAction(previewMode);
                            setShowAdPopup(true);
                        }}
                    >
                        <FontAwesome5
                            name={previewMode === 'download' ? "download" : "whatsapp"}
                            size={22}
                            color="#fff"
                        />
                        <Text style={styles.finalShareBtnText}>
                            {previewMode === 'download' ? "Download to Gallery" : "Share to WhatsApp"}
                        </Text>
                    </TouchableOpacity>

                    {!isLogoActive && (
                        <TouchableOpacity style={styles.restoreLogoBtn} onPress={() => setIsLogoActive(true)}>
                            <Text style={styles.restoreLogoText}>Support Greetify (Add Logo)</Text>
                        </TouchableOpacity>
                    )}

                    {showAdPopup && (
                        <View style={styles.qualityOverlay}>
                            <View style={styles.qualityPopup}>
                                <Text style={styles.qualityTitle}>
                                    {isAdWatched
                                        ? (previewMode === 'download' ? "Ready to Download!" : "Ready to Share!")
                                        : "Watch an Ad"}
                                </Text>

                                <Text style={styles.adPopupText}>
                                    {isAdWatched
                                        ? `Thank you for supporting Greetify! You can now ${previewMode === 'download' ? 'save' : 'share'} your creation.`
                                        : `Watch a short video to unlock high-quality ${previewMode === 'download' ? 'downloading' : 'sharing'} and support our app development.`}
                                </Text>

                                <View style={styles.qualityActions}>
                                    <TouchableOpacity
                                        style={styles.qualityCancelBtn}
                                        onPress={() => setShowAdPopup(false)}
                                    >
                                        <Text style={styles.qualityCancelText}>Cancel</Text>
                                    </TouchableOpacity>

                                    {isAdWatched ? (
                                        <TouchableOpacity
                                            style={[styles.qualityConfirmBtn, { backgroundColor: previewMode === 'download' ? '#7B61FF' : '#22C55E' }]}
                                            onPress={previewMode === 'download' ? saveToGallery : performFinalShare}
                                        >
                                            <FontAwesome5
                                                name={previewMode === 'download' ? "download" : "whatsapp"}
                                                size={16}
                                                color="#fff"
                                            />
                                            <Text style={[styles.qualityConfirmText, { marginLeft: 8 }]}>
                                                {previewMode === 'download' ? "Download Now" : "Share Now"}
                                            </Text>
                                        </TouchableOpacity>
                                    ) : (
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
                                    )}
                                </View>
                            </View>
                        </View>
                    )}
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
                    <Text style={{ color: '#fff', marginTop: 15, fontWeight: 'bold', fontSize: 16 }}>
                        {pendingAction === 'logo_removal' ? "Removing Logo..." : "Unlocking..."}
                    </Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    canvasWrapper: { flex: 1, justifyContent: 'flex-start', alignItems: 'center', marginTop: 5, width: '100%' },
    viewShot: { width: CARD_WIDTH, height: CARD_HEIGHT, backgroundColor: '#000', overflow: 'hidden', marginVertical: 5 },
    mainImage: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
    draggable: { position: 'absolute', padding: 10, borderWidth: 1, borderColor: 'transparent' },
    activeDraggable: { borderColor: 'rgba(123, 97, 255, 0.7)', borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.1)', borderStyle: 'dashed' },
    overlayText: { textAlign: 'center', textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 5 },
    watermarkContainer: { position: 'absolute', bottom: 6, right: 6, backgroundColor: 'rgba(0,0,0,0.3)', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6 },
    watermarkText: { color: 'rgba(255,255,255,0.85)', fontSize: 10, fontWeight: '600', fontStyle: 'italic', letterSpacing: 0.5 },
    editorSettingsSheet: { position: 'absolute', bottom: 92, width: width - 30, marginHorizontal: 15, backgroundColor: '#fff', borderRadius: 20, paddingVertical: 10, paddingHorizontal: 15, elevation: 10, zIndex: 50 },
    tabHeader: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#F3F4F6', marginBottom: 10, alignItems: 'center', justifyContent: 'flex-start' },
    tabBtn: { paddingVertical: 6, marginRight: 15, borderBottomWidth: 2, borderBottomColor: 'transparent' },
    activeTab: { borderBottomColor: '#7B61FF' },
    tabText: { fontWeight: 'bold', color: '#9CA3AF', fontSize: 10 },
    activeTabText: { color: '#7B61FF' },
    toolContent: { height: 40, justifyContent: 'center' },
    colorCircle: { width: 26, height: 26, borderRadius: 13, marginRight: 12, borderWidth: 2, borderColor: '#E5E7EB' },
    selectedColorCircle: { borderColor: '#7B61FF', transform: [{ scale: 1.1 }] },
    fontCard: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, backgroundColor: '#F3F4F6', marginRight: 8 },
    activeFontCard: { backgroundColor: '#7B61FF' },
    fontCardText: { fontSize: 12, color: '#4B5563' },
    sizeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
    sizeVal: { fontSize: 18, fontWeight: 'bold', marginHorizontal: 25 },
    actionBar: { position: 'absolute', bottom: 0, width: '100%', height: 90, backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, borderTopLeftRadius: 30, borderTopRightRadius: 30, elevation: 20 },
    actionBtn: { alignItems: 'center', flex: 1 },
    iconCircle: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#F5F3FF', justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
    actionLabel: { fontSize: 9, fontWeight: '700', color: '#6B7280' },
    shareBtn: { flex: 1.5, backgroundColor: '#22C55E', height: 45, borderRadius: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginLeft: 5 },
    shareBtnText: { color: '#fff', fontWeight: 'bold', marginLeft: 5, fontSize: 14 },
    fullScreenInput: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center', zIndex: 100 },
    hugeInput: { width: '85%', fontSize: 30, textAlign: 'center' },
    doneBtn: { position: 'absolute', top: 60, right: 30 },
    doneBtnText: { color: '#7B61FF', fontWeight: '900', fontSize: 18 },
    previewContainer: { ...StyleSheet.absoluteFillObject, backgroundColor: '#000', zIndex: 200, alignItems: 'center' },
    previewHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingTop: 50, paddingHorizontal: 20, marginBottom: 20 },
    closePreviewBtn: { padding: 5 },
    previewTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    previewViewShot: { width: CARD_WIDTH, height: CARD_HEIGHT, borderRadius: 15, overflow: 'hidden' },
    previewImage: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
    previewWatermark: { position: 'absolute', bottom: 15, right: 15, flexDirection: 'row', alignItems: 'flex-start' },
    logoRemovalBtn: { position: 'absolute', top: -10, left: -10, zIndex: 10, backgroundColor: '#fff', borderRadius: 10 },
    watermarkInner: { backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
    finalShareBtn: { position: 'absolute', bottom: 60, backgroundColor: '#22C55E', width: '85%', height: 60, borderRadius: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', elevation: 10 },
    finalShareBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginLeft: 10 },
    restoreLogoBtn: { position: 'absolute', bottom: 130 },
    restoreLogoText: { color: '#7B61FF', fontWeight: 'bold', fontSize: 14 },
    qualityOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', zIndex: 300 },
    qualityPopup: { width: '85%', backgroundColor: '#fff', borderRadius: 25, padding: 25, alignItems: 'center' },
    qualityTitle: { fontSize: 22, fontWeight: '800', color: '#111827', marginBottom: 12 },
    adPopupText: { textAlign: 'center', color: '#4B5563', fontSize: 16, lineHeight: 22, marginBottom: 10 },
    qualityOption: { flexDirection: 'row', alignItems: 'center', width: '100%', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    radioCircle: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#D1D5DB', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    radioSelected: { borderColor: '#7B61FF' },
    radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#7B61FF' },
    qualityLabel: { fontSize: 16, fontWeight: '600', color: '#374151' },
    qualityActions: { flexDirection: 'row', marginTop: 25, width: '100%', justifyContent: 'space-between' },
    qualityCancelBtn: { flex: 1, paddingVertical: 12, alignItems: 'center' },
    qualityCancelText: { color: '#6B7280', fontWeight: 'bold', fontSize: 16 },
    qualityConfirmBtn: { flex: 1.2, backgroundColor: '#7B61FF', paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
    qualityConfirmText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});