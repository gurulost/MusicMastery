import { useState } from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Music, Check, Clock, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MAJOR_SCALES, MINOR_SCALES, getScale } from '@/lib/musicTheory';
import { HelpDialog } from '@/components/HelpDialog';
import { HelpTooltip } from '@/components/HelpTooltip';
import { PageHeader } from '@/components/PageHeader';
import { useUser } from '@/contexts/UserContext';

export default function ScalesPage() {
  const [showHelp, setShowHelp] = useState(false);
  const { currentUser } = useUser();
  
  const { data: allProgress } = useQuery<any[]>({
    queryKey: ['/api/progress', currentUser?.id],
    enabled: !!currentUser?.id,
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
        return (
          <span className="text-xs border border-success/20 text-success px-2 py-1 rounded-full flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-success rounded-full" />
            Mastered
          </span>
        );
      case 'in_progress':
        return (
          <span className="text-xs border border-warning/20 text-warning px-2 py-1 rounded-full flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-warning rounded-full" />
            In Progress
          </span>
        );
      default:
        return (
          <span className="text-xs border border-muted text-muted-foreground px-2 py-1 rounded-full flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full" />
            Not Started
          </span>
        );
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
          <PageHeader 
            title="Scale Mastery Progress"
            subtitle="Master major and minor scales systematically"
          >
            <HelpTooltip 
              content="Click for detailed instructions on how to practice scales"
              onClick={() => setShowHelp(true)}
            />
          </PageHeader>
          
          <div className="bg-accent/30 border border-accent/50 rounded-lg p-4 mb-8">
            <h3 className="text-sm font-semibold text-accent-foreground mb-2">📚 Learning Strategy</h3>
            <p className="text-sm text-muted-foreground">
              <strong>Start with Major Scales:</strong> Begin with C Major (no sharps/flats), then G Major (1 sharp), and progress gradually.
              <br />
              <strong>Then Minor Scales:</strong> Learn natural minor scales - they share key signatures with their relative majors.
            </p>
          </div>
          
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
                  {MAJOR_SCALES.map((scale) => {
                    const scaleName = getScale(scale).name;
                    return (
                      <div key={`${scale.tonic}-${scale.type}`} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center">
                          {getProgressIcon('major_scales', scaleName)}
                          <span className="ml-3" data-testid={`scale-${scaleName.replace(' ', '-').toLowerCase()}`}>
                            {scaleName}
                          </span>
                        </div>
                        {getProgressBadge('major_scales', scaleName)}
                      </div>
                    );
                  })}
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
                  {MINOR_SCALES.map((scale) => {
                    const scaleName = getScale(scale).name;
                    return (
                      <div key={`${scale.tonic}-${scale.type}`} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center">
                          {getProgressIcon('minor_scales', scaleName)}
                          <span className="ml-3" data-testid={`scale-${scaleName.replace(' ', '-').toLowerCase()}`}>
                            {scaleName}
                          </span>
                        </div>
                        {getProgressBadge('minor_scales', scaleName)}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <HelpDialog 
        open={showHelp} 
        onClose={() => setShowHelp(false)} 
        topic="scales" 
      />
    </div>
  );
}
