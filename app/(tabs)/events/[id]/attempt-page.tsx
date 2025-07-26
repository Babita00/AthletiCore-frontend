import React, { useEffect, useState, useMemo } from "react";
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
import { useSubmitNextWeight } from "@/hooks/useSubmitNextWeight";
import { useGetMySubmissions } from "@/hooks/useGetMySubmissions";

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
  } = useGetLiftAttempt(userId ?? "", eventId as string);

  // Get user's registration data to extract initial weights
  const {
    data: submissionData,
    isLoading: isLoadingSubmission,
  } = useGetMySubmissions(eventId as string);

  const { mutate: initializeAttempts } = useInitializeLiftAttempt();
  const { mutate: submitWeight, isPending: isSubmitting } = useSubmitNextWeight();
  console.log("AttemptsData:", attemptsData);
  console.log("SubmissionData:", submissionData);
  
  // IMPROVED APPROACH: 
  // Instead of backend fixes, we pre-populate Attempt 1 with initial weights from registration
  // Players can review and submit Attempt 1, which then goes to officials for approval

  // Extract initial weights from registration form
  const getInitialWeight = (liftType: LiftType) => {
    if (!submissionData || !Array.isArray(submissionData)) return 0;
    
    // Find the submission for this event (should be only one)
    const eventSubmission = submissionData.find(
      (submission) => submission.event._id === eventId
    );
    
    if (!eventSubmission?.formFields) return 0;
    
    const keyMap = {
      squat: 'static-initial-weight-for-squat',
      bench: 'static-initial-weight-for-bench-press', 
      deadlift: 'static-initial-weight-for-deadlift'
    };
    
    const field = eventSubmission.formFields.find(
      (f) => f.key === keyMap[liftType]
    );
    const weight = field ? parseFloat(field.value) || 0 : 0;
    
    // Debug logging to see what's happening
    console.log(`🏋️ Initial weight for ${liftType}:`, {
      foundField: !!field,
      fieldKey: field?.key,
      fieldValue: field?.value,
      parsedWeight: weight,
      allFields: eventSubmission.formFields.map(f => ({ key: f.key, value: f.value }))
    });
    
    return weight;
  };

  // Enhance attempts data with initial weights for Attempt 1 AND unlock attempts 2 & 3
  const enhancedAttemptsData = useMemo(() => {
    if (!attemptsData || !submissionData) return attemptsData;
    
    const enhanced = { ...attemptsData };
    
    (['squat', 'bench', 'deadlift'] as LiftType[]).forEach(liftType => {
      if (enhanced[liftType]) {
        // NEW LOGIC: Process all attempts
        enhanced[liftType] = enhanced[liftType].map((attempt) => {
          if (attempt.round === 1) {
            // Pre-populate Attempt 1 with initial weight
            const initialWeight = getInitialWeight(liftType);
            return { ...attempt, weight: initialWeight };
          } else {
            // ✅ FIX: Force unlock attempts 2 and 3
            return {
              ...attempt,
              locked: false, // Explicitly unlock
              status: attempt.status === "submitted" ? "submitted" : "available"
            };
          }
        });
      }
    });
    
    return enhanced;
  }, [attemptsData, submissionData]);
  
  // Debug: Log the attempts to see their status and locked properties
  useEffect(() => {
    // Use same logic as rendering
    const hasLocalChanges = Object.values(localAttempts).some(attempts => 
      attempts.some(attempt => attempt.weight > 0)
    );
    const currentAttempts = hasLocalChanges ? localAttempts : (enhancedAttemptsData || localAttempts);
    
    if (currentAttempts && currentAttempts[activeTab]) {
      console.log(`🔍 ${activeTab} attempts:`, currentAttempts[activeTab]);
      currentAttempts[activeTab].forEach((attempt, index) => {
        const isLocked = (attempt.round === 1 || attempt.locked || attempt.status === "submitted");
        console.log(`🎯 Attempt ${attempt.round}:`, {
          weight: attempt.weight,
          status: attempt.status,
          locked: attempt.locked,
          changes: attempt.changes,
          isLocked: isLocked,
          hasId: !!attempt.id,
          reason: isLocked ? 
            attempt.round === 1 ? 'isAttemptOne' : 
            attempt.locked ? 'attempt.locked' : 
            attempt.status === "submitted" ? 'status=submitted' : 'unknown'
            : 'not locked'
        });
      });
      
      // Also log which data source we're using
      console.log(`📊 Data source: ${hasLocalChanges ? 'localAttempts (with changes)' : (enhancedAttemptsData ? 'enhancedAttemptsData' : 'localAttempts')}`);
    }
  }, [enhancedAttemptsData, localAttempts, activeTab]);

  useEffect(() => {
    if (!userId || !eventId) return;

    // Only initialize attempts if attemptsData is not available
    if (!attemptsData) {
      setIsInitializing(true);
      initializeAttempts(
        { eventId: eventId as string }, // ✅ Only pass eventId now
        {
          onSuccess: (res) => {
            // Fix: Ensure attempts 2 and 3 are unlocked and available
            const fixedAttempts = Object.keys(res).reduce((acc, liftType) => {
              acc[liftType as LiftType] = res[liftType as LiftType].map((attempt) => ({
                ...attempt,
                // Only attempt 1 should be locked if it has been submitted
                locked: attempt.round === 1 ? attempt.locked : false,
                // Attempts 2 and 3 should be available unless already submitted
                status: attempt.round === 1 ? attempt.status : 
                        (attempt.status === "submitted" ? "submitted" : "available")
              }));
              return acc;
            }, {} as Record<LiftType, Attempt[]>);
            
            setLocalAttempts(fixedAttempts);
            setIsInitializing(false);
          },
          onError: () => {
            Alert.alert("Error", "Failed to initialize attempts");
            setIsInitializing(false);
          },
        }
      );
    } else {
      // Fix: Ensure attempts 2 and 3 are unlocked and available for fetched data too
      const fixedAttempts = Object.keys(attemptsData).reduce((acc, liftType) => {
        acc[liftType as LiftType] = attemptsData[liftType as LiftType].map((attempt) => ({
          ...attempt,
          // Only attempt 1 should be locked if it has been submitted
          locked: attempt.round === 1 ? attempt.locked : false,
          // Attempts 2 and 3 should be available unless already submitted
          status: attempt.round === 1 ? attempt.status : 
                  (attempt.status === "submitted" ? "submitted" : "available")
        }));
        return acc;
      }, {} as Record<LiftType, Attempt[]>);
      
      setLocalAttempts(fixedAttempts); // Use the fixed attempts data
    }
  }, [userId, eventId, attemptsData, initializeAttempts]);

  const handleWeightChange = (
    lift: LiftType,
    round: number,
    weight: string
  ) => {
    console.log(`⚡ Weight change: ${lift} attempt ${round} -> ${weight}`);
    
    setLocalAttempts((prev) => {
      // Start with enhanced data if available, otherwise use previous state
      const baseAttempts = enhancedAttemptsData || prev;
      const newAttempts = {
        ...baseAttempts,
        [lift]: baseAttempts[lift].map((a) => {
          if (a.round === round) {
            // Update the weight for the specific attempt
            return { ...a, weight: parseFloat(weight) || 0 };
          } else if (a.round > 1) {
            // ✅ ENSURE: Keep attempts 2 & 3 unlocked during weight changes
            return { 
              ...a, 
              locked: false,
              status: a.status === "submitted" ? "submitted" : "available"
            };
          }
          return a;
        }),
      };
      
      console.log(`✅ Updated attempts for ${lift}:`, newAttempts[lift]);
      return newAttempts;
    });
  };

  const handleSubmit = (lift: LiftType, round: number) => {
    // Use same logic as rendering: localAttempts if changes made, otherwise enhanced data
    const hasLocalChanges = Object.values(localAttempts).some(attempts => 
      attempts.some(attempt => attempt.weight > 0)
    );
    const currentAttempts = hasLocalChanges ? localAttempts : (enhancedAttemptsData || localAttempts);
    
    const attempt = currentAttempts[lift].find((a) => a.round === round);
    console.log(`🚀 Submit attempt ${round} for ${lift}:`, attempt);
    
    if (attempt) {
      setPendingSubmission({ lift, round, weight: attempt.weight });
      setShowConfirmDialog(true);
    }
  };

  const confirmSubmission = () => {
    if (!pendingSubmission) return;

    const { lift, round, weight } = pendingSubmission;
    const attempt = localAttempts[lift].find((a) => a.round === round);
    
    if (!attempt?.id) {
      Alert.alert("Error", "Attempt ID not found. Cannot submit to backend.");
      return;
    }

    // Call the backend API to submit the weight
    submitWeight(
      { attemptId: attempt.id, nextWeight: weight },
      {
        onSuccess: (response) => {
          // Update local state on successful backend submission
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
          Alert.alert("Success", "Weight updated successfully.");
        },
        onError: (error: any) => {
          console.error("Failed to submit weight:", error);
          Alert.alert(
            "Error", 
            error?.response?.data?.message || "Failed to submit attempt. Please try again."
          );
          setShowConfirmDialog(false);
          setPendingSubmission(null);
        },
      }
    );
  };

  const showLoader = isLoading || isLoadingSubmission || isInitializing || !user;

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
              {(() => {
                // IMPORTANT: Use localAttempts if any weights have been changed,
                // otherwise use enhanced data for initial state
                const hasLocalChanges = Object.values(localAttempts).some(attempts => 
                  attempts.some(attempt => attempt.weight > 0)
                );
                
                const currentAttempts = hasLocalChanges ? localAttempts : (enhancedAttemptsData || localAttempts);
                
                console.log(`🎮 Rendering with: ${hasLocalChanges ? 'localAttempts (with changes)' : 'enhancedAttemptsData (initial)'}`);
                
                if (currentAttempts[activeTab].length === 0) {
                  return (
                    <Text
                      style={{
                        color: colors.onSurfaceVariant,
                        textAlign: "center",
                        marginTop: 40,
                      }}
                    >
                      No attempts found for {activeTab}.
                    </Text>
                  );
                }
                
                return currentAttempts[activeTab].map((attempt) => (
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
                ));
              })()}
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
                disabled={isSubmitting}
              >
                <Text style={{ color: colors.onSurface }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmSubmission}
                style={[
                  styles.modalButton,
                  { 
                    backgroundColor: colors.primary,
                    opacity: isSubmitting ? 0.7 : 1
                  },
                ]}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={{ color: "#fff" }}>Confirm</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default AttemptsPage;
