import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'wouter';
import { ArrowLeft, CheckCircle, Lock, Play, BookOpen, Target, Award, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { HelpDialog } from '@/components/HelpDialog';
import { HelpTooltip } from '@/components/HelpTooltip';
import { useUser } from '@/contexts/UserContext';

// Use user context instead of hardcoded ID

// The 7-step learning journey based on the attached guide
const LEARNING_STEPS = [
  {
    id: 1,
    title: "Musical Alphabet",
    subtitle: "Notes, Sharps & Flats",
    description: "Learn the basic vocabulary of music - the 7 letter names and how sharps/flats work.",
    duration: "5 min",
    difficulty: "Beginner",
    isQuick: true, // Since most already know this
    sections: ['learn', 'practice', 'test']
  },
  {
    id: 2,
    title: "Whole & Half Steps",
    subtitle: "The Building Blocks",
    description: "Master the smallest intervals - the foundation for everything else.",
    duration: "15 min",
    difficulty: "Beginner",
    sections: ['learn', 'practice', 'test']
  },
  {
    id: 3,
    title: "Major Scales",
    subtitle: "W-W-H-W-W-W-H Pattern",
    description: "Build all 12 major scales using the universal pattern.",
    duration: "45 min",
    difficulty: "Intermediate",
    sections: ['learn', 'practice', 'test']
  },
  {
    id: 4,
    title: "Minor Scales",
    subtitle: "W-H-W-W-H-W-W Pattern",
    description: "Learn natural minor scales and their relationship to major scales.",
    duration: "45 min",
    difficulty: "Intermediate",
    sections: ['learn', 'practice', 'test']
  },
  {
    id: 5,
    title: "Key Signatures",
    subtitle: "Circle of Fifths",
    description: "Understand key signatures and the relationships between keys.",
    duration: "30 min",
    difficulty: "Intermediate",
    sections: ['learn', 'practice', 'test']
  },
  {
    id: 6,
    title: "Understanding Intervals",
    subtitle: "Distance Between Notes",
    description: "Learn to identify and name all interval types and qualities.",
    duration: "60 min",
    difficulty: "Advanced",
    sections: ['learn', 'practice', 'test']
  },
  {
    id: 7,
    title: "Building Intervals",
    subtitle: "Up and Down",
    description: "Practice building any interval from any starting note.",
    duration: "60 min",
    difficulty: "Advanced",
    sections: ['learn', 'practice', 'test']
  }
];

interface LearningProgress {
  stepId: number;
  section: 'learn' | 'practice' | 'test';
  status: 'not_started' | 'in_progress' | 'completed';
  score?: number;
  attempts?: number;
}

export default function LearningJourneyPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [currentSection, setCurrentSection] = useState<'learn' | 'practice' | 'test'>('learn');
  const [showHelp, setShowHelp] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentUser } = useUser();

  // Fetch learning progress
  const { data: progress } = useQuery<LearningProgress[]>({
    queryKey: ['/api/learning-progress', currentUser?.id],
    enabled: !!currentUser?.id,
  });

  // Update progress mutation
  const updateProgress = useMutation({
    mutationFn: async (data: Partial<LearningProgress>) => {
      const response = await apiRequest('POST', '/api/learning-progress', {
        userId: currentUser?.id,
        ...data
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/learning-progress'] });
    },
  });

  const getStepProgress = (stepId: number): { completedSections: number, totalSections: number, isCompleted: boolean, canAccess: boolean } => {
    const stepProgress = progress?.filter(p => p.stepId === stepId) || [];
    const sections = ['learn', 'practice', 'test'] as const;
    
    let completedSections = 0;
    sections.forEach(section => {
      const sectionProgress = stepProgress.find(p => p.section === section);
      if (sectionProgress?.status === 'completed') completedSections++;
    });
    
    return {
      completedSections,
      totalSections: sections.length,
      isCompleted: completedSections === sections.length,
      canAccess: stepId === 1 || getStepProgress(stepId - 1).isCompleted
    };
  };

  const getCurrentStepInfo = () => {
    return LEARNING_STEPS.find(step => step.id === currentStep) || LEARNING_STEPS[0];
  };

  const handleStartStep = (stepId: number, section: 'learn' | 'practice' | 'test') => {
    const stepProgress = getStepProgress(stepId);
    if (!stepProgress.canAccess) {
      toast({
        title: "Step Locked",
        description: "Complete the previous step first to unlock this one.",
        variant: "destructive"
      });
      return;
    }
    
    setCurrentStep(stepId);
    setCurrentSection(section);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStepIcon = (stepId: number) => {
    const stepProgress = getStepProgress(stepId);
    if (stepProgress.isCompleted) {
      return <CheckCircle className="h-6 w-6 text-success" />;
    } else if (!stepProgress.canAccess) {
      return <Lock className="h-6 w-6 text-muted-foreground" />;
    } else {
      return <div className="h-6 w-6 rounded-full border-2 border-primary flex items-center justify-center text-primary font-bold text-sm">{stepId}</div>;
    }
  };

  const currentStepInfo = getCurrentStepInfo();
  const overallProgress = LEARNING_STEPS.reduce((acc, step) => {
    const stepProgress = getStepProgress(step.id);
    return acc + (stepProgress.isCompleted ? 1 : 0);
  }, 0);

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6">
        <div className="flex items-center mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-3xl font-bold">Your Learning Journey</h1>
              <HelpTooltip 
                content="Click for detailed information about the 7-step learning path"
                onClick={() => setShowHelp(true)}
              />
            </div>
            <p className="text-muted-foreground mb-4">
              Master music theory step by step - from silence to scales to intervals
            </p>
            
            {/* Overall Progress */}
            <div className="bg-card border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm text-muted-foreground">{overallProgress}/7 Steps Completed</span>
              </div>
              <Progress value={(overallProgress / 7) * 100} className="h-2" />
            </div>
          </div>

          {/* Learning Steps */}
          <div className="grid gap-4">
            {LEARNING_STEPS.map((step, index) => {
              const stepProgress = getStepProgress(step.id);
              const isActive = currentStep === step.id;
              
              return (
                <Card key={step.id} className={`transition-all ${isActive ? 'ring-2 ring-primary' : ''}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {getStepIcon(step.id)}
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="text-lg font-semibold">{step.title}</h3>
                            <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(step.difficulty)}`}>
                              {step.difficulty}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              ~{step.duration}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">{step.subtitle}</p>
                          <p className="text-sm text-muted-foreground">{step.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {stepProgress.canAccess ? (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStartStep(step.id, 'learn')}
                              disabled={!stepProgress.canAccess}
                            >
                              <BookOpen className="h-4 w-4 mr-1" />
                              Learn
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStartStep(step.id, 'practice')}
                              disabled={!stepProgress.canAccess}
                            >
                              <Target className="h-4 w-4 mr-1" />
                              Practice
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStartStep(step.id, 'test')}
                              disabled={!stepProgress.canAccess}
                            >
                              <Award className="h-4 w-4 mr-1" />
                              Test
                            </Button>
                          </>
                        ) : (
                          <div className="text-sm text-muted-foreground flex items-center">
                            <Lock className="h-4 w-4 mr-1" />
                            Complete Step {step.id - 1} First
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar for this step */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                        <span>Step Progress</span>
                        <span>{stepProgress.completedSections}/3 sections completed</span>
                      </div>
                      <Progress 
                        value={(stepProgress.completedSections / 3) * 100} 
                        className="h-1" 
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Current Lesson Preview */}
          {currentStep && currentSection && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Current Lesson: {currentStepInfo.title} - {currentSection.charAt(0).toUpperCase() + currentSection.slice(1)}</span>
                  <Link href={`/lesson/${currentStep}/${currentSection}`}>
                    <Button>
                      Start Lesson
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{currentStepInfo.description}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      <HelpDialog 
        open={showHelp} 
        onClose={() => setShowHelp(false)} 
        topic="learning-journey" 
      />
    </div>
  );
}