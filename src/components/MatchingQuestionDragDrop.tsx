import { useState, DragEvent } from "react";
import { CheckCircle2, GripVertical, X } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

interface MatchingQuestionDragDropProps {
  leftItems: string[];
  rightItems: string[];
  correctPairs: [number, number][];
  selectedMatches: Record<number, number>;
  onMatchChange: (matches: Record<number, number>) => void;
  showFeedback?: boolean;
  disabled?: boolean;
}

export function MatchingQuestionDragDrop({
  leftItems,
  rightItems,
  correctPairs,
  selectedMatches,
  onMatchChange,
  showFeedback = false,
  disabled = false,
}: MatchingQuestionDragDropProps) {
  const [draggedLeftIdx, setDraggedLeftIdx] = useState<number | null>(null);
  const [dropTargetIdx, setDropTargetIdx] = useState<number | null>(null);

  const handleDragStart = (e: DragEvent<HTMLDivElement>, leftIdx: number) => {
    if (disabled || showFeedback) return;
    setDraggedLeftIdx(leftIdx);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", leftIdx.toString());
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>, rightIdx: number) => {
    if (disabled || showFeedback) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDropTargetIdx(rightIdx);
  };

  const handleDragLeave = () => {
    setDropTargetIdx(null);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>, rightIdx: number) => {
    if (disabled || showFeedback) return;
    e.preventDefault();
    const leftIdx = parseInt(e.dataTransfer.getData("text/plain"));
    
    // Create new matches object, removing any existing match for this left item
    const newMatches = { ...selectedMatches };
    newMatches[leftIdx] = rightIdx;
    
    onMatchChange(newMatches);
    setDraggedLeftIdx(null);
    setDropTargetIdx(null);
  };

  const handleDragEnd = () => {
    setDraggedLeftIdx(null);
    setDropTargetIdx(null);
  };

  const handleUnmatch = (leftIdx: number) => {
    if (disabled || showFeedback) return;
    const newMatches = { ...selectedMatches };
    delete newMatches[leftIdx];
    onMatchChange(newMatches);
  };

  const isCorrectMatch = (leftIdx: number, rightIdx: number) => {
    return correctPairs.some(([l, r]) => l === leftIdx && r === rightIdx);
  };

  const getMatchedRightIdx = (leftIdx: number): number | undefined => {
    return selectedMatches[leftIdx];
  };

  const isRightItemMatched = (rightIdx: number): boolean => {
    return Object.values(selectedMatches).includes(rightIdx);
  };

  const getLeftIdxForRightItem = (rightIdx: number): number | undefined => {
    const entry = Object.entries(selectedMatches).find(([_, r]) => r === rightIdx);
    return entry ? parseInt(entry[0]) : undefined;
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {!showFeedback && !disabled && "Drag items from the left to match with items on the right"}
        {showFeedback && "Matching results"}
      </p>
      
      <div className="grid md:grid-cols-2 gap-8">
        {/* Left Column - Draggable Items */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm text-muted-foreground mb-3">Match the items:</h3>
          {leftItems.map((item, leftIdx) => {
            const matchedRightIdx = getMatchedRightIdx(leftIdx);
            const isMatched = matchedRightIdx !== undefined;
            const isDragging = draggedLeftIdx === leftIdx;
            const isCorrect = showFeedback && matchedRightIdx !== undefined && isCorrectMatch(leftIdx, matchedRightIdx);
            const isIncorrect = showFeedback && matchedRightIdx !== undefined && !isCorrectMatch(leftIdx, matchedRightIdx);

            return (
              <div
                key={leftIdx}
                draggable={!disabled && !showFeedback}
                onDragStart={(e) => handleDragStart(e, leftIdx)}
                onDragEnd={handleDragEnd}
                className={cn(
                  "relative p-4 rounded-lg border-2 transition-all cursor-move group",
                  isDragging && "opacity-50 scale-95",
                  !isDragging && !disabled && !showFeedback && "hover:border-primary hover:shadow-md",
                  isMatched && !showFeedback && "border-primary bg-primary/5",
                  isCorrect && "border-green-500 bg-green-50 dark:bg-green-950",
                  isIncorrect && "border-red-500 bg-red-50 dark:bg-red-950",
                  !isMatched && !showFeedback && "border-border bg-card",
                  (disabled || showFeedback) && "cursor-default"
                )}
              >
                <div className="flex items-start gap-3">
                  {!showFeedback && !disabled && (
                    <GripVertical className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5 opacity-50 group-hover:opacity-100 transition-opacity" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm mb-1">
                      {leftIdx + 1}.
                    </div>
                    <div className="text-sm break-words">{item}</div>
                  </div>
                </div>
                
                {isMatched && (
                  <div className="mt-3 pt-3 border-t border-border/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Matched to:</span>
                        <span className="font-semibold">
                          {String.fromCharCode(65 + matchedRightIdx!)}
                        </span>
                      </div>
                      {!showFeedback && !disabled && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleUnmatch(leftIdx)}
                          className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                      {showFeedback && isCorrect && (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right Column - Drop Zones */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm text-muted-foreground mb-3">Options:</h3>
          {rightItems.map((item, rightIdx) => {
            const isDropTarget = dropTargetIdx === rightIdx;
            const matchedLeftIdx = getLeftIdxForRightItem(rightIdx);
            const isMatched = matchedLeftIdx !== undefined;
            const isCorrect = showFeedback && isMatched && isCorrectMatch(matchedLeftIdx, rightIdx);

            return (
              <div
                key={rightIdx}
                onDragOver={(e) => handleDragOver(e, rightIdx)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, rightIdx)}
                className={cn(
                  "p-4 rounded-lg border-2 transition-all min-h-[80px]",
                  isDropTarget && "border-primary bg-primary/10 scale-105 shadow-lg",
                  isMatched && !showFeedback && "border-primary bg-primary/5",
                  isMatched && showFeedback && isCorrect && "border-green-500 bg-green-50 dark:bg-green-950",
                  !isDropTarget && !isMatched && "border-dashed border-border/50 bg-muted/20",
                  !disabled && !showFeedback && !isMatched && "hover:border-primary/50 hover:bg-primary/5"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="font-semibold text-sm flex-shrink-0">
                    {String.fromCharCode(65 + rightIdx)}.
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm break-words">{item}</div>
                    {isMatched && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        Matched with: <span className="font-semibold">{matchedLeftIdx + 1}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showFeedback && (
        <div className="mt-6 p-4 rounded-lg bg-muted/50 border border-border">
          <p className="font-semibold mb-3 text-sm">Correct Matches:</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {correctPairs.map(([left, right], idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="font-medium">{left + 1}</span>
                <span className="text-muted-foreground">→</span>
                <span className="font-medium">{String.fromCharCode(65 + right)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
