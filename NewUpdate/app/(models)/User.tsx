import mongoose from "mongoose";


const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Please provide a username"],
    minlength: 3,
    maxlength: 50, // Fixed typo from "maxkength"
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
  },
  role: {
    type: String,
    enum: ['admin', 'doctor', 'reception','User'],
    required: [true, "Please provide a role"],
  },
  phone: {
    type: String,
    required: [true, "Please provide a phone number"],
  },
  image: {
    type: String,
    required: false, // Optional: set to true if you want to require an image
    default: null, // Default value if no image is provided
  },
});




const User = mongoose.models.User || mongoose.model("User", userSchema);



export default User;
