const mongoose = require("mongoose");
const AddressSchema = new mongoose.Schema(
  {
    address1: {
      type: String,
      required: true,
    },
    address2: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    pincode: {
      type: Number,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    landmark: {
      type: String,
    },
    type : {
      type: String,
      enum: ["primary", "home", "work"],
      required: true,
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Address", AddressSchema);