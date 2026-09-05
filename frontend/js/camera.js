export class CameraController {
  constructor(video, button, onFrame, onError, onState) { this.video = video; this.button = button; this.onFrame = onFrame; this.onError = onError; this.onState = onState; this.stream = null; button.addEventListener('click', () => this.stream ? this.stop() : this.start()); }
  async start() { try { this.stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false }); this.video.srcObject = this.stream; await this.video.play(); this.button.textContent = 'Stop camera'; this.running = true; this.onState?.(true); this.loop(); } catch (error) { this.onError(error.name === 'NotAllowedError' ? 'Camera permission was denied. Allow access in browser settings and retry.' : 'Camera is unavailable on this device.'); } }
  stop() { this.running = false; this.stream?.getTracks().forEach((track) => track.stop()); this.stream = null; this.video.srcObject = null; this.button.textContent = 'Start camera'; this.onState?.(false); }
  loop() { if (!this.running) return; this.onFrame(this.video); requestAnimationFrame(() => this.loop()); }
}
