import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, Circle, ArrowRight } from 'lucide-react';

interface LearningPathCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  progress: {
    completed: number;
    total: number;
    percentage: number;
  };
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  href: string;
  items: Array<{
    name: string;
    status: 'not_started' | 'in_progress' | 'mastered';
  }>;
}

export function LearningPathCard({
  title,
  description,
  icon,
  progress,
  difficulty,
  href,
  items
}: LearningPathCardProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'mastered':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-warning" />;
      default:
        return <Circle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'Beginner':
        return 'bg-green-100 text-green-800';
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'Advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            {icon}
            <span className="ml-2">{title}</span>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(difficulty)}`}>
            {difficulty}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{description}</p>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{progress.completed}/{progress.total}</span>
          </div>
          <Progress value={progress.percentage} className="h-2" />
        </div>

        <div className="space-y-1 max-h-32 overflow-y-auto">
          {items.slice(0, 4).map((item, index) => (
            <div key={index} className="flex items-center text-xs">
              {getStatusIcon(item.status)}
              <span className="ml-2 text-muted-foreground">{item.name}</span>
            </div>
          ))}
          {items.length > 4 && (
            <div className="text-xs text-muted-foreground ml-6">
              ...and {items.length - 4} more
            </div>
          )}
        </div>

        <Link href={href}>
          <Button className="w-full" size="sm">
            <span>Start Learning</span>
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}