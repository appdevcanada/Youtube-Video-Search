import React, { useState, useEffect } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Image,
  Text,
  TextInput,
  View,
  Keyboard,
  Platform,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator
} from "react-native";
import { WebView } from "react-native-webview";
import * as ScreenOrientation from 'expo-screen-orientation';

import { API_KEY } from "../../config/API";

const ytMaxRecords = 50;
const ytSortBy = "title";
const ytType = "video"
const ytURL = `https://youtube.googleapis.com/youtube/v3/search?&part=snippet&order=${ytSortBy}&type=${ytType}&key=${API_KEY}&maxResults=${ytMaxRecords}&q=`;
const ytPage = "&pageToken=";
let pageURL = "";
const DEVICE_ORIENTATION = Object.freeze({
  PORTRAIT: 0,
  LANDSCAPE: 1
});

const Item = ({ item, onPress, style, styleT }) => (
  <TouchableOpacity onPress={onPress} style={[styles.item, style]}>
    <Text style={[styles.title, styleT]}>{item.title}</Text>
  </TouchableOpacity>
);

const VideoComponent = () => {
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadedData, setLoadedData] = useState([]);
  const [nextPage, setNextPage] = useState(null);
  const [inputText, setInputText] = useState("");
  const [orientation, setOrientation] = useState(0);
  const [selectedVideoTitle, setSelectedVideoTitle] = useState("");
  const [selectedVideoDesc, setSelectedVideoDesc] = useState("");
  const [selectedVideoChannel, setSelectedVideoChannel] = useState("");
  let videoSrc = `https://www.youtube.com/embed/${selectedId}`;

  useEffect(() => {
    if (loadedData.length > 0) {
      let idx = loadedData.findIndex(({ id }) => id === selectedId);
      setSelectedVideoTitle(loadedData[idx].title);
      setSelectedVideoDesc(loadedData[idx].desc);
      setSelectedVideoChannel(loadedData[idx].channel);
    }
  }, [loading, selectedId, orientation])

  const loadVideoList = async () => {
    if (inputText != "") {
      setLoading(true);
      pageURL = ytURL + inputText;
      await fetch(pageURL, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json;charset=utf-8' },
      })
        .then(response => response.json())
        .then((res) => {
          setNextPage(res.nextPageToken);
          if (res.items.length > 0) {
            Keyboard.dismiss();
            let newList = [];
            res.items.forEach((resItem) => {
              newList.push({ id: resItem.id.videoId, title: resItem.snippet.title, desc: resItem.snippet.description, channel: resItem.snippet.channelTitle });
            })
            setLoadedData(newList);
            console.log("Initial LIST", newList)
            setSelectedVideoTitle(newList[0].title);
            setSelectedVideoDesc(newList[0].desc);
            setSelectedVideoChannel(newList[0].channel);
            setSelectedId(newList[0].id);
          } else {
            setLoadedData([]);
            setSelectedVideoTitle("");
            setSelectedVideoDesc("");
            setSelectedVideoChannel("");
            alert('No records found for this search');
            setSelectedId(null);
          }
        })
        .catch(err => console.error);
      setLoading(false);
    } else {
      setLoadedData([]);
      setSelectedVideoTitle("");
      setSelectedVideoDesc("");
      setSelectedVideoChannel("");
      setSelectedId(null);
    }
  }

  const loadMore = async () => {
    await fetch(pageURL + ytPage + nextPage, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json;charset=utf-8' },
    })
      .then(response => response.json())
      .then((res) => {
        if (res.items.length > 0) {
          setNextPage(res.nextPageToken);
          let newList = loadedData;
          res.items.forEach((resItem) => {
            newList.push({ id: resItem.id.videoId, title: resItem.snippet.title, desc: resItem.snippet.description, channel: resItem.snippet.channelTitle });
          })
          setLoadedData(newList);
          console.log("Next page LIST", newList)
        } else {
          setNextPage(null);
        }
      })
      .catch(err => console.error)
  }

  const onEndReached = () => {
    if (nextPage) {
      loadMore();
    }
  }

  const onRefresh = () => {
    setLoading(true);
    loadVideoList();
    setLoading(false);
  }

  const setOrientSize = () => {
    let actualOrientation = ScreenOrientation.getOrientationAsync();
    if (actualOrientation === ScreenOrientation.Orientation.LANDSCAPE_LEFT || actualOrientation === ScreenOrientation.Orientation.LANDSCAPE_RIGHT) {
      setOrientation(DEVICE_ORIENTATION.LANDSCAPE);
    } else {
      setOrientation(DEVICE_ORIENTATION.PORTRAIT);
    }
  }
  ScreenOrientation.addOrientationChangeListener(setOrientSize);

  const renderItem = ({ item }) => {
    const backgroundColor = item.id === selectedId ? "rgb(197, 0, 0)" : "rgb(240, 240, 240)";
    const color = item.id === selectedId ? "rgb(240, 240, 240)" : "rgb(30, 30, 30)";
    const borderColor = "rgb(240, 240, 240)";
    const borderBottomColor = "rgb(210, 210, 210)";

    return (
      <View style={{ flexDirection: "row", marginTop: 5, marginBottom: 0 }}>
        <Image
          source={{ uri: `https://i.ytimg.com/vi/${item.id}/hqdefault.jpg` }}
          style={{
            width: '20%',
            height: 80,
            borderRadius: 5,
          }} />
        <Item
          item={item}
          onPress={() => setSelectedId(item.id)}
          style={{ borderColor, backgroundColor, borderBottomColor, width: '79%', height: 80 }}
          styleT={{ color }}
        />
      </View>
    );
  };

  return (
    <View style={styles.videoarea}>
      <View style={styles.header}>
        <Text style={styles.apptitle}>Youtube Video Search</Text>
        <TextInput
          style={styles.search}
          placeholder="Search videos here..."
          returnKeyType="search"
          value={inputText}
          onSubmitEditing={loadVideoList}
          onChangeText={text => setInputText(text)}>
        </TextInput>
      </View>
      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="rgb(228, 29, 62)" />
        </View>
      ) : (
          <View style={styles.playvideo}>
            <FlatList style={styles.searchlist}
              data={loadedData}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              extraData={selectedId}
              onEndReachedThreshold={1}
              onEndReached={onEndReached}
              refreshControl={
                <RefreshControl
                  refreshing={loading}
                  onRefresh={onRefresh}
                />
              }
            />
            {Platform.OS === "web" ? (
              <iframe src={videoSrc} height={'40%'} style={{ borderWidth: 0 }} />
            ) : (
                <WebView
                  useWebKit={true}
                  source={{ uri: videoSrc }}
                />)}
            {orientation === DEVICE_ORIENTATION.PORTRAIT ? (
              <View style={styles.bottom}>
                <Text style={styles.bold}>Title: <Text style={styles.frame}>{selectedVideoTitle != "" ? (selectedVideoTitle.length > 42 ? selectedVideoTitle.substring(0, 42) + "..." : selectedVideoTitle) : "No title"}</Text></Text>
                <Text style={styles.bold}>Description: <Text style={styles.frame}>{selectedVideoDesc != "" ? (selectedVideoDesc.length > 36 ? selectedVideoDesc.substring(0, 36) + "..." : selectedVideoDesc) : "No description"}</Text></Text>
                <Text style={styles.bold}>Channel: <Text style={styles.frame}>{selectedVideoChannel != "" ? (selectedVideoChannel.length > 40 ? selectedVideoChannel.substring(0, 40) + "..." : selectedVideoChannel) : "No channel"}</Text></Text>
              </View>
            ) : (
                <View style={styles.bottom}>
                  <Text style={styles.bold}>Title: <Text style={styles.frame}>{selectedVideoTitle != "" ? (selectedVideoTitle.length > 80 ? selectedVideoTitle.substring(0, 80) + "..." : selectedVideoTitle) : "No title"}</Text></Text>
                  <Text style={styles.bold}>Description: <Text style={styles.frame}>{selectedVideoDesc != "" ? (selectedVideoDesc.length > 79 ? selectedVideoDesc.substring(0, 79) + "..." : selectedVideoDesc) : "No description"}</Text></Text>
                  <Text style={styles.bold}>Channel: <Text style={styles.frame}>{selectedVideoChannel != "" ? (selectedVideoChannel.length > 78 ? selectedVideoChannel.substring(0, 78) + "..." : selectedVideoChannel) : "No channel"}</Text></Text>
                </View>
              )}
          </View >
        )
      }
    </View >
  );
};

const styles = StyleSheet.create({
  videoarea: {
    flex: 1,
    backgroundColor: 'rgb(240, 240, 240)',
    alignItems: 'center',
  },
  loader: {
    justifyContent: 'center',
    paddingTop: '85%',
  },
  item: {
    padding: 10,
    marginVertical: 0,
    marginHorizontal: 5,
    borderRadius: 5,
    borderWidth: 1,
  },
  title: {
    fontSize: 16,
    textAlign: 'left'
  },
  header: {
    width: '100%',
    backgroundColor: 'rgb(228, 29, 62)',
    padding: 20,
    paddingTop: 10
  },
  apptitle: {
    fontSize: 16,
    textAlign: 'center',
    paddingBottom: 10,
    fontWeight: '600',
    color: 'rgb(230, 230, 230)',
  },
  search: {
    height: 35,
    backgroundColor: 'rgb(240, 240, 240)',
    color: 'rgb(30, 30, 30)',
    padding: 9,
    fontSize: 16,
    borderRadius: 5,
  },
  searchlist: {
    flex: 1,
    backgroundColor: 'rgb(240, 240, 240)',
    padding: 10,
    width: '100%',
    height: Dimensions.get('window').height / 2.5
  },
  playvideo: {
    flex: 1,
    backgroundColor: 'rgb(240, 240, 240)',
    width: '100%',
    height: '40%',
    overflow: 'hidden'
  },
  bottom: {
    backgroundColor: 'rgb(200, 200, 200)',
    width: '100%',
    padding: 5,
  },
  frame: {
    color: 'rgb(30, 30, 30)',
    width: '100%',
    height: 30,
    padding: 5,
    fontWeight: 'normal',
  },
  bold: {
    width: '100%',
    height: 30,
    padding: 5,
    paddingLeft: 0,
    fontWeight: '600',
  }
});

export default VideoComponent;
