import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Music, BookOpen, Target, ChartLine, ArrowRight, Keyboard } from "lucide-react";
import { Link } from "wouter";
import { useUser } from "@/contexts/UserContext";

interface WelcomeDialogProps {
  open: boolean;
  onClose: () => void;
}

export function WelcomeDialog({ open, onClose }: WelcomeDialogProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const { currentUser } = useUser();

  const welcomeSteps = [
    {
      title: `Welcome to AP Music Theory, ${currentUser?.username}! 🎵`,
      description: "Your comprehensive learning platform for mastering scales, intervals, and music theory concepts.",
      content: (
        <div className="text-center space-y-4">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Everything you need to succeed:</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>✓ Interactive 2.5-octave piano keyboard</li>
              <li>✓ Step-by-step guided learning journey</li>
              <li>✓ Progress tracking across all concepts</li>
              <li>✓ Multiple practice modes</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      title: "Choose Your Learning Path",
      description: "We recommend starting with the guided journey, but you can explore any area that interests you.",
      content: (
        <div className="space-y-4">
          <Card className="border-green-200 bg-green-50 dark:bg-green-950">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-green-600" />
                <CardTitle className="text-sm">Recommended for Beginners</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <h4 className="font-semibold text-green-800 dark:text-green-200">7-Step Learning Journey</h4>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                Start here! Structured lessons from basic scales to advanced intervals.
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Music className="w-4 h-4 text-blue-600" />
                  <h4 className="font-semibold text-sm">Scales Practice</h4>
                </div>
                <p className="text-xs text-muted-foreground">Master major and minor scales</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-orange-600" />
                  <h4 className="font-semibold text-sm">Intervals Practice</h4>
                </div>
                <p className="text-xs text-muted-foreground">Learn musical intervals</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    },
    {
      title: "Understanding the Piano Interface",
      description: "Learn how to interact with the piano keyboard and what each color means.",
      content: (
        <div className="space-y-4">
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Keyboard className="w-4 h-4" />
              Piano Key Colors Guide
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-green-500 rounded border"></div>
                <span><strong>Green:</strong> Correct answers when completed</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-purple-200 border-purple-400 border rounded"></div>
                <span><strong>Purple:</strong> Your current selections</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-orange-400 rounded border"></div>
                <span><strong>Orange:</strong> Played notes in sequence mode</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-yellow-600 rounded border"></div>
                <span><strong>Yellow:</strong> Sharps/flats in key signature</span>
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            💡 <strong>Tip:</strong> Works great on iPads too! Click piano keys to select them, and use the help button (?) on any page for specific instructions.
          </p>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (currentStep < welcomeSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStart = () => {
    // Mark user as having seen welcome
    localStorage.setItem(`welcome-seen-${currentUser?.id}`, 'true');
    onClose();
  };

  const currentWelcome = welcomeSteps[currentStep];

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="welcome-dialog">
        <DialogHeader>
          <DialogTitle className="text-xl">{currentWelcome.title}</DialogTitle>
          <DialogDescription className="text-base">
            {currentWelcome.description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {currentWelcome.content}
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 mb-4">
          {welcomeSteps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentStep ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            data-testid="welcome-previous"
          >
            Previous
          </Button>
          
          <div className="flex gap-2">
            {currentStep === welcomeSteps.length - 1 ? (
              <>
                <Link href="/learning-journey">
                  <Button onClick={handleStart} data-testid="welcome-start-journey">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Start Learning Journey
                  </Button>
                </Link>
                <Button variant="outline" onClick={handleStart} data-testid="welcome-explore">
                  Explore on My Own
                </Button>
              </>
            ) : (
              <Button onClick={handleNext} data-testid="welcome-next">
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}