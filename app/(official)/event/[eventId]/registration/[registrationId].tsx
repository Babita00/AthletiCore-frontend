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
    if (attempt.status === "submitted") return "#f59e0b";
    return "#6b7280";
  };

  const getStatusText = () => {
    if (attempt.result === "success") return "Passed";
    if (attempt.result === "failed") return "Failed";
    if (attempt.status === "submitted") return "Awaiting Review";
    return "Not Submitted";
  };

  const getStatusIcon = () => {
    if (attempt.result === "success") return <CheckCircle size={20} color="#10b981" />;
    if (attempt.result === "failed") return <XCircle size={20} color="#ef4444" />;
    if (attempt.status === "submitted") return <Clock size={20} color="#f59e0b" />;
    return <Clock size={20} color="#6b7280" />;
  };

  const canUpdateStatus = attempt.status === "submitted" && !attempt.result && attempt.id;

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

  // FRONTEND WORKAROUND: Extract initial weights from registration form
  // TODO: Backend should initialize Attempt 1 as "submitted" with initial weights
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

  // Enhance attempts data with initial weights and correct status
  const enhancedAttemptsData = React.useMemo(() => {
    if (!attemptsData) return null;
    
    const enhanced = { ...attemptsData };
    
    (['squat', 'bench', 'deadlift'] as LiftType[]).forEach(liftType => {
      if (enhanced[liftType] && enhanced[liftType][0]) {
        const initialWeight = getInitialWeight(liftType);
        
        // Update Attempt 1 with initial weight and submitted status
        enhanced[liftType][0] = {
          ...enhanced[liftType][0],
          weight: initialWeight,
          status: 'submitted' as const,
          result: null, // Awaiting official review
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
      attempt => attempt.status === "submitted" && !attempt.result
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

const styles = {
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  backIcon: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#1f2937",
    flex: 1,
    textAlign: "center" as const,
  },
  headerBadge: {
    backgroundColor: "#fef3c7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#d97706",
  },
  userInfoCard: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: "white",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
     userInfoText: {
     marginLeft: 8,
     fontSize: 16,
     fontWeight: "500" as const,
     color: "#374151",
   },
   userInfoContainer: {
     marginLeft: 8,
     flex: 1,
   },
   userNameText: {
     fontSize: 16,
     fontWeight: "600" as const,
     color: "#1f2937",
     marginBottom: 2,
   },
   registrationIdText: {
     fontSize: 12,
     color: "#6b7280",
   },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  tabContainer: {
    flexDirection: "row" as const,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center" as const,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: "#2563EB",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#6b7280",
  },
  activeTabText: {
    color: "white",
  },
  attemptsSection: {
    paddingBottom: 32,
  },
  attemptCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  attemptHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 12,
  },
  attemptInfo: {
    flex: 1,
  },
  attemptTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#1f2937",
    marginBottom: 4,
  },
  weightContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
  },
  weightText: {
    marginLeft: 4,
    fontSize: 14,
    color: "#6b7280",
  },
  statusContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
  },
  statusText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "500" as const,
  },
  actionButtons: {
    flexDirection: "row" as const,
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  passButton: {
    backgroundColor: "#10b981",
  },
  failButton: {
    backgroundColor: "#ef4444",
  },
  buttonText: {
    color: "white",
    fontWeight: "600" as const,
    fontSize: 14,
  },
  changesText: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 8,
    fontStyle: "italic" as const,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6b7280",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    paddingVertical: 40,
  },
  errorText: {
    fontSize: 16,
    color: "#ef4444",
    marginBottom: 16,
  },
  emptyContainer: {
    justifyContent: "center" as const,
    alignItems: "center" as const,
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#6b7280",
  },
  backButton: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  backButtonText: {
    color: "white",
    fontWeight: "600" as const,
  },
  retryButton: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "600" as const,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center" as const,
    alignItems: "center" as const,
    padding: 16,
  },
     modalContent: {
     backgroundColor: "white",
     borderRadius: 16,
     padding: 24,
     maxWidth: 400,
     alignSelf: "stretch" as const,
   },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#1f2937",
    textAlign: "center" as const,
    marginBottom: 16,
  },
  modalInfo: {
    alignItems: "center" as const,
    marginBottom: 24,
  },
  modalText: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center" as const,
    marginBottom: 4,
  },
  boldText: {
    fontWeight: "600" as const,
    color: "#1f2937",
  },
  modalButtons: {
    flexDirection: "row" as const,
    gap: 8,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  cancelButton: {
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  passModalButton: {
    backgroundColor: "#10b981",
  },
  failModalButton: {
    backgroundColor: "#ef4444",
  },
  cancelButtonText: {
    color: "#374151",
    fontWeight: "600" as const,
  },
  confirmButtonText: {
    color: "white",
    fontWeight: "600" as const,
  },
};
