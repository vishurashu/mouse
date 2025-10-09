const mongoose = require("mongoose");
const CmsSchema = new mongoose.Schema(
  {
    description: {
      type: String,
    },
    type: {
      type: String,
      enum: ["about", "terms", "privacy"],
      default: "about",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Cms", CmsSchema);