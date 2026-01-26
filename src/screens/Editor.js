import {
    AbrilFatface_400Regular, DancingScript_700Bold, GreatVibes_400Regular,
    KaushanScript_400Regular, Lobster_400Regular, Monoton_400Regular,
    Pacifico_400Regular, PermanentMarker_400Regular, PlayfairDisplay_700Bold
} from '@expo-google-fonts/dev';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts } from 'expo-font';
import * as Sharing from 'expo-sharing';
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

let useRewardedAd, TestIds;
if (Constants.appOwnership !== 'expo') {
    try {
        const AdLib = require('react-native-google-mobile-ads');
        useRewardedAd = AdLib.useRewardedAd;
        TestIds = AdLib.TestIds;
    } catch (e) {
        console.warn("AdMob library not found in native binary.");
    }
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 20;
const CARD_HEIGHT = CARD_WIDTH * 1.25;

// Rewarded Test ID for Video Ads
const rewardedAdUnitId = (TestIds) ? (__DEV__ ? TestIds.REWARDED : 'ca-app-pub-1193994269728560/9611804004') : null;
// const rewardedAdUnitId = 'ca-app-pub-1193994269728560/9611804004'

const COLORS = [
    '#FFFFFF', '#000000', '#7B61FF', '#22C55E', '#EF4444',
    '#3498DB', '#F1C40F', '#E67E22', '#9B59B6', '#1ABC9C',
    '#FF69B4', '#4B0082', '#FF5733', '#C70039', '#FFD700',
    '#8B4513', '#008080', '#D2691E', '#FF4500', '#2E8B57'
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
];

export default function Editor({ route, navigation }) {
    const { imageUri, selectedLanguage, greetingId } = route.params;

    let [fontsLoaded] = useFonts({
        Lobster_400Regular, Pacifico_400Regular, GreatVibes_400Regular,
        PlayfairDisplay_700Bold, Monoton_400Regular, KaushanScript_400Regular,
        AbrilFatface_400Regular, PermanentMarker_400Regular, DancingScript_700Bold
    });

    const [text1, setText1] = useState('');
    const [textColor1, setTextColor1] = useState('#FFFFFF');
    const [fontSize1, setFontSize1] = useState(28);
    const [fontFamily1, setFontFamily1] = useState('System');
    const pan1 = useRef(new Animated.ValueXY()).current;

    const [text2, setText2] = useState('');
    const [textColor2, setTextColor2] = useState('#FFFFFF');
    const [fontSize2, setFontSize2] = useState(28);
    const [fontFamily2, setFontFamily2] = useState('System');
    const pan2 = useRef(new Animated.ValueXY()).current;

    const [editingTarget, setEditingTarget] = useState(null);
    const [showInput, setShowInput] = useState(false);
    const [activeTab, setActiveTab] = useState('color');
    const [isFavorite, setIsFavorite] = useState(false);
    const [isText2Unlocked, setIsText2Unlocked] = useState(false);
    const [isEmergencyUnlocked, setIsEmergencyUnlocked] = useState(false); // New State for Strategy B
    const [watermarkVisible, setWatermarkVisible] = useState(false);

    const viewShotRef = useRef();

    // 2. REWARDED AD HOOK LOGIC
    const rewarded = (useRewardedAd && rewardedAdUnitId) ? useRewardedAd(rewardedAdUnitId, {
        requestNonPersonalizedAdsOnly: true,
    }) : { load: () => { }, show: () => { }, isLoaded: false, isEarnedReward: false, isClosed: false };

    const { isLoaded, isEarnedReward, show, load, isClosed } = rewarded;

    // EMERGENCY UNLOCK TIMER LOGIC
    useEffect(() => {
        let timer;
        if (!isText2Unlocked && !isLoaded) {
            timer = setTimeout(() => {
                // console.log("15 seconds passed, ad not loaded. Enabling Emergency Unlock.");
                setIsEmergencyUnlocked(true);
            }, 30000); // 30 seconds timeout
        }
        return () => { if (timer) clearTimeout(timer); };
    }, [isLoaded, isText2Unlocked]);

    // Auto-load the video ad when the screen opens
    useEffect(() => {
        if (useRewardedAd) load();
    }, [load]);

    // Grant the reward when video is finished
    useEffect(() => {
        if (isEarnedReward) {
            setIsText2Unlocked(true); // Unlocks the feature permanently for this session
            setEditingTarget(2);      // Immediately selects the second text layer
            setShowInput(true);       // Opens the keyboard/input screen automatically
        }
    }, [isEarnedReward]);

    // Reload ad after it is closed so it's ready for next time
    useEffect(() => {
        if (isClosed) {
            setIsEmergencyUnlocked(false); // Reset emergency state to try ad again
            load(); // Start fetching the next ad immediately
        }
    }, [isClosed, load]);

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

    const createPanResponder = (panValue, id) => PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
            setEditingTarget(id);
            panValue.setOffset({ x: panValue.x._value, y: panValue.y._value });
            panValue.setValue({ x: 0, y: 0 });
        },
        onPanResponderMove: Animated.event([null, { dx: panValue.x, dy: panValue.y }], { useNativeDriver: false }),
        onPanResponderRelease: () => { panValue.flattenOffset(); },
    });

    const panResponder1 = useRef(createPanResponder(pan1, 1)).current;
    const panResponder2 = useRef(createPanResponder(pan2, 2)).current;

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

    const handleShare = async () => {
        setEditingTarget(null);
        setWatermarkVisible(true);

        setTimeout(async () => {
            try {
                const uri = await viewShotRef.current.capture();
                setWatermarkVisible(false);
                await Sharing.shareAsync(uri);
                if (greetingId) {
                    apiClient.patch(`/images/${greetingId}/share`).catch(err => console.error(err));
                }
            } catch (error) {
                setWatermarkVisible(false);
                Alert.alert("Error", "Could not share.");
            }
        }, 150);
    };

    const handleAddText2Press = () => {
        const labels = selectedLanguage?.labels; // Shortcut
        if (isText2Unlocked) {
            setEditingTarget(2);
            setShowInput(true);
        } else {
            if (isLoaded) {
                Alert.alert(
                    labels?.unlock_feature || "Unlock Feature",
                    labels?.watch_ad_msg || "Watch a video to add a second text layer.",
                    [
                        { text: labels?.cancel_btn || "Cancel", style: "cancel" },
                        { text: labels?.watch_btn || "Watch Ad", onPress: () => show() }
                    ]
                );
            } else if (isEmergencyUnlocked) {
                // Strategy B: Emergency Unlock Alert
                Alert.alert(
                    labels?.unlock_feature || "Quick Unlock",
                    "The video is taking too long to load. To save you time, we've unlocked this feature for you!",
                    [
                        {
                            text: labels?.done_btn || "Awesome!",
                            onPress: () => {
                                setIsText2Unlocked(true);
                                setEditingTarget(2);
                                setShowInput(true);
                            }
                        }
                    ]
                );
            } else {
                Alert.alert("Ad Loading", labels?.ad_loading || "Video is not ready yet. Please wait a few more seconds...");
                load();
            }
        }
    };

    const updateActiveColor = (color) => {
        if (editingTarget === 1) setTextColor1(color);
        else if (editingTarget === 2) setTextColor2(color);
    };

    const updateActiveFont = (font) => {
        if (editingTarget === 1) setFontFamily1(font);
        else if (editingTarget === 2) setFontFamily2(font);
    };

    const updateActiveSize = (change) => {
        if (editingTarget === 1) setFontSize1(fontSize1 + change);
        else if (editingTarget === 2) setFontSize2(fontSize2 + change);
    };

    if (!fontsLoaded) return <View style={styles.center}><ActivityIndicator color="#7B61FF" /></View>;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            <View style={styles.canvasWrapper}>
                <BannerAdSlot unitId="ca-app-pub-1193994269728560/9803375695" />

                <ViewShot ref={viewShotRef} options={{ format: "jpg", quality: 0.9 }} style={styles.viewShot}>
                    <ImageBackground source={{ uri: imageUri }} style={styles.mainImage} resizeMode="cover" {...backgroundPanResponder.panHandlers}>
                        {text1 ? (
                            <Animated.View {...panResponder1.panHandlers} style={[pan1.getLayout(), styles.draggable, editingTarget === 1 && styles.activeDraggable]}>
                                <Text style={[styles.overlayText, { color: textColor1, fontSize: fontSize1, fontFamily: fontFamily1 }]}>{text1}</Text>
                            </Animated.View>
                        ) : null}

                        {text2 ? (
                            <Animated.View {...panResponder2.panHandlers} style={[pan2.getLayout(), styles.draggable, editingTarget === 2 && styles.activeDraggable]}>
                                <Text style={[styles.overlayText, { color: textColor2, fontSize: fontSize2, fontFamily: fontFamily2 }]}>{text2}</Text>
                            </Animated.View>
                        ) : null}

                        {watermarkVisible && (
                            <View style={styles.watermarkContainer}>
                                {/* <Text style={styles.watermarkText}>Made with Greetify</Text> */}
                            </View>
                        )}
                    </ImageBackground>
                </ViewShot>
            </View>

            {editingTarget !== null && (
                <View style={styles.editorSettingsSheet}>
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
                                    <TouchableOpacity style={[styles.colorCircle, { backgroundColor: item }, (editingTarget === 1 ? textColor1 : textColor2) === item && styles.selectedColorCircle]} onPress={() => updateActiveColor(item)} />
                                )}
                            />
                        )}
                        {activeTab === 'font' && (
                            <FlatList data={STYLISH_FONTS} horizontal showsHorizontalScrollIndicator={false}
                                renderItem={({ item }) => (
                                    <TouchableOpacity style={[styles.fontCard, (editingTarget === 1 ? fontFamily1 : fontFamily2) === item.family && styles.activeFontCard]} onPress={() => updateActiveFont(item.family)}>
                                        <Text style={[styles.fontCardText, { fontFamily: item.family }, (editingTarget === 1 ? fontFamily1 : fontFamily2) === item.family && { color: '#fff' }]}>{item.name}</Text>
                                    </TouchableOpacity>
                                )}
                            />
                        )}
                        {activeTab === 'size' && (
                            <View style={styles.sizeRow}>
                                <TouchableOpacity onPress={() => updateActiveSize(-2)}><Ionicons name="remove-circle" size={32} color="#7B61FF" /></TouchableOpacity>
                                <Text style={styles.sizeVal}>{editingTarget === 1 ? fontSize1 : fontSize2}</Text>
                                <TouchableOpacity onPress={() => updateActiveSize(2)}><Ionicons name="add-circle" size={32} color="#7B61FF" /></TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>
            )}

            <View style={styles.actionBar}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => { setEditingTarget(1); setShowInput(true); }}>
                    <View style={styles.iconCircle}><Ionicons name="text" size={22} color="#7B61FF" /></View>
                    <Text style={styles.actionLabel}>{selectedLanguage?.labels?.add_text_1 || "Add Text 1"}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={handleAddText2Press}
                    disabled={!isLoaded && !isText2Unlocked && !isEmergencyUnlocked}
                >
                    <View style={styles.iconCircle}>
                        {(!isText2Unlocked && !isLoaded && !isEmergencyUnlocked) ? (
                            <ActivityIndicator size="small" color="#F59E0B" />
                        ) : (
                            <Ionicons
                                name={isText2Unlocked ? "text" : (isEmergencyUnlocked ? "gift" : "lock-closed")}
                                size={20}
                                color={isText2Unlocked ? "#7B61FF" : "#F59E0B"}
                            />
                        )}
                    </View>
                    <Text style={[styles.actionLabel, (!isLoaded && !isText2Unlocked && !isEmergencyUnlocked) && { color: '#9CA3AF' }]}>
                        {isText2Unlocked
                            ? (selectedLanguage?.labels?.add_text_2 || "Add Text 2")
                            : (isLoaded || isEmergencyUnlocked ? (selectedLanguage?.labels?.unlock_text_2 || "Unlock Text 2") : "Loading...")}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionBtn} onPress={toggleFavorite}>
                    <View style={styles.iconCircle}>
                        <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={22} color={isFavorite ? "#EF4444" : "#6B7280"} />
                    </View>
                    <Text style={styles.actionLabel}>{selectedLanguage?.labels?.favourite_btn || "Favourite"}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
                    <FontAwesome5 name="whatsapp" size={20} color="#fff" />
                    <Text style={styles.shareBtnText}>{selectedLanguage?.labels?.whatsapp_btn || "Share"}</Text>
                </TouchableOpacity>
            </View>

            {showInput && (
                <View style={styles.fullScreenInput}>
                    <TextInput
                        style={[styles.hugeInput, { color: editingTarget === 1 ? textColor1 : textColor2, fontFamily: editingTarget === 1 ? fontFamily1 : fontFamily2 }]}
                        placeholder={selectedLanguage?.labels?.type_placeholder || "Type here..."}
                        placeholderTextColor="rgba(255,255,255,0.3)"
                        value={editingTarget === 1 ? text1 : text2}
                        onChangeText={editingTarget === 1 ? setText1 : setText2}
                        autoFocus
                        multiline
                    />
                    <TouchableOpacity style={styles.doneBtn} onPress={() => setShowInput(false)}>
                        <Text style={styles.doneBtnText}>{selectedLanguage?.labels?.done_btn || "DONE"}</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    canvasWrapper: { flex: 1, justifyContent: 'flex-start', alignItems: 'center', marginTop: 20, width: '100%' },
    viewShot: { width: CARD_WIDTH, height: CARD_HEIGHT, backgroundColor: '#000', overflow: 'hidden', marginVertical: 10 },
    mainImage: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
    draggable: { position: 'absolute', padding: 10, borderWidth: 1, borderColor: 'transparent' },
    activeDraggable: { borderColor: 'rgba(123, 97, 255, 0.7)', borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.1)', borderStyle: 'dashed' },
    overlayText: { textAlign: 'center', textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 5 },
    watermarkContainer: { position: 'absolute', bottom: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.4)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
    watermarkText: { color: 'rgba(255,255,255,0.8)', fontSize: 10, fontWeight: 'bold' },
    editorSettingsSheet: { position: 'absolute', bottom: 105, width: width - 30, marginHorizontal: 15, backgroundColor: '#fff', borderRadius: 20, paddingVertical: 10, paddingHorizontal: 15, elevation: 10, zIndex: 50 },
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
    doneBtnText: { color: '#7B61FF', fontWeight: '900', fontSize: 18 }
});