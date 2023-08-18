const mongoose = require("mongoose");

const FileSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  shortId: { type: String, required: true, unique: true },
  path: { type: String, required: true },
  expireAt: { type: Date, default: Date.now, index: { expires: "1d" } }, // File will expire in 1 day
});

const FileModel = mongoose.model("files", FileSchema);
module.exports = FileModel;
