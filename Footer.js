import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Footer() {
  return (
    <View style={styles.footer}>
      <Text style={{ color: 'rgb(240, 240, 240)' }}>&copy; 2020 - Developed by Luis Souza</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  footer: {
    alignItems: 'center',
    width: '100%',
    backgroundColor: 'rgb(228, 29, 62)',
    height: 25,
    paddingTop: 3,
  },
});
