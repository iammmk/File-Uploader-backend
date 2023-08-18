const multer = require("multer");
const shortid = require("shortid");
const FileModel = require("../models/FileModel");
const fs = require("fs");
const path = require("path");
const dir = "./uploads";

// create the directory if not exists
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname); // Added a timestamp to make filenames unique
  },
});

const upload = multer({
  storage: storage,
  //   fileFilter: async function (req, file, cb) {
  //     const stream = require("stream");
  //     const pass = new stream.PassThrough();
  //     file.stream.pipe(pass);

  //     // Read the first part of the stream to determine the file type
  //     const fileType = await FileType.fromStream(pass);

  //     // Mimetypes for allowed file types
  //     const allowedTypes = [
  //       "image/jpeg",
  //       "image/png",
  //       "application/pdf",
  //       "text/plain",
  //       "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  //     ];

  //     if (fileType && allowedTypes.includes(fileType.mime)) {
  //       cb(null, true); // Accept the file
  //     } else {
  //       cb(new Error("Invalid file type"), false); // Reject the file
  //     }
  //   },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

async function uploadFile(req, res) {
  try {
    const shortId = shortid.generate();
    const expireAt = new Date();
    expireAt.setDate(expireAt.getDate() + 1);

    const fileData = {
      filename: req.file.filename,
      shortId: shortId,
      path: req.file.path,
      expireAt: expireAt,
    };

    const addedFile = await FileModel.create(fileData);

    res.status(200).json({
      message: "File successfully uploaded",
      shortId: addedFile.shortId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to upload file",
      error,
    });
  }
}

async function getAllFiles(req, res) {
  try {
    const files = await FileModel.find({});
    res.status(200).json({
      message: "Fetched all files",
      data: files,
    });
  } catch (error) {
    res.status(501).json({
      message: "Failed to fetch files",
      error,
    });
  }
}

async function getFileByShortId(req, res) {
  try {
    const shortId = req.params.shortId;
    const file = await FileModel.findOne({ shortId });

    if (file) {
      res.status(200).json({
        message: "Fetched file successfully",
        data: file,
      });
    } else {
      res.status(404).json({
        message: "File not found",
      });
    }
  } catch (error) {
    res.status(501).json({
      message: "Failed to fetch file",
      error,
    });
  }
}

async function downloadFile(req, res) {
  try {
    const fileDoc = await FileModel.findOne({
      shortId: req.params.shortId,
    });

    if (fileDoc) {
      // const file = `${__dirname}/uploads/${fileDoc.filename}`;
      const file = path.join(
        __dirname,
        "..",
        "..",
        "uploads",
        fileDoc.filename
      );
      res.download(file); // Send the file to the user
    } else {
      res.status(404).json({
        message: "File not found",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "An error occurred while downloading the file",
      error,
    });
  }
}

// setInterval(async () => {
//   const expiredFiles = await FileModel.find({ expireAt: { $lt: new Date() } });
//   for (const file of expiredFiles) {
//     fs.unlink(file.path, err => {
//       if (err) console.error(`Failed to delete file ${file.path}:`, err);
//     });
//   }
// }, 3600000); // Run every hour

async function deleteFile(req, res) {
  try {
    const fileDoc = await FileModel.findOne({
      shortId: req.params.shortId,
    });

    if (fileDoc) {
      const filePath = path.join(
        __dirname,
        "..",
        "..",
        "uploads",
        fileDoc.filename
      );

      // Delete the file from the filesystem
      fs.unlink(filePath, async (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            message: "An error occurred while deleting the file",
            error: err.message,
          });
        }

        // Delete the file information from the database
        try {
          await FileModel.deleteOne({ shortId: req.params.shortId });
          res.json({ message: "File successfully deleted" });
        } catch (err) {
          console.error(err);
          return res.status(500).json({
            message: "An error occurred while deleting the file record",
            error: err.message,
          });
        }
      });
    } else {
      res.status(404).json({ message: "File not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "An error occurred while deleting the file",
      error: error.message,
    });
  }
}

module.exports = {
  uploadFile,
  upload,
  getAllFiles,
  getFileByShortId,
  downloadFile,
  deleteFile,
};
