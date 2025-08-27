import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PianoKeyboard } from '@/components/PianoKeyboard';
import { CheckCircle, ArrowRight, Music, Play, Lightbulb } from 'lucide-react';
import { Note } from '@shared/schema';
import { audioEngine } from '@/lib/audio';
import { getMajorScale, MAJOR_SCALES } from '@/lib/musicTheory';

interface MajorScalesLessonProps {
  section: 'learn' | 'practice' | 'test';
  onComplete: () => void;
}

const MAJOR_SCALE_PATTERN = ['W', 'W', 'H', 'W', 'W', 'W', 'H'];
const EXAMPLE_SCALES = ['C Major', 'G Major', 'D Major', 'F Major'];

export function MajorScalesLesson({ section, onComplete }: MajorScalesLessonProps) {
  const [currentScale, setCurrentScale] = useState<string>('C Major');
  const [selectedNotes, setSelectedNotes] = useState<Note[]>([]);
  const [showPattern, setShowPattern] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [testQuestions] = useState(() => {
    return MAJOR_SCALES.sort(() => Math.random() - 0.5).slice(0, 8);
  });
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const handleNoteClick = (note: Note) => {
    audioEngine.playNote(note, 0.8);
  };

  const handleScaleDemo = (scaleName: string) => {
    setCurrentScale(scaleName);
    const [tonic] = scaleName.split(' ');
    const scale = getMajorScale(tonic as Note);
    setSelectedNotes(scale.notes);
    audioEngine.playScale(scale.notes);
  };

  const handlePracticeAnswer = (scaleName: string) => {
    const [tonic] = scaleName.split(' ');
    const scale = getMajorScale(tonic as Note);
    setSelectedNotes(scale.notes);
    setCurrentScale(scaleName);
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
              Building Major Scales
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">The Universal Pattern</h3>
              <p className="text-blue-700 mb-3">
                ALL major scales follow the exact same pattern of whole (W) and half (H) steps:
              </p>
              <div className="bg-white p-3 rounded border text-center font-mono text-lg">
                W - W - H - W - W - W - H
              </div>
              <p className="text-blue-700 mt-3">
                This pattern NEVER changes. What changes is which notes you start on.
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2">C Major - The Foundation</h3>
              <p className="text-green-700 mb-2">
                C Major is special because it uses only white keys on the piano.
              </p>
              <div className="grid grid-cols-8 gap-2 text-center text-sm">
                <div className="bg-white p-2 rounded border font-semibold">C</div>
                <div className="text-green-600 font-bold">W</div>
                <div className="bg-white p-2 rounded border font-semibold">D</div>
                <div className="text-green-600 font-bold">W</div>
                <div className="bg-white p-2 rounded border font-semibold">E</div>
                <div className="text-red-600 font-bold">H</div>
                <div className="bg-white p-2 rounded border font-semibold">F</div>
                <div className="text-green-600 font-bold">W</div>
              </div>
              <div className="grid grid-cols-8 gap-2 text-center text-sm mt-1">
                <div className="bg-white p-2 rounded border font-semibold">G</div>
                <div className="text-green-600 font-bold">W</div>
                <div className="bg-white p-2 rounded border font-semibold">A</div>
                <div className="text-green-600 font-bold">W</div>
                <div className="bg-white p-2 rounded border font-semibold">B</div>
                <div className="text-red-600 font-bold">H</div>
                <div className="bg-white p-2 rounded border font-semibold">C</div>
                <div></div>
              </div>
              <p className="text-green-700 mt-2">
                Notice: Half steps occur naturally between E-F and B-C (no black keys between them).
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-800 mb-2">🎯 Key Insight</h3>
              <p className="text-yellow-700">
                When you start on a different note, you'll need sharps or flats to maintain the W-W-H-W-W-W-H pattern. 
                This is how we get the different key signatures!
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
                      {scale === 'C Major' ? 'No sharps/flats' : 
                       scale === 'G Major' ? '1 sharp (F#)' :
                       scale === 'D Major' ? '2 sharps (F#, C#)' :
                       '1 flat (Bb)'}
                    </div>
                  </div>
                </Button>
              ))}
            </div>

            <PianoKeyboard
              highlightedNotes={selectedNotes}
              onNoteClick={handleNoteClick}
            />
            
            {currentScale && (
              <div className="mt-4 text-center">
                <div className="bg-muted p-3 rounded-lg">
                  <p className="font-semibold text-lg">{currentScale}</p>
                  <p className="text-sm text-muted-foreground">
                    {(() => {
                      const [tonic] = currentScale.split(' ');
                      const scale = getMajorScale(tonic as Note);
                      return `Notes: ${scale.notes.join(' - ')}`;
                    })()}
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="mt-2"
                  onClick={() => setShowPattern(!showPattern)}
                >
                  <Lightbulb className="h-4 w-4 mr-2" />
                  {showPattern ? 'Hide' : 'Show'} Step Pattern
                </Button>
                {showPattern && (
                  <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                    Pattern: {MAJOR_SCALE_PATTERN.join(' - ')}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={onComplete} size="lg">
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
        <Card>
          <CardHeader>
            <CardTitle>Practice: Build Major Scales</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Practice building different major scales. Click on a scale to see its notes and hear how it sounds.
            </p>
            
            <div className="grid grid-cols-3 gap-2 mb-4">
              {EXAMPLE_SCALES.concat(['A Major', 'E Major', 'B Major', 'Bb Major', 'Eb Major']).map(scale => (
                <Button
                  key={scale}
                  variant="outline"
                  onClick={() => handlePracticeAnswer(scale)}
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
                    const scale = getMajorScale(tonic as Note);
                    const keySignature = scale.sharps.length > 0 ? 
                      `${scale.sharps.length} sharp${scale.sharps.length > 1 ? 's' : ''}: ${scale.sharps.join(', ')}` :
                      scale.flats.length > 0 ?
                      `${scale.flats.length} flat${scale.flats.length > 1 ? 's' : ''}: ${scale.flats.join(', ')}` :
                      'No sharps or flats';
                    return `Key signature: ${keySignature}`;
                  })()}
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    const [tonic] = currentScale.split(' ');
                    const scale = getMajorScale(tonic as Note);
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
            <span>Test: Major Scales</span>
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
                  <p className="text-success mb-4">Excellent! You've mastered major scales.</p>
                  <Button onClick={onComplete} size="lg">
                    Continue to Minor Scales
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
                  What are the notes in the <strong>{currentQuestion}</strong> scale?
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Remember the pattern: W-W-H-W-W-W-H
                </p>
                <div className="bg-white p-2 rounded border">
                  <PianoKeyboard
                    highlightedNotes={(() => {
                      const [tonic] = currentQuestion.split(' ');
                      return [tonic as Note];
                    })()}
                    onNoteClick={() => {}}
                  />
                  <p className="text-xs text-muted-foreground mt-2">Starting note highlighted</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                {(() => {
                  // Generate options including the correct answer and some distractors
                  const [tonic] = currentQuestion.split(' ');
                  const correctScale = getMajorScale(tonic as Note);
                  const correctAnswer = correctScale.notes.join(', ');
                  
                  // Create some plausible wrong answers
                  const wrongAnswers = [
                    // Natural minor version
                    correctScale.notes.slice(0, -1).concat([correctScale.notes[0]]).join(', '),
                    // With wrong accidentals
                    correctScale.notes.map(note => note === 'F#' ? 'F' : note === 'C#' ? 'C' : note).join(', '),
                    // Missing accidental
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
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}