export default {
    expo: {
        name: "TemplatePro",
        slug: "GreetingApp",
        version: "1.0.3",
        orientation: "portrait",
        icon: "./assets/images/icon.png",
        scheme: "greetingapp",
        userInterfaceStyle: "automatic",
        newArchEnabled: true,
        ios: {
            supportsTablet: true,
            bundleIdentifier: "com.thevibecoder.greetify"
        },
        android: {
            package: "com.thevibecoder.greetify",
            googleServicesFile: "./google-services.json",
            permissions: [
                "com.google.android.gms.permission.AD_ID",
                "android.permission.POST_NOTIFICATIONS"
            ],
            adaptiveIcon: {
                backgroundColor: "#FFFFFF",
                foregroundImage: "./assets/images/android-icon-foreground.png",
                monochromeImage: "./assets/images/android-icon-monochrome.png"
            },
            versionCode: 4,
            edgeToEdgeEnabled: true,
            predictiveBackGestureEnabled: false
        },
        web: {
            output: "static",
            favicon: "./assets/images/favicon.png"
        },
        plugins: [
            "expo-notifications",
            "expo-router",
            [
                "expo-splash-screen",
                {
                    "image": "./assets/images/splash-icon.png",
                    "imageWidth": 200,
                    "resizeMode": "contain",
                    "backgroundColor": "#ffffff",
                    "dark": {
                        "backgroundColor": "#000000"
                    }
                }
            ],
            "expo-font",
            [
                "react-native-google-mobile-ads",
                {
                    "androidAppId": "ca-app-pub-1193994269728560~4108126076",
                    "iosAppId": "ca-app-pub-1193994269728560~4108126076"
                }
            ],
            [
                "expo-tracking-transparency",
                {
                    "userTrackingPermission": "This identifier will be used to deliver personalized ads to you."
                }
            ]
        ],
        experiments: {
            typedRoutes: true,
            reactCompiler: true
        },
        extra: {
            router: {},
            eas: {
                projectId: "ac738139-6c84-4389-af03-3f7e17a33686"
            }
        },

    }
};
