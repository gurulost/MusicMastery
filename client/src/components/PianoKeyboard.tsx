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

// Expanded keyboard covering 2.5 octaves: half octave below C, two full octaves from C
const EXTENDED_WHITE_KEYS: Note[] = [
  'G', 'A', 'B', // Half octave below C
  'C', 'D', 'E', 'F', 'G', 'A', 'B', // First full octave
  'C', 'D', 'E', 'F', 'G', 'A', 'B', // Second full octave  
  'C', 'D', 'E', 'F' // Half octave above
];

const EXTENDED_BLACK_KEYS: (Note | null)[] = [
  'G#', 'A#', null, // Half octave below C
  'C#', 'D#', null, 'F#', 'G#', 'A#', null, // First full octave
  'C#', 'D#', null, 'F#', 'G#', 'A#', null, // Second full octave
  'C#', 'D#', null // Half octave above
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
  const [activeKeys, setActiveKeys] = useState<Set<Note>>(new Set());

  const handleKeyPress = async (note: Note) => {
    setActiveKeys(prev => new Set(prev).add(note));
    
    // Play audio
    await audioEngine.playNote(note);
    
    // Remove active state after animation
    setTimeout(() => {
      setActiveKeys(prev => {
        const newSet = new Set(prev);
        newSet.delete(note);
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
  const isActive = (note: Note) => activeKeys.has(note);

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
                  "bg-primary text-primary-foreground": isHighlighted(note),
                  "bg-success text-success-foreground": isPlayed(note),
                  "bg-blue-200 border-blue-400 text-blue-800": isSelected(note),
                  "transform translate-y-1 shadow-md": isActive(note),
                  "bg-card": !isHighlighted(note) && !isPlayed(note) && !isSelected(note),
                }
              )}
              onClick={() => handleKeyPress(note)}
            >
              {showLabels && note}
            </button>
          ))}
        </div>
        
        {/* Black Keys */}
        <div className="absolute top-0 flex">
          {EXTENDED_BLACK_KEYS.map((note, index) => {
            if (!note) {
              return <div key={`empty-${index}`} className="w-7 h-20 ml-2.5 mr-0.5" />;
            }
            
            return (
              <button
                key={`${note}-black-${index}`}
                data-testid={`piano-key-${note}-black-${index}`}
                className={cn(
                  "piano-key black-key w-7 h-20 ml-1.5 mr-0.5 text-white text-xs flex items-end justify-center pb-1 rounded-b-sm transition-all duration-100 select-none cursor-pointer z-10",
                  "hover:transform hover:translate-y-0.5",
                  {
                    "bg-yellow-600 text-yellow-100": isSharpInKey(note),
                    "bg-success text-success-foreground": isPlayed(note),
                    "bg-blue-400 text-blue-100": isSelected(note),
                    "transform translate-y-1 shadow-md": isActive(note),
                    "bg-gray-800": !isSharpInKey(note) && !isPlayed(note) && !isSelected(note),
                  }
                )}
                onClick={() => handleKeyPress(note)}
              >
                {showLabels && note}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
