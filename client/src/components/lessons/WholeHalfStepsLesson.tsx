import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PianoKeyboard } from '@/components/PianoKeyboard';
import { CheckCircle, ArrowRight, Music, Zap } from 'lucide-react';
import { Note } from '@shared/schema';
import { audioEngine } from '@/lib/audio';

interface WholeHalfStepsLessonProps {
  section: 'learn' | 'practice' | 'test';
  onComplete: () => void;
}

const CHROMATIC_NOTES: Note[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Helper function to get the next note by half steps
function getNextNote(note: Note, halfSteps: number): Note {
  const index = CHROMATIC_NOTES.indexOf(note);
  const nextIndex = (index + halfSteps) % CHROMATIC_NOTES.length;
  return CHROMATIC_NOTES[nextIndex];
}

export function WholeHalfStepsLesson({ section, onComplete }: WholeHalfStepsLessonProps) {
  const [selectedNotes, setSelectedNotes] = useState<Note[]>([]);
  const [currentExample, setCurrentExample] = useState<{start: Note, interval: 'half' | 'whole'} | null>(null);
  const [testQuestions] = useState(() => {
    // Generate test questions
    const questions = [];
    for (let i = 0; i < 10; i++) {
      const startNote = CHROMATIC_NOTES[Math.floor(Math.random() * CHROMATIC_NOTES.length)];
      const interval = Math.random() < 0.5 ? 'half' : 'whole';
      questions.push({ startNote, interval, targetNote: getNextNote(startNote, interval === 'half' ? 1 : 2) });
    }
    return questions;
  });
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);

  const handleNoteClick = (note: Note) => {
    audioEngine.playNote(note, 0.8);
  };

  const handleExampleClick = (start: Note, interval: 'half' | 'whole') => {
    const target = getNextNote(start, interval === 'half' ? 1 : 2);
    setSelectedNotes([start, target]);
    setCurrentExample({ start, interval });
    
    // Play the interval
    audioEngine.playNote(start, 0.8);
    setTimeout(() => audioEngine.playNote(target, 0.8), 600);
  };

  const handleTestAnswer = (answer: Note) => {
    const currentQuestion = testQuestions[currentQuestionIndex];
    const isCorrect = answer === currentQuestion.targetNote;
    
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
              <Zap className="h-5 w-5 mr-2" />
              Whole Steps and Half Steps
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-semibold text-red-800 mb-2">Half Step (Semitone)</h3>
              <p className="text-red-700 mb-2">
                The <strong>smallest interval</strong> in Western music.
              </p>
              <p className="text-red-700 mb-2">
                On piano: From any key to the <strong>very next key</strong> (black or white).
              </p>
              <p className="text-red-700">
                Examples: C to C#, E to F, B to C
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">Whole Step (Tone)</h3>
              <p className="text-blue-700 mb-2">
                Equals <strong>two half steps</strong>.
              </p>
              <p className="text-blue-700 mb-2">
                On piano: Skip one key in between.
              </p>
              <p className="text-blue-700">
                Examples: C to D, F to G, A to B
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-800 mb-2">⚡ Critical Point</h3>
              <p className="text-yellow-700">
                This concept is the <strong>foundation</strong> for building scales and intervals. 
                Master this and everything else becomes much easier!
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Examples - Click to Hear</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <Button
                variant="outline"
                className="h-16 text-left"
                onClick={() => handleExampleClick('C', 'half')}
              >
                <div>
                  <div className="font-semibold">Half Step</div>
                  <div className="text-sm text-muted-foreground">C → C#</div>
                </div>
              </Button>
              <Button
                variant="outline"
                className="h-16 text-left"
                onClick={() => handleExampleClick('C', 'whole')}
              >
                <div>
                  <div className="font-semibold">Whole Step</div>
                  <div className="text-sm text-muted-foreground">C → D</div>
                </div>
              </Button>
              <Button
                variant="outline"
                className="h-16 text-left"
                onClick={() => handleExampleClick('E', 'half')}
              >
                <div>
                  <div className="font-semibold">Half Step</div>
                  <div className="text-sm text-muted-foreground">E → F</div>
                </div>
              </Button>
              <Button
                variant="outline"
                className="h-16 text-left"
                onClick={() => handleExampleClick('F', 'whole')}
              >
                <div>
                  <div className="font-semibold">Whole Step</div>
                  <div className="text-sm text-muted-foreground">F → G</div>
                </div>
              </Button>
            </div>

            <PianoKeyboard
              highlightedNotes={selectedNotes}
              onNoteClick={handleNoteClick}
            />
            
            {currentExample && (
              <div className="mt-4 text-center bg-muted p-3 rounded-lg">
                <p className="font-semibold">
                  {currentExample.start} → {getNextNote(currentExample.start, currentExample.interval === 'half' ? 1 : 2)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {currentExample.interval === 'half' ? 'Half Step (1 semitone)' : 'Whole Step (2 semitones)'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={onComplete} size="lg">
            I Understand Whole and Half Steps
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
            <CardTitle>Practice: Identify Intervals</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Click on different piano keys and count the steps between them. 
              Listen to how whole steps and half steps sound different.
            </p>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <Button
                variant={currentExample?.interval === 'half' ? 'default' : 'outline'}
                onClick={() => {
                  const start = CHROMATIC_NOTES[Math.floor(Math.random() * 8)]; // Use first 8 to avoid edge cases
                  handleExampleClick(start, 'half');
                }}
              >
                Practice Half Steps
              </Button>
              <Button
                variant={currentExample?.interval === 'whole' ? 'default' : 'outline'}
                onClick={() => {
                  const start = CHROMATIC_NOTES[Math.floor(Math.random() * 8)]; // Use first 8 to avoid edge cases
                  handleExampleClick(start, 'whole');
                }}
              >
                Practice Whole Steps
              </Button>
            </div>
            
            <PianoKeyboard
              highlightedNotes={selectedNotes}
              onNoteClick={handleNoteClick}
            />
            
            {currentExample && (
              <div className="mt-4 text-center bg-muted p-3 rounded-lg">
                <p className="font-semibold text-lg">
                  {currentExample.start} → {getNextNote(currentExample.start, currentExample.interval === 'half' ? 1 : 2)}
                </p>
                <p className="text-sm text-muted-foreground">
                  This is a {currentExample.interval === 'half' ? 'Half Step' : 'Whole Step'}
                </p>
              </div>
            )}
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
            <span>Test: Whole and Half Steps</span>
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
                  <p className="text-success mb-4">Excellent! You've mastered whole and half steps.</p>
                  <Button onClick={onComplete} size="lg">
                    Continue to Major Scales
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              ) : (
                <div>
                  <p className="text-warning mb-4">Keep practicing! You need 8/10 to pass.</p>
                  <Button onClick={() => {
                    setCurrentQuestionIndex(0);
                    setCorrectAnswers(0);
                  }}>
                    Retry Test
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-primary/5 p-4 rounded-lg text-center">
                <p className="text-lg mb-2">
                  What note is a <strong>{currentQuestion.interval} step</strong> up from <strong>{currentQuestion.startNote}</strong>?
                </p>
                <PianoKeyboard
                  highlightedNotes={[currentQuestion.startNote]}
                  onNoteClick={() => {}} // Disabled during test
                />
              </div>
              
              <div className="grid grid-cols-4 gap-2">
                {CHROMATIC_NOTES.map(note => (
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