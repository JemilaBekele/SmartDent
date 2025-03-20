import mongoose from 'mongoose';
import userReferenceSchema from "@/app/helpers/userReferenceSchema";

const AppointmentSchema = new mongoose.Schema({
  appointmentDate: {
    type: Date,
   
  },
  appointmentTime: {
    type: String, // You can also use Number if you want to store time in a specific format like military time
    
  },
  reasonForVisit: {
    type: String,
  },
  status: {
    type: String,
   
    enum: ['Scheduled', 'Completed', 'Cancelled'],
  },
  doctorId: {
    id: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
     
    },
    username: {
      type: String,
     
    },
  },
  patientId: {
    id: {
      type: mongoose.Types.ObjectId,
      ref: 'Patient',
      required: [true, 'Please provide Patient ID'],
    },
    username: {
      type: String,
      required: [true, 'Please provide Patient name'],
    },
    cardno: {
      type: String,
      required: [true, 'Please provide Patient name'],
    },
  },
  createdBy: userReferenceSchema,
}, { timestamps: true });

// Avoid model recompilation during hot reloads
const Appointment = mongoose.models.Appointment || mongoose.model('Appointment', AppointmentSchema);

export default Appointment;
