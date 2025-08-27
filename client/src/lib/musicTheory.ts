import { Note, Scale, Interval, IntervalType } from "@shared/schema";

export const NOTES: Note[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const MAJOR_SCALE_PATTERN = [2, 2, 1, 2, 2, 2, 1]; // whole and half steps
export const MINOR_SCALE_PATTERN = [2, 1, 2, 2, 1, 2, 2]; // natural minor scale

export const INTERVALS: Interval[] = [
  { name: 'Perfect Unison', semitones: 0, shortName: 'P1' },
  { name: 'Minor 2nd', semitones: 1, shortName: 'm2' },
  { name: 'Major 2nd', semitones: 2, shortName: 'M2' },
  { name: 'Minor 3rd', semitones: 3, shortName: 'm3' },
  { name: 'Major 3rd', semitones: 4, shortName: 'M3' },
  { name: 'Perfect 4th', semitones: 5, shortName: 'P4' },
  { name: 'Tritone', semitones: 6, shortName: 'TT' },
  { name: 'Perfect 5th', semitones: 7, shortName: 'P5' },
  { name: 'Minor 6th', semitones: 8, shortName: 'm6' },
  { name: 'Major 6th', semitones: 9, shortName: 'M6' },
  { name: 'Minor 7th', semitones: 10, shortName: 'm7' },
  { name: 'Major 7th', semitones: 11, shortName: 'M7' },
  { name: 'Perfect Octave', semitones: 12, shortName: 'P8' },
];

// Major scales in circle of fifths order (sharps first, then flats)
export const MAJOR_SCALES: string[] = [
  'C Major',    // 0 accidentals
  'G Major',    // 1 sharp
  'D Major',    // 2 sharps
  'A Major',    // 3 sharps
  'E Major',    // 4 sharps
  'B Major',    // 5 sharps
  'F# Major',   // 6 sharps
  'F Major',    // 1 flat
  'Bb Major',   // 2 flats
  'Eb Major',   // 3 flats
  'Ab Major',   // 4 flats
  'Db Major'    // 5 flats
];

// Minor scales in circle of fifths order (relative to major scales)
export const MINOR_SCALES: string[] = [
  'A Minor',    // 0 accidentals (relative to C Major)
  'E Minor',    // 1 sharp (relative to G Major)
  'B Minor',    // 2 sharps (relative to D Major)  
  'F# Minor',   // 3 sharps (relative to A Major)
  'C# Minor',   // 4 sharps (relative to E Major)
  'G# Minor',   // 5 sharps (relative to B Major)
  'D# Minor',   // 6 sharps (relative to F# Major)
  'D Minor',    // 1 flat (relative to F Major)
  'G Minor',    // 2 flats (relative to Bb Major)
  'C Minor',    // 3 flats (relative to Eb Major)
  'F Minor',    // 4 flats (relative to Ab Major)
  'Bb Minor'    // 5 flats (relative to Db Major)
];

export function getNoteIndex(note: Note): number {
  return NOTES.indexOf(note);
}

export function getNote(index: number): Note {
  return NOTES[((index % 12) + 12) % 12];
}

export function buildScale(tonic: Note, pattern: number[]): Note[] {
  const result: Note[] = [tonic];
  let currentIndex = getNoteIndex(tonic);
  
  for (let i = 0; i < pattern.length - 1; i++) {
    currentIndex += pattern[i];
    result.push(getNote(currentIndex));
  }
  
  return result;
}

export function getMajorScale(tonic: Note): Scale {
  const notes = buildScale(tonic, MAJOR_SCALE_PATTERN);
  const sharps = notes.filter(note => note.includes('#')) as Note[];
  const flats = notes.filter(note => note.includes('b')) as Note[];
  
  return {
    name: `${tonic} Major`,
    type: 'major',
    tonic,
    notes,
    sharps,
    flats,
  };
}

export function getMinorScale(tonic: Note): Scale {
  const notes = buildScale(tonic, MINOR_SCALE_PATTERN);
  const sharps = notes.filter(note => note.includes('#')) as Note[];
  const flats = notes.filter(note => note.includes('b')) as Note[];
  
  return {
    name: `${tonic} Minor`,
    type: 'minor',
    tonic,
    notes,
    sharps,
    flats,
  };
}

export function buildInterval(startNote: Note, intervalType: IntervalType, direction: 'up' | 'down' = 'up'): Note {
  const interval = INTERVALS.find(i => i.name === intervalType);
  if (!interval) throw new Error(`Unknown interval: ${intervalType}`);
  
  const startIndex = getNoteIndex(startNote);
  const semitones = direction === 'up' ? interval.semitones : -interval.semitones;
  
  return getNote(startIndex + semitones);
}

export function getKeySignature(scaleName: string): { sharps: Note[], flats: Note[] } {
  const [tonic, type] = scaleName.split(' ');
  const tonicNote = tonic as Note;
  
  if (type === 'Major') {
    const scale = getMajorScale(tonicNote);
    return { sharps: scale.sharps, flats: scale.flats };
  } else {
    const scale = getMinorScale(tonicNote);
    return { sharps: scale.sharps, flats: scale.flats };
  }
}

export function isNoteInScale(note: Note, scaleName: string): boolean {
  const [tonic, type] = scaleName.split(' ');
  const tonicNote = tonic as Note;
  
  const scale = type === 'Major' ? getMajorScale(tonicNote) : getMinorScale(tonicNote);
  return scale.notes.includes(note);
}

export function getIntervalName(startNote: Note, endNote: Note): string {
  const startIndex = getNoteIndex(startNote);
  const endIndex = getNoteIndex(endNote);
  const semitones = ((endIndex - startIndex) + 12) % 12;
  
  const interval = INTERVALS.find(i => i.semitones === semitones);
  return interval ? interval.name : 'Unknown';
}

export function getScaleKeySignature(scaleName: string): { sharps: number, flats: number, accidentals: Note[], explanation: string } {
  const [tonic, type] = scaleName.split(' ');
  const tonicNote = tonic as Note;
  
  if (type === 'Major') {
    const scale = getMajorScale(tonicNote);
    const sharps = scale.sharps.length;
    const flats = scale.flats.length;
    const explanation = `${scaleName} has ${sharps + flats === 0 ? 'no sharps or flats' : 
      sharps > 0 ? `${sharps} sharp${sharps > 1 ? 's' : ''}: ${scale.sharps.join(', ')}` : 
      `${flats} flat${flats > 1 ? 's' : ''}: ${scale.flats.join(', ')}`}.`;
    return { sharps, flats, accidentals: [...scale.sharps, ...scale.flats], explanation };
  } else {
    const scale = getMinorScale(tonicNote);
    const sharps = scale.sharps.length;
    const flats = scale.flats.length;
    const explanation = `${scaleName} has ${sharps + flats === 0 ? 'no sharps or flats' : 
      sharps > 0 ? `${sharps} sharp${sharps > 1 ? 's' : ''}: ${scale.sharps.join(', ')}` : 
      `${flats} flat${flats > 1 ? 's' : ''}: ${scale.flats.join(', ')}`}.`;
    return { sharps, flats, accidentals: [...scale.sharps, ...scale.flats], explanation };
  }
}

// Get scales ordered by difficulty (number of accidentals)
export function getScalesByDifficulty(): { easy: string[], medium: string[], hard: string[] } {
  const easy = ['C Major', 'A Minor', 'G Major', 'E Minor', 'F Major', 'D Minor'];
  const medium = ['D Major', 'B Minor', 'Bb Major', 'G Minor', 'A Major', 'F# Minor', 'Eb Major', 'C Minor'];
  const hard = ['E Major', 'C# Minor', 'Ab Major', 'F Minor', 'B Major', 'G# Minor', 'Db Major', 'Bb Minor', 'F# Major', 'D# Minor'];
  
  return { easy, medium, hard };
}

export function getScaleDegrees(scaleName: string): { [degree: string]: Note } {
  const [tonic, type] = scaleName.split(' ');
  const tonicNote = tonic as Note;
  
  const scale = type === 'Major' ? getMajorScale(tonicNote) : getMinorScale(tonicNote);
  
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

// Educational explanations for intervals with learning tips
export function getIntervalExplanation(intervalName: IntervalType): { explanation: string, learningTip: string, difficulty: 'beginner' | 'intermediate' | 'advanced' } {
  const explanations: { [key in IntervalType]: { explanation: string, learningTip: string, difficulty: 'beginner' | 'intermediate' | 'advanced' } } = {
    'Perfect Unison': { 
      explanation: 'The same note played simultaneously or in sequence. Distance: 0 semitones.',
      learningTip: 'This is the starting point - no distance at all. Both notes are identical.',
      difficulty: 'beginner'
    },
    'Minor 2nd': { 
      explanation: 'A half step up. Very dissonant and creates tension. Distance: 1 semitone.',
      learningTip: 'Move up just one key (including black keys). Sounds very close and tense.',
      difficulty: 'beginner'
    },
    'Major 2nd': { 
      explanation: 'A whole step up. Common in scales and melodies. Distance: 2 semitones.',
      learningTip: 'Skip one key between notes. This is like moving from C to D.',
      difficulty: 'beginner'
    },
    'Minor 3rd': { 
      explanation: 'The foundation of minor chords. Sounds sad or melancholy. Distance: 3 semitones.',
      learningTip: 'Count 3 half-steps up. This interval gives minor chords their sad sound.',
      difficulty: 'beginner'
    },
    'Major 3rd': { 
      explanation: 'The foundation of major chords. Sounds bright and happy. Distance: 4 semitones.',
      learningTip: 'Count 4 half-steps up. This interval makes major chords sound happy.',
      difficulty: 'beginner'
    },
    'Perfect 4th': { 
      explanation: 'Very stable and consonant. Common in folk music. Distance: 5 semitones.',
      learningTip: 'Think of "Here Comes the Bride" - the first two notes form a Perfect 4th.',
      difficulty: 'intermediate'
    },
    'Tritone': { 
      explanation: 'The "devil\'s interval." Very dissonant, halfway through the octave. Distance: 6 semitones.',
      learningTip: 'Exactly halfway to the octave. Historically avoided in church music for its tension.',
      difficulty: 'advanced'
    },
    'Perfect 5th': { 
      explanation: 'The most consonant interval after the octave. Foundation of power chords. Distance: 7 semitones.',
      learningTip: 'Think of "Twinkle Twinkle Little Star" - the first two notes form a Perfect 5th.',
      difficulty: 'intermediate'
    },
    'Minor 6th': { 
      explanation: 'Somewhat melancholy, used in romantic ballads. Distance: 8 semitones.',
      learningTip: 'Has a bittersweet, longing quality. Common in love songs.',
      difficulty: 'intermediate'
    },
    'Major 6th': { 
      explanation: 'Bright and open sound, common in pop music. Distance: 9 semitones.',
      learningTip: 'Sounds warm and open. Think of the beginning of "My Way."',
      difficulty: 'intermediate'
    },
    'Minor 7th': { 
      explanation: 'Creates dominant 7th chords, adds tension that wants to resolve. Distance: 10 semitones.',
      learningTip: 'Common in jazz and blues. Creates tension that wants to resolve downward.',
      difficulty: 'advanced'
    },
    'Major 7th': { 
      explanation: 'Very dissonant, strongly wants to resolve to the octave. Distance: 11 semitones.',
      learningTip: 'Just one semitone below the octave. Very unstable and wants to resolve up.',
      difficulty: 'advanced'
    },
    'Perfect Octave': { 
      explanation: 'The same note in a higher register. Pure consonance. Distance: 12 semitones.',
      learningTip: 'The most consonant interval. Sounds like the same note, but higher.',
      difficulty: 'beginner'
    }
  };
  
  return explanations[intervalName] || { explanation: 'Unknown interval', learningTip: 'This interval is not recognized.', difficulty: 'beginner' };
}

// Get intervals ordered by difficulty for progressive learning
export function getIntervalsByDifficulty(): { beginner: IntervalType[], intermediate: IntervalType[], advanced: IntervalType[] } {
  const beginner: IntervalType[] = ['Perfect Unison', 'Major 2nd', 'Minor 2nd', 'Major 3rd', 'Minor 3rd', 'Perfect Octave'];
  const intermediate: IntervalType[] = ['Perfect 4th', 'Perfect 5th', 'Major 6th', 'Minor 6th'];
  const advanced: IntervalType[] = ['Tritone', 'Minor 7th', 'Major 7th'];
  
  return { beginner, intermediate, advanced };
}
