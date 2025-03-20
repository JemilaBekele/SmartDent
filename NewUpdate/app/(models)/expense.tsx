import mongoose from "mongoose";
import userReferenceSchema from "@/app/helpers/userReferenceSchema";


const ExpenseSchema = new mongoose.Schema({
 
  discription: {
        type: String,
        required: true,
         // Calculated based on items
      },   
  
  amount: {
    type: Number,
    required: true,
     
      },

  createdBy: userReferenceSchema,

}, 
{
  timestamps: true,
  strictPopulate: false,
});

const Expense = mongoose.models.Expense || mongoose.model('Expense', ExpenseSchema);

export default Expense;
