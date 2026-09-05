const api = window.api || (async (path, options = {}) => {
	const response = await fetch(`/api${path}`, { credentials: 'include', headers: { 'Content-Type': 'application/json' }, ...options });
	const payload = await response.json();
	if (!response.ok) throw new Error(payload.error || 'The server could not save this game.');
	return payload;
});
import { CameraController } from './camera.js';
import { HandTracker } from './handTracking.js';
import { recognizeGesture } from './gestureRecognition.js';
import { PuzzleEngine } from './puzzleEngine.js';
import { calculateScore } from './score.js';
const video=document.querySelector('#camera'), cameraButton=document.querySelector('#camera-button'), captureButton=document.querySelector('#capture-button'), overlay=document.querySelector('#landmarks'), board=document.querySelector('#puzzle'), gestureLabel=document.querySelector('#gesture'), handStatus=document.querySelector('#hand-status'), errorLabel=document.querySelector('#game-error');
const config=JSON.parse(sessionStorage.getItem('puzzleConfig')||'{"difficulty":"medium","puzzleSize":"3","gameMode":"classic"}');
const image=new Image();
let engine,started=Date.now(),history=[],pinching=false,paused=false,completed=false,lastPointer={x:0,y:0};
function capturePhoto(){if(!video.videoWidth)return;const photo=document.createElement('canvas');photo.width=video.videoWidth;photo.height=video.videoHeight;const context=photo.getContext('2d');context.translate(photo.width,0);context.scale(-1,1);context.drawImage(video,0,0);const photoData=photo.toDataURL('image/jpeg',.92);sessionStorage.setItem('puzzleImage',photoData);image.src=photoData;}
image.onload=()=>{engine=new PuzzleEngine(board,image,Number(config.puzzleSize));started=Date.now();errorLabel.textContent='Your photo is ready. Solve the puzzle with your hand.';gestureLabel.textContent='READY';}; image.onerror=()=>errorLabel.textContent='Your camera photo could not be used. Please try again.';
const tracker=new HandTracker(video,overlay,(landmarks)=>{handStatus.textContent=landmarks?'Hand detected':'No hand detected';if(!landmarks){if(pinching&&engine){pinching=false;engine.releaseSelected(lastPointer.x,lastPointer.y);if(engine.solved())finish()}return}if(!engine)return;const current=recognizeGesture(landmarks,history);history=[...history.slice(-5),{x:landmarks[9].x}];gestureLabel.textContent=current.name;if(completed||paused)return;const x=(1-current.x)*board.width,y=current.y*board.height;lastPointer={x,y};if(current.name==='PINCH'){if(!pinching){pinching=Boolean(engine.select(x,y))}if(pinching)engine.dragSelected(x,y)}else if(pinching){pinching=false;engine.releaseSelected(x,y);if(engine.solved())finish()}if(current.name.startsWith('SWIPE')){}},(message)=>errorLabel.textContent=message);
const camera=new CameraController(video,cameraButton,(feed)=>tracker.process(feed),(message)=>errorLabel.textContent=message,(running)=>{captureButton.disabled=!running;handStatus.textContent=running?'Camera ready. Take your photo.':'Start the camera to take your photo';});
captureButton.addEventListener('click',capturePhoto);
setInterval(()=>{if(!completed&&!paused){const seconds=Math.floor((Date.now()-started)/1000);document.querySelector('#time').textContent=`${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`}if(engine){document.querySelector('#moves').textContent=engine.moves;document.querySelector('#mistakes').textContent=engine.mistakes;document.querySelector('#accuracy').textContent=`${Math.max(0,Math.round(100-engine.mistakes/Math.max(1,engine.moves)*100))}%`}},500);
async function finish(){completed=true;const completionTime=Math.floor((Date.now()-started)/1000),accuracy=Math.max(0,100-engine.mistakes/Math.max(1,engine.moves)*100),score=calculateScore({difficulty:config.difficulty,completionTime,moves:engine.moves,mistakes:engine.mistakes,accuracy});try{await api('/games',{method:'POST',body:JSON.stringify({difficulty:config.difficulty,puzzleSize:Number(config.puzzleSize),gameMode:config.gameMode,score,completionTime,moves:engine.moves,mistakes:engine.mistakes,accuracy})});sessionStorage.setItem('lastResult',JSON.stringify({score,completionTime,moves:engine.moves,mistakes:engine.mistakes,accuracy,difficulty:config.difficulty}));location.href='/results.html'}catch(error){errorLabel.textContent=error.message}}
window.addEventListener('beforeunload',()=>camera.stop());
