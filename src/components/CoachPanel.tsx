import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Maximize2, Minimize2, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function CoachPanel() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("studybuddy-chat", {
        body: {
          message: userMessage,
          mode: "chat",
          conversationHistory: messages,
        },
      });

      if (error) throw error;

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.message || "I'm here to help!" },
      ]);

      // Track coach usage
      if (user) {
        localStorage.setItem(`coach_used_${user.id}`, "true");
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast.error("Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            🤖 AI Coach
          </CardTitle>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/coach")}
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {expanded && (
        <CardContent className="flex flex-col gap-3 flex-1">
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-muted-foreground text-sm py-8">
                  Ask me anything about your studies!
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 text-sm ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))
              )}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg p-3 text-sm">
                    <div className="flex gap-1">
                      <span className="animate-bounce">●</span>
                      <span className="animate-bounce delay-100">●</span>
                      <span className="animate-bounce delay-200">●</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Ask a question..."
              disabled={loading}
            />
            <Button onClick={sendMessage} disabled={loading} size="icon">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
