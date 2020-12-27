import React, { useState } from 'react';
import {
  StyleSheet,
  TextInput,
  Text,
  View
} from 'react-native';

const SearchVideo = ({ onSearchVideo }) => {

  const [inputText, setInputText] = useState("");

  const searchVideoList = () => {
    onSearchVideo(inputText);
  };

  const resetVideoList = (txt) => {
    if (txt.trim() === "") {
      setInputText(txt);
      onSearchVideo("");
    } else {
      setInputText(txt);
    }
  }

  return (
    <View style={styles.header}>
      <Text style={styles.apptitle}>YouTube Video Search</Text>
      <TextInput
        style={styles.search}
        placeholder="Search videos here..."
        returnKeyType="search"
        value={inputText}
        onSubmitEditing={searchVideoList}
        onChangeText={text => resetVideoList(text)}>
      </TextInput>
    </View>
  )
};

const styles = StyleSheet.create({
  header: {
    width: '100%',
    backgroundColor: 'rgb(228, 29, 62)',
    padding: 20,
    paddingTop: 10,
    zIndex: 200,
    shadowColor: 'rgb(0, 0, 0)',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 1,
  },
  apptitle: {
    fontSize: 18,
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
});

export default SearchVideo;