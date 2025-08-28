import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PianoKeyboard } from '@/components/PianoKeyboard';
import { CheckCircle, ArrowRight, Music, Play, Lightbulb, Brain, Target, Star, Trophy, Calculator, Volume2, Heart, Zap } from 'lucide-react';
import { Note } from '@shared/schema';
import { audioEngine } from '@/lib/audio';
import { INTERVALS, getIntervalExplanation, getIntervalsByDifficulty } from '@/lib/musicTheory';

interface UnderstandingIntervalsLessonProps {
  section: 'learn' | 'practice' | 'test';
  onComplete: (score?: number) => void;
}

// Educational interval examples with familiar songs
const INTERVAL_EXAMPLES = [
  { interval: 'Perfect Unison', example: 'Same note - no distance', notes: ['C', 'C'], color: 'bg-gray-100 text-gray-800' },
  { interval: 'Minor 2nd', example: 'Jaws theme - very tense!', notes: ['C', 'C#'], color: 'bg-red-100 text-red-800' },
  { interval: 'Major 2nd', example: 'Happy Birthday - second note', notes: ['C', 'D'], color: 'bg-blue-100 text-blue-800' },
  { interval: 'Minor 3rd', example: 'Greensleeves - sad sound', notes: ['C', 'Eb'], color: 'bg-purple-100 text-purple-800' },
  { interval: 'Major 3rd', example: 'Oh When the Saints - happy sound', notes: ['C', 'E'], color: 'bg-green-100 text-green-800' },
  { interval: 'Perfect 4th', example: 'Here Comes the Bride', notes: ['C', 'F'], color: 'bg-yellow-100 text-yellow-800' },
  { interval: 'Tritone', example: 'The Simpsons theme - spooky!', notes: ['C', 'F#'], color: 'bg-orange-100 text-orange-800' },
  { interval: 'Perfect 5th', example: 'Twinkle Twinkle Little Star', notes: ['C', 'G'], color: 'bg-indigo-100 text-indigo-800' },
  { interval: 'Perfect Octave', example: 'Somewhere Over the Rainbow', notes: ['C', 'C'], color: 'bg-pink-100 text-pink-800' },
];

// Interval quality categories for learning progression
const INTERVAL_CATEGORIES = {
  'Perfect': ['Perfect Unison', 'Perfect 4th', 'Perfect 5th', 'Perfect Octave'],
  'Major': ['Major 2nd', 'Major 3rd', 'Major 6th', 'Major 7th'],
  'Minor': ['Minor 2nd', 'Minor 3rd', 'Minor 6th', 'Minor 7th'],
  'Special': ['Tritone']
};

export function UnderstandingIntervalsLesson({ section, onComplete }: UnderstandingIntervalsLessonProps) {
  const [currentInterval, setCurrentInterval] = useState(INTERVALS[0]);
  const [selectedNotes, setSelectedNotes] = useState<Note[]>([]);
  const [showCategory, setShowCategory] = useState<string | null>(null);
  const [practiceCount, setPracticeCount] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [testQuestions] = useState(() => {
    const { beginner, intermediate } = getIntervalsByDifficulty();
    const questions = [];
    
    // Start with fundamental intervals
    questions.push({ interval: 'Perfect Unison', type: 'identify_sound' });
    questions.push({ interval: 'Perfect Octave', type: 'identify_sound' });
    questions.push({ interval: 'Perfect 5th', type: 'identify_sound' });
    questions.push({ interval: 'Major 3rd', type: 'identify_sound' });
    questions.push({ interval: 'Minor 3rd', type: 'identify_sound' });
    
    // Add some distance/semitone questions
    questions.push({ interval: 'Major 2nd', type: 'semitones' });
    questions.push({ interval: 'Perfect 4th', type: 'semitones' });
    questions.push({ interval: 'Tritone', type: 'semitones' });
    
    return questions.sort(() => Math.random() - 0.5).slice(0, 8);
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

  const handleIntervalDemo = async (intervalName: string) => {
    const interval = INTERVALS.find(i => i.name === intervalName);
    if (!interval) return;
    
    setCurrentInterval(interval);
    const example = INTERVAL_EXAMPLES.find(ex => ex.interval === intervalName);
    if (example) {
      setSelectedNotes(example.notes as Note[]);
    }
    setPracticeCount(prev => prev + 1);
    
    // Educational audio sequence - play interval harmonically and melodically
    if (example) {
      const [note1, note2] = example.notes as Note[];
      
      // Play melodically first (one after the other)
      try {
        await audioEngine.playNote(note1, 0.8);
        setTimeout(async () => {
          try {
            await audioEngine.playNote(note2, 0.8);
            // Then play harmonically (together) for contrast
            setTimeout(async () => {
              try {
                await audioEngine.playNote(note1, 0.6);
                await audioEngine.playNote(note2, 0.6);
              } catch (error) {
                console.warn('Audio playback failed:', error);
              }
            }, 800);
          } catch (error) {
            console.warn('Audio playback failed:', error);
          }
        }, 600);
      } catch (error) {
        console.warn('Audio playbook failed:', error);
      }
    }
  };

  const handleCategoryDemo = (category: string) => {
    setShowCategory(category === showCategory ? null : category);
    const intervals = INTERVAL_CATEGORIES[category as keyof typeof INTERVAL_CATEGORIES];
    if (intervals.length > 0) {
      handleIntervalDemo(intervals[0]);
    }
  };

  const handleTestAnswer = async (answer: string) => {
    const currentQuestion = testQuestions[currentQuestionIndex];
    let isCorrect = false;
    setAttempts(prev => prev + 1);
    
    if (currentQuestion.type === 'identify_sound') {
      isCorrect = answer === currentQuestion.interval;
    } else if (currentQuestion.type === 'semitones') {
      const interval = INTERVALS.find(i => i.name === currentQuestion.interval);
      isCorrect = answer === interval?.semitones.toString();
    }
    
    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
      // Play success audio - the correct interval
      const example = INTERVAL_EXAMPLES.find(ex => ex.interval === currentQuestion.interval);
      if (example) {
        const [note1, note2] = example.notes as Note[];
        try {
          await audioEngine.playNote(note1, 0.8);
          setTimeout(async () => {
            try {
              await audioEngine.playNote(note2, 0.8);
            } catch (error) {
              console.warn('Audio playback failed:', error);
            }
          }, 300);
        } catch (error) {
          console.warn('Audio playback failed:', error);
        }
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
    if (accuracy >= 0.95) return { level: 'Interval Master', icon: Trophy, color: 'text-purple-600' };
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
              <Calculator className="h-5 w-5 mr-2" />
              Understanding Intervals: The Mathematics of Music
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Learning Objectives */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2 flex items-center">
                <Target className="h-4 w-4 mr-2" />
                What You'll Master
              </h3>
              <ul className="text-blue-700 space-y-1 text-sm">
                <li>• Understand what intervals are and why they matter</li>
                <li>• Recognize the sound and emotional quality of each interval</li>
                <li>• Connect intervals to familiar songs and musical contexts</li>
                <li>• Differentiate between Perfect, Major, Minor, and augmented/diminished intervals</li>
              </ul>
            </div>

            {/* Core Concept - What Are Intervals? */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-3">📏 Intervals: The Distance Between Notes</h3>
              <div className="space-y-3">
                <div className="bg-white p-3 rounded border">
                  <p className="font-medium text-green-800 mb-2">Simple Definition:</p>
                  <p className="text-green-700 text-sm mb-2">
                    An interval is the <strong>distance between two notes</strong>, measured in semitones (half steps).
                  </p>
                  <p className="text-green-700 text-sm">
                    <strong>Why They Matter:</strong> Intervals create the emotional character of all music - chords, melodies, and harmonies.
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded">
                  <p className="font-medium text-green-800 mb-1">Think of intervals like:</p>
                  <p className="text-green-700 text-sm">
                    🏠 <strong>Architectural blueprints</strong> - they define the structure and feeling of musical buildings (chords & melodies)
                  </p>
                </div>
              </div>
            </div>

            {/* Mental Model - Interval Categories */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="font-semibold text-purple-800 mb-3">🏗️ The Four Interval Families</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="bg-white p-3 rounded border">
                    <div className="flex items-center mb-2">
                      <Zap className="h-4 w-4 mr-2 text-blue-600" />
                      <p className="font-medium text-purple-800">Perfect Intervals</p>
                    </div>
                    <p className="text-purple-700 text-sm mb-2">
                      Sound: <strong>Stable, consonant, "at rest"</strong>
                    </p>
                    <p className="text-purple-700 text-sm">
                      Examples: Unison, 4th, 5th, Octave
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <div className="flex items-center mb-2">
                      <Heart className="h-4 w-4 mr-2 text-red-600" />
                      <p className="font-medium text-purple-800">Major Intervals</p>
                    </div>
                    <p className="text-purple-700 text-sm mb-2">
                      Sound: <strong>Bright, happy, uplifting</strong>
                    </p>
                    <p className="text-purple-700 text-sm">
                      Examples: Major 2nd, 3rd, 6th, 7th
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="bg-white p-3 rounded border">
                    <div className="flex items-center mb-2">
                      <Volume2 className="h-4 w-4 mr-2 text-gray-600" />
                      <p className="font-medium text-purple-800">Minor Intervals</p>
                    </div>
                    <p className="text-purple-700 text-sm mb-2">
                      Sound: <strong>Dark, sad, melancholy</strong>
                    </p>
                    <p className="text-purple-700 text-sm">
                      Examples: Minor 2nd, 3rd, 6th, 7th
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <div className="flex items-center mb-2">
                      <Music className="h-4 w-4 mr-2 text-orange-600" />
                      <p className="font-medium text-purple-800">Special Cases</p>
                    </div>
                    <p className="text-purple-700 text-sm mb-2">
                      Sound: <strong>Tense, unstable, dramatic</strong>
                    </p>
                    <p className="text-purple-700 text-sm">
                      Examples: Tritone (diminished 5th)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Practical Examples with Songs */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-800 mb-3">🎵 Intervals in Famous Songs</h3>
              <div className="grid md:grid-cols-2 gap-3">
                {INTERVAL_EXAMPLES.slice(0, 6).map(example => (
                  <div key={example.interval} className="bg-white p-3 rounded border">
                    <p className="font-medium text-yellow-800 text-sm">{example.interval}</p>
                    <p className="text-yellow-700 text-xs">{example.example}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 bg-yellow-100 p-3 rounded text-sm">
                <p><strong>🧠 Learning Tip:</strong> Connecting intervals to familiar songs makes them much easier to remember and identify!</p>
              </div>
            </div>

            {/* The Emotional Impact */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h3 className="font-semibold text-orange-800 mb-3">😊😢 Emotional Qualities of Intervals</h3>
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="bg-green-100 p-2 rounded text-center">
                    <p className="font-medium">Happy/Bright</p>
                    <p className="text-xs">Major 3rd, 6th</p>
                  </div>
                  <div className="bg-blue-100 p-2 rounded text-center">
                    <p className="font-medium">Stable/Calm</p>
                    <p className="text-xs">Perfect 4th, 5th</p>
                  </div>
                  <div className="bg-purple-100 p-2 rounded text-center">
                    <p className="font-medium">Sad/Dark</p>
                    <p className="text-xs">Minor 3rd, 6th</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="bg-red-100 p-2 rounded text-center">
                    <p className="font-medium">Tense/Dissonant</p>
                    <p className="text-xs">Minor 2nd, 7th</p>
                  </div>
                  <div className="bg-orange-100 p-2 rounded text-center">
                    <p className="font-medium">Spooky/Unstable</p>
                    <p className="text-xs">Tritone</p>
                  </div>
                  <div className="bg-pink-100 p-2 rounded text-center">
                    <p className="font-medium">Complete/Resolved</p>
                    <p className="text-xs">Octave</p>
                  </div>
                </div>
              </div>
              <p className="text-orange-700 text-sm mt-3">
                <strong>Key Insight:</strong> Composers use these emotional qualities to create specific moods and tell musical stories!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Interactive Exploration */}
        <Card>
          <CardHeader>
            <CardTitle>🎹 Interactive Interval Discovery</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              <strong>Explore different intervals</strong> and hear how they create different emotions and musical colors.
            </p>

            <div className="mb-6 flex flex-wrap gap-2">
              {Object.keys(INTERVAL_CATEGORIES).map(category => (
                <Button
                  key={category}
                  variant={showCategory === category ? 'default' : 'outline'}
                  onClick={() => handleCategoryDemo(category)}
                  size="sm"
                >
                  {category} Intervals
                </Button>
              ))}
            </div>

            {showCategory && (
              <div className="mb-6 p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-3">{showCategory} Intervals</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {INTERVAL_CATEGORIES[showCategory as keyof typeof INTERVAL_CATEGORIES].map(intervalName => (
                    <Button
                      key={intervalName}
                      variant="outline"
                      size="sm"
                      onClick={() => handleIntervalDemo(intervalName)}
                    >
                      {intervalName.replace('Perfect ', 'P').replace('Major ', 'M').replace('Minor ', 'm')}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
              {INTERVAL_EXAMPLES.slice(0, 6).map(example => (
                <Button
                  key={example.interval}
                  variant={currentInterval.name === example.interval ? 'default' : 'outline'}
                  className="h-20 text-left p-3"
                  onClick={() => handleIntervalDemo(example.interval)}
                >
                  <div>
                    <div className="font-semibold text-sm">{example.interval}</div>
                    <div className="text-xs text-muted-foreground mb-1">
                      {INTERVALS.find(i => i.name === example.interval)?.semitones} semitones
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {example.example}
                    </div>
                  </div>
                </Button>
              ))}
            </div>

            <PianoKeyboard
              highlightedNotes={selectedNotes}
              onNoteClick={handleNoteClick}
            />
            
            <div className="mt-4 text-center">
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <Badge variant="outline" className="mr-2">{currentInterval.name}</Badge>
                  <Badge className="bg-blue-100 text-blue-800">
                    {currentInterval.semitones} semitone{currentInterval.semitones !== 1 ? 's' : ''}
                  </Badge>
                </div>
                <p className="font-semibold text-lg mb-2">
                  {(() => {
                    const example = INTERVAL_EXAMPLES.find(ex => ex.interval === currentInterval.name);
                    return example ? `${example.notes[0]} to ${example.notes[1]}` : '';
                  })()}
                </p>
                <p className="text-sm text-muted-foreground mb-3">
                  {(() => {
                    const explanation = getIntervalExplanation(currentInterval.name);
                    return explanation.explanation;
                  })()}
                </p>
                
                <div className="flex justify-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleIntervalDemo(currentInterval.name)}
                  >
                    <Play className="h-4 w-4 mr-1" />
                    Play Again
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const explanation = getIntervalExplanation(currentInterval.name);
                      alert(explanation.learningTip);
                    }}
                  >
                    <Lightbulb className="h-4 w-4 mr-1" />
                    Learning Tip
                  </Button>
                </div>
                
                <div className="mt-3 p-3 bg-blue-50 rounded text-sm">
                  <p className="font-medium mb-1">Musical Context:</p>
                  <p className="text-blue-700">
                    {(() => {
                      const example = INTERVAL_EXAMPLES.find(ex => ex.interval === currentInterval.name);
                      return example?.example || 'This interval creates a unique musical color.';
                    })()}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={() => onComplete(Math.round((correctAnswers / testQuestions.length) * 100))} size="lg" className="bg-blue-600 hover:bg-blue-700">
            I Understand Intervals
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
            <CardTitle>🎯 Interval Recognition Practice</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-purple-800 mb-2">Practice Strategy:</h4>
              <ol className="text-purple-700 text-sm space-y-1">
                <li><strong>1. Listen for Emotion:</strong> Major = bright, Minor = sad, Perfect = stable</li>
                <li><strong>2. Use Song References:</strong> Connect intervals to familiar melodies</li>
                <li><strong>3. Count Semitones:</strong> Perfect 5th = 7 semitones, Major 3rd = 4 semitones</li>
                <li><strong>4. Practice Recognition:</strong> Start with easy intervals (octave, 5th, 3rd)</li>
              </ol>
            </div>
            
            <div className="grid grid-cols-3 gap-2 mb-6">
              {INTERVALS.slice(0, 9).map(interval => (
                <Button
                  key={interval.name}
                  variant="outline"
                  onClick={() => handleIntervalDemo(interval.name)}
                  className="h-16 text-xs"
                >
                  <div>
                    <div className="font-semibold">{interval.shortName}</div>
                    <div className="text-muted-foreground">{interval.semitones}♪</div>
                  </div>
                </Button>
              ))}
            </div>
            
            <PianoKeyboard
              highlightedNotes={selectedNotes}
              onNoteClick={handleNoteClick}
            />
            
            {currentInterval && (
              <div className="mt-4 text-center bg-muted p-4 rounded-lg">
                <Badge className="bg-purple-100 text-purple-800 mb-2">
                  Practice: {currentInterval.name}
                </Badge>
                <p className="font-semibold text-lg mb-2">
                  {currentInterval.semitones} semitones • {currentInterval.shortName}
                </p>
                <p className="text-sm text-muted-foreground mb-3">
                  {(() => {
                    const explanation = getIntervalExplanation(currentInterval.name);
                    return explanation.explanation;
                  })()}
                </p>
                <div className="flex justify-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleIntervalDemo(currentInterval.name)}
                  >
                    <Play className="h-4 w-4 mr-1" />
                    Play Interval
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const example = INTERVAL_EXAMPLES.find(ex => ex.interval === currentInterval.name);
                      if (example) alert(`Song example: ${example.example}`);
                    }}
                  >
                    <Music className="h-4 w-4 mr-1" />
                    Song Example
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={() => onComplete(Math.round((correctAnswers / testQuestions.length) * 100))} size="lg" className="bg-green-600 hover:bg-green-700">
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
            <span>🎓 Understanding Intervals Test</span>
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
                  <Trophy className="h-16 w-16 text-purple-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-success">
                    🎉 Outstanding! Score: {correctAnswers}/{testQuestions.length}
                  </h3>
                  <Badge className="mb-4">{getMasteryLevel().level} Achieved</Badge>
                  <p className="text-success mb-4">
                    You understand intervals and their emotional qualities! Ready for the final challenge.
                  </p>
                  <Button onClick={() => onComplete(Math.round((correctAnswers / testQuestions.length) * 100))} size="lg" className="bg-green-600 hover:bg-green-700">
                    Continue to Building Intervals
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
                    You need 6/8 to advance. Focus on the emotional qualities!
                  </p>
                  <div className="space-y-2 mb-4">
                    <p className="text-sm font-medium">Remember:</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Perfect intervals sound stable (unison, 4th, 5th, octave)</li>
                      <li>• Major intervals sound bright and happy</li>
                      <li>• Minor intervals sound dark and sad</li>
                      <li>• Use song references to remember interval sounds</li>
                    </ul>
                  </div>
                  <Button onClick={() => {
                    setCurrentQuestionIndex(0);
                    setCorrectAnswers(0);
                    setAttempts(0);
                    setShowHint(false);
                  }}>
                    Try Again
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>

              <div className="bg-primary/5 p-6 rounded-lg text-center">
                {currentQuestion.type === 'identify_sound' ? (
                  <>
                    <p className="text-lg mb-4">
                      Listen to this interval and identify it:
                    </p>
                    <Button
                      size="lg"
                      onClick={() => {
                        const example = INTERVAL_EXAMPLES.find(ex => ex.interval === currentQuestion.interval);
                        if (example) {
                          const [note1, note2] = example.notes as Note[];
                          audioEngine.playNote(note1, 0.8);
                          setTimeout(() => audioEngine.playNote(note2, 0.8), 600);
                        }
                      }}
                      className="mb-4"
                    >
                      <Volume2 className="h-5 w-5 mr-2" />
                      Play Interval
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      Listen for the emotional quality - is it stable, bright, dark, or tense?
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-lg mb-4">
                      How many semitones are in a <strong>{currentQuestion.interval}</strong>?
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Count the half steps between the two notes of this interval.
                    </p>
                  </>
                )}
                
                <div className="mt-4 space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowHint(!showHint)}
                  >
                    <Brain className="h-4 w-4 mr-1" />
                    {showHint ? 'Hide' : 'Show'} Strategy
                  </Button>
                </div>
                
                {showHint && (
                  <div className="mt-4 p-3 bg-purple-50 rounded-lg text-sm">
                    <p className="font-medium mb-2">💡 Recognition Strategy:</p>
                    <div className="text-left">
                      {currentQuestion.type === 'identify_sound' ? (
                        <div>
                          <p className="text-purple-700 mb-1">
                            Listen for the emotional character:
                          </p>
                          <p className="text-purple-700 text-xs mb-1">• Stable/calm = Perfect intervals</p>
                          <p className="text-purple-700 text-xs mb-1">• Bright/happy = Major intervals</p>
                          <p className="text-purple-700 text-xs mb-1">• Dark/sad = Minor intervals</p>
                          <p className="text-purple-700 text-xs">• Tense/unstable = Dissonant intervals</p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-purple-700">
                            {(() => {
                              const interval = INTERVALS.find(i => i.name === currentQuestion.interval);
                              return `${currentQuestion.interval} = ${interval?.semitones} semitones`;
                            })()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {currentQuestion.type === 'identify_sound' ? (
                <div className="grid grid-cols-2 gap-2">
                  {(() => {
                    const { beginner, intermediate } = getIntervalsByDifficulty();
                    const allOptions = [...beginner, ...intermediate].slice(0, 6);
                    const correctAnswer = currentQuestion.interval;
                    
                    // Ensure correct answer is included
                    if (!allOptions.includes(correctAnswer as any)) {
                      allOptions[0] = correctAnswer as any;
                    }
                    
                    return allOptions.sort(() => Math.random() - 0.5).map((interval, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        onClick={() => handleTestAnswer(interval)}
                        className="h-16 text-sm"
                      >
                        <div>
                          <div className="font-semibold">{interval}</div>
                          <div className="text-xs text-muted-foreground">
                            {INTERVALS.find(i => i.name === interval)?.shortName}
                          </div>
                        </div>
                      </Button>
                    ));
                  })()}
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(num => (
                    <Button
                      key={num}
                      variant="outline"
                      onClick={() => handleTestAnswer(num.toString())}
                      className="h-12"
                    >
                      {num}
                    </Button>
                  ))}
                </div>
              )}

              {/* Encouraging Progress Display */}
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Progress: {correctAnswers} correct • {Math.round((correctAnswers / Math.max(currentQuestionIndex, 1)) * 100)}% accuracy
                </p>
                {correctAnswers > 0 && (
                  <p className="text-xs text-green-600 mt-1">
                    Excellent! Understanding intervals unlocks the secrets of harmony and melody 🎵
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