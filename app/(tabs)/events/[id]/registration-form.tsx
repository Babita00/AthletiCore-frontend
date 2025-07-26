import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
  useColorScheme,
} from "react-native";
import {
  ArrowLeft,
  Send,
  Calendar,
  ChevronDown,
  CircleCheck as CheckCircle,
  CircleAlert as AlertCircle,
} from "lucide-react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { theme } from "@/constants/theme";
import { styles } from "@/styles/formRegistrationStyles";
import { useGetEventForm } from "@/hooks/useGetEventsForm";
import { IFormField } from "@/types/form";
import { useSubmitEventForm } from "@/hooks/useSubmitEventForm";
import { useUpdateFormFields } from "@/hooks/useUpdateFormFields";
import { useGetMySubmissions } from "@/hooks/useGetMySubmissions";

export default function EventRegistrationFormScreen() {
  const { id: eventId, registrationId, mode } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = isDark ? theme.dark : theme.light;

  const isEditMode = mode === "edit" && typeof registrationId === "string";
  const { mutate: submitForm } = useSubmitEventForm();
  const { mutate: updateForm } = useUpdateFormFields();
  const { data: submissionData, isLoading: loadingSubmission } =
    useGetMySubmissions(registrationId as string);

  const { data, isLoading } = useGetEventForm(eventId as string);
  const form = data;

  const [formData, setFormData] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDropdown, setShowDropdown] = useState<string | null>(null);
  const [dateFieldToShow, setDateFieldToShow] = useState<string | null>(null);

  const validFieldTypes = ["text", "number", "select", "date"] as const;

  useEffect(() => {
    if (
      submissionData &&
      Array.isArray(submissionData) &&
      submissionData[0]?.formFields
    ) {
      const prefilled: Record<string, string> = {};
      submissionData[0].formFields.forEach(({ key, value }) => {
        prefilled[key] = value;
      });
      setFormData(prefilled);
    }
  }, [submissionData]);

  const updateFormData = (fieldId: string, value: string) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
    if (errors[fieldId]) {
      setErrors((prev) => ({ ...prev, [fieldId]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    fieldsWithId.forEach((field) => {
      if (field.required && !formData[field.id]?.trim()) {
        newErrors[field.id] = `${field.fieldName} is required`;
      }
      if (field.fieldType === "number" && formData[field.id]) {
        const num = Number(formData[field.id]);
        if (isNaN(num) || num <= 0) {
          newErrors[field.id] = `${field.fieldName} must be a positive number`;
        }
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDateChange = (
    fieldId: string,
    event: any,
    selectedDate?: Date
  ) => {
    if (event.type === "set" && selectedDate) {
      const formattedDate = selectedDate.toISOString().split("T")[0];
      updateFormData(fieldId, formattedDate);
    }
    setDateFieldToShow(null);
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      Alert.alert("Error", "Please fix the errors in the form");
      return;
    }

    setIsSubmitting(true);
    const formFields = Object.entries(formData).map(([key, value]) => ({
      key,
      value,
    }));

    if (isEditMode) {
      updateForm(
        {
          submissionId: registrationId as string,
          data: { formFields },
        },
        {
          onSuccess: () => {
            router.back();
          },
          onError: (error: any) => {
            Alert.alert(
              "Error",
              error.response?.data?.message || "Something went wrong."
            );
          },
          onSettled: () => setIsSubmitting(false),
        }
      );
    } else {
      submitForm(
        {
          eventId: eventId as string,
          formFields,
        },
        {
          onSuccess: () => {
            router.back();
          },
          onError: (error: any) => {
            Alert.alert(
              "Error",
              error.response?.data?.message || "Something went wrong."
            );
          },
          onSettled: () => setIsSubmitting(false),
        }
      );
    }
  };

  if (isLoading || (isEditMode && loadingSubmission)) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.onSurface }]}>
            Loading form...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!form || !Array.isArray(form.fields)) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.onSurface }]}>
            Registration is currently closed.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const fieldsWithId: IFormField[] = form.fields
    .map((field, index) => {
      const id = (field as any).id ?? `field_${index}`;
      if (!validFieldTypes.includes(field.fieldType)) return null;
      return { ...field, id };
    })
    .filter(Boolean) as IFormField[];

  const renderField = (field: IFormField) => {
    const hasError = !!errors[field.id];
    const value = formData[field.id] || "";

    switch (field.fieldType) {
      case "text":
      case "number":
        return (
          <View key={field.id} style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, { color: colors.onSurface }]}>
              {field.fieldName}
              {field.required && (
                <Text style={{ color: colors.error }}> *</Text>
              )}
            </Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: colors.surface,
                  borderColor: hasError ? colors.error : colors.border,
                  color: colors.onSurface,
                },
              ]}
              value={value}
              onChangeText={(text) => updateFormData(field.id, text)}
              placeholder={`Enter ${field.fieldName.toLowerCase()}`}
              placeholderTextColor={colors.onSurfaceVariant}
              keyboardType={
                field.fieldType === "number" ? "numeric" : "default"
              }
            />
            {hasError && (
              <View style={styles.errorContainer}>
                <AlertCircle size={14} color={colors.error} />
                <Text style={[styles.errorText, { color: colors.error }]}>
                  {errors[field.id]}
                </Text>
              </View>
            )}
          </View>
        );

      case "date":
        return (
          <View key={field.id} style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, { color: colors.onSurface }]}>
              {field.fieldName}
              {field.required && (
                <Text style={{ color: colors.error }}> *</Text>
              )}
            </Text>
            <TouchableOpacity
              style={[
                styles.dateInput,
                {
                  backgroundColor: colors.surface,
                  borderColor: hasError ? colors.error : colors.border,
                },
              ]}
              onPress={() => setDateFieldToShow(field.id)}
            >
              <Calendar size={20} color={colors.onSurfaceVariant} />
              <Text
                style={[
                  styles.dateInputText,
                  { color: value ? colors.onSurface : colors.onSurfaceVariant },
                ]}
              >
                {value || "Select date"}
              </Text>
            </TouchableOpacity>
            {dateFieldToShow === field.id && (
              <DateTimePicker
                mode="date"
                display={Platform.OS === "ios" ? "inline" : "default"}
                value={value ? new Date(value) : new Date()}
                onChange={(event, selectedDate) =>
                  handleDateChange(field.id, event, selectedDate)
                }
              />
            )}
            {hasError && (
              <View style={styles.errorContainer}>
                <AlertCircle size={14} color={colors.error} />
                <Text style={[styles.errorText, { color: colors.error }]}>
                  {errors[field.id]}
                </Text>
              </View>
            )}
          </View>
        );

      case "select":
        return (
          <View key={field.id} style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, { color: colors.onSurface }]}>
              {field.fieldName}
              {field.required && (
                <Text style={{ color: colors.error }}> *</Text>
              )}
            </Text>
            <TouchableOpacity
              style={[
                styles.selectInput,
                {
                  backgroundColor: colors.surface,
                  borderColor: hasError ? colors.error : colors.border,
                },
              ]}
              onPress={() =>
                setShowDropdown(showDropdown === field.id ? null : field.id)
              }
            >
              <Text
                style={[
                  styles.selectInputText,
                  {
                    color: value ? colors.onSurface : colors.onSurfaceVariant,
                  },
                ]}
              >
                {value || `Select ${field.fieldName.toLowerCase()}`}
              </Text>
              <ChevronDown
                size={20}
                color={colors.onSurfaceVariant}
                style={{
                  transform: [
                    { rotate: showDropdown === field.id ? "180deg" : "0deg" },
                  ],
                }}
              />
            </TouchableOpacity>
            {showDropdown === field.id &&
              field.options?.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dropdownOption,
                    {
                      borderBottomColor: colors.border,
                      borderBottomWidth:
                        index === field.options!.length - 1 ? 0 : 1,
                    },
                  ]}
                  onPress={() => {
                    updateFormData(field.id, option);
                    setShowDropdown(null);
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownOptionText,
                      { color: colors.onSurface },
                    ]}
                  >
                    {option}
                  </Text>
                  {value === option && (
                    <CheckCircle size={16} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            {hasError && (
              <View style={styles.errorContainer}>
                <AlertCircle size={14} color={colors.error} />
                <Text style={[styles.errorText, { color: colors.error }]}>
                  {errors[field.id]}
                </Text>
              </View>
            )}
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.surface,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.backButton,
            { backgroundColor: colors.surfaceVariant },
          ]}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.onSurface }]}>
          Event Registration
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.infoSection, { backgroundColor: colors.surface }]}>
          <Text style={[styles.infoTitle, { color: colors.onSurface }]}>
            Registration Form
          </Text>
          <Text style={[styles.infoText, { color: colors.onSurfaceVariant }]}>
            Please fill out all required fields to complete your registration
            for this event.
          </Text>
        </View>

        <View style={[styles.formSection, { backgroundColor: colors.surface }]}>
          {fieldsWithId.map(renderField)}
        </View>

        <TouchableOpacity
          style={[
            styles.submitButton,
            {
              backgroundColor: isSubmitting
                ? colors.surfaceVariant
                : colors.primary,
              opacity: isSubmitting ? 0.6 : 1,
            },
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Send size={20} color="#FFFFFF" />
          <Text style={styles.submitButtonText}>
            {isSubmitting
              ? isEditMode
                ? "Updating..."
                : "Submitting..."
              : isEditMode
              ? "Update Registration"
              : "Submit Registration"}
          </Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}
