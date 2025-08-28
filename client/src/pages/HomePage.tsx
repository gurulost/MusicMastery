import { useState, useEffect, useRef } from 'react';
import { Link } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Keyboard, CornerLeftUp, ChartLine, Settings, Play, Check, RotateCcw, ChevronLeft, ChevronRight, BookOpen, Target, Award, TrendingUp } from 'lucide-react';
import { UserSwitcher } from '@/components/UserSwitcher';
import { useUser } from '@/contexts/UserContext';
import { HelpDialog } from '@/components/HelpDialog';
import { HelpTooltip } from '@/components/HelpTooltip';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PianoKeyboard } from '@/components/PianoKeyboard';
import { ProgressRing } from '@/components/ProgressRing';
import { LearningPathCard } from '@/components/LearningPathCard';
import { generateScaleExercise, generateIntervalExercise, getIntervalExplanation, getScalesByDifficulty, getIntervalsByDifficulty, getMajorScale, getMinorScale } from '@/lib/musicTheory';
import { Note, ExerciseData } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { audioEngine } from '@/lib/audio';

// Remove hardcoded user ID - now using context

interface ProgressSummary {
  totalItems: number;
  mastered: number;
  inProgress: number;
  notStarted: number;
  overallProgress: number;
}

interface CurrentExercise {
  category: 'major_scales' | 'minor_scales' | 'intervals';
  itemName: string;
  instruction: string;
  correctNotes: Note[];
  mode: 'learn' | 'practice';
  explanation?: string;
  hint?: string;
  startNote?: Note;
}

export default function HomePage() {
  const [currentExercise, setCurrentExercise] = useState<CurrentExercise | null>(null);
  const [playedNotes, setPlayedNotes] = useState<Note[]>([]);
  const [selectedNotes, setSelectedNotes] = useState<Note[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [exerciseMode, setExerciseMode] = useState<'learn' | 'practice'>('learn');
  const [showHelp, setShowHelp] = useState(false);
  const startTimeRef = useRef<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentUser } = useUser();

  // Fetch progress summary
  const { data: progressSummary, isLoading: summaryLoading } = useQuery<ProgressSummary>({
    queryKey: ['/api/progress-summary', currentUser?.id],
    enabled: !!currentUser?.id,
  });

  // Fetch all progress
  const { data: allProgress } = useQuery<any[]>({
    queryKey: ['/api/progress', currentUser?.id],
    enabled: !!currentUser?.id,
  });

  // Record exercise session mutation
  const recordSession = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/exercise-sessions', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/progress-summary'] });
      queryClient.invalidateQueries({ queryKey: ['/api/progress'] });
    },
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

  // Generate a random exercise using type-safe functions
  const generateExercise = () => {
    const categories = ['major_scales', 'minor_scales', 'intervals'];
    const category = categories[Math.floor(Math.random() * categories.length)] as 'major_scales' | 'minor_scales' | 'intervals';
    
    let exerciseData: ExerciseData;
    let instruction: string;
    let explanation: string;
    let hint: string;

    if (category === 'major_scales') {
      exerciseData = generateScaleExercise('major_scales');
      instruction = exerciseMode === 'learn' ? 
        `Learn the ${exerciseData.displayName} scale by clicking the correct notes:` :
        `Play the ${exerciseData.displayName} scale by clicking the keys in order:`;
      explanation = `The ${exerciseData.displayName} scale follows the pattern: Whole-Whole-Half-Whole-Whole-Whole-Half steps. This scale uses the key signature with ${Math.abs(exerciseData.correctNotes.filter(n => n.includes('#')).length)} sharps.`;
      hint = `Remember: Major scales have sharps in this order: F#, C#, G#, D#, A#, E#, B#. Start on ${exerciseData.tonic} and follow the major scale pattern.`;
    } else if (category === 'minor_scales') {
      exerciseData = generateScaleExercise('minor_scales');
      instruction = exerciseMode === 'learn' ? 
        `Learn the ${exerciseData.displayName} scale by clicking the correct notes:` :
        `Play the ${exerciseData.displayName} scale by clicking the keys in order:`;
      explanation = `The ${exerciseData.displayName} scale follows the natural minor pattern: Whole-Half-Whole-Whole-Half-Whole-Whole steps. This scale uses the same key signature as its relative major.`;
      hint = `Minor scales start a minor 3rd (3 semitones) below their relative major. The ${exerciseData.tonic} minor scale has the same key signature as its relative major.`;
    } else {
      exerciseData = generateIntervalExercise();
      const intervalExplanation = getIntervalExplanation(exerciseData.intervalType!);
      instruction = exerciseMode === 'learn' ? 
        `Learn to build a ${exerciseData.intervalType} up from ${exerciseData.startNote}:` :
        `Build a ${exerciseData.intervalType} up from ${exerciseData.startNote} by clicking both notes:`;
      explanation = intervalExplanation.explanation;
      hint = intervalExplanation.learningTip;
    }

    setCurrentExercise({ 
      category, 
      itemName: exerciseData.displayName, 
      instruction, 
      correctNotes: exerciseData.correctNotes, 
      mode: exerciseMode,
      explanation,
      hint,
      startNote: exerciseData.startNote 
    });
    setPlayedNotes([]);
    setSelectedNotes([]);
    setIsCompleted(false);
    setShowHint(false);
    
    // Record exercise start time
    startTimeRef.current = Date.now();
  };

  // Initialize first exercise
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

    let isCorrect: boolean;
    let userAnswer: Note[];

    if (currentExercise.mode === 'learn') {
      // In learn mode, check if selected notes match correct notes (order doesn't matter)
      userAnswer = [...selectedNotes].sort();
      const correctAnswer = [...currentExercise.correctNotes].sort();
      isCorrect = JSON.stringify(userAnswer) === JSON.stringify(correctAnswer);
    } else {
      // In practice mode, check sequence order
      userAnswer = playedNotes;
      isCorrect = JSON.stringify(playedNotes) === JSON.stringify(currentExercise.correctNotes);
    }
    
    // Record the exercise session
    await recordSession.mutateAsync({
      userId: currentUser?.id || '',
      category: currentExercise.category,
      itemName: currentExercise.itemName,
      isCorrect,
      userAnswer: userAnswer,
      correctAnswer: currentExercise.correctNotes,
      timeToComplete: startTimeRef.current ? Math.round((Date.now() - startTimeRef.current) / 1000) : 0
    });

    // Update progress
    const currentProgress = allProgress?.find(
      p => p.category === currentExercise.category && p.itemName === currentExercise.itemName
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
      userId: currentUser?.id || '',
      category: currentExercise.category,
      itemName: currentExercise.itemName,
      status: newStatus,
      attempts: newAttempts,
      correctAnswers: newCorrectAnswers,
    });

    if (isCorrect) {
      toast({
        title: "🎉 Correct!",
        description: `You played the ${currentExercise.itemName} correctly.`,
      });
      setIsCompleted(true);
    } else {
      toast({
        title: "Try Again",
        description: "That's not quite right. Check the key signature and try again.",
        variant: "destructive",
      });
    }
  };

  const handleTryAgain = () => {
    setPlayedNotes([]);
    setSelectedNotes([]);
    setIsCompleted(false);
    setShowHint(false);
  };

  const handleShowHint = () => {
    setShowHint(true);
  };

  const handleSwitchMode = () => {
    setExerciseMode(prev => prev === 'learn' ? 'practice' : 'learn');
    generateExercise();
  };

  const handleNextExercise = () => {
    generateExercise();
  };

  if (summaryLoading) {
    return <div className="flex-1 flex items-center justify-center">Loading...</div>;
  }

  const highlightedNotes = currentExercise?.correctNotes || [];
  const keySignature = currentExercise ? 
    (currentExercise.category === 'major_scales' ? 
      getMajorScale(currentExercise.itemName.split(' ')[0] as Note) : 
      getMinorScale(currentExercise.itemName.split(' ')[0] as Note)
    ) : null;

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 bg-card border-r border-border flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-border bg-gradient-to-br from-primary/5 to-accent/10">
          <div className="flex items-center mb-2">
            <div className="p-2 bg-primary/10 rounded-lg mr-3">
              <Music className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground font-serif">
                Music Theory Prep
              </h1>
              <p className="text-sm text-muted-foreground">AP Exam Preparation</p>
            </div>
          </div>
        </div>
        
        {/* Overall Progress */}
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold mb-4">Overall Progress</h2>
          <div className="flex items-center justify-center mb-4">
            <ProgressRing progress={progressSummary?.overallProgress || 0} />
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Mastered:</span>
              <span className="font-semibold text-success" data-testid="mastered-count">
                {progressSummary?.mastered || 0}/{progressSummary?.totalItems || 40}
              </span>
            </div>
            <div className="flex justify-between">
              <span>In Progress:</span>
              <span className="font-semibold text-warning" data-testid="in-progress-count">
                {progressSummary?.inProgress || 0}/{progressSummary?.totalItems || 40}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Not Started:</span>
              <span className="font-semibold text-muted-foreground" data-testid="not-started-count">
                {progressSummary?.notStarted || 40}/{progressSummary?.totalItems || 40}
              </span>
            </div>
          </div>
        </div>
        
        {/* Learning Navigation Menu */}
        <nav className="flex-1 p-4">
          {/* Featured Guided Learning - Hero Treatment */}
          <div className="mb-6 p-6 bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10 border border-primary/20 rounded-xl shadow-sm">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-primary/15 rounded-lg mr-3">
                <Award className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground font-serif">
                  Start Your Journey
                </h3>
                <p className="text-sm text-muted-foreground">
                  Recommended learning path for AP Music Theory
                </p>
              </div>
            </div>
            <div className="grid gap-3 mb-4">
              <Link href="/learning-journey">
                <Button variant="default" className="w-full justify-start h-12 text-base shadow-md hover:shadow-lg transition-all duration-200" data-testid="nav-learning-journey">
                  <BookOpen className="mr-3 h-5 w-5" />
                  7-Step Guided Journey
                </Button>
              </Link>
              <Link href="/scales">
                <Button variant="secondary" className="w-full justify-start h-12 text-base" data-testid="nav-piano-practice">
                  <Keyboard className="mr-3 h-5 w-5" />
                  Quick Piano Practice
                </Button>
              </Link>
            </div>
            <p className="text-xs text-muted-foreground">
              Follow our structured path from musical alphabet to advanced intervals
            </p>
          </div>

          <div className="mb-4">
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">QUICK LINKS</h3>
            <div className="space-y-1">
              <Link href="/scales">
                <Button variant="ghost" className="w-full justify-start" data-testid="nav-scales-quick">
                  <Music className="mr-3 h-4 w-4" />
                  Scales Practice
                </Button>
              </Link>
              <Link href="/intervals">
                <Button variant="ghost" className="w-full justify-start" data-testid="nav-intervals-quick">
                  <CornerLeftUp className="mr-3 h-4 w-4" />
                  Intervals Practice
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">SCALES (Foundation)</h3>
            <ul className="space-y-1">
              <li>
                <Link href="/scales">
                  <Button variant="ghost" className="w-full justify-between" data-testid="nav-major-scales">
                    <div className="flex items-center">
                      <Music className="mr-3 h-4 w-4" />
                      Major Scales
                    </div>
                    <span className="border border-success/20 text-success text-xs px-2 py-1 rounded-full">
                      {allProgress?.filter(p => p.category === 'major_scales' && p.status === 'mastered').length || 0}/12
                    </span>
                  </Button>
                </Link>
              </li>
              <li>
                <Link href="/scales">
                  <Button variant="ghost" className="w-full justify-between" data-testid="nav-minor-scales">
                    <div className="flex items-center">
                      <Music className="mr-3 h-4 w-4" />
                      Minor Scales
                    </div>
                    <span className="border border-warning/20 text-warning text-xs px-2 py-1 rounded-full">
                      {allProgress?.filter(p => p.category === 'minor_scales' && p.status === 'mastered').length || 0}/12
                    </span>
                  </Button>
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">INTERVALS (Advanced)</h3>
            <ul className="space-y-1">
              <li>
                <Link href="/intervals">
                  <Button variant="ghost" className="w-full justify-between" data-testid="nav-intervals">
                    <div className="flex items-center">
                      <BookOpen className="mr-3 h-4 w-4" />
                      Learn Intervals
                    </div>
                    <span className="border border-warning/20 text-warning text-xs px-2 py-1 rounded-full">
                      {allProgress?.filter(p => p.category === 'intervals' && p.status === 'mastered').length || 0}/13
                    </span>
                  </Button>
                </Link>
              </li>
              <li>
                <Link href="/interval-practice">
                  <Button variant="ghost" className="w-full justify-start" data-testid="nav-interval-practice">
                    <Target className="mr-3 h-4 w-4" />
                    Practice Building
                  </Button>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">PROGRESS TRACKING</h3>
            <Link href="/progress">
              <Button variant="ghost" className="w-full justify-start" data-testid="nav-progress-report">
                <ChartLine className="mr-3 h-4 w-4" />
                Detailed Progress Report
              </Button>
            </Link>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <PageHeader 
          title="Interactive Piano Practice"
          subtitle="Learn and practice scales and intervals with step-by-step guidance"
        >
          <div className="flex items-center space-x-3">
            <HelpTooltip 
              content="Click for help with the piano interface and getting started"
              onClick={() => setShowHelp(true)}
            />
            <Button 
              variant="secondary" 
              size="sm"
              onClick={async () => {
                try {
                  // Ensure audio is initialized on user interaction
                  await audioEngine.initializeAudio();
                  if (keySignature) await audioEngine.playScale(keySignature.notes);
                } catch (error) {
                  console.warn('Audio playback failed:', error);
                }
              }}
              data-testid="button-play-scale"
            >
              <Play className="mr-2 h-4 w-4" />
              Play Scale
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleSwitchMode}
              data-testid="button-switch-mode"
            >
              Switch to {exerciseMode === 'learn' ? 'Practice' : 'Learn'} Mode
            </Button>
            <Button 
              variant="secondary" 
              size="sm"
              onClick={handleShowHint}
              disabled={showHint}
              data-testid="button-show-hint"
            >
              Show Hint
            </Button>
            <Button 
              size="sm"
              onClick={handleCheckAnswer} 
              disabled={(currentExercise?.mode === 'learn' ? selectedNotes.length === 0 : playedNotes.length === 0) || isCompleted}
              data-testid="button-check-answer"
            >
              <Check className="mr-2 h-4 w-4" />
              Check Answer
            </Button>
          </div>
        </PageHeader>
        
        {/* Exercise Area */}
        <div className="flex-1 p-6 overflow-auto">
          {/* Current Exercise Info */}
          {currentExercise && (
            <div className="mb-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold">Current Exercise</h3>
                    <div className="flex items-center space-x-2">
                      <span className="px-3 py-1 bg-primary text-primary-foreground rounded-full text-sm font-medium">
                        {currentExercise.mode === 'learn' ? 'Learning' : 'Practice'} Mode
                      </span>
                      <span className="px-3 py-1 bg-warning text-warning-foreground rounded-full text-sm font-medium">
                        {currentExercise.category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </div>
                  </div>
                  <div className="bg-muted p-4 rounded-lg mb-4">
                    <p className="text-lg font-medium mb-2" data-testid="exercise-task">
                      Task: {currentExercise.itemName}
                    </p>
                    <p className="text-muted-foreground mb-3" data-testid="exercise-instruction">
                      {currentExercise.instruction}
                    </p>
                    {currentExercise.explanation && (
                      <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mb-3">
                        <p className="text-sm text-blue-800">
                          <strong>Learn:</strong> {currentExercise.explanation}
                        </p>
                      </div>
                    )}
                    {showHint && currentExercise.hint && (
                      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3">
                        <p className="text-sm text-yellow-800">
                          <strong>Hint:</strong> {currentExercise.hint}
                        </p>
                      </div>
                    )}
                  </div>
                  {currentExercise.mode === 'learn' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-800 font-medium mb-1">📚 Learning Mode Active</p>
                      <p className="text-sm text-blue-700">Click piano keys to select/unselect them. Focus on identifying the correct notes. Order doesn't matter - just find all the right keys!</p>
                    </div>
                  )}
                  {currentExercise.mode === 'practice' && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-sm text-green-800 font-medium mb-1">🎯 Practice Mode Active</p>
                      <p className="text-sm text-green-700">Click piano keys in the correct sequence. This simulates actually playing the scale or interval on a real piano.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
          
          {/* Piano Keyboard */}
          <div className="mb-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Piano Keyboard</h3>
                <PianoKeyboard
                  highlightedNotes={isCompleted ? highlightedNotes : []}
                  sharpsInKey={keySignature?.sharps || []}
                  playedNotes={currentExercise?.mode === 'practice' ? playedNotes : []}
                  selectedNotes={currentExercise?.mode === 'learn' ? selectedNotes : []}
                  onNoteClick={handleNoteClick}
                  onNoteToggle={currentExercise?.mode === 'learn' ? handleNoteToggle : undefined}
                />
                <div className="mt-4 text-center">
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>
                      Keys highlighted in <span className="text-primary font-medium">blue</span> show correct answers when completed.
                    </p>
                    <p>
                      Keys highlighted in <span className="text-yellow-600 font-medium">yellow</span> are sharps/flats in this key signature.
                    </p>
                    {currentExercise?.mode === 'learn' && (
                      <p>
                        Keys with <span className="text-blue-600 font-medium">blue background</span> are your current selections.
                      </p>
                    )}
                    {currentExercise?.mode === 'practice' && (
                      <p>
                        Keys highlighted in <span className="text-success font-medium">green</span> show your played sequence.
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Exercise Controls */}
          <div className="flex justify-center space-x-4">
            <Button 
              variant="secondary" 
              onClick={handleTryAgain}
              disabled={(currentExercise?.mode === 'learn' ? selectedNotes.length === 0 : playedNotes.length === 0)}
              data-testid="button-try-again"
            >
              <RotateCcw className="mr-2 h-4 w-4" />Reset
            </Button>
            <Button 
              onClick={handleNextExercise}
              data-testid="button-next-exercise"
            >
              <ChevronRight className="mr-2 h-4 w-4" />Next Exercise
            </Button>
          </div>
        </div>
      </div>
      
      <HelpDialog 
        open={showHelp} 
        onClose={() => setShowHelp(false)} 
        topic="piano" 
      />
    </div>
  );
}
