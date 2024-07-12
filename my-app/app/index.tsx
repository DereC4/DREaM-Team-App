import React from "react";
import { useWindowDimensions, View, StyleSheet, Image, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { FaMicrophone } from "react-icons/fa";

export default function Index() {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#1e3a8a", "#d946ef"]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Image
          source={require("./../assets/images/logo.png")}
          style={[styles.image]}
          resizeMode="contain"
        />
      </LinearGradient>
      <View style={styles.chatArea}>
        <Text style={[styles.h1, {textAlign: 'left'}]}>Live Transcription:</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
  chatArea: {
    maxWidth: 375, // Fixed width representing a typical mobile phone screen
  },
  gradient: {
    height: 128, 
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  image: {
    // height: "100%",
    // width: "100%",
  },
  h1: {
    fontStyle: 'normal',
    fontWeight: '700',
    fontSize: 24,
    lineHeight: 22, 
    color: '#000000',
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 0, height: 10 },
    textShadowRadius: 10,
    zIndex: 11,
  }
});
