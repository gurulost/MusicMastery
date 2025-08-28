// Audio synthesis using Web Audio API
import { normalizeNote } from './musicTheory';

class AudioEngine {
  private audioContext: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private isInitialized = false;
  private currentScaleTimeouts: NodeJS.Timeout[] = []; // Track active scale timeouts

  constructor() {
    // Don't initialize audio immediately - wait for user interaction
  }

  private async ensureAudioContext(): Promise<boolean> {
    // If already initialized and ready, just check if resumed
    if (this.audioContext && this.gainNode && this.isInitialized) {
      if (this.audioContext.state === 'suspended') {
        try {
          console.log('Resuming suspended audio context...');
          await this.audioContext.resume();
          console.log('Audio context resumed, state:', this.audioContext.state);
        } catch (error) {
          console.warn('Failed to resume audio context:', error);
          return false;
        }
      }
      return this.audioContext.state === 'running';
    }

    // Initialize audio context for the first time
    try {
      console.log('Initializing new audio context...');
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.gainNode = this.audioContext.createGain();
      this.gainNode.connect(this.audioContext.destination);
      
      // Set higher master volume for better audibility
      this.gainNode.gain.setValueAtTime(0.7, this.audioContext.currentTime);
      this.isInitialized = true;

      // Try to resume if suspended (handles user interaction requirement)
      if (this.audioContext.state === 'suspended') {
        console.log('Audio context created but suspended, resuming...');
        await this.audioContext.resume();
      }
      
      console.log('Audio context initialized, state:', this.audioContext.state);
      return this.audioContext.state === 'running';
    } catch (error) {
      console.warn('Audio not supported:', error);
      return false;
    }
  }

  // Public method to initialize audio on user interaction
  async initializeAudio(): Promise<boolean> {
    return await this.ensureAudioContext();
  }

  private getNoteFrequency(note: string, octave: number = 4): number {
    // Enharmonic mapping for audio engine
    const enharmonicMap: { [key: string]: string } = {
      'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#'
    };
    
    // Normalize flat notes to sharps
    const canonicalNote = enharmonicMap[note] || note;
    
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
    
    const baseFrequency = noteMap[canonicalNote] || 440;
    // Calculate frequency for the specific octave (octave 4 is middle C)
    const octaveMultiplier = Math.pow(2, octave - 4);
    return baseFrequency * octaveMultiplier;
  }

  async playNote(note: string, duration: number = 0.5, octave: number = 4): Promise<void> {
    // Ensure audio context is ready
    const isReady = await this.ensureAudioContext();
    if (!isReady || !this.audioContext || !this.gainNode) {
      console.warn('Audio context not ready, state:', this.audioContext?.state);
      return;
    }

    try {
      // Create multiple oscillators for a richer, more piano-like sound
      const fundamentalFreq = this.getNoteFrequency(note, octave);
      const now = this.audioContext.currentTime;
      
      // Main fundamental oscillator (sawtooth for harmonic content)
      const fundamental = this.audioContext.createOscillator();
      const fundamentalGain = this.audioContext.createGain();
      fundamental.connect(fundamentalGain);
      fundamentalGain.connect(this.gainNode);
      fundamental.type = 'sawtooth';
      fundamental.frequency.setValueAtTime(fundamentalFreq, now);
      
      // Second harmonic (octave higher, quieter)
      const harmonic2 = this.audioContext.createOscillator();
      const harmonic2Gain = this.audioContext.createGain();
      harmonic2.connect(harmonic2Gain);
      harmonic2Gain.connect(this.gainNode);
      harmonic2.type = 'sawtooth';
      harmonic2.frequency.setValueAtTime(fundamentalFreq * 2, now);
      
      // Third harmonic (fifth higher, even quieter)
      const harmonic3 = this.audioContext.createOscillator();
      const harmonic3Gain = this.audioContext.createGain();
      harmonic3.connect(harmonic3Gain);
      harmonic3Gain.connect(this.gainNode);
      harmonic3.type = 'sine';
      harmonic3.frequency.setValueAtTime(fundamentalFreq * 3, now);

      // Low-pass filter to soften the harsh sawtooth edges
      const filter = this.audioContext.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(fundamentalFreq * 4, now); // Cutoff at 4th harmonic
      filter.Q.setValueAtTime(1, now);
      
      // Connect through filter
      fundamentalGain.disconnect();
      harmonic2Gain.disconnect();
      fundamentalGain.connect(filter);
      harmonic2Gain.connect(filter);
      filter.connect(this.gainNode);

      // Piano-like envelope with sharp attack and exponential decay
      const attackTime = 0.005;  // Very quick attack like piano hammer
      const decayTime = 0.1;     // Quick initial decay
      const sustainLevel = 0.15; // Lower sustain level
      const releaseTime = duration - decayTime;

      // Fundamental frequency envelope (strongest)
      fundamentalGain.gain.setValueAtTime(0, now);
      fundamentalGain.gain.linearRampToValueAtTime(0.2, now + attackTime);
      fundamentalGain.gain.exponentialRampToValueAtTime(sustainLevel, now + decayTime);
      fundamentalGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      // Second harmonic envelope (medium strength)
      harmonic2Gain.gain.setValueAtTime(0, now);
      harmonic2Gain.gain.linearRampToValueAtTime(0.1, now + attackTime);
      harmonic2Gain.gain.exponentialRampToValueAtTime(sustainLevel * 0.6, now + decayTime);
      harmonic2Gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      // Third harmonic envelope (subtle)
      harmonic3Gain.gain.setValueAtTime(0, now);
      harmonic3Gain.gain.linearRampToValueAtTime(0.05, now + attackTime);
      harmonic3Gain.gain.exponentialRampToValueAtTime(sustainLevel * 0.3, now + decayTime);
      harmonic3Gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      // Start all oscillators
      fundamental.start(now);
      harmonic2.start(now);
      harmonic3.start(now);
      
      // Stop all oscillators
      fundamental.stop(now + duration);
      harmonic2.stop(now + duration);
      harmonic3.stop(now + duration);
      
      console.log(`Playing piano-like note ${note}${octave} at ${fundamentalFreq.toFixed(2)}Hz`);
    } catch (error) {
      console.warn('Failed to play note:', error);
    }
  }

  // Play an interval with correct octave handling
  async playInterval(startNote: string, targetNote: string, intervalDirection: 'up' | 'down' = 'up', baseOctave: number = 4, playStyle: 'melodic' | 'harmonic' | 'both' = 'both'): Promise<void> {
    // Ensure audio context is ready
    const isReady = await this.ensureAudioContext();
    if (!isReady || !this.audioContext || !this.gainNode) {
      console.warn('Audio context not ready');
      return;
    }

    // Import getNoteIndex here to avoid circular dependency
    const { getNoteIndex } = await import('./musicTheory');
    
    // Calculate correct octaves for the interval
    const startIndex = getNoteIndex(startNote as any);
    const targetIndex = getNoteIndex(targetNote as any);
    
    let startOctave = baseOctave;
    let targetOctave = baseOctave;
    
    if (intervalDirection === 'up') {
      // If target note index is lower than start note index, it's in the next octave
      if (targetIndex < startIndex) {
        targetOctave = baseOctave + 1;
      }
    } else {
      // If going down and target note index is higher than start, it's in the previous octave
      if (targetIndex > startIndex) {
        targetOctave = baseOctave - 1;
      }
    }

    try {
      if (playStyle === 'melodic' || playStyle === 'both') {
        // Play melodically (one after the other)
        await this.playNote(startNote, 0.8, startOctave);
        setTimeout(async () => {
          try {
            await this.playNote(targetNote, 0.8, targetOctave);
            
            // If 'both', also play harmonically after melodic
            if (playStyle === 'both') {
              setTimeout(async () => {
                try {
                  await this.playNote(startNote, 0.6, startOctave);
                  await this.playNote(targetNote, 0.6, targetOctave);
                } catch (error) {
                  console.warn('Harmonic interval playback failed:', error);
                }
              }, 800);
            }
          } catch (error) {
            console.warn('Target note playback failed:', error);
          }
        }, 600);
      } else if (playStyle === 'harmonic') {
        // Play harmonically (both notes together)
        await this.playNote(startNote, 0.8, startOctave);
        await this.playNote(targetNote, 0.8, targetOctave);
      }
    } catch (error) {
      console.warn('Interval playback failed:', error);
    }
  }

  async playScale(notes: string[], tempo: number = 120): Promise<void> {
    // Cancel any currently playing scale to prevent overlap
    this.cancelCurrentScale();
    
    // Ensure audio context is ready
    const isReady = await this.ensureAudioContext();
    if (!isReady || !this.audioContext || !this.gainNode) {
      console.warn('Audio context not ready');
      return;
    }

    console.log(`Playing scale with ${notes.length} notes at tempo ${tempo}:`, notes);

    const noteDuration = 60 / tempo; // quarter note duration in seconds
    
    // Schedule scale playback with cancellation tracking
    for (let i = 0; i < notes.length; i++) {
      const timeout = setTimeout(() => {
        const normalizedNote = normalizeNote(notes[i] as any);
        console.log(`Playing note ${i + 1}/${notes.length}: ${notes[i]} -> ${normalizedNote}`);
        this.playNote(normalizedNote, noteDuration * 0.8);
      }, i * noteDuration * 1000);
      
      this.currentScaleTimeouts.push(timeout);
    }
  }

  // Cancel currently playing scale to prevent overlapping audio
  private cancelCurrentScale(): void {
    this.currentScaleTimeouts.forEach(timeout => clearTimeout(timeout));
    this.currentScaleTimeouts = [];
  }
}

export const audioEngine = new AudioEngine();
