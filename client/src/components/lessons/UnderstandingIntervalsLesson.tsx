import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, ArrowRight } from 'lucide-react';

interface UnderstandingIntervalsLessonProps {
  section: 'learn' | 'practice' | 'test';
  onComplete: () => void;
}

export function UnderstandingIntervalsLesson({ section, onComplete }: UnderstandingIntervalsLessonProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Understanding Intervals - Coming Soon</CardTitle>
      </CardHeader>
      <CardContent>
        <p>This lesson is being developed.</p>
        <Button onClick={onComplete} className="mt-4">
          Continue
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}