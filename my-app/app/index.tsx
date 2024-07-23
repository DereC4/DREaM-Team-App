import React, { useState, useRef } from "react";
import {
  useWindowDimensions,
  View,
  StyleSheet,
  Image,
  Text,
  FlatList,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { FaMicrophone } from "react-icons/fa";
import AudioRecorder from "@/components/AudioRecorderButton";

interface Message {
  id: string;
  text: string;
  type: "sent" | "received";
}

const templateMessages: Message[] = [
  { id: "0", text: "Thanks for contacting AT&T, how can we help you?", type: "received" },
  { id: "1", text: "This is a test!", type: "received" },
  { id: "2", text: "This is a test!!", type: "sent" },
  { id: "3", text: "Don't push this to prod!!!", type: "received" },
  { id: "4", text: "This is a test!", type: "sent" },
];

export default function Index() {
  const [messages, setMessages] = useState<Message[]>(templateMessages);
  const [inputText, setInputText] = useState<string>("");
  const flatListRef = useRef<FlatList>(null);

  const getMessageFromApi = async (message: string) => {
    try {
      const response = await fetch('https://template.com/api/sendMessage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const responseData = await response.json();
      console.log('Message sent successfully:', responseData);
      return responseData;
    } catch (error) {
      console.error('Error sending message:', error);
      return null;
    }
  };

  const sendMessage = async() => {
    if (inputText.trim()) {
      setMessages([
        ...messages,
        { id: messages.length.toString(), text: inputText, type: "sent" },
      ]);
      setInputText("");
    }
  };

  /**
   * Show the messages
   * @param param0 
   * @returns 
   */
  const renderItem = ({ item }: { item: Message }) => (
    <View
      style={[
        chatStyles.messageBubble,
        item.type === "sent"
          ? chatStyles.sentMessage
          : chatStyles.receivedMessage,
      ]}
    >
      <Text style={chatStyles.messageText}>{item.text}</Text>
    </View>
  );

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
        <Text style={[styles.h1, { textAlign: "left" }]}>
          Live Transcription:
        </Text>
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={chatStyles.chatContainer}
        />
      </View>
      <View style={styles.footer}>
        <AudioRecorder />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
  },
  chatArea: {
    width: 375,
    paddingHorizontal: 10,
    flex: 1,
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
    fontStyle: "normal",
    fontWeight: "700",
    fontSize: 24,
    lineHeight: 22,
    color: "#000000",
    textShadowColor: "rgba(0, 0, 0, 0.25)",
    textShadowOffset: { width: 0, height: 10 },
    textShadowRadius: 10,
    zIndex: 11,
    alignSelf: "flex-start",
  },
  footer: {
    width: "100%",
    height: 60,
    justifyContent: "center", // Center the icon vertically
    alignItems: "center", // Center the icon horizontally
    alignSelf: "flex-end",
    flexShrink: 0,
    paddingBottom: 50,
  },
});

const chatStyles = StyleSheet.create({
  chatContainer: {
    paddingVertical: 10,
  },
  messageBubble: {
    backgroundColor: "#0084ff",
    borderRadius: 5,
    padding: 10,
    marginVertical: 5,
    marginHorizontal: 10,
    alignSelf: "flex-start",
    maxWidth: "80%",
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5, 
  },
  messageText: {
    color: "black",
    fontSize: 16,
  },
  sentMessage: {
    backgroundColor: "#009FDB",
    alignSelf: "flex-end",
  },
  receivedMessage: {
    backgroundColor: "#white",
    alignSelf: "flex-start",
    borderColor: '#d3d3d3',
    borderWidth: 1,
  },
});
