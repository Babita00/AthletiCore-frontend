// Attempt
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Modal,
  ActivityIndicator,
  useColorScheme,
  ScrollView,
} from "react-native";
import { ArrowLeft } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";

import { useAuth } from "@/context/auth-context";
import { useGetLiftAttempt } from "@/hooks/useGetLiftAttempt";
import { useInitializeLiftAttempt } from "@/hooks/useInitializeLiftAttempt";

import AttemptCard from "@/components/LiveGame/AttemptCard";
import { styles } from "@/styles/competitionStyles";
import { getStatusColor, getStatusIcon } from "@/helpers/leaderboardUtils";
import { theme } from "@/constants/theme";
import {
  Attempt,
  LiftType,
  PendingSubmission,
} from "@/constants/Player/liveGameTypes";

const AttemptsPage = () => {
  const { id: eventId } = useLocalSearchParams();
  const { user } = useAuth();
  const userId = user?.id;

  console.log("User ID:", userId);
  console.log("Event ID:", eventId);
  const colorScheme = useColorScheme();
  const colors = colorScheme === "dark" ? theme.dark : theme.light;

  const [activeTab, setActiveTab] = useState<LiftType>("squat");
  const [localAttempts, setLocalAttempts] = useState<
    Record<LiftType, Attempt[]>
  >({
    squat: [],
    bench: [],
    deadlift: [],
  });
  const [pendingSubmission, setPendingSubmission] =
    useState<PendingSubmission | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);


  const {
    data: attemptsData,
    isLoading,
    error,
  } = useGetLiftAttempt(userId ?? "", eventId as string,);

  const { mutate: initializeAttempts } = useInitializeLiftAttempt();
  console.log("AttemptsData:", attemptsData);

  console.log("userId:", userId);
  console.log("eventId:", eventId);
  console.log("attemptsData:", attemptsData);

  useEffect(() => {
    if (!userId || !eventId || !attemptsData) return;

    const isEmpty = Object.values(attemptsData).every(
      (lift) => lift.length === 0
    );

    if (isEmpty) {
      setIsInitializing(true);
      initializeAttempts(
        { userId, eventId: eventId as string },
        {
          onSuccess: (res) => {
            setLocalAttempts(res);
            setIsInitializing(false);
          },
          onError: () => {
            Alert.alert("Error", "Failed to initialize attempts");
            setIsInitializing(false);
          },
        }
      );
    } else {
      setLocalAttempts(attemptsData);
    }
  }, [userId, eventId, attemptsData]); // ✅ Add attemptsData here

  const handleWeightChange = (
    lift: LiftType,
    round: number,
    weight: string
  ) => {
    setLocalAttempts((prev) => ({
      ...prev,
      [lift]: prev[lift].map((a) =>
        a.round === round ? { ...a, weight: parseFloat(weight) || 0 } : a
      ),
    }));
  };

  const handleSubmit = (lift: LiftType, round: number) => {
    const attempt = localAttempts[lift].find((a) => a.round === round);
    if (attempt) {
      setPendingSubmission({ lift, round, weight: attempt.weight });
      setShowConfirmDialog(true);
    }
  };

  const confirmSubmission = () => {
    if (!pendingSubmission) return;

    const { lift, round } = pendingSubmission;
    setLocalAttempts((prev) => ({
      ...prev,
      [lift]: prev[lift].map((a) =>
        a.round === round
          ? { ...a, status: "submitted", changes: Math.max(a.changes - 1, 0) }
          : a
      ),
    }));
    setShowConfirmDialog(false);
    setPendingSubmission(null);
    Alert.alert("Success", "Attempt submitted.");
  };

  const showLoader = isLoading || isInitializing || !user;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButtonHeader} onPress={router.back}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Attempts</Text>
      </View>

      {showLoader ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ marginTop: 12, color: colors.onSurfaceVariant }}>
            {isInitializing ? "Initializing Attempts..." : "Loading..."}
          </Text>
        </View>
      ) : (
        <>
          {/* Tabs */}
          <View
            style={[styles.tabContainer, { borderBottomColor: colors.border }]}
          >
            {(["squat", "bench", "deadlift"] as LiftType[]).map((lift) => (
              <TouchableOpacity
                key={lift}
                style={[
                  styles.tab,
                  {
                    borderBottomColor:
                      activeTab === lift ? colors.primary : "transparent",
                    borderBottomWidth: 2,
                  },
                ]}
                onPress={() => setActiveTab(lift)}
              >
                <Text
                  style={{
                    color:
                      activeTab === lift
                        ? colors.primary
                        : colors.onSurfaceVariant,
                    fontWeight: activeTab === lift ? "bold" : "normal",
                  }}
                >
                  {lift.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Attempts */}
          <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
            <View style={styles.attemptsContainer}>
              {localAttempts[activeTab].length === 0 ? (
                <Text
                  style={{
                    color: colors.onSurfaceVariant,
                    textAlign: "center",
                    marginTop: 40,
                  }}
                >
                  No attempts found for {activeTab}.
                </Text>
              ) : (
                localAttempts[activeTab].map((attempt) => (
                  <AttemptCard
                    key={attempt.round}
                    attempt={attempt}
                    activeTab={activeTab}
                    colors={colors}
                    handleWeightChange={handleWeightChange}
                    handleSubmit={handleSubmit}
                    getStatusColor={(status, result) =>
                      getStatusColor(status, result, colors)
                    }
                    getStatusIcon={getStatusIcon}
                  />
                ))
              )}
            </View>
          </ScrollView>
        </>
      )}

      {/* Modal */}
      <Modal visible={showConfirmDialog} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContent, { backgroundColor: colors.surface }]}
          >
            <Text style={[styles.modalTitle, { color: colors.onSurface }]}>
              Confirm Submission
            </Text>
            <Text
              style={[styles.modalText, { color: colors.onSurfaceVariant }]}
            >
              {`Submit ${pendingSubmission?.lift} attempt ${pendingSubmission?.round} — ${pendingSubmission?.weight}kg?`}
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setShowConfirmDialog(false)}
                style={styles.modalButton}
              >
                <Text style={{ color: colors.onSurface }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmSubmission}
                style={[
                  styles.modalButton,
                  { backgroundColor: colors.primary },
                ]}
              >
                <Text style={{ color: "#fff" }}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default AttemptsPage;
