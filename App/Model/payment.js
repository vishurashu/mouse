const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    payment_id: {
      type: String,
      required: [true, "Payment ID is required"],
      unique: true
    },
    order_id: {
      type: String,
      required: [true, "Order ID is required"],
    },
    amount: {
      type: Number,  // Changed from String to Number
      required: [true, "Amount is required"],
      min: 1
    },
    currency: {
      type: String,
      required: true,
      default: "INR",
      enum: ["INR"]  // Add other currencies if needed
    },
    method: {
      type: String,
      required: true,
      enum: ["upi", "credit_card", "netbanking", "wallet"], // Razorpay methods
    },
    status: {
      type: String,
      required: true,
      enum: ["created", "authorized", "captured", "refunded", "failed"],
      default: "created"
    },
    razorpay_signature: {
      type: String,
      required: [true, "Signature is required"]
    },
    customer: {
      name: {
        type: String,
        required: true
      },
      email: {
        type: String,
        required: true
      },
      contact: {
        type: String,
        required: true,
        validate: {
          validator: function(v) {
            return /^\+91\d{10}$/.test(v);
          },
          message: props => `${props.value} is not a valid Indian phone number!`
        }
      }
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// // Add indexes for frequent queries
// paymentSchema.index({ payment_id: 1 });
// paymentSchema.index({ userId: 1, status: 1 });

 module.exports = mongoose.model("Payment", paymentSchema); 