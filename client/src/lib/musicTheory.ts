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

export const MAJOR_SCALES: string[] = [
  'C Major', 'G Major', 'D Major', 'A Major', 'E Major', 'B Major',
  'F# Major', 'C# Major', 'F Major', 'Bb Major', 'Eb Major', 'Ab Major'
];

export const MINOR_SCALES: string[] = [
  'A Minor', 'E Minor', 'B Minor', 'F# Minor', 'C# Minor', 'G# Minor',
  'D# Minor', 'A# Minor', 'D Minor', 'G Minor', 'C Minor', 'F Minor'
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
