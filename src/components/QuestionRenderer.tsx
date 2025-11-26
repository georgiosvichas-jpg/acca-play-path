import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Checkbox } from "./ui/checkbox";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { CheckCircle2, XCircle } from "lucide-react";
import { MatchingQuestionDragDrop } from "./MatchingQuestionDragDrop";

interface QuestionRendererProps {
  question: {
    id: string;
    type: string;
    question: string;
    options?: string[];
    correct_option_index?: number;
    answer?: string;
    metadata?: any;
  };
  selectedAnswer: any;
  onAnswerChange: (answer: any) => void;
  showFeedback?: boolean;
  disabled?: boolean;
}

export function QuestionRenderer({
  question,
  selectedAnswer,
  onAnswerChange,
  showFeedback = false,
  disabled = false,
}: QuestionRendererProps) {
  const [multiSelectAnswers, setMultiSelectAnswers] = useState<number[]>([]);
  const [matchingAnswers, setMatchingAnswers] = useState<Record<number, number>>({});

  const handleMultiSelectChange = (optionIdx: number, checked: boolean) => {
    const newAnswers = checked
      ? [...multiSelectAnswers, optionIdx]
      : multiSelectAnswers.filter((idx) => idx !== optionIdx);
    setMultiSelectAnswers(newAnswers);
    onAnswerChange(newAnswers);
  };

  const handleMatchingChange = (leftIdx: number, rightIdx: number) => {
    const newAnswers = { ...matchingAnswers, [leftIdx]: rightIdx };
    setMatchingAnswers(newAnswers);
    onAnswerChange(newAnswers);
  };

  // MCQ Single (standard radio buttons)
  if (question.type === "MCQ_SINGLE" || question.type === "mcq") {
    return (
      <RadioGroup
        value={selectedAnswer?.toString()}
        onValueChange={(val) => onAnswerChange(parseInt(val))}
        disabled={disabled}
      >
        {question.options?.map((option, idx) => (
          <div
            key={idx}
            className={`flex items-center space-x-2 p-4 rounded-lg border cursor-pointer transition-all ${
              showFeedback
                ? idx === question.correct_option_index
                  ? "border-green-500 bg-green-50 dark:bg-green-950"
                  : idx === selectedAnswer
                  ? "border-red-500 bg-red-50 dark:bg-red-950"
                  : "border-border"
                : "border-border hover:border-primary"
            }`}
            onClick={() => !showFeedback && !disabled && onAnswerChange(idx)}
          >
            <RadioGroupItem value={idx.toString()} id={`option-${idx}`} disabled={showFeedback || disabled} />
            <Label htmlFor={`option-${idx}`} className="flex-1 cursor-pointer">
              {option}
              {showFeedback && idx === question.correct_option_index && (
                <CheckCircle2 className="inline ml-2 h-5 w-5 text-green-600" />
              )}
              {showFeedback && idx === selectedAnswer && idx !== question.correct_option_index && (
                <XCircle className="inline ml-2 h-5 w-5 text-red-600" />
              )}
            </Label>
          </div>
        ))}
      </RadioGroup>
    );
  }

  // MCQ Multi (checkboxes for multiple selection)
  if (question.type === "MCQ_MULTI") {
    const correctAnswers = question.metadata?.correctAnswers || [];
    return (
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground mb-2">Select all that apply:</p>
        {question.options?.map((option, idx) => {
          const isCorrect = correctAnswers.includes(idx);
          const isSelected = multiSelectAnswers.includes(idx);
          return (
            <div
              key={idx}
              className={`flex items-center space-x-2 p-4 rounded-lg border ${
                showFeedback
                  ? isCorrect
                    ? "border-green-500 bg-green-50 dark:bg-green-950"
                    : isSelected
                    ? "border-red-500 bg-red-50 dark:bg-red-950"
                    : "border-border"
                  : "border-border hover:border-primary"
              }`}
            >
              <Checkbox
                id={`multi-${idx}`}
                checked={isSelected}
                onCheckedChange={(checked) => handleMultiSelectChange(idx, checked as boolean)}
                disabled={showFeedback || disabled}
              />
              <Label htmlFor={`multi-${idx}`} className="flex-1 cursor-pointer">
                {option}
                {showFeedback && isCorrect && (
                  <CheckCircle2 className="inline ml-2 h-5 w-5 text-green-600" />
                )}
              </Label>
            </div>
          );
        })}
      </div>
    );
  }

  // Fill in the Blank
  if (question.type === "FILL_IN_BLANK") {
    const blanks = question.metadata?.blanks || [];
    const questionParts = question.question.split("___");
    return (
      <div className="space-y-4">
        <div className="text-base">
          {questionParts.map((part, idx) => (
            <span key={idx}>
              {part}
              {idx < questionParts.length - 1 && (
                <Input
                  className="inline-block w-32 mx-2"
                  placeholder={`Blank ${idx + 1}`}
                  value={(selectedAnswer && selectedAnswer[idx]) || ""}
                  onChange={(e) => {
                    const newAnswers = { ...(selectedAnswer || {}), [idx]: e.target.value };
                    onAnswerChange(newAnswers);
                  }}
                  disabled={showFeedback || disabled}
                />
              )}
            </span>
          ))}
        </div>
        {showFeedback && (
          <div className="text-sm">
            {blanks.map((blank: any, idx: number) => (
              <div key={idx} className="mt-2">
                Blank {idx + 1}: <Badge variant="default">{blank.correctAnswer}</Badge>
                {selectedAnswer && selectedAnswer[idx] !== blank.correctAnswer && (
                  <Badge variant="destructive" className="ml-2">Your answer: {selectedAnswer[idx]}</Badge>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Calculation
  if (question.type === "CALCULATION") {
    const metadata = question.metadata || {};
    return (
      <div className="space-y-4">
        <div className="bg-muted p-4 rounded-lg">
          <p className="font-mono">{metadata.formula || "Calculate the answer"}</p>
        </div>
        <div className="flex items-center gap-2">
          <Label>Answer:</Label>
          <Input
            type="number"
            step="any"
            placeholder="Enter your calculation"
            value={selectedAnswer || ""}
            onChange={(e) => onAnswerChange(parseFloat(e.target.value))}
            disabled={showFeedback || disabled}
            className="max-w-xs"
          />
          {metadata.unit && <span className="text-sm text-muted-foreground">{metadata.unit}</span>}
        </div>
        {showFeedback && (
          <div className="text-sm space-y-1">
            <div>
              Correct answer: <Badge variant="default">{question.answer} {metadata.unit}</Badge>
            </div>
            {metadata.tolerance && (
              <p className="text-muted-foreground">
                Tolerance: ±{metadata.tolerance}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }

  // Matching
  if (question.type === "MATCHING") {
    const metadata = question.metadata || { leftItems: [], rightItems: [], correctPairs: [] };
    return (
      <MatchingQuestionDragDrop
        leftItems={metadata.leftItems || []}
        rightItems={metadata.rightItems || []}
        correctPairs={metadata.correctPairs || []}
        selectedMatches={selectedAnswer || matchingAnswers}
        onMatchChange={(matches) => {
          setMatchingAnswers(matches);
          onAnswerChange(matches);
        }}
        showFeedback={showFeedback}
        disabled={disabled}
      />
    );
  }

  // Scenario Based (multi-part)
  if (question.type === "SCENARIO_BASED") {
    const metadata = question.metadata || { scenarioText: "", subQuestions: [] };
    return (
      <div className="space-y-6">
        <div className="bg-muted p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Scenario:</h4>
          <p className="text-sm">{metadata.scenarioText}</p>
        </div>
        {metadata.subQuestions?.map((subQ: any, idx: number) => (
          <div key={idx} className="border-l-4 border-primary pl-4">
            <p className="font-medium mb-2">Part {idx + 1}: {subQ.question}</p>
            <QuestionRenderer
              question={{ ...question, id: `${question.id}-${idx}`, type: subQ.type, options: subQ.options, correct_option_index: subQ.correctAnswer }}
              selectedAnswer={selectedAnswer?.[idx]}
              onAnswerChange={(answer) => {
                const newAnswers = { ...(selectedAnswer || {}), [idx]: answer };
                onAnswerChange(newAnswers);
              }}
              showFeedback={showFeedback}
              disabled={disabled}
            />
          </div>
        ))}
      </div>
    );
  }

  // Default fallback for unsupported types
  return (
    <div className="p-4 border border-dashed rounded-lg">
      <p className="text-sm text-muted-foreground">
        Question type "{question.type}" not yet implemented
      </p>
    </div>
  );
}
