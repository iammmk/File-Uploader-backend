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
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: async function (req, file, cb) {
    // Mimetypes for allowed file types
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "application/pdf",
      "text/plain",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true); // Accept the file
    } else {
      const error = new multer.MulterError("INVALID_FILE_TYPE");
      cb(error, false); // Reject the file
    }
  },
});

const multerErrorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "INVALID_FILE_TYPE") {
      return res.status(400).send("Invalid file type");
    }
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).send("File size too large");
    }
  } else if (err) {
    return res.status(500).send(err + "Upload failed due to unknown error");
  }
  next();
};

async function uploadFile(req, res) {
  try {
    const shortId = shortid.generate();
    const expireAt = new Date();
    expireAt.setDate(expireAt.getDate() + 1);

    const fileData = {
      filename: req.file.filename,
      fileType: req.file.mimetype,
      size: req.file.size,
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

// Function to delete expired files
async function deleteExpiredFiles() {
  // Find files that are older than 1 day
  const oneDayAgo = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
  const expiredFiles = await FileModel.find({
    uploadedOn: { $lt: oneDayAgo },
  });

  for (const file of expiredFiles) {
    const filePath = path.join(__dirname, "..", "..", file.path);

    try {
      // Delete the file from the filesystem
      fs.unlinkSync(filePath);
      console.log(`Deleted expired file ${filePath}`);

      // Delete the corresponding record from the database
      await FileModel.findByIdAndDelete(file._id);
    } catch (err) {
      console.error(`Failed to delete file ${filePath}:`, err);
    }
  }
}

// Schedule the cleanup function to run every hour
setInterval(deleteExpiredFiles, 3600000);

module.exports = {
  uploadFile,
  upload,
  multerErrorHandler,
  getAllFiles,
  getFileByShortId,
  downloadFile,
  deleteFile,
};
