// Audio synthesis using Web Audio API
class AudioEngine {
  private audioContext: AudioContext | null = null;
  private gainNode: GainNode | null = null;

  constructor() {
    this.initAudio();
  }

  private async initAudio() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.gainNode = this.audioContext.createGain();
      this.gainNode.connect(this.audioContext.destination);
      this.gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    } catch (error) {
      console.warn('Audio not supported:', error);
    }
  }

  private getNoteFrequency(note: string, octave: number = 4): number {
    const noteMap: { [key: string]: number } = {
      'C': 261.63,
      'C#': 277.18,
      'D': 293.66,
      'D#': 311.13,
      'E': 329.63,
      'F': 349.23,
      'F#': 369.99,
      'G': 392.00,
      'G#': 415.30,
      'A': 440.00,
      'A#': 466.16,
      'B': 493.88,
    };
    
    const baseFrequency = noteMap[note] || 440;
    // Calculate frequency for the specific octave (octave 4 is middle C)
    const octaveMultiplier = Math.pow(2, octave - 4);
    return baseFrequency * octaveMultiplier;
  }

  async playNote(note: string, duration: number = 0.5, octave: number = 4): Promise<void> {
    if (!this.audioContext || !this.gainNode) {
      await this.initAudio();
    }

    if (!this.audioContext || !this.gainNode) return;

    // Resume audio context if suspended (required for modern browsers)
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    const oscillator = this.audioContext.createOscillator();
    const noteGain = this.audioContext.createGain();

    oscillator.connect(noteGain);
    noteGain.connect(this.gainNode);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(
      this.getNoteFrequency(note, octave),
      this.audioContext.currentTime
    );

    // Envelope for smoother sound
    noteGain.gain.setValueAtTime(0, this.audioContext.currentTime);
    noteGain.gain.linearRampToValueAtTime(0.1, this.audioContext.currentTime + 0.01);
    noteGain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  async playScale(notes: string[], tempo: number = 120): Promise<void> {
    const noteDuration = 60 / tempo; // quarter note duration in seconds
    
    for (let i = 0; i < notes.length; i++) {
      setTimeout(() => {
        this.playNote(notes[i], noteDuration * 0.8);
      }, i * noteDuration * 1000);
    }
  }
}

export const audioEngine = new AudioEngine();
