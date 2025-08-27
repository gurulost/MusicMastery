import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PianoKeyboard } from '@/components/PianoKeyboard';
import { CheckCircle, ArrowRight, Music, Play, Calculator, Lightbulb } from 'lucide-react';
import { Note, IntervalType } from '@shared/schema';
import { audioEngine } from '@/lib/audio';
import { INTERVALS, buildInterval } from '@/lib/musicTheory';

interface UnderstandingIntervalsLessonProps {
  section: 'learn' | 'practice' | 'test';
  onComplete: () => void;
}

// Common intervals with explanations
const BASIC_INTERVALS = [
  {
    name: 'Perfect Unison' as IntervalType,
    semitones: 0,
    description: 'Same note',
    example: { from: 'C' as Note, to: 'C' as Note }
  },
  {
    name: 'Minor 2nd' as IntervalType,
    semitones: 1,
    description: 'Half step up',
    example: { from: 'C' as Note, to: 'C#' as Note }
  },
  {
    name: 'Major 2nd' as IntervalType,
    semitones: 2,
    description: 'Whole step up',
    example: { from: 'C' as Note, to: 'D' as Note }
  },
  {
    name: 'Minor 3rd' as IntervalType,
    semitones: 3,
    description: 'Foundation of minor chords',
    example: { from: 'C' as Note, to: 'D#' as Note }
  },
  {
    name: 'Major 3rd' as IntervalType,
    semitones: 4,
    description: 'Foundation of major chords',
    example: { from: 'C' as Note, to: 'E' as Note }
  },
  {
    name: 'Perfect 4th' as IntervalType,
    semitones: 5,
    description: 'Very stable sound',
    example: { from: 'C' as Note, to: 'F' as Note }
  },
  {
    name: 'Perfect 5th' as IntervalType,
    semitones: 7,
    description: 'Most consonant after octave',
    example: { from: 'C' as Note, to: 'G' as Note }
  },
  {
    name: 'Perfect Octave' as IntervalType,
    semitones: 12,
    description: 'Same note, higher register',
    example: { from: 'C' as Note, to: 'C' as Note }
  }
];

export function UnderstandingIntervalsLesson({ section, onComplete }: UnderstandingIntervalsLessonProps) {
  const [selectedInterval, setSelectedInterval] = useState<typeof BASIC_INTERVALS[0]>(BASIC_INTERVALS[0]);
  const [selectedNotes, setSelectedNotes] = useState<Note[]>([]);
  const [showSemitones, setShowSemitones] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [testQuestions] = useState(() => {
    return BASIC_INTERVALS.sort(() => Math.random() - 0.5).slice(0, 8);
  });
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const handleNoteClick = (note: Note) => {
    audioEngine.playNote(note, 0.8);
  };

  const handleIntervalDemo = (interval: typeof BASIC_INTERVALS[0]) => {
    setSelectedInterval(interval);
    setSelectedNotes([interval.example.from, interval.example.to]);
    
    // Play the interval
    audioEngine.playNote(interval.example.from, 0.8);
    setTimeout(() => {
      audioEngine.playNote(interval.example.to, 0.8);
    }, 600);
  };

  const handleTestAnswer = (answer: number) => {
    const currentQuestion = testQuestions[currentQuestionIndex];
    const isCorrect = answer === currentQuestion.semitones;
    
    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
    }

    if (currentQuestionIndex < testQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      if (correctAnswers + (isCorrect ? 1 : 0) >= 6) {
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
              Understanding Musical Intervals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">What is an Interval?</h3>
              <p className="text-blue-700 mb-3">
                An interval is the <strong>distance between two notes</strong>. It's measured in semitones (half steps).
              </p>
              <p className="text-blue-700 mb-3">
                Intervals are the building blocks of harmony, melody, and chord construction.
              </p>
              <p className="text-blue-700">
                Understanding intervals helps you analyze music, build chords, and improve your ear training!
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2 flex items-center">
                <Calculator className="h-4 w-4 mr-1" />
                How to Measure Intervals
              </h3>
              <p className="text-green-700 mb-2">
                <strong>Step 1:</strong> Count the letter names (including both start and end notes)
              </p>
              <p className="text-green-700 mb-2">
                <strong>Step 2:</strong> Count the semitones (half steps) to determine quality
              </p>
              <div className="bg-white p-3 rounded border text-sm">
                <p><strong>Example:</strong> C to G</p>
                <p>• Letter count: C-D-E-F-G = 5th</p>
                <p>• Semitone count: C(0)-C#(1)-D(2)-D#(3)-E(4)-F(5)-F#(6)-G(7) = 7 semitones</p>
                <p>• Result: Perfect 5th</p>
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="font-semibold text-purple-800 mb-2">Interval Qualities</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="font-medium text-purple-700">Perfect Intervals:</p>
                  <p className="text-purple-600">Unison, 4th, 5th, Octave</p>
                </div>
                <div>
                  <p className="font-medium text-purple-700">Major/Minor Intervals:</p>
                  <p className="text-purple-600">2nd, 3rd, 6th, 7th</p>
                </div>
              </div>
              <p className="text-purple-700 mt-2 text-sm">
                Perfect intervals sound the most stable, while major/minor intervals create more tension and resolution.
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-800 mb-2">🎵 Interval Recognition Tips</h3>
              <p className="text-yellow-700 text-sm">
                • <strong>Perfect 5th:</strong> "Twinkle Twinkle Little Star" (first two notes)
                <br />
                • <strong>Perfect 4th:</strong> "Here Comes the Bride" (first two notes)
                <br />
                • <strong>Major 3rd:</strong> "When the Saints Go Marching In" (first two notes)
                <br />
                • <strong>Octave:</strong> "Somewhere Over the Rainbow" (first two notes)
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Interactive Interval Examples</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {BASIC_INTERVALS.map(interval => (
                <Button
                  key={interval.name}
                  variant={selectedInterval.name === interval.name ? 'default' : 'outline'}
                  className="h-16 text-left"
                  onClick={() => handleIntervalDemo(interval)}
                >
                  <div>
                    <div className="font-semibold text-sm">{interval.name}</div>
                    <div className="text-xs text-muted-foreground">{interval.description}</div>
                  </div>
                </Button>
              ))}
            </div>

            <div className="mb-4">
              <Button
                variant="outline"
                onClick={() => setShowSemitones(!showSemitones)}
              >
                <Lightbulb className="h-4 w-4 mr-2" />
                {showSemitones ? 'Hide' : 'Show'} Semitone Count
              </Button>
            </div>

            <PianoKeyboard
              highlightedNotes={selectedNotes}
              onNoteClick={handleNoteClick}
            />
            
            <div className="mt-4 text-center bg-muted p-3 rounded-lg">
              <p className="font-semibold text-lg">{selectedInterval.name}</p>
              <p className="text-sm text-muted-foreground mb-2">
                From {selectedInterval.example.from} to {selectedInterval.example.to}
              </p>
              <p className="text-sm">{selectedInterval.description}</p>
              {showSemitones && (
                <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                  Distance: {selectedInterval.semitones} semitones
                </div>
              )}
              <Button
                variant="secondary"
                size="sm"
                className="mt-2"
                onClick={() => handleIntervalDemo(selectedInterval)}
              >
                <Play className="h-4 w-4 mr-1" />
                Play Again
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={onComplete} size="lg">
            I Understand Musical Intervals
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
            <CardTitle>Practice: Interval Recognition</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Practice identifying intervals by sight and sound. Click on different intervals to hear them.
            </p>
            
            <div className="grid grid-cols-2 gap-2 mb-4">
              {BASIC_INTERVALS.map(interval => (
                <Button
                  key={interval.name}
                  variant="outline"
                  onClick={() => handleIntervalDemo(interval)}
                  className="h-14 text-left"
                >
                  <div>
                    <div className="font-semibold text-sm">{interval.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {interval.semitones} semitones
                    </div>
                  </div>
                </Button>
              ))}
            </div>
            
            <PianoKeyboard
              highlightedNotes={selectedNotes}
              onNoteClick={handleNoteClick}
            />
            
            <div className="mt-4 text-center bg-muted p-3 rounded-lg">
              <p className="font-semibold text-lg">{selectedInterval.name}</p>
              <p className="text-sm text-muted-foreground">
                {selectedInterval.semitones} semitones • {selectedInterval.description}
              </p>
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
            <span>Test: Understanding Intervals</span>
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
              {correctAnswers >= 6 ? (
                <div>
                  <p className="text-success mb-4">Excellent! You understand intervals.</p>
                  <Button onClick={onComplete} size="lg">
                    Continue to Building Intervals
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              ) : (
                <div>
                  <p className="text-warning mb-4">Keep practicing! You need 6/8 to pass.</p>
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
                  How many semitones are in a <strong>{currentQuestion.name}</strong>?
                </p>
                <PianoKeyboard
                  highlightedNotes={[currentQuestion.example.from, currentQuestion.example.to]}
                  onNoteClick={() => {}}
                />
                <p className="text-sm text-muted-foreground mt-2">
                  From {currentQuestion.example.from} to {currentQuestion.example.to}
                </p>
              </div>
              
              <div className="grid grid-cols-4 gap-2">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(num => (
                  <Button
                    key={num}
                    variant="outline"
                    onClick={() => handleTestAnswer(num)}
                    className="h-12"
                  >
                    {num}
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