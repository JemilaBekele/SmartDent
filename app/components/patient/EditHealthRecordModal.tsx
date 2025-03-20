"use client";

import React, { useState, useEffect } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
} from "@mui/material";

// Define MedicalRecordData type
interface MedicalRecordData {
  _id: string;
  bloodgroup: string;
  weight: string;
  height: string;
  allergies: string;
  habits: string;
  Medication: string;
  Core_Temperature: string;
  Respiratory_Rate: string;
  Blood_Oxygen: string;
  Blood_Pressure: string;
  heart_Rate: string;
  Hypotension:string;
  Tuberculosis:string;
  Hepatitis:string
  Diabetics:string;
  BleedingTendency:string;
  Epilepsy:string
  Astema:string;
  description:string;
  userinfo: Array<{
    BloodPressure: boolean;
    Hypotension: boolean;
    Diabetics: boolean;
    BleedingTendency: boolean;
    Tuberculosis: boolean;
    Epilepsy: boolean;
    Hepatitis: boolean;
    Allergies: boolean;
    Asthma: boolean;
    IfAnydrugstaking: boolean;
    Pregnancy: boolean;
    IfanyotherDiseases: string;
  }>;
}

interface EditHealthRecordModalProps {
  isOpen: boolean;
  formData: MedicalRecordData | null;
  onClose: () => void;
  onUpdate: (data: MedicalRecordData) => Promise<void>;
}

const EditHealthRecordModal: React.FC<EditHealthRecordModalProps> = ({
  isOpen,
  formData,
  onClose,
  onUpdate,
}) => {
  const [localData, setLocalData] = useState<MedicalRecordData | null>(formData);

  useEffect(() => {
    setLocalData(formData);
  }, [formData]);

  if (!isOpen || !localData) return null;

  const handleChange = (field: keyof MedicalRecordData, value: string) => {
    setLocalData({ ...localData, [field]: value });
  };
  const handleUserInfoChange = (
    field: keyof MedicalRecordData["userinfo"][0],
    value: string | boolean
  ) => {
    if (localData) {
      const updatedUserInfo = [...localData.userinfo];
      if (field === "IfanyotherDiseases") {
        updatedUserInfo[0][field] = value as string; // Handle string field
      } else {
        updatedUserInfo[0][field] = value === "true"; // Handle boolean fields
      }
      setLocalData({ ...localData, userinfo: updatedUserInfo });
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (localData) {
      await onUpdate(localData);
    }
  };
  const style = {
    position: "absolute" as const,
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: '90%', // Responsive width
    maxWidth: 1200, // Maximum width for larger screens
    bgcolor: "background.paper",
    boxShadow: 24,
    maxHeight: "80vh",
    overflowY: "auto",
    p: 4,
    borderRadius: 2,
  };
  return (
    <Modal open={isOpen} onClose={onClose}>
      <Box sx={style}>
        <Typography variant="h6">Edit Medical Record</Typography>
        <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
            {/* Blood Group */}
            <Grid item xs={12} sm={4}>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Blood Group</InputLabel>
            <Select
              value={localData.bloodgroup}
              onChange={(e) => handleChange("bloodgroup", e.target.value)}
            >
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(group => (
                <MenuItem key={group} value={group}>{group}</MenuItem>
              ))}
            </Select>
          </FormControl>
          </Grid>
          {["weight", "height", "Medication", "allergies", "habits", "Core_Temperature", "Respiratory_Rate", "Blood_Oxygen", "Blood_Pressure", "heart_Rate","Hypotension","Tuberculosis","Astema","Hepatitis","Diabetics","BleedingTendency","Epilepsy","description"].map((field) => (
                         <Grid item xs={12} sm={4} key={field}>
           <TextField
              key={field}
              fullWidth
              label={field.replace(/_/g, " ")}
              value={localData[field as keyof MedicalRecordData]}
              onChange={(e) => handleChange(field as keyof MedicalRecordData, e.target.value)}
              sx={{ mt: 2 }}
            /></Grid>
          ))}

           {/* User Information Fields */}
           {localData.userinfo && localData.userinfo.length > 0 && (
              <>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ mt: 3 }}>User Information</Typography>
                </Grid>
                {Object.entries(localData.userinfo[0]).map(([key, value]) => {
                  if (key === "_id") return null; // Exclude _id

                  if (key === "IfanyotherDiseases") {
                    return (
                      <Grid item xs={12} sm={4} key={key}>
                        <TextField
                          fullWidth
                          label="If any other diseases"
                          value={value || ""}
                          onChange={(e) =>
                            handleUserInfoChange(key as "IfanyotherDiseases", e.target.value)
                          }
                          sx={{ mt: 2 }}
                        />
                      </Grid>
                    );
                  }

                  if (typeof value === "boolean") {
                    return (
                      <Grid item xs={12} sm={4} key={key}>
                        <FormControl fullWidth sx={{ mt: 2 }}>
                          <InputLabel>{key === "Tuberculosis" ? "Tuberculosis / Pneumonia" : key.replace(/([A-Z])/g, ' $1').trim()}:</InputLabel>
                          <Select
                            value={value ? "true" : "false"}
                            onChange={(e) =>
                              handleUserInfoChange(key as keyof MedicalRecordData["userinfo"][0], e.target.value)
                            }
                          >
                            <MenuItem value="true">True</MenuItem>
                            <MenuItem value="false">False</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                    );
                  }

                  return null; // Return null if it doesn't match the conditions
                })}
              </>
            )}
          </Grid>
          <Box display="flex" justifyContent="space-between" mt={3}>
            <Button variant="contained" type="submit">Update</Button>
            <Button variant="outlined" onClick={onClose}>Cancel</Button>
          </Box>
        </form>
      </Box>
    </Modal>
  );
};

export default EditHealthRecordModal;