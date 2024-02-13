# News Website Project

## Overview
The News Website project is a web application designed to publish and manage news articles. It enables administrators to create, edit, and delete news posts, manage categories, and track views. Users can browse the latest news, search for specific topics, and access detailed post information.

## Technologies Used
- **Node.js**: A server-side platform for running JavaScript.
- **Express.js**: A web application framework for Node.js, used for routing and API creation.
- **MongoDB**: A NoSQL database used to store posts, categories, and admin user information.
- **EJS**: A templating engine used to generate dynamic HTML on the server-side.
- **express-fileupload**: An Express.js middleware for handling file uploads.
- **express-session**: An Express.js middleware for managing user sessions.

## Features
- **News Viewing**: Users can view the most recent news articles on the homepage.
- **Search**: A search feature allows users to find news articles by keywords.
- **Administration**: A password-protected admin interface for creating, editing, and deleting news articles, as well as managing categories.
- **Image Uploads**: Administrators can upload images to accompany news posts.
- **View Count Tracking**: A system to count and display the number of views for each news article.

## Installation
To install and run the project locally, follow these steps:

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-username/your-repository.git
   cd your-repository
2. **Install the dependencies:**

   ```bash
   npm install
3. **Configure your MongoDB connection string in app.js:**

   ```bash
   const uri = 'your-mongodb-connection-string';
4. **Start the server:**

   ```bash
   npm start

The website will be accessible at `http://localhost:7001`.

## Contributing
To contribute to the project, please follow these steps:

1. Fork the repository.
2. Create a feature branch: `git checkout -b new-feature`.
3. Make your changes and commit them: `git commit -am 'Add some feature'`.
4. Push to the original branch: `git push origin new-feature`.
5. Create a pull request.

All contributions are welcome!

