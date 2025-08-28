import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Keyboard, CornerLeftUp, ChartLine, Settings, Play, Check, RotateCcw, ChevronLeft, ChevronRight, BookOpen, Target, Award, TrendingUp, Eye, Brain, ChevronDown, ChevronUp } from 'lucide-react';
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
import { generateScaleExercise, generateIntervalExercise, getIntervalExplanation, getScalesByDifficulty, getIntervalsByDifficulty, getMajorScale, getMinorScale, areNotesEqual, getScale } from '@/lib/musicTheory';
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
  const [showKeySignature, setShowKeySignature] = useState(false);
  const [practiceMode, setPracticeMode] = useState<'practice' | 'show_key'>('practice');
  const [streakCount, setStreakCount] = useState(0);
  const [completionTime, setCompletionTime] = useState<number | null>(null);
  const [bestTime, setBestTime] = useState<number | null>(null);
  const [difficultyLevel, setDifficultyLevel] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentUser } = useUser();
  const [location] = useLocation();

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

  // Generate a scale practice exercise - focused on key identification
  const generateExercise = (specificScale?: string) => {
    // Check URL parameters for specific scale practice
    const urlParams = new URLSearchParams(window.location.search);
    const urlScale = specificScale || urlParams.get('scale');
    
    let exerciseData: ExerciseData;
    let instruction: string;
    let explanation: string;
    let hint: string;
    let category: 'major_scales' | 'minor_scales';

    if (urlScale) {
      // Generate specific scale exercise
      if (urlScale.includes('Major')) {
        category = 'major_scales';
        const tonic = urlScale.replace(' Major', '') as Note;
        const scale = getMajorScale(tonic);
        exerciseData = {
          displayName: urlScale,
          correctNotes: scale.notes,
          tonic,
          category: 'major_scales'
        };
        instruction = `Click all the notes that belong in ${exerciseData.displayName}:`;
        explanation = `The ${exerciseData.displayName} scale follows the pattern: Whole-Whole-Half-Whole-Whole-Whole-Half steps. This scale has ${scale.sharps.length > 0 ? `${scale.sharps.length} sharp${scale.sharps.length > 1 ? 's' : ''}: ${scale.sharps.join(', ')}` : scale.flats.length > 0 ? `${scale.flats.length} flat${scale.flats.length > 1 ? 's' : ''}: ${scale.flats.join(', ')}` : 'no sharps or flats'}.`;
        hint = `Remember: Major scales have sharps in this order: F#, C#, G#, D#, A#, E#, B#. Start on ${exerciseData.tonic} and follow the major scale pattern.`;
      } else if (urlScale.includes('Minor')) {
        category = 'minor_scales';
        const tonic = urlScale.replace(' Minor', '') as Note;
        const scale = getMinorScale(tonic);
        exerciseData = {
          displayName: urlScale,
          correctNotes: scale.notes,
          tonic,
          category: 'minor_scales'
        };
        instruction = `Click all the notes that belong in ${exerciseData.displayName}:`;
        explanation = `The ${exerciseData.displayName} scale follows the natural minor pattern: Whole-Half-Whole-Whole-Half-Whole-Whole steps. This scale has ${scale.sharps.length > 0 ? `${scale.sharps.length} sharp${scale.sharps.length > 1 ? 's' : ''}: ${scale.sharps.join(', ')}` : scale.flats.length > 0 ? `${scale.flats.length} flat${scale.flats.length > 1 ? 's' : ''}: ${scale.flats.join(', ')}` : 'no sharps or flats'}.`;
        hint = `Minor scales start a minor 3rd (3 semitones) below their relative major. The ${exerciseData.tonic} minor scale has the same key signature as its relative major.`;
      } else {
        // Fallback to random if scale format not recognized
        return generateRandomScale();
      }
    } else {
      // Generate random scale exercise
      return generateRandomScale();
    }

    setCurrentExercise({ 
      category, 
      itemName: exerciseData.displayName, 
      instruction, 
      correctNotes: exerciseData.correctNotes, 
      mode: 'learn', // Always in learn mode for key identification
      explanation,
      hint,
      startNote: exerciseData.tonic 
    });
    setPlayedNotes([]);
    setSelectedNotes([]);
    setIsCompleted(false);
    setShowHint(false);
    
    // Record exercise start time
    startTimeRef.current = Date.now();
    
    // Clear URL parameters after loading specific exercise
    if (urlScale) {
      window.history.replaceState({}, '', window.location.pathname);
    }
  };

  // Generate a random scale exercise with progressive difficulty
  const generateRandomScale = () => {
    const categories = ['major_scales', 'minor_scales'];
    const category = categories[Math.floor(Math.random() * categories.length)] as 'major_scales' | 'minor_scales';
    
    // Use progressive difficulty based on user performance
    const { easy, medium, hard } = getScalesByDifficulty();
    let availableScales;
    
    if (difficultyLevel === 'easy') {
      availableScales = easy;
    } else if (difficultyLevel === 'medium') {
      availableScales = [...easy, ...medium];
    } else {
      availableScales = [...easy, ...medium, ...hard];
    }
    
    // Generate scale from appropriate difficulty level
    const randomScale = availableScales[Math.floor(Math.random() * availableScales.length)];
    const scale = getScale(randomScale);
    
    let exerciseData: ExerciseData;
    let instruction: string;
    let explanation: string;
    let hint: string;

    if (category === 'major_scales') {
      // Only include major scales from available scales
      const majorScales = availableScales.filter(s => s.type === 'major');
      if (majorScales.length > 0) {
        const selectedScale = majorScales[Math.floor(Math.random() * majorScales.length)];
        const scaleData = getScale(selectedScale);
        exerciseData = {
          category: 'major_scales',
          tonic: selectedScale.tonic,
          type: selectedScale.type,
          displayName: scaleData.name,
          correctNotes: scaleData.notes
        };
      } else {
        // Fallback to random major scale
        exerciseData = generateScaleExercise('major_scales');
      }
      const scaleInfo = getMajorScale(exerciseData.tonic);
      instruction = `Click all the notes that belong in ${exerciseData.displayName}:`;
      explanation = `The ${exerciseData.displayName} scale follows the pattern: Whole-Whole-Half-Whole-Whole-Whole-Half steps. This scale has ${scaleInfo.sharps.length > 0 ? `${scaleInfo.sharps.length} sharp${scaleInfo.sharps.length > 1 ? 's' : ''}: ${scaleInfo.sharps.join(', ')}` : scaleInfo.flats.length > 0 ? `${scaleInfo.flats.length} flat${scaleInfo.flats.length > 1 ? 's' : ''}: ${scaleInfo.flats.join(', ')}` : 'no sharps or flats'}.`;
      hint = `Remember: Major scales have sharps in this order: F#, C#, G#, D#, A#, E#, B#. Start on ${exerciseData.tonic} and follow the major scale pattern.`;
    } else {
      // Only include minor scales from available scales  
      const minorScales = availableScales.filter(s => s.type === 'minor');
      if (minorScales.length > 0) {
        const selectedScale = minorScales[Math.floor(Math.random() * minorScales.length)];
        const scaleData = getScale(selectedScale);
        exerciseData = {
          category: 'minor_scales',
          tonic: selectedScale.tonic,
          type: selectedScale.type,
          displayName: scaleData.name,
          correctNotes: scaleData.notes
        };
      } else {
        // Fallback to random minor scale
        exerciseData = generateScaleExercise('minor_scales');
      }
      const scaleInfo = getMinorScale(exerciseData.tonic);
      instruction = `Click all the notes that belong in ${exerciseData.displayName}:`;
      explanation = `The ${exerciseData.displayName} scale follows the natural minor pattern: Whole-Half-Whole-Whole-Half-Whole-Whole steps. This scale has ${scaleInfo.sharps.length > 0 ? `${scaleInfo.sharps.length} sharp${scaleInfo.sharps.length > 1 ? 's' : ''}: ${scaleInfo.sharps.join(', ')}` : scaleInfo.flats.length > 0 ? `${scaleInfo.flats.length} flat${scaleInfo.flats.length > 1 ? 's' : ''}: ${scaleInfo.flats.join(', ')}` : 'no sharps or flats'}.`;
      hint = `Minor scales start a minor 3rd (3 semitones) below their relative major. The ${exerciseData.tonic} minor scale has the same key signature as its relative major.`;
    }

    setCurrentExercise({ 
      category, 
      itemName: exerciseData.displayName, 
      instruction, 
      correctNotes: exerciseData.correctNotes, 
      mode: 'learn', // Always in learn mode for key identification
      explanation,
      hint,
      startNote: exerciseData.tonic 
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
      userAnswer = [...selectedNotes];
      const correctAnswer = [...currentExercise.correctNotes];
      isCorrect = areNotesEqual(userAnswer, correctAnswer, false); // order doesn't matter in learn mode
    } else {
      // In practice mode, check sequence order
      userAnswer = playedNotes;
      isCorrect = areNotesEqual(playedNotes, currentExercise.correctNotes, true); // order matters in practice mode
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

    // Calculate completion time
    const timeTaken = startTimeRef.current ? Math.round((Date.now() - startTimeRef.current) / 1000) : 0;
    setCompletionTime(timeTaken);
    
    // Update best time
    if (!bestTime || timeTaken < bestTime) {
      setBestTime(timeTaken);
    }

    if (isCorrect) {
      const newStreak = streakCount + 1;
      const newConsecutive = consecutiveCorrect + 1;
      setStreakCount(newStreak);
      setConsecutiveCorrect(newConsecutive);
      
      // Progressive difficulty adjustment based on performance
      if (newConsecutive >= 5 && difficultyLevel === 'easy') {
        setDifficultyLevel('medium');
        setTimeout(() => {
          toast({
            title: "🎯 Level Up!",
            description: "Great progress! Moving to medium difficulty with more accidentals.",
          });
        }, 500);
      } else if (newConsecutive >= 8 && difficultyLevel === 'medium') {
        setDifficultyLevel('hard');
        setTimeout(() => {
          toast({
            title: "🏆 Expert Level!",
            description: "Amazing! Now practicing the most challenging scales.",
          });
        }, 500);
      }
      
      // Create detailed success message with educational content
      const scale = currentExercise.category === 'major_scales' ? 
        getMajorScale(currentExercise.itemName.split(' ')[0] as Note) : 
        getMinorScale(currentExercise.itemName.split(' ')[0] as Note);
      
      let timeMessage = '';
      if (timeTaken <= 3) timeMessage = 'Lightning fast! ⚡';
      else if (timeTaken <= 6) timeMessage = 'Great speed! 🚀';
      else if (timeTaken <= 10) timeMessage = 'Good pace! ⏱️';
      else timeMessage = 'Keep practicing for speed! 📈';
      
      let streakMessage = newStreak >= 5 ? ` • ${newStreak} in a row! 🔥` : 
                         newStreak >= 3 ? ` • ${newStreak} streak! 🎯` : '';
      
      const keyInfo = scale.sharps.length > 0 ? 
        `Key signature: ${scale.sharps.join(', ')} sharp${scale.sharps.length > 1 ? 's' : ''}` :
        scale.flats.length > 0 ? 
        `Key signature: ${scale.flats.join(', ')} flat${scale.flats.length > 1 ? 's' : ''}` :
        'Key signature: No sharps or flats';
      
      toast({
        title: "🎉 Excellent!",
        description: `${timeMessage} (${timeTaken}s)${streakMessage}\n${keyInfo}`,
      });
      
      setIsCompleted(true);
      
      // Auto-generate next exercise after a brief delay
      setTimeout(() => {
        handleNextExercise();
      }, 2500);
    } else {
      // Reset streak and consecutive on incorrect answer
      setStreakCount(0);
      setConsecutiveCorrect(0);
      
      // Adaptive difficulty - make it easier if struggling
      if (difficultyLevel === 'hard') {
        setDifficultyLevel('medium');
      } else if (difficultyLevel === 'medium') {
        setDifficultyLevel('easy');
      }
      
      // Provide educational hints based on the scale
      const scale = currentExercise.category === 'major_scales' ? 
        getMajorScale(currentExercise.itemName.split(' ')[0] as Note) : 
        getMinorScale(currentExercise.itemName.split(' ')[0] as Note);
      
      const pattern = currentExercise.category === 'major_scales' ? 
        'W-W-H-W-W-W-H' : 'W-H-W-W-H-W-W';
      
      const hintText = scale.sharps.length > 0 ? 
        `Remember: ${scale.sharps.join(', ')} should be sharp in this key!` :
        scale.flats.length > 0 ? 
        `Remember: ${scale.flats.join(', ')} should be flat in this key!` :
        `This scale has no sharps or flats - use only white keys!`;
      
      toast({
        title: "Keep trying! 🎵",
        description: `${hintText}\nPattern: ${pattern} (W=Whole step, H=Half step)`,
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


  const handleNextExercise = () => {
    setCompletionTime(null);
    generateRandomScale();
  };
  
  const handlePlayScaleAscending = async () => {
    if (!currentExercise) return;
    try {
      await audioEngine.initializeAudio();
      await audioEngine.playScale(currentExercise.correctNotes);
    } catch (error) {
      console.warn('Scale playback failed:', error);
    }
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
                    <span className="inline-flex items-center justify-center border border-success/20 text-success text-xs px-2 py-1 rounded-full">
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
                    <span className="inline-flex items-center justify-center border border-warning/20 text-warning text-xs px-2 py-1 rounded-full">
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
                    <span className="inline-flex items-center justify-center border border-warning/20 text-warning text-xs px-2 py-1 rounded-full">
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
          <div className="flex items-center gap-4 mb-4">
            {/* Difficulty level indicator */}
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              difficultyLevel === 'easy' ? 'bg-green-100 border border-green-300 text-green-800' :
              difficultyLevel === 'medium' ? 'bg-yellow-100 border border-yellow-300 text-yellow-800' :
              'bg-red-100 border border-red-300 text-red-800'
            }`}>
              <span className="capitalize">{difficultyLevel}</span> Level
            </div>
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
          <div className="flex flex-col gap-4">
            {/* Mode Toggle - Prominently displayed */}
            <div className="flex items-center gap-3 bg-slate-100 p-3 rounded-lg border">
              <span className="text-sm font-medium text-slate-700">Mode:</span>
              <div className="flex items-center bg-white rounded-lg p-1 border shadow-sm">
                <Button
                  variant={practiceMode === 'practice' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setPracticeMode('practice')}
                  className="rounded-md"
                  data-testid="button-practice-mode"
                >
                  <Brain className="mr-2 h-4 w-4" />
                  Practice
                </Button>
                <Button
                  variant={practiceMode === 'show_key' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setPracticeMode('show_key')}
                  className="rounded-md"
                  data-testid="button-show-key-mode"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Show The Key
                </Button>
              </div>
              <span className="text-xs text-slate-500">
                {practiceMode === 'practice' ? 'Test your knowledge' : 'Study the correct notes'}
              </span>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <HelpTooltip 
                content="Click for help with the piano interface and getting started"
                onClick={() => setShowHelp(true)}
              />
              <Button 
                variant="secondary" 
                size="sm"
                onClick={handlePlayScaleAscending}
                data-testid="button-play-scale"
              >
                <Play className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Play Scale</span>
                <span className="sm:hidden">Play</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleNextExercise}
                data-testid="button-next-exercise"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Next Scale</span>
                <span className="sm:hidden">Next</span>
              </Button>
              {practiceMode === 'practice' && (
                <Button 
                  size="sm"
                  onClick={handleCheckAnswer} 
                  disabled={selectedNotes.length === 0 || isCompleted}
                  data-testid="button-check-answer"
                >
                  <Check className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Check Your Answer</span>
                  <span className="sm:hidden">Check</span>
                </Button>
              )}
            </div>
          </div>
        </PageHeader>
        
        {/* Exercise Area */}
        <div className="flex-1 p-6 overflow-auto">
          {/* Current Exercise Info */}
          {currentExercise && (
            <div className="mb-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                    <h3 className="text-xl font-semibold">Current Exercise</h3>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center justify-center px-3 py-1 bg-primary text-primary-foreground rounded-full text-sm font-medium">
                        Scale Practice
                      </span>
                      <span className="inline-flex items-center justify-center px-3 py-1 bg-warning text-warning-foreground rounded-full text-sm font-medium">
                        {currentExercise.category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-foreground">
                      {practiceMode === 'practice' ? currentExercise.instruction : 
                       `Study the ${currentExercise.itemName} scale - all correct notes are highlighted on the piano`}
                    </h2>
                    
                    {/* Expandable Educational Content */}
                    <div className="border rounded-lg">
                      <button
                        onClick={() => setShowKeySignature(!showKeySignature)}
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors"
                        data-testid="button-toggle-key-info"
                      >
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-slate-600" />
                          <span className="font-medium text-slate-900">
                            Learn about {currentExercise.itemName}
                          </span>
                          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                            Key signature & tips
                          </span>
                        </div>
                        {showKeySignature ? 
                          <ChevronUp className="h-4 w-4 text-slate-400" /> : 
                          <ChevronDown className="h-4 w-4 text-slate-400" />
                        }
                      </button>
                      
                      {showKeySignature && keySignature && (
                        <div className="px-4 pb-4 border-t bg-slate-50">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3 pt-4">
                            <div>
                              <p className="text-sm font-medium text-slate-700 mb-1">Key Signature</p>
                              <p className="text-sm text-slate-600">
                                {keySignature.sharps.length > 0 && (
                                  <span>{keySignature.sharps.length} sharp{keySignature.sharps.length > 1 ? 's' : ''}: {keySignature.sharps.join(', ')}</span>
                                )}
                                {keySignature.flats.length > 0 && (
                                  <span>{keySignature.flats.length} flat{keySignature.flats.length > 1 ? 's' : ''}: {keySignature.flats.join(', ')}</span>
                                )}
                                {keySignature.sharps.length === 0 && keySignature.flats.length === 0 && (
                                  <span>No sharps or flats</span>
                                )}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-700 mb-1">Purple keys on piano →</p>
                              <p className="text-sm text-slate-600">show these accidentals</p>
                            </div>
                          </div>
                          
                          {keySignature.sharps.length > 0 && (
                            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                              <p className="text-sm text-blue-800 font-medium mb-1">💡 Memory Tip</p>
                              <p className="text-sm text-blue-700">Sharp keys follow "Father Charles Goes Down And Ends Battle" (F#-C#-G#-D#-A#-E#-B#)</p>
                            </div>
                          )}
                          
                          {keySignature.flats.length > 0 && (
                            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                              <p className="text-sm text-blue-800 font-medium mb-1">💡 Memory Tip</p>
                              <p className="text-sm text-blue-700">Flat keys follow "Battle Ends And Down Goes Charles's Father" (B♭-E♭-A♭-D♭-G♭-C♭-F♭)</p>
                            </div>
                          )}
                          
                          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                            <p className="text-sm text-green-800 font-medium mb-1">📚 Scale Pattern</p>
                            <p className="text-sm text-green-700">{currentExercise.explanation}</p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {practiceMode === 'practice' && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-blue-800 font-medium mb-1">🎹 Practice Mode</p>
                        <p className="text-sm text-blue-700">Click piano keys to select the notes you think belong in this scale. Listen to each note as you click it to help train your ear!</p>
                        {completionTime && isCompleted && (
                          <div className="mt-2 pt-2 border-t border-blue-300">
                            <p className="text-sm text-blue-700 font-medium">
                              ⏱️ Completed in {completionTime} seconds!
                              {completionTime <= 3 && ' Amazing speed! ⚡'}
                              {completionTime > 3 && completionTime <= 6 && ' Great job! 🚀'}
                              {completionTime > 6 && completionTime <= 10 && ' Good timing! ⏰'}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {practiceMode === 'show_key' && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="text-sm text-green-800 font-medium mb-1">👁️ Study Mode</p>
                        <p className="text-sm text-green-700">All the correct notes are highlighted in green. Study the pattern and listen to the scale by clicking the Play Scale button above.</p>
                      </div>
                    )}
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
                  highlightedNotes={practiceMode === 'show_key' || showKeySignature ? highlightedNotes : (isCompleted ? highlightedNotes : [])}
                  sharpsInKey={keySignature?.sharps || []}
                  playedNotes={currentExercise?.mode === 'practice' ? playedNotes : []}
                  selectedNotes={practiceMode === 'practice' && currentExercise?.mode === 'learn' ? selectedNotes : []}
                  onNoteClick={handleNoteClick}
                  onNoteToggle={practiceMode === 'practice' && currentExercise?.mode === 'learn' ? handleNoteToggle : undefined}
                />
                <div className="mt-4 text-center">
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>
                      Keys highlighted in <span className="font-medium" style={{color: 'hsl(142 71% 45%)'}}>green</span> show correct answers when completed.
                    </p>
                    {keySignature && (keySignature.sharps.length > 0 || keySignature.flats.length > 0) && (
                      <p>
                        Keys highlighted in <span className="font-medium" style={{color: 'hsl(262 83% 58%)'}}>purple</span> are the {keySignature.sharps.length > 0 ? 'sharps' : 'flats'} in {keySignature.name} key signature.
                      </p>
                    )}
                    {currentExercise?.mode === 'learn' && (
                      <p>
                        Keys with <span className="font-medium" style={{color: 'hsl(217 91% 60%)'}}>blue background</span> are your current selections.
                      </p>
                    )}
                    {currentExercise?.mode === 'practice' && (
                      <p>
                        Keys highlighted in <span className="font-medium" style={{color: 'hsl(32 95% 44%)'}}>orange</span> show your played sequence.
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
