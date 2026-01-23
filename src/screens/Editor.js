import {
    AbrilFatface_400Regular,
    DancingScript_700Bold,
    GreatVibes_400Regular,
    KaushanScript_400Regular,
    Lobster_400Regular,
    Monoton_400Regular,
    Pacifico_400Regular,
    PermanentMarker_400Regular,
    PlayfairDisplay_700Bold
} from '@expo-google-fonts/dev';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts } from 'expo-font';
import * as Sharing from 'expo-sharing';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator, Alert, Animated, Dimensions, FlatList,
    ImageBackground,
    PanResponder,
    StatusBar,
    StyleSheet, Text, TextInput, TouchableOpacity, View
} from 'react-native';
import ViewShot from 'react-native-view-shot';

const { width, height } = Dimensions.get('window');
const COLORS = ['#FFFFFF', '#000000', '#FFD700', '#FF5733', '#C70039', '#25D366', '#3498DB', '#9B59B6'];
const STYLISH_FONTS = [
    { id: '1', name: 'Default', family: 'System' },
    { id: '2', name: 'Fancy', family: 'GreatVibes_400Regular' },
    { id: '3', name: 'Modern', family: 'Lobster_400Regular' },
    { id: '4', name: 'Script', family: 'Pacifico_400Regular' },
    { id: '5', name: 'Retro', family: 'Monoton_400Regular' },
    { id: '6', name: 'Bold', family: 'PermanentMarker_400Regular' },
];

// Placeholder for your actual Ad Component
const BannerAdSlot = ({ position }) => (
    <View style={[styles.adContainer, position === 'top' ? { marginBottom: 10 } : { marginTop: 10 }]}>
        <Text style={styles.adPlaceholderText}>Banner Ad Slot ({position})</Text>
        {/* Replace the Text above with:
            <BannerAd
                unitId={TestIds.BANNER}
                size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
            /> 
        */}
    </View>
);

export default function Editor({ route, navigation }) {
    const { imageUri, selectedLanguage } = route.params;
    let [fontsLoaded] = useFonts({
        Lobster_400Regular, Pacifico_400Regular, GreatVibes_400Regular,
        PlayfairDisplay_700Bold, Monoton_400Regular, KaushanScript_400Regular,
        AbrilFatface_400Regular, PermanentMarker_400Regular, DancingScript_700Bold
    });

    const [text, setText] = useState('');
    const [showInput, setShowInput] = useState(false);
    const [activeTab, setActiveTab] = useState('color');
    const [isFavorite, setIsFavorite] = useState(false);
    const [textColor, setTextColor] = useState('#FFFFFF');
    const [fontSize, setFontSize] = useState(28);
    const [fontFamily, setFontFamily] = useState('System');



    const viewShotRef = useRef();
    const pan = useRef(new Animated.ValueXY()).current;

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

    const toggleFavorite = async () => {
        try {
            const favs = await AsyncStorage.getItem('user_favorites');
            let favList = favs ? JSON.parse(favs) : [];

            if (isFavorite) {
                // Remove from favorites
                favList = favList.filter(uri => uri !== imageUri);
                setIsFavorite(false);
            } else {
                // Check limit of 10
                if (favList.length >= 10) {
                    Alert.alert("Limit Reached", "You can only save up to 10 favorite images.");
                    return;
                }
                // Add to favorites
                favList.push(imageUri);
                setIsFavorite(true);
            }
            await AsyncStorage.setItem('user_favorites', JSON.stringify(favList));
        } catch (error) {
            console.error("Error updating favorites", error);
        }
    };

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderGrant: () => {
                pan.setOffset({ x: pan.x._value, y: pan.y._value });
                pan.setValue({ x: 0, y: 0 });
            },
            onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
            onPanResponderRelease: () => { pan.flattenOffset(); },
        })
    ).current;

    const handleShare = async () => {
        try {
            const uri = await viewShotRef.current.capture();
            await Sharing.shareAsync(uri);
        } catch (error) { Alert.alert("Error", "Could not share."); }
    };

    if (!fontsLoaded) return <View style={styles.center}><ActivityIndicator color="#7B61FF" /></View>;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* 1. MAIN CANVAS AREA */}
            <View style={styles.canvasWrapper}>

                {/* TOP AD BANNER */}
                <BannerAdSlot position="top" />

                <ViewShot ref={viewShotRef} options={{ format: "jpg", quality: 0.9 }} style={styles.viewShot}>
                    <ImageBackground source={{ uri: imageUri }} style={styles.mainImage} resizeMode="cover">
                        {text ? (
                            <Animated.View {...panResponder.panHandlers} style={[pan.getLayout(), styles.draggable]}>
                                <Text style={[styles.overlayText, { color: textColor, fontSize: fontSize, fontFamily: fontFamily }]}>
                                    {text}
                                </Text>
                            </Animated.View>
                        ) : null}
                    </ImageBackground>
                </ViewShot>

                {/* BOTTOM AD BANNER */}
                <BannerAdSlot position="bottom" />

            </View>

            {/* 2. FLOATING EDITING TOOLS */}
            {text !== '' && (
                <View style={styles.editorSettingsSheet}>
                    <View style={styles.tabHeader}>
                        <TouchableOpacity onPress={() => setActiveTab('color')} style={[styles.tabBtn, activeTab === 'color' && styles.activeTab]}>
                            <Text style={[styles.tabText, activeTab === 'color' && styles.activeTabText]}>Color</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setActiveTab('font')} style={[styles.tabBtn, activeTab === 'font' && styles.activeTab]}>
                            <Text style={[styles.tabText, activeTab === 'font' && styles.activeTabText]}>Style</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setActiveTab('size')} style={[styles.tabBtn, activeTab === 'size' && styles.activeTab]}>
                            <Text style={[styles.tabText, activeTab === 'size' && styles.activeTabText]}>Size</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.toolContent}>
                        {activeTab === 'color' && (
                            <FlatList data={COLORS} horizontal showsHorizontalScrollIndicator={false}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={[styles.colorCircle, { backgroundColor: item }, textColor === item && styles.selectedColorCircle]}
                                        onPress={() => setTextColor(item)}
                                    />
                                )}
                            />
                        )}
                        {activeTab === 'font' && (
                            <FlatList data={STYLISH_FONTS} horizontal showsHorizontalScrollIndicator={false}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={[styles.fontCard, fontFamily === item.family && styles.activeFontCard]}
                                        onPress={() => setFontFamily(item.family)}
                                    >
                                        <Text style={[styles.fontCardText, { fontFamily: item.family }, fontFamily === item.family && { color: '#fff' }]}>{item.name}</Text>
                                    </TouchableOpacity>
                                )}
                            />
                        )}
                        {activeTab === 'size' && (
                            <View style={styles.sizeRow}>
                                <TouchableOpacity onPress={() => setFontSize(fontSize - 2)}><Ionicons name="remove-circle" size={32} color="#7B61FF" /></TouchableOpacity>
                                <Text style={styles.sizeVal}>{fontSize}</Text>
                                <TouchableOpacity onPress={() => setFontSize(fontSize + 2)}><Ionicons name="add-circle" size={32} color="#7B61FF" /></TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>
            )}

            {/* 3. BOTTOM ACTION BAR */}
            <View style={styles.actionBar}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => setShowInput(true)}>
                    <View style={styles.iconCircle}><Ionicons name="text" size={22} color="#7B61FF" /></View>
                    <Text style={styles.actionLabel}>{selectedLanguage?.labels?.message_btn || "Text"}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionBtn} onPress={toggleFavorite}>
                    <View style={styles.iconCircle}>
                        <Ionicons
                            name={isFavorite ? "heart" : "heart-outline"}
                            size={22}
                            color={isFavorite ? "#EF4444" : "#6B7280"}
                        />
                    </View>
                    <Text style={styles.actionLabel}>Favorite</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
                    <FontAwesome5 name="whatsapp" size={20} color="#fff" />
                    <Text style={styles.shareBtnText}>{selectedLanguage?.labels?.whatsapp_btn || "Share"}</Text>
                </TouchableOpacity>
            </View>

            {/* 4. MODERN INPUT OVERLAY */}
            {showInput && (
                <View style={styles.fullScreenInput}>
                    <TextInput
                        style={[styles.hugeInput, { color: textColor, fontFamily: fontFamily }]}
                        placeholder="Write your message..."
                        placeholderTextColor="rgba(255,255,255,0.3)"
                        value={text}
                        onChangeText={setText}
                        autoFocus
                        multiline
                    />
                    <TouchableOpacity style={styles.doneBtn} onPress={() => setShowInput(false)}>
                        <Text style={styles.doneBtnText}>DONE</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    canvasWrapper: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 90, // Adjusted to make room for bottom action bar
        width: '100%'
    },

    viewShot: {
        width: width,
        height: width * 1.25,
        backgroundColor: '#000',
        elevation: 0,
        overflow: 'hidden'
    },

    mainImage: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
    draggable: { position: 'absolute', padding: 10 },
    overlayText: { textAlign: 'center', textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 5 },

    // Ad Styles
    adContainer: {
        width: '100%',
        height: 60,
        backgroundColor: '#1a1a1a', // Subtle background for the ad slot
        justifyContent: 'center',
        alignItems: 'center',
    },
    adPlaceholderText: {
        color: '#444',
        fontSize: 10,
        fontWeight: 'bold',
    },

    // Bottom Sheet Styling
    editorSettingsSheet: {
        position: 'absolute', bottom: 100, width: width - 40, marginHorizontal: 20,
        backgroundColor: '#fff', borderRadius: 25, padding: 15, elevation: 10, zIndex: 10
    },
    tabHeader: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#F3F4F6', marginBottom: 15 },
    tabBtn: { paddingVertical: 10, marginRight: 20, borderBottomWidth: 2, borderBottomColor: 'transparent' },
    activeTab: { borderBottomColor: '#7B61FF' },
    tabText: { fontWeight: 'bold', color: '#9CA3AF' },
    activeTabText: { color: '#7B61FF' },
    toolContent: { height: 50, justifyContent: 'center' },

    colorCircle: { width: 30, height: 30, borderRadius: 15, marginRight: 15, borderWidth: 2, borderColor: '#E5E7EB' },
    selectedColorCircle: { borderColor: '#7B61FF', transform: [{ scale: 1.2 }] },
    fontCard: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 12, backgroundColor: '#F3F4F6', marginRight: 10 },
    activeFontCard: { backgroundColor: '#7B61FF' },
    fontCardText: { fontSize: 14, color: '#4B5563' },
    sizeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
    sizeVal: { fontSize: 20, fontWeight: 'bold', marginHorizontal: 30 },

    // Action Bar
    actionBar: {
        position: 'absolute', bottom: 0, width: '100%', height: 90, backgroundColor: '#fff',
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20,
        borderTopLeftRadius: 30, borderTopRightRadius: 30, elevation: 20
    },
    actionBtn: { alignItems: 'center', flex: 1 },
    iconCircle: { width: 45, height: 45, borderRadius: 22, backgroundColor: '#F5F3FF', justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
    actionLabel: { fontSize: 11, fontWeight: '700', color: '#6B7280' },
    shareBtn: {
        flex: 2, backgroundColor: '#22C55E', height: 50, borderRadius: 18,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginLeft: 10
    },
    shareBtnText: { color: '#fff', fontWeight: 'bold', marginLeft: 10, fontSize: 16 },

    // Full Screen Input
    fullScreenInput: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center', zIndex: 100 },
    hugeInput: { width: '80%', fontSize: 32, textAlign: 'center' },
    doneBtn: { position: 'absolute', top: 60, right: 30 },
    doneBtnText: { color: '#7B61FF', fontWeight: '900', fontSize: 18 }
});