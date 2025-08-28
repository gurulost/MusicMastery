import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, CheckCircle, Play, RotateCcw, Lightbulb, Target } from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { PianoKeyboard } from '@/components/PianoKeyboard';
import { MusicalAlphabetLesson } from '@/components/lessons/MusicalAlphabetLesson';
import { WholeHalfStepsLesson } from '@/components/lessons/WholeHalfStepsLesson';
import { MajorScalesLesson } from '@/components/lessons/MajorScalesLesson';
import { MinorScalesLesson } from '@/components/lessons/MinorScalesLesson';
import { KeySignaturesLesson } from '@/components/lessons/KeySignaturesLesson';
import { UnderstandingIntervalsLesson } from '@/components/lessons/UnderstandingIntervalsLesson';
import { BuildingIntervalsLesson } from '@/components/lessons/BuildingIntervalsLesson';
import { useUser } from '@/contexts/UserContext';

const LESSON_COMPONENTS = {
  1: {
    learn: MusicalAlphabetLesson,
    practice: MusicalAlphabetLesson,
    test: MusicalAlphabetLesson
  },
  2: {
    learn: WholeHalfStepsLesson,
    practice: WholeHalfStepsLesson,
    test: WholeHalfStepsLesson
  },
  3: {
    learn: MajorScalesLesson,
    practice: MajorScalesLesson,
    test: MajorScalesLesson
  },
  4: {
    learn: MinorScalesLesson,
    practice: MinorScalesLesson,
    test: MinorScalesLesson
  },
  5: {
    learn: KeySignaturesLesson,
    practice: KeySignaturesLesson,
    test: KeySignaturesLesson
  },
  6: {
    learn: UnderstandingIntervalsLesson,
    practice: UnderstandingIntervalsLesson,
    test: UnderstandingIntervalsLesson
  },
  7: {
    learn: BuildingIntervalsLesson,
    practice: BuildingIntervalsLesson,
    test: BuildingIntervalsLesson
  }
};

// Using user context instead of hardcoded ID

export default function LessonPage() {
  const params = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentUser, isLoadingUser } = useUser();
  
  const stepId = parseInt(params.stepId || '1');
  const section = (params.section as 'learn' | 'practice' | 'test') || 'learn';

  const LessonComponent = LESSON_COMPONENTS[stepId as keyof typeof LESSON_COMPONENTS]?.[section];

  // Update learning progress mutation
  const updateProgress = useMutation({
    mutationFn: async (data: any) => {
      if (!currentUser?.id) {
        throw new Error('No user logged in');
      }
      
      const response = await apiRequest('POST', '/api/learning-progress', {
        userId: currentUser.id,
        stepId,
        section,
        isCompleted: true,
        ...data
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/learning-progress'] });
      toast({
        title: "Progress Saved!",
        description: `${section.charAt(0).toUpperCase() + section.slice(1)} section completed.`,
      });
    },
    onError: (error) => {
      console.error('Learning progress mutation error:', error);
      toast({
        title: "Error",
        description: "Failed to save progress. Please try again.",
        variant: "destructive"
      });
    },
  });

  const handleCompleteSection = async (score?: number) => {
    // Check if user is logged in first
    if (!currentUser?.id) {
      toast({
        title: "Error",
        description: "Please select a user first.",
        variant: "destructive"
      });
      return;
    }

    // Save progress to database FIRST
    try {
      await updateProgress.mutateAsync({ score });
      
      // Then navigate to next section or back to journey
      if (section === 'learn') {
        navigate(`/lesson/${stepId}/practice`);
      } else if (section === 'practice') {
        navigate(`/lesson/${stepId}/test`);
      } else {
        // Test completed, go back to journey or next step
        if (stepId < 7) {
          navigate(`/lesson/${stepId + 1}/learn`);
        } else {
          navigate('/learning-journey');
        }
      }
    } catch (error) {
      console.error('Complete section error:', error);
      // Don't show additional error toast here since the mutation onError already handles it
    }
  };

  const getSectionTitle = () => {
    const titles = {
      learn: 'Learn the Concept',
      practice: 'Practice the Skill',
      test: 'Test Your Mastery'
    };
    return titles[section];
  };

  const getSectionIcon = () => {
    const icons = {
      learn: <Lightbulb className="h-5 w-5" />,
      practice: <Target className="h-5 w-5" />,
      test: <CheckCircle className="h-5 w-5" />
    };
    return icons[section];
  };

  // Show loading screen while user context is loading
  if (isLoadingUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show login screen if no user is selected
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-bold mb-2">Please Select a User</h2>
            <p className="text-muted-foreground mb-4">You need to be logged in to access lessons.</p>
            <Link href="/">
              <Button>Go to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!LessonComponent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-2">Lesson Not Found</h2>
            <p className="text-muted-foreground mb-4">This lesson is still being developed.</p>
            <Link href="/learning-journey">
              <Button>Back to Learning Journey</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Link href="/learning-journey">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Journey
              </Button>
            </Link>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>Step {stepId} of 7</span>
            <span>•</span>
            <span>{getSectionTitle()}</span>
          </div>
        </div>

        {/* Section Header */}
        <div className="max-w-4xl mx-auto mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                {getSectionIcon()}
                <span className="ml-2">{getSectionTitle()}</span>
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Lesson Content */}
        <div className="max-w-4xl mx-auto">
          <LessonComponent 
            section={section}
            onComplete={handleCompleteSection}
          />
        </div>
      </div>
    </div>
  );
}