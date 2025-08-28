import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ArrowRight, Music, Hash, Minus, Brain, Target, Star, Trophy, Lightbulb, Play, Zap, Calculator, Book } from 'lucide-react';

interface KeySignaturesLessonProps {
  section: 'learn' | 'practice' | 'test';
  onComplete: (score?: number) => void;
}

// Order of sharps and flats with memory aids
const SHARP_ORDER = ['F#', 'C#', 'G#', 'D#', 'A#', 'E#', 'B#'];
const FLAT_ORDER = ['Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb', 'Fb'];

// Memory aids for key signatures
const SHARP_MEMORY_AID = "Father Charles Goes Down And Ends Battle";
const FLAT_MEMORY_AID = "Battle Ends And Down Goes Charles's Father";

// Key signature data with progressive difficulty
const KEY_SIGNATURES = [
  // No accidentals
  { key: 'C Major', sharps: 0, flats: 0, notes: [], mnemonic: 'No sharps or flats - the natural key' },
  { key: 'A Minor', sharps: 0, flats: 0, notes: [], mnemonic: 'Relative of C Major - also natural' },
  
  // One sharp
  { key: 'G Major', sharps: 1, flats: 0, notes: ['F#'], mnemonic: 'One sharp: F# (Father)' },
  { key: 'E Minor', sharps: 1, flats: 0, notes: ['F#'], mnemonic: 'Relative of G Major - same F#' },
  
  // Two sharps
  { key: 'D Major', sharps: 2, flats: 0, notes: ['F#', 'C#'], mnemonic: 'Two sharps: Father Charles' },
  { key: 'B Minor', sharps: 2, flats: 0, notes: ['F#', 'C#'], mnemonic: 'Relative of D Major' },
  
  // One flat
  { key: 'F Major', sharps: 0, flats: 1, notes: ['Bb'], mnemonic: 'One flat: Bb (Battle)' },
  { key: 'D Minor', sharps: 0, flats: 1, notes: ['Bb'], mnemonic: 'Relative of F Major' },
  
  // Two flats
  { key: 'Bb Major', sharps: 0, flats: 2, notes: ['Bb', 'Eb'], mnemonic: 'Two flats: Battle Ends' },
  { key: 'G Minor', sharps: 0, flats: 2, notes: ['Bb', 'Eb'], mnemonic: 'Relative of Bb Major' },
];

// Circle of Fifths relationships
const CIRCLE_OF_FIFTHS_SHARP = ['C', 'G', 'D', 'A', 'E', 'B', 'F#'];
const CIRCLE_OF_FIFTHS_FLAT = ['C', 'F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb'];

export function KeySignaturesLesson({ section, onComplete }: KeySignaturesLessonProps) {
  const [currentKeySignature, setCurrentKeySignature] = useState(KEY_SIGNATURES[0]);
  const [showCircle, setShowCircle] = useState(false);
  const [showMnemonic, setShowMnemonic] = useState(false);
  const [practiceCount, setPracticeCount] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [testQuestions] = useState(() => {
    // Progressive difficulty - start with basics
    const questions = [];
    
    // Start with the fundamentals
    questions.push({ key: 'C Major', type: 'count' });
    questions.push({ key: 'G Major', type: 'count' });
    questions.push({ key: 'F Major', type: 'count' });
    questions.push({ key: 'D Major', type: 'count' });
    
    // Add identification questions
    questions.push({ key: 'A Minor', type: 'relative' });
    questions.push({ key: 'E Minor', type: 'relative' });
    
    // Advanced questions
    questions.push({ key: 'Bb Major', type: 'count' });
    questions.push({ key: 'B Minor', type: 'relative' });
    
    return questions.sort(() => Math.random() - 0.5).slice(0, 8);
  });
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showHint, setShowHint] = useState(false);

  const handleKeySignatureDemo = (keyData: typeof KEY_SIGNATURES[0]) => {
    setCurrentKeySignature(keyData);
    setPracticeCount(prev => prev + 1);
  };

  const handleTestAnswer = (answer: number) => {
    const currentQuestion = testQuestions[currentQuestionIndex];
    const keyData = KEY_SIGNATURES.find(k => k.key === currentQuestion.key);
    let isCorrect = false;
    setAttempts(prev => prev + 1);
    
    if (currentQuestion.type === 'count') {
      const correctAnswer = keyData ? (keyData.sharps > 0 ? keyData.sharps : keyData.flats) : 0;
      isCorrect = answer === correctAnswer;
    } else if (currentQuestion.type === 'relative') {
      // For now, simplified to just count accidentals
      const correctAnswer = keyData?.sharps || keyData?.flats || 0;
      isCorrect = answer === correctAnswer;
    }
    
    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
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
    if (accuracy >= 0.95) return { level: 'Key Master', icon: Trophy, color: 'text-purple-600' };
    if (accuracy >= 0.85) return { level: 'Proficient', icon: Star, color: 'text-green-600' };
    if (accuracy >= 0.70) return { level: 'Developing', icon: Target, color: 'text-blue-600' };
    return { level: 'Learning', icon: Brain, color: 'text-gray-600' };
  };

  const getRelativeMajor = (minorKey: string): string => {
    const relatives: { [key: string]: string } = {
      'A Minor': 'C Major',
      'E Minor': 'G Major',
      'B Minor': 'D Major',
      'D Minor': 'F Major',
      'G Minor': 'Bb Major',
      'C Minor': 'Eb Major'
    };
    return relatives[minorKey] || 'Unknown';
  };

  const getRelativeMinor = (majorKey: string): string => {
    const relatives: { [key: string]: string } = {
      'C Major': 'A Minor',
      'G Major': 'E Minor',
      'D Major': 'B Minor',
      'F Major': 'D Minor',
      'Bb Major': 'G Minor',
      'Eb Major': 'C Minor'
    };
    return relatives[majorKey] || 'Unknown';
  };

  if (section === 'learn') {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Music className="h-5 w-5 mr-2" />
              Key Signatures: The Musical Road Map
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
                <li>• Read and identify key signatures instantly</li>
                <li>• Understand the Circle of Fifths pattern</li>
                <li>• Connect key signatures to major and minor scales</li>
                <li>• Use memory aids to remember sharp and flat orders</li>
              </ul>
            </div>

            {/* Core Concept - What Key Signatures Do */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-3">🗺️ Key Signatures: Your Musical GPS</h3>
              <div className="space-y-3">
                <div className="bg-white p-3 rounded border">
                  <p className="font-medium text-green-800 mb-2">What They Tell You:</p>
                  <p className="text-green-700 text-sm mb-2">
                    Key signatures appear right after the clef and tell you which notes to play sharp or flat <strong>throughout the entire piece</strong>.
                  </p>
                  <p className="text-green-700 text-sm">
                    <strong>Think of it as:</strong> A standing instruction that affects every occurrence of those note names.
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded">
                  <p className="font-medium text-green-800 mb-1">Example:</p>
                  <p className="text-green-700 text-sm">
                    If you see F# in the key signature, <strong>every F in the music</strong> becomes F# automatically.
                  </p>
                </div>
              </div>
            </div>

            {/* Mental Model - The Two Systems */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="font-semibold text-purple-800 mb-3">⚖️ Two Systems: Sharps vs Flats</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white p-3 rounded border">
                  <div className="flex items-center mb-2">
                    <Hash className="h-4 w-4 mr-2 text-green-600" />
                    <p className="font-medium text-purple-800">Sharp Keys</p>
                  </div>
                  <p className="text-purple-700 text-sm mb-2">
                    Always appear in the same order: <strong>F# C# G# D# A# E# B#</strong>
                  </p>
                  <p className="text-purple-700 text-sm">
                    Memory aid: "{SHARP_MEMORY_AID}"
                  </p>
                </div>
                <div className="bg-white p-3 rounded border">
                  <div className="flex items-center mb-2">
                    <Minus className="h-4 w-4 mr-2 text-orange-600" />
                    <p className="font-medium text-purple-800">Flat Keys</p>
                  </div>
                  <p className="text-purple-700 text-sm mb-2">
                    Always appear in the same order: <strong>Bb Eb Ab Db Gb Cb Fb</strong>
                  </p>
                  <p className="text-purple-700 text-sm">
                    Memory aid: "{FLAT_MEMORY_AID}"
                  </p>
                </div>
              </div>
              <div className="mt-3 bg-purple-100 p-3 rounded text-sm">
                <p><strong>🧠 Key Insight:</strong> Sharps and flats NEVER mix in a key signature. It's always all sharps OR all flats!</p>
              </div>
            </div>

            {/* The Circle of Fifths Preview */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-800 mb-3">🔄 The Circle of Fifths Pattern</h3>
              <div className="space-y-3">
                <div className="bg-white p-3 rounded border">
                  <p className="font-medium text-yellow-800 mb-2">The Magic Pattern:</p>
                  <p className="text-yellow-700 text-sm mb-2">
                    Moving clockwise around the circle, each key has <strong>one more sharp</strong> than the previous.
                  </p>
                  <p className="text-yellow-700 text-sm">
                    Moving counter-clockwise, each key has <strong>one more flat</strong> than the previous.
                  </p>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center text-sm">
                  <div className="bg-yellow-100 p-2 rounded">
                    <p className="font-bold">C</p>
                    <p className="text-xs">0 accidentals</p>
                  </div>
                  <div className="bg-yellow-100 p-2 rounded">
                    <p className="font-bold">G</p>
                    <p className="text-xs">1 sharp</p>
                  </div>
                  <div className="bg-yellow-100 p-2 rounded">
                    <p className="font-bold">D</p>
                    <p className="text-xs">2 sharps</p>
                  </div>
                  <div className="bg-yellow-100 p-2 rounded">
                    <p className="font-bold">A</p>
                    <p className="text-xs">3 sharps</p>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center text-sm">
                  <div className="bg-yellow-100 p-2 rounded">
                    <p className="font-bold">C</p>
                    <p className="text-xs">0 accidentals</p>
                  </div>
                  <div className="bg-yellow-100 p-2 rounded">
                    <p className="font-bold">F</p>
                    <p className="text-xs">1 flat</p>
                  </div>
                  <div className="bg-yellow-100 p-2 rounded">
                    <p className="font-bold">Bb</p>
                    <p className="text-xs">2 flats</p>
                  </div>
                  <div className="bg-yellow-100 p-2 rounded">
                    <p className="font-bold">Eb</p>
                    <p className="text-xs">3 flats</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Rules for Identification */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h3 className="font-semibold text-orange-800 mb-3">⚡ Quick Identification Rules</h3>
              <div className="space-y-3">
                <div className="bg-white p-3 rounded border">
                  <p className="font-medium text-orange-800 mb-2">For Sharp Keys:</p>
                  <p className="text-orange-700 text-sm">
                    The key name is <strong>one semitone up</strong> from the last sharp.
                  </p>
                  <p className="text-orange-700 text-xs mt-1">
                    Example: Last sharp is C#, so the key is D Major.
                  </p>
                </div>
                <div className="bg-white p-3 rounded border">
                  <p className="font-medium text-orange-800 mb-2">For Flat Keys:</p>
                  <p className="text-orange-700 text-sm">
                    The key name is the <strong>second-to-last flat</strong>.
                  </p>
                  <p className="text-orange-700 text-xs mt-1">
                    Example: Flats are Bb, Eb, so the key is Bb Major.
                  </p>
                </div>
                <div className="bg-orange-100 p-2 rounded text-sm">
                  <p className="font-medium">Special case: F Major (1 flat) - just memorize this one!</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Interactive Exploration */}
        <Card>
          <CardHeader>
            <CardTitle>🎹 Interactive Key Signature Lab</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              <strong>Explore different key signatures</strong> and see how they connect to major and minor scales.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
              {KEY_SIGNATURES.slice(0, 6).map(keyData => (
                <Button
                  key={keyData.key}
                  variant={currentKeySignature.key === keyData.key ? 'default' : 'outline'}
                  className="h-16 text-left p-3"
                  onClick={() => handleKeySignatureDemo(keyData)}
                >
                  <div>
                    <div className="font-semibold text-sm">{keyData.key}</div>
                    <div className="text-xs text-muted-foreground">
                      {keyData.sharps > 0 ? `${keyData.sharps} sharp${keyData.sharps > 1 ? 's' : ''}` :
                       keyData.flats > 0 ? `${keyData.flats} flat${keyData.flats > 1 ? 's' : ''}` :
                       'No accidentals'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {keyData.notes.join(', ') || 'Natural'}
                    </div>
                  </div>
                </Button>
              ))}
            </div>

            <div className="mb-4 flex space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowCircle(!showCircle)}
              >
                <Calculator className="h-4 w-4 mr-2" />
                {showCircle ? 'Hide' : 'Show'} Circle of Fifths
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowMnemonic(!showMnemonic)}
              >
                <Book className="h-4 w-4 mr-2" />
                {showMnemonic ? 'Hide' : 'Show'} Memory Aids
              </Button>
            </div>

            {showCircle && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-3">🔄 Circle of Fifths</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium text-blue-800 mb-2">Sharp Keys (Clockwise):</p>
                    <div className="space-y-1 text-sm">
                      {CIRCLE_OF_FIFTHS_SHARP.map((key, index) => (
                        <div key={key} className="flex justify-between bg-white p-2 rounded">
                          <span>{key} Major</span>
                          <span className="text-muted-foreground">{index} sharp{index !== 1 ? 's' : ''}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-blue-800 mb-2">Flat Keys (Counter-clockwise):</p>
                    <div className="space-y-1 text-sm">
                      {CIRCLE_OF_FIFTHS_FLAT.map((key, index) => (
                        <div key={key} className="flex justify-between bg-white p-2 rounded">
                          <span>{key} Major</span>
                          <span className="text-muted-foreground">{index} flat{index !== 1 ? 's' : ''}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {showMnemonic && (
              <div className="mb-6 p-4 bg-purple-50 rounded-lg">
                <h4 className="font-semibold text-purple-800 mb-3">🧠 Memory Aids</h4>
                <div className="space-y-3">
                  <div className="bg-white p-3 rounded border">
                    <p className="font-medium text-purple-800 mb-1">Sharp Order:</p>
                    <p className="text-purple-700 text-sm mb-1">F# C# G# D# A# E# B#</p>
                    <p className="text-purple-700 text-xs">"{SHARP_MEMORY_AID}"</p>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <p className="font-medium text-purple-800 mb-1">Flat Order:</p>
                    <p className="text-purple-700 text-sm mb-1">Bb Eb Ab Db Gb Cb Fb</p>
                    <p className="text-purple-700 text-xs">"{FLAT_MEMORY_AID}"</p>
                  </div>
                </div>
              </div>
            )}

            <div className="text-center">
              <div className="bg-muted p-4 rounded-lg mb-4">
                <div className="flex items-center justify-center mb-2">
                  <Badge variant="outline" className="mr-2">{currentKeySignature.key}</Badge>
                  <Badge className={`${currentKeySignature.sharps > 0 ? 'bg-green-100 text-green-800' : currentKeySignature.flats > 0 ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'}`}>
                    {currentKeySignature.sharps > 0 ? `${currentKeySignature.sharps} Sharp${currentKeySignature.sharps > 1 ? 's' : ''}` :
                     currentKeySignature.flats > 0 ? `${currentKeySignature.flats} Flat${currentKeySignature.flats > 1 ? 's' : ''}` :
                     'No Accidentals'}
                  </Badge>
                </div>
                <p className="font-semibold text-lg mb-2">
                  {currentKeySignature.notes.length > 0 ? 
                    `Accidentals: ${currentKeySignature.notes.join(', ')}` : 
                    'All natural notes'}
                </p>
                <p className="text-sm text-muted-foreground mb-3">
                  {currentKeySignature.mnemonic}
                </p>
                <p className="text-sm text-muted-foreground">
                  {currentKeySignature.key.includes('Major') ? 
                    `Relative Minor: ${getRelativeMinor(currentKeySignature.key)}` :
                    `Relative Major: ${getRelativeMajor(currentKeySignature.key)}`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={() => onComplete(Math.round((correctAnswers / testQuestions.length) * 100))} size="lg" className="bg-blue-600 hover:bg-blue-700">
            I Understand Key Signatures
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
              <p className="text-sm text-muted-foreground">Keys Practiced</p>
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
            <CardTitle>🎯 Key Signature Recognition Practice</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-blue-800 mb-2">Practice Strategy:</h4>
              <ol className="text-blue-700 text-sm space-y-1">
                <li><strong>1. Pattern Recognition:</strong> Sharps and flats always appear in the same order</li>
                <li><strong>2. Quick Rules:</strong> Sharp key = one semitone up from last sharp</li>
                <li><strong>3. Quick Rules:</strong> Flat key = second-to-last flat (except F Major)</li>
                <li><strong>4. Relative Relationships:</strong> Major and minor relatives share key signatures</li>
              </ol>
            </div>
            
            <div className="grid grid-cols-3 gap-2 mb-6">
              {KEY_SIGNATURES.map(keyData => (
                <Button
                  key={keyData.key}
                  variant="outline"
                  onClick={() => handleKeySignatureDemo(keyData)}
                  className="h-16 text-xs"
                >
                  <div>
                    <div className="font-semibold">{keyData.key}</div>
                    <div className="text-muted-foreground">
                      {keyData.sharps > 0 ? `${keyData.sharps}♯` :
                       keyData.flats > 0 ? `${keyData.flats}♭` : '♮'}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
            
            <div className="text-center bg-muted p-4 rounded-lg">
              <Badge className="bg-blue-100 text-blue-800 mb-2">
                Practice: {currentKeySignature.key}
              </Badge>
              <p className="font-semibold text-lg mb-2">
                {currentKeySignature.notes.length > 0 ? 
                  `Key Signature: ${currentKeySignature.notes.join(', ')}` : 
                  'Key Signature: No accidentals'}
              </p>
              <p className="text-sm text-muted-foreground mb-3">
                {currentKeySignature.mnemonic}
              </p>
              <div className="flex justify-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCircle(!showCircle)}
                >
                  <Calculator className="h-4 w-4 mr-1" />
                  Circle Position
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMnemonic(!showMnemonic)}
                >
                  <Book className="h-4 w-4 mr-1" />
                  Memory Aid
                </Button>
              </div>
            </div>
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
            <span>🎓 Key Signatures Mastery Test</span>
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
                  <Trophy className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-success">
                    🎉 Excellent! Score: {correctAnswers}/{testQuestions.length}
                  </h3>
                  <Badge className="mb-4">{getMasteryLevel().level} Achieved</Badge>
                  <p className="text-success mb-4">
                    You've mastered key signatures! You can now identify keys quickly and accurately.
                  </p>
                  <Button onClick={() => onComplete(Math.round((correctAnswers / testQuestions.length) * 100))} size="lg" className="bg-green-600 hover:bg-green-700">
                    Continue to Understanding Intervals
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
                    You need 6/8 to advance. Review the Circle of Fifths pattern!
                  </p>
                  <div className="space-y-2 mb-4">
                    <p className="text-sm font-medium">Remember:</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Sharps and flats always appear in the same order</li>
                      <li>• Sharp key = one semitone up from last sharp</li>
                      <li>• Flat key = second-to-last flat (except F Major)</li>
                      <li>• Relative major and minor share the same key signature</li>
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
                <p className="text-lg mb-4">
                  How many {(() => {
                    const keyData = KEY_SIGNATURES.find(k => k.key === currentQuestion.key);
                    return keyData && 'sharps' in keyData && keyData.sharps > 0 ? 'sharps' : 'flats';
                  })()} does <strong>{currentQuestion.key} Major</strong> have?
                </p>
                
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
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm">
                    <p className="font-medium mb-2">💡 Quick Strategy:</p>
                    <div className="text-left">
                      {(() => {
                        const keyData = KEY_SIGNATURES.find(k => k.key === currentQuestion.key);
                        if (keyData && keyData.sharps > 0) {
                          return (
                            <div>
                              <p className="text-blue-700 mb-1">
                                This is a sharp key. Use the Circle of Fifths:
                              </p>
                              <p className="text-blue-700">
                                C(0) → G(1) → D(2) → A(3) → E(4)...
                              </p>
                            </div>
                          );
                        } else if (keyData && keyData.flats > 0) {
                          return (
                            <div>
                              <p className="text-blue-700 mb-1">
                                This is a flat key. Use the Circle of Fifths:
                              </p>
                              <p className="text-blue-700">
                                C(0) → F(1) → Bb(2) → Eb(3) → Ab(4)...
                              </p>
                            </div>
                          );
                        } else {
                          return (
                            <div>
                              <p className="text-blue-700">
                                C Major is the natural key with no sharps or flats.
                              </p>
                            </div>
                          );
                        }
                      })()}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-4 gap-2">
                {[0, 1, 2, 3, 4, 5, 6, 7].map(num => (
                  <Button
                    key={num}
                    variant="outline"
                    onClick={() => handleTestAnswer(num)}
                    className="h-12 text-lg"
                  >
                    {num}
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
                    Great work! Key signatures are the roadmap to understanding any piece of music 🎵
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