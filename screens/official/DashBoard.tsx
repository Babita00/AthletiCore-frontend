import React from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function Dashboard() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={{ uri: 'https://via.placeholder.com/50' }}
          style={styles.avatar}
        />
        <Text style={styles.headerText}>Official Dashboard</Text>
      </View>

      {/* Upcoming Events */}
      <Text style={styles.sectionTitle}>Upcoming Events</Text>
      <View style={styles.eventCard}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1' }}
          style={styles.eventImage}
        />
        <Text style={styles.eventTitle}>Regional Powerlifting Championship</Text>
        <Text style={styles.eventDate}>June 15–17, 2024</Text>
      </View>

      {/* Ongoing Games */}
      <Text style={styles.sectionTitle}>Ongoing Games</Text>
      <View style={styles.gameItem}>
        <Feather name="award" size={20} color="#000" />
        <View style={styles.gameInfo}>
          <Text style={styles.gameTitle}>National Championship</Text>
          <Text style={styles.gameSub}>Squat - Round 2</Text>
        </View>
        <TouchableOpacity style={styles.viewButton}>
          <Text style={styles.viewText}>View</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.gameItem}>
        <Feather name="award" size={20} color="#000" />
        <View style={styles.gameInfo}>
          <Text style={styles.gameTitle}>State Qualifier</Text>
          <Text style={styles.gameSub}>Deadlift - Round 1</Text>
        </View>
        <TouchableOpacity style={styles.viewButton}>
          <Text style={styles.viewText}>View</Text>
        </TouchableOpacity>
      </View>

      {/* Floating Action Button */}
      <View style={styles.fabWrapper}>
        <TouchableOpacity style={styles.fab}>
          <Feather name="plus" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.fabLabel}>Create New Event</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 60,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  eventCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 20,
  },
  eventImage: {
    width: '100%',
    height: 180,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    padding: 10,
  },
  eventDate: {
    fontSize: 14,
    color: '#555',
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  gameItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  gameInfo: {
    flex: 1,
    marginLeft: 10,
  },
  gameTitle: {
    fontWeight: '600',
  },
  gameSub: {
    color: '#607D8B',
  },
  viewButton: {
    backgroundColor: '#e0e0e0',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  viewText: {
    color: '#000',
  },
  fabWrapper: {
    alignItems: 'center',
    marginTop: 30,
  },
  fab: {
    width: 60,
    height: 60,
    backgroundColor: '#d0e7ff',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  fabLabel: {
    marginTop: 8,
    fontSize: 14,
    color: '#555',
  },
});