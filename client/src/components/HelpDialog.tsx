import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Music, Target, BookOpen, Keyboard, Play, Check, RotateCcw } from "lucide-react";

interface HelpDialogProps {
  open: boolean;
  onClose: () => void;
  topic: 'scales' | 'intervals' | 'piano' | 'learning-journey' | 'general';
}

export function HelpDialog({ open, onClose, topic }: HelpDialogProps) {
  const helpContent = {
    scales: {
      title: "How to Practice Scales",
      icon: <Music className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-4">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-sm">Learn Mode</span>
                Select the Correct Notes
              </h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Click the piano keys that belong to the scale</li>
                <li>• Keys turn purple when selected</li>
                <li>• Order doesn't matter - just get all the right notes</li>
                <li>• Click "Check Answer" when ready</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-sm">Practice Mode</span>
                Play in Sequence
              </h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Play the scale from lowest to highest note</li>
                <li>• Keys turn orange as you play them</li>
                <li>• Order matters - follow the scale pattern exactly</li>
                <li>• Use the "Play Scale" button to hear the correct sequence</li>
              </ul>
            </CardContent>
          </Card>

          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Tips for Success:</h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Yellow keys show sharps/flats in the key signature</li>
              <li>• Start with C Major (no sharps or flats) if you're new</li>
              <li>• Listen to the audio playback to train your ear</li>
              <li>• Practice regularly - consistency is key!</li>
            </ul>
          </div>
        </div>
      )
    },
    intervals: {
      title: "How to Practice Intervals",
      icon: <Target className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-4">
              <h4 className="font-semibold mb-2">Building Intervals</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Start with the given root note (already highlighted)</li>
                <li>• Count the correct number of steps for the interval</li>
                <li>• Click the destination note to complete the interval</li>
                <li>• Both notes will be selected when correct</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <h4 className="font-semibold mb-2">Understanding Intervals</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <strong>Perfect:</strong> Unison, 4th, 5th, Octave
                </div>
                <div>
                  <strong>Major:</strong> 2nd, 3rd, 6th, 7th
                </div>
                <div>
                  <strong>Minor:</strong> 2nd, 3rd, 6th, 7th
                </div>
                <div>
                  <strong>Tritone:</strong> Augmented 4th/Diminished 5th
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
            <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">Pro Tips:</h4>
            <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
              <li>• Use the "Play Interval" button to hear how it sounds</li>
              <li>• Learn the patterns - they repeat across octaves</li>
              <li>• Start with perfect intervals (easiest to hear)</li>
              <li>• Practice identifying intervals by ear, not just visually</li>
            </ul>
          </div>
        </div>
      )
    },
    piano: {
      title: "Piano Keyboard Guide",
      icon: <Keyboard className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-4">
              <h4 className="font-semibold mb-3">Interactive Controls</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-3">
                  <Button size="sm" variant="outline"><Play className="w-3 h-3" /></Button>
                  <span>Play the correct sequence or interval</span>
                </div>
                <div className="flex items-center gap-3">
                  <Button size="sm" variant="outline"><Check className="w-3 h-3" /></Button>
                  <span>Check your answer</span>
                </div>
                <div className="flex items-center gap-3">
                  <Button size="sm" variant="outline"><RotateCcw className="w-3 h-3" /></Button>
                  <span>Try again / Reset selections</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <h4 className="font-semibold mb-3">Keyboard Layout</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Our piano covers 2.5 octaves (37 keys total):
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Half octave below middle C (A, B)</li>
                <li>• Two full octaves from middle C</li>
                <li>• Half octave above (C, D, E, F)</li>
              </ul>
            </CardContent>
          </Card>

          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Touch-Friendly Design</h4>
            <p className="text-sm text-muted-foreground">
              Works great on tablets! Keys are sized for easy touch interaction, 
              with visual and audio feedback for every press.
            </p>
          </div>
        </div>
      )
    },
    'learning-journey': {
      title: "7-Step Learning Journey",
      icon: <BookOpen className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-4">
              <h4 className="font-semibold mb-2">How It Works</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• 7 progressive lessons building your skills</li>
                <li>• Each lesson has Learn → Practice → Test sections</li>
                <li>• Complete each section to unlock the next</li>
                <li>• Track your progress with detailed analytics</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <h4 className="font-semibold mb-2">The Journey Path</h4>
              <div className="text-sm space-y-2">
                <div className="flex gap-2"><span className="font-medium">Step 1-2:</span> Basic major scales</div>
                <div className="flex gap-2"><span className="font-medium">Step 3-4:</span> Minor scales and key signatures</div>
                <div className="flex gap-2"><span className="font-medium">Step 5-6:</span> Simple intervals</div>
                <div className="flex gap-2"><span className="font-medium">Step 7:</span> Advanced intervals and review</div>
              </div>
            </CardContent>
          </Card>

          <div className="bg-purple-50 dark:bg-purple-950 p-4 rounded-lg">
            <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">Why Use This Path?</h4>
            <p className="text-sm text-purple-800 dark:text-purple-200">
              This structured approach builds concepts progressively, ensuring you have 
              a solid foundation before moving to advanced topics. Perfect for AP Music Theory prep!
            </p>
          </div>
        </div>
      )
    },
    general: {
      title: "Getting Started Guide",
      icon: <BookOpen className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-4">
              <h4 className="font-semibold mb-2">New to Music Theory?</h4>
              <p className="text-sm text-muted-foreground mb-2">Start with the Learning Journey for a guided experience.</p>
              <Button size="sm" className="w-full">Go to Learning Journey</Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <h4 className="font-semibold mb-2">Want to Practice Specific Topics?</h4>
              <div className="grid grid-cols-2 gap-2">
                <Button size="sm" variant="outline">Scales</Button>
                <Button size="sm" variant="outline">Intervals</Button>
              </div>
            </CardContent>
          </Card>

          <div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-lg">
            <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">Need Help?</h4>
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              Look for the (?) help button on any page for specific instructions, 
              or use the user menu to switch between accounts.
            </p>
          </div>
        </div>
      )
    }
  };

  const content = helpContent[topic];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="help-dialog">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {content.icon}
            {content.title}
          </DialogTitle>
          <DialogDescription>
            Everything you need to know to get started and succeed.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {content.content}
        </div>

        <div className="flex justify-end">
          <Button onClick={onClose} data-testid="help-close">
            Got it!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}