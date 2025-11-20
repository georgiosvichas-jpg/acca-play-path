import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Send, Loader2, Crown, MessageCircle, X, Minimize2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useSubscription } from "@/hooks/useSubscription";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";

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
      <div className="mt-4 p-4 border rounded-lg">
        <p className="text-sm font-medium mb-3">{question.question}</p>
        {revealed ? (
          <div className="mt-3 p-3 bg-primary/10 rounded">
            <p className="font-semibold text-xs mb-1">Answer:</p>
            <p className="text-sm">{question.answer}</p>
          </div>
        ) : (
          <Button onClick={handleSubmit} size="sm">Reveal Answer</Button>
        )}
      </div>
    );
  }

  const options = typeof question.options === 'string' 
    ? JSON.parse(question.options) 
    : (question.options || []);

  return (
    <div className="mt-4 p-4 border rounded-lg">
      <p className="text-sm font-medium mb-3">{question.question}</p>
      <RadioGroup value={selectedOption?.toString()} onValueChange={(val) => setSelectedOption(parseInt(val))}>
        {options.map((option: string, idx: number) => (
          <div
            key={idx}
            className={`flex items-center space-x-2 p-2 rounded text-xs ${
              revealed
                ? idx === question.correct_option_index
                  ? "bg-green-100 dark:bg-green-950"
                  : idx === selectedOption
                  ? "bg-red-100 dark:bg-red-950"
                  : ""
                : ""
            }`}
          >
            <RadioGroupItem value={idx.toString()} id={`opt-${idx}`} disabled={revealed} />
            <Label htmlFor={`opt-${idx}`} className="flex-1 cursor-pointer text-xs">
              {option}
            </Label>
          </div>
        ))}
      </RadioGroup>
      {!revealed && selectedOption !== null && (
        <Button onClick={handleSubmit} size="sm" className="mt-3">
          Submit
        </Button>
      )}
    </div>
  );
};

export default function CoachWidget() {
  const { user } = useAuth();
  const { planType } = useSubscription();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm your AI study coach. Ready to help with your studies! 📚",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isPremium = planType === "pro" || planType === "elite";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    if (user) {
      localStorage.setItem(`coach_used_${user.id}`, "true");
    }

    try {
      const { data, error } = await supabase.functions.invoke("studybuddy-chat", {
        body: {
          userId: user?.id,
          message: userMessage,
          conversationHistory: messages.slice(-10),
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
          description: "You've reached your daily question limit. Upgrade for unlimited access!",
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
    sendMessage();
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    );
  }

  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsMinimized(false)}
          variant="outline"
          className="shadow-lg"
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          AI Coach
        </Button>
      </div>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-96 h-[600px] shadow-2xl z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          <div>
            <h3 className="font-semibold text-sm">AI Study Coach</h3>
            <div
              className={`text-xs px-2 py-0.5 rounded-full inline-flex items-center ${
                isPremium
                  ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white"
                  : "bg-secondary text-secondary-foreground"
              }`}
            >
              {isPremium ? <><Crown className="w-3 h-3 mr-1" />Premium</> : "Free"}
            </div>
          </div>
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsMinimized(true)}
          >
            <Minimize2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] p-3 rounded-lg text-sm ${
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
            <div className="bg-muted p-3 rounded-lg">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
          </div>
        )}
        {currentQuestion && (
          <QuestionCard question={currentQuestion} onAnswer={handleAnswer} />
        )}
        <div ref={messagesEndRef} />
      </CardContent>

      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Ask me anything..."
            disabled={isLoading}
            className="text-sm"
          />
          <Button onClick={sendMessage} disabled={isLoading || !input.trim()} size="icon">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
