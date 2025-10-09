const mongoose = require("mongoose");
const categorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    categoryType:{
        type:String,
    },
  },
  {
    timestamps: true // includes createdAt and updatedAt automatically
  }
);
module.exports = mongoose.model("category", categorySchema);