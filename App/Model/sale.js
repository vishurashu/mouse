const mongoose = require("mongoose");
const SaleSchema = new mongoose.Schema(
  {
    saleName: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    discount: {
      type: String,
    },
    gender: {
      type: String,
      enum: ["men", "women", "unisex", "all"],
      default: "all",
    },
    image: {
      type: String,
    },
    mobileIamge: {
      type: String,
    },

    stratDate: {
      type: String,
    },
    endDate: {
      type: String,
    },
    // category: {
    //   type: String,
    //   enum: ["shirts", "jackets", "pants"],
    //   default: "shirts",
    // },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "category",
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Sale", SaleSchema);
