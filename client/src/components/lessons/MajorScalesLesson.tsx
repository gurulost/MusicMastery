import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PianoKeyboard } from '@/components/PianoKeyboard';
import { CheckCircle, ArrowRight, Music, Play, Lightbulb, Brain, Target, Star, Trophy, Calculator, Zap, RotateCcw } from 'lucide-react';
import { Note } from '@shared/schema';
import { audioEngine } from '@/lib/audio';
import { getMajorScale, MAJOR_SCALES, getScalesByDifficulty } from '@/lib/musicTheory';

interface MajorScalesLessonProps {
  section: 'learn' | 'practice' | 'test';
  onComplete: (score?: number) => void;
}

const MAJOR_SCALE_PATTERN = ['W', 'W', 'H', 'W', 'W', 'W', 'H'];
const FOUNDATION_SCALES = ['C Major', 'G Major', 'D Major', 'F Major'];

// Key signature memory aids
const KEY_SIGNATURE_TRICKS = [
  { key: 'C Major', trick: 'No sharps or flats - the natural scale', accidentals: 0 },
  { key: 'G Major', trick: 'One sharp: F# (Father)', accidentals: 1 },
  { key: 'D Major', trick: 'Two sharps: F#, C# (Father Charles)', accidentals: 2 },
  { key: 'A Major', trick: 'Three sharps: F#, C#, G# (Father Charles Goes)', accidentals: 3 },
  { key: 'F Major', trick: 'One flat: Bb (Battle)', accidentals: 1 },
];

export function MajorScalesLesson({ section, onComplete }: MajorScalesLessonProps) {
  const [currentScale, setCurrentScale] = useState<string>('C Major');
  const [selectedNotes, setSelectedNotes] = useState<Note[]>([]);
  const [showPattern, setShowPattern] = useState(false);
  const [practiceCount, setPracticeCount] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [showKeySignature, setShowKeySignature] = useState(false);
  const [testQuestions] = useState(() => {
    // Progressive difficulty: start with easy scales
    const { easy, medium } = getScalesByDifficulty();
    const questions = [];
    
    // Start with C Major and G Major (most fundamental)
    questions.push({ scale: 'C Major', type: 'notes' });
    questions.push({ scale: 'G Major', type: 'notes' });
    
    // Add more from easy and medium difficulty
    easy.slice(2, 4).forEach(scale => questions.push({ scale, type: 'notes' }));
    medium.slice(0, 2).forEach(scale => questions.push({ scale, type: 'notes' }));
    
    // Mix in some key signature questions
    questions.push({ scale: 'D Major', type: 'key_signature' });
    questions.push({ scale: 'F Major', type: 'key_signature' });
    
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

  const handleScaleDemo = async (scaleName: string) => {
    setCurrentScale(scaleName);
    const [tonic] = scaleName.split(' ');
    const scale = getMajorScale(tonic as Note);
    setSelectedNotes(scale.notes);
    setPracticeCount(prev => prev + 1);
    
    // Educational audio sequence
    try {
      await audioEngine.playScale(scale.notes);
      
      // Play in melodic then harmonic pattern for better learning
      setTimeout(() => {
        // Play as broken chord (1-3-5-8)
        const chordTones = [scale.notes[0], scale.notes[2], scale.notes[4], scale.notes[7] || scale.notes[0]];
        chordTones.forEach((note, i) => {
          setTimeout(async () => {
            try {
              await audioEngine.playNote(note, 0.7);
            } catch (error) {
              console.warn('Audio playback failed:', error);
            }
          }, i * 300);
        });
      }, 4000);
    } catch (error) {
      console.warn('Audio playback failed:', error);
    }
  };

  const handleTestAnswer = async (answer: string) => {
    const currentQuestion = testQuestions[currentQuestionIndex];
    let isCorrect = false;
    setAttempts(prev => prev + 1);
    
    if (currentQuestion.type === 'notes') {
      // Check if the scale notes match
      const [tonic] = currentQuestion.scale.split(' ');
      const correctScale = getMajorScale(tonic as Note);
      const correctAnswer = correctScale.notes.join(', ');
      isCorrect = answer === correctAnswer;
    } else if (currentQuestion.type === 'key_signature') {
      // Check key signature (simplified for this lesson)
      const keyData = KEY_SIGNATURE_TRICKS.find(k => k.key === currentQuestion.scale);
      isCorrect = answer === keyData?.accidentals.toString();
    }
    
    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
      // Play success audio
      const [tonic] = currentQuestion.scale.split(' ');
      const scale = getMajorScale(tonic as Note);
      try {
        await audioEngine.playScale(scale.notes.slice(0, 3)); // Play first three notes as success
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
        onComplete();
      }
    }
  };

  const getMasteryLevel = () => {
    const accuracy = correctAnswers / Math.max(attempts, 1);
    if (accuracy >= 0.95) return { level: 'Scale Master', icon: Trophy, color: 'text-purple-600' };
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
              <Music className="h-5 w-5 mr-2" />
              Major Scales: The Foundation of Western Music
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
                <li>• Build any major scale using the universal W-W-H-W-W-W-H pattern</li>
                <li>• Understand why sharps and flats are needed in different keys</li>
                <li>• Connect scale construction to key signatures</li>
                <li>• Recognize major scales by sight and sound</li>
              </ul>
            </div>

            {/* Core Concept - The Universal Pattern */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-3">🎯 The Universal Major Scale Formula</h3>
              <div className="bg-white p-4 rounded border mb-3">
                <div className="grid grid-cols-8 gap-2 text-center mb-2">
                  {MAJOR_SCALE_PATTERN.map((step, i) => (
                    <div key={i} className={`p-2 rounded font-bold ${step === 'W' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {step}
                    </div>
                  ))}
                  <div className="p-2 bg-blue-100 text-blue-800 rounded font-bold">1</div>
                </div>
                <div className="text-center text-sm font-mono">
                  W - W - H - W - W - W - H
                </div>
              </div>
              <div className="space-y-2 text-green-700 text-sm">
                <p><strong>KEY INSIGHT:</strong> This pattern NEVER changes. Whether you start on C, G, F#, or any note.</p>
                <p><strong>W = Whole Step</strong> (skip one key) • <strong>H = Half Step</strong> (next key)</p>
              </div>
            </div>

            {/* Mental Model - Construction Process */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="font-semibold text-purple-800 mb-3">🧠 Scale Building Process</h3>
              <div className="bg-white p-3 rounded border mb-3">
                <p className="font-medium text-purple-800 mb-2">Step-by-Step Method:</p>
                <ol className="text-purple-700 text-sm space-y-1">
                  <li><strong>1. Start:</strong> Choose your tonic (starting note)</li>
                  <li><strong>2. Apply Pattern:</strong> Follow W-W-H-W-W-W-H exactly</li>
                  <li><strong>3. Add Accidentals:</strong> Use ♯ or ♭ to maintain the pattern</li>
                  <li><strong>4. Result:</strong> You have a major scale!</li>
                </ol>
              </div>
              <div className="bg-purple-100 p-3 rounded text-sm">
                <p><strong>💡 Why Accidentals?</strong> The piano's black and white key pattern doesn't naturally fit the major scale pattern everywhere. We use sharps and flats to "adjust" notes so the pattern stays perfect.</p>
              </div>
            </div>

            {/* Worked Example - C Major */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibent text-yellow-800 mb-3">📝 Worked Example: C Major Scale</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-8 gap-1 text-center text-xs">
                  <div className="bg-white p-2 rounded border font-semibold">C</div>
                  <div className="p-1 text-green-600 font-bold">+W</div>
                  <div className="bg-white p-2 rounded border font-semibold">D</div>
                  <div className="p-1 text-green-600 font-bold">+W</div>
                  <div className="bg-white p-2 rounded border font-semibold">E</div>
                  <div className="p-1 text-red-600 font-bold">+H</div>
                  <div className="bg-white p-2 rounded border font-semibold">F</div>
                  <div className="p-1 text-green-600 font-bold">+W</div>
                </div>
                <div className="grid grid-cols-8 gap-1 text-center text-xs">
                  <div className="bg-white p-2 rounded border font-semibold">G</div>
                  <div className="p-1 text-green-600 font-bold">+W</div>
                  <div className="bg-white p-2 rounded border font-semibold">A</div>
                  <div className="p-1 text-green-600 font-bold">+W</div>
                  <div className="bg-white p-2 rounded border font-semibold">B</div>
                  <div className="p-1 text-red-600 font-bold">+H</div>
                  <div className="bg-white p-2 rounded border font-semibold">C</div>
                  <div></div>
                </div>
                <div className="bg-white p-2 rounded border text-center">
                  <strong>Result:</strong> C - D - E - F - G - A - B - C
                </div>
                <p className="text-yellow-700 text-sm">
                  <strong>Why C Major is Special:</strong> It's the only major scale that uses only white keys! This makes it perfect for learning the pattern.
                </p>
              </div>
            </div>

            {/* Worked Example - G Major */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h3 className="font-semibold text-orange-800 mb-3">📝 Worked Example: G Major Scale</h3>
              <div className="space-y-3">
                <p className="text-orange-700 text-sm mb-2">
                  Starting on G, we need to <strong>maintain the same pattern</strong>:
                </p>
                <div className="bg-white p-3 rounded border text-sm">
                  <p>G → (W) → A → (W) → B → (H) → C → (W) → D → (W) → E → (W) → ? → (H) → G</p>
                  <p className="mt-2 text-orange-800">
                    <strong>Problem:</strong> F to G is only a half step, but we need a whole step!
                  </p>
                  <p className="mt-1 text-green-700">
                    <strong>Solution:</strong> Use F# instead of F. Now F# to G is a half step (perfect!)
                  </p>
                </div>
                <div className="bg-white p-2 rounded border text-center">
                  <strong>Result:</strong> G - A - B - C - D - E - F# - G
                </div>
                <p className="text-orange-700 text-sm">
                  <strong>Key Signature:</strong> G Major has one sharp (F#). This tells musicians to always play F# instead of F.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Interactive Discovery */}
        <Card>
          <CardHeader>
            <CardTitle>🎹 Interactive Scale Laboratory</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              <strong>Click different scales</strong> to hear them and see their construction. Notice the pattern!
            </p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {FOUNDATION_SCALES.map(scale => {
                const [tonic] = scale.split(' ');
                const scaleData = getMajorScale(tonic as Note);
                const keyTrick = KEY_SIGNATURE_TRICKS.find(k => k.key === scale);
                
                return (
                  <Button
                    key={scale}
                    variant={currentScale === scale ? 'default' : 'outline'}
                    className="h-20 text-left p-3"
                    onClick={() => handleScaleDemo(scale)}
                  >
                    <div>
                      <div className="font-semibold">{scale}</div>
                      <div className="text-xs text-muted-foreground">
                        {keyTrick?.accidentals === 0 ? 'No accidentals' : 
                         `${keyTrick?.accidentals} ${scaleData.sharps.length > 0 ? 'sharp' : 'flat'}${keyTrick?.accidentals! > 1 ? 's' : ''}`}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {keyTrick?.trick}
                      </div>
                    </div>
                  </Button>
                );
              })}
            </div>

            <PianoKeyboard
              highlightedNotes={selectedNotes}
              onNoteClick={handleNoteClick}
            />
            
            {currentScale && (
              <div className="mt-4 text-center">
                <div className="bg-muted p-4 rounded-lg mb-4">
                  <div className="flex items-center justify-center mb-2">
                    <Badge variant="outline" className="mr-2">{currentScale}</Badge>
                    <Badge className="bg-green-100 text-green-800">Major Scale</Badge>
                  </div>
                  <p className="font-semibold text-lg mb-2">
                    {(() => {
                      const [tonic] = currentScale.split(' ');
                      const scale = getMajorScale(tonic as Note);
                      return `Notes: ${scale.notes.join(' - ')}`;
                    })()}
                  </p>
                  <p className="text-sm text-muted-foreground mb-3">
                    {(() => {
                      const [tonic] = currentScale.split(' ');
                      const scale = getMajorScale(tonic as Note);
                      const keySignature = scale.sharps.length > 0 ? 
                        `${scale.sharps.length} sharp${scale.sharps.length > 1 ? 's' : ''}: ${scale.sharps.join(', ')}` :
                        scale.flats.length > 0 ?
                        `${scale.flats.length} flat${scale.flats.length > 1 ? 's' : ''}: ${scale.flats.join(', ')}` :
                        'No sharps or flats';
                      return `Key signature: ${keySignature}`;
                    })()}
                  </p>
                  
                  <div className="flex justify-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPattern(!showPattern)}
                    >
                      <Lightbulb className="h-4 w-4 mr-1" />
                      {showPattern ? 'Hide' : 'Show'} Pattern
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleScaleDemo(currentScale)}
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Play Again
                    </Button>
                    <Button
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowKeySignature(!showKeySignature)}
                    >
                      <Music className="h-4 w-4 mr-1" />
                      Key Signature
                    </Button>
                  </div>
                  
                  {showPattern && (
                    <div className="mt-3 p-3 bg-blue-50 rounded text-sm">
                      <p className="font-medium mb-2">Scale Construction Pattern:</p>
                      <div className="grid grid-cols-7 gap-1 text-center text-xs">
                        {MAJOR_SCALE_PATTERN.slice(0, 7).map((step, i) => (
                          <div key={i} className={`p-1 rounded ${step === 'W' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {step}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {showKeySignature && (
                    <div className="mt-3 p-3 bg-purple-50 rounded text-sm">
                      <p className="font-medium mb-1">Key Signature Analysis:</p>
                      <p className="text-purple-700">
                        {(() => {
                          const keyTrick = KEY_SIGNATURE_TRICKS.find(k => k.key === currentScale);
                          return keyTrick?.trick || 'Advanced key signature';
                        })()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={() => onComplete()} size="lg" className="bg-blue-600 hover:bg-blue-700">
            I Understand Major Scales
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
            <CardTitle>🎯 Scale Construction Practice</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-green-800 mb-2">Practice Strategy:</h4>
              <ol className="text-green-700 text-sm space-y-1">
                <li><strong>1. Pattern Recognition:</strong> Always use W-W-H-W-W-W-H</li>
                <li><strong>2. Start Simple:</strong> Master C, G, F, D major first</li>
                <li><strong>3. Listen Actively:</strong> All major scales sound "bright" and "happy"</li>
                <li><strong>4. Key Signatures:</strong> Notice how sharps/flats create the pattern</li>
              </ol>
            </div>
            
            <div className="grid grid-cols-3 gap-2 mb-6">
              {MAJOR_SCALES.slice(0, 9).map(scale => (
                <Button
                  key={scale}
                  variant="outline"
                  onClick={() => handleScaleDemo(scale)}
                  className="h-12 text-sm"
                >
                  {scale}
                </Button>
              ))}
            </div>
            
            <PianoKeyboard
              highlightedNotes={selectedNotes}
              onNoteClick={handleNoteClick}
            />
            
            {currentScale && (
              <div className="mt-4 text-center bg-muted p-4 rounded-lg">
                <Badge className="bg-blue-100 text-blue-800 mb-2">
                  Practice: {currentScale}
                </Badge>
                <p className="font-semibold text-lg mb-2">
                  {(() => {
                    const [tonic] = currentScale.split(' ');
                    const scale = getMajorScale(tonic as Note);
                    return `${scale.notes.join(' - ')}`;
                  })()}
                </p>
                <div className="flex justify-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const [tonic] = currentScale.split(' ');
                      const scale = getMajorScale(tonic as Note);
                      audioEngine.playScale(scale.notes);
                    }}
                  >
                    <Play className="h-4 w-4 mr-1" />
                    Play Scale
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowKeySignature(!showKeySignature)}
                  >
                    <Calculator className="h-4 w-4 mr-1" />
                    Analysis
                  </Button>
                </div>
                {showKeySignature && (
                  <div className="mt-3 p-3 bg-blue-50 rounded text-sm">
                    <p className="font-medium mb-1">Construction Analysis:</p>
                    <p className="text-blue-700 mb-2">
                      This scale follows the W-W-H-W-W-W-H pattern starting from {currentScale.split(' ')[0]}.
                    </p>
                    {(() => {
                      const [tonic] = currentScale.split(' ');
                      const scale = getMajorScale(tonic as Note);
                      if (scale.sharps.length > 0) {
                        return <p className="text-blue-700">Sharps needed: {scale.sharps.join(', ')}</p>;
                      } else if (scale.flats.length > 0) {
                        return <p className="text-blue-700">Flats needed: {scale.flats.join(', ')}</p>;
                      } else {
                        return <p className="text-blue-700">No accidentals needed - all white keys!</p>;
                      }
                    })()}
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
            <span>🎓 Major Scales Mastery Test</span>
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
                    🎉 Excellent! Score: {correctAnswers}/{testQuestions.length}
                  </h3>
                  <Badge className="mb-4">{getMasteryLevel().level} Achieved</Badge>
                  <p className="text-success mb-4">
                    You've mastered major scale construction! You can build any major scale using the pattern.
                  </p>
                  <Button onClick={() => onComplete(Math.round((correctAnswers / testQuestions.length) * 100))} size="lg" className="bg-green-600 hover:bg-green-700">
                    Continue to Minor Scales
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
                    You need 6/8 to advance. Focus on the W-W-H-W-W-W-H pattern!
                  </p>
                  <div className="space-y-2 mb-4">
                    <p className="text-sm font-medium">Remember:</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Every major scale uses W-W-H-W-W-W-H pattern</li>
                      <li>• Use sharps or flats to maintain the pattern</li>
                      <li>• C Major has no accidentals (all white keys)</li>
                      <li>• Listen for the "bright, happy" major scale sound</li>
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
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>

              <div className="bg-primary/5 p-6 rounded-lg text-center">
                {currentQuestion.type === 'notes' ? (
                  <>
                    <p className="text-lg mb-4">
                      What are the notes in the <strong>{currentQuestion.scale}</strong> scale?
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Remember the pattern: W-W-H-W-W-W-H
                    </p>
                    <div className="bg-white p-2 rounded border">
                      <PianoKeyboard
                        highlightedNotes={(() => {
                          const [tonic] = currentQuestion.scale.split(' ');
                          return [tonic as Note];
                        })()}
                        onNoteClick={() => {}}
                      />
                      <p className="text-xs text-muted-foreground mt-2">Starting note highlighted</p>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-lg mb-4">
                      How many accidentals (sharps or flats) does <strong>{currentQuestion.scale}</strong> have?
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Count the total number of sharps OR flats in the key signature.
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const [tonic] = currentQuestion.scale.split(' ');
                      audioEngine.playNote(tonic as Note, 0.8);
                    }}
                  >
                    <Play className="h-4 w-4 mr-1" />
                    Hear Starting Note
                  </Button>
                </div>
                
                {showHint && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm">
                    <p className="font-medium mb-2">💡 Construction Strategy:</p>
                    <div className="text-left">
                      {currentQuestion.type === 'notes' ? (
                        <div>
                          <p className="text-blue-700 mb-1">
                            1. Start on {currentQuestion.scale.split(' ')[0]}
                          </p>
                          <p className="text-blue-700 mb-1">
                            2. Apply pattern: W-W-H-W-W-W-H
                          </p>
                          <p className="text-blue-700 mb-1">
                            3. Use sharps/flats to maintain pattern
                          </p>
                          <p className="text-blue-700">
                            4. End on the same note (octave higher)
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-blue-700">
                            Look for patterns: C=0, G=1♯, D=2♯, F=1♭, etc.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {currentQuestion.type === 'notes' ? (
                <div className="grid grid-cols-2 gap-2">
                  {(() => {
                    // Generate options including the correct answer and some distractors
                    const [tonic] = currentQuestion.scale.split(' ');
                    const correctScale = getMajorScale(tonic as Note);
                    const correctAnswer = correctScale.notes.join(', ');
                    
                    // Create plausible wrong answers
                    const wrongAnswers = [
                      // Natural minor version
                      correctScale.notes.map(note => note === 'F#' ? 'F' : note === 'C#' ? 'C' : note).join(', '),
                      // With wrong accidentals
                      correctScale.notes.map(note => note.includes('#') ? note.charAt(0) + 'b' : note).join(', '),
                      // Missing one sharp
                      correctScale.notes.map(note => note === 'F#' ? 'F' : note).join(', ')
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
                    Great work! Each scale you master opens up new musical possibilities 🎵
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