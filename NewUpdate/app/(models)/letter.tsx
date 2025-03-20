import mongoose from 'mongoose';
import userReferenceSchema from "@/app/helpers/userReferenceSchema";

const MedicalCertificateSchema = new mongoose.Schema(
  {
    briefExplanation: {
      type: String,
      
    },
    diagnosis: {
      type: String,
     
    },
    restDate: {
      type: String,
   
    },
    patientId: {
      id: {
        type: mongoose.Types.ObjectId,
        ref: "Patient",
        required: [true, "Please provide the Patient ID"],
      },
    },
    createdBy: userReferenceSchema,
    changeHistory: [
      {
        updatedBy: userReferenceSchema,
        updateTime: { type: Date, default: Date.now },
      },
    ],
    // Auto-incrementing card number
    cardNumber: {
      type: Number,
      unique: true,
    },
  },
  { timestamps: true }
);

// Pre-save hook to generate an incremented card number
MedicalCertificateSchema.pre("save", async function (next) {
  if (!this.cardNumber) {
    try {
      const lastMedicalCertificate = await mongoose
        .model("MedicalCertificate")
        .findOne({}, { cardNumber: 1 })
        .sort({ cardNumber: -1 }); // Get the highest card number

      this.cardNumber = lastMedicalCertificate ? lastMedicalCertificate.cardNumber + 1 : 100000; // Start from 100000
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// ✅ Avoid model recompilation during hot reloads
const MedicalCertificate =
  mongoose.models.MedicalCertificate ||
  mongoose.model("MedicalCertificate", MedicalCertificateSchema);

export default MedicalCertificate;
