# EasyUploader (Backend)

EasyUploader, a simple and efficient file upload and short link generation platform. Built with the MERN stack, it handles file uploads, stores files on the server, generates unique short links, and manages file information in a MongoDB database.

https://easyuploader.netlify.app/
## Features

- **File Upload Handling:** Utilizes Multer to handle file uploading.
- **Short Link Generation:** Generates unique short links for each file using Shortid.
- **File Storage:** Stores the uploaded files on the server.
- **Database Integration:** Manages the short links and corresponding file information in a MongoDB database.

## Technologies Used

- Node.js (Server Environment)
- Express.js (Web Framework)
- MongoDB (Database)
- Multer (File Upload Handling)
- Shortid (Short Link Generation)

## Installation

1. Clone this repository: `git clone https://github.com/your-username/easyuploader-backend.git`

2. Navigate to the project directory: `cd easyuploader-backend`

3. Install the dependencies: `npm install`

4. Start the development server:`npm start`

5. The server will be running at `http://localhost:PORT`, where `PORT` is the port number specified in your configuration.

## Configuration

Make sure to set up your environment variables in a `.env` file. Here's an example:

`DB_LINK= <your-database-uri>
PORT= <your-port-number>`

