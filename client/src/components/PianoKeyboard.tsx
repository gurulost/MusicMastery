import { useState, useEffect } from 'react';
import { Note } from '@shared/schema';
import { audioEngine } from '@/lib/audio';
import { cn } from '@/lib/utils';

interface PianoKeyboardProps {
  highlightedNotes?: Note[];
  sharpsInKey?: Note[];
  onNoteClick?: (note: Note) => void;
  playedNotes?: Note[];
  selectedNotes?: Note[];
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
    setActiveKeys(prev => new Set(prev).add(keyId));
    
    // Play audio with correct octave - only once per actual key press
    const octave = index !== undefined ? getOctaveFromIndex(index, isBlackKey) : 4;
    await audioEngine.playNote(note, 0.5, octave);
    
    // Remove active state after animation
    setTimeout(() => {
      setActiveKeys(prev => {
        const newSet = new Set(prev);
        newSet.delete(keyId);
        return newSet;
      });
    }, 150);

    // Handle toggle functionality if onNoteToggle is provided
    if (onNoteToggle) {
      onNoteToggle(note);
    }

    // Notify parent component
    onNoteClick?.(note);
  };

  const isHighlighted = (note: Note) => highlightedNotes.includes(note);
  const isSharpInKey = (note: Note) => sharpsInKey.includes(note);
  const isPlayed = (note: Note) => playedNotes.includes(note);
  const isSelected = (note: Note) => selectedNotes.includes(note);
  const isActive = (note: Note, index: number, isBlackKey: boolean = false) => {
    const keyId = `${note}-${index}-${isBlackKey ? 'black' : 'white'}`;
    return activeKeys.has(keyId);
  };

  return (
    <div className={cn("flex justify-center overflow-x-auto", className)}>
      <div className="relative min-w-fit">
        {/* White Keys */}
        <div className="flex">
          {EXTENDED_WHITE_KEYS.map((note, index) => (
            <button
              key={`${note}-${index}`}
              data-testid={`piano-key-${note}-${index}`}
              className={cn(
                "piano-key white-key w-10 h-32 mr-0.5 flex items-end justify-center pb-2 text-xs font-medium border border-border rounded-b-md transition-all duration-100 select-none cursor-pointer",
                "hover:transform hover:translate-y-0.5",
                {
                  "bg-green-500 text-white border-green-600": isHighlighted(note), // Green for correct answers
                  "bg-orange-400 text-white border-orange-500": isPlayed(note), // Orange for played sequence
                  "bg-purple-200 border-purple-400 text-purple-800": isSelected(note), // Purple for current selections
                  "transform translate-y-1 shadow-md": isActive(note, index),
                  "bg-card": !isHighlighted(note) && !isPlayed(note) && !isSelected(note),
                }
              )}
              onClick={() => handleKeyPress(note, index)}
            >
              {showLabels && note}
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
                className={cn(
                  "piano-key black-key w-7 h-20 text-white text-xs flex items-end justify-center pb-1 rounded-b-sm transition-all duration-100 select-none cursor-pointer z-10 absolute",
                  "hover:transform hover:translate-y-0.5",
                  {
                    "bg-yellow-600 text-yellow-100": isSharpInKey(blackKey.note), // Yellow for sharps in key
                    "bg-orange-600 text-white": isPlayed(blackKey.note), // Orange for played sequence
                    "bg-purple-500 text-white": isSelected(blackKey.note), // Purple for current selections
                    "transform translate-y-1 shadow-md": isActive(blackKey.note, blackKey.whiteKeyIndex, true),
                    "bg-gray-800": !isSharpInKey(blackKey.note) && !isPlayed(blackKey.note) && !isSelected(blackKey.note),
                  }
                )}
                style={{ 
                  left: `${leftPosition}px`
                }}
                onClick={() => handleKeyPress(blackKey.note, blackKey.whiteKeyIndex, true)}
              >
                {showLabels && blackKey.note}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
