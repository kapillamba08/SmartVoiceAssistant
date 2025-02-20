import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import Voice from '@react-native-community/voice';

const App = () => {
  const [transcription, setTranscription] = useState('');
  const [isLoading, setLoading] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState([]);
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    Voice.onSpeechStart = onSpeechStartHandler;
    Voice.onSpeechEnd = onSpeechEndHandler;
    Voice.onSpeechResults = onSpeechResultsHandler;

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const onSpeechStartHandler = (e) => {
    console.log("Speech started", e);
  };

  const onSpeechEndHandler = (e) => {
    setLoading(false);
    console.log("Speech stopped", e);
  };

  const onSpeechResultsHandler = (e) => {
    let text = e.value[0];
    setTranscription(text);
    extractDigitalActions(text);
    console.log("Speech recognized:", text);
  };

  const startRecording = async () => {
    setLoading(true);
    try {
      await Voice.start('en-US');
    } catch (error) {
      console.log("Error starting voice recognition", error);
    }
  };

  const stopRecording = async () => {
    try {
      await Voice.stop();
    } catch (error) {
      console.log("Error stopping voice recognition", error);
    }
  };

  const extractDigitalActions = (text) => {
    let newTasks = [];
    let newEvents = [];
    let newNotes = [];

    const taskKeywords = ["to-do", "task", "remind me to", "remember to"];
    const eventKeywords = ["schedule", "meeting", "event", "appointment"];
    const noteKeywords = ["note", "important", "write down"];

    text.split('.').forEach(sentence => {
      if (taskKeywords.some(keyword => sentence.toLowerCase().includes(keyword))) {
        newTasks.push(sentence.trim());
      } else if (eventKeywords.some(keyword => sentence.toLowerCase().includes(keyword))) {
        newEvents.push(sentence.trim());
      } else if (noteKeywords.some(keyword => sentence.toLowerCase().includes(keyword))) {
        newNotes.push(sentence.trim());
      }
    });

    setTasks([...tasks, ...newTasks]);
    setEvents([...events, ...newEvents]);
    setNotes([...notes, ...newNotes]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headingText}>Voice Assistant</Text>
      <TouchableOpacity style={styles.recordButton} onPress={startRecording}>
        {isLoading ? <ActivityIndicator size="large" color="white" /> : <Text style={styles.buttonText}>🎤 Start Recording</Text>}
      </TouchableOpacity>
      <TouchableOpacity style={styles.stopButton} onPress={stopRecording}>
        <Text style={styles.buttonText}>⏹ Stop Recording</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Transcription:</Text>
      <Text style={styles.transcriptionText}>{transcription || "No transcription yet..."}</Text>

      <ScrollView style={styles.actionsContainer}>
        <Text style={styles.sectionTitle}>Tasks:</Text>
        {tasks.map((task, index) => <Text key={index} style={styles.listItem}>✅ {task}</Text>)}

        <Text style={styles.sectionTitle}>Events:</Text>
        {events.map((event, index) => <Text key={index} style={styles.listItem}>📅 {event}</Text>)}

        <Text style={styles.sectionTitle}>Notes:</Text>
        {notes.map((note, index) => <Text key={index} style={styles.listItem}>📝 {note}</Text>)}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#F7F7F7' },
  headingText: { alignSelf: 'center', fontSize: 26, fontWeight: 'bold', marginBottom: 20 },
  recordButton: { backgroundColor: '#34A853', padding: 14, borderRadius: 8, alignItems: 'center', marginBottom: 10 },
  stopButton: { backgroundColor: '#EA4335', padding: 14, borderRadius: 8, alignItems: 'center', marginBottom: 20 },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 18 },
  sectionTitle: { fontSize: 22, fontWeight: 'bold', marginTop: 20 },
  transcriptionText: { fontSize: 18, padding: 10, backgroundColor: 'white', borderRadius: 8, minHeight: 50 },
  actionsContainer: { marginTop: 10 },
  listItem: { fontSize: 18, padding: 5, marginBottom: 5, backgroundColor: 'white', borderRadius: 5 }
});

export default App;
