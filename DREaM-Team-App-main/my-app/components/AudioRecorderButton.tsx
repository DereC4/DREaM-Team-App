import { useState } from "react";
import { View, StyleSheet, Pressable, Platform} from "react-native";
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
      await recording.stopAndUnloadAsync();
      const { sound, status } = await recording.createNewLoadedSoundAsync();
      const uri = recording.getURI();
      if(uri) {
        downloadFile(uri);
      }

      setRecording(undefined);
      setIsRecording(false);
    }
  }

  const downloadFile = async (uri:string) => {
    try {
      if (Platform.OS === 'web') {
        const response = await fetch(uri);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'recording.m4a';
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } else {
        console.warn('This is a mock app and file operations are only available for web.');
      }
    } catch (error) {
      console.error('Download Failed', error);
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
