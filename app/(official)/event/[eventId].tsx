import React from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
} from "react-native";
import {
  MapPin,
  Calendar,
  Phone,
  Mail,
  Users,
  CalendarPlus,
  UserCheck,
  Medal,
  Clock,
  ArrowLeft,
} from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { useGetEventById } from "@/hooks/useGetEventById";
import { styles } from "@/styles/eventDeatailScreenStyles";

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

export default function EventDetailScreen() {
  const { eventId } = useLocalSearchParams();
  const {
    data: event,
    isLoading,
    isError,
  } = useGetEventById(eventId as string);

  const handleCall = (phone: string) => Linking.openURL(`tel:${phone}`);
  const handleEmail = (email: string) => Linking.openURL(`mailto:${email}`);
  const handleSaveToCalendar = () => console.log("Save to calendar");

  const handleCreateEventForm = (eventId: string) => {
    router.push(`/(official)/event/${eventId}/create-form`);
  };

  const handleViewRegistation = (id: string) => {
  // console.log("Event ID passed to handler:", id); // Debug line
  router.push(`/(official)/event/${id}/submissions`);
};

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingcontainer}>
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  if (isError || !event) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Event not found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <Image
            source={{ uri: event.eventImage }}
            style={styles.headerImage}
          />
          <View style={styles.headerOverlay}>
            <TouchableOpacity
              style={styles.backButtonHeader}
              onPress={() => router.back()}
            >
              <ArrowLeft size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.headerContent}>
              {/* <View style={styles.competitionBadge}>
                <Text style={styles.competitionBadgeText}>
                  {event.competitionType}
                </Text>
              </View> */}
              <Text style={styles.title}>{event.title}</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleViewRegistation(event._id)}
          >
            <Users size={20} color="#ffff" />
            <Text style={styles.actionButtonText}>View Registrations</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleSaveToCalendar}
          >
            <CalendarPlus size={20} color="#ffff" />
            <Text style={styles.actionButtonText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleCreateEventForm(event._id)}
          >
            <UserCheck size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Create Event Form </Text>
          </TouchableOpacity>
        </View>

        {/* Event Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Event Details</Text>

          <View style={styles.detailItem}>
            <Calendar size={24} color="#DC2626" />
            <View style={styles.detailContent}>
              <Text style={styles.detailTitle}>Date & Time</Text>
              <Text style={styles.detailText}>{formatDate(event.date)}</Text>
              <Text style={styles.detailSubtext}>{formatTime(event.date)}</Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <MapPin size={24} color="#DC2626" />
            <View style={styles.detailContent}>
              <Text style={styles.detailTitle}>Venue</Text>
              <Text style={styles.detailText}>{event.venue}</Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <Clock size={24} color="#DC2626" />
            <View style={styles.detailContent}>
              <Text style={styles.detailTitle}>Description</Text>
              <Text style={styles.detailText}>{event.description}</Text>
            </View>
          </View>
        </View>

        {/* Weight Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weight Categories</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}
          >
            {event.weightCategories.map((weight, index) => (
              <View key={index} style={styles.weightBadge}>
                <Text style={styles.weightText}>{weight}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Prizes Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Prizes & Awards</Text>
          {event.prizes.map((prizeItem, index) => (
            <View key={index} style={styles.prizeItem}>
              <Medal size={18} color="#DC2626" />
              <Text style={styles.prizePlace}>{prizeItem.title}:</Text>
              <Text style={styles.prizeAmount}>{prizeItem.prize}</Text>
            </View>
          ))}
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>

          {/* Coordinator */}
          {event?.coordinator?.name && (
            <View style={styles.contactCard}>
              <Text style={styles.contactName}>{event?.coordinator?.name}</Text>
              <Text style={styles.contactTitle}>Coordinator</Text>
              <View style={styles.contactActions}>
                {!!event.coordinator.phone && (
                  <TouchableOpacity
                    style={styles.contactButton}
                    onPress={() => {
                      if (event?.coordinator?.phone) {
                        handleCall(event.coordinator.phone.toString());
                      }
                    }}
                  >
                    <Phone size={18} color="#DC2626" />
                    <Text style={styles.contactButtonText}>Call</Text>
                  </TouchableOpacity>
                )}
                {!!event.coordinator.email && (
                  <TouchableOpacity
                    style={styles.contactButton}
                    // onPress={() => handleEmail(event.coordinator.email)}
                    onPress={() => {
                      if (event?.coordinator?.email) {
                        handleEmail(event.coordinator.email);
                      }
                    }}
                  >
                    <Mail size={18} color="#DC2626" />
                    <Text style={styles.contactButtonText}>Email</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          {/* Other Official */}
          {event.otherOfficial?.name && (
            <View style={styles.contactCard}>
              <Text style={styles.contactName}>
                {event?.otherOfficial?.name}
              </Text>
              <Text style={styles.contactTitle}>Other Official</Text>
              <View style={styles.contactActions}>
                {!!event.otherOfficial.phone && (
                  <TouchableOpacity
                    style={styles.contactButton}
                    onPress={() => {
                      if (event?.otherOfficial?.phone) {
                        handleCall(event.otherOfficial.phone.toString());
                      }
                    }}
                  >
                    <Phone size={18} color="#DC2626" />
                    <Text style={styles.contactButtonText}>Call</Text>
                  </TouchableOpacity>
                )}
                {!!event.otherOfficial.email && (
                  <TouchableOpacity
                    style={styles.contactButton}
                    onPress={() => {
                      if (event?.otherOfficial?.email) {
                        handleEmail(event.otherOfficial.email);
                      }
                    }}
                  >
                    <Mail size={18} color="#DC2626" />
                    <Text style={styles.contactButtonText}>Email</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          {/* Organizer Phone Number */}
          {!!event.organizerPhoneNumber && (
            <View style={styles.organizerContact}>
              <Text style={styles.organizerText}>General Inquiries</Text>
              <TouchableOpacity
                style={styles.organizerButton}
                onPress={() => {
                  if (event.organizerPhoneNumber) {
                    handleCall(event.organizerPhoneNumber);
                  }
                }}
              >
                <Phone size={18} color="#FFFFFF" />
                <Text style={styles.organizerButtonText}>
                  {event.organizerPhoneNumber}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}
