const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
  }
});

const BannerSchema = new mongoose.Schema(
  {
    images: {
      type: [imageSchema],
    },
    type: {
      type: String,
      enum: ["header","header2","mobileheader","article" , "whynyro","deal","wedding", "body"],
      required: true,
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Banner", BannerSchema);
