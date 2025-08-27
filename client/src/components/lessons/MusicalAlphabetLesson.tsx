import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PianoKeyboard } from '@/components/PianoKeyboard';
import { CheckCircle, ArrowRight, Music, Hash, Minus } from 'lucide-react';
import { Note } from '@shared/schema';
import { audioEngine } from '@/lib/audio';

interface MusicalAlphabetLessonProps {
  section: 'learn' | 'practice' | 'test';
  onComplete: () => void;
}

const NATURAL_NOTES: Note[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const SHARP_NOTES: Note[] = ['C#', 'D#', 'F#', 'G#', 'A#'];
// Flat notes are represented with enharmonic equivalents in our Note type
const FLAT_NOTES: Note[] = ['C#', 'D#', 'F#', 'G#', 'A#']; // Using sharp equivalents for simplicity

export function MusicalAlphabetLesson({ section, onComplete }: MusicalAlphabetLessonProps) {
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [testQuestions] = useState(() => {
    // Generate test questions
    const questions = [...NATURAL_NOTES, ...SHARP_NOTES].sort(() => Math.random() - 0.5).slice(0, 10);
    return questions;
  });
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);

  const handleNoteClick = (note: Note) => {
    audioEngine.playNote(note, 0.8);
    setCurrentNote(note);
  };

  const handleTestAnswer = (answer: string) => {
    const isCorrect = answer === testQuestions[currentQuestionIndex];
    const newAnswers = [...userAnswers, answer];
    setUserAnswers(newAnswers);
    
    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
    }

    if (currentQuestionIndex < testQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Test complete
      if (correctAnswers + (isCorrect ? 1 : 0) >= 8) {
        onComplete();
      }
    }
  };

  if (section === 'learn') {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Music className="h-5 w-5 mr-2" />
              The Musical Alphabet
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">The Basics</h3>
              <p className="text-blue-700 mb-3">
                Music uses only 7 letter names: <strong>A, B, C, D, E, F, G</strong>
              </p>
              <p className="text-blue-700 mb-3">
                These letters repeat over and over: A, B, C, D, E, F, G, A, B, C...
              </p>
              <p className="text-blue-700">
                On a piano, these are the <strong>white keys</strong>.
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2 flex items-center">
                <Hash className="h-4 w-4 mr-1" />
                Sharps (#) and 
                <Minus className="h-4 w-4 mx-1" />
                Flats (♭)
              </h3>
              <p className="text-green-700 mb-2">
                <strong>Sharps (#):</strong> Raise a note by a half step
              </p>
              <p className="text-green-700 mb-2">
                <strong>Flats (♭):</strong> Lower a note by a half step
              </p>
              <p className="text-green-700">
                On a piano, these are the <strong>black keys</strong>.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Interactive Piano - Click to Explore</CardTitle>
          </CardHeader>
          <CardContent>
            <PianoKeyboard
              onNoteClick={handleNoteClick}
              highlightedNotes={currentNote ? [currentNote] : []}
            />
            <div className="mt-4 text-center">
              {currentNote && (
                <div className="bg-muted p-3 rounded-lg">
                  <p className="font-semibold">You clicked: {currentNote}</p>
                  <p className="text-sm text-muted-foreground">
                    {NATURAL_NOTES.includes(currentNote) ? 'Natural note (white key)' : 'Sharp/Flat note (black key)'}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={onComplete} size="lg">
            I Understand the Musical Alphabet
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  if (section === 'practice') {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Practice: Identify the Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Click on the piano keys and observe their names. Try to memorize the pattern.
            </p>
            
            <PianoKeyboard
              onNoteClick={handleNoteClick}
              highlightedNotes={currentNote ? [currentNote] : []}
            />
            
            <div className="mt-4">
              {currentNote && (
                <div className="text-center bg-muted p-3 rounded-lg">
                  <p className="font-semibold text-lg">{currentNote}</p>
                  <p className="text-sm text-muted-foreground">
                    {NATURAL_NOTES.includes(currentNote) ? 
                      `Natural note - Letter ${currentNote}` : 
                      `Sharp/Flat note - ${currentNote.includes('#') ? 'Sharp' : 'Flat'} of ${currentNote.charAt(0)}`
                    }
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={onComplete} size="lg">
            Ready for the Test
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  // Test section
  const isTestComplete = currentQuestionIndex >= testQuestions.length;
  const currentQuestion = testQuestions[currentQuestionIndex];
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Test: Musical Alphabet</span>
            <span className="text-sm font-normal">
              Question {Math.min(currentQuestionIndex + 1, testQuestions.length)} of {testQuestions.length}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isTestComplete ? (
            <div className="text-center space-y-4">
              <CheckCircle className="h-16 w-16 text-success mx-auto" />
              <h3 className="text-xl font-semibold">
                Test Complete! Score: {correctAnswers}/{testQuestions.length}
              </h3>
              {correctAnswers >= 8 ? (
                <div>
                  <p className="text-success mb-4">Excellent! You've mastered the musical alphabet.</p>
                  <Button onClick={onComplete} size="lg">
                    Continue to Next Step
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              ) : (
                <div>
                  <p className="text-warning mb-4">Keep practicing! You need 8/10 to pass.</p>
                  <Button onClick={() => {
                    setCurrentQuestionIndex(0);
                    setCorrectAnswers(0);
                    setUserAnswers([]);
                  }}>
                    Retry Test
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-primary/5 p-4 rounded-lg text-center">
                <p className="text-lg mb-4">What note is highlighted on the piano?</p>
                <PianoKeyboard
                  highlightedNotes={[currentQuestion]}
                  onNoteClick={() => {}} // Disabled during test
                />
              </div>
              
              <div className="grid grid-cols-4 gap-2">
                {[...NATURAL_NOTES, ...SHARP_NOTES].sort().map(note => (
                  <Button
                    key={note}
                    variant="outline"
                    onClick={() => handleTestAnswer(note)}
                    className="h-12"
                  >
                    {note}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}