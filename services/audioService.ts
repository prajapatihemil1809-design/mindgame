
// A lightweight sound synthesizer using Web Audio API
// No external files required.

let audioCtx: AudioContext | null = null;
let isMuted = false;

const initAudio = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
};

export const audioService = {
  init: () => {
    initAudio();
  },

  setMuted: (muted: boolean) => {
    isMuted = muted;
  },

  // UI Button Click (Short, crisp)
  playClick: () => {
    if (isMuted || !audioCtx) return;
    initAudio();
    
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.05);
    
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.05);
  },

  // Object Interaction (Cartoon "Bloop")
  playPop: () => {
    if (isMuted || !audioCtx) return;
    initAudio();

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(300, audioCtx.currentTime);
    osc.frequency.linearRampToValueAtTime(600, audioCtx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.1);
  },

  // Win Level (Happy Major Arpeggio)
  playWin: () => {
    if (isMuted || !audioCtx) return;
    initAudio();

    const now = audioCtx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    
    notes.forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = 'sine';
      osc.frequency.value = freq;
      
      const startTime = now + i * 0.1;
      
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.1, startTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.5);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.start(startTime);
      osc.stop(startTime + 0.5);
    });
  },

  // Wrong Action / Failure (Low buzz)
  playWrong: () => {
    if (isMuted || !audioCtx) return;
    initAudio();

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, audioCtx.currentTime);
    osc.frequency.linearRampToValueAtTime(100, audioCtx.currentTime + 0.2);

    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.2);
  },
  
  // Transition / Reset (Whoosh noise)
  playWhoosh: () => {
      if (isMuted || !audioCtx) return;
      initAudio();
      
      const bufferSize = audioCtx.sampleRate * 0.3; // 0.3 seconds
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      
      const noise = audioCtx.createBufferSource();
      noise.buffer = buffer;
      
      const filter = audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1000, audioCtx.currentTime);
      filter.frequency.linearRampToValueAtTime(100, audioCtx.currentTime + 0.3);
      
      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
      
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);
      
      noise.start();
  }
};
