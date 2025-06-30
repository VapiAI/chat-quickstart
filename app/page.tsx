"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  AlertTriangle,
  CheckCircle,
  MessageCircle,
  Send,
  User,
  Bot,
  Loader2,
} from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [assistantId, setAssistantId] = useState("");

  const sendMessage = async () => {
    if (!input.trim() || isLoading || !apiKey.trim() || !assistantId.trim())
      return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Add empty assistant message that we'll update as we stream
    const assistantMessage: Message = {
      role: "assistant",
      content: "",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, assistantMessage]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input,
          apiKey: apiKey,
          assistantId: assistantId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No reader available");
      }

      const decoder = new TextDecoder();
      let accumulatedContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter((line) => line.trim());

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.delta) {
                accumulatedContent += data.delta;
                // Update the last message (assistant message) with accumulated content
                setMessages((prev) => {
                  const newMessages = [...prev];
                  if (newMessages.length > 0) {
                    newMessages[newMessages.length - 1] = {
                      ...newMessages[newMessages.length - 1],
                      content: accumulatedContent,
                    };
                  }
                  return newMessages;
                });
              }
            } catch (parseError) {
              console.error("Failed to parse streaming data:", parseError);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error:", error);
      // Update the last message with error
      setMessages((prev) => {
        const newMessages = [...prev];
        if (newMessages.length > 0) {
          newMessages[newMessages.length - 1] = {
            ...newMessages[newMessages.length - 1],
            content: "Sorry, I encountered an error. Please try again.",
          };
        }
        return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const isConfigured = apiKey.trim() && assistantId.trim();

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Header with configuration */}
      <div className="border-b bg-card shadow-sm px-6 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                <MessageCircle className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Vapi Chat
                </h1>
                <p className="text-sm text-muted-foreground">
                  AI Assistant Chat Interface
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="api-key" className="text-sm font-semibold">
                VAPI API Key
              </Label>
              <Input
                id="api-key"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your VAPI API Key"
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="assistant-id" className="text-sm font-semibold">
                Assistant ID
              </Label>
              <Input
                id="assistant-id"
                type="text"
                value={assistantId}
                onChange={(e) => setAssistantId(e.target.value)}
                placeholder="Enter your Assistant ID"
                className="h-11"
              />
            </div>
          </div>

          {!isConfigured && (
            <div className="flex items-center space-x-3 p-4 rounded-lg bg-yellow-50 border border-yellow-200">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
              <span className="text-sm font-medium text-yellow-800">
                Please configure your API credentials to begin chatting
              </span>
            </div>
          )}

          {isConfigured && (
            <div className="flex items-center space-x-3 p-4 rounded-lg bg-green-50 border border-green-200">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <span className="text-sm font-medium text-green-800">
                Configuration complete! Ready to chat with your assistant
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-16">
              <div className="text-center max-w-md space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                  <MessageCircle className="w-8 h-8 text-primary" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold text-foreground">
                    Ready to Chat!
                  </h2>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {isConfigured
                      ? "Your assistant is ready. Start a conversation by typing a message below."
                      : "Configure your API credentials above to begin chatting with your AI assistant."}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`flex items-start space-x-3 max-w-3xl ${
                    message.role === "user"
                      ? "flex-row-reverse space-x-reverse"
                      : ""
                  }`}
                >
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarFallback
                      className={
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }
                    >
                      {message.role === "user" ? (
                        <User className="w-4 h-4" />
                      ) : (
                        <Bot className="w-4 h-4" />
                      )}
                    </AvatarFallback>
                  </Avatar>

                  <Card
                    className={`${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground border-primary/20"
                        : "bg-card"
                    }`}
                  >
                    <CardContent className="p-4">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ))
          )}

          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-3 max-w-3xl">
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarFallback>
                    <Bot className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">
                        Assistant is typing...
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t bg-card shadow-lg p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end space-x-3">
            <div className="flex-1">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={
                  isConfigured
                    ? "Type your message..."
                    : "Please configure API credentials first"
                }
                className="min-h-[48px] max-h-[120px] resize-none"
                disabled={isLoading || !isConfigured}
              />
            </div>
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading || !isConfigured}
              size="icon"
              className="h-12 w-12 flex-shrink-0"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
