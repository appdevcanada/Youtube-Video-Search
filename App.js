import React, { useEffect } from "react";
import {
  StyleSheet,
  SafeAreaView,
  View,
  StatusBar,
  Platform
} from 'react-native';
import * as Font from "expo-font";
import { Ionicons } from "@expo/vector-icons";
import Footer from "./Footer";
import VideoComponent from "./api/services/Video";
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
    <SafeAreaView style={styles.container}>
      {Platform.OS === 'ios' && <StatusBar backgroundColor="rgb(228, 29, 62)" barStyle="light-content" />}
      <View style={styles.videosearch}>
        <VideoComponent></VideoComponent>
      </View>
      <View style={styles.footer}>
        <Footer />
      </View>
    </SafeAreaView>
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
    height: 20,
    paddingTop: 2,
  },
});

export default App;