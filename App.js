import React, { useEffect } from "react";
import {
  StyleSheet,
  View,
  StatusBar,
  Platform
} from 'react-native';
import SafeAreaView from 'react-native-safe-area-view';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Font from "expo-font";
import { Asset } from 'expo-asset';
import { Ionicons } from "@expo/vector-icons";
import Footer from "./Footer";
import VideoComponent from "./components/services/Video";
import { enableScreens } from "react-native-screens";

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
    loadFonts();
  }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} forceInset={{ top: 'always' }}>
        {Platform.OS === 'ios' && <StatusBar backgroundColor="rgb(228, 29, 62)" barStyle="light-content" />}
        <View style={styles.videosearch}>
          <VideoComponent />
        </View>
        <View style={styles.footer}>
          <Footer />
        </View>
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
  videosearch: {
    flex: 1,
    backgroundColor: 'rgb(240, 240, 240)',
    width: '100%',
  },
  footer: {
    alignItems: 'center',
    width: '100%',
    backgroundColor: 'rgb(228, 29, 62)',
    height: 25,
    paddingTop: 3,
  },
});

export default App;