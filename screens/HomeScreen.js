// screens/HomeScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
  Platform,
  Linking,
  useColorScheme
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Timestamp } from 'firebase/firestore';
import dayjs from 'dayjs';

const HomeScreen = () => {
  const systemTheme = useColorScheme();
  const [darkMode, setDarkMode] = useState(systemTheme === 'dark');
  const [headlines, setHeadlines] = useState([]);
  const [dateOffset, setDateOffset] = useState(0);
  const [showDatePickerModal, setShowDatePickerModal] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());

  const selectedDate = dayjs().subtract(dateOffset, 'day').toDate();
  const selectedDateLabel =
    dateOffset === 0
      ? 'Today'
      : dateOffset === 1
      ? 'Yesterday'
      : dayjs(selectedDate).format('DD MMM YYYY');

  useEffect(() => {
    fetchHeadlines();
  }, [dateOffset]);

  const fetchHeadlines = async () => {
    const start = dayjs(selectedDate).startOf('day').toDate();
    const end = dayjs(selectedDate).endOf('day').toDate();
  
    console.log('Querying from:', start, 'to:', end);
  
    try {
      const q = query(
        collection(db, 'headlines'),
        where('date', '>=', Timestamp.fromDate(start)),
        where('date', '<=', Timestamp.fromDate(end))
      );
  
      const snapshot = await getDocs(q);
  
      console.log('Fetched docs count:', snapshot.size);
  
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setHeadlines(data);
    } catch (error) {
      console.error('Error fetching headlines:', error.message);
    }
  };

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  const openDatePicker = () => {
    setTempDate(selectedDate);
    setShowDatePickerModal(true);
  };

  const confirmDate = () => {
    const today = dayjs().startOf('day');
    const picked = dayjs(tempDate).startOf('day');
    const offset = today.diff(picked, 'day');
    if (offset >= 0) {
      setDateOffset(offset);
    }
    setShowDatePickerModal(false);
  };

  const cancelDate = () => {
    setShowDatePickerModal(false);
  };

  const styles = getStyles(darkMode);

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={toggleDarkMode}>
          <Ionicons name={darkMode ? 'sunny' : 'moon'} size={24} color={darkMode ? 'white' : 'black'} />
        </TouchableOpacity>

        <TouchableOpacity onPress={openDatePicker}>
          <Ionicons name="calendar" size={24} color={darkMode ? 'white' : 'black'} />
        </TouchableOpacity>
      </View>

      <View style={styles.sliderContainer}>
        <TouchableOpacity onPress={() => setDateOffset(dateOffset + 1)}>
          <Ionicons name="chevron-back" size={24} color={darkMode ? 'white' : 'black'} />
        </TouchableOpacity>

        <Text style={styles.dateLabel}>{selectedDateLabel}</Text>

        {dateOffset > 0 ? (
          <TouchableOpacity onPress={() => setDateOffset(dateOffset - 1)}>
            <Ionicons name="chevron-forward" size={24} color={darkMode ? 'white' : 'black'} />
          </TouchableOpacity>
        ) : (
          <Ionicons name="chevron-forward" size={24} color="transparent" />
        )}
      </View>

      <FlatList
        data={headlines}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => Linking.openURL(item.link)} style={styles.card}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.desc}>{item.description}</Text>
            <Text style={styles.meta}>
              {item.category} • {dayjs(item.date.toDate()).format('HH:mm')}
            </Text>
          </TouchableOpacity>
        )}
      />

      <Modal visible={showDatePickerModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.datePickerModal}>
            <View style={{ backgroundColor: '#fff', borderRadius: 10, padding: 10 }}>
              <DateTimePicker
                value={tempDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                maximumDate={new Date()}
                onChange={(event, date) => {
                  if (date) setTempDate(date);
                }}
                themeVariant="light"
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={cancelDate} style={styles.modalButton}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={confirmDate} style={styles.modalButton}>
                <Text style={[styles.modalButtonText, { fontWeight: 'bold' }]}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default HomeScreen;

const getStyles = (darkMode) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: darkMode ? '#121212' : '#fff'
    },
    topBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 10,
      marginBottom: 10,
      paddingHorizontal: 8
    },
    sliderContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12
    },
    dateLabel: {
      fontSize: 16,
      fontWeight: 'bold',
      color: darkMode ? '#fff' : '#000'
    },
    card: {
      padding: 12,
      marginVertical: 6,
      borderWidth: 1,
      borderColor: darkMode ? '#333' : '#ddd',
      borderRadius: 6,
      backgroundColor: darkMode ? '#1e1e1e' : '#f9f9f9'
    },
    title: {
      fontWeight: 'bold',
      fontSize: 16,
      color: darkMode ? '#fff' : '#000'
    },
    desc: {
      color: darkMode ? '#ccc' : '#555',
      marginVertical: 4
    },
    meta: {
      fontSize: 12,
      color: darkMode ? '#888' : '#888'
    },
    modalOverlay: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(0,0,0,0.3)'
    },
    datePickerModal: {
      backgroundColor: darkMode ? '#1e1e1e' : '#fff',
      paddingTop: 12,
      paddingBottom: 24,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16
    },
    modalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      marginTop: 8
    },
    modalButton: {
      padding: 10
    },
    modalButtonText: {
      fontSize: 16,
      color: '#007AFF'
    }
  });
