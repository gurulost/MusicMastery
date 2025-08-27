import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PianoKeyboard } from '@/components/PianoKeyboard';
import { CheckCircle, ArrowRight, Music, ArrowUp, ArrowDown, Calculator } from 'lucide-react';
import { Note, IntervalType } from '@shared/schema';
import { audioEngine } from '@/lib/audio';
import { INTERVALS, buildInterval } from '@/lib/musicTheory';

interface BuildingIntervalsLessonProps {
  section: 'learn' | 'practice' | 'test';
  onComplete: () => void;
}

const PRACTICE_INTERVALS: IntervalType[] = [
  'Major 2nd', 'Minor 3rd', 'Major 3rd', 'Perfect 4th', 
  'Perfect 5th', 'Minor 6th', 'Major 6th', 'Perfect Octave'
];

const START_NOTES: Note[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

export function BuildingIntervalsLesson({ section, onComplete }: BuildingIntervalsLessonProps) {
  const [currentExercise, setCurrentExercise] = useState<{
    startNote: Note;
    interval: IntervalType;
    direction: 'up' | 'down';
    targetNote: Note;
  } | null>(null);
  const [selectedNotes, setSelectedNotes] = useState<Note[]>([]);
  const [showSteps, setShowSteps] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [testQuestions] = useState(() => {
    const questions = [];
    for (let i = 0; i < 10; i++) {
      const startNote = START_NOTES[Math.floor(Math.random() * START_NOTES.length)];
      const interval = PRACTICE_INTERVALS[Math.floor(Math.random() * PRACTICE_INTERVALS.length)];
      const direction = Math.random() < 0.8 ? 'up' : 'down'; // Mostly up for simplicity
      const targetNote = buildInterval(startNote, interval, direction);
      questions.push({ startNote, interval, direction, targetNote });
    }
    return questions;
  });
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const handleNoteClick = (note: Note) => {
    audioEngine.playNote(note, 0.8);
  };

  const generateExercise = () => {
    const startNote = START_NOTES[Math.floor(Math.random() * START_NOTES.length)];
    const interval = PRACTICE_INTERVALS[Math.floor(Math.random() * PRACTICE_INTERVALS.length)];
    const direction: 'up' | 'down' = 'up'; // Start with up only for simplicity
    const targetNote = buildInterval(startNote, interval, direction);
    
    const exercise = { startNote, interval, direction, targetNote };
    setCurrentExercise(exercise);
    setSelectedNotes([startNote]);
  };

  const showAnswer = () => {
    if (currentExercise) {
      setSelectedNotes([currentExercise.startNote, currentExercise.targetNote]);
      audioEngine.playNote(currentExercise.startNote, 0.8);
      setTimeout(() => {
        audioEngine.playNote(currentExercise.targetNote, 0.8);
      }, 600);
    }
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
      if (correctAnswers + (isCorrect ? 1 : 0) >= 7) {
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
              Building Intervals Up and Down
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">The Building Process</h3>
              <p className="text-blue-700 mb-3">
                Building an interval means finding the note that is a specific distance away from your starting note.
              </p>
              <div className="bg-white p-3 rounded border">
                <p className="font-medium mb-2">Step-by-Step Method:</p>
                <ol className="text-sm space-y-1 text-blue-700">
                  <li><strong>1.</strong> Start with your given note</li>
                  <li><strong>2.</strong> Count the letter names for the interval number</li>
                  <li><strong>3.</strong> Count semitones to get the correct quality</li>
                  <li><strong>4.</strong> Add sharps/flats as needed</li>
                </ol>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2 flex items-center">
                <ArrowUp className="h-4 w-4 mr-1" />
                Building Up Example: Perfect 5th from C
              </h3>
              <div className="space-y-2 text-sm">
                <p className="text-green-700"><strong>Step 1:</strong> Start on C</p>
                <p className="text-green-700"><strong>Step 2:</strong> Count 5 letters: C-D-E-F-G</p>
                <p className="text-green-700"><strong>Step 3:</strong> Perfect 5th = 7 semitones</p>
                <p className="text-green-700"><strong>Step 4:</strong> C + 7 semitones = G ✓</p>
              </div>
              <div className="mt-3 p-2 bg-white rounded border text-center">
                <strong>Answer: G</strong>
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="font-semibold text-purple-800 mb-2 flex items-center">
                <ArrowUp className="h-4 w-4 mr-1" />
                Building Up Example: Major 3rd from F
              </h3>
              <div className="space-y-2 text-sm">
                <p className="text-purple-700"><strong>Step 1:</strong> Start on F</p>
                <p className="text-purple-700"><strong>Step 2:</strong> Count 3 letters: F-G-A</p>
                <p className="text-purple-700"><strong>Step 3:</strong> Major 3rd = 4 semitones</p>
                <p className="text-purple-700"><strong>Step 4:</strong> F + 4 semitones = A ✓</p>
              </div>
              <div className="mt-3 p-2 bg-white rounded border text-center">
                <strong>Answer: A</strong>
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h3 className="font-semibold text-orange-800 mb-2 flex items-center">
                <ArrowDown className="h-4 w-4 mr-1" />
                Building Down (Advanced)
              </h3>
              <p className="text-orange-700 mb-2">
                Building intervals down uses the same process, but you count backwards.
              </p>
              <p className="text-orange-700 text-sm">
                <strong>Tip:</strong> You can also think of it as "what note, when you build UP to my starting note, gives me this interval?"
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-800 mb-2">💡 Quick Reference</h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="font-medium">Perfect Intervals:</p>
                  <p>P1 = 0, P4 = 5, P5 = 7, P8 = 12</p>
                </div>
                <div>
                  <p className="font-medium">Major Intervals:</p>
                  <p>M2 = 2, M3 = 4, M6 = 9, M7 = 11</p>
                </div>
                <div>
                  <p className="font-medium">Minor Intervals:</p>
                  <p>m2 = 1, m3 = 3, m6 = 8, m7 = 10</p>
                </div>
                <div>
                  <p className="font-medium">Other:</p>
                  <p>Tritone = 6</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={onComplete} size="lg">
            I Understand Building Intervals
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
            <CardTitle>Practice: Build Intervals</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Practice building intervals from different starting notes. Click "New Exercise" to get a new challenge.
            </p>
            
            <div className="flex items-center space-x-4 mb-4">
              <Button onClick={generateExercise} variant="default">
                New Exercise
              </Button>
              <Button 
                onClick={() => setShowSteps(!showSteps)} 
                variant="outline"
                disabled={!currentExercise}
              >
                <Calculator className="h-4 w-4 mr-2" />
                {showSteps ? 'Hide' : 'Show'} Steps
              </Button>
              <Button 
                onClick={showAnswer} 
                variant="secondary"
                disabled={!currentExercise}
              >
                Show Answer
              </Button>
            </div>

            {currentExercise && (
              <div className="bg-primary/5 p-4 rounded-lg mb-4">
                <p className="text-lg font-semibold text-center mb-2">
                  Build a <strong>{currentExercise.interval}</strong> {currentExercise.direction} from <strong>{currentExercise.startNote}</strong>
                </p>
                
                {showSteps && (
                  <div className="mt-3 p-3 bg-blue-50 rounded text-sm">
                    <p className="font-medium mb-2">Solution Steps:</p>
                    <ol className="space-y-1">
                      <li>1. Starting note: {currentExercise.startNote}</li>
                      <li>2. Interval: {currentExercise.interval}</li>
                      <li>3. Direction: {currentExercise.direction}</li>
                      <li>4. Target note: {currentExercise.targetNote}</li>
                    </ol>
                  </div>
                )}
              </div>
            )}
            
            <PianoKeyboard
              highlightedNotes={selectedNotes}
              onNoteClick={handleNoteClick}
            />
            
            {currentExercise && selectedNotes.length === 2 && (
              <div className="mt-4 text-center bg-success/10 p-3 rounded-lg border border-success">
                <p className="font-semibold text-success">
                  ✓ Correct! {currentExercise.startNote} → {currentExercise.targetNote} is a {currentExercise.interval}
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
            <span>Test: Building Intervals</span>
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
              {correctAnswers >= 7 ? (
                <div>
                  <p className="text-success mb-4">🎉 Congratulations! You've mastered all 7 steps of music theory!</p>
                  <Button onClick={onComplete} size="lg">
                    Complete Learning Journey
                    <CheckCircle className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              ) : (
                <div>
                  <p className="text-warning mb-4">Keep practicing! You need 7/10 to pass.</p>
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
                <p className="text-lg mb-4">
                  What note is a <strong>{currentQuestion.interval}</strong> {currentQuestion.direction} from <strong>{currentQuestion.startNote}</strong>?
                </p>
                <PianoKeyboard
                  highlightedNotes={[currentQuestion.startNote]}
                  onNoteClick={() => {}}
                />
                <p className="text-sm text-muted-foreground mt-2">Starting note highlighted</p>
              </div>
              
              <div className="grid grid-cols-4 gap-2">
                {['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].map(note => (
                  <Button
                    key={note}
                    variant="outline"
                    onClick={() => handleTestAnswer(note as Note)}
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