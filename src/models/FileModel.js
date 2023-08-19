const mongoose = require("mongoose");

const FileSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  fileType: { type: String, required: true },
  size: { type: Number, required: true },
  shortId: { type: String, required: true, unique: true },
  path: { type: String, required: true },
  uploadedOn: {
    type: Date,
    default: Date.now,
  },
  expireOn: { type: Date, default: () => Date.now() + 24 * 60 * 60 * 1000 },
});

const FileModel = mongoose.model("files", FileSchema);
module.exports = FileModel;
