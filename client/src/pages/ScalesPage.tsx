import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Music, Check, Clock, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MAJOR_SCALES, MINOR_SCALES } from '@/lib/musicTheory';

const DEMO_USER_ID = 'demo-user';

export default function ScalesPage() {
  const { data: allProgress } = useQuery<any[]>({
    queryKey: ['/api/progress', DEMO_USER_ID],
  });

  const getProgressIcon = (category: string, scaleName: string) => {
    const progress = allProgress?.find(p => p.category === category && p.itemName === scaleName);
    
    switch (progress?.status) {
      case 'mastered':
        return <Check className="h-5 w-5 text-success" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-warning" />;
      default:
        return <Circle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getProgressBadge = (category: string, scaleName: string) => {
    const progress = allProgress?.find(p => p.category === category && p.itemName === scaleName);
    
    switch (progress?.status) {
      case 'mastered':
        return <span className="text-xs bg-success text-success-foreground px-2 py-1 rounded-full">Mastered</span>;
      case 'in_progress':
        return <span className="text-xs bg-warning text-warning-foreground px-2 py-1 rounded-full">In Progress</span>;
      default:
        return <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full">Not Started</span>;
    }
  };

  const masteredMajor = allProgress?.filter(p => p.category === 'major_scales' && p.status === 'mastered').length || 0;
  const masteredMinor = allProgress?.filter(p => p.category === 'minor_scales' && p.status === 'mastered').length || 0;

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
          <h1 className="text-3xl font-bold mb-8">Scale Mastery Progress</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Major Scales */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Music className="h-5 w-5 mr-2" />
                    Major Scales
                  </span>
                  <span className="text-sm font-normal" data-testid="major-scales-progress">
                    {masteredMajor}/12 Mastered
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {MAJOR_SCALES.map((scale) => (
                    <div key={scale} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center">
                        {getProgressIcon('major_scales', scale)}
                        <span className="ml-3" data-testid={`scale-${scale.replace(' ', '-').toLowerCase()}`}>
                          {scale}
                        </span>
                      </div>
                      {getProgressBadge('major_scales', scale)}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Minor Scales */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Music className="h-5 w-5 mr-2" />
                    Minor Scales
                  </span>
                  <span className="text-sm font-normal" data-testid="minor-scales-progress">
                    {masteredMinor}/12 Mastered
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {MINOR_SCALES.map((scale) => (
                    <div key={scale} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center">
                        {getProgressIcon('minor_scales', scale)}
                        <span className="ml-3" data-testid={`scale-${scale.replace(' ', '-').toLowerCase()}`}>
                          {scale}
                        </span>
                      </div>
                      {getProgressBadge('minor_scales', scale)}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
