import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, ArrowRight, Music, RotateCcw, Hash, Minus } from 'lucide-react';
import { Note } from '@shared/schema';

interface KeySignaturesLessonProps {
  section: 'learn' | 'practice' | 'test';
  onComplete: () => void;
}

// Circle of Fifths data
const CIRCLE_OF_FIFTHS_SHARPS = [
  { key: 'C', sharps: 0, accidentals: [] },
  { key: 'G', sharps: 1, accidentals: ['F#'] },
  { key: 'D', sharps: 2, accidentals: ['F#', 'C#'] },
  { key: 'A', sharps: 3, accidentals: ['F#', 'C#', 'G#'] },
  { key: 'E', sharps: 4, accidentals: ['F#', 'C#', 'G#', 'D#'] },
  { key: 'B', sharps: 5, accidentals: ['F#', 'C#', 'G#', 'D#', 'A#'] },
  { key: 'F#', sharps: 6, accidentals: ['F#', 'C#', 'G#', 'D#', 'A#', 'E#'] }
];

const CIRCLE_OF_FIFTHS_FLATS = [
  { key: 'F', flats: 1, accidentals: ['Bb'] },
  { key: 'Bb', flats: 2, accidentals: ['Bb', 'Eb'] },
  { key: 'Eb', flats: 3, accidentals: ['Bb', 'Eb', 'Ab'] },
  { key: 'Ab', flats: 4, accidentals: ['Bb', 'Eb', 'Ab', 'Db'] },
  { key: 'Db', flats: 5, accidentals: ['Bb', 'Eb', 'Ab', 'Db', 'Gb'] },
  { key: 'Gb', flats: 6, accidentals: ['Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb'] }
];

const SHARP_ORDER = ['F#', 'C#', 'G#', 'D#', 'A#', 'E#', 'B#'];
const FLAT_ORDER = ['Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb', 'Fb'];

export function KeySignaturesLesson({ section, onComplete }: KeySignaturesLessonProps) {
  const [selectedKey, setSelectedKey] = useState<string>('C');
  const [showMinor, setShowMinor] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [testQuestions] = useState(() => {
    const allKeys = [...CIRCLE_OF_FIFTHS_SHARPS, ...CIRCLE_OF_FIFTHS_FLATS];
    return allKeys.sort(() => Math.random() - 0.5).slice(0, 10);
  });
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const getKeyInfo = (key: string) => {
    const sharpKey = CIRCLE_OF_FIFTHS_SHARPS.find(k => k.key === key);
    if (sharpKey) return { ...sharpKey, type: 'sharps' as const };
    
    const flatKey = CIRCLE_OF_FIFTHS_FLATS.find(k => k.key === key);
    if (flatKey) return { ...flatKey, type: 'flats' as const };
    
    return null;
  };

  const getRelativeMinor = (majorKey: string): string => {
    const majorNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    const keyIndex = majorNotes.indexOf(majorKey);
    if (keyIndex !== -1) {
      const minorIndex = (keyIndex + 5) % 7; // 6 semitones down = 5 positions down in major scale
      return majorNotes[minorIndex];
    }
    
    // Handle sharp/flat keys
    const sharpMinors: {[key: string]: string} = {
      'G': 'E', 'D': 'B', 'A': 'F#', 'E': 'C#', 'B': 'G#', 'F#': 'D#'
    };
    const flatMinors: {[key: string]: string} = {
      'F': 'D', 'Bb': 'G', 'Eb': 'C', 'Ab': 'F', 'Db': 'Bb', 'Gb': 'Eb'
    };
    
    return sharpMinors[majorKey] || flatMinors[majorKey] || majorKey;
  };

  const handleTestAnswer = (answer: number) => {
    const currentQuestion = testQuestions[currentQuestionIndex];
    const correctAnswer = currentQuestion.sharps || currentQuestion.flats || 0;
    const isCorrect = answer === correctAnswer;
    
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
              Key Signatures and Circle of Fifths
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">What are Key Signatures?</h3>
              <p className="text-blue-700 mb-3">
                Key signatures are the sharps or flats written at the beginning of music that tell you which notes to consistently alter throughout the piece.
              </p>
              <p className="text-blue-700 mb-3">
                Instead of writing a sharp or flat sign before every F in a piece, we put F# in the key signature once.
              </p>
              <p className="text-blue-700">
                Key signatures make music notation much cleaner and easier to read!
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2 flex items-center">
                <Hash className="h-4 w-4 mr-1" />
                Sharp Keys - Order Matters!
              </h3>
              <p className="text-green-700 mb-2">
                Sharps are always added in this exact order:
              </p>
              <div className="bg-white p-2 rounded border text-center font-mono">
                F# - C# - G# - D# - A# - E# - B#
              </div>
              <p className="text-green-700 mt-2 text-sm">
                Memory trick: "Father Charles Goes Down And Ends Battle"
              </p>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h3 className="font-semibold text-orange-800 mb-2 flex items-center">
                <Minus className="h-4 w-4 mr-1" />
                Flat Keys - Reverse Order!
              </h3>
              <p className="text-orange-700 mb-2">
                Flats are always added in this exact order (opposite of sharps):
              </p>
              <div className="bg-white p-2 rounded border text-center font-mono">
                Bb - Eb - Ab - Db - Gb - Cb - Fb
              </div>
              <p className="text-orange-700 mt-2 text-sm">
                Memory trick: "Battle Ends And Down Goes Charles's Father"
              </p>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="font-semibold text-purple-800 mb-2">🎯 The Circle of Fifths</h3>
              <p className="text-purple-700 mb-2">
                Moving clockwise around the circle, each key is a perfect fifth higher and adds one sharp.
              </p>
              <p className="text-purple-700">
                Moving counter-clockwise, each key is a perfect fourth higher and adds one flat.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Interactive Key Explorer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="flex items-center space-x-4 mb-4">
                <Button
                  variant={!showMinor ? 'default' : 'outline'}
                  onClick={() => setShowMinor(false)}
                >
                  Major Keys
                </Button>
                <Button
                  variant={showMinor ? 'default' : 'outline'}
                  onClick={() => setShowMinor(true)}
                >
                  Minor Keys
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 mb-6">
              {[...CIRCLE_OF_FIFTHS_SHARPS, ...CIRCLE_OF_FIFTHS_FLATS].map(keyData => (
                <Button
                  key={keyData.key}
                  variant={selectedKey === keyData.key ? 'default' : 'outline'}
                  onClick={() => setSelectedKey(keyData.key)}
                  className="h-12"
                >
                  {showMinor ? `${getRelativeMinor(keyData.key)} minor` : `${keyData.key} Major`}
                </Button>
              ))}
            </div>

            {selectedKey && (
              <div className="bg-muted p-4 rounded-lg">
                {(() => {
                  const keyInfo = getKeyInfo(selectedKey);
                  if (!keyInfo) return null;
                  
                  const displayKey = showMinor ? getRelativeMinor(selectedKey) : selectedKey;
                  const keyType = showMinor ? 'minor' : 'Major';
                  
                  return (
                    <div className="text-center">
                      <h3 className="text-xl font-bold mb-2">
                        {displayKey} {keyType}
                      </h3>
                      <p className="text-lg mb-2">
                        {keyInfo.type === 'sharps' ? (
                          keyInfo.sharps === 0 ? 'No sharps or flats' : 
                          `${keyInfo.sharps} sharp${keyInfo.sharps > 1 ? 's' : ''}`
                        ) : (
                          `${keyInfo.flats} flat${keyInfo.flats > 1 ? 's' : ''}`
                        )}
                      </p>
                      {keyInfo.accidentals.length > 0 && (
                        <div className="bg-white p-2 rounded border">
                          <p className="text-sm font-medium mb-1">
                            {keyInfo.type === 'sharps' ? 'Sharps:' : 'Flats:'}
                          </p>
                          <p className="font-mono text-lg">
                            {keyInfo.accidentals.join(', ')}
                          </p>
                        </div>
                      )}
                      {showMinor && (
                        <p className="text-sm text-muted-foreground mt-2">
                          Same key signature as {selectedKey} Major
                        </p>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={onComplete} size="lg">
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
        <Card>
          <CardHeader>
            <CardTitle>Practice: Key Signature Recognition</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Practice identifying key signatures. Click on different keys to see their signatures.
            </p>
            
            <div className="mb-4">
              <h4 className="font-semibold mb-2">Sharp Keys:</h4>
              <div className="grid grid-cols-4 gap-2 mb-4">
                {CIRCLE_OF_FIFTHS_SHARPS.map(keyData => (
                  <Button
                    key={keyData.key}
                    variant="outline"
                    onClick={() => setSelectedKey(keyData.key)}
                    className="h-10 text-sm"
                  >
                    {keyData.key}: {keyData.sharps}♯
                  </Button>
                ))}
              </div>
              
              <h4 className="font-semibold mb-2">Flat Keys:</h4>
              <div className="grid grid-cols-3 gap-2">
                {CIRCLE_OF_FIFTHS_FLATS.map(keyData => (
                  <Button
                    key={keyData.key}
                    variant="outline"
                    onClick={() => setSelectedKey(keyData.key)}
                    className="h-10 text-sm"
                  >
                    {keyData.key}: {keyData.flats}♭
                  </Button>
                ))}
              </div>
            </div>
            
            {selectedKey && (
              <div className="mt-4 text-center bg-muted p-4 rounded-lg">
                {(() => {
                  const keyInfo = getKeyInfo(selectedKey);
                  if (!keyInfo) return null;
                  
                  return (
                    <div>
                      <p className="font-semibold text-lg mb-2">{selectedKey} Major</p>
                      <div className="bg-white p-3 rounded border">
                        {keyInfo.accidentals.length === 0 ? (
                          <p>No sharps or flats</p>
                        ) : (
                          <div>
                            <p className="text-sm font-medium mb-1">
                              {keyInfo.type === 'sharps' ? 'Sharps in order:' : 'Flats in order:'}
                            </p>
                            <p className="font-mono text-lg">
                              {keyInfo.accidentals.join(' - ')}
                            </p>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Relative minor: {getRelativeMinor(selectedKey)} minor
                      </p>
                    </div>
                  );
                })()}
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
            <span>Test: Key Signatures</span>
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
                  <p className="text-success mb-4">Excellent! You've mastered key signatures.</p>
                  <Button onClick={onComplete} size="lg">
                    Continue to Understanding Intervals
                    <ArrowRight className="h-4 w-4 ml-2" />
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
                  How many {currentQuestion.sharps ? 'sharps' : 'flats'} does <strong>{currentQuestion.key} Major</strong> have?
                </p>
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
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}