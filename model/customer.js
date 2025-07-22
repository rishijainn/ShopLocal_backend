const mongoose = require('mongoose');

// Defining the schema for Customer
const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true, // Name is required
    },
    email: {
      type: String,
      required: true, // Email is required
      unique: true, // Ensure email is unique
      lowercase: true, // Convert email to lowercase
    },
    password: {
      type: String,
      required: true, // Password is required
    },
    fcmToken: 
    { type: String,
     default: null },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Creating the model from the schema
const Customer = mongoose.model('Customer', customerSchema);

module.exports = { Customer };
