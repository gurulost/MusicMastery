import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, CornerLeftUp, Check, Clock, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { INTERVALS } from '@/lib/musicTheory';

const DEMO_USER_ID = 'demo-user';

export default function IntervalsPage() {
  const { data: allProgress } = useQuery({
    queryKey: ['/api/progress', DEMO_USER_ID],
  });

  const getProgressIcon = (intervalName: string) => {
    const progress = allProgress?.find(p => p.category === 'intervals' && p.itemName === intervalName);
    
    switch (progress?.status) {
      case 'mastered':
        return <Check className="h-5 w-5 text-success" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-warning" />;
      default:
        return <Circle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getProgressBadge = (intervalName: string) => {
    const progress = allProgress?.find(p => p.category === 'intervals' && p.itemName === intervalName);
    
    switch (progress?.status) {
      case 'mastered':
        return <span className="text-xs bg-success text-success-foreground px-2 py-1 rounded-full">Mastered</span>;
      case 'in_progress':
        return <span className="text-xs bg-warning text-warning-foreground px-2 py-1 rounded-full">In Progress</span>;
      default:
        return <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full">Not Started</span>;
    }
  };

  const masteredIntervals = allProgress?.filter(p => p.category === 'intervals' && p.status === 'mastered').length || 0;

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

        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Interval Building Progress</h1>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <CornerLeftUp className="h-5 w-5 mr-2" />
                  All Intervals
                </span>
                <span className="text-sm font-normal" data-testid="intervals-progress">
                  {masteredIntervals}/{INTERVALS.length} Mastered
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {INTERVALS.map((interval) => (
                  <div key={interval.name} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div className="flex items-center">
                      {getProgressIcon(interval.name)}
                      <div className="ml-3">
                        <span className="font-medium" data-testid={`interval-${interval.shortName.toLowerCase()}`}>
                          {interval.name}
                        </span>
                        <div className="text-sm text-muted-foreground">
                          {interval.shortName} • {interval.semitones} semitones
                        </div>
                      </div>
                    </div>
                    {getProgressBadge(interval.name)}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
