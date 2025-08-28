import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Music, Play, Check, RotateCcw, ChevronRight, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PianoKeyboard } from '@/components/PianoKeyboard';
import { INTERVALS, buildInterval, getIntervalExplanation } from '@/lib/musicTheory';
import { Note, IntervalType } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { audioEngine } from '@/lib/audio';
import { useUser } from '@/contexts/UserContext';

const START_NOTES: Note[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

interface IntervalExercise {
  startNote: Note;
  interval: IntervalType;
  targetNote: Note;
  explanation: string;
  learningTip: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  mode: 'learn' | 'practice';
}

export default function IntervalPracticePage() {
  const [currentExercise, setCurrentExercise] = useState<IntervalExercise | null>(null);
  const [selectedNotes, setSelectedNotes] = useState<Note[]>([]);
  const [playedNotes, setPlayedNotes] = useState<Note[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [exerciseMode, setExerciseMode] = useState<'learn' | 'practice'>('learn');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentUser } = useUser();

  // Fetch interval progress
  const { data: intervalProgress } = useQuery<any[]>({
    queryKey: ['/api/progress', currentUser?.id, 'intervals'],
    enabled: !!currentUser?.id,
  });

  // Update progress mutation
  const updateProgress = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/progress', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/progress-summary'] });
      queryClient.invalidateQueries({ queryKey: ['/api/progress'] });
    },
  });

  // Record exercise session mutation
  const recordSession = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/exercise-sessions', data);
      return response.json();
    },
  });

  const generateExercise = () => {
    const startNote = START_NOTES[Math.floor(Math.random() * START_NOTES.length)];
    const interval = INTERVALS[Math.floor(Math.random() * INTERVALS.length)];
    const targetNote = buildInterval(startNote, interval.name, 'up');
    const intervalInfo = getIntervalExplanation(interval.name);

    setCurrentExercise({
      startNote,
      interval: interval.name,
      targetNote,
      explanation: intervalInfo.explanation,
      learningTip: intervalInfo.learningTip,
      difficulty: intervalInfo.difficulty,
      mode: exerciseMode,
    });

    setSelectedNotes([]);
    setPlayedNotes([]);
    setIsCompleted(false);
    setShowExplanation(false);
  };

  useEffect(() => {
    if (!currentExercise) {
      generateExercise();
    }
  }, [currentExercise, exerciseMode]);

  const handleNoteToggle = (note: Note) => {
    if (isCompleted && currentExercise?.mode === 'practice') return;
    
    setSelectedNotes(prev => {
      if (prev.includes(note)) {
        return prev.filter(n => n !== note);
      } else {
        return [...prev, note];
      }
    });
  };

  const handleNoteClick = (note: Note) => {
    if (isCompleted && currentExercise?.mode === 'practice') return;
    
    if (currentExercise?.mode === 'practice') {
      const newPlayedNotes = [...playedNotes, note];
      setPlayedNotes(newPlayedNotes);
    }
  };

  const handleCheckAnswer = async () => {
    if (!currentExercise) return;

    let isCorrect: boolean;
    let userAnswer: Note[];

    if (currentExercise.mode === 'learn') {
      userAnswer = [...selectedNotes].sort();
      const correctAnswer = [currentExercise.startNote, currentExercise.targetNote].sort();
      isCorrect = JSON.stringify(userAnswer) === JSON.stringify(correctAnswer);
    } else {
      userAnswer = playedNotes;
      isCorrect = JSON.stringify(playedNotes) === JSON.stringify([currentExercise.startNote, currentExercise.targetNote]);
    }

    // Record the exercise session
    await recordSession.mutateAsync({
      userId: currentUser?.id,
      category: 'intervals',
      itemName: currentExercise.interval,
      isCorrect,
      userAnswer: userAnswer,
      correctAnswer: [currentExercise.startNote, currentExercise.targetNote],
      timeToComplete: Math.floor(Math.random() * 60) + 15
    });

    // Update progress
    const currentProgress = intervalProgress?.find(
      p => p.itemName === currentExercise.interval
    );

    const newAttempts = (currentProgress?.attempts || 0) + 1;
    const newCorrectAnswers = (currentProgress?.correctAnswers || 0) + (isCorrect ? 1 : 0);
    
    let newStatus = currentProgress?.status || 'not_started';
    if (isCorrect && newCorrectAnswers >= 3) {
      newStatus = 'mastered';
    } else if (newAttempts > 0) {
      newStatus = 'in_progress';
    }

    await updateProgress.mutateAsync({
      userId: currentUser?.id,
      category: 'intervals',
      itemName: currentExercise.interval,
      status: newStatus,
      attempts: newAttempts,
      correctAnswers: newCorrectAnswers,
    });

    if (isCorrect) {
      toast({
        title: "Correct!",
        description: `You identified the ${currentExercise.interval} correctly.`,
      });
      setIsCompleted(true);
      setShowExplanation(true);
    } else {
      toast({
        title: "Try Again",
        description: "That's not quite right. Check the interval distance.",
        variant: "destructive",
      });
    }
  };

  const handleReset = () => {
    setSelectedNotes([]);
    setPlayedNotes([]);
    setIsCompleted(false);
    setShowExplanation(false);
  };

  const handleSwitchMode = () => {
    setExerciseMode(prev => prev === 'learn' ? 'practice' : 'learn');
  };

  const handlePlayInterval = async () => {
    if (!currentExercise) return;
    
    try {
      await audioEngine.playNote(currentExercise.startNote, 0.8);
      setTimeout(async () => {
        try {
          await audioEngine.playNote(currentExercise.targetNote, 0.8);
        } catch (error) {
          console.warn('Audio playback failed:', error);
        }
      }, 600);
    } catch (error) {
      console.warn('Audio playback failed:', error);
    }
  };

  if (!currentExercise) {
    return <div className="flex-1 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6">
        <div className="flex items-center mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm" data-testid="button-back">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Practice
            </Button>
          </Link>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Interval Building Practice</h1>
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                onClick={handleSwitchMode}
                data-testid="button-switch-mode"
              >
                Switch to {exerciseMode === 'learn' ? 'Practice' : 'Learn'} Mode
              </Button>
              <Button 
                variant="secondary" 
                onClick={handlePlayInterval}
                data-testid="button-play-interval"
              >
                <Play className="mr-2 h-4 w-4" />Play Interval
              </Button>
            </div>
          </div>
          
          {/* Exercise Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Current Exercise</span>
                <span className="px-3 py-1 bg-primary text-primary-foreground rounded-full text-sm font-medium">
                  {exerciseMode === 'learn' ? 'Learning' : 'Practice'} Mode
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-lg mb-4">
                <p className="text-lg font-medium mb-2" data-testid="interval-task">
                  Build a <strong>{currentExercise.interval}</strong> up from <strong>{currentExercise.startNote}</strong>
                </p>
                <p className="text-muted-foreground mb-3">
                  {exerciseMode === 'learn' ? 
                    'Click both the start note and target note to select them.' :
                    'Click the start note, then the target note in sequence.'
                  }
                </p>
                
                {showExplanation && (
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-3">
                    <div className="flex items-start">
                      <Lightbulb className="h-4 w-4 text-blue-600 mr-2 mt-0.5" />
                      <div>
                        <p className="text-sm text-blue-800 font-medium">About {currentExercise.interval}:</p>
                        <p className="text-sm text-blue-700">{currentExercise.explanation}</p>
                        <p className="text-sm text-blue-700 mt-1">
                          From {currentExercise.startNote} to {currentExercise.targetNote} = {currentExercise.interval}
                        </p>
                        <p className="text-sm text-blue-700 mt-2 font-medium">
                          💡 {currentExercise.learningTip}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {exerciseMode === 'learn' && (
                <div className="text-sm text-muted-foreground mb-4">
                  💡 In Learn Mode: Click keys to select/unselect them. Order doesn't matter.
                </div>
              )}
              {exerciseMode === 'practice' && (
                <div className="text-sm text-muted-foreground mb-4">
                  🎹 In Practice Mode: Click the start note first, then the target note.
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Piano Keyboard */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Piano Keyboard</h3>
              <PianoKeyboard
                highlightedNotes={isCompleted ? [currentExercise.startNote, currentExercise.targetNote] : []}
                playedNotes={exerciseMode === 'practice' ? playedNotes : []}
                selectedNotes={exerciseMode === 'learn' ? selectedNotes : []}
                onNoteClick={handleNoteClick}
                onNoteToggle={exerciseMode === 'learn' ? handleNoteToggle : undefined}
              />
              <div className="mt-4 text-center">
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>
                    Keys highlighted in <span className="text-primary font-medium">blue</span> show correct answers when completed.
                  </p>
                  {exerciseMode === 'learn' && (
                    <p>
                      Keys with <span className="text-blue-600 font-medium">blue background</span> are your current selections.
                    </p>
                  )}
                  {exerciseMode === 'practice' && (
                    <p>
                      Keys highlighted in <span className="text-success font-medium">green</span> show your played sequence.
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Controls */}
          <div className="flex justify-center space-x-4">
            <Button 
              variant="secondary" 
              onClick={handleReset}
              disabled={(exerciseMode === 'learn' ? selectedNotes.length === 0 : playedNotes.length === 0)}
              data-testid="button-reset"
            >
              <RotateCcw className="mr-2 h-4 w-4" />Reset
            </Button>
            <Button 
              onClick={handleCheckAnswer} 
              disabled={(exerciseMode === 'learn' ? selectedNotes.length === 0 : playedNotes.length === 0) || isCompleted}
              data-testid="button-check-answer"
            >
              <Check className="mr-2 h-4 w-4" />Check Answer
            </Button>
            <Button 
              onClick={generateExercise}
              data-testid="button-next-exercise"
            >
              <ChevronRight className="mr-2 h-4 w-4" />Next Exercise
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}