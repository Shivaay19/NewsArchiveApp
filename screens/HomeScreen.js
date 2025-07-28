// screens/HomeScreen.js
// npx expo run:ios
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ScrollView,
  StyleSheet,
  Modal,
  Platform,
  Linking,
  useColorScheme,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import dayjs from 'dayjs';

const categories = [
  'All',
  'Business',
  'Politics',
  'World Affairs',
  'Science',
];

const HomeScreen = () => {
  const systemTheme = useColorScheme();
  const [darkMode, setDarkMode] = useState(systemTheme === 'dark');
  const [headlines, setHeadlines] = useState([]);
  const [dateOffset, setDateOffset] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showDatePickerModal, setShowDatePickerModal] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const selectedDate = dayjs().subtract(dateOffset, 'day').toDate();
  const selectedDateLabel =
    dateOffset === 0
      ? 'Today'
      : dateOffset === 1
      ? 'Yesterday'
      : dayjs(selectedDate).format('DD MMM YYYY');

      useEffect(() => {
        fetchHeadlines();
      }, [dateOffset, selectedCategory]);
      

      const fetchHeadlines = async () => {
        const start = dayjs(selectedDate).startOf('day').toDate();
        const end = dayjs(selectedDate).endOf('day').toDate();
        console.log('Querying from:', start, 'to:', end);
      
        try {
          const q = query(
            collection(db, 'headlines'),
            where('date', '>=', start),
            where('date', '<=', end)
          );
          const snapshot = await getDocs(q);
          let data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          console.log('Fetched docs count:', data.length);
      
          // Apply client-side category filtering
          if (selectedCategory !== 'All') {
            data = data.filter(item => item.category === selectedCategory);
          }
          setHeadlines(data);
        } catch (error) {
          console.error('Error fetching headlines:', error);
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

  const openCategoryPicker = () => {
    setShowCategoryModal(true);
  };

  const selectCategory = (cat) => {
    setSelectedCategory(cat);
    setShowCategoryModal(false);
  };

  const styles = getStyles(darkMode);

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={toggleDarkMode}>
          <Ionicons
            name={darkMode ? 'sunny' : 'moon'}
            size={24}
            color={darkMode ? 'white' : 'black'}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={openCategoryPicker} style={styles.categoryButton}>
          <Text style={styles.categoryButtonText}>{selectedCategory}</Text>
          <Ionicons
            name="chevron-down"
            size={16}
            color={darkMode ? 'white' : 'black'}
            style={{ marginLeft: 4 }}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={openDatePicker}>
          <Ionicons
            name="calendar"
            size={24}
            color={darkMode ? 'white' : 'black'}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.sliderContainer}>
        <TouchableOpacity onPress={() => setDateOffset(dateOffset + 1)}>
          <Ionicons
            name="chevron-back"
            size={24}
            color={darkMode ? 'white' : 'black'}
          />
        </TouchableOpacity>

        <Text style={styles.dateLabel}>{selectedDateLabel}</Text>

        {dateOffset > 0 ? (
          <TouchableOpacity onPress={() => setDateOffset(dateOffset - 1)}>
            <Ionicons
              name="chevron-forward"
              size={24}
              color={darkMode ? 'white' : 'black'}
            />
          </TouchableOpacity>
        ) : (
          <Ionicons name="chevron-forward" size={24} color="transparent" />
        )}
      </View>

      <FlatList
        data={headlines}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => Linking.openURL(item.link)}
            style={styles.card}
          >
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.desc}>{item.description}</Text>
            <Text style={styles.meta}>
              {item.category} • {dayjs(item.date.toDate()).format('HH:mm')}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Date Picker Modal */}
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
                <Text style={[styles.modalButtonText, { fontWeight: 'bold' }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={confirmDate} style={styles.modalButton}>
                <Text style={[styles.modalButtonText, { fontWeight: 'bold' }]}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Category Modal */}
      <Modal visible={showCategoryModal} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setShowCategoryModal(false)}
          activeOpacity={1}
        >
          <View style={styles.categoryModal}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => selectCategory(cat)}
                style={[
                  styles.modalCategoryItem,
                  selectedCategory === cat && styles.selectedCategoryItem,
                ]}
              >
                <Text
                  style={[
                    styles.modalCategoryText,
                    selectedCategory === cat && styles.selectedCategoryText,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
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
      backgroundColor: darkMode ? '#121212' : '#fff',
    },
    topBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    categoryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      backgroundColor: darkMode ? '#333' : '#eee',
    },
    categoryButtonText: {
      fontSize: 14,
      color: darkMode ? '#fff' : '#000',
    },
    sliderContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    dateLabel: {
      fontSize: 16,
      fontWeight: 'bold',
      color: darkMode ? '#fff' : '#000',
    },
    card: {
      padding: 12,
      marginVertical: 6,
      borderWidth: 1,
      borderColor: darkMode ? '#333' : '#ddd',
      borderRadius: 6,
      backgroundColor: darkMode ? '#1e1e1e' : '#f9f9f9',
    },
    title: {
      fontWeight: 'bold',
      fontSize: 16,
      color: darkMode ? '#fff' : '#000',
    },
    desc: {
      color: darkMode ? '#ccc' : '#555',
      marginVertical: 4,
    },
    meta: {
      fontSize: 12,
      color: darkMode ? '#888' : '#888',
    },
    modalOverlay: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(0,0,0,0.3)',
    },
    datePickerModal: {
      backgroundColor: darkMode ? '#1e1e1e' : '#fff',
      paddingTop: 12,
      paddingBottom: 24,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
    },
    modalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      marginTop: 8,
    },
    modalButton: {
      padding: 10,
    },
    modalButtonText: {
      fontSize: 16,
      color: '#007AFF',
    },
    categoryModal: {
      position: 'absolute',
      top: 100,
      left: 30,
      right: 30,
      backgroundColor: darkMode ? '#2a2a2a' : '#fff',
      borderRadius: 10,
      paddingVertical: 12,
      paddingHorizontal: 16,
    },
    modalCategoryItem: {
      paddingVertical: 10,
    },
    modalCategoryText: {
      fontSize: 16,
      color: darkMode ? '#eee' : '#333',
    },
    selectedCategoryItem: {
      backgroundColor: darkMode ? '#444' : '#ddd',
      borderRadius: 6,
    },
    selectedCategoryText: {
      fontWeight: 'bold',
    },
  });
