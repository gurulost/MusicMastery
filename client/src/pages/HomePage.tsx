import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Music, Keyboard, CornerLeftUp, ChartLine, Settings, Play, Check, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PianoKeyboard } from '@/components/PianoKeyboard';
import { ProgressRing } from '@/components/ProgressRing';
import { MAJOR_SCALES, MINOR_SCALES, INTERVALS, getMajorScale, getMinorScale } from '@/lib/musicTheory';
import { Note } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

const DEMO_USER_ID = 'demo-user';

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
}

export default function HomePage() {
  const [currentExercise, setCurrentExercise] = useState<CurrentExercise | null>(null);
  const [playedNotes, setPlayedNotes] = useState<Note[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch progress summary
  const { data: progressSummary, isLoading: summaryLoading } = useQuery<ProgressSummary>({
    queryKey: ['/api/progress-summary', DEMO_USER_ID],
  });

  // Fetch all progress
  const { data: allProgress } = useQuery({
    queryKey: ['/api/progress', DEMO_USER_ID],
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

  // Generate a random exercise
  const generateExercise = () => {
    const categories = ['major_scales', 'minor_scales'];
    const category = categories[Math.floor(Math.random() * categories.length)] as 'major_scales' | 'minor_scales';
    
    let itemName: string;
    let correctNotes: Note[];
    let instruction: string;

    if (category === 'major_scales') {
      itemName = MAJOR_SCALES[Math.floor(Math.random() * MAJOR_SCALES.length)];
      const [tonic] = itemName.split(' ');
      const scale = getMajorScale(tonic as Note);
      correctNotes = scale.notes;
      instruction = `Play the ${itemName} scale. This scale has ${scale.sharps.length} sharps: ${scale.sharps.join(', ')}`;
    } else {
      itemName = MINOR_SCALES[Math.floor(Math.random() * MINOR_SCALES.length)];
      const [tonic] = itemName.split(' ');
      const scale = getMinorScale(tonic as Note);
      correctNotes = scale.notes;
      instruction = `Play the ${itemName} scale. This scale has ${scale.sharps.length} sharps: ${scale.sharps.join(', ')}`;
    }

    setCurrentExercise({ category, itemName, instruction, correctNotes });
    setPlayedNotes([]);
    setIsCompleted(false);
  };

  // Initialize first exercise
  useEffect(() => {
    if (!currentExercise) {
      generateExercise();
    }
  }, [currentExercise]);

  const handleNoteClick = (note: Note) => {
    if (isCompleted) return;
    
    const newPlayedNotes = [...playedNotes, note];
    setPlayedNotes(newPlayedNotes);
  };

  const handleCheckAnswer = async () => {
    if (!currentExercise) return;

    const isCorrect = JSON.stringify(playedNotes) === JSON.stringify(currentExercise.correctNotes);
    
    // Record the exercise session
    await recordSession.mutateAsync({
      userId: DEMO_USER_ID,
      category: currentExercise.category,
      itemName: currentExercise.itemName,
      isCorrect,
      userAnswer: playedNotes,
      correctAnswer: currentExercise.correctNotes,
      timeToComplete: 30, // placeholder
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
      userId: DEMO_USER_ID,
      category: currentExercise.category,
      itemName: currentExercise.itemName,
      status: newStatus,
      attempts: newAttempts,
      correctAnswers: newCorrectAnswers,
    });

    if (isCorrect) {
      toast({
        title: "Correct!",
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
    setIsCompleted(false);
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
        <div className="p-6 border-b border-border">
          <h1 className="text-2xl font-bold text-primary">
            <Music className="inline mr-2" />
            Music Theory Prep
          </h1>
          <p className="text-sm text-muted-foreground mt-1">AP Exam Preparation</p>
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
        
        {/* Navigation Menu */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            <li>
              <Button variant="default" className="w-full justify-start" data-testid="nav-piano-practice">
                <Keyboard className="mr-3 h-4 w-4" />
                Piano Practice
              </Button>
            </li>
            <li>
              <Link href="/scales">
                <Button variant="ghost" className="w-full justify-between" data-testid="nav-major-scales">
                  <div className="flex items-center">
                    <Music className="mr-3 h-4 w-4" />
                    Major Scales
                  </div>
                  <span className="bg-success text-success-foreground text-xs px-2 py-1 rounded-full">
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
                  <span className="bg-warning text-warning-foreground text-xs px-2 py-1 rounded-full">
                    {allProgress?.filter(p => p.category === 'minor_scales' && p.status === 'mastered').length || 0}/12
                  </span>
                </Button>
              </Link>
            </li>
            <li>
              <Link href="/intervals">
                <Button variant="ghost" className="w-full justify-between" data-testid="nav-intervals">
                  <div className="flex items-center">
                    <CornerLeftUp className="mr-3 h-4 w-4" />
                    Intervals
                  </div>
                  <span className="bg-warning text-warning-foreground text-xs px-2 py-1 rounded-full">
                    {allProgress?.filter(p => p.category === 'intervals' && p.status === 'mastered').length || 0}/13
                  </span>
                </Button>
              </Link>
            </li>
            <li>
              <Link href="/progress">
                <Button variant="ghost" className="w-full justify-start" data-testid="nav-progress-report">
                  <ChartLine className="mr-3 h-4 w-4" />
                  Progress Report
                </Button>
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-card border-b border-border p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Interactive Piano Practice</h2>
              <p className="text-muted-foreground">Practice scales and intervals with visual feedback</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="secondary" 
                onClick={() => keySignature && audioEngine.playScale(keySignature.notes)}
                data-testid="button-play-scale"
              >
                <Play className="mr-2 h-4 w-4" />Play Scale
              </Button>
              <Button 
                onClick={handleCheckAnswer} 
                disabled={playedNotes.length === 0 || isCompleted}
                data-testid="button-check-answer"
              >
                <Check className="mr-2 h-4 w-4" />Check Answer
              </Button>
            </div>
          </div>
        </header>
        
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
                      <span className="px-3 py-1 bg-warning text-warning-foreground rounded-full text-sm font-medium">
                        {currentExercise.category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </div>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-lg font-medium mb-2" data-testid="exercise-task">
                      Task: {currentExercise.itemName}
                    </p>
                    <p className="text-muted-foreground" data-testid="exercise-instruction">
                      {currentExercise.instruction}
                    </p>
                  </div>
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
                  playedNotes={playedNotes}
                  onNoteClick={handleNoteClick}
                />
                <div className="mt-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    Keys highlighted in <span className="text-primary font-medium">blue</span> are correct scale tones.
                    Keys highlighted in <span className="text-yellow-600 font-medium">yellow</span> are sharps in this key.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Exercise Controls */}
          <div className="flex justify-center space-x-4">
            <Button 
              variant="secondary" 
              onClick={handleTryAgain}
              disabled={playedNotes.length === 0}
              data-testid="button-try-again"
            >
              <RotateCcw className="mr-2 h-4 w-4" />Try Again
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
    </div>
  );
}
