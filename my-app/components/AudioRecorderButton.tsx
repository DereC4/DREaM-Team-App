import { useState } from "react";
import { View, StyleSheet, Button, Pressable } from "react-native";
import * as FileSystem from "expo-file-system";
import { Audio } from 'expo-av';
import { FaMicrophone } from "react-icons/fa";

const AudioRecorder = () => {
  const [recording, setRecording] = useState<Audio.Recording | null>();
  const [isRecording, setIsRecording] = useState(false);

  const startRecording = async () => {
    try {
      console.log('Requesting permissions..');
      await Audio.requestPermissionsAsync();

      console.log('Starting recording..');
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(recording);
      setIsRecording(true);
    } catch (err) {
      console.error('Recording failed', err);
    }
  };

  const stopRecording = async() => {
    if(recording) {
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      console.log('Recording stopped and stored at', uri);
    }
  }

  // const handlePressIn = () => {
  //   startRecording();
  // };

  // const handlePressOut = () => {
  //   stopRecording();
  // };

  const toggleRecording = async() => {
    if (isRecording) {
      await stopRecording();
    } else {
      await startRecording();
    }
  }

  return (
    <View
      style={styles.container}
      >
      {/* <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.button}>
        <FaMicrophone name="microphone" size={24} color="black" />
      </Pressable> */}
      <Pressable
        onPress={toggleRecording}
        style={[styles.button, isRecording && styles.buttonRecording]}
      >
        <FaMicrophone name="microphone" size={24} color="black" />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  button: {
    backgroundColor: 'lightgray',
    padding: 20,
    borderRadius: 50,
  },
  buttonRecording: {
    backgroundColor: '#DC143C',
  },
});

export default AudioRecorder;
