import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PianoKeyboard } from '@/components/PianoKeyboard';
import { CheckCircle, ArrowRight, Music, Hash, Minus, Brain, Target, Star, Trophy } from 'lucide-react';
import { Note } from '@shared/schema';
import { audioEngine } from '@/lib/audio';
import { normalizeNote } from '@/lib/musicTheory';

interface MusicalAlphabetLessonProps {
  section: 'learn' | 'practice' | 'test';
  onComplete: (score?: number) => void;
}

const NATURAL_NOTES: Note[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const SHARP_NOTES: Note[] = ['C#', 'D#', 'F#', 'G#', 'A#'];

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

export function MusicalAlphabetLesson({ section, onComplete }: MusicalAlphabetLessonProps) {
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [practiceStreak, setPracticeStreak] = useState(0);
  const [masteryLevel, setMasteryLevel] = useState(0); // 0-3: Beginner, Developing, Proficient, Advanced
  const [testQuestions] = useState(() => {
    // Progressive difficulty: start with naturals, add sharps gradually
    const questions = [...NATURAL_NOTES, ...SHARP_NOTES.slice(0, 3), ...SHARP_NOTES];
    return questions.sort(() => Math.random() - 0.5).slice(0, 12);
  });
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [showHint, setShowHint] = useState(false);
  const [celebrationMode, setCelebrationMode] = useState(false);

  const handleNoteClick = (note: Note) => {
    // Piano keyboard handles audio - no duplicate audio here
    setCurrentNote(note);
    
    // Provide immediate audio feedback for note identification
    if (section === 'practice') {
      setPracticeStreak(prev => prev + 1);
      if (practiceStreak > 0 && practiceStreak % 5 === 0) {
        setCelebrationMode(true);
        setTimeout(() => setCelebrationMode(false), 2000);
      }
    }
  };

  const handleTestAnswer = async (answer: string) => {
    const currentQuestion = testQuestions[currentQuestionIndex];
    const isCorrect = answer === currentQuestion;
    const newAnswers = [...userAnswers, answer];
    setUserAnswers(newAnswers);
    setAttempts(prev => prev + 1);
    
    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
      // Provide encouraging feedback
      try {
        await audioEngine.playNote(normalizeNote(currentQuestion as Note), 0.8);
      } catch (error) {
        console.warn('Audio playback failed:', error);
      }
    }

    if (currentQuestionIndex < testQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setShowHint(false);
    } else {
      // Calculate mastery level
      const accuracy = correctAnswers / testQuestions.length;
      if (accuracy >= 0.95) setMasteryLevel(3); // Advanced
      else if (accuracy >= 0.85) setMasteryLevel(2); // Proficient
      else if (accuracy >= 0.70) setMasteryLevel(1); // Developing
      else setMasteryLevel(0); // Beginner
      
      // Only advance if sufficient mastery
      if (correctAnswers >= 10) {
        const finalScore = Math.round((correctAnswers / testQuestions.length) * 100);
        onComplete();
      }
    }
  };

  const getMasteryBadge = () => {
    const badges = [
      { level: 0, name: 'Learning', color: 'bg-gray-100 text-gray-800', icon: Target },
      { level: 1, name: 'Developing', color: 'bg-blue-100 text-blue-800', icon: Brain },
      { level: 2, name: 'Proficient', color: 'bg-green-100 text-green-800', icon: Star },
      { level: 3, name: 'Advanced', color: 'bg-purple-100 text-purple-800', icon: Trophy }
    ];
    return badges[masteryLevel];
  };

  const getEncouragingMessage = () => {
    const messages = [
      "Great start! Music is made of just 7 letter names!",
      "You're getting it! Listen to how each note sounds different.",
      "Excellent! You're building musical literacy step by step.",
      "Fantastic! You're ready for the next musical adventure!"
    ];
    return messages[masteryLevel];
  };

  if (section === 'learn') {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Music className="h-5 w-5 mr-2" />
              The Musical Alphabet: Your First Musical Language
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Learning Objective */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2 flex items-center">
                <Target className="h-4 w-4 mr-2" />
                Learning Goals
              </h3>
              <ul className="text-blue-700 space-y-1 text-sm">
                <li>• Identify all 7 natural notes (A, B, C, D, E, F, G)</li>
                <li>• Understand sharps (#) and flats (♭)</li>
                <li>• Connect note names to piano key locations</li>
                <li>• Build foundation for scales and intervals</li>
              </ul>
            </div>

            {/* Core Concept */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2">🎼 The Foundation</h3>
              <p className="text-green-700 mb-3">
                All music is built from just <strong>7 letter names</strong>: A, B, C, D, E, F, G
              </p>
              <div className="bg-white p-3 rounded border grid grid-cols-7 gap-2 text-center">
                {NATURAL_NOTES.map(note => (
                  <div key={note} className="p-2 bg-green-100 rounded font-bold text-green-800">
                    {note}
                  </div>
                ))}
              </div>
              <p className="text-green-700 mt-3 text-sm">
                <strong>Key insight:</strong> These letters repeat forever: ...F, G, A, B, C, D, E, F, G, A...
              </p>
            </div>

            {/* Mental Model */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="font-semibold text-purple-800 mb-2">🧠 Think of it Like This</h3>
              <p className="text-purple-700 mb-2">
                Imagine the musical alphabet as a <strong>circular calendar</strong>:
              </p>
              <div className="bg-white p-3 rounded border text-center">
                <div className="inline-flex items-center space-x-2 text-sm">
                  <span className="px-2 py-1 bg-purple-100 rounded">...F</span>
                  <span>→</span>
                  <span className="px-2 py-1 bg-purple-100 rounded">G</span>
                  <span>→</span>
                  <span className="px-2 py-1 bg-purple-200 rounded font-bold">A</span>
                  <span>→</span>
                  <span className="px-2 py-1 bg-purple-100 rounded">B</span>
                  <span>→</span>
                  <span className="px-2 py-1 bg-purple-100 rounded">C...</span>
                </div>
              </div>
              <p className="text-purple-700 mt-2 text-sm">
                After G comes A (not H!). It cycles endlessly, like days of the week.
              </p>
            </div>

            {/* Sharps and Flats with Visual Memory Aid */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h3 className="font-semibold text-orange-800 mb-2 flex items-center">
                <Hash className="h-4 w-4 mr-1" />
                Sharps & 
                <Minus className="h-4 w-4 mx-1" />
                Flats: The "Between" Notes
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white p-3 rounded border">
                  <p className="font-medium text-orange-800 mb-2">Sharp (#) = "Go Higher"</p>
                  <p className="text-orange-700 text-sm mb-2">Think: Sharp knife points UP ⬆️</p>
                  <p className="text-orange-700 text-sm">C# is higher than C</p>
                </div>
                <div className="bg-white p-3 rounded border">
                  <p className="font-medium text-orange-800 mb-2">Flat (♭) = "Go Lower"</p>
                  <p className="text-orange-700 text-sm mb-2">Think: Flat tire goes DOWN ⬇️</p>
                  <p className="text-orange-700 text-sm">D♭ is lower than D</p>
                </div>
              </div>
            </div>

            {/* Piano Connection */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-800 mb-2">🎹 Piano Map</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-yellow-800">White Keys = Natural Notes</p>
                  <p className="text-yellow-700">A, B, C, D, E, F, G</p>
                  <p className="text-yellow-700 text-xs mt-1">Easy to find and remember!</p>
                </div>
                <div>
                  <p className="font-medium text-yellow-800">Black Keys = Sharps/Flats</p>
                  <p className="text-yellow-700">C#, D#, F#, G#, A#</p>
                  <p className="text-yellow-700 text-xs mt-1">The "in-between" sounds</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Interactive Exploration */}
        <Card>
          <CardHeader>
            <CardTitle>🎯 Interactive Discovery</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              <strong>Click each key</strong> to hear its sound and see its name. Notice the pattern!
            </p>
            
            <PianoKeyboard
              onNoteClick={handleNoteClick}
              highlightedNotes={currentNote ? [currentNote] : []}
            />
            
            <div className="mt-4">
              {currentNote && (
                <div className="bg-muted p-4 rounded-lg text-center">
                  <p className="font-bold text-2xl mb-2">{currentNote}</p>
                  <Badge variant="outline" className="mb-2">
                    {NATURAL_NOTES.includes(currentNote) ? 'Natural Note' : 'Sharp/Flat Note'}
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    {NATURAL_NOTES.includes(currentNote) ? 
                      `Letter name: ${currentNote} • Piano: White key` : 
                      `Modified note: ${currentNote} • Piano: Black key`
                    }
                  </p>
                </div>
              )}
              {!currentNote && (
                <div className="text-center p-4 text-muted-foreground">
                  👆 Click any piano key above to start exploring
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={() => onComplete()} size="lg" className="bg-blue-600 hover:bg-blue-700">
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
        {/* Progress Tracking */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{practiceStreak}</p>
              <p className="text-sm text-muted-foreground">Notes Explored</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex justify-center mb-1">
                {(() => {
                  const badge = getMasteryBadge();
                  const IconComponent = badge.icon;
                  return IconComponent && <IconComponent className="h-5 w-5" />;
                })()}
              </div>
              <Badge className={getMasteryBadge().color}>{getMasteryBadge().name}</Badge>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              {celebrationMode && (
                <div className="text-2xl">🎉</div>
              )}
              <p className="text-xs text-muted-foreground">Keep exploring!</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>🎯 Free Exploration Mode</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-green-800 mb-2">Practice Strategy:</h4>
              <ol className="text-green-700 text-sm space-y-1">
                <li><strong>1. Listen:</strong> Click each key and hear its unique sound</li>
                <li><strong>2. Pattern:</strong> Notice how white keys = letters, black keys = sharps</li>
                <li><strong>3. Memory:</strong> Try to remember where each note is located</li>
                <li><strong>4. Speed:</strong> Practice finding notes quickly</li>
              </ol>
            </div>
            
            <PianoKeyboard
              onNoteClick={handleNoteClick}
              highlightedNotes={currentNote ? [currentNote] : []}
            />
            
            <div className="mt-4">
              {currentNote && (
                <div className="text-center bg-muted p-4 rounded-lg">
                  <p className="font-bold text-xl mb-1">{currentNote}</p>
                  <p className="text-sm text-muted-foreground">
                    {NATURAL_NOTES.includes(currentNote) ? 
                      `Natural note #${NATURAL_NOTES.indexOf(currentNote) + 1} in the alphabet` : 
                      `Sharp note - between natural notes`
                    }
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    💡 {getEncouragingMessage()}
                  </p>
                </div>
              )}
            </div>
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

  // Test section with enhanced pedagogy
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
              {correctAnswers >= 10 ? (
                <div>
                  <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-success">
                    🎉 Excellent! Score: {correctAnswers}/{testQuestions.length}
                  </h3>
                  <Badge className="mb-4">{getMasteryBadge().name} Level Achieved</Badge>
                  <p className="text-success mb-4">
                    You've mastered the musical alphabet! You can identify notes quickly and accurately.
                  </p>
                  <Button onClick={() => onComplete(Math.round((correctAnswers / testQuestions.length) * 100))} size="lg" className="bg-green-600 hover:bg-green-700">
                    Continue to Whole & Half Steps
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              ) : (
                <div>
                  <Target className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold">
                    Good effort! Score: {correctAnswers}/{testQuestions.length}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    You need 10/12 to advance. Let's practice more!
                  </p>
                  <div className="space-y-2 mb-4">
                    <p className="text-sm font-medium">What to focus on:</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Spend more time clicking keys and listening</li>
                      <li>• Practice identifying black keys (sharps)</li>
                      <li>• Remember: white keys = A, B, C, D, E, F, G</li>
                    </ul>
                  </div>
                  <Button onClick={() => {
                    setCurrentQuestionIndex(0);
                    setCorrectAnswers(0);
                    setUserAnswers([]);
                    setAttempts(0);
                  }}>
                    Try Again
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Progress indicator */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>

              <div className="bg-primary/5 p-6 rounded-lg text-center">
                <p className="text-lg mb-4">
                  What note is highlighted on the piano?
                </p>
                <PianoKeyboard
                  highlightedNotes={currentQuestion ? [currentQuestion] : []}
                  onNoteClick={() => {}} // Disabled during test
                  showLabels={false} // Hide labels during tests to avoid giving away answers
                />
                <div className="mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowHint(!showHint)}
                  >
                    <Brain className="h-4 w-4 mr-1" />
                    {showHint ? 'Hide' : 'Show'} Hint
                  </Button>
                  {showHint && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg text-sm">
                      <p className="font-medium mb-1">💡 Hint:</p>
                      <p className="text-blue-700">
                        {NATURAL_NOTES.includes(currentQuestion) ? 
                          `This is a white key. Natural notes are: ${NATURAL_NOTES.join(', ')}` :
                          `This is a black key (sharp). Black keys are between white keys.`
                        }
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-4 gap-2">
                {[...NATURAL_NOTES, ...SHARP_NOTES].sort().map(note => (
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

              {/* Encouraging feedback */}
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  💪 {Math.round((correctAnswers / Math.max(currentQuestionIndex, 1)) * 100)}% accuracy so far
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}