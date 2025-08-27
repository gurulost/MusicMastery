import { useState, useEffect } from 'react';
import { Note } from '@shared/schema';
import { audioEngine } from '@/lib/audio';
import { cn } from '@/lib/utils';

interface PianoKeyboardProps {
  highlightedNotes?: Note[];
  sharpsInKey?: Note[];
  onNoteClick?: (note: Note) => void;
  playedNotes?: Note[];
  className?: string;
}

const WHITE_KEYS: Note[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const BLACK_KEYS: (Note | null)[] = ['C#', 'D#', null, 'F#', 'G#', 'A#', null];

export function PianoKeyboard({ 
  highlightedNotes = [], 
  sharpsInKey = [],
  onNoteClick,
  playedNotes = [],
  className 
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

    // Notify parent component
    onNoteClick?.(note);
  };

  const isHighlighted = (note: Note) => highlightedNotes.includes(note);
  const isSharpInKey = (note: Note) => sharpsInKey.includes(note);
  const isPlayed = (note: Note) => playedNotes.includes(note);
  const isActive = (note: Note) => activeKeys.has(note);

  return (
    <div className={cn("flex justify-center", className)}>
      <div className="relative">
        {/* White Keys */}
        <div className="flex">
          {WHITE_KEYS.map((note, index) => (
            <button
              key={note}
              data-testid={`piano-key-${note}`}
              className={cn(
                "piano-key white-key w-12 h-32 mr-1 flex items-end justify-center pb-2 text-xs font-medium border border-border rounded-b-md transition-all duration-100 select-none cursor-pointer",
                "hover:transform hover:translate-y-0.5",
                {
                  "bg-primary text-primary-foreground": isHighlighted(note),
                  "bg-success text-success-foreground": isPlayed(note),
                  "transform translate-y-1 shadow-md": isActive(note),
                  "bg-card": !isHighlighted(note) && !isPlayed(note),
                }
              )}
              onClick={() => handleKeyPress(note)}
            >
              {note}
            </button>
          ))}
        </div>
        
        {/* Black Keys */}
        <div className="absolute top-0 flex">
          {BLACK_KEYS.map((note, index) => {
            if (!note) {
              return <div key={index} className="w-8 h-20 ml-8 mr-1" />;
            }
            
            return (
              <button
                key={note}
                data-testid={`piano-key-${note}`}
                className={cn(
                  "piano-key black-key w-8 h-20 ml-4 mr-1 text-white text-xs flex items-end justify-center pb-1 rounded-b-sm transition-all duration-100 select-none cursor-pointer z-10",
                  "hover:transform hover:translate-y-0.5",
                  {
                    "bg-yellow-600 text-yellow-100": isSharpInKey(note),
                    "bg-success text-success-foreground": isPlayed(note),
                    "transform translate-y-1 shadow-md": isActive(note),
                    "bg-gray-800": !isSharpInKey(note) && !isPlayed(note),
                  }
                )}
                style={{
                  marginLeft: index === 0 ? '2rem' : index === 2 ? '2rem' : '1rem'
                }}
                onClick={() => handleKeyPress(note)}
              >
                {note}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
