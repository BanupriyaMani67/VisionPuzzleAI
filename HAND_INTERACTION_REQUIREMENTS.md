# VisionPuzzle AI – Hand Interaction Requirements

## Purpose

VisionPuzzle AI shall provide a real hand-controlled puzzle experience in which the user solves a puzzle made from their own photo through a webcam. The webcam hand must directly manipulate the actual puzzle pieces. Hand detection, gesture recognition, and cursor movement alone are insufficient.

The primary interaction requirement is:

> **The user must solve the puzzle using their real hand through the webcam.**

The system must support the complete interaction chain:

`REAL HAND → INDEX FINGER → PINCH → GRAB ACTUAL PIECE → MOVE HAND → MOVE ACTUAL PIECE → RELEASE → DROP OR SNAP`

---

## 1. User Photo Puzzle

1. The user shall be able to upload their own photo.
2. The uploaded photo shall become the actual puzzle image.
3. The system shall not replace the uploaded photo with a random, sample, stock, or placeholder image.
4. The system shall support puzzle grids of:
   - 3 x 3
   - 4 x 4
   - 5 x 5
5. The photo shall be divided into real, independently movable puzzle pieces.
6. Every piece shall retain the correct source region from the uploaded photo.
7. The pieces shall be shuffled before the game begins.
8. The original photo shall remain available as the source image for the entire puzzle session.
9. The puzzle shall not be considered ready until the user's photo has been loaded successfully.

---

## 2. Real Webcam Hand Tracking

1. The system shall use the user's real webcam.
2. The frontend shall request camera permission using `getUserMedia()`.
3. The system shall use MediaPipe Hands for real-time hand landmark detection.
4. The application shall show a live webcam preview.
5. The interface shall indicate whether a hand is currently detected.
6. The interface shall indicate whether tracking is active or inactive.
7. The system shall use live camera frames and real landmark coordinates.
8. The system shall not use fake or simulated hand detection.
9. The system shall not use prerecorded hand movements.
10. If permission is denied or the camera is unavailable, the system shall show a clear error and allow the user to retry.
11. Hand-tracking processing shall be throttled or synchronized so that frames do not accumulate and freeze the page.

---

## 3. Index Finger Interaction

1. The system shall track the user's real index fingertip using the MediaPipe index fingertip landmark.
2. The interface shall display a virtual fingertip cursor or marker.
3. The fingertip cursor shall follow the user's real index finger in real time.
4. Moving the hand left shall move the cursor left.
5. Moving the hand right shall move the cursor right.
6. Moving the hand up shall move the cursor up.
7. Moving the hand down shall move the cursor down.
8. The cursor shall use the index fingertip as its position source, not the wrist or a simulated position.
9. The system shall use correct coordinate mapping between the mirrored webcam and the puzzle area.
10. Cursor movement shall be smooth and accurate enough for selecting individual pieces.
11. The cursor shall remain visually aligned with the user's fingertip after responsive layout changes.

---

## 4. PINCH = GRAB Puzzle Piece

Pinching is the primary grab interaction.

1. The system shall detect when the user's thumb and index finger come close together.
2. Thumb-to-index proximity shall be calculated from real MediaPipe landmarks.
3. The close-thumb-and-index state shall be identified as `PINCH`.
4. When the user pinches over a puzzle piece, that actual piece shall be selected.
5. The selected piece shall become attached to the user's fingertip or hand position.
6. The selected piece shall be visually distinguishable while grabbed.
7. A pinch over empty puzzle space shall not select an unrelated piece.
8. The system shall not enter a grabbed state when no puzzle piece was selected.
9. The interaction shall feel like physical grabbing:

   `MY FINGERS → GRAB PIECE → MOVE MY HAND → PIECE MOVES WITH MY HAND`

10. Pinch detection shall remain active while the user moves their hand so that movement is not misclassified as a swipe.

---

## 5. Drag and Drop

### 5.1 Dragging

While the user keeps the pinch gesture active:

1. Moving the hand shall move the selected puzzle piece.
2. The actual puzzle piece shall follow the fingertip smoothly.
3. The piece shall move continuously with the hand rather than moving only after a gesture ends.
4. The system shall not move only the cursor while leaving the selected piece stationary.
5. The piece shall remain within the puzzle boundary or be constrained to the valid puzzle area.
6. The piece shall not jump unexpectedly when the pinch begins.
7. The piece shall preserve its current rotation while being dragged.

### 5.2 Release

When the user releases the pinch:

1. The system shall release the actual puzzle piece.
2. The piece shall remain at the dropped position until placement is resolved.
3. The system shall determine the target puzzle cell from the drop coordinates.
4. If the piece is in the correct location, it shall snap into the correct position.
5. If the piece is in the wrong location, the user shall be able to pick it up again.
6. The system shall count a completed placement as a move.
7. The system shall count mistakes according to the game's scoring rules.
8. If the hand leaves the camera while a piece is grabbed, the system shall release the piece at its last valid hand position.
9. A dropped piece shall not be automatically solved or moved without user action.

---

## 6. Every Puzzle Piece Must Be Hand Controlled

The user shall be able to:

1. Select any puzzle piece.
2. Grab any puzzle piece with a pinch.
3. Move the piece using their real hand.
4. Drop the piece anywhere inside the puzzle area.
5. Rearrange all pieces using hand interaction.
6. Complete the entire puzzle without requiring a mouse or keyboard.

Mouse interaction may exist only as an optional fallback or debugging feature. Hand interaction shall remain the main interaction method and the primary acceptance path.

---

## 7. Other Hand Gestures

### 7.1 TWO FINGERS

1. The system shall recognize the `TWO FINGERS` gesture using live hand landmarks.
2. If a puzzle piece is selected, `TWO FINGERS` shall rotate that piece by 90 degrees.
3. Holding the gesture shall not repeatedly rotate the piece every frame. Rotation shall be triggered in a controlled, user-understandable way.

### 7.2 OPEN PALM

1. The system shall recognize the `OPEN PALM` gesture.
2. `OPEN PALM` shall pause the game.
3. The timer shall stop while the game is paused.
4. The interface shall display `Game Paused`.
5. Puzzle movement shall not continue while paused.
6. The game shall provide a clear way to resume.

### 7.3 FIST

1. The system shall recognize the `FIST` gesture.
2. `FIST` shall request reset confirmation.
3. Reset shall not occur without confirmation.
4. After confirmation, the system shall reset and reshuffle the puzzle.
5. Reset shall preserve the user's uploaded photo.
6. Reset shall clear the appropriate move, mistake, timer, and completion state.

---

## 8. Camera and Coordinate Accuracy

The system shall implement accurate coordinate conversion across all interaction surfaces:

1. Camera mirroring shall be consistent between the live preview and the user's perceived movement.
2. MediaPipe normalized landmark coordinates shall be converted correctly.
3. Webcam coordinates shall map correctly to the displayed preview.
4. Preview coordinates shall map correctly to screen coordinates.
5. Screen coordinates shall map correctly to puzzle-canvas coordinates.
6. The mapping shall account for the preview's aspect ratio and `object-fit` behavior.
7. The mapping shall account for responsive desktop and mobile layouts.
8. Puzzle boundary detection shall prevent invalid placement outside the puzzle.
9. The piece shall not jump to an incorrect location when the user begins a pinch.
10. The cursor and selected piece shall use the same coordinate mapping.
11. The captured photo orientation shall match the preview and puzzle orientation.
12. The interaction shall remain usable at different viewport sizes.

---

## 9. Live Status

The game interface shall display the following live status information:

| Status | Required values |
|---|---|
| Hand Detected | `YES` / `NO` |
| Gesture | `PINCH` / `OPEN PALM` / `FIST` / `TWO FINGERS` / `NONE` |
| Action | `IDLE` / `GRABBING` / `DRAGGING` / `DROPPING` / `ROTATING` / `PAUSED` |
| Tracking | `ACTIVE` / `INACTIVE` |

The status shall update from the current real tracking state and shall not display fake success states.

---

## 10. Game Completion

The user shall complete the puzzle using their real hand.

After completion, the system shall:

1. Detect that every piece is in its correct position.
2. Stop the timer.
3. Calculate the score.
4. Calculate accuracy.
5. Show the number of moves.
6. Show the number of mistakes.
7. Show the completion time.
8. Save the result to the backend and database.
9. Display the results page.
10. Update game history.
11. Update the leaderboard.
12. Preserve the completed game's difficulty, puzzle size, game mode, score, time, moves, mistakes, and accuracy.

---

## 11. Technical Requirements

### 11.1 Frontend

The frontend shall use:

- HTML
- CSS
- Vanilla JavaScript
- MediaPipe Hands
- `getUserMedia()`
- Canvas or DOM-based puzzle pieces
- Real-time JavaScript interaction

The project shall not be converted to React, Angular, Vue, or another frontend framework.

### 11.2 Backend and Existing Features

The following existing technologies and features shall continue working:

- Node.js
- Express
- SQLite
- Authentication
- Dashboard
- Profile
- Game history
- Leaderboard
- Score storage

The hand interaction feature shall not break authentication, routing, game persistence, or existing dashboard functionality.

---

## 12. Important Rules

### 12.1 Prohibited Behavior

The system shall not:

- Fake hand detection.
- Simulate hand movement.
- Automatically move puzzle pieces.
- Automatically solve the puzzle.
- Use prerecorded hand movements.
- Make the cursor the only hand interaction.
- Replace the user's uploaded photo with a sample image.
- Treat a gesture label as a substitute for physical piece interaction.
- Complete a placement without a real user drag and release.

### 12.2 Mandatory Behavior

The system must:

- Detect the real hand.
- Track the real index finger.
- Display the real fingertip position.
- Detect a real thumb-and-index pinch.
- Grab the actual puzzle piece.
- Move the actual puzzle piece with the user's hand.
- Release the actual puzzle piece.
- Allow incorrect pieces to be picked up again.
- Allow the user to solve the entire puzzle using only their hand.
- Use the user's uploaded photo as the puzzle image.

---

## 13. Final Acceptance Test

The feature is complete only if the following exact flow works with a real webcam and a real user hand:

```text
UPLOAD MY PHOTO
↓
PHOTO BECOMES PUZZLE
↓
START GAME
↓
WEBCAM OPENS
↓
REAL HAND DETECTED
↓
INDEX FINGER MOVES CURSOR
↓
PINCH OVER PUZZLE PIECE
↓
ACTUAL PIECE IS GRABBED
↓
MOVE MY HAND
↓
ACTUAL PIECE MOVES WITH MY HAND
↓
RELEASE PINCH
↓
PIECE DROPS
↓
CORRECT POSITION = SNAP
↓
REPEAT FOR ALL PIECES
↓
PUZZLE COMPLETED USING REAL HAND
↓
SCORE + TIME + MOVES + ACCURACY SAVED
```

A successful acceptance test must confirm all of the following:

- The uploaded photo is the image used by the puzzle.
- The webcam shows the user's real hand.
- The fingertip cursor follows the real index finger.
- Pinching selects the actual piece under the fingertip.
- The selected piece follows hand movement continuously.
- Releasing the pinch drops the actual piece.
- Correct pieces snap into place.
- Incorrect pieces remain available for another hand-controlled attempt.
- Every piece can be manipulated without a mouse.
- The completed game saves its result and displays the results page.
