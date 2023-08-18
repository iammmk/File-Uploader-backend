const express = require("express");
const fileRouter = express.Router();

const {
  uploadFile,
  upload,
  getAllFiles,
  getFileByShortId,
  downloadFile,
  deleteFile,
} = require("../service/fileService");

fileRouter.get("/", getAllFiles);
fileRouter.get("/:shortId", getFileByShortId);
fileRouter.get("/download/:shortId", downloadFile);
fileRouter.post("/upload", upload.single("file"), uploadFile);
fileRouter.delete("/delete/:shortId", deleteFile);

module.exports = fileRouter;
