import { useState, useEffect } from 'react';
import { Note } from '@shared/schema';
import { audioEngine } from '@/lib/audio';
import { normalizeNote } from '@/lib/musicTheory';
import { cn } from '@/lib/utils';

interface PianoKeyboardProps {
  highlightedNotes?: string[]; // Accept strings to handle both sharps and flats
  sharpsInKey?: string[]; // Accept strings to handle both sharps and flats
  onNoteClick?: (note: Note) => void;
  playedNotes?: string[]; // Accept strings to handle both sharps and flats
  selectedNotes?: string[]; // Accept strings to handle both sharps and flats
  onNoteToggle?: (note: Note) => void;
  className?: string;
  showLabels?: boolean;
  octaveRange?: number;
}

// Proper piano keyboard covering 2.5 octaves: A below middle C, then C to C, then C to C, then C to F
const EXTENDED_WHITE_KEYS: Note[] = [
  'A', 'B', // Half octave below middle C
  'C', 'D', 'E', 'F', 'G', 'A', 'B', // Middle C octave
  'C', 'D', 'E', 'F', 'G', 'A', 'B', // Next octave  
  'C', 'D', 'E', 'F' // Half octave above
];

// Black keys with their positions relative to white keys
interface BlackKeyInfo {
  note: Note;
  whiteKeyIndex: number; // Index of the white key this black key sits between (left side)
}

const BLACK_KEY_POSITIONS: BlackKeyInfo[] = [
  { note: 'A#', whiteKeyIndex: 0 }, // Between A (0) and B (1)
  { note: 'C#', whiteKeyIndex: 2 }, // Between C (2) and D (3)  
  { note: 'D#', whiteKeyIndex: 3 }, // Between D (3) and E (4)
  { note: 'F#', whiteKeyIndex: 5 }, // Between F (5) and G (6)
  { note: 'G#', whiteKeyIndex: 6 }, // Between G (6) and A (7)
  { note: 'A#', whiteKeyIndex: 7 }, // Between A (7) and B (8)
  { note: 'C#', whiteKeyIndex: 9 }, // Between C (9) and D (10)
  { note: 'D#', whiteKeyIndex: 10 }, // Between D (10) and E (11)
  { note: 'F#', whiteKeyIndex: 12 }, // Between F (12) and G (13)
  { note: 'G#', whiteKeyIndex: 13 }, // Between G (13) and A (14)
  { note: 'A#', whiteKeyIndex: 14 }, // Between A (14) and B (15)
  { note: 'C#', whiteKeyIndex: 16 }, // Between C (16) and D (17)
  { note: 'D#', whiteKeyIndex: 17 }, // Between D (17) and E (18)
];

// Helper function to get enharmonic equivalent display for white keys
const getEnharmonicDisplay = (note: Note): string => {
  const enharmonics: Record<string, string> = {
    'C#': 'C#/Db',
    'D#': 'D#/Eb', 
    'F#': 'F#/Gb',
    'G#': 'G#/Ab',
    'A#': 'A#/Bb'
  };
  return enharmonics[note] || note;
};

// Helper function to get vertical enharmonic display for black keys
const getVerticalEnharmonicDisplay = (note: Note) => {
  const enharmonics: Record<string, [string, string]> = {
    'C#': ['C#', 'Db'],
    'D#': ['D#', 'Eb'], 
    'F#': ['F#', 'Gb'],
    'G#': ['G#', 'Ab'],
    'A#': ['A#', 'Bb']
  };
  
  if (enharmonics[note]) {
    const [sharp, flat] = enharmonics[note];
    return (
      <div className="flex flex-col items-center leading-tight">
        <span className="text-[10px]">{sharp}</span>
        <span className="text-[10px]">{flat}</span>
      </div>
    );
  }
  return note;
};

export function PianoKeyboard({ 
  highlightedNotes = [], 
  sharpsInKey = [],
  onNoteClick,
  playedNotes = [],
  selectedNotes = [],
  onNoteToggle,
  className,
  showLabels = true
}: PianoKeyboardProps) {
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
  const [audioInitialized, setAudioInitialized] = useState(false);

  const getOctaveFromIndex = (index: number, isBlackKey: boolean = false): number => {
    if (isBlackKey) {
      // For black keys, determine octave based on their white key position
      if (index <= 1) return 3; // A#, C#, D# in octave below middle C
      if (index <= 7) return 4; // Middle C octave black keys
      if (index <= 13) return 5; // Next octave black keys
      return 6; // High octave black keys
    } else {
      // For white keys
      if (index <= 1) return 3; // A, B below middle C
      if (index <= 8) return 4; // Middle C octave (C-B)
      if (index <= 15) return 5; // Next octave (C-B)
      return 6; // High octave (C-F)
    }
  };

  const handleKeyPress = async (note: Note, index?: number, isBlackKey: boolean = false) => {
    // Create unique key identifier that includes position
    const keyId = `${note}-${index}-${isBlackKey ? 'black' : 'white'}`;
    
    try {
      // Always try to initialize audio on user interaction (required for iOS)
      console.log(`Piano key pressed: ${note}, initializing audio...`);
      const audioReady = await audioEngine.initializeAudio();
      setAudioInitialized(true);
      
      if (!audioReady) {
        console.warn('Audio initialization failed');
        return;
      }
      
      // Play audio with correct octave
      const octave = index !== undefined ? getOctaveFromIndex(index, isBlackKey) : 4;
      const normalizedNote = normalizeNote(note);
      
      console.log(`Playing ${normalizedNote} in octave ${octave}`);
      
      // Use a longer duration for piano keys
      await audioEngine.playNote(normalizedNote, 1.0, octave);
    } catch (error) {
      console.error('Audio playback failed:', error);
      // Don't block the interaction if audio fails
    }

    // Handle toggle functionality if onNoteToggle is provided
    if (onNoteToggle) {
      onNoteToggle(note);
    }

    // Notify parent component
    onNoteClick?.(note);
  };

  const handlePointerDown = (note: Note, index?: number, isBlackKey: boolean = false) => {
    const keyId = `${note}-${index}-${isBlackKey ? 'black' : 'white'}`;
    setActiveKeys(prev => new Set(prev).add(keyId));
    handleKeyPress(note, index, isBlackKey);
  };

  const handlePointerUp = (note: Note, index?: number, isBlackKey: boolean = false) => {
    const keyId = `${note}-${index}-${isBlackKey ? 'black' : 'white'}`;
    setTimeout(() => {
      setActiveKeys(prev => {
        const newSet = new Set(prev);
        newSet.delete(keyId);
        return newSet;
      });
    }, 100);
  };

  const handlePointerLeave = (note: Note, index?: number, isBlackKey: boolean = false) => {
    const keyId = `${note}-${index}-${isBlackKey ? 'black' : 'white'}`;
    setActiveKeys(prev => {
      const newSet = new Set(prev);
      newSet.delete(keyId);
      return newSet;
    });
  };

  // Helper functions that normalize note comparisons to handle enharmonic equivalents
  const normalizeNoteArray = (noteArray: string[]): Note[] => {
    return noteArray.map(note => normalizeNote(note as Note));
  };

  const isHighlighted = (note: Note) => {
    const normalizedHighlighted = normalizeNoteArray(highlightedNotes);
    const normalizedNote = normalizeNote(note);
    return normalizedHighlighted.includes(normalizedNote) || highlightedNotes.includes(note);
  };

  const isSharpInKey = (note: Note) => {
    const normalizedSharps = normalizeNoteArray(sharpsInKey);
    const normalizedNote = normalizeNote(note);
    return normalizedSharps.includes(normalizedNote) || sharpsInKey.includes(note);
  };

  const isPlayed = (note: Note) => {
    const normalizedPlayed = normalizeNoteArray(playedNotes);
    const normalizedNote = normalizeNote(note);
    return normalizedPlayed.includes(normalizedNote) || playedNotes.includes(note);
  };

  const isSelected = (note: Note) => {
    const normalizedSelected = normalizeNoteArray(selectedNotes);
    const normalizedNote = normalizeNote(note);
    return normalizedSelected.includes(normalizedNote) || selectedNotes.includes(note);
  };
  const isActive = (note: Note, index: number, isBlackKey: boolean = false) => {
    const keyId = `${note}-${index}-${isBlackKey ? 'black' : 'white'}`;
    return activeKeys.has(keyId);
  };

  // Helper to get semantic colors for key states
  const getKeyColors = (note: Note, isBlackKey: boolean = false) => {
    if (isHighlighted(note)) {
      return {
        backgroundColor: `hsl(var(--note-correct))`,
        color: 'white',
        borderColor: isBlackKey ? undefined : `hsl(var(--note-correct))`
      };
    }
    if (isPlayed(note)) {
      return {
        backgroundColor: `hsl(var(--note-played))`,
        color: 'white',
        borderColor: isBlackKey ? undefined : `hsl(var(--note-played))`
      };
    }
    if (isSelected(note)) {
      return {
        backgroundColor: `hsl(var(--note-selected))`,
        color: 'white',
        borderColor: isBlackKey ? undefined : `hsl(var(--note-selected))`
      };
    }
    if (isBlackKey && isSharpInKey(note)) {
      return {
        backgroundColor: `hsl(var(--note-in-key))`,
        color: 'white'
      };
    }
    return {};
  };

  return (
    <div className={cn("flex justify-center overflow-x-auto px-2 sm:px-4", className)}>
      <div className="relative min-w-fit">
        {/* Mobile: Add gradient hints for scrollable piano */}
        <div className="absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-background to-transparent pointer-events-none z-20 sm:hidden" />
        <div className="absolute inset-y-0 right-0 w-4 bg-gradient-to-l from-background to-transparent pointer-events-none z-20 sm:hidden" />
        {/* White Keys */}
        <div className="flex">
          {EXTENDED_WHITE_KEYS.map((note, index) => (
            <button
              key={`${note}-${index}`}
              data-testid={`piano-key-${note}-${index}`}
              tabIndex={0}
              aria-label={`Piano key ${note}`}
              role="button"
              className={cn(
                "piano-key white-key w-10 h-32 mr-0.5 flex items-end justify-center pb-2 text-xs font-medium border border-border rounded-b-md transition-all duration-100 select-none cursor-pointer",
                "hover:scale-[1.02] hover:translate-y-0.5 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                "active:scale-[0.97] active:translate-y-1",
                {
                  "transform translate-y-1": isActive(note, index),
                  "bg-card": !isHighlighted(note) && !isPlayed(note) && !isSelected(note),
                }
              )}
              style={{
                ...getKeyColors(note),
                boxShadow: isActive(note, index) ? `0 2px 4px hsl(var(--key-shadow))` : undefined,
                touchAction: 'manipulation', // Prevent default touch behaviors
                userSelect: 'none',
                WebkitUserSelect: 'none'
              }}
              onPointerDown={() => handlePointerDown(note, index)}
              onPointerUp={() => handlePointerUp(note, index)}
              onPointerLeave={() => handlePointerLeave(note, index)}
            >
              {showLabels && getEnharmonicDisplay(note)}
            </button>
          ))}
        </div>
        
        {/* Black Keys - Properly centered between white keys */}
        <div className="absolute top-0 left-0">
          {BLACK_KEY_POSITIONS.map((blackKey, index) => {
            const whiteKeyWidth = 42; // 40px width + 2px margin (mr-0.5)
            const blackKeyWidth = 28; // 7 * 4 = 28px (w-7)
            // Position black key centered between two white keys
            const leftPosition = blackKey.whiteKeyIndex * whiteKeyWidth + (whiteKeyWidth - blackKeyWidth / 2);
            
            return (
              <button
                key={`${blackKey.note}-black-${index}`}
                data-testid={`piano-key-${blackKey.note}-black-${index}`}
                tabIndex={0}
                aria-label={`Piano key ${blackKey.note}`}
                role="button"
                className={cn(
                  "piano-key black-key w-7 h-20 text-white text-xs flex items-end justify-center pb-1 rounded-b-sm transition-all duration-100 select-none cursor-pointer z-10 absolute",
                  "hover:scale-[1.02] hover:translate-y-0.5 hover:shadow-xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  "active:scale-[0.97] active:translate-y-1",
                  {
                    "transform translate-y-1": isActive(blackKey.note, blackKey.whiteKeyIndex, true),
                    "bg-gray-900": !isHighlighted(blackKey.note) && !isSharpInKey(blackKey.note) && !isPlayed(blackKey.note) && !isSelected(blackKey.note),
                  }
                )}
                onPointerDown={() => handlePointerDown(blackKey.note, blackKey.whiteKeyIndex, true)}
                onPointerUp={() => handlePointerUp(blackKey.note, blackKey.whiteKeyIndex, true)}
                onPointerLeave={() => handlePointerLeave(blackKey.note, blackKey.whiteKeyIndex, true)}
                style={{
                  left: `${leftPosition}px`,
                  touchAction: 'manipulation', // Prevent default touch behaviors
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  ...getKeyColors(blackKey.note, true),
                  boxShadow: isActive(blackKey.note, blackKey.whiteKeyIndex, true) ? `0 4px 6px hsl(var(--key-shadow))` : undefined
                }}
              >
                {showLabels && getVerticalEnharmonicDisplay(blackKey.note)}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
