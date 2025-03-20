import mongoose from 'mongoose';
import userReferenceSchema from "@/app/helpers/userReferenceSchema";

const MedicalFindingSchema = new mongoose.Schema({
  
  ChiefCompliance: {
    type: String,
  },
  Historypresent: {
   
    type: String,
  },
  PresentCondition: {  
    type: String,
  },
  DrugAllergy: {  
    type: String,
  },
  Diagnosis: {  
    type: String,
  },
  Pastmedicalhistory: {
    
    type: String,
  },
  Pastdentalhistory: {
    type: String,
  },
  IntraoralExamination: {
    type: String,
  },
  ExtraoralExamination: {
    type: String,
  },
  Investigation: {
    type: String,
  },
  Assessment: {
    type: String,
  },
  NextProcedure: {
    type: String,
  },
  TreatmentPlan: [
    {   Extraction:  { type: Boolean ,  default: false},
      Scaling:  { type: Boolean,  default: false },
      Rootcanal:  { type: Boolean, default: false },
      Filling :  { type: Boolean, default: false },
      Bridge:  { type: Boolean, default: false },
      Crown:  { type: Boolean, default: false },
      Apecectomy:  { type: Boolean, default: false},
      Fixedorthodonticappliance:  { type: Boolean, default: false},
      Removableorthodonticappliance:  { type: Boolean, default: false },
      Removabledenture:  { type: Boolean, default: false },
      Splinting:  { type: Boolean, default: false},
      other:  { type: String, required: false },
      ToothNumber: { type: String, required: false },
      Plan: { type: String, required: false },
    },
  ],
  TreatmentDone: [
    {   Extraction:  { type: Boolean ,  default: false},
    Scaling:  { type: Boolean,  default: false },
    Rootcanal:  { type: Boolean, default: false },
    Filling :  { type: Boolean, default: false },
    Bridge:  { type: Boolean, default: false },
    Crown:  { type: Boolean, default: false },
    Apecectomy:  { type: Boolean, default: false},
    Fixedorthodonticappliance:  { type: Boolean, default: false},
    Removableorthodonticappliance:  { type: Boolean, default: false },
    Removabledenture:  { type: Boolean, default: false },
    Splinting:  { type: Boolean, default: false},
   other:  { type: String, required: false },
   ToothNumber: { type: String, required: false },
  Done: { type: String, required: false },
    },
  ],
  changeHistory: [
    {
      updatedBy: userReferenceSchema, // Reusing your existing userReferenceSchema
      updateTime: { type: Date, default: Date.now }, // Automatically captures the update time
    },
  ],
  diseases: [
    {
      disease: {
        type: mongoose.Schema.Types.ObjectId,  // Reference to Disease model
        ref: 'Disease',
      },
      diseaseTime: { 
        type: Date, 
        default: Date.now 
      },
    },
  ],
  patientId: {
    id: {
      type: mongoose.Types.ObjectId,
      ref: 'Patient',
      required: [true, 'Please provide Patient ID'],
    }
    
  },
  createdBy: userReferenceSchema,
}, { timestamps: true });

const MedicalFinding = mongoose.models.MedicalFinding || mongoose.model('MedicalFinding', MedicalFindingSchema);

export default MedicalFinding;