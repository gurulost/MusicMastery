import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, TrendingUp, Target, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProgressRing } from '@/components/ProgressRing';

const DEMO_USER_ID = 'demo-user';

interface ProgressSummary {
  totalItems: number;
  mastered: number;
  inProgress: number;
  notStarted: number;
  overallProgress: number;
}

export default function ProgressPage() {
  const { data: progressSummary } = useQuery<ProgressSummary>({
    queryKey: ['/api/progress-summary', DEMO_USER_ID],
  });

  const { data: allProgress } = useQuery<any[]>({
    queryKey: ['/api/progress', DEMO_USER_ID],
  });

  const { data: exerciseSessions } = useQuery<any[]>({
    queryKey: ['/api/exercise-sessions', DEMO_USER_ID],
  });

  const recentSessions = exerciseSessions?.slice(-10) || [];
  const totalSessions = exerciseSessions?.length || 0;
  const correctSessions = exerciseSessions?.filter(s => s.isCorrect).length || 0;
  const accuracy = totalSessions > 0 ? Math.round((correctSessions / totalSessions) * 100) : 0;

  const majorScalesProgress = allProgress?.filter(p => p.category === 'major_scales') || [];
  const minorScalesProgress = allProgress?.filter(p => p.category === 'minor_scales') || [];
  const intervalsProgress = allProgress?.filter(p => p.category === 'intervals') || [];

  const majorMastered = majorScalesProgress.filter(p => p.status === 'mastered').length;
  const minorMastered = minorScalesProgress.filter(p => p.status === 'mastered').length;
  const intervalsMastered = intervalsProgress.filter(p => p.status === 'mastered').length;

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
          <h1 className="text-3xl font-bold mb-8">Detailed Progress Report</h1>
          
          {/* Overall Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6 text-center">
                <ProgressRing progress={progressSummary?.overallProgress || 0} size={80} />
                <h3 className="text-lg font-semibold mt-4">Overall Progress</h3>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-success" data-testid="accuracy-percentage">
                  {accuracy}%
                </div>
                <h3 className="text-lg font-semibold mt-2">Accuracy Rate</h3>
                <p className="text-sm text-muted-foreground">
                  {correctSessions}/{totalSessions} exercises
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-primary" data-testid="total-sessions">
                  {totalSessions}
                </div>
                <h3 className="text-lg font-semibold mt-2">Total Sessions</h3>
                <p className="text-sm text-muted-foreground">Practice attempts</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-warning" data-testid="mastered-topics">
                  {progressSummary?.mastered || 0}
                </div>
                <h3 className="text-lg font-semibold mt-2">Mastered Topics</h3>
                <p className="text-sm text-muted-foreground">
                  of {progressSummary?.totalItems || 40} total
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Category Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Major Scales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-center mb-4" data-testid="major-scales-mastered">
                  {majorMastered}/12
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-success h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(majorMastered / 12) * 100}%` }}
                  ></div>
                </div>
                <p className="text-sm text-muted-foreground mt-2 text-center">
                  {Math.round((majorMastered / 12) * 100)}% Complete
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Minor Scales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-center mb-4" data-testid="minor-scales-mastered">
                  {minorMastered}/12
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-success h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(minorMastered / 12) * 100}%` }}
                  ></div>
                </div>
                <p className="text-sm text-muted-foreground mt-2 text-center">
                  {Math.round((minorMastered / 12) * 100)}% Complete
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Intervals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-center mb-4" data-testid="intervals-mastered">
                  {intervalsMastered}/13
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-success h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(intervalsMastered / 13) * 100}%` }}
                  ></div>
                </div>
                <p className="text-sm text-muted-foreground mt-2 text-center">
                  {Math.round((intervalsMastered / 13) * 100)}% Complete
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Recent Practice Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentSessions.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No practice sessions yet. Start practicing to see your activity here!
                  </p>
                ) : (
                  recentSessions.map((session, index) => (
                    <div key={session.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-3 ${session.isCorrect ? 'bg-success' : 'bg-destructive'}`} />
                        <span>{session.itemName}</span>
                        <span className="text-sm text-muted-foreground ml-2">
                          ({session.category.replace('_', ' ')})
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {session.isCorrect ? 'Correct' : 'Incorrect'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
