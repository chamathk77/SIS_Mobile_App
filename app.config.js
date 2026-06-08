require('dotenv').config();

module.exports = ({ config }) => ({
  ...config,
  extra: {
    ...config.extra,
    baseUrl: process.env.BASE_URL,
    env: process.env.ENV,
  },
  userInterfaceStyle: 'automatic',
  plugins: [
    ...(config.plugins || []),
    'expo-font',
    '@react-native-community/datetimepicker',
  ],
  splash: {
    image: './assets/eschola-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#000000',
    dark: {
      image: './assets/eschola-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#000000',
    },
  },
  ios: {
    ...config.ios,
    splash: {
      image: './assets/eschola-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#000000',
    },
    infoPlist: {
      ...config.ios?.infoPlist,
      NSCameraUsageDescription:
        'We need camera access to capture photos for verification.',
      NSPhotoLibraryUsageDescription:
        'We need photo library access to upload verification images.',
      NSMicrophoneUsageDescription:
        'We need microphone access when recording audio in the app.',
    },
  },
  android: {
    ...config.android,
    permissions: [
      'android.permission.INTERNET',
      'android.permission.ACCESS_NETWORK_STATE',
      'android.permission.CAMERA',
      'android.permission.RECORD_AUDIO',
      'android.permission.READ_EXTERNAL_STORAGE',
      'android.permission.WRITE_EXTERNAL_STORAGE',
    ],
  },
});
