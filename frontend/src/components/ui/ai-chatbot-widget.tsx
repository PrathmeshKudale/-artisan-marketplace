"use client";

import { useState, useEffect, useCallback } from "react";
import {
  MessageCircle,
  X,
  Send,
  Trash2,
  Mic,
  Volume2,
  VolumeX
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface QuickAction {
  label: string;
  message: string;
}

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

const quickActions: QuickAction[] = [
  { label: "Find pottery", message: "I'm looking for pottery items" },
  { label: "Discover textiles", message: "Show me textile products" },
  { label: "Contact artisan", message: "I'd like to contact an artisan" },
  { label: "Track my order", message: "Help me track my order" }
];

export default function AiChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content:
        "Hello! I'm Kalabandhu, your cultural craft companion. I can help you discover handcrafted items, connect with artisans, and explore India's rich heritage.",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSpeechEnabled] = useState(true);
  const [speechSynthesis, setSpeechSynthesis] = useState<SpeechSynthesis | null>(null);
  const [speechRecognition, setSpeechRecognition] = useState<SpeechRecognition | null>(null);
  const [requestController, setRequestController] = useState<AbortController | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if ("speechSynthesis" in window) {
      setSpeechSynthesis(window.speechSynthesis);
    }

    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SR) {
      const recognition = new SR();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-IN";
      setSpeechRecognition(recognition);
    }
  }, []);

  const getServerUrl = () => process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const sendToGemini = async (userMessage: string) => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 20000);
    setRequestController(controller);

    try {
      const serverUrl = getServerUrl();
      const res = await fetch(`${serverUrl}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
        signal: controller.signal,
      });

      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || `Server ${res.status}`);
        if (!data.reply) throw new Error("Invalid response from server");
        return data.reply as string;
      }

      const text = await res.text();
      if (!res.ok) throw new Error(text || `Server ${res.status}`);
      return text;
    } catch (err: any) {
      console.error("Chatbot error", err);
      if (err?.name === "AbortError") {
        return "The chatbot took too long to respond. Please try again.";
      }
      return `Response failed. ${err.message || "Something went wrong"}`;
    } finally {
      clearTimeout(timeoutId);
      setRequestController(null);
    }
  };

  const speakMessage = useCallback((text: string) => {
    if (!speechSynthesis || !isSpeechEnabled) return;
    try {
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-IN";
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      speechSynthesis.speak(utterance);
    } catch (error) {
      console.error("speak error", error);
    }
  }, [speechSynthesis, isSpeechEnabled]);

  const startListening = () => {
    if (!speechRecognition) {
      alert("Speech recognition not supported in this browser");
      return;
    }

    speechRecognition.onresult = (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript;
      if (transcript) {
        setInputValue(transcript);
        void handleSendMessage(transcript);
      }
      setIsListening(false);
    };

    speechRecognition.onerror = (error: any) => {
      console.error("recognition error", error);
      setIsListening(false);
    };

    speechRecognition.onend = () => setIsListening(false);
    setIsListening(true);
    speechRecognition.start();
  };

  const handleSendMessage = async (text?: string) => {
    const messageText = text ?? inputValue;
    if (!messageText.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      content: messageText,
      isUser: true,
      timestamp: new Date()
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setLoading(true);

    const reply = await sendToGemini(messageText);
    setLoading(false);

    const botMsg: Message = {
      id: `${Date.now() + 1}`,
      content: reply,
      isUser: false,
      timestamp: new Date()
    };
    setMessages((prev) => [...prev, botMsg]);

    if (isSpeechEnabled) speakMessage(reply);
  };

  const handleQuickAction = async (action: QuickAction) => {
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), content: action.message, isUser: true, timestamp: new Date() }
    ]);
    setLoading(true);
    const reply = await sendToGemini(action.message);
    setLoading(false);
    setMessages((prev) => [
      ...prev,
      { id: `${Date.now() + 1}`, content: reply, isUser: false, timestamp: new Date() }
    ]);
    if (isSpeechEnabled) speakMessage(reply);
  };

  const handleClearChat = async () => {
    const serverUrl = getServerUrl();
    try {
      await fetch(`${serverUrl}/clear-cache`, { method: "POST" });
    } catch {
      // ignore
    }
    setMessages([
      {
        id: "welcome",
        content: "Chat cleared. How can I assist you now?",
        isUser: false,
        timestamp: new Date()
      }
    ]);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end space-y-2">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.2 }}
            className="w-80 h-96 bg-white border rounded-xl shadow-xl flex flex-col overflow-hidden"
          >
            <div className="bg-orange-600 text-white p-4 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-sm">Kalabandhu</h3>
                <p className="text-xs opacity-80">Your artisan companion</p>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={handleClearChat} title="Clear chat" aria-label="Clear chat">
                  <Trash2 className="w-4 h-4" />
                </button>
                <button onClick={() => setIsOpen(false)} title="Close">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="px-4 py-2 border-b bg-gray-50">
              {messages.length === 1 && (
                <select
                  className="w-full text-xs p-2 border rounded"
                  defaultValue=""
                  onChange={(e) => {
                    const act = quickActions.find((q) => q.label === e.target.value);
                    if (act) void handleQuickAction(act);
                  }}
                >
                  <option value="" disabled>Choose a quick action...</option>
                  {quickActions.map((action) => (
                    <option key={action.label} value={action.label}>{action.label}</option>
                  ))}
                </select>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.isUser ? "justify-end" : "justify-start"}`}>
                  <div className={`group relative max-w-[80%] px-3 py-2 text-sm rounded-lg ${msg.isUser ? "bg-orange-600 text-white" : "bg-white border"}`}>
                    {msg.content}
                    <button
                      onClick={() => speakMessage(msg.content)}
                      className="absolute -right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full text-gray-500 hover:bg-gray-100"
                      title="Click to hear this message"
                    >
                      <Volume2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
              {loading && <div className="text-xs text-gray-400 text-center">Thinking...</div>}
            </div>

            <form onSubmit={(e) => { e.preventDefault(); void handleSendMessage(); }} className="p-3 border-t flex items-center gap-2 bg-white">
              <button
                type="button"
                onClick={startListening}
                disabled={isListening || loading}
                className="p-2 text-gray-500 hover:text-orange-600 transition-colors"
                title={isListening ? "Listening..." : "Click to speak"}
              >
                <Mic className={`w-4 h-4 ${isListening ? "text-orange-600 animate-pulse" : ""}`} />
              </button>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
              <button
                type="button"
                onClick={() => {
                  requestController?.abort();
                  if (isSpeaking && speechSynthesis) speechSynthesis.cancel();
                  setIsSpeaking(false);
                  setLoading(false);
                }}
                className="p-2 text-gray-500 hover:text-orange-600 transition-colors"
                title={isSpeaking ? "Stop speaking" : "Cancel request"}
              >
                {isSpeaking ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
              <button type="submit" disabled={!inputValue.trim() || loading} className="bg-orange-600 text-white p-2 rounded-lg hover:bg-orange-700 disabled:opacity-50">
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button onClick={() => setIsOpen(!isOpen)} className="w-14 h-14 bg-orange-600 text-white rounded-full shadow-lg flex items-center justify-center" whileTap={{ scale: 0.9 }}>
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </motion.button>
    </div>
  );
}
