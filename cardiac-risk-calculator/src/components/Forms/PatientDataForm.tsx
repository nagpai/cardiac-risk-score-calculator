import React, { useCallback, useEffect, useMemo } from "react";
import { useFormValidation } from "../../hooks/useFormValidation";
import FormField from "./FormField";
import UnitSelector from "./UnitSelector";
import { Button } from "../UI";
import { FormErrorBoundary } from "../ErrorBoundary";
import type { PatientData } from "../../types";
import { FORM_OPTIONS } from "../../utils/constants";
import {
  convertCholesterolMgDlToMmolL,
  convertCholesterolMmolLToMgDl,
  convertGlucoseMgDlToMmolL,
  convertGlucoseMmolLToMgDl,
  formatValueForDisplay,
} from "../../utils/unitConverter";

interface PatientDataFormProps {
  onSubmit: (data: PatientData) => void;
  onDataChange?: (data: Partial<PatientData>) => void;
  initialData?: Partial<PatientData>;
  disabled?: boolean;
  showProgress?: boolean;
}

const PatientDataForm: React.FC<PatientDataFormProps> = ({
  onSubmit,
  onDataChange,
  initialData,
  disabled = false,
  showProgress = true,
}) => {
  const {
    form,
    formData,
    isFormComplete,
    getFieldError,
    handleSubmit,
    getFieldValidationRules,
  } = useFormValidation<PatientData>();

  const { register, setValue, watch, reset } = form;

  // Initialize form with initial data
  useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);

  // Notify parent of data changes
  useEffect(() => {
    if (onDataChange) {
      onDataChange(formData);
    }
  }, [formData, onDataChange]);

  // Handle cholesterol unit conversion
  const handleCholesterolUnitChange = useCallback(
    (newUnit: "mg/dL" | "mmol/L") => {
      const currentUnit = formData.cholesterolUnit;
      const totalChol = formData.totalCholesterol;
      const hdlChol = formData.hdlCholesterol;

      if (currentUnit && currentUnit !== newUnit) {
        // Convert existing values
        if (totalChol && !isNaN(totalChol)) {
          const convertedTotal =
            currentUnit === "mg/dL"
              ? convertCholesterolMgDlToMmolL(totalChol)
              : convertCholesterolMmolLToMgDl(totalChol);
          setValue(
            "totalCholesterol",
            parseFloat(
              formatValueForDisplay(convertedTotal, newUnit, "cholesterol")
            )
          );
        }

        if (hdlChol && !isNaN(hdlChol)) {
          const convertedHdl =
            currentUnit === "mg/dL"
              ? convertCholesterolMgDlToMmolL(hdlChol)
              : convertCholesterolMmolLToMgDl(hdlChol);
          setValue(
            "hdlCholesterol",
            parseFloat(
              formatValueForDisplay(convertedHdl, newUnit, "cholesterol")
            )
          );
        }
      }

      setValue("cholesterolUnit", newUnit);
    },
    [
      formData.cholesterolUnit,
      formData.totalCholesterol,
      formData.hdlCholesterol,
      setValue,
    ]
  );

  // Handle glucose unit conversion
  const handleGlucoseUnitChange = useCallback(
    (newUnit: "mg/dL" | "mmol/L") => {
      const currentUnit = formData.glucoseUnit;
      const glucose = formData.bloodGlucose;

      if (
        currentUnit &&
        currentUnit !== newUnit &&
        glucose &&
        !isNaN(glucose)
      ) {
        const convertedGlucose =
          currentUnit === "mg/dL"
            ? convertGlucoseMgDlToMmolL(glucose)
            : convertGlucoseMmolLToMgDl(glucose);
        setValue(
          "bloodGlucose",
          parseFloat(
            formatValueForDisplay(convertedGlucose, newUnit, "glucose")
          )
        );
      }

      setValue("glucoseUnit", newUnit);
    },
    [formData.glucoseUnit, formData.bloodGlucose, setValue]
  );

  // Calculate form completion progress
  const formProgress = useMemo(() => {
    const requiredFields = [
      "age",
      "gender",
      "totalCholesterol",
      "hdlCholesterol",
      "systolicBP",
      "diastolicBP",
      "smokingStatus",
    ];

    const completedFields = requiredFields.filter((field) => {
      const value = formData[field as keyof PatientData];

      // Simple and explicit check
      if (value === null || value === undefined) {
        return false;
      }
      
      // Check for empty string (cast to string first)
      if (String(value) === "") {
        return false;
      }

      // For string values, check if not empty after trimming
      if (typeof value === "string" && value.trim() === "") {
        return false;
      }

      // For number values, check if it's a valid number and not 0
      if (typeof value === "number" && (isNaN(value) || value === 0)) {
        return false;
      }

      return true;
    });

    return {
      completed: completedFields.length,
      total: requiredFields.length,
      percentage: Math.round(
        (completedFields.length / requiredFields.length) * 100
      ),
    };
  }, [formData]);

  const onFormSubmit = handleSubmit((data) => {
    onSubmit(data as PatientData);
  });

  return (
    <form onSubmit={onFormSubmit} className="space-y-6" noValidate>
      {/* Progress Indicator */}
      {showProgress && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-700">Form Progress</h3>
            <span className="text-sm text-gray-600">
              {formProgress.completed} of {formProgress.total} required fields
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${formProgress.percentage}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {formProgress.percentage}% complete
          </p>
        </div>
      )}

      {/* Demographics Section */}
      <FormErrorBoundary onReset={() => reset()}>
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
            Demographics
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormErrorBoundary
              fieldName="age"
              onReset={() => setValue("age", 30)}
            >
              <FormField
                label="Age"
                type="number"
                placeholder="Enter age (30-79)"
                required
                min={30}
                max={79}
                tooltip="Age must be between 30-79 years (Framingham study range)"
                error={getFieldError("age")}
                disabled={disabled}
                value={watch("age") || ""}
                {...register("age", getFieldValidationRules("age"))}
              />
            </FormErrorBoundary>

            <FormErrorBoundary
              fieldName="gender"
              onReset={() => setValue("gender", "male")}
            >
              <FormField
                label="Gender"
                type="select"
                options={FORM_OPTIONS.GENDER}
                required
                tooltip="Biological sex assigned at birth"
                error={getFieldError("gender")}
                disabled={disabled}
                value={watch("gender") || ""}
                {...register("gender", getFieldValidationRules("gender"))}
              />
            </FormErrorBoundary>
          </div>
        </div>
      </FormErrorBoundary>

      {/* Cholesterol Section */}
      <FormErrorBoundary
        onReset={() => {
          setValue("totalCholesterol", 200);
          setValue("hdlCholesterol", 50);
          setValue("cholesterolUnit", "mg/dL");
        }}
      >
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
            Cholesterol Levels
          </h3>

          <UnitSelector
            label="Cholesterol Unit"
            name="cholesterolUnit"
            value={watch("cholesterolUnit") || "mg/dL"}
            options={FORM_OPTIONS.CHOLESTEROL_UNITS}
            onChange={handleCholesterolUnitChange}
            disabled={disabled}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormErrorBoundary
              fieldName="totalCholesterol"
              onReset={() => setValue("totalCholesterol", 200)}
            >
              <FormField
                label="Total Cholesterol"
                type="number"
                placeholder={`Enter total cholesterol`}
                required
                step={watch("cholesterolUnit") === "mmol/L" ? 0.1 : 1}
                unit={watch("cholesterolUnit")}
                tooltip="Total cholesterol level from recent blood test"
                error={getFieldError("totalCholesterol")}
                disabled={disabled}
                value={watch("totalCholesterol") || ""}
                {...register(
                  "totalCholesterol",
                  getFieldValidationRules("totalCholesterol")
                )}
              />
            </FormErrorBoundary>

            <FormErrorBoundary
              fieldName="hdlCholesterol"
              onReset={() => setValue("hdlCholesterol", 50)}
            >
              <FormField
                label="HDL Cholesterol"
                type="number"
                placeholder={`Enter HDL cholesterol`}
                required
                step={watch("cholesterolUnit") === "mmol/L" ? 0.1 : 1}
                unit={watch("cholesterolUnit")}
                tooltip="HDL (good) cholesterol level from recent blood test"
                error={getFieldError("hdlCholesterol")}
                disabled={disabled}
                value={watch("hdlCholesterol") || ""}
                {...register(
                  "hdlCholesterol",
                  getFieldValidationRules("hdlCholesterol")
                )}
              />
            </FormErrorBoundary>
          </div>
        </div>
      </FormErrorBoundary>

      {/* Blood Pressure Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
          Blood Pressure
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Systolic Blood Pressure"
            type="number"
            placeholder="Enter systolic BP"
            required
            min={80}
            max={200}
            unit="mmHg"
            tooltip="The top number in your blood pressure reading"
            error={getFieldError("systolicBP")}
            disabled={disabled}
            value={watch("systolicBP") || ""}
            {...register("systolicBP", getFieldValidationRules("systolicBP"))}
          />

          <FormField
            label="Diastolic Blood Pressure"
            type="number"
            placeholder="Enter diastolic BP"
            required
            min={40}
            max={120}
            unit="mmHg"
            tooltip="The bottom number in your blood pressure reading"
            error={getFieldError("diastolicBP")}
            disabled={disabled}
            value={watch("diastolicBP") || ""}
            {...register("diastolicBP", getFieldValidationRules("diastolicBP"))}
          />
        </div>

        <FormField
          label="Currently taking blood pressure medication"
          name="onBPMedication"
          type="checkbox"
          tooltip="Check if you are currently taking medication to control blood pressure"
          disabled={disabled}
          value={watch("onBPMedication") || false}
          onChange={(e) => setValue("onBPMedication", (e.target as HTMLInputElement).checked)}
        />
      </div>

      {/* Additional Health Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
          Additional Health Information
        </h3>

        <FormField
          label="Smoking Status"
          name="smokingStatus"
          type="radio"
          options={FORM_OPTIONS.SMOKING_STATUS}
          required
          tooltip="Your current or past smoking history"
          error={getFieldError("smokingStatus")}
          disabled={disabled}
          value={watch("smokingStatus") || ""}
          onChange={(e) => setValue("smokingStatus", e.target.value as "never" | "former" | "current")}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="I have diabetes"
            name="hasDiabetes"
            type="checkbox"
            tooltip="Check if you have been diagnosed with diabetes (Type 1 or Type 2)"
            disabled={disabled}
            value={watch("hasDiabetes") || false}
            onChange={(e) => setValue("hasDiabetes", (e.target as HTMLInputElement).checked)}
          />

          <FormField
            label="Family history of heart disease"
            name="familyHistory"
            type="checkbox"
            tooltip="Check if you have immediate family members with heart disease"
            disabled={disabled}
            value={watch("familyHistory") || false}
            onChange={(e) => setValue("familyHistory", (e.target as HTMLInputElement).checked)}
          />
        </div>
      </div>

      {/* Optional Blood Glucose Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
          Blood Glucose{" "}
          <span className="text-sm font-normal text-gray-500">(Optional)</span>
        </h3>

        <UnitSelector
          label="Glucose Unit"
          name="glucoseUnit"
          value={watch("glucoseUnit") || "mg/dL"}
          options={FORM_OPTIONS.GLUCOSE_UNITS}
          onChange={handleGlucoseUnitChange}
          disabled={disabled}
        />

        <FormField
          label="Blood Glucose"
          type="number"
          placeholder={`Enter blood glucose (optional)`}
          step={watch("glucoseUnit") === "mmol/L" ? 0.1 : 1}
          unit={watch("glucoseUnit")}
          tooltip="Fasting blood glucose level (optional but helpful for risk assessment)"
          error={getFieldError("bloodGlucose")}
          disabled={disabled}
          value={watch("bloodGlucose") || ""}
          {...register("bloodGlucose", getFieldValidationRules("bloodGlucose"))}
        />
      </div>

      {/* Submit Button */}
      <div className="pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {isFormComplete ? (
              <span className="text-green-600 font-medium">
                ✓ All required fields completed
              </span>
            ) : (
              <span>Please complete all required fields to calculate risk</span>
            )}
          </div>

          <Button
            type="submit"
            disabled={disabled || !isFormComplete}
            className="px-6 py-2"
          >
            Calculate Risk Score
          </Button>
        </div>
      </div>
    </form>
  );
};

export default PatientDataForm;
