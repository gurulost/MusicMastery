import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PianoKeyboard } from '@/components/PianoKeyboard';
import { CheckCircle, ArrowRight, Music, Play, Lightbulb, Brain, Target, Star, Trophy, Calculator, Link, Heart, ArrowRightLeft } from 'lucide-react';
import { Note } from '@shared/schema';
import { audioEngine } from '@/lib/audio';
import { getMinorScale, getMajorScale, MINOR_SCALES, MINOR_SCALE_NAMES, getScalesByDifficulty, getScale } from '@/lib/musicTheory';

interface MinorScalesLessonProps {
  section: 'learn' | 'practice' | 'test';
  onComplete: (score?: number) => void;
}

const MINOR_SCALE_PATTERN = ['W', 'H', 'W', 'W', 'H', 'W', 'W'];

// Relative major-minor pairs for comprehensive understanding
const RELATIVE_PAIRS = [
  { minor: 'A Minor', major: 'C Major', relationship: 'Both have no sharps or flats' },
  { minor: 'E Minor', major: 'G Major', relationship: 'Both have 1 sharp (F#)' },
  { minor: 'B Minor', major: 'D Major', relationship: 'Both have 2 sharps (F#, C#)' },
  { minor: 'D Minor', major: 'F Major', relationship: 'Both have 1 flat (Bb)' },
  { minor: 'G Minor', major: 'Bb Major', relationship: 'Both have 2 flats (Bb, Eb)' },
  { minor: 'C Minor', major: 'Eb Major', relationship: 'Both have 3 flats (Bb, Eb, Ab)' },
];

export function MinorScalesLesson({ section, onComplete }: MinorScalesLessonProps) {
  const [currentScale, setCurrentScale] = useState<string>('A Minor');
  const [selectedNotes, setSelectedNotes] = useState<Note[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [showRelationship, setShowRelationship] = useState(false);
  const [practiceCount, setPracticeCount] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [testQuestions] = useState(() => {
    // Progressive difficulty focusing on relative major-minor understanding
    const questions = [];
    
    // Start with fundamental relative pairs
    questions.push({ scale: 'A Minor', type: 'relative_major' });
    questions.push({ scale: 'E Minor', type: 'relative_major' });
    questions.push({ scale: 'C Major', type: 'relative_minor' });
    
    // Add scale construction questions
    questions.push({ scale: 'A Minor', type: 'notes' });
    questions.push({ scale: 'D Minor', type: 'notes' });
    questions.push({ scale: 'G Minor', type: 'notes' });
    
    // Mix in some key signature understanding
    questions.push({ scale: 'B Minor', type: 'relative_major' });
    questions.push({ scale: 'F Minor', type: 'key_signature' });
    
    return questions.sort(() => Math.random() - 0.5).slice(0, 8);
  });
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showHint, setShowHint] = useState(false);

  const handleNoteClick = (note: Note) => {
    // Piano keyboard handles audio - no duplicate audio here
  };

  const handleScaleDemo = async (scaleName: string) => {
    setCurrentScale(scaleName);
    const [tonic] = scaleName.split(' ');
    const scale = getMinorScale(tonic as Note);
    setSelectedNotes(scale.notes);
    setPracticeCount(prev => prev + 1);
    
    // Educational audio sequence - play scale with emotional context
    try {
      await audioEngine.playScale(scale.notes);
    } catch (error) {
      console.warn('Audio playback failed:', error);
    }
  };

  const handleComparisonDemo = async (minorScale: string, majorScale: string) => {
    const [minorTonic] = minorScale.split(' ');
    const [majorTonic] = majorScale.split(' ');
    const minorNotes = getMinorScale(minorTonic as Note);
    const majorNotes = getMajorScale(majorTonic as Note);
    
    // Show both scales highlighted
    setSelectedNotes([...minorNotes.notes, ...majorNotes.notes]);
    setCurrentScale(`${minorScale} vs ${majorScale}`);
    
    // Play minor scale first (sad sound)
    try {
      await audioEngine.playScale(minorNotes.notes);
      
      // Then major scale (happy sound) for comparison
      setTimeout(async () => {
        try {
          await audioEngine.playScale(majorNotes.notes);
        } catch (error) {
          console.warn('Audio playback failed:', error);
        }
      }, 3500);
    } catch (error) {
      console.warn('Audio playback failed:', error);
    }
  };

  const handleTestAnswer = async (answer: string) => {
    const currentQuestion = testQuestions[currentQuestionIndex];
    let isCorrect = false;
    setAttempts(prev => prev + 1);
    
    if (currentQuestion.type === 'relative_major') {
      const pair = RELATIVE_PAIRS.find(p => p.minor === currentQuestion.scale);
      isCorrect = answer === pair?.major;
    } else if (currentQuestion.type === 'relative_minor') {
      const pair = RELATIVE_PAIRS.find(p => p.major === currentQuestion.scale);
      isCorrect = answer === pair?.minor;
    } else if (currentQuestion.type === 'notes') {
      const [tonic] = currentQuestion.scale.split(' ');
      const correctScale = getMinorScale(tonic as Note);
      const correctAnswer = correctScale.notes.join(', ');
      isCorrect = answer === correctAnswer;
    } else if (currentQuestion.type === 'key_signature') {
      const [tonic] = currentQuestion.scale.split(' ');
      const scale = getMinorScale(tonic as Note);
      const accidentalCount = scale.sharps.length + scale.flats.length;
      isCorrect = answer === accidentalCount.toString();
    }
    
    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
      // Play success audio
      if (currentQuestion.type.includes('relative')) {
        const [tonic] = currentQuestion.scale.split(' ');
        const scale = currentQuestion.type === 'relative_major' ? 
          getMinorScale(tonic as Note) : getMajorScale(tonic as Note);
        try {
          await audioEngine.playScale(scale.notes.slice(0, 3));
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
    if (accuracy >= 0.95) return { level: 'Minor Master', icon: Trophy, color: 'text-purple-600' };
    if (accuracy >= 0.85) return { level: 'Proficient', icon: Star, color: 'text-green-600' };
    if (accuracy >= 0.70) return { level: 'Developing', icon: Target, color: 'text-blue-600' };
    return { level: 'Learning', icon: Brain, color: 'text-gray-600' };
  };

  const getRelativeMinor = (majorKey: string): string => {
    const pair = RELATIVE_PAIRS.find(p => p.major === majorKey);
    return pair?.minor || 'Unknown';
  };

  const getRelativeMajor = (minorKey: string): string => {
    const pair = RELATIVE_PAIRS.find(p => p.minor === minorKey);
    return pair?.major || 'Unknown';
  };

  if (section === 'learn') {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Heart className="h-5 w-5 mr-2" />
              Minor Scales: The Emotional Side of Music
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
                <li>• Build natural minor scales using the W-H-W-W-H-W-W pattern</li>
                <li>• Understand relative major-minor relationships</li>
                <li>• Recognize why minor scales sound "sad" or "dark"</li>
                <li>• Connect minor scales to their key signatures</li>
              </ul>
            </div>

            {/* Core Concept - The Minor Scale Pattern */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="font-semibold text-purple-800 mb-3">🎵 The Natural Minor Scale Pattern</h3>
              <div className="bg-white p-4 rounded border mb-3">
                <div className="grid grid-cols-8 gap-2 text-center mb-2">
                  {MINOR_SCALE_PATTERN.map((step, i) => (
                    <div key={i} className={`p-2 rounded font-bold ${step === 'W' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {step}
                    </div>
                  ))}
                  <div className="p-2 bg-blue-100 text-blue-800 rounded font-bold">1</div>
                </div>
                <div className="text-center text-sm font-mono">
                  W - H - W - W - H - W - W
                </div>
              </div>
              <div className="space-y-2 text-purple-700 text-sm">
                <p><strong>Compare to Major:</strong> Major = W-W-H-W-W-W-H • Minor = W-H-W-W-H-W-W</p>
                <p><strong>Key Difference:</strong> The half steps occur in different places, creating the "sad" sound!</p>
              </div>
            </div>

            {/* Mental Model - The Emotional Difference */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h3 className="font-semibold text-orange-800 mb-3">😢 vs 😊 Why Minor Sounds Sad</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white p-3 rounded border">
                  <p className="font-medium text-orange-800 mb-2">Major Scale (Happy)</p>
                  <p className="text-orange-700 text-sm mb-2">3rd note: Major 3rd interval (4 semitones up)</p>
                  <p className="text-orange-700 text-sm">Creates bright, uplifting sound</p>
                </div>
                <div className="bg-white p-3 rounded border">
                  <p className="font-medium text-orange-800 mb-2">Minor Scale (Sad)</p>
                  <p className="text-orange-700 text-sm mb-2">3rd note: Minor 3rd interval (3 semitones up)</p>
                  <p className="text-orange-700 text-sm">Creates dark, melancholy sound</p>
                </div>
              </div>
              <div className="mt-3 bg-orange-100 p-3 rounded text-sm">
                <p><strong>🧠 Key Insight:</strong> The difference of just ONE semitone in the 3rd degree completely changes the emotional character!</p>
              </div>
            </div>

            {/* Worked Example - A Minor */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-3">📝 Worked Example: A Minor Scale</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-8 gap-1 text-center text-xs">
                  <div className="bg-white p-2 rounded border font-semibold">A</div>
                  <div className="p-1 text-green-600 font-bold">+W</div>
                  <div className="bg-white p-2 rounded border font-semibold">B</div>
                  <div className="p-1 text-red-600 font-bold">+H</div>
                  <div className="bg-white p-2 rounded border font-semibold">C</div>
                  <div className="p-1 text-green-600 font-bold">+W</div>
                  <div className="bg-white p-2 rounded border font-semibold">D</div>
                  <div className="p-1 text-green-600 font-bold">+W</div>
                </div>
                <div className="grid grid-cols-8 gap-1 text-center text-xs">
                  <div className="bg-white p-2 rounded border font-semibold">E</div>
                  <div className="p-1 text-red-600 font-bold">+H</div>
                  <div className="bg-white p-2 rounded border font-semibold">F</div>
                  <div className="p-1 text-green-600 font-bold">+W</div>
                  <div className="bg-white p-2 rounded border font-semibold">G</div>
                  <div className="p-1 text-green-600 font-bold">+W</div>
                  <div className="bg-white p-2 rounded border font-semibold">A</div>
                  <div></div>
                </div>
                <div className="bg-white p-2 rounded border text-center">
                  <strong>Result:</strong> A - B - C - D - E - F - G - A
                </div>
                <p className="text-green-700 text-sm">
                  <strong>Special Property:</strong> A Minor uses the same notes as C Major! This is called a "relative" relationship.
                </p>
              </div>
            </div>

            {/* Revolutionary Concept - Relative Relationships */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-800 mb-3 flex items-center">
                <Link className="h-4 w-4 mr-2" />
                The Relative Major-Minor Secret
              </h3>
              <div className="space-y-3">
                <div className="bg-white p-3 rounded border">
                  <p className="font-medium text-yellow-800 mb-2">Amazing Discovery:</p>
                  <p className="text-yellow-700 text-sm mb-2">
                    Every minor scale shares its notes with a major scale!
                  </p>
                  <p className="text-yellow-700 text-sm">
                    <strong>The Rule:</strong> The relative major is always 3 semitones (minor 3rd) UP from the minor root.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-yellow-100 p-2 rounded">
                    <p><strong>A Minor</strong> ↔ <strong>C Major</strong></p>
                    <p className="text-xs">Same key signature (no accidentals)</p>
                  </div>
                  <div className="bg-yellow-100 p-2 rounded">
                    <p><strong>E Minor</strong> ↔ <strong>G Major</strong></p>
                    <p className="text-xs">Same key signature (1 sharp)</p>
                  </div>
                  <div className="bg-yellow-100 p-2 rounded">
                    <p><strong>D Minor</strong> ↔ <strong>F Major</strong></p>
                    <p className="text-xs">Same key signature (1 flat)</p>
                  </div>
                  <div className="bg-yellow-100 p-2 rounded">
                    <p><strong>G Minor</strong> ↔ <strong>Bb Major</strong></p>
                    <p className="text-xs">Same key signature (2 flats)</p>
                  </div>
                </div>
                <p className="text-yellow-700 text-sm font-medium">
                  💡 This means if you know major scale key signatures, you automatically know minor scale key signatures!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Interactive Discovery */}
        <Card>
          <CardHeader>
            <CardTitle>🎹 Interactive Minor Scale Laboratory</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              <strong>Explore the emotional world of minor scales</strong> and discover their relationships to major scales.
            </p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {RELATIVE_PAIRS.slice(0, 4).map(pair => (
                <Button
                  key={pair.minor}
                  variant={currentScale === pair.minor ? 'default' : 'outline'}
                  className="h-20 text-left p-3"
                  onClick={() => handleScaleDemo(pair.minor)}
                >
                  <div>
                    <div className="font-semibold">{pair.minor}</div>
                    <div className="text-xs text-muted-foreground">
                      Relative: {pair.major}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {pair.relationship}
                    </div>
                  </div>
                </Button>
              ))}
            </div>

            <div className="mb-4 flex space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowComparison(!showComparison)}
              >
                <ArrowRightLeft className="h-4 w-4 mr-2" />
                {showComparison ? 'Hide' : 'Show'} Major vs Minor Comparison
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowRelationship(!showRelationship)}
              >
                <Calculator className="h-4 w-4 mr-2" />
                {showRelationship ? 'Hide' : 'Show'} Relationship Analysis
              </Button>
            </div>

            {showComparison && (
              <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-blue-50 rounded-lg">
                <h4 className="col-span-2 font-semibold text-blue-800 mb-2">🎵 Hear the Emotional Difference:</h4>
                {RELATIVE_PAIRS.slice(0, 3).map(pair => (
                  <Button
                    key={pair.minor}
                    variant="outline"
                    size="sm"
                    onClick={() => handleComparisonDemo(pair.minor, pair.major)}
                  >
                    {pair.minor} vs {pair.major}
                  </Button>
                ))}
              </div>
            )}

            <PianoKeyboard
              highlightedNotes={selectedNotes}
              onNoteClick={handleNoteClick}
            />
            
            {currentScale && (
              <div className="mt-4 text-center">
                <div className="bg-muted p-4 rounded-lg mb-4">
                  <div className="flex items-center justify-center mb-2">
                    <Badge variant="outline" className="mr-2">{currentScale}</Badge>
                    <Badge className="bg-purple-100 text-purple-800">
                      {currentScale.includes('vs') ? 'Comparison' : 'Natural Minor'}
                    </Badge>
                  </div>
                  
                  {!currentScale.includes('vs') && (
                    <>
                      <p className="font-semibold text-lg mb-2">
                        {(() => {
                          const [tonic] = currentScale.split(' ');
                          const scale = getMinorScale(tonic as Note);
                          return `Notes: ${scale.notes.join(' - ')}`;
                        })()}
                      </p>
                      <p className="text-sm text-muted-foreground mb-3">
                        Relative Major: <strong>{getRelativeMajor(currentScale)}</strong> (shares same key signature)
                      </p>
                    </>
                  )}
                  
                  <div className="flex justify-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleScaleDemo(currentScale.includes('vs') ? 'A Minor' : currentScale)}
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Play Again
                    </Button>
                    {!currentScale.includes('vs') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const relativeMajor = getRelativeMajor(currentScale);
                          handleComparisonDemo(currentScale, relativeMajor);
                        }}
                      >
                        <Heart className="h-4 w-4 mr-1" />
                        Compare with Major
                      </Button>
                    )}
                  </div>
                  
                  {showRelationship && !currentScale.includes('vs') && (
                    <div className="mt-3 p-3 bg-purple-50 rounded text-sm">
                      <p className="font-medium mb-2">Relationship Analysis:</p>
                      <div className="text-left space-y-1">
                        <p className="text-purple-700">
                          • {currentScale} and {getRelativeMajor(currentScale)} share the same notes
                        </p>
                        <p className="text-purple-700">
                          • They have the same key signature
                        </p>
                        <p className="text-purple-700">
                          • The difference is which note feels like "home" (tonic)
                        </p>
                        <p className="text-purple-700">
                          • {currentScale} sounds sad/dark, {getRelativeMajor(currentScale)} sounds happy/bright
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={() => onComplete(Math.round((correctAnswers / testQuestions.length) * 100))} size="lg" className="bg-purple-600 hover:bg-purple-700">
            I Understand Minor Scales
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
              <p className="text-sm text-muted-foreground">Scales Practiced</p>
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
            <CardTitle>🎯 Minor Scale & Relationship Practice</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-purple-800 mb-2">Practice Strategy:</h4>
              <ol className="text-purple-700 text-sm space-y-1">
                <li><strong>1. Pattern Mastery:</strong> Remember W-H-W-W-H-W-W for natural minor</li>
                <li><strong>2. Relative Understanding:</strong> Every minor scale has a major "partner"</li>
                <li><strong>3. Emotional Recognition:</strong> Minor scales sound sad, dark, mysterious</li>
                <li><strong>4. Key Signature Connection:</strong> Relatives share the same key signature</li>
              </ol>
            </div>
            
            <div className="grid grid-cols-3 gap-2 mb-6">
              {MINOR_SCALES.slice(0, 9).map(scale => {
                const scaleName = getScale(scale).name;
                return (
                  <Button
                    key={`${scale.tonic}-${scale.type}`}
                    variant="outline"
                    onClick={() => handleScaleDemo(scaleName)}
                    className="h-12 text-sm"
                  >
                    {scaleName}
                  </Button>
                );
              })}
            </div>
            
            <PianoKeyboard
              highlightedNotes={selectedNotes}
              onNoteClick={handleNoteClick}
            />
            
            {currentScale && !currentScale.includes('vs') && (
              <div className="mt-4 text-center bg-muted p-4 rounded-lg">
                <Badge className="bg-purple-100 text-purple-800 mb-2">
                  Practice: {currentScale}
                </Badge>
                <p className="font-semibold text-lg mb-2">
                  {(() => {
                    const [tonic] = currentScale.split(' ');
                    const scale = getMinorScale(tonic as Note);
                    return `${scale.notes.join(' - ')}`;
                  })()}
                </p>
                <p className="text-sm text-muted-foreground mb-3">
                  Relative Major: <strong>{getRelativeMajor(currentScale)}</strong>
                </p>
                <div className="flex justify-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const [tonic] = currentScale.split(' ');
                      const scale = getMinorScale(tonic as Note);
                      audioEngine.initializeAudio().then(() => {
                        audioEngine.playScale(scale.notes);
                      });
                    }}
                  >
                    <Play className="h-4 w-4 mr-1" />
                    Play Scale
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const relativeMajor = getRelativeMajor(currentScale);
                      handleComparisonDemo(currentScale, relativeMajor);
                    }}
                  >
                    <ArrowRightLeft className="h-4 w-4 mr-1" />
                    Compare with Relative
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
            <span>🎓 Minor Scales Mastery Test</span>
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
                    You've mastered minor scales and their relationships to major scales!
                  </p>
                  <Button onClick={() => onComplete(Math.round((correctAnswers / testQuestions.length) * 100))} size="lg" className="bg-green-600 hover:bg-green-700">
                    Continue to Key Signatures
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
                    You need 6/8 to advance. Focus on relative relationships!
                  </p>
                  <div className="space-y-2 mb-4">
                    <p className="text-sm font-medium">Remember:</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Minor scales use W-H-W-W-H-W-W pattern</li>
                      <li>• Relative major is 3 semitones UP from minor root</li>
                      <li>• Relatives share the same key signature</li>
                      <li>• Minor scales sound sad/dark compared to major</li>
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
                {currentQuestion.type === 'relative_major' ? (
                  <p className="text-lg mb-4">
                    What is the relative major of <strong>{currentQuestion.scale}</strong>?
                  </p>
                ) : currentQuestion.type === 'relative_minor' ? (
                  <p className="text-lg mb-4">
                    What is the relative minor of <strong>{currentQuestion.scale}</strong>?
                  </p>
                ) : currentQuestion.type === 'notes' ? (
                  <>
                    <p className="text-lg mb-4">
                      What are the notes in the <strong>{currentQuestion.scale}</strong> scale?
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Remember the pattern: W-H-W-W-H-W-W
                    </p>
                  </>
                ) : (
                  <p className="text-lg mb-4">
                    How many accidentals does <strong>{currentQuestion.scale}</strong> have?
                  </p>
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const [tonic] = currentQuestion.scale.split(' ');
                      audioEngine.initializeAudio().then(() => {
                        audioEngine.playNote(tonic as Note, 0.8);
                      });
                    }}
                  >
                    <Play className="h-4 w-4 mr-1" />
                    Hear Root Note
                  </Button>
                </div>
                
                {showHint && (
                  <div className="mt-4 p-3 bg-purple-50 rounded-lg text-sm">
                    <p className="font-medium mb-2">💡 Strategy:</p>
                    <div className="text-left">
                      {currentQuestion.type === 'relative_major' && (
                        <div>
                          <p className="text-purple-700 mb-1">
                            The relative major is <strong>3 semitones UP</strong> from the minor root.
                          </p>
                          <p className="text-purple-700">
                            Example: A minor → count up 3 semitones → C major
                          </p>
                        </div>
                      )}
                      {currentQuestion.type === 'relative_minor' && (
                        <div>
                          <p className="text-purple-700 mb-1">
                            The relative minor is <strong>3 semitones DOWN</strong> from the major root.
                          </p>
                          <p className="text-purple-700">
                            Example: C major → count down 3 semitones → A minor
                          </p>
                        </div>
                      )}
                      {currentQuestion.type === 'notes' && (
                        <div>
                          <p className="text-purple-700 mb-1">
                            Use the natural minor pattern: W-H-W-W-H-W-W
                          </p>
                          <p className="text-purple-700">
                            Start on {currentQuestion.scale.split(' ')[0]} and apply the pattern
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {currentQuestion.type.includes('relative') ? (
                <div className="grid grid-cols-2 gap-2">
                  {(() => {
                    if (currentQuestion.type === 'relative_major') {
                      const correctAnswer = getRelativeMajor(currentQuestion.scale);
                      const otherMajors = RELATIVE_PAIRS.filter(p => p.minor !== currentQuestion.scale).map(p => p.major).slice(0, 3);
                      return [correctAnswer, ...otherMajors].sort(() => Math.random() - 0.5).map((option, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          onClick={() => handleTestAnswer(option)}
                          className="h-12"
                        >
                          {option}
                        </Button>
                      ));
                    } else {
                      const correctAnswer = getRelativeMinor(currentQuestion.scale);
                      const otherMinors = RELATIVE_PAIRS.filter(p => p.major !== currentQuestion.scale).map(p => p.minor).slice(0, 3);
                      return [correctAnswer, ...otherMinors].sort(() => Math.random() - 0.5).map((option, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          onClick={() => handleTestAnswer(option)}
                          className="h-12"
                        >
                          {option}
                        </Button>
                      ));
                    }
                  })()}
                </div>
              ) : currentQuestion.type === 'notes' ? (
                <div className="grid grid-cols-2 gap-2">
                  {(() => {
                    const [tonic] = currentQuestion.scale.split(' ');
                    const correctScale = getMinorScale(tonic as Note);
                    const correctAnswer = correctScale.notes.join(', ');
                    
                    // Create plausible wrong answers
                    const wrongAnswers = [
                      // Major version
                      getMajorScale(tonic as Note).notes.join(', '),
                      // With wrong accidentals
                      correctScale.notes.map(note => note.includes('#') ? note.charAt(0) : note.includes('b') ? note.charAt(0) : note).join(', '),
                      // Missing accidentals
                      correctScale.notes.map(note => note.includes('#') ? note.charAt(0) : note).join(', ')
                    ];
                    
                    const allOptions = [correctAnswer, ...wrongAnswers.slice(0, 3)].sort(() => Math.random() - 0.5);
                    
                    return allOptions.map((option, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        onClick={() => handleTestAnswer(option)}
                        className="h-auto p-3 text-left text-sm"
                      >
                        {option}
                      </Button>
                    ));
                  })()}
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {[0, 1, 2, 3, 4, 5, 6, 7].map(num => (
                    <Button
                      key={num}
                      variant="outline"
                      onClick={() => handleTestAnswer(num.toString())}
                      className="h-12 text-lg"
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
                    Excellent! Understanding minor scales opens up so much emotional expression 🎵
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