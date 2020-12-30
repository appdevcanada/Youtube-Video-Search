import React, { useEffect } from "react";
import {
  StyleSheet,
  StatusBar,
  Platform
} from 'react-native';
import SafeAreaView from 'react-native-safe-area-view';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Font from "expo-font";
import * as SplashScreen from 'expo-splash-screen';
import { Ionicons } from "@expo/vector-icons";
import Footer from "./Footer";
import VideoList from "./components/services/VideoList";
import { enableScreens } from "react-native-screens";

// Prevent native splash screen from autohiding before App component declaration
SplashScreen.preventAutoHideAsync()
  .then(result => console.log(`SplashScreen.preventAutoHideAsync() succeeded: ${result}`))
  .catch(console.warn); // it's good to explicitly catch and inspect any error

const App = () => {

  enableScreens(); // this helps screens load faster in background

  const loadFonts = async () => {
    try {
      if (Platform.OS === "android") {
        await Font.loadAsync({
          Roboto: require("./node_modules/native-base/Fonts/Roboto.ttf"),
          Roboto_medium: require("./node_modules/native-base/Fonts/Roboto_medium.ttf"),
          ...Ionicons.font
        });
      }
    } catch (error) { console.log(error); }
  };

  useEffect(() => {
    // Prevent native splash screen from autohiding
    try {
      loadFonts();
    } catch (e) {
      console.warn(e);
    } finally {
      // Hides native splash screen after 1.5s
      let timeout = setTimeout(async () => {
        await SplashScreen.hideAsync();
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} forceInset={{ top: 'always' }}>
        <StatusBar backgroundColor="rgb(228, 29, 62)" barStyle="light-content" />
        <VideoList />
        <Footer />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgb(228, 29, 62)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default App;