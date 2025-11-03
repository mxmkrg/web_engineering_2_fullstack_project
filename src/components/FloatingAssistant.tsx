import { useState } from "react";
import { MessageCircle, Send, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MOTIVATION_PROMPT, PROGRESS_PROMPT, SUGGESTIONS_PROMPT } from "@/app/dashboard/_components/prompts/Prompts";

type UseCase = "motivation" | "progress" | "suggestions" | null;

// Formatierungsfunktion für KI-Antworten
const formatAIResponse = (content: string) => {
    const lines = content.split('\n');

    return lines.map((line, index) => {
        // Fette Texte mit ** markieren - SCHWARZ
        if (line.includes('**')) {
            const parts = line.split('**');
            return (
                <div key={index} className="mb-2">
                    {parts.map((part, partIndex) =>
                        partIndex % 2 === 1 ?
                        <strong key={partIndex} className="font-bold text-black">{part}</strong> :
                        <span key={partIndex}>{part}</span>
                    )}
                </div>
            );
        }

        // Stichpunkte mit - oder • erkennen
        if (line.trim().startsWith('-') || line.trim().startsWith('•')) {
            return (
                <div key={index} className="flex items-start gap-2 mb-2 ml-2">
                    <span className="text-gray-400 mt-1">•</span>
                    <span className="flex-1">{line.replace(/^[-•]\s*/, '').trim()}</span>
                </div>
            );
        }

        // Nummerierte Listen erkennen
        if (/^\d+\./.test(line.trim())) {
            const number = line.match(/^(\d+)\./)?.[1];
            const text = line.replace(/^\d+\.\s*/, '').trim();
            return (
                <div key={index} className="flex items-start gap-2 mb-2 ml-2">
                    <span className="text-gray-400 font-semibold min-w-max">{number}.</span>
                    <span className="flex-1">{text}</span>
                </div>
            );
        }

        // Leere Zeilen als Abstand
        if (line.trim() === '') {
            return <div key={index} className="mb-2"></div>;
        }

        // Normale Zeilen
        return (
            <div key={index} className="mb-1 leading-relaxed">
                {line}
            </div>
        );
    });
};

export default function FloatingAssistant() {
    const [open, setOpen] = useState(false);
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState([
        { role: "assistant", content: "Hello 👋 I'm your AI Fitness Coach. How can I help?" },
    ]);
    const [loading, setLoading] = useState(false);


    const useCases = [
        { id: "motivation", label: "Motivation", icon: "⚡", emoji: "💪" },
        { id: "progress", label: "Progress", icon: "📊", emoji: "🎯" },
        { id: "suggestions", label: "Suggestions", icon: "🏋️", emoji: "💡" },
    ];

    const handleUseCaseClick = async (useCase: UseCase) => {
        if (!useCase) return;

        setLoading(true);

        try {
            // Fetch formatted data from appropriate API
            let apiEndpoint = "";
            let prompt = "";

            switch (useCase) {
                case "motivation":
                    apiEndpoint = "/api/ai/motivation-data";
                    prompt = MOTIVATION_PROMPT;
                    break;
                case "progress":
                    apiEndpoint = "/api/ai/weekly-progress-data";
                    prompt = PROGRESS_PROMPT;
                    break;
                case "suggestions":
                    apiEndpoint = "/api/ai/exercise-suggestions-data";
                    prompt = SUGGESTIONS_PROMPT;
                    break;
            }

            const dataResponse = await fetch(apiEndpoint);
            const dbData = await dataResponse.json();

            // Add user message - nur der Typ, ohne Daten
            const userMessage = { role: "user", content: useCase };
            setMessages((prev) => [...prev, userMessage]);

            // Call internal AI APIwith formatted data
            const response = await fetch("/api/ai/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    messages: [
                        {
                            role: "system",
                            content: `You are an AI fitness coach assistant. Respond in English only.

Antwortformat:
- Use **bold text** for main points
- Use numbered lists (1. 2. 3.) for structured guidance
- Use bullet points (-) for lists
- Be concise and professional
- Minimal emojis

${prompt}

User Workout Data:
${JSON.stringify(dbData, null, 2)}`,
                        },
                        ...messages.slice(1),
                        userMessage,
                    ],
                }),
            });

            const aiResponse = await response.json();
            const aiReply = aiResponse.choices?.[0]?.message?.content || "⚠ Error retrieving response.";
            setMessages((prev) => [...prev, { role: "assistant", content: aiReply }]);
        } catch (err) {
            console.error("Error:", err);
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: "⚠ Error processing request." },
            ]);
        } finally {
            setLoading(false);
            setInput("");
        }
    };

    const handleSend = async (e: { preventDefault: () => void }) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = { role: "user", content: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setLoading(true);

        try {
            // Call internal AI API
            const response = await fetch("/api/ai/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    messages: [
                        {
                            role: "system",
                            content: `You are an AI fitness coach assistant. Respond in English only.

Response Format:
- Use **bold text** for main points
- Use numbered lists (1. 2. 3.) for structured guidance
- Use bullet points (-) for lists
- Be concise and professional
- Minimal emojis`
                        },
                        ...messages,
                        userMessage,
                    ],
                }),
            });

            const data = await response.json();
            const aiReply = data.choices?.[0]?.message?.content || "Entschuldigung, es gab ein Problem.";
            setMessages((prev) => [...prev, { role: "assistant", content: aiReply }]);
        } catch (err) {
            console.error(err);
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: "⚠ Error retrieving the response." },
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-60 flex flex-col items-end">
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.25 }}
                        className="mb-3 w-96 bg-white rounded-2xl shadow-2xl border border-blue-200 overflow-hidden flex flex-col h-[600px]"
                    >
                        {/* Header */}
                        <div className="p-3 bg-blue-600 text-white font-semibold text-sm flex justify-between">
                            <span>AI Fitness Coach</span>
                            <button
                                onClick={() => setOpen(false)}
                                className="text-white/70 hover:text-white"
                            >
                                ×
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 p-3 overflow-y-auto space-y-2 text-sm text-gray-700">
                            {messages.map((msg, i) => (
                                <div
                                    key={i}
                                    className={`p-3 rounded-xl max-w-[85%] ${
                                        msg.role === "user"
                                            ? "ml-auto bg-blue-500 text-white"
                                            : "mr-auto bg-gray-50 text-gray-800 border border-gray-200"
                                    }`}
                                >
                                    {msg.role === "assistant" ? (
                                        <div className="space-y-1">
                                            {formatAIResponse(msg.content)}
                                        </div>
                                    ) : (
                                        <div>{msg.content}</div>
                                    )}
                                </div>
                            ))}
                            {loading && (
                                <div className="flex items-center space-x-2 text-gray-400 text-xs">
                                    <Loader2 className="animate-spin w-4 h-4" />
                                    <span>Thinking...</span>
                                </div>
                            )}
                        </div>

                        {/* Quick Action Buttons */}
                        <div
                            className="px-3 py-3 border-t-2 border-b-2 border-blue-300 bg-gradient-to-b from-blue-50 to-white">
                            <p className="text-xs text-gray-700 mb-2 font-bold">⚡ Quick Actions:</p>
                                <div className="grid grid-cols-3 gap-2">
                                    {useCases.map((useCase) => (
                                        <button
                                            key={useCase.id}
                                            onClick={() => handleUseCaseClick(useCase.id as UseCase)}
                                            disabled={loading}
                                            className="p-2 rounded-md bg-white border border-gray-300 hover:bg-blue-50 hover:border-blue-500 transition disabled:opacity-50 flex flex-col items-center gap-1 text-xs font-medium"
                                        >
                                            <span className="text-lg">{useCase.emoji}</span>
                                            <span>{useCase.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Input */}
                            <form onSubmit={handleSend} className="flex border-t border-gray-200">
                                <input
                                    type="text"
                                    placeholder="Ask me anything..."
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    disabled={loading}
                                    className="flex-1 p-2 text-sm focus:outline-none disabled:bg-gray-50"
                                />
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="p-2 text-blue-500 hover:text-blue-600 transition disabled:opacity-40"
                                >
                                    <Send size={18}/>
                                </button>
                            </form>
                    </motion.div>
                    )}
            </AnimatePresence>

            {/* Floating Button */}
            <button
                onClick={() => setOpen(!open)}
                className="w-14 h-14 flex items-center justify-center rounded-full bg-blue-500 text-white shadow-lg hover:bg-blue-600 transition-all"
            >
                <MessageCircle size={26} />
            </button>
        </div>
    );
}