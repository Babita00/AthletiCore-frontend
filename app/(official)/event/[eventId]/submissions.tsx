import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from "react-native";
import { CheckCircle, XCircle, Clock, Search } from "lucide-react-native";
import { styles } from "@/styles/getAllRegiatrationStyles";
import { useGetAllEventsRegistration } from "@/hooks/UseGetAllRegistration";
import { useGetEventForm } from "@/hooks/useGetEventsForm";
import { useUpdateFinalStats } from "@/hooks/useUpdateFinalStats";
import { IPlayerSubmission } from "@/types/eventForm";
import { parseFormFieldsWithMeta } from "@/utils/parseFormFields";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { useReviewPlayerSubmission } from "@/hooks/useReviewPlayerSubmission";

export default function GetAllPlayerRegistration() {
  const { eventId } = useLocalSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("all");
  const [editValues, setEditValues] = useState<
    Record<
      string,
      { rackHeight: string; finalWeight: string; finalHeight: string }
    >
  >({});

  const { data: submissionsData, isLoading } = useGetAllEventsRegistration(
    eventId as string
  );
  const { data: formMeta } = useGetEventForm(eventId as string);
  const updateStatsMutation = useUpdateFinalStats();
  const reviewSubmissionMutation = useReviewPlayerSubmission();

  const submissions: IPlayerSubmission[] = Array.isArray(submissionsData)
    ? submissionsData
    : [];

  const fieldMap = useMemo(() => {
    const map: Record<string, string> = {};
    formMeta?.fields?.forEach((f, i) => {
      map[`field_${i}`] = f.fieldName;
    });
    return map;
  }, [formMeta]);

  const filtered = submissions.filter((sub) => {
    const fields = parseFormFieldsWithMeta(sub.formFields, fieldMap);
    const combinedValues = Object.values(fields).join(" ").toLowerCase();
    const matchesSearch = combinedValues.includes(search.toLowerCase());
    const matchesStatus = status === "all" || sub.status === status;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "accepted":
      case "approved":
        return <CheckCircle size={16} color="green" />;
      case "rejected":
        return <XCircle size={16} color="red" />;
      default:
        return <Clock size={16} color="orange" />;
    }
  };

  const confirmStatusChange = (id: string, action: "approved" | "rejected") => {
  console.log("Confirm Status Change Triggered with submissionId:", id);

  // The API call is now made directly, without an alert.
  reviewSubmissionMutation.mutate(
    { submissionId: id, data: { status: action } },
    {
      onSuccess: () => {
        console.log("Mutation Success");
        queryClient.invalidateQueries({
          queryKey: ["all-submissions", eventId],
        });
      },
      onError: (error) => {
        console.error("Mutation Error: ", error);
      },
    }
  );
};

  const handleUpdateStats = (
    id: string,
    rack: string,
    weight: string,
    height: string
  ) => {
    if (rack && isNaN(Number(rack))) {
      Alert.alert("Invalid Rack Height", "Rack height must be a number.");
      return;
    }
    if (weight && isNaN(Number(weight))) {
      Alert.alert("Invalid Weight", "Final weight must be a number.");
      return;
    }
    if (height && isNaN(Number(height))) {
      Alert.alert("Invalid Height", "Final height must be a number.");
      return;
    }

    updateStatsMutation.mutate(
      {
        submissionId: id,
        data: {
          finalRackHeight: rack,
          finalWeight: weight,
          finalHeight: height,
        },
      },
      {
        onSuccess: () =>
          queryClient.invalidateQueries({
            queryKey: ["all-submissions", eventId],
          }),
      }
    );
  };

  const renderRow = ({ item }: { item: IPlayerSubmission }) => {
    const values = parseFormFieldsWithMeta(item.formFields, fieldMap);
    const name =
      values["Full Name"] ||
      values["field_0"] ||
      (item as any).user?.fullName ||
      "Unknown";
    const email =
      values["Email"] ||
      values["field_1"] ||
      (item as any).user?.email ||
      "No Email";
    const editState = editValues[item._id] || {
      rackHeight: (item as any).finalRackHeight || "",
      finalWeight: (item as any).finalWeight || "",
      finalHeight: (item as any).finalHeight || "",
    };

    const setRack = (val: string) =>
      setEditValues((p) => ({
        ...p,
        [item._id]: { ...editState, rackHeight: val },
      }));
    const setWeight = (val: string) =>
      setEditValues((p) => ({
        ...p,
        [item._id]: { ...editState, finalWeight: val },
      }));
    const setHeight = (val: string) =>
      setEditValues((p) => ({
        ...p,
        [item._id]: { ...editState, finalHeight: val },
      }));

    return (
      <TouchableOpacity
        style={styles.tableRow}
        onPress={() =>
          router.push(`/(official)/event/${eventId}/registration/${item._id}`)
        }
      >
        <View style={[styles.cell, styles.nameColumn]}>
          <Text style={styles.cardDetail}>{name}</Text>
        </View>
        <View style={[styles.cell, styles.emailColumn]}>
          <Text style={styles.cardDetail}>{email}</Text>
        </View>
        {formMeta?.fields?.map((f, idx) => (
          <View key={idx} style={styles.cell}>
            <Text style={styles.cardDetail}>{values[f.fieldName]}</Text>
          </View>
        ))}
        <View style={[styles.cell, styles.statusColumn]}>
          {getStatusIcon(item.status)}
        </View>
        <View style={[styles.cell, styles.approvalColumn]}>
          {item.status === "pending" ? (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.approveButton}
                onPress={(e) => {
                  console.log('Approve button clicked for item._id:', item._id);
                  e.stopPropagation();
                  confirmStatusChange(item._id, "approved");
                }}
              >
                <Text style={styles.buttonText}>Approve</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.rejectButton}
                onPress={(e) => {
                  e.stopPropagation();
                  confirmStatusChange(item._id, "rejected");
                }}
              >
                <Text style={styles.buttonText}>Reject</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.actionButtons}>
              <TextInput
                placeholder="Rack"
                value={editState.rackHeight}
                keyboardType="numeric"
                editable={item.status === "approved"}
                onChangeText={setRack}
                onBlur={() =>
                  handleUpdateStats(
                    item._id,
                    editState.rackHeight,
                    editState.finalWeight,
                    editState.finalHeight
                  )
                }
                style={[
                  styles.inputField,
                  item.status !== "approved" && styles.disabledInput,
                ]}
              />
              <TextInput
                placeholder="Weight"
                value={editState.finalWeight}
                keyboardType="numeric"
                editable={item.status === "approved"}
                onChangeText={setWeight}
                onBlur={() =>
                  handleUpdateStats(
                    item._id,
                    editState.rackHeight,
                    editState.finalWeight,
                    editState.finalHeight
                  )
                }
                style={[
                  styles.inputField,
                  item.status !== "approved" && styles.disabledInput,
                ]}
              />
              <TextInput
                placeholder="Height"
                value={editState.finalHeight}
                keyboardType="numeric"
                editable={item.status === "approved"}
                onChangeText={setHeight}
                onBlur={() =>
                  handleUpdateStats(
                    item._id,
                    editState.rackHeight,
                    editState.finalWeight,
                    editState.finalHeight
                  )
                }
                style={[
                  styles.inputField,
                  item.status !== "approved" && styles.disabledInput,
                ]}
              />
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (!eventId || typeof eventId !== "string") {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "red" }}>Invalid event ID</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.filters}>
        <View style={styles.searchBox}>
          <Search size={16} color="#888" />
          <TextInput
            placeholder="Search by Name or Email"
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
          />
        </View>

        <View style={styles.statusButtons}>
          {["all", "pending", "approved", "rejected"].map((s) => (
            <TouchableOpacity
              key={s}
              style={[
                styles.statusButton,
                status === s && styles.activeStatusButton,
              ]}
              onPress={() => setStatus(s as any)}
            >
              <Text
                style={[
                  styles.statusButtonText,
                  status === s && styles.activeStatusText,
                ]}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {isLoading ? (
        <ActivityIndicator
          size="large"
          color="#2563EB"
          style={{ marginTop: 40 }}
        />
      ) : (
        <ScrollView horizontal>
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <View style={[styles.headerCell, styles.nameColumn]}>
                <Text style={styles.cardDetail}>Name</Text>
              </View>
              <View style={[styles.headerCell, styles.emailColumn]}>
                <Text style={styles.cardDetail}>Email</Text>
              </View>
              {formMeta?.fields?.map((f, idx) => (
                <View key={idx} style={styles.headerCell}>
                  <Text style={styles.cardDetail}>{f.fieldName}</Text>
                </View>
              ))}
              <View style={[styles.headerCell, styles.statusColumn]}>
                <Text style={styles.cardDetail}>Status</Text>
              </View>
              <View style={[styles.headerCell, styles.approvalColumn]}>
                <Text style={styles.cardDetail}>Update Stats</Text>
              </View>
            </View>

            <FlatList
              data={filtered}
              keyExtractor={(item) => item._id}
              renderItem={renderRow}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No registrations found</Text>
              }
            />
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
