import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PianoKeyboard } from '@/components/PianoKeyboard';
import { CheckCircle, ArrowRight, Music, Play, ArrowUp, ArrowDown, Calculator, Lightbulb, Brain, Target, Star, Trophy, Zap, Settings, BookOpen } from 'lucide-react';
import { Note, IntervalType } from '@shared/schema';
import { audioEngine } from '@/lib/audio';
import { INTERVALS, buildInterval, getIntervalExplanation } from '@/lib/musicTheory';

interface BuildingIntervalsLessonProps {
  section: 'learn' | 'practice' | 'test';
  onComplete: (score?: number) => void;
}

// Progressive difficulty intervals for practice
const BEGINNER_INTERVALS: IntervalType[] = ['Major 2nd', 'Major 3rd', 'Perfect 4th', 'Perfect 5th', 'Perfect Octave'];
const INTERMEDIATE_INTERVALS: IntervalType[] = ['Minor 2nd', 'Minor 3rd', 'Perfect 4th', 'Tritone', 'Minor 6th', 'Major 6th'];
const ADVANCED_INTERVALS: IntervalType[] = ['Minor 7th', 'Major 7th', 'Minor 6th', 'Major 6th', 'Tritone'];

// Starting notes for exercises
const PRACTICE_NOTES: Note[] = ['C', 'D', 'E', 'F', 'G', 'A'];

// Helper function to get enharmonic equivalent display for buttons
const getEnharmonicDisplay = (note: string): string => {
  const enharmonics: Record<string, string> = {
    'C#': 'C#/Db',
    'D#': 'D#/Eb', 
    'F#': 'F#/Gb',
    'G#': 'G#/Ab',
    'A#': 'A#/Bb'
  };
  return enharmonics[note] || note;
};

// Interval construction strategies
const CONSTRUCTION_STRATEGIES = {
  'Perfect Unison': 'Same note - no counting needed, 0 half steps',
  'Major 2nd': 'Count 2 half steps (1 whole step) up from the starting note',
  'Minor 2nd': 'Count 1 half step up - the very next key on piano',
  'Major 3rd': 'Count 4 half steps - this creates the "happy" sound in major chords',
  'Minor 3rd': 'Count 3 half steps - this creates the "sad" sound in minor chords',
  'Perfect 4th': 'Count 5 half steps - very stable, used in folk music',
  'Tritone': 'Count 6 half steps - exactly halfway to octave, very unstable',
  'Perfect 5th': 'Count 7 half steps - most consonant interval after octave',
  'Minor 6th': 'Count 8 half steps - bittersweet, romantic sound',
  'Major 6th': 'Count 9 half steps - bright and open sound',
  'Minor 7th': 'Count 10 half steps - adds jazzy tension to chords',
  'Major 7th': 'Count 11 half steps - very dissonant, wants to resolve',
  'Perfect Octave': 'Count 12 half steps - same note, higher register'
};

export function BuildingIntervalsLesson({ section, onComplete }: BuildingIntervalsLessonProps) {
  const [currentExercise, setCurrentExercise] = useState<{
    startNote: Note;
    interval: IntervalType;
    direction: 'up' | 'down';
    targetNote: Note;
  } | null>(null);
  const [selectedNotes, setSelectedNotes] = useState<Note[]>([]);
  const [difficultyLevel, setDifficultyLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [practiceCount, setPracticeCount] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [showStrategy, setShowStrategy] = useState(false);
  const [testQuestions] = useState(() => {
    // Progressive test starting with fundamentals
    const questions = [];
    
    // Basic construction skills
    questions.push({ startNote: 'C' as Note, interval: 'Major 3rd' as IntervalType, direction: 'up' as const });
    questions.push({ startNote: 'C' as Note, interval: 'Perfect 5th' as IntervalType, direction: 'up' as const });
    questions.push({ startNote: 'G' as Note, interval: 'Major 2nd' as IntervalType, direction: 'up' as const });
    questions.push({ startNote: 'F' as Note, interval: 'Perfect 4th' as IntervalType, direction: 'up' as const });
    
    // Intermediate challenges
    questions.push({ startNote: 'D' as Note, interval: 'Minor 3rd' as IntervalType, direction: 'up' as const });
    questions.push({ startNote: 'A' as Note, interval: 'Perfect 5th' as IntervalType, direction: 'up' as const });
    questions.push({ startNote: 'E' as Note, interval: 'Major 6th' as IntervalType, direction: 'up' as const });
    questions.push({ startNote: 'C' as Note, interval: 'Minor 7th' as IntervalType, direction: 'up' as const });
    
    return questions;
  });
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showHint, setShowHint] = useState(false);

  const handleNoteClick = async (note: Note) => {
    try {
      await audioEngine.playNote(note, 0.8);
    } catch (error) {
      console.warn('Audio playback failed:', error);
    }
  };

  const generateExercise = () => {
    const intervalSet = difficultyLevel === 'beginner' ? BEGINNER_INTERVALS :
                       difficultyLevel === 'intermediate' ? INTERMEDIATE_INTERVALS : ADVANCED_INTERVALS;
    
    const startNote = PRACTICE_NOTES[Math.floor(Math.random() * PRACTICE_NOTES.length)];
    const interval = intervalSet[Math.floor(Math.random() * intervalSet.length)];
    const direction: 'up' | 'down' = 'up'; // Focus on ascending intervals first
    const targetNote = buildInterval(startNote, interval, direction);
    
    const exercise = { startNote, interval, direction, targetNote };
    setCurrentExercise(exercise);
    setSelectedNotes([startNote]);
    setPracticeCount(prev => prev + 1);
  };

  const showAnswer = async () => {
    if (currentExercise) {
      setSelectedNotes([currentExercise.startNote, currentExercise.targetNote]);
      
      // Educational audio sequence
      try {
        await audioEngine.playNote(currentExercise.startNote, 0.8);
        setTimeout(async () => {
          try {
            await audioEngine.playNote(currentExercise.targetNote, 0.8);
            // Play them together to hear the harmony
            setTimeout(async () => {
              try {
                await audioEngine.playNote(currentExercise.startNote, 0.6);
                await audioEngine.playNote(currentExercise.targetNote, 0.6);
              } catch (error) {
                console.warn('Audio playback failed:', error);
              }
            }, 800);
          } catch (error) {
            console.warn('Audio playback failed:', error);
          }
        }, 600);
      } catch (error) {
        console.warn('Audio playback failed:', error);
      }
    }
  };

  const handleTestAnswer = async (answer: Note) => {
    const currentQuestion = testQuestions[currentQuestionIndex];
    const correctTarget = buildInterval(currentQuestion.startNote, currentQuestion.interval, currentQuestion.direction);
    const isCorrect = answer === correctTarget;
    setAttempts(prev => prev + 1);
    
    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
      // Play success audio - the interval
      try {
        await audioEngine.playNote(currentQuestion.startNote, 0.8);
        setTimeout(async () => {
          try {
            await audioEngine.playNote(answer, 0.8);
          } catch (error) {
            console.warn('Audio playback failed:', error);
          }
        }, 400);
      } catch (error) {
        console.warn('Audio playback failed:', error);
      }
    }

    if (currentQuestionIndex < testQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setShowHint(false);
    } else {
      if (correctAnswers + (isCorrect ? 1 : 0) >= 6) {
        const finalScore = Math.round(((correctAnswers + (isCorrect ? 1 : 0)) / testQuestions.length) * 100);
        onComplete(finalScore);
      }
    }
  };

  const getMasteryLevel = () => {
    const accuracy = correctAnswers / Math.max(attempts, 1);
    if (accuracy >= 0.95) return { level: 'Interval Builder', icon: Trophy, color: 'text-yellow-600' };
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
              <Settings className="h-5 w-5 mr-2" />
              Building Intervals: From Theory to Practice
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Learning Objectives */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2 flex items-center">
                <Target className="h-4 w-4 mr-2" />
                Final Mastery Goals
              </h3>
              <ul className="text-blue-700 space-y-1 text-sm">
                <li>• Construct any interval from any starting note</li>
                <li>• Use the semitone counting method accurately</li>
                <li>• Apply interval knowledge to chord construction</li>
                <li>• Recognize intervals by both sight and sound</li>
              </ul>
            </div>

            {/* Core Concept - The Construction Process */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-3">🔧 The Universal Construction Method</h3>
              <div className="space-y-3">
                <div className="bg-white p-3 rounded border">
                  <p className="font-medium text-green-800 mb-2">3-Step Process:</p>
                  <ol className="text-green-700 text-sm space-y-1">
                    <li><strong>1. Start:</strong> Identify your starting note</li>
                    <li><strong>2. Count:</strong> Count the exact number of semitones up</li>
                    <li><strong>3. Land:</strong> The note you land on is your target</li>
                  </ol>
                </div>
                <div className="bg-green-100 p-3 rounded">
                  <p className="font-medium text-green-800 mb-1">Key Formula:</p>
                  <p className="text-green-700 text-sm">
                    <strong>Starting Note + Semitone Distance = Target Note</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* Worked Example - Major 3rd from C */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="font-semibold text-purple-800 mb-3">📝 Worked Example: Major 3rd from C</h3>
              <div className="space-y-3">
                <div className="bg-white p-3 rounded border">
                  <p className="font-medium text-purple-800 mb-2">Step-by-Step Construction:</p>
                  <div className="space-y-2 text-purple-700 text-sm">
                    <p><strong>Goal:</strong> Build a Major 3rd starting from C</p>
                    <p><strong>Distance:</strong> Major 3rd = 4 semitones</p>
                    <p><strong>Count:</strong> C → C# (1) → D (2) → D# (3) → E (4)</p>
                    <p><strong>Result:</strong> C + Major 3rd = E</p>
                  </div>
                </div>
                <div className="grid grid-cols-5 gap-1 text-center text-xs">
                  <div className="bg-blue-100 p-2 rounded font-bold">C</div>
                  <div className="bg-gray-100 p-2 rounded">+1</div>
                  <div className="bg-gray-100 p-2 rounded">+2</div>
                  <div className="bg-gray-100 p-2 rounded">+3</div>
                  <div className="bg-blue-100 p-2 rounded font-bold">E</div>
                </div>
                <p className="text-purple-700 text-sm">
                  <strong>Musical Result:</strong> C to E creates the foundation of the C Major chord!
                </p>
              </div>
            </div>

            {/* Practical Strategies */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-800 mb-3">⚡ Quick Construction Strategies</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="bg-white p-3 rounded border">
                    <p className="font-medium text-yellow-800 text-sm">Perfect Intervals</p>
                    <p className="text-yellow-700 text-xs mb-1">Unison=0, 4th=5, 5th=7, Octave=12</p>
                    <p className="text-yellow-700 text-xs">Always sound stable and "complete"</p>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <p className="font-medium text-yellow-800 text-sm">Major vs Minor</p>
                    <p className="text-yellow-700 text-xs mb-1">Major 3rd=4, Minor 3rd=3</p>
                    <p className="text-yellow-700 text-xs">Just 1 semitone difference changes everything!</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="bg-white p-3 rounded border">
                    <p className="font-medium text-yellow-800 text-sm">Memorize Common Ones</p>
                    <p className="text-yellow-700 text-xs mb-1">2nd=2, 3rd=4, 4th=5, 5th=7</p>
                    <p className="text-yellow-700 text-xs">These form the backbone of all chords</p>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <p className="font-medium text-yellow-800 text-sm">The Special Tritone</p>
                    <p className="text-yellow-700 text-xs mb-1">Tritone=6 (exactly half an octave)</p>
                    <p className="text-yellow-700 text-xs">Creates maximum tension and drama</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Application to Chords */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h3 className="font-semibold text-orange-800 mb-3">🎸 Real-World Application: Chord Building</h3>
              <div className="space-y-3">
                <div className="bg-white p-3 rounded border">
                  <p className="font-medium text-orange-800 mb-2">Major Chords = 1st + Major 3rd + Perfect 5th</p>
                  <p className="text-orange-700 text-sm mb-1">
                    <strong>C Major:</strong> C (root) + E (Major 3rd) + G (Perfect 5th)
                  </p>
                  <p className="text-orange-700 text-sm">
                    <strong>Pattern:</strong> 0 semitones + 4 semitones + 7 semitones
                  </p>
                </div>
                <div className="bg-white p-3 rounded border">
                  <p className="font-medium text-orange-800 mb-2">Minor Chords = 1st + Minor 3rd + Perfect 5th</p>
                  <p className="text-orange-700 text-sm mb-1">
                    <strong>C Minor:</strong> C (root) + Eb (Minor 3rd) + G (Perfect 5th)
                  </p>
                  <p className="text-orange-700 text-sm">
                    <strong>Pattern:</strong> 0 semitones + 3 semitones + 7 semitones
                  </p>
                </div>
                <div className="bg-orange-100 p-3 rounded">
                  <p className="font-medium text-orange-800 text-sm">
                    🎯 <strong>Key Insight:</strong> Mastering interval construction means you can build any chord from scratch!
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Interactive Construction Lab */}
        <Card>
          <CardHeader>
            <CardTitle>🔬 Interactive Interval Construction Lab</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              <strong>Practice building intervals</strong> from different starting notes. Master the counting method!
            </p>

            <div className="mb-6 flex flex-wrap gap-2">
              <Button
                variant={difficultyLevel === 'beginner' ? 'default' : 'outline'}
                onClick={() => setDifficultyLevel('beginner')}
                size="sm"
              >
                <Target className="h-4 w-4 mr-1" />
                Beginner
              </Button>
              <Button
                variant={difficultyLevel === 'intermediate' ? 'default' : 'outline'}
                onClick={() => setDifficultyLevel('intermediate')}
                size="sm"
              >
                <Star className="h-4 w-4 mr-1" />
                Intermediate
              </Button>
              <Button
                variant={difficultyLevel === 'advanced' ? 'default' : 'outline'}
                onClick={() => setDifficultyLevel('advanced')}
                size="sm"
              >
                <Trophy className="h-4 w-4 mr-1" />
                Advanced
              </Button>
            </div>

            <div className="mb-6">
              <Button
                onClick={generateExercise}
                size="lg"
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <Zap className="h-5 w-5 mr-2" />
                Generate New Exercise
              </Button>
            </div>

            <PianoKeyboard
              highlightedNotes={selectedNotes}
              onNoteClick={handleNoteClick}
            />
            
            {currentExercise && (
              <div className="mt-4 text-center">
                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <Badge variant="outline" className="mr-2">Exercise #{practiceCount}</Badge>
                    <Badge className="bg-purple-100 text-purple-800">
                      {difficultyLevel.charAt(0).toUpperCase() + difficultyLevel.slice(1)}
                    </Badge>
                  </div>
                  <p className="text-lg font-semibold mb-2">
                    Build a <strong>{currentExercise.interval}</strong> from <strong>{currentExercise.startNote}</strong>
                  </p>
                  <p className="text-sm text-muted-foreground mb-3">
                    Distance: {INTERVALS.find(i => i.name === currentExercise.interval)?.semitones} semitones
                  </p>
                  
                  <div className="flex justify-center space-x-2 mb-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowStrategy(!showStrategy)}
                    >
                      <BookOpen className="h-4 w-4 mr-1" />
                      {showStrategy ? 'Hide' : 'Show'} Strategy
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={showAnswer}
                    >
                      <Lightbulb className="h-4 w-4 mr-1" />
                      Show Answer
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => audioEngine.playNote(currentExercise.startNote, 0.8)}
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Play Start
                    </Button>
                  </div>
                  
                  {showStrategy && (
                    <div className="bg-blue-50 p-3 rounded text-sm">
                      <p className="font-medium mb-2">Construction Strategy:</p>
                      <p className="text-blue-700">
                        {CONSTRUCTION_STRATEGIES[currentExercise.interval] || 
                         `Count ${INTERVALS.find(i => i.name === currentExercise.interval)?.semitones} semitones up from ${currentExercise.startNote}`}
                      </p>
                    </div>
                  )}
                  
                  {selectedNotes.length > 1 && (
                    <div className="mt-3 p-3 bg-green-50 rounded text-sm">
                      <p className="font-medium mb-1">✓ Answer: {currentExercise.targetNote}</p>
                      <p className="text-green-700">
                        {currentExercise.startNote} + {currentExercise.interval} = {currentExercise.targetNote}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={() => onComplete(Math.round((correctAnswers / testQuestions.length) * 100))} size="lg" className="bg-purple-600 hover:bg-purple-700">
            I Can Build Intervals
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
              <p className="text-2xl font-bold text-purple-600">{practiceCount}</p>
              <p className="text-sm text-muted-foreground">Intervals Built</p>
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
            <CardTitle>🎯 Intensive Interval Construction Practice</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-purple-800 mb-2">Mastery Strategy:</h4>
              <ol className="text-purple-700 text-sm space-y-1">
                <li><strong>1. Memorize Distances:</strong> 2nd=2, 3rd=4, 4th=5, 5th=7 semitones</li>
                <li><strong>2. Count Systematically:</strong> Always count semitones, including black keys</li>
                <li><strong>3. Practice Different Roots:</strong> Same interval from different starting notes</li>
                <li><strong>4. Hear the Result:</strong> Play both notes to internalize the sound</li>
              </ol>
            </div>
            
            <div className="mb-6 flex space-x-2">
              <Button
                variant={difficultyLevel === 'beginner' ? 'default' : 'outline'}
                onClick={() => setDifficultyLevel('beginner')}
              >
                Beginner
              </Button>
              <Button
                variant={difficultyLevel === 'intermediate' ? 'default' : 'outline'}
                onClick={() => setDifficultyLevel('intermediate')}
              >
                Intermediate  
              </Button>
              <Button
                variant={difficultyLevel === 'advanced' ? 'default' : 'outline'}
                onClick={() => setDifficultyLevel('advanced')}
              >
                Advanced
              </Button>
              <Button
                onClick={generateExercise}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Zap className="h-4 w-4 mr-1" />
                New Exercise
              </Button>
            </div>
            
            <PianoKeyboard
              highlightedNotes={selectedNotes}
              onNoteClick={handleNoteClick}
            />
            
            {currentExercise && (
              <div className="mt-4 text-center bg-muted p-4 rounded-lg">
                <Badge className="bg-purple-100 text-purple-800 mb-2">
                  Build: {currentExercise.interval} from {currentExercise.startNote}
                </Badge>
                <p className="font-semibold text-lg mb-2">
                  Distance: {INTERVALS.find(i => i.name === currentExercise.interval)?.semitones} semitones
                </p>
                <div className="flex justify-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowStrategy(!showStrategy)}
                  >
                    <Calculator className="h-4 w-4 mr-1" />
                    Strategy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={showAnswer}
                  >
                    <Lightbulb className="h-4 w-4 mr-1" />
                    Show Answer
                  </Button>
                </div>
                {showStrategy && (
                  <div className="mt-3 p-3 bg-blue-50 rounded text-sm">
                    <p className="text-blue-700">
                      {CONSTRUCTION_STRATEGIES[currentExercise.interval] || 
                       `Count ${INTERVALS.find(i => i.name === currentExercise.interval)?.semitones} semitones up`}
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={() => onComplete(Math.round((correctAnswers / testQuestions.length) * 100))} size="lg" className="bg-green-600 hover:bg-green-700">
            Ready for Final Test
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
            <span>🎓 Final Mastery Test: Building Intervals</span>
            <Badge variant="outline">
              Question {Math.min(currentQuestionIndex + 1, testQuestions.length)} of {testQuestions.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isTestComplete ? (
            <div className="text-center space-y-4">
              {correctAnswers >= 6 ? (
                <div>
                  <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-success">
                    🎉 MASTERY ACHIEVED! Score: {correctAnswers}/{testQuestions.length}
                  </h3>
                  <Badge className="mb-4 bg-yellow-100 text-yellow-800">{getMasteryLevel().level} Level</Badge>
                  <p className="text-success mb-4">
                    🎊 Congratulations! You've completed the entire AP Music Theory foundation! 
                    You can now build intervals, construct scales, identify key signatures, and understand the mathematical beauty of music.
                  </p>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-green-800 mb-2">🏆 What You've Mastered:</h4>
                    <ul className="text-green-700 text-sm space-y-1">
                      <li>✓ Musical alphabet and note relationships</li>
                      <li>✓ Whole steps and half steps</li>
                      <li>✓ Major scale construction (W-W-H-W-W-W-H pattern)</li>
                      <li>✓ Minor scale construction and relative relationships</li>
                      <li>✓ Key signatures and Circle of Fifths</li>
                      <li>✓ Interval recognition and emotional qualities</li>
                      <li>✓ Interval construction from any starting note</li>
                    </ul>
                  </div>
                  <Button onClick={() => onComplete(Math.round((correctAnswers / testQuestions.length) * 100))} size="lg" className="bg-yellow-600 hover:bg-yellow-700">
                    Complete Learning Journey 🎵
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              ) : (
                <div>
                  <Target className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold">
                    Almost there! Score: {correctAnswers}/{testQuestions.length}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    You need 6/8 to complete your journey. Focus on the counting method!
                  </p>
                  <div className="space-y-2 mb-4">
                    <p className="text-sm font-medium">Quick reminders:</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Count semitones systematically from the starting note</li>
                      <li>• Major 3rd = 4 semitones, Perfect 5th = 7 semitones</li>
                      <li>• Include black keys in your counting</li>
                      <li>• Practice makes perfect - keep building!</li>
                    </ul>
                  </div>
                  <Button onClick={() => {
                    setCurrentQuestionIndex(0);
                    setCorrectAnswers(0);
                    setAttempts(0);
                    setShowHint(false);
                  }}>
                    Final Push - Try Again
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-purple-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>

              <div className="bg-primary/5 p-6 rounded-lg text-center">
                <p className="text-lg mb-4">
                  Build a <strong>{currentQuestion.interval}</strong> going <strong>{currentQuestion.direction}</strong> from <strong>{currentQuestion.startNote}</strong>
                </p>
                
                <div className="bg-white p-2 rounded border mb-4">
                  <PianoKeyboard
                    highlightedNotes={[currentQuestion.startNote]}
                    onNoteClick={() => {}}
                    showLabels={false} // Hide labels during tests to avoid giving away answers
                  />
                  <p className="text-xs text-muted-foreground mt-2">Starting note highlighted</p>
                </div>
                
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
                    onClick={() => audioEngine.playNote(currentQuestion.startNote, 0.8)}
                  >
                    <Play className="h-4 w-4 mr-1" />
                    Hear Starting Note
                  </Button>
                </div>
                
                {showHint && (
                  <div className="mt-4 p-3 bg-purple-50 rounded-lg text-sm">
                    <p className="font-medium mb-2">💡 Construction Method:</p>
                    <div className="text-left">
                      <p className="text-purple-700 mb-1">
                        <strong>Distance:</strong> {currentQuestion.interval} = {INTERVALS.find(i => i.name === currentQuestion.interval)?.semitones} semitones
                      </p>
                      <p className="text-purple-700 mb-1">
                        <strong>Method:</strong> {CONSTRUCTION_STRATEGIES[currentQuestion.interval] || 
                         `Count ${INTERVALS.find(i => i.name === currentQuestion.interval)?.semitones} semitones ${currentQuestion.direction}`}
                      </p>
                      <p className="text-purple-700">
                        <strong>Count:</strong> {currentQuestion.startNote} → count semitones → ?
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-4 gap-2">
                {['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].map(note => (
                  <Button
                    key={note}
                    variant="outline"
                    onClick={() => handleTestAnswer(note as Note)}
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
                    Fantastic! You're building the foundation for all of music theory 🎵
                  </p>
                )}
                {correctAnswers >= 4 && (
                  <p className="text-xs text-purple-600 mt-1">
                    🔥 You're so close to mastery! Keep going!
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