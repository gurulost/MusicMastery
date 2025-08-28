import { useState, useEffect, useRef } from 'react';
import { Link } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Music, Play, Check, RotateCcw, ChevronRight, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PianoKeyboard } from '@/components/PianoKeyboard';
import { INTERVALS, buildInterval, getIntervalExplanation, normalizeNote, areNotesEqual } from '@/lib/musicTheory';
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
  const [completionTime, setCompletionTime] = useState<number | null>(null);
  const [streakCount, setStreakCount] = useState(0);
  const [bestTime, setBestTime] = useState<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
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

  const generateExercise = (specificInterval?: string) => {
    // Check URL parameters for specific interval practice
    const urlParams = new URLSearchParams(window.location.search);
    const urlInterval = specificInterval || urlParams.get('interval');
    
    const startNote = START_NOTES[Math.floor(Math.random() * START_NOTES.length)];
    let interval;
    
    if (urlInterval) {
      // Find specific interval or fallback to random
      interval = INTERVALS.find(i => i.name === urlInterval) || INTERVALS[Math.floor(Math.random() * INTERVALS.length)];
    } else {
      interval = INTERVALS[Math.floor(Math.random() * INTERVALS.length)];
    }
    
    const targetNote = buildInterval(startNote, interval.name, 'up');
    const intervalInfo = getIntervalExplanation(interval.name);

    setCurrentExercise({
      startNote,
      interval: interval.name,
      targetNote,
      explanation: intervalInfo.explanation,
      learningTip: intervalInfo.learningTip,
      difficulty: intervalInfo.difficulty,
      mode: 'learn',
    });

    setSelectedNotes([]);
    setPlayedNotes([]);
    setIsCompleted(false);
    setShowExplanation(false);
    setCompletionTime(null);
    
    // Record exercise start time
    startTimeRef.current = Date.now();
    
    // Clear URL parameters after loading specific interval
    if (urlInterval) {
      window.history.replaceState({}, '', window.location.pathname);
    }
  };

  useEffect(() => {
    if (!currentExercise) {
      generateExercise();
    }
  }, [currentExercise]);

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

    const userAnswer = [...selectedNotes];
    const correctAnswer = [currentExercise.startNote, currentExercise.targetNote];
    const isCorrect = areNotesEqual(userAnswer, correctAnswer, false);
    
    // Calculate completion time
    const timeTaken = startTimeRef.current ? Math.round((Date.now() - startTimeRef.current) / 1000) : 0;
    setCompletionTime(timeTaken);

    // Record the exercise session
    await recordSession.mutateAsync({
      userId: currentUser?.id,
      category: 'intervals',
      itemName: currentExercise.interval,
      isCorrect,
      userAnswer: userAnswer,
      correctAnswer: [currentExercise.startNote, currentExercise.targetNote],
      timeToComplete: startTimeRef.current ? Math.round((Date.now() - startTimeRef.current) / 1000) : 0
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

    // Update best time and streak
    if (!bestTime || timeTaken < bestTime) {
      setBestTime(timeTaken);
    }
    
    if (isCorrect) {
      const newStreak = streakCount + 1;
      setStreakCount(newStreak);
      
      const timeMessage = timeTaken <= 5 ? 'Lightning fast! ⚡' : timeTaken <= 10 ? 'Great speed! 🚀' : timeTaken <= 15 ? 'Good timing! ⏱️' : 'Keep practicing for speed! 📈';
      
      let streakMessage = newStreak >= 5 ? ` • ${newStreak} in a row! 🔥` : 
                         newStreak >= 3 ? ` • ${newStreak} streak! 🎯` : '';
      
      // Add educational info about the interval
      const educationalNote = `${currentExercise.explanation.split('.')[0]}.`;
      
      toast({
        title: "🎉 Perfect!",
        description: `${timeMessage} (${timeTaken}s)${streakMessage}\n${educationalNote}`,
      });
      setIsCompleted(true);
      setShowExplanation(true);
      
      // Auto-progress to next exercise after a brief delay
      setTimeout(() => {
        generateExercise();
      }, 2500);
    } else {
      // Reset streak on incorrect answer
      setStreakCount(0);
      
      // Provide helpful educational hints
      const hintText = currentExercise.learningTip;
      
      toast({
        title: "Keep trying! 🎵",
        description: `${hintText}\nRemember to click both the starting note and the target note.`,
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

  const handleNextExercise = () => {
    setCompletionTime(null);
    generateExercise();
  };
  
  const generateRandomExercise = () => {
    generateExercise();
  };

  const handlePlayInterval = async () => {
    if (!currentExercise) return;
    
    try {
      // Ensure audio is initialized on user interaction
      await audioEngine.initializeAudio();
      
      // Play interval with correct octaves
      await audioEngine.playInterval(
        normalizeNote(currentExercise.startNote), 
        normalizeNote(currentExercise.targetNote), 
        'up', // intervals in practice always go up
        4, // base octave
        'both' // play both melodically and harmonically
      );
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
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-4">
            <h1 className="text-3xl font-bold">Interval Building Practice</h1>
          </div>
          
          {/* Streak and timing displays */}
          <div className="flex items-center gap-4 mb-6">
            {streakCount > 0 && (
              <div className="bg-orange-50 border border-orange-200 px-3 py-1 rounded-full">
                <span className="text-sm font-medium text-orange-800">
                  🔥 {streakCount} streak!
                </span>
              </div>
            )}
            {bestTime && (
              <div className="bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
                <span className="text-sm font-medium text-blue-800">
                  ⚡ Best: {bestTime}s
                </span>
              </div>
            )}
            {completionTime && isCompleted && (
              <div className="bg-green-50 border border-green-200 px-3 py-1 rounded-full">
                <span className="text-sm font-medium text-green-800">
                  ⏱️ Last: {completionTime}s
                </span>
              </div>
            )}
          </div>
          
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-6">
            <Button 
              variant="secondary" 
              size="sm"
              onClick={handlePlayInterval}
              data-testid="button-play-interval"
            >
              <Play className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Play Interval</span>
              <span className="sm:hidden">Play</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleNextExercise}
              data-testid="button-next-exercise"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Next Interval</span>
              <span className="sm:hidden">Next</span>
            </Button>
          </div>
          
          {/* Exercise Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Current Exercise</span>
                <span className="inline-flex items-center justify-center px-3 py-1 bg-primary text-primary-foreground rounded-full text-sm font-medium">
                  Interval Practice
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-lg mb-4">
                <p className="text-lg font-medium mb-2" data-testid="interval-task">
                  Build a <strong>{currentExercise.interval}</strong> up from <strong>{currentExercise.startNote}</strong>
                </p>
                <p className="text-muted-foreground mb-3">
                  Click both the start note and target note to build this interval. Listen to each note as you click it!
                </p>
                {completionTime && isCompleted && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                    <p className="text-sm text-green-800 font-medium">
                      ⏱️ Completed in {completionTime} seconds! 
                      {completionTime <= 5 && ' Amazing speed! ⚡'}
                      {completionTime > 5 && completionTime <= 10 && ' Great job! 🚀'}
                      {completionTime > 10 && ' Keep practicing to get faster! 📈'}
                    </p>
                  </div>
                )}
                
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
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800 font-medium mb-1">🎹 Interval Building</p>
                <p className="text-sm text-blue-700">Click piano keys to select both notes that form this interval. Order doesn't matter - just find the right notes!</p>
              </div>
            </CardContent>
          </Card>
          
          {/* Piano Keyboard */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Piano Keyboard</h3>
              <PianoKeyboard
                highlightedNotes={isCompleted ? [currentExercise.startNote, currentExercise.targetNote] : []}
                playedNotes={[]}
                selectedNotes={selectedNotes}
                onNoteClick={handleNoteClick}
                onNoteToggle={handleNoteToggle}
              />
              <div className="mt-4 text-center">
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>
                    Keys highlighted in <span className="font-medium" style={{color: 'hsl(142 71% 45%)'}}>green</span> show correct answers when completed.
                  </p>
                  <p>
                    Keys with <span className="font-medium" style={{color: 'hsl(217 91% 60%)'}}>blue background</span> are your current selections.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Controls */}
          <div className="flex justify-center space-x-4">
            <Button 
              variant="secondary" 
              onClick={handleReset}
              disabled={selectedNotes.length === 0}
              data-testid="button-reset"
            >
              <RotateCcw className="mr-2 h-4 w-4" />Reset
            </Button>
            <Button 
              onClick={handleCheckAnswer} 
              disabled={selectedNotes.length === 0 || isCompleted}
              data-testid="button-check-answer"
            >
              <Check className="mr-2 h-4 w-4" />Check Your Answer
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}