import { useState } from "react";
import { View, StyleSheet, Button, TouchableOpacity } from "react-native";
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

  const handlePressIn = () => {
    startRecording();
  };

  const handlePressOut = () => {
    stopRecording();
  };

  return (
    <View>
      <TouchableOpacity
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.button}>
        <FontAwesome name="microphone" size={24} color="black" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: 'lightgray',
    padding: 20,
    borderRadius: 50,
  },
});

export default AudioRecorder;
