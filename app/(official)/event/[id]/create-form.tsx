import React, { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Alert,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import FormHeader from "@/components/Official/createEventForm/FormHeader";
import InfoSection from "@/components/Official/createEventForm/InfoSection";
import FormFieldCard from "@/components/Official/createEventForm/FormFieldCard";
import FormPreview from "@/components/Official/createEventForm/FormPreview";
import { styles } from "@/styles/create-event-formStyles";
import { theme } from "@/constants/theme";
import { IFormField } from "@/types/form";
import { useCreateEventForm } from "@/hooks/useCreateEventForm";

const staticFields: IFormField[] = [
  {
    id: 'full-name',
    fieldName: 'Full Name',
    fieldType: 'text',
    required: true,
    options: [],
    key: 'fullName',
  },
  {
    id: 'static-age',
    fieldName: 'Age',
    fieldType: 'number',
    required: true,
    options: [],
    key: 'age',
  },
  {
    id: 'static-body-weight',
    fieldName: 'Body Weight',
    fieldType: 'number',
    required: true,
    options: [],
    key: 'bodyWeight',
  },
  {
    id: 'static-initial-weight-for-squat',
    fieldName: 'Initial Weight For Squat',
    fieldType: 'number',
    required: true,
    options: [],
    key: 'static-initial-weight-for-squat', // ✅ Fixed to match backend
  },
  {
    id: 'static-initial-weight-for-bench-press',
    fieldName: 'Initial Weight For Bench Press',
    fieldType: 'number',
    required: true,
    options: [],
    key: 'static-initial-weight-for-bench-press', // ✅ Fixed to match backend
  },
  {
    id: 'static-initial-weight-for-deadlift',
    fieldName: 'Initial Weight For Deadlift', // ✅ Fixed field name
    fieldType: 'number',
    required: true,
    options: [],
    key: 'static-initial-weight-for-deadlift', // ✅ Fixed key and made unique
  },
];

export default function CreateEventFormScreen() {
  const { mutate: createForm } = useCreateEventForm();
  const { id: eventId } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = isDark ? theme.dark : theme.light;

  const [formFields, setFormFields] = useState<IFormField[]>([...staticFields]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addField = () => {
    const newField: IFormField = {
      id: generateId(),
      fieldName: "",
      fieldType: "text",
      required: false,
      options: [],
    };
    setFormFields((prev) => [...prev, newField]);
  };

  const removeField = (id: string) => {
    if (staticFields.find((f) => f.id === id)) {
      Alert.alert("Error", "This field is required and cannot be removed");
      return;
    }
    setFormFields((prev) => prev.filter((field) => field.id !== id));
  };

  const updateField = (id: string, updates: Partial<IFormField>) => {
    if (staticFields.find((f) => f.id === id)) {
      return;
    }
    setFormFields((prev) =>
      prev.map((field) => (field.id === id ? { ...field, ...updates } : field))
    );
  };

  const addOption = (fieldId: string) => {
    const field = formFields.find((f) => f.id === fieldId);
    if (field) {
      const newOptions = [...(field.options || []), ""];
      updateField(fieldId, { options: newOptions });
    }
  };

  const updateOption = (
    fieldId: string,
    optionIndex: number,
    value: string
  ) => {
    const field = formFields.find((f) => f.id === fieldId);
    if (field && field.options) {
      const newOptions = [...field.options];
      newOptions[optionIndex] = value;
      updateField(fieldId, { options: newOptions });
    }
  };

  const removeOption = (fieldId: string, optionIndex: number) => {
    const field = formFields.find((f) => f.id === fieldId);
    if (field && field.options && field.options.length > 1) {
      const newOptions = field.options.filter(
        (_, index) => index !== optionIndex
      );
      updateField(fieldId, { options: newOptions });
    }
  };

  const validateForm = (): boolean => {
    for (const field of formFields) {
      if (!field.fieldName.trim()) {
        Alert.alert("Error", "All fields must have a name");
        return false;
      }
      if (field.fieldType === "select") {
        const validOptions = field.options?.filter((opt) => opt.trim()) || [];
        if (validOptions.length === 0) {
          Alert.alert(
            "Error",
            `Select field "${field.fieldName}" must have at least one valid option`
          );
          return false;
        }
      }
    }
    return true;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    setIsSubmitting(true);

    const payload = {
      eventId: eventId as string,
      fields: formFields.map(({ fieldName, fieldType, required, options }) => ({
        fieldName: fieldName.trim(),
        fieldType,
        required,
        options: options?.map((opt) => opt.trim()).filter(Boolean),
      })),
    };

    createForm(payload, {
      onSuccess: () => {
        setIsSubmitting(false);
        router.navigate(`/event/${eventId}`);
      },
      onError: (error) => {
        setIsSubmitting(false);
        Alert.alert("Error", error.message);
      },
    });
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <FormHeader
        onBack={() => router.back()}
        onSave={handleSubmit}
        isSubmitting={isSubmitting}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <InfoSection />

        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          {formFields.map((field, index) => (
            <FormFieldCard
              key={field.id}
              field={field}
              index={index}
              isStatic={staticFields.some((f) => f.id === field.id)}
              onUpdateField={updateField}
              onRemoveField={removeField}
              onAddOption={addOption}
              onUpdateOption={updateOption}
              onRemoveOption={removeOption}
            />
          ))}

          <TouchableOpacity
            style={[styles.addFieldButton, { backgroundColor: colors.primary }]}
            onPress={addField}
          >
            <Text style={styles.addFieldText}>+ Add Field</Text>
          </TouchableOpacity>
        </View>

        <FormPreview fields={formFields} />
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}
