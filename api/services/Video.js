import React, { useState, useEffect } from "react";
import {
  FlatList,
  StyleSheet,
  Image,
  Text,
  TextInput,
  View,
  Keyboard,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator
} from "react-native";
import { WebView } from "react-native-webview";

import { API_KEY } from "../../config/API";

const ytMaxRecords = 50;
const ytSortBy = "title";
const ytType = "video"
const ytURL = `https://youtube.googleapis.com/youtube/v3/search?&part=snippet&order=${ytSortBy}&type=${ytType}&key=${API_KEY}&maxResults=${ytMaxRecords}&q=`;
const ytPage = "&pageToken=";
let pageURL = "";

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
  const [selectedVideoTitle, setSelectedVideoTitle] = useState("");
  const [selectedVideoDesc, setSelectedVideoDesc] = useState("");
  const [selectedVideoChannel, setSelectedVideoChannel] = useState("");

  useEffect(() => {
    if (loadedData.length > 0) {
      let idx = loadedData.findIndex(({ id }) => id === selectedId);
      setSelectedVideoTitle(loadedData[idx].title);
      setSelectedVideoDesc(loadedData[idx].desc);
      setSelectedVideoChannel(loadedData[idx].channel);
    }
  }, [loading, selectedId])

  const loadVideoList = async (query) => {
    if (query != "") {
      setLoading(true);
      pageURL = ytURL + query;
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
        .catch(err => console.error)
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
            height: 80
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
        <TextInput
          style={styles.search}
          placeholder="Search videos here..."
          onChangeText={loadVideoList}>
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
              onEndReached={onEndReached}
            />
            <WebView
              useWebKit={true}
              source={{ url: 'https://www.youtube.com/embed/' + selectedId }}
            />
            <Text style={styles.bold}>Title: <Text style={styles.frame}>{selectedVideoTitle != "" ? selectedVideoTitle : "No title"}</Text></Text>
            <Text style={styles.bold}>Description: <Text style={styles.frame}>{selectedVideoDesc != "" ? selectedVideoDesc : "No description"}</Text></Text>
            <Text style={styles.bold}>Channel: <Text style={styles.frame}>{selectedVideoChannel != "" ? selectedVideoChannel : "No channel"}</Text></Text>
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
  },
  header: {
    width: '100%',
    backgroundColor: 'rgb(228, 29, 62)',
    padding: 20,
    paddingTop: 0,
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
  },
  frame: {
    backgroundColor: 'rgb(200, 200, 200)',
    width: '100%',
    height: 30,
    padding: 5,
    fontWeight: 'normal',
  },
  bold: {
    backgroundColor: 'rgb(200, 200, 200)',
    width: '100%',
    height: 30,
    padding: 5,
    fontWeight: '600',
  }
});

export default VideoComponent;