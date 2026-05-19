import { StatusBar } from 'expo-status-bar';
import { useTheme } from './src/context/ThemeContext';
import { PaperProvider } from 'react-native-paper';
import { useEffect, useState } from 'react';
import { useFonts } from 'expo-font';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { customFonts } from "./src/constants/fonts";
import * as SplashScreen from 'expo-splash-screen';
import { Provider } from 'react-redux';
import { store } from './src/store/store';
import AppNavigator from './src/navigation/AppNavigation';
import { ThemeProvider } from './src/context/ThemeContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

function ThemedApp() {
  const { paperTheme } = useTheme();

  return (
    <PaperProvider theme={paperTheme}>
      <AppNavigator />
    </PaperProvider>
  );
}


export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    ...customFonts,
    ...Ionicons.font,
    ...MaterialCommunityIcons.font,
  });
  const [appIsReady, setAppIsReady] = useState(false);



  useEffect(() => {
    if (fontsLoaded || fontError) {
      setAppIsReady(true);
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    if (appIsReady) {
      SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <ThemeProvider>
          <ThemedApp />
        </ThemeProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}

