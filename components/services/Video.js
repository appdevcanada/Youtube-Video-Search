import React, { useState, useEffect } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Image,
  Text,
  View,
  Keyboard,
  Platform,
  Dimensions,
  TouchableOpacity,
  LayoutAnimation,
  ActivityIndicator
} from "react-native";
import { WebView } from "react-native-webview";
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons'
import * as ScreenOrientation from 'expo-screen-orientation';

import SearchVideo from "./Search";
import * as Constants from "../../config/Settings";

const DEVICE_ORIENTATION = Object.freeze({
  PORTRAIT: 0,
  LANDSCAPE: 1
});
let pageURL = "";

const Item = ({ item, onPress, style, styleT }) => (
  <TouchableOpacity onPress={onPress} style={[styles.item, style]}>
    <Text style={[styles.title, styleT]}>{item.title}</Text>
  </TouchableOpacity>
);

const VideoComponent = (props) => {
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadedData, setLoadedData] = useState([]);
  const [nextPage, setNextPage] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
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
  }, [loading, selectedId, orientation, showPreview])

  const loadVideoList = async (inputText) => {
    if (inputText !== "" && inputText !== undefined) {
      setLoading(true);
      pageURL = Constants.YTURL + inputText;
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
    await fetch(pageURL + Constants.YTPAGE + nextPage, {
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

  const setOrientSize = async () => {
    let actualOrientation = await ScreenOrientation.getOrientationAsync();
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

  const showVideoPreview = () => {
    LayoutAnimation.easeInEaseOut();
    setShowPreview(!showPreview);
  };

  return (
    <View style={styles.videoarea}>
      <SearchVideo onSearchVideo={loadVideoList} />
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
              showsVerticalScrollIndicator={false}
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
            <View style={showPreview ? (orientation === DEVICE_ORIENTATION.PORTRAIT ? styles.displayvideo : styles.displayvideoLandscape) : (orientation === DEVICE_ORIENTATION.PORTRAIT ? styles.hidevideo : styles.hidevideoLandscape)}>
              <View style={{ flex: 1 }}>
                <View style={styles.toucharea}>
                  <TouchableOpacity onPress={showVideoPreview} hitSlop={{ top: 20, left: 150, bottom: 20, right: 150 }}>
                    <FontAwesomeIcon icon={showPreview ? faChevronDown : faChevronUp} size={32} style={styles.chevron} />
                  </TouchableOpacity>
                </View>
                {Platform.OS !== "web" ?
                  (<WebView
                    useWebKit={true}
                    source={{ uri: videoSrc }}
                  />
                  ) : (
                    <iframe src={videoSrc} height={'100%'} style={{ borderWidth: 0 }} />
                  )}
              </View>
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
            </View>
          </View>
        )
      }
    </View>
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
    paddingTop: '80%',
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
  searchlist: {
    flex: 1,
    backgroundColor: 'rgb(240, 240, 240)',
    padding: 10,
    zIndex: 200,
    width: '100%',
    height: Dimensions.get('window').height / 2.5
  },
  playvideo: {
    flex: 1,
    backgroundColor: 'rgb(240, 240, 240)',
    width: '100%',
    height: '40%',
    overflow: 'hidden',
  },
  displayvideo: {
    flex: 1,
    width: '100%',
    zIndex: 200,
    shadowColor: 'rgb(10, 10, 10)',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 1,
  },
  displayvideoLandscape: {
    flex: 4,
    width: '100%',
    zIndex: 200,
    shadowColor: 'rgb(10, 10, 10)',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 1,
  },
  hidevideo: {
    flex: 1,
    width: '100%',
    zIndex: 200,
    shadowColor: 'rgb(10, 10, 10)',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 1,
    position: 'absolute',
    top: '95.5%'
  },
  hidevideoLandscape: {
    flex: 1,
    width: '100%',
    zIndex: 200,
    shadowColor: 'rgb(10, 10, 10)',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 1,
    position: 'absolute',
    top: '89%'
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
  },
  toucharea: {
    width: '100%',
    backgroundColor: 'rgb(230, 230, 230)',
    minHeight: 30,
    opacity: 0.7,
    justifyContent: 'center',
    alignItems: 'center'
  },
  chevron: {
    width: '100%',
    color: 'rgb(150, 150, 150)',
  },
});

export default VideoComponent;
