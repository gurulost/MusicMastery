import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PianoKeyboard } from '@/components/PianoKeyboard';
import { CheckCircle, ArrowRight, Music, Zap, Brain, Target, Star, Trophy, Lightbulb, Play, RotateCcw } from 'lucide-react';
import { Note } from '@shared/schema';
import { audioEngine } from '@/lib/audio';

interface WholeHalfStepsLessonProps {
  section: 'learn' | 'practice' | 'test';
  onComplete: (score?: number) => void;
}

const CHROMATIC_NOTES: Note[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Helper function to get enharmonic equivalent display for buttons
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

// Helper function to get the next note by half steps
function getNextNote(note: Note, halfSteps: number): Note {
  const index = CHROMATIC_NOTES.indexOf(note);
  const nextIndex = (index + halfSteps) % CHROMATIC_NOTES.length;
  return CHROMATIC_NOTES[nextIndex];
}

// Educational examples with real song references
const INTERVAL_EXAMPLES = [
  { type: 'half', from: 'E', to: 'F', description: 'No black key between them!' },
  { type: 'half', from: 'B', to: 'C', description: 'Another natural half step' },
  { type: 'half', from: 'C', to: 'C#', description: 'White to black key' },
  { type: 'whole', from: 'C', to: 'D', description: 'Skip the black key' },
  { type: 'whole', from: 'D', to: 'E', description: 'Skip D#' },
  { type: 'whole', from: 'F', to: 'G', description: 'Skip F#' },
];

export function WholeHalfStepsLesson({ section, onComplete }: WholeHalfStepsLessonProps) {
  const [selectedNotes, setSelectedNotes] = useState<Note[]>([]);
  const [currentExample, setCurrentExample] = useState<{start: Note, interval: 'half' | 'whole'} | null>(null);
  const [practiceCount, setPracticeCount] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [testQuestions] = useState(() => {
    // Progressive difficulty: start with obvious examples
    const questions = [];
    // Start with natural half steps
    questions.push({ startNote: 'E' as Note, interval: 'half' as const });
    questions.push({ startNote: 'B' as Note, interval: 'half' as const });
    
    // Add clear whole steps
    questions.push({ startNote: 'C' as Note, interval: 'whole' as const });
    questions.push({ startNote: 'D' as Note, interval: 'whole' as const });
    
    // Mix in some challenging ones
    for (let i = 0; i < 6; i++) {
      const startNote = CHROMATIC_NOTES[Math.floor(Math.random() * 8)]; // Avoid edge cases
      const interval = Math.random() < 0.5 ? 'half' : 'whole';
      questions.push({ startNote, interval });
    }
    return questions;
  });
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showHint, setShowHint] = useState(false);

  const handleNoteClick = (note: Note) => {
    audioEngine.playNote(note, 0.8);
  };

  const handleExampleClick = (start: Note, interval: 'half' | 'whole') => {
    const target = getNextNote(start, interval === 'half' ? 1 : 2);
    setSelectedNotes([start, target]);
    setCurrentExample({ start, interval });
    setPracticeCount(prev => prev + 1);
    
    // Play the interval with educational timing
    audioEngine.playNote(start, 0.8);
    setTimeout(() => {
      audioEngine.playNote(target, 0.8);
      // Play them together for harmonic understanding
      setTimeout(() => {
        audioEngine.playNote(start, 0.6);
        audioEngine.playNote(target, 0.6);
      }, 800);
    }, 600);
  };

  const handleTestAnswer = (answer: Note) => {
    const currentQuestion = testQuestions[currentQuestionIndex];
    const correctTarget = getNextNote(currentQuestion.startNote, currentQuestion.interval === 'half' ? 1 : 2);
    const isCorrect = answer === correctTarget;
    setAttempts(prev => prev + 1);
    
    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
      // Play success sound
      audioEngine.playNote(currentQuestion.startNote, 0.8);
      setTimeout(() => audioEngine.playNote(answer, 0.8), 400);
    }

    if (currentQuestionIndex < testQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setShowHint(false);
    } else {
      if (correctAnswers + (isCorrect ? 1 : 0) >= 8) {
        const finalScore = Math.round((correctAnswers / testQuestions.length) * 100);
        onComplete(finalScore);
      }
    }
  };

  const getMasteryLevel = () => {
    const accuracy = correctAnswers / Math.max(attempts, 1);
    if (accuracy >= 0.95) return { level: 'Expert', icon: Trophy, color: 'text-purple-600' };
    if (accuracy >= 0.85) return { level: 'Proficient', icon: Star, color: 'text-green-600' };
    if (accuracy >= 0.70) return { level: 'Developing', icon: Target, color: 'text-blue-600' };
    return { level: 'Learning', icon: Brain, color: 'text-gray-600' };
  };

  if (section === 'learn') {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="h-5 w-5 mr-2" />
              Whole Steps and Half Steps: The Building Blocks of Music
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Learning Objective */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2 flex items-center">
                <Target className="h-4 w-4 mr-2" />
                Essential Learning Goals
              </h3>
              <ul className="text-blue-700 space-y-1 text-sm">
                <li>• Identify half steps (semitones) on piano and in music</li>
                <li>• Recognize whole steps (tones) and their sound</li>
                <li>• Build foundation for scales and interval construction</li>
                <li>• Understand the pattern underlying all Western music</li>
              </ul>
            </div>

            {/* Core Concept with Strong Mental Model */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-semibold text-red-800 mb-2">🔥 Half Step = Smallest Musical Distance</h3>
              <div className="space-y-3">
                <div className="bg-white p-3 rounded border">
                  <p className="font-medium text-red-800 mb-2">Think: "Next Door Neighbors"</p>
                  <p className="text-red-700 text-sm">
                    A half step goes to the very next key on the piano - no skipping!
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-red-100 p-2 rounded">
                    <p className="font-medium">White → Black</p>
                    <p className="text-xs">C to C#, D to D#</p>
                  </div>
                  <div className="bg-red-100 p-2 rounded">
                    <p className="font-medium">White → White</p>
                    <p className="text-xs">E to F, B to C</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2">💫 Whole Step = Two Half Steps</h3>
              <div className="space-y-3">
                <div className="bg-white p-3 rounded border">
                  <p className="font-medium text-green-800 mb-2">Think: "Skip One in Between"</p>
                  <p className="text-green-700 text-sm">
                    A whole step skips one key. It always equals exactly 2 half steps.
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded">
                  <p className="font-medium mb-1">Visual Pattern:</p>
                  <p className="text-xs font-mono">C → [skip C#] → D</p>
                  <p className="text-xs font-mono">F → [skip F#] → G</p>
                </div>
              </div>
            </div>

            {/* Critical Exception */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-800 mb-2">⚠️ The Two Special Cases</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-3 rounded border">
                  <p className="font-bold text-yellow-800">E → F</p>
                  <p className="text-yellow-700 text-sm">No black key between them!</p>
                  <p className="text-yellow-700 text-sm">This is a natural half step</p>
                </div>
                <div className="bg-white p-3 rounded border">
                  <p className="font-bold text-yellow-800">B → C</p>
                  <p className="text-yellow-700 text-sm">No black key between them!</p>
                  <p className="text-yellow-700 text-sm">Another natural half step</p>
                </div>
              </div>
              <p className="text-yellow-700 text-sm mt-3 font-medium">
                🧠 Memory trick: "Every Face" and "Battle Cry" - the letters with no sharps between!
              </p>
            </div>

            {/* Why This Matters */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="font-semibold text-purple-800 mb-2">🎯 Why This is Crucial</h3>
              <ul className="text-purple-700 text-sm space-y-2">
                <li>• <strong>Scales:</strong> Every scale is built with a specific pattern of whole and half steps</li>
                <li>• <strong>Intervals:</strong> All intervals are measured in half steps</li>
                <li>• <strong>Chords:</strong> Chord quality depends on half step distances</li>
                <li>• <strong>Melody:</strong> The emotional impact comes from these step relationships</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Interactive Examples */}
        <Card>
          <CardHeader>
            <CardTitle>🎹 Interactive Discovery Lab</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              <strong>Click the buttons</strong> to hear different intervals. Notice how they sound and look different on the piano.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
              {INTERVAL_EXAMPLES.map((example, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="h-16 text-left p-3"
                  onClick={() => handleExampleClick(example.from as Note, example.type as 'half' | 'whole')}
                >
                  <div>
                    <div className="font-semibold text-sm">
                      {example.from} → {getNextNote(example.from as Note, example.type === 'half' ? 1 : 2)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {example.type === 'half' ? '½' : '1'} step
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {example.description}
                    </div>
                  </div>
                </Button>
              ))}
            </div>

            <PianoKeyboard
              highlightedNotes={selectedNotes}
              onNoteClick={handleNoteClick}
            />
            
            {currentExample && (
              <div className="mt-4 text-center bg-muted p-4 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <Badge className={`${currentExample.interval === 'half' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'} mr-2`}>
                    {currentExample.interval === 'half' ? 'Half Step' : 'Whole Step'}
                  </Badge>
                  <Badge variant="outline">{currentExample.interval === 'half' ? '1 semitone' : '2 semitones'}</Badge>
                </div>
                <p className="font-bold text-lg mb-1">
                  {currentExample.start} → {getNextNote(currentExample.start, currentExample.interval === 'half' ? 1 : 2)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {currentExample.interval === 'half' ? 
                    'The smallest distance in music - very close sound' : 
                    'Larger distance - more space between the pitches'}
                </p>
                <Button
                  variant="ghost" 
                  size="sm"
                  className="mt-2"
                  onClick={() => handleExampleClick(currentExample.start, currentExample.interval)}
                >
                  <Play className="h-4 w-4 mr-1" />
                  Play Again
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={() => onComplete()} size="lg" className="bg-blue-600 hover:bg-blue-700">
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
        {/* Practice Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{practiceCount}</p>
              <p className="text-sm text-muted-foreground">Intervals Practiced</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex justify-center mb-1">
                {(() => {
                  const mastery = getMasteryLevel();
                  const IconComponent = mastery.icon;
                  return <IconComponent className={`h-5 w-5 ${mastery.color}`} />;
                })()}
              </div>
              <Badge variant="outline">{getMasteryLevel().level}</Badge>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm font-medium">Accuracy</p>
              <p className="text-lg font-bold">{Math.round((correctAnswers / Math.max(attempts, 1)) * 100)}%</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>🎯 Interactive Practice Arena</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-green-800 mb-2">Practice Strategy:</h4>
              <ol className="text-green-700 text-sm space-y-1">
                <li><strong>1. Listen:</strong> Click examples and focus on the sound difference</li>
                <li><strong>2. Visual:</strong> Notice the physical distance on the keyboard</li>
                <li><strong>3. Pattern:</strong> Half steps = next door, Whole steps = skip one</li>
                <li><strong>4. Special cases:</strong> Remember E→F and B→C are natural half steps</li>
              </ol>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <Button
                variant={currentExample?.interval === 'half' ? 'default' : 'outline'}
                onClick={() => {
                  const examples = INTERVAL_EXAMPLES.filter(ex => ex.type === 'half');
                  const randomExample = examples[Math.floor(Math.random() * examples.length)];
                  handleExampleClick(randomExample.from as Note, 'half');
                }}
                className="h-16"
              >
                <div>
                  <div className="font-semibold">Practice Half Steps</div>
                  <div className="text-xs text-muted-foreground">Next door neighbors</div>
                </div>
              </Button>
              <Button
                variant={currentExample?.interval === 'whole' ? 'default' : 'outline'}
                onClick={() => {
                  const examples = INTERVAL_EXAMPLES.filter(ex => ex.type === 'whole');
                  const randomExample = examples[Math.floor(Math.random() * examples.length)];
                  handleExampleClick(randomExample.from as Note, 'whole');
                }}
                className="h-16"
              >
                <div>
                  <div className="font-semibold">Practice Whole Steps</div>
                  <div className="text-xs text-muted-foreground">Skip one in between</div>
                </div>
              </Button>
            </div>
            
            <PianoKeyboard
              highlightedNotes={selectedNotes}
              onNoteClick={handleNoteClick}
            />
            
            {currentExample && (
              <div className="mt-4 text-center bg-muted p-4 rounded-lg">
                <Badge className={`${currentExample.interval === 'half' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'} mb-2`}>
                  {currentExample.interval === 'half' ? 'Half Step Practice' : 'Whole Step Practice'}
                </Badge>
                <p className="font-semibold text-lg mb-2">
                  {currentExample.start} → {getNextNote(currentExample.start, currentExample.interval === 'half' ? 1 : 2)}
                </p>
                <div className="flex justify-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowExplanation(!showExplanation)}
                  >
                    <Lightbulb className="h-4 w-4 mr-1" />
                    {showExplanation ? 'Hide' : 'Show'} Analysis
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExampleClick(currentExample.start, currentExample.interval)}
                  >
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Replay
                  </Button>
                </div>
                {showExplanation && (
                  <div className="mt-3 p-3 bg-blue-50 rounded text-sm">
                    <p className="font-medium mb-1">Analysis:</p>
                    <p className="text-blue-700">
                      This {currentExample.interval} step moves from {currentExample.start} to{' '}
                      {getNextNote(currentExample.start, currentExample.interval === 'half' ? 1 : 2)}.{' '}
                      {currentExample.interval === 'half' ?
                        'Notice how close these pitches sound - the smallest distance in music!' :
                        'Hear the larger gap - this skips one key in between.'
                      }
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={() => onComplete()} size="lg" className="bg-green-600 hover:bg-green-700">
            Ready for the Test
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  // Enhanced Test Section
  const isTestComplete = currentQuestionIndex >= testQuestions.length;
  const currentQuestion = testQuestions[currentQuestionIndex];
  const progressPercentage = ((currentQuestionIndex + 1) / testQuestions.length) * 100;
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>🎓 Mastery Assessment</span>
            <Badge variant="outline">
              Question {Math.min(currentQuestionIndex + 1, testQuestions.length)} of {testQuestions.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isTestComplete ? (
            <div className="text-center space-y-4">
              {correctAnswers >= 8 ? (
                <div>
                  <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-success">
                    🎉 Outstanding! Score: {correctAnswers}/{testQuestions.length}
                  </h3>
                  <Badge className="mb-4">{getMasteryLevel().level} Level Achieved</Badge>
                  <p className="text-success mb-4">
                    You've mastered whole and half steps! This foundation will make scales much easier.
                  </p>
                  <Button onClick={() => onComplete(Math.round((correctAnswers / testQuestions.length) * 100))} size="lg" className="bg-green-600 hover:bg-green-700">
                    Continue to Major Scales
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              ) : (
                <div>
                  <Target className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold">
                    Good progress! Score: {correctAnswers}/{testQuestions.length}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    You need 8/10 to advance. Focus on the patterns!
                  </p>
                  <div className="space-y-2 mb-4">
                    <p className="text-sm font-medium">Key reminders:</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Half step = next key (no skipping)</li>
                      <li>• Whole step = skip one key in between</li>
                      <li>• E→F and B→C are natural half steps</li>
                    </ul>
                  </div>
                  <Button onClick={() => {
                    setCurrentQuestionIndex(0);
                    setCorrectAnswers(0);
                    setAttempts(0);
                    setShowHint(false);
                  }}>
                    Try Again with Focus
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>

              <div className="bg-primary/5 p-6 rounded-lg text-center">
                <p className="text-lg mb-4">
                  What note is a <strong>{currentQuestion.interval} step</strong> up from <strong>{currentQuestion.startNote}</strong>?
                </p>
                <PianoKeyboard
                  highlightedNotes={[currentQuestion.startNote]}
                  onNoteClick={() => {}} // Disabled during test
                  showLabels={false} // Hide labels during tests to avoid giving away answers
                />
                <div className="mt-4 space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowHint(!showHint)}
                  >
                    <Brain className="h-4 w-4 mr-1" />
                    {showHint ? 'Hide' : 'Show'} Strategy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Play the starting note for reference
                      audioEngine.playNote(currentQuestion.startNote, 0.8);
                    }}
                  >
                    <Play className="h-4 w-4 mr-1" />
                    Hear Starting Note
                  </Button>
                </div>
                {showHint && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm">
                    <p className="font-medium mb-2">💡 Thinking Strategy:</p>
                    <div className="text-left">
                      {currentQuestion.interval === 'half' ? (
                        <div>
                          <p className="text-blue-700 mb-1">
                            <strong>Half Step:</strong> Go to the very next key
                          </p>
                          <p className="text-blue-700 text-xs">
                            • If on white key: usually to black key (unless E→F or B→C)
                          </p>
                          <p className="text-blue-700 text-xs">
                            • If on black key: always to white key
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-blue-700 mb-1">
                            <strong>Whole Step:</strong> Skip one key in between
                          </p>
                          <p className="text-blue-700 text-xs">
                            • Count: start → skip one → land here
                          </p>
                          <p className="text-blue-700 text-xs">
                            • Always equals exactly 2 half steps
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-4 gap-2">
                {CHROMATIC_NOTES.map(note => (
                  <Button
                    key={note}
                    variant="outline"
                    onClick={() => handleTestAnswer(note)}
                    className="h-12 text-sm"
                  >
                    {getEnharmonicDisplay(note)}
                  </Button>
                ))}
              </div>

              {/* Encouraging Progress Display */}
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Progress: {correctAnswers} correct • {Math.round((correctAnswers / Math.max(currentQuestionIndex, 1)) * 100)}% accuracy
                </p>
                {correctAnswers > 0 && (
                  <p className="text-xs text-green-600 mt-1">
                    Great work! Each correct answer builds your musical foundation 🎵
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}