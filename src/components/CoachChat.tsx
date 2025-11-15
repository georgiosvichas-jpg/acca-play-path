import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Send, Loader2, Crown } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useSubscription } from "@/hooks/useSubscription";

interface Message {
  role: "user" | "assistant";
  content: string;
  question?: any;
}

interface QuestionCardProps {
  question: any;
  onAnswer: (correct: boolean) => void;
}

const QuestionCard = ({ question, onAnswer }: QuestionCardProps) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  const handleSubmit = () => {
    if (question.type === "mcq" && selectedOption !== null) {
      const correct = selectedOption === question.correct_option_index;
      setRevealed(true);
      setTimeout(() => onAnswer(correct), 2000);
    } else if (question.type === "flashcard") {
      setRevealed(true);
      setTimeout(() => onAnswer(true), 3000);
    }
  };

  if (question.type === "flashcard") {
    return (
      <Card className="mt-4">
        <CardContent className="pt-6">
          <p className="text-lg font-medium mb-4">{question.question}</p>
          {revealed ? (
            <div className="mt-4 p-4 bg-primary/10 rounded-lg">
              <p className="font-semibold mb-2">Answer:</p>
              <p>{question.answer}</p>
              {question.explanation && (
                <p className="text-sm text-muted-foreground mt-2">{question.explanation}</p>
              )}
            </div>
          ) : (
            <Button onClick={handleSubmit}>Reveal Answer</Button>
          )}
        </CardContent>
      </Card>
    );
  }

  const options = typeof question.options === 'string' 
    ? JSON.parse(question.options) 
    : (question.options || []);

  return (
    <Card className="mt-4">
      <CardContent className="pt-6">
        <p className="text-lg font-medium mb-4">{question.question}</p>
        <div className="space-y-2">
          {options.map((option: string, idx: number) => (
            <button
              key={idx}
              onClick={() => !revealed && setSelectedOption(idx)}
              disabled={revealed}
              className={`w-full p-4 text-left rounded-lg border-2 transition-colors ${
                selectedOption === idx
                  ? revealed
                    ? idx === question.correct_option_index
                      ? "border-green-500 bg-green-50"
                      : "border-red-500 bg-red-50"
                    : "border-primary bg-primary/5"
                  : revealed && idx === question.correct_option_index
                  ? "border-green-500 bg-green-50"
                  : "border-border hover:border-primary/50"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
        {!revealed && selectedOption !== null && (
          <Button onClick={handleSubmit} className="mt-4">
            Submit Answer
          </Button>
        )}
        {revealed && question.explanation && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <p className="text-sm">{question.explanation}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default function CoachChat() {
  const { user } = useAuth();
  const { planType, unlockedPapers } = useSubscription();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm StudyBuddy, your AI study coach. Ready to start your session today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isPremium = planType === "pro" || unlockedPapers.length > 0;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("studybuddy-chat", {
        body: {
          userId: user?.id,
          message: userMessage,
          conversationHistory: messages.slice(-10), // Last 10 messages for context
        },
      });

      if (error) throw error;

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.message, question: data.question },
      ]);

      if (data.question) {
        setCurrentQuestion(data.question);
      }

      if (data.limitReached) {
        toast({
          title: "Daily Limit Reached",
          description: "You've reached your daily question limit. Upgrade to Premium for unlimited access!",
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswer = (correct: boolean) => {
    setCurrentQuestion(null);
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: correct ? "I got it right!" : "I got it wrong, can you explain?",
      },
    ]);
    // Auto-continue conversation
    sendMessage();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)]">
      <div className="flex items-center justify-between mb-4 pb-4 border-b">
        <div>
          <h2 className="text-2xl font-bold">Study Coach</h2>
          <p className="text-sm text-muted-foreground">Your AI-powered study companion</p>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              isPremium
                ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white"
                : "bg-secondary text-secondary-foreground"
            }`}
          >
            {isPremium ? (
              <>
                <Crown className="w-4 h-4 inline mr-1" />
                Premium
              </>
            ) : (
              "Free"
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] p-4 rounded-lg ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted p-4 rounded-lg">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {currentQuestion && (
        <QuestionCard question={currentQuestion} onAnswer={handleAnswer} />
      )}

      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Ask me anything or say 'start daily session'..."
          disabled={isLoading}
        />
        <Button onClick={sendMessage} disabled={isLoading || !input.trim()}>
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}