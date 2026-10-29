"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Sparkles,
  AlertTriangle,
  Bot,
  User,
  RotateCcw,
  ShieldAlert,
  Loader2,
  HelpCircle,
} from "lucide-react";
import { UserProfile, ChatMessage } from "@/lib/types";

interface AssistantTabProps {
  profile: UserProfile;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "welcome-msg",
    sender: "assistant",
    text: `Hello! I am **CareBuddy**, your friendly wellness assistant.\n\nI can help you explore general wellness topics, understand common symptoms, brainstorm questions for your doctor, and suggest lifestyle habits.\n\n*Note: I am an educational guide, not a physician. For emergencies, please call 911 or your local emergency line immediately.*`,
    timestamp: "Just now",
  },
];

const SUGGESTED_PROMPTS = [
  "What are common home measures for a mild tension headache?",
  "How can I safely improve my sleep hygiene without pills?",
  "What questions should I ask my doctor about persistent fatigue?",
  "What is the difference between ibuprofen and acetaminophen?",
];

export default function AssistantTab({ profile }: AssistantTabProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (messageToSend?: string) => {
    const text = (messageToSend || input).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: "usr-" + Date.now(),
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          profile,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to receive response");
      }

      const assistantMsg: ChatMessage = {
        id: "ast-" + Date.now(),
        sender: "assistant",
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isEmergencyWarning: data.isEmergencyWarning,
        isFallback: data.isFallback,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: "err-" + Date.now(),
        sender: "assistant",
        text: `⚠️ **Connection Notice:** Could not reach the server endpoint (${err?.message || "Check network"}). Please ensure your Next.js application is running.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isFallback: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-brand-600" />
            AI Health Assistant
          </h1>
          <p className="text-sm text-slate-500">
            Ask wellness questions in natural language. Powered by Gemini API with clinical safety guardrails.
          </p>
        </div>

        <button
          onClick={() => setMessages(INITIAL_MESSAGES)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Clear Chat
        </button>
      </div>

      {/* Main Chat Box Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col h-[580px] overflow-hidden">
        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.sender === "assistant" && (
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-white ${
                    msg.isEmergencyWarning
                      ? "bg-rose-600"
                      : "bg-gradient-to-tr from-brand-600 to-mint-500"
                  }`}
                >
                  {msg.isEmergencyWarning ? (
                    <ShieldAlert className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-sm leading-relaxed ${
                  msg.sender === "user"
                    ? "bg-brand-600 text-white rounded-tr-none shadow-sm"
                    : msg.isEmergencyWarning
                    ? "bg-rose-50 border-2 border-rose-300 text-rose-950 rounded-tl-none"
                    : "bg-slate-50 border border-slate-200/80 text-slate-800 rounded-tl-none"
                }`}
              >
                {/* Fallback Notice Badge */}
                {msg.isFallback && (
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-semibold text-[10px] uppercase mb-2">
                    <HelpCircle className="w-3 h-3" />
                    Local Knowledge Mode
                  </div>
                )}

                <div className="whitespace-pre-wrap">{msg.text}</div>
                <div
                  className={`text-[10px] mt-2 text-right ${
                    msg.sender === "user" ? "text-brand-200" : "text-slate-400"
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>

              {msg.sender === "user" && (
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 items-center text-slate-500 text-xs py-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-mint-500 text-white flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-brand-600" />
                <span>CareBuddy is consulting clinical safety rules...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts Carousel */}
        <div className="px-4 py-2 bg-slate-50/60 border-t border-slate-100 flex items-center gap-2 overflow-x-auto text-xs no-scrollbar">
          <span className="text-[11px] font-semibold text-slate-400 flex-shrink-0">Try asking:</span>
          {SUGGESTED_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              disabled={isLoading}
              className="px-2.5 py-1 rounded-full bg-white border border-slate-200 hover:border-brand-300 hover:bg-brand-50 text-slate-700 whitespace-nowrap transition text-xs flex-shrink-0"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-slate-200">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              placeholder="Ask about wellness, hydration, symptoms, or prep questions..."
              className="flex-1 p-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 disabled:bg-slate-50"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white p-2.5 rounded-xl transition shadow-sm"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 px-1">
            <span>🛡️ Medical safety guardrails active</span>
            <span>Keys protected via server proxy</span>
          </div>
        </div>
      </div>
    </div>
  );
}
