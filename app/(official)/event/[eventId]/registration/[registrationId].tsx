import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  Alert,
  Modal,
} from "react-native";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Weight,
} from "lucide-react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";

import { useGetLiftAttempt } from "@/hooks/useGetLiftAttempt";
import { useUpdateLiftStatus } from "@/hooks/useUpdateLiftStatus";
import { useGetPlayerSubmissionDetail } from "@/hooks/useGetPlayerSubmissionById";
import { LiftType, Attempt } from "@/constants/Player/liveGameTypes";

interface AttemptCardProps {
  attempt: Attempt;
  liftType: LiftType;
  onStatusUpdate: (attemptId: string, status: "pass" | "fail") => void;
  isUpdating: boolean;
}

interface StatusModalProps {
  visible: boolean;
  attempt: Attempt | null;
  liftType: LiftType;
  onConfirm: (status: "pass" | "fail") => void;
  onCancel: () => void;
  isLoading: boolean;
}

const AttemptCard: React.FC<AttemptCardProps> = ({
  attempt,
  liftType,
  onStatusUpdate,
  isUpdating,
}) => {
  const getStatusColor = () => {
    if (attempt.result === "success") return "#10b981";
    if (attempt.result === "failed") return "#ef4444";
    if (attempt.weight > 0) return "#f59e0b";
    return "#6b7280";
  };

  const getStatusText = () => {
    if (attempt.result === "success") return "Passed";
    if (attempt.result === "failed") return "Failed";
    if (attempt.weight > 0) return "Ready for Review";
    return "No Weight Set";
  };

  const getStatusIcon = () => {
    if (attempt.result === "success") return <CheckCircle size={20} color="#10b981" />;
    if (attempt.result === "failed") return <XCircle size={20} color="#ef4444" />;
    if (attempt.weight > 0) return <Clock size={20} color="#f59e0b" />;
    return <Clock size={20} color="#6b7280" />;
  };

  const canUpdateStatus = attempt.weight > 0 && !attempt.result && attempt.id;

  return (
    <View style={styles.attemptCard}>
      <View style={styles.attemptHeader}>
        <View style={styles.attemptInfo}>
          <Text style={styles.attemptTitle}>Attempt {attempt.round}</Text>
          <View style={styles.weightContainer}>
            <Weight size={16} color="#6b7280" />
            <Text style={styles.weightText}>{attempt.weight} kg</Text>
          </View>
        </View>
        
        <View style={styles.statusContainer}>
          {getStatusIcon()}
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {getStatusText()}
          </Text>
        </View>
      </View>

      {canUpdateStatus && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.passButton]}
            onPress={() => onStatusUpdate(attempt.id!, "pass")}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <CheckCircle size={16} color="white" />
                <Text style={styles.buttonText}>Pass</Text>
              </>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.failButton]}
            onPress={() => onStatusUpdate(attempt.id!, "fail")}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <XCircle size={16} color="white" />
                <Text style={styles.buttonText}>Fail</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
      
      {attempt.changes > 0 && (
        <Text style={styles.changesText}>
          {attempt.changes} change{attempt.changes > 1 ? 's' : ''} remaining
        </Text>
      )}
    </View>
  );
};

const StatusModal: React.FC<StatusModalProps> = ({
  visible,
  attempt,
  liftType,
  onConfirm,
  onCancel,
  isLoading,
}) => {
  if (!attempt) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Confirm Status Update</Text>
          
          <View style={styles.modalInfo}>
            <Text style={styles.modalText}>
              <Text style={styles.boldText}>{liftType.toUpperCase()}</Text> - Attempt {attempt.round}
            </Text>
            <Text style={styles.modalText}>
              Weight: <Text style={styles.boldText}>{attempt.weight} kg</Text>
            </Text>
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={onCancel}
              disabled={isLoading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.modalButton, styles.passModalButton]}
              onPress={() => onConfirm("pass")}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.confirmButtonText}>Pass</Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.modalButton, styles.failModalButton]}
              onPress={() => onConfirm("fail")}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.confirmButtonText}>Fail</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default function RegistrationDetailScreen() {
  const { eventId, registrationId } = useLocalSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [activeLiftTab, setActiveLiftTab] = useState<LiftType>("squat");
  const [selectedAttempt, setSelectedAttempt] = useState<{
    attempt: Attempt;
    liftType: LiftType;
  } | null>(null);

  // Fetch registration details to get user info
  const {
    data: registrationData,
    isLoading: isLoadingRegistration,
  } = useGetPlayerSubmissionDetail(eventId as string, registrationId as string);

  const userId = typeof registrationData?.submission?.user === 'string' 
    ? registrationData.submission.user 
    : registrationData?.submission?.user?._id || "";

  // Fetch lift attempts
  const {
    data: attemptsData,
    isLoading: isLoadingAttempts,
    error: attemptsError,
    refetch: refetchAttempts,
  } = useGetLiftAttempt(userId, eventId as string);

  // Extract initial weights from registration form
  const getInitialWeight = (liftType: LiftType) => {
    if (!registrationData?.submission?.formFields) return 0;
    
    const keyMap = {
      squat: 'static-initial-weight-for-squat',
      bench: 'static-initial-weight-for-bench-press', 
      deadlift: 'static-initial-weight-for-deadlift'
    };
    
    const field = registrationData.submission.formFields.find(
      f => f.key === keyMap[liftType]
    );
    return field ? parseFloat(field.value) || 0 : 0;
  };

  // Enhance attempts data with initial weights from registration
  const enhancedAttemptsData = React.useMemo(() => {
    if (!attemptsData) return null;
    
    const enhanced = { ...attemptsData };
    
    (['squat', 'bench', 'deadlift'] as LiftType[]).forEach(liftType => {
      if (enhanced[liftType] && enhanced[liftType][0]) {
        const initialWeight = getInitialWeight(liftType);
        
        // Update Attempt 1 with initial weight from registration
        enhanced[liftType][0] = {
          ...enhanced[liftType][0],
          weight: initialWeight,
          // No status changes - simplified approach
        };
      }
    });
    
    return enhanced;
  }, [attemptsData, registrationData]);

  // Update attempt status mutation
  const {
    mutate: updateAttemptStatus,
    isPending: isUpdatingStatus,
  } = useUpdateLiftStatus();

  const handleStatusUpdate = (attemptId: string, status: "pass" | "fail") => {
    const attempt = enhancedAttemptsData?.[activeLiftTab]?.find(a => a.id === attemptId);
    if (attempt) {
      setSelectedAttempt({ attempt, liftType: activeLiftTab });
    }
  };

  const confirmStatusUpdate = (status: "pass" | "fail") => {
    if (!selectedAttempt) return;

    updateAttemptStatus(
      { attemptId: selectedAttempt.attempt.id!, status },
      {
        onSuccess: () => {
           refetchAttempts();
          queryClient.invalidateQueries({
            queryKey: ["submission-detail", eventId, registrationId],
          });
           setSelectedAttempt(null);
           Alert.alert(
             "Success",
             `Attempt marked as ${status === "pass" ? "passed" : "failed"} successfully.`
           );
         },
        onError: (error: any) => {
          console.error("Failed to update attempt status:", error);
          Alert.alert(
            "Error",
            error?.response?.data?.message || "Failed to update attempt status. Please try again."
          );
          setSelectedAttempt(null);
        },
      }
    );
  };

  const getPendingAttemptsCount = () => {
    if (!enhancedAttemptsData) return 0;
    return Object.values(enhancedAttemptsData).flat().filter(
      attempt => attempt.weight > 0 && !attempt.result
    ).length;
  };

  if (isLoadingRegistration) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Loading registration details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!registrationData?.submission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Registration not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
        <View style={styles.header}>
        <TouchableOpacity style={styles.backIcon} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1f2937" />
          </TouchableOpacity>
        <Text style={styles.headerTitle}>Lift Attempts Review</Text>
        <View style={styles.headerBadge}>
          <Text style={styles.badgeText}>{getPendingAttemptsCount()} pending</Text>
        </View>
        </View>

             {/* User Info */}
       <View style={styles.userInfoCard}>
         <User size={20} color="#6b7280" />
         <View style={styles.userInfoContainer}>
           <Text style={styles.userNameText}>
             {(() => {
               if (registrationData?.submission?.user && typeof registrationData.submission.user === 'object') {
                 return registrationData.submission.user.name || registrationData.submission.user.email;
               }
               
               // Fallback: try to get name from form fields (Full Name field)
               const fullNameField = registrationData?.submission?.formFields?.find(
                 field => field.key === 'fullName' || field.key === 'full-name'
               );
               
               return fullNameField?.value || 'Unknown User';
             })()}
           </Text>
           <Text style={styles.registrationIdText}>
             ID: {registrationId}
                  </Text>
              </View>
          </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Lift Type Tabs */}
        <View style={styles.tabContainer}>
          {(["squat", "bench", "deadlift"] as LiftType[]).map((liftType) => (
                <TouchableOpacity
              key={liftType}
              style={[
                styles.tab,
                activeLiftTab === liftType && styles.activeTab,
              ]}
              onPress={() => setActiveLiftTab(liftType)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeLiftTab === liftType && styles.activeTabText,
                ]}
              >
                {liftType.charAt(0).toUpperCase() + liftType.slice(1)}
              </Text>
              </TouchableOpacity>
          ))}
        </View>

                 {/* Attempts Section */}
         <View style={styles.attemptsSection}>
           {isLoadingAttempts ? (
             <View style={styles.loadingContainer}>
               <ActivityIndicator size="large" color="#2563EB" />
               <Text style={styles.loadingText}>Loading attempts...</Text>
             </View>
           ) : attemptsError ? (
             <View style={styles.errorContainer}>
               <Text style={styles.errorText}>Failed to load attempts</Text>
              <TouchableOpacity
                 style={styles.retryButton} 
                 onPress={() => refetchAttempts()}
              >
                 <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
             </View>
           ) : enhancedAttemptsData?.[activeLiftTab]?.length === 0 ? (
             <View style={styles.emptyContainer}>
               <Text style={styles.emptyText}>No attempts found for {activeLiftTab}</Text>
             </View>
           ) : (
             enhancedAttemptsData?.[activeLiftTab]?.map((attempt, index) => (
               <AttemptCard
                 key={index}
                 attempt={attempt}
                 liftType={activeLiftTab}
                 onStatusUpdate={handleStatusUpdate}
                 isUpdating={isUpdatingStatus}
               />
             ))
            )}
          </View>
        </ScrollView>

      {/* Status Update Modal */}
      <StatusModal
        visible={!!selectedAttempt}
        attempt={selectedAttempt?.attempt || null}
        liftType={selectedAttempt?.liftType || "squat"}
        onConfirm={confirmStatusUpdate}
        onCancel={() => setSelectedAttempt(null)}
        isLoading={isUpdatingStatus}
      />
    </SafeAreaView>
  );
}

import { StyleSheet } from "react-native";
import { theme } from "@/constants/theme";

const colors = theme.dark;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    borderRadius: 12,
  },
  backIcon: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "Inter-SemiBold",
    color: colors.onSurface,
    flex: 1,
    textAlign: "center",
  },
  headerBadge: {
    backgroundColor: colors.warning + "22",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: "Inter-SemiBold",
    color: colors.warning,
  },
  userInfoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  userInfoText: {
    marginLeft: 8,
    fontSize: 16,
    fontFamily: "Inter-Medium",
    color: colors.onSurface,
  },
  userInfoContainer: {
    marginLeft: 8,
    flex: 1,
  },
  userNameText: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
    color: colors.onSurface,
    marginBottom: 2,
  },
  registrationIdText: {
    fontSize: 12,
    color: colors.onSurfaceVariant,
    fontFamily: "Inter-Regular",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontFamily: "Inter-SemiBold",
    color: colors.onSurfaceVariant,
  },
  activeTabText: {
    color: colors.background,
  },
  attemptsSection: {
    paddingBottom: 32,
  },
  attemptCard: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  attemptHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  attemptInfo: {
    flex: 1,
  },
  attemptTitle: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
    color: colors.onSurface,
    marginBottom: 4,
  },
  weightContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  weightText: {
    marginLeft: 4,
    fontSize: 14,
    color: colors.onSurfaceVariant,
    fontFamily: "Inter-Regular",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusText: {
    marginLeft: 6,
    fontSize: 14,
    fontFamily: "Inter-Medium",
    color: colors.onSurface,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  passButton: {
    backgroundColor: colors.success,
  },
  failButton: {
    backgroundColor: colors.error,
  },
  buttonText: {
    color: colors.background,
    fontFamily: "Inter-SemiBold",
    fontSize: 14,
  },
  changesText: {
    fontSize: 12,
    color: colors.onSurfaceVariant,
    marginTop: 8,
    fontStyle: "italic",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.onSurfaceVariant,
    fontFamily: "Inter-Regular",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    marginBottom: 16,
    fontFamily: "Inter-SemiBold",
  },
  emptyContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: colors.onSurfaceVariant,
    fontFamily: "Inter-Regular",
  },
  backButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  backButtonText: {
    color: colors.background,
    fontFamily: "Inter-SemiBold",
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.background,
    fontFamily: "Inter-SemiBold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalContent: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 24,
    maxWidth: 400,
    alignSelf: "stretch",
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: "Inter-SemiBold",
    color: colors.onSurface,
    textAlign: "center",
    marginBottom: 16,
  },
  modalInfo: {
    alignItems: "center",
    marginBottom: 24,
  },
  modalText: {
    fontSize: 16,
    color: colors.onSurfaceVariant,
    textAlign: "center",
    marginBottom: 4,
    fontFamily: "Inter-Regular",
  },
  boldText: {
    fontFamily: "Inter-SemiBold",
    color: colors.onSurface,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 8,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  passModalButton: {
    backgroundColor: colors.success,
  },
  failModalButton: {
    backgroundColor: colors.error,
  },
  cancelButtonText: {
    color: colors.onSurface,
    fontFamily: "Inter-SemiBold",
  },
  confirmButtonText: {
    color: colors.background,
    fontFamily: "Inter-SemiBold",
  },
});
