# Smart Notes

A modern, cross-platform note-taking application built with React Native and Expo, featuring offline support, AI-powered summarization, and a clean, intuitive interface.
Ps: made it for case study so use it for educational purposes!!

## Features

### Core Features
- 📝 Create, edit, and delete notes
- 🔍 Search through your notes
- 📱 Offline support
- 🤖 AI-powered note summarization

### Technical Features
- Offline-first architecture
- Real-time network status detection
- Type-safe development with TypeScript
- Modern React Native with Expo
- RESTful API backend

## Project Structure

```
smart-notes/
├── client/                 # React Native client application
│   ├── app/               # Expo Router pages
│   │   ├── (auth)/       # Authentication routes
│   │   ├── notes/        # Note management routes
│   ├── components/       # Reusable UI components
│   ├── utils/            # Utility functions
└── server/               # Backend server
    ├── controllers/      # Route controllers
    ├── models/           # Database models
    ├── routes/           # API routes
    └── utils/            # Server utilities
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm
- MongoDB

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/smart-notes.git
cd smart-notes
```

2. Copy .env
```bash
cd server
cp .env.example .env
# Make sure you have updated the secret keys!!!
```

3. Check API url in client/utils/api.ts!
The api url may include your LAN ip!!, it depends on your environment but you can change localhost to your LAN ip.
- http://localhost:3000/api # default =>  http://192.168.x.x:3000/api # use it if it does not work 

4. Install dependencies:
```bash
# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

5. Set up environment variables:
```bash
# Create .env file in server directory
cp .env.example .env
```

6. Start the development servers:
```bash
# Start the backend server
cd server
npm run dev

# Start the Expo development server
cd ../client
npm start
```

## API Endpoints

### Notes API
- `POST /api/auth/login` - Login authentication
- `POST /api/auth/signup` - Create user
- `GET /api/notes` - Get all notes
- `GET /api/notes/:id` - Get a specific note
- `POST /api/notes` - Create a new note
- `PUT /api/notes/:id` - Update a note
- `DELETE /api/notes/:id` - Delete a note
- `POST /api/notes/summarize` - Generate note summary
- `GET /api-docs` - api docs with swagger-ui for testing and api documentation!!

## Offline Support

1. Notes are stored locally when offline
2. Changes are queued for syncing
3. Automatic sync when connection is restored

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Expo team for the amazing framework
- React Native community
- OpenAI for the text summarization API