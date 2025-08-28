import { Note, Scale, Interval, IntervalType, ScaleType, ScaleDefinition, IntervalDefinition, ExerciseData } from "@shared/schema";

export const NOTES: Note[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Enharmonic mapping: flats to sharps (canonical form)
const ENHARMONIC_MAP: { [key: string]: Note } = {
  'Db': 'C#',
  'Eb': 'D#', 
  'Gb': 'F#',
  'Ab': 'G#',
  'Bb': 'A#'
};

// Normalize any note (flat or sharp) to canonical sharp form
export function normalizeNote(note: Note): Note {
  // Type guard to prevent interval names from being passed as notes
  if (typeof note !== 'string' || note.includes(' ') || note.includes('th') || note.includes('nd') || note.includes('rd')) {
    console.error(`Invalid note passed to normalizeNote: ${note}. Expected a note like 'C', 'C#', 'Bb', etc.`);
    return 'C'; // fallback to prevent crashes
  }
  return ENHARMONIC_MAP[note as keyof typeof ENHARMONIC_MAP] || (note as Note);
}

export const MAJOR_SCALE_PATTERN = [2, 2, 1, 2, 2, 2, 1]; // whole and half steps
export const MINOR_SCALE_PATTERN = [2, 1, 2, 2, 1, 2, 2]; // natural minor scale

// Single source of truth: Structured scale definitions
export const SCALE_DEFINITIONS: ScaleDefinition[] = [
  // Major scales in circle of fifths order
  { tonic: 'C', type: 'major', accidentals: 0, order: 0 },
  { tonic: 'G', type: 'major', accidentals: 1, order: 1 },
  { tonic: 'D', type: 'major', accidentals: 2, order: 2 },
  { tonic: 'A', type: 'major', accidentals: 3, order: 3 },
  { tonic: 'E', type: 'major', accidentals: 4, order: 4 },
  { tonic: 'B', type: 'major', accidentals: 5, order: 5 },
  { tonic: 'F#', type: 'major', accidentals: 6, order: 6 },
  { tonic: 'F', type: 'major', accidentals: -1, order: 7 },
  { tonic: 'Bb', type: 'major', accidentals: -2, order: 8 },
  { tonic: 'Eb', type: 'major', accidentals: -3, order: 9 },
  { tonic: 'Ab', type: 'major', accidentals: -4, order: 10 },
  { tonic: 'Db', type: 'major', accidentals: -5, order: 11 },
  
  // Minor scales (relative to major scales)
  { tonic: 'A', type: 'minor', accidentals: 0, order: 0 },
  { tonic: 'E', type: 'minor', accidentals: 1, order: 1 },
  { tonic: 'B', type: 'minor', accidentals: 2, order: 2 },
  { tonic: 'F#', type: 'minor', accidentals: 3, order: 3 },
  { tonic: 'C#', type: 'minor', accidentals: 4, order: 4 },
  { tonic: 'G#', type: 'minor', accidentals: 5, order: 5 },
  { tonic: 'D#', type: 'minor', accidentals: 6, order: 6 },
  { tonic: 'D', type: 'minor', accidentals: -1, order: 7 },
  { tonic: 'G', type: 'minor', accidentals: -2, order: 8 },
  { tonic: 'C', type: 'minor', accidentals: -3, order: 9 },
  { tonic: 'F', type: 'minor', accidentals: -4, order: 10 },
  { tonic: 'Bb', type: 'minor', accidentals: -5, order: 11 },
];

// Single source of truth: Structured interval definitions
export const INTERVAL_DEFINITIONS: IntervalDefinition[] = [
  {
    name: 'Perfect Unison', semitones: 0, shortName: 'P1',
    explanation: 'The same note played simultaneously or in sequence. Distance: 0 semitones.',
    learningTip: 'This is the starting point - no distance at all. Both notes are identical.',
    difficulty: 'beginner'
  },
  {
    name: 'Minor 2nd', semitones: 1, shortName: 'm2',
    explanation: 'A half step up. Very dissonant and creates tension. Distance: 1 semitone.',
    learningTip: 'Move up just one key (including black keys). Sounds very close and tense.',
    difficulty: 'beginner'
  },
  {
    name: 'Major 2nd', semitones: 2, shortName: 'M2',
    explanation: 'A whole step up. Common in scales and melodies. Distance: 2 semitones.',
    learningTip: 'Skip one key between notes. This is like moving from C to D.',
    difficulty: 'beginner'
  },
  {
    name: 'Minor 3rd', semitones: 3, shortName: 'm3',
    explanation: 'The foundation of minor chords. Sounds sad or melancholy. Distance: 3 semitones.',
    learningTip: 'Count 3 half-steps up. This interval gives minor chords their sad sound.',
    difficulty: 'beginner'
  },
  {
    name: 'Major 3rd', semitones: 4, shortName: 'M3',
    explanation: 'The foundation of major chords. Sounds bright and happy. Distance: 4 semitones.',
    learningTip: 'Count 4 half-steps up. This interval makes major chords sound happy.',
    difficulty: 'beginner'
  },
  {
    name: 'Perfect 4th', semitones: 5, shortName: 'P4',
    explanation: 'Very stable and consonant. Common in folk music. Distance: 5 semitones.',
    learningTip: 'Think of "Here Comes the Bride" - the first two notes form a Perfect 4th.',
    difficulty: 'intermediate'
  },
  {
    name: 'Tritone', semitones: 6, shortName: 'TT',
    explanation: 'The "devil\'s interval." Very dissonant, halfway through the octave. Distance: 6 semitones.',
    learningTip: 'Exactly halfway to the octave. Historically avoided in church music for its tension.',
    difficulty: 'advanced'
  },
  {
    name: 'Perfect 5th', semitones: 7, shortName: 'P5',
    explanation: 'The most consonant interval after the octave. Foundation of power chords. Distance: 7 semitones.',
    learningTip: 'Think of "Twinkle Twinkle Little Star" - the first two notes form a Perfect 5th.',
    difficulty: 'intermediate'
  },
  {
    name: 'Minor 6th', semitones: 8, shortName: 'm6',
    explanation: 'Somewhat melancholy, used in romantic ballads. Distance: 8 semitones.',
    learningTip: 'Has a bittersweet, longing quality. Common in love songs.',
    difficulty: 'intermediate'
  },
  {
    name: 'Major 6th', semitones: 9, shortName: 'M6',
    explanation: 'Bright and open sound, common in pop music. Distance: 9 semitones.',
    learningTip: 'Sounds warm and open. Think of the beginning of "My Way."',
    difficulty: 'intermediate'
  },
  {
    name: 'Minor 7th', semitones: 10, shortName: 'm7',
    explanation: 'Creates dominant 7th chords, adds tension that wants to resolve. Distance: 10 semitones.',
    learningTip: 'Common in jazz and blues. Creates tension that wants to resolve downward.',
    difficulty: 'advanced'
  },
  {
    name: 'Major 7th', semitones: 11, shortName: 'M7',
    explanation: 'Very dissonant, strongly wants to resolve to the octave. Distance: 11 semitones.',
    learningTip: 'Just one semitone below the octave. Very unstable and wants to resolve up.',
    difficulty: 'advanced'
  },
  {
    name: 'Perfect Octave', semitones: 12, shortName: 'P8',
    explanation: 'The same note in a higher register. Pure consonance. Distance: 12 semitones.',
    learningTip: 'The most consonant interval. Sounds like the same note, but higher.',
    difficulty: 'beginner'
  }
];

// Generated arrays from structured data (no more string parsing!)
export const MAJOR_SCALES: ScaleDefinition[] = SCALE_DEFINITIONS.filter(s => s.type === 'major');
export const MINOR_SCALES: ScaleDefinition[] = SCALE_DEFINITIONS.filter(s => s.type === 'minor');
export const INTERVALS: Interval[] = INTERVAL_DEFINITIONS.map(({ name, semitones, shortName }) => ({ name, semitones, shortName }));

// Utility functions with proper type safety
export function getNoteIndex(note: Note): number {
  const canonicalNote = normalizeNote(note);
  const index = NOTES.indexOf(canonicalNote);
  if (index === -1) {
    console.error(`Invalid note: ${note} (normalized: ${canonicalNote})`);
    return 0; // fallback to C to avoid crashes
  }
  return index;
}

export function getNote(index: number): Note {
  return NOTES[((index % 12) + 12) % 12];
}

export function buildScale(tonic: Note, pattern: number[]): Note[] {
  // Normalize the tonic note first
  const normalizedTonic = normalizeNote(tonic);
  const result: Note[] = [normalizedTonic];
  let currentIndex = getNoteIndex(normalizedTonic);
  
  for (let i = 0; i < pattern.length - 1; i++) {
    currentIndex += pattern[i];
    result.push(getNote(currentIndex));
  }
  
  return result;
}

// Circle of fifths key signature data
const KEY_SIGNATURES = {
  'C': { sharps: 0, flats: 0, accidentals: [] },
  'G': { sharps: 1, flats: 0, accidentals: ['F#'] },
  'D': { sharps: 2, flats: 0, accidentals: ['F#', 'C#'] },
  'A': { sharps: 3, flats: 0, accidentals: ['F#', 'C#', 'G#'] },
  'E': { sharps: 4, flats: 0, accidentals: ['F#', 'C#', 'G#', 'D#'] },
  'B': { sharps: 5, flats: 0, accidentals: ['F#', 'C#', 'G#', 'D#', 'A#'] },
  'F#': { sharps: 6, flats: 0, accidentals: ['F#', 'C#', 'G#', 'D#', 'A#', 'E#'] },
  'F': { sharps: 0, flats: 1, accidentals: ['Bb'] },
  'Bb': { sharps: 0, flats: 2, accidentals: ['Bb', 'Eb'] },
  'Eb': { sharps: 0, flats: 3, accidentals: ['Bb', 'Eb', 'Ab'] },
  'Ab': { sharps: 0, flats: 4, accidentals: ['Bb', 'Eb', 'Ab', 'Db'] },
  'Db': { sharps: 0, flats: 5, accidentals: ['Bb', 'Eb', 'Ab', 'Db', 'Gb'] },
  'Gb': { sharps: 0, flats: 6, accidentals: ['Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb'] },
};

// Type-safe scale generation functions with proper key signature logic
export function getMajorScale(tonic: Note): Scale {
  const normalizedTonic = normalizeNote(tonic);
  const notes = buildScale(normalizedTonic, MAJOR_SCALE_PATTERN);
  
  // Get actual key signature based on original tonic name (not normalized)
  const keyData = KEY_SIGNATURES[tonic as keyof typeof KEY_SIGNATURES];
  const sharps = keyData?.sharps > 0 ? keyData.accidentals.filter(acc => acc.includes('#')) as Note[] : [];
  const flats = keyData?.flats > 0 ? keyData.accidentals.filter(acc => acc.includes('b')) as Note[] : [];
  
  return {
    name: `${tonic} Major`, // Keep original spelling for display
    type: 'major',
    tonic: normalizedTonic, // Use canonical form for processing
    notes,
    sharps,
    flats,
  };
}

export function getMinorScale(tonic: Note): Scale {
  const normalizedTonic = normalizeNote(tonic);
  const notes = buildScale(normalizedTonic, MINOR_SCALE_PATTERN);
  
  // Minor scales share key signatures with their relative majors
  // Find relative major: minor tonic + 3 semitones
  const relativeMajorIndex = (getNoteIndex(tonic) + 3) % 12;
  const relativeMajor = getNote(relativeMajorIndex);
  
  // Map to key signature using relative major
  const keyMapping: { [key: string]: string } = {
    'C': 'Eb', 'C#': 'E', 'D': 'F', 'D#': 'F#', 'E': 'G', 'F': 'Ab',
    'F#': 'A', 'G': 'Bb', 'G#': 'B', 'A': 'C', 'A#': 'C#', 'B': 'D'
  };
  
  const keyForSignature = keyMapping[normalizeNote(tonic)] || relativeMajor;
  const keyData = KEY_SIGNATURES[keyForSignature as keyof typeof KEY_SIGNATURES];
  
  const sharps = keyData?.sharps > 0 ? keyData.accidentals.filter(acc => acc.includes('#')) as Note[] : [];
  const flats = keyData?.flats > 0 ? keyData.accidentals.filter(acc => acc.includes('b')) as Note[] : [];
  
  return {
    name: `${tonic} Minor`, // Keep original spelling for display
    type: 'minor',
    tonic: normalizedTonic, // Use canonical form for processing
    notes,
    sharps,
    flats,
  };
}

// Type-safe scale generation with structured input
export function getScale(definition: ScaleDefinition): Scale {
  return definition.type === 'major' ? getMajorScale(definition.tonic) : getMinorScale(definition.tonic);
}

export function buildInterval(startNote: Note, intervalType: IntervalType, direction: 'up' | 'down' = 'up'): Note {
  const normalizedStartNote = normalizeNote(startNote);
  const interval = INTERVAL_DEFINITIONS.find(i => i.name === intervalType);
  if (!interval) {
    console.error(`Unknown interval type: ${intervalType}`);
    return normalizedStartNote;
  }
  
  const startIndex = getNoteIndex(normalizedStartNote);
  const semitones = direction === 'up' ? interval.semitones : -interval.semitones;
  
  return getNote(startIndex + semitones);
}

// Type-safe functions that work with ScaleDefinition objects
export function getKeySignature(definition: ScaleDefinition): { sharps: Note[], flats: Note[] } {
  const scale = getScale(definition);
  return { sharps: scale.sharps, flats: scale.flats };
}

export function isNoteInScale(note: Note, definition: ScaleDefinition): boolean {
  const scale = getScale(definition);
  return scale.notes.includes(note);
}

export function getIntervalName(startNote: Note, endNote: Note): string {
  const normalizedStartNote = normalizeNote(startNote);
  const normalizedEndNote = normalizeNote(endNote);
  const startIndex = getNoteIndex(normalizedStartNote);
  const endIndex = getNoteIndex(normalizedEndNote);
  const semitones = ((endIndex - startIndex) + 12) % 12;
  
  const interval = INTERVAL_DEFINITIONS.find(i => i.semitones === semitones);
  return interval ? interval.name : 'Unknown';
}

// Enhanced functions using structured data
export function getScaleKeySignature(definition: ScaleDefinition): { sharps: number, flats: number, accidentals: Note[], explanation: string } {
  const scale = getScale(definition);
  const sharps = scale.sharps.length;
  const flats = scale.flats.length;
  const scaleName = scale.name;
  
  const explanation = `${scaleName} has ${sharps + flats === 0 ? 'no sharps or flats' : 
    sharps > 0 ? `${sharps} sharp${sharps > 1 ? 's' : ''}: ${scale.sharps.join(', ')}` : 
    `${flats} flat${flats > 1 ? 's' : ''}: ${scale.flats.join(', ')}`}.`;
  
  return { sharps, flats, accidentals: [...scale.sharps, ...scale.flats], explanation };
}

// Generate exercise data with type safety
export function generateScaleExercise(category: 'major_scales' | 'minor_scales'): ExerciseData {
  const scaleList = category === 'major_scales' ? MAJOR_SCALES : MINOR_SCALES;
  const randomScale = scaleList[Math.floor(Math.random() * scaleList.length)];
  const scale = getScale(randomScale);
  
  return {
    category,
    tonic: randomScale.tonic,
    type: randomScale.type,
    displayName: scale.name,
    correctNotes: scale.notes
  };
}

export function generateIntervalExercise(): ExerciseData {
  const interval = INTERVAL_DEFINITIONS[Math.floor(Math.random() * INTERVAL_DEFINITIONS.length)];
  const startNotes: Note[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  const startNote = startNotes[Math.floor(Math.random() * startNotes.length)];
  const endNote = buildInterval(startNote, interval.name, 'up');
  
  return {
    category: 'intervals',
    tonic: startNote,
    intervalType: interval.name,
    displayName: `${interval.name} from ${startNote}`,
    correctNotes: [startNote, endNote],
    startNote
  };
}

// Educational functions using structured data
export function getIntervalExplanation(intervalName: IntervalType): { explanation: string, learningTip: string, difficulty: 'beginner' | 'intermediate' | 'advanced' } {
  const interval = INTERVAL_DEFINITIONS.find(i => i.name === intervalName);
  return interval ? { 
    explanation: interval.explanation, 
    learningTip: interval.learningTip, 
    difficulty: interval.difficulty 
  } : { 
    explanation: 'Unknown interval', 
    learningTip: 'This interval is not recognized.', 
    difficulty: 'beginner' 
  };
}

// Get scales ordered by difficulty (number of accidentals)
export function getScalesByDifficulty(): { easy: ScaleDefinition[], medium: ScaleDefinition[], hard: ScaleDefinition[] } {
  const easy = SCALE_DEFINITIONS.filter(s => Math.abs(s.accidentals) <= 1);
  const medium = SCALE_DEFINITIONS.filter(s => Math.abs(s.accidentals) >= 2 && Math.abs(s.accidentals) <= 3);
  const hard = SCALE_DEFINITIONS.filter(s => Math.abs(s.accidentals) >= 4);
  
  return { easy, medium, hard };
}

// Get intervals ordered by difficulty for progressive learning
export function getIntervalsByDifficulty(): { beginner: IntervalType[], intermediate: IntervalType[], advanced: IntervalType[] } {
  const beginner = INTERVAL_DEFINITIONS.filter(i => i.difficulty === 'beginner').map(i => i.name);
  const intermediate = INTERVAL_DEFINITIONS.filter(i => i.difficulty === 'intermediate').map(i => i.name);
  const advanced = INTERVAL_DEFINITIONS.filter(i => i.difficulty === 'advanced').map(i => i.name);
  
  return { beginner, intermediate, advanced };
}

export function getScaleDegrees(definition: ScaleDefinition): { [degree: string]: Note } {
  const scale = getScale(definition);
  
  return {
    'I': scale.notes[0],   // Tonic
    'ii': scale.notes[1],  // Supertonic  
    'iii': scale.notes[2], // Mediant
    'IV': scale.notes[3],  // Subdominant
    'V': scale.notes[4],   // Dominant
    'vi': scale.notes[5],  // Submediant
    'vii': scale.notes[6]  // Leading tone
  };
}

// Legacy compatibility (generate string arrays from structured data)
export const MAJOR_SCALE_NAMES: string[] = MAJOR_SCALES.map(s => getScale(s).name);
export const MINOR_SCALE_NAMES: string[] = MINOR_SCALES.map(s => getScale(s).name);