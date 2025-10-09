const mongoose = require("mongoose");
const TallySchema = new mongoose.Schema(
  {
    laserName: {
      type: String,
      required: true,
    },
    parent: {
      type:String,
      required: true,
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Tally", TallySchema);