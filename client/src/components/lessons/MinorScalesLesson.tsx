import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PianoKeyboard } from '@/components/PianoKeyboard';
import { CheckCircle, ArrowRight, Music, Play, Lightbulb, Link } from 'lucide-react';
import { Note } from '@shared/schema';
import { audioEngine } from '@/lib/audio';
import { getMinorScale, getMajorScale, MINOR_SCALES } from '@/lib/musicTheory';

interface MinorScalesLessonProps {
  section: 'learn' | 'practice' | 'test';
  onComplete: () => void;
}

const MINOR_SCALE_PATTERN = ['W', 'H', 'W', 'W', 'H', 'W', 'W'];
const EXAMPLE_SCALES = ['A Minor', 'E Minor', 'B Minor', 'D Minor'];

// Relative major-minor pairs for explanation
const RELATIVE_PAIRS = [
  { minor: 'A Minor', major: 'C Major' },
  { minor: 'E Minor', major: 'G Major' },
  { minor: 'B Minor', major: 'D Major' },
  { minor: 'D Minor', major: 'F Major' },
];

export function MinorScalesLesson({ section, onComplete }: MinorScalesLessonProps) {
  const [currentScale, setCurrentScale] = useState<string>('A Minor');
  const [selectedNotes, setSelectedNotes] = useState<Note[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [testQuestions] = useState(() => {
    return MINOR_SCALES.sort(() => Math.random() - 0.5).slice(0, 8);
  });
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const handleNoteClick = (note: Note) => {
    audioEngine.playNote(note, 0.8);
  };

  const handleScaleDemo = (scaleName: string) => {
    setCurrentScale(scaleName);
    const [tonic] = scaleName.split(' ');
    const scale = getMinorScale(tonic as Note);
    setSelectedNotes(scale.notes);
    audioEngine.playScale(scale.notes);
  };

  const handleComparisonDemo = (minorScale: string, majorScale: string) => {
    const [minorTonic] = minorScale.split(' ');
    const [majorTonic] = majorScale.split(' ');
    const minorNotes = getMinorScale(minorTonic as Note);
    const majorNotes = getMajorScale(majorTonic as Note);
    
    // Play minor scale first
    audioEngine.playScale(minorNotes.notes);
    
    // Then major scale after a pause
    setTimeout(() => {
      audioEngine.playScale(majorNotes.notes);
    }, 3000);
    
    setSelectedNotes([...minorNotes.notes, ...majorNotes.notes]);
    setCurrentScale(`${minorScale} vs ${majorScale}`);
  };

  const handleTestAnswer = (answer: string) => {
    const currentQuestion = testQuestions[currentQuestionIndex];
    const isCorrect = answer === currentQuestion;
    
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
              Understanding Minor Scales
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="font-semibold text-purple-800 mb-2">The Natural Minor Pattern</h3>
              <p className="text-purple-700 mb-3">
                Natural minor scales follow this pattern of whole (W) and half (H) steps:
              </p>
              <div className="bg-white p-3 rounded border text-center font-mono text-lg">
                W - H - W - W - H - W - W
              </div>
              <p className="text-purple-700 mt-3">
                Compare to major: W-W-H-W-W-W-H. Notice the different placement of half steps!
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">A Minor - The Foundation</h3>
              <p className="text-blue-700 mb-2">
                A Minor is the relative minor of C Major - they share the same notes!
              </p>
              <div className="grid grid-cols-8 gap-2 text-center text-sm">
                <div className="bg-white p-2 rounded border font-semibold">A</div>
                <div className="text-green-600 font-bold">W</div>
                <div className="bg-white p-2 rounded border font-semibold">B</div>
                <div className="text-red-600 font-bold">H</div>
                <div className="bg-white p-2 rounded border font-semibold">C</div>
                <div className="text-green-600 font-bold">W</div>
                <div className="bg-white p-2 rounded border font-semibold">D</div>
                <div className="text-green-600 font-bold">W</div>
              </div>
              <div className="grid grid-cols-8 gap-2 text-center text-sm mt-1">
                <div className="bg-white p-2 rounded border font-semibold">E</div>
                <div className="text-red-600 font-bold">H</div>
                <div className="bg-white p-2 rounded border font-semibold">F</div>
                <div className="text-green-600 font-bold">W</div>
                <div className="bg-white p-2 rounded border font-semibold">G</div>
                <div className="text-green-600 font-bold">W</div>
                <div className="bg-white p-2 rounded border font-semibold">A</div>
                <div></div>
              </div>
              <p className="text-blue-700 mt-2">
                Same white keys as C Major, but starting on A gives it a completely different sound!
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2 flex items-center">
                <Link className="h-4 w-4 mr-1" />
                Relative Major-Minor Relationship
              </h3>
              <p className="text-green-700 mb-2">
                Every minor scale has a relative major that shares the same key signature.
              </p>
              <p className="text-green-700 mb-2">
                The relative major is <strong>3 semitones (minor third) UP</strong> from the minor scale root.
              </p>
              <p className="text-green-700">
                Examples: A minor ↔ C major, E minor ↔ G major, B minor ↔ D major
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-800 mb-2">🎵 The Sound Difference</h3>
              <p className="text-yellow-700">
                Minor scales typically sound more melancholy, sad, or mysterious compared to the bright, 
                happy sound of major scales. This comes from the different interval relationships!
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Interactive Examples - Click to Hear</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {EXAMPLE_SCALES.map(scale => (
                <Button
                  key={scale}
                  variant="outline"
                  className="h-16 text-left"
                  onClick={() => handleScaleDemo(scale)}
                >
                  <div>
                    <div className="font-semibold">{scale}</div>
                    <div className="text-sm text-muted-foreground">
                      Relative to {RELATIVE_PAIRS.find(p => p.minor === scale)?.major}
                    </div>
                  </div>
                </Button>
              ))}
            </div>

            <div className="mb-4">
              <Button
                variant="secondary"
                onClick={() => setShowComparison(!showComparison)}
              >
                <Lightbulb className="h-4 w-4 mr-2" />
                {showComparison ? 'Hide' : 'Show'} Major vs Minor Comparison
              </Button>
            </div>

            {showComparison && (
              <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-blue-50 rounded-lg">
                <h4 className="col-span-2 font-semibold text-blue-800 mb-2">Compare the Sound:</h4>
                {RELATIVE_PAIRS.slice(0, 2).map(pair => (
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
              <div className="mt-4 text-center bg-muted p-3 rounded-lg">
                <p className="font-semibold text-lg">{currentScale}</p>
                {!currentScale.includes('vs') && (
                  <p className="text-sm text-muted-foreground">
                    {(() => {
                      const [tonic] = currentScale.split(' ');
                      const scale = getMinorScale(tonic as Note);
                      return `Notes: ${scale.notes.join(' - ')}`;
                    })()}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={onComplete} size="lg">
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
        <Card>
          <CardHeader>
            <CardTitle>Practice: Build Minor Scales</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Practice building different minor scales. Remember the pattern: W-H-W-W-H-W-W
            </p>
            
            <div className="grid grid-cols-3 gap-2 mb-4">
              {EXAMPLE_SCALES.concat(['F# Minor', 'C Minor', 'G Minor', 'C# Minor']).map(scale => (
                <Button
                  key={scale}
                  variant="outline"
                  onClick={() => {
                    setCurrentScale(scale);
                    const [tonic] = scale.split(' ');
                    const minorScale = getMinorScale(tonic as Note);
                    setSelectedNotes(minorScale.notes);
                  }}
                  className="h-12"
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
              <div className="mt-4 text-center bg-muted p-3 rounded-lg">
                <p className="font-semibold text-lg">{currentScale}</p>
                <p className="text-sm text-muted-foreground">
                  {(() => {
                    const [tonic] = currentScale.split(' ');
                    const scale = getMinorScale(tonic as Note);
                    const relativeMajor = RELATIVE_PAIRS.find(p => p.minor === currentScale)?.major;
                    return `Relative major: ${relativeMajor || 'Unknown'}`;
                  })()}
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    const [tonic] = currentScale.split(' ');
                    const scale = getMinorScale(tonic as Note);
                    audioEngine.playScale(scale.notes);
                  }}
                >
                  <Play className="h-4 w-4 mr-1" />
                  Play Scale
                </Button>
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
            <span>Test: Minor Scales</span>
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
                  <p className="text-success mb-4">Excellent! You've mastered minor scales.</p>
                  <Button onClick={onComplete} size="lg">
                    Continue to Key Signatures
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
                <p className="text-lg mb-2">
                  What is the relative major of <strong>{currentQuestion}</strong>?
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Remember: The relative major is 3 semitones UP from the minor root
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                {(() => {
                  // Find the correct relative major
                  const correctPair = RELATIVE_PAIRS.find(p => p.minor === currentQuestion);
                  const correctAnswer = correctPair?.major || 'Unknown';
                  
                  // Generate some wrong answers
                  const otherMajors = RELATIVE_PAIRS
                    .filter(p => p.minor !== currentQuestion)
                    .map(p => p.major)
                    .slice(0, 3);
                  
                  const allOptions = [correctAnswer, ...otherMajors].sort(() => Math.random() - 0.5);
                  
                  return allOptions.map((option, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      onClick={() => handleTestAnswer(option)}
                      className="h-12"
                    >
                      {option}
                    </Button>
                  ));
                })()}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}