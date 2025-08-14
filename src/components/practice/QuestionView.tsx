import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, Volume2 } from "lucide-react";
import { Question } from "./QuestionEngine";
import { toast } from "@/hooks/use-toast";

interface QuestionViewProps {
  question: Question;
  onAnswer: (userAnswer: string, correct: boolean) => void;
  showResult?: boolean;
  isCorrect?: boolean;
}

export function QuestionView({ question, onAnswer, showResult, isCorrect }: QuestionViewProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [typedAnswer, setTypedAnswer] = useState<string>("");
  const [matchedPairs, setMatchedPairs] = useState<Set<string>>(new Set());
  const [selectedPair, setSelectedPair] = useState<string | null>(null);

  const handleSubmit = () => {
    let userAnswer = "";
    let correct = false;

    switch (question.type) {
      case 'mcq_en_sq':
      case 'mcq_sq_en':
        userAnswer = selectedAnswer;
        correct = selectedAnswer === question.correctAnswer;
        break;
      
      case 'type_word':
        userAnswer = typedAnswer.trim();
        correct = userAnswer.toLowerCase() === question.correctAnswer.toLowerCase();
        break;
      
      case 'match_pairs':
        const allPairs = question.pairs || [];
        userAnswer = `${matchedPairs.size}/${allPairs.length}`;
        correct = matchedPairs.size === allPairs.length;
        break;
      
      case 'audio':
        userAnswer = selectedAnswer;
        correct = selectedAnswer === question.correctAnswer;
        break;
    }

    onAnswer(userAnswer, correct);
  };

  const handleMatchPairClick = (item: string, side: 'left' | 'right') => {
    if (matchedPairs.has(item)) return;

    if (!selectedPair) {
      setSelectedPair(item);
      return;
    }

    const pairs = question.pairs || [];
    const selectedSide = pairs.some(p => p.left === selectedPair) ? 'left' : 'right';
    const currentSide = pairs.some(p => p.left === item) ? 'left' : 'right';

    if (selectedSide === currentSide) {
      setSelectedPair(item);
      return;
    }

    // Check if it's a correct match
    const isMatch = pairs.some(p => 
      (p.left === selectedPair && p.right === item) ||
      (p.right === selectedPair && p.left === item)
    );

    if (isMatch) {
      setMatchedPairs(prev => new Set([...prev, selectedPair, item]));
    }
    
    setSelectedPair(null);
  };

  const canSubmit = () => {
    switch (question.type) {
      case 'mcq_en_sq':
      case 'mcq_sq_en':
      case 'audio':
        return selectedAnswer !== "";
      case 'type_word':
        return typedAnswer.trim() !== "";
      case 'match_pairs':
        return (question.pairs?.length || 0) > 0 && matchedPairs.size === (question.pairs?.length || 0);
      default:
        return false;
    }
  };

  if (showResult) {
    return (
      <Card className="rounded-2xl">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            {isCorrect ? (
              <CheckCircle className="h-6 w-6 text-green-600" />
            ) : (
              <XCircle className="h-6 w-6 text-red-600" />
            )}
            <span className={`font-semibold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
              {isCorrect ? 'Correct!' : 'Incorrect'}
            </span>
          </div>
          
          <div className="text-lg font-medium">{question.prompt}</div>
          
          {!isCorrect && (
            <Alert>
              <AlertDescription>
                Correct answer: <strong>{question.correctAnswer}</strong>
              </AlertDescription>
            </Alert>
          )}
          
          {question.explanation && (
            <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
              {question.explanation}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl">
      <CardContent className="p-6 space-y-6">
        <div className="text-xl font-semibold text-center">{question.prompt}</div>
        
        {question.type === 'audio' && question.audioUrl && (
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="lg"
              className="rounded-full"
              onClick={() => toast({ title: "Audio coming soon", description: "Pronunciations will be added soon." })}
            >
              <Volume2 className="h-6 w-6" />
            </Button>
          </div>
        )}

        {(question.type === 'mcq_en_sq' || question.type === 'mcq_sq_en' || question.type === 'audio') && (
          <div className="grid gap-3">
            {question.options?.map((option, index) => (
              <Button
                key={index}
                variant={selectedAnswer === option ? "default" : "outline"}
                className="h-auto p-4 text-left justify-start"
                onClick={() => setSelectedAnswer(option)}
              >
                <span className="font-medium mr-3">{String.fromCharCode(65 + index)}.</span>
                {option}
              </Button>
            ))}
          </div>
        )}

        {question.type === 'type_word' && (
          <div className="space-y-3">
            <Input
              value={typedAnswer}
              onChange={(e) => setTypedAnswer(e.target.value)}
              placeholder="Type your answer..."
              className="text-lg"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && canSubmit()) {
                  handleSubmit();
                }
              }}
            />
          </div>
        )}

        {question.type === 'match_pairs' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="font-medium text-sm text-muted-foreground">English</div>
                {question.pairs?.map((pair, index) => (
                  <Button
                    key={`left-${index}`}
                    variant={
                      matchedPairs.has(pair.left) ? "secondary" :
                      selectedPair === pair.left ? "default" : "outline"
                    }
                    className="w-full justify-start"
                    onClick={() => handleMatchPairClick(pair.left, 'left')}
                    disabled={matchedPairs.has(pair.left)}
                  >
                    {pair.left}
                  </Button>
                ))}
              </div>
              
              <div className="space-y-2">
                <div className="font-medium text-sm text-muted-foreground">Albanian</div>
                {question.pairs?.map((pair, index) => (
                  <Button
                    key={`right-${index}`}
                    variant={
                      matchedPairs.has(pair.right) ? "secondary" :
                      selectedPair === pair.right ? "default" : "outline"
                    }
                    className="w-full justify-start"
                    onClick={() => handleMatchPairClick(pair.right, 'right')}
                    disabled={matchedPairs.has(pair.right)}
                  >
                    {pair.right}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit()}
            className="flex-1"
            size="lg"
          >
            Submit
          </Button>
          <Button
            variant="outline"
            onClick={() => onAnswer("", false)}
            size="lg"
          >
            Skip
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}