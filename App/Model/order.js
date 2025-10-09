const mongoose = require("mongoose");
const OrderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    amount: {
      type: String,
      required: true,
    },
    currency: {
      type: String,
      required: true,
    },
    productId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
      }
    ],
    orderStatus: {
      type: String,
      enum: ["pending", "shipped", "delivered","cancel","return","approved","declined"],
      default: "pending",
    },
    paymentMode: {
      type: String,
      enum: ["cod", "online"],
      default: "cod",
    },
    paymentId: {
      type: String,
    },
    signature: {
      type: String,
      required: true,
    },
    orderObj: {
      type: Object,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", OrderSchema);
