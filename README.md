# 🧩 VisionPuzzle AI

### Play with your hands. Move the puzzle with your gestures.

🌐 **Live Website:** https://visionpuzzleai-3.onrender.com

VisionPuzzle AI is an AI-powered interactive puzzle game that combines **computer vision, hand gesture recognition, and web technologies**. Users can upload or capture their own photo, turn it into a puzzle, and solve it using natural hand gestures.

## ✨ Features

- 🖼️ Upload your own photo or capture one using the webcam
- 🧩 Generate 3×3, 4×4 and 5×5 puzzles
- 🖐️ Real-time hand tracking using MediaPipe Hands
- 🤏 Pinch to grab and drag puzzle pieces
- 👆 Index finger controls the on-screen hand cursor
- ✌️ Two fingers to rotate a puzzle piece 90°
- 🖐️ Open palm to pause the game
- ✊ Fist to reset the puzzle
- 🎯 Real-time score, timer, moves, mistakes and accuracy
- 🏆 Achievements and leaderboard
- 👤 User registration, login and profile
- 📊 Game history and player dashboard
- 📱 Responsive and modern UI

## 🖐️ How Hand Interaction Works

The most important feature of VisionPuzzle AI is real hand-controlled gameplay.

**Webcam → MediaPipe → Hand Landmarks → Gesture Recognition → Puzzle Interaction**

1. The webcam captures the player's hand.
2. MediaPipe detects hand landmarks.
3. The index fingertip controls the on-screen cursor.
4. Pinch thumb + index finger to grab a real puzzle piece.
5. Move the hand while pinching to move the actual piece.
6. Release the pinch to drop/snap the piece.
7. Use two fingers to rotate.
8. Use an open palm to pause.
9. Use a fist to reset.

The player can solve the complete puzzle using their hand without touching the puzzle board.

## 🛠️ Technology Stack

### Frontend
- HTML5
- CSS3
- Vanilla JavaScript

### AI / Computer Vision
- MediaPipe Hands
- Web Camera API
- Hand landmark detection
- Gesture recognition

### Backend
- Node.js
- Express.js
- REST APIs

### Database
- SQLite
- better-sqlite3

### Authentication & Security
- bcryptjs
- JWT authentication
- Protected API routes
- Environment variables

### Deployment
- Render
- GitHub

## 📊 Game System

The game tracks:

- Score
- Time
- Moves
- Mistakes
- Accuracy
- Difficulty
- Puzzle size
- Completion status

Completed games are stored for authenticated users and used for history, statistics and leaderboard features.

## 🎮 Game Flow

```text
Landing Page
     ↓
Register / Login
     ↓
Dashboard
     ↓
Game Setup
     ↓
Upload / Capture Photo
     ↓
Generate Puzzle
     ↓
Start Camera
     ↓
MediaPipe Hand Tracking
     ↓
Hand Gesture Interaction
     ↓
Solve Puzzle
     ↓
Score & Results
     ↓
History / Leaderboard / Achievements
