import {useEffect, useState} from "react";
import {MessageCircle, Send, Loader2} from "lucide-react";
import {motion, AnimatePresence} from "framer-motion";
import {db} from "@/db";
import {exercise} from "@/db/schema";
import {SYSTEM_PROMPT} from "@/app/dashboard/_components/prompts/SystemPrompt";

export default function FloatingAssistant() {
    const [open, setOpen] = useState(false);
    const [input, setInput] = useState("");
    const systemPrompt = SYSTEM_PROMPT;
    const [messages, setMessages] = useState([
        {role: "assistant", content: "Hello 👋 I'm your AI assistant. How can I help?"},
    ]);
    const [loading, setLoading] = useState(false);
    const [dbData, setDbData] = useState<string>("");

    // Fetch data from the database
    useEffect(() => {
        const fetchData = async () => {
            try {
                const rows = await db.select().from(exercise).limit(5);
                const formattedData = rows.map((row) => `Exercise: ${row.name}, muscleGroups: ${row.muscleGroups}`).join("\n"); //key-worts einbinden, welche spalten sind relevant?
                setDbData(formattedData);
                console.log("Data was loaded from columns:", rows.map(row => ({ name: row.name, muscleGroups: row.muscleGroups })));            } catch (err) {
                //console.error("Error fetching data from the database:", err);
            }
        };
        fetchData();
    }, []);

    const handleSend = async (e: { preventDefault: () => void }) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = {role: "user", content: input};
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setLoading(true);

        try {
            const systemPrompt = `
                 ${SYSTEM_PROMPT}
                
                   Available exercises:                
                   ${dbData}
            `;

            const response = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${process.env.VITE_OPENAI_API_KEY}`,
                },
                body: JSON.stringify({
                    model: "gpt-4o-mini",
                    messages: [
                        {role: "system", content: systemPrompt},
                        ...messages,
                        userMessage,
                    ],
                }),
            });

            const data = await response.json();
            console.log("Connection to ein KI Model successful");
            const aiReply = data.choices?.[0]?.message?.content || "I'm sorry, there was a problem.";
            setMessages((prev) => [...prev, {role: "assistant", content: aiReply}]);
        } catch (err) {
            console.error(err);
            setMessages((prev) => [
                ...prev,
                {role: "assistant", content: "⚠ Error retrieving the response."},
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
                        initial={{opacity: 0, y: 20, scale: 0.95}}
                        animate={{opacity: 1, y: 0, scale: 1}}
                        exit={{opacity: 0, y: 20, scale: 0.95}}
                        transition={{duration: 0.25}}
                        className="mb-3 w-80 bg-white rounded-2xl shadow-2xl border border-blue-200 overflow-hidden flex flex-col"
                    >
                        <div className="p-3 bg-blue-600 text-white font-semibold text-sm flex justify-between">
                            <span>AI assistant</span>
                            <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white">×</button>
                        </div>

                        <div className="flex-1 p-3 overflow-y-auto space-y-2 text-sm text-gray-700">
                            {messages.map((msg, i) => (
                                <div
                                    key={i}
                                    className={`p-2 rounded-xl max-w-[80%] ${
                                        msg.role === "user"
                                            ? "ml-auto bg-blue-100 text-blue-800"
                                            : "bg-gray-100 text-gray-800"
                                    }`}
                                >
                                    {msg.content}
                                </div>
                            ))}
                            {loading && (
                                <div className="flex items-center space-x-2 text-gray-400 text-xs">
                                    <Loader2 className="animate-spin w-4 h-4"/> <span>AI thinks...</span>
                                </div>
                            )}
                        </div>

                        <form onSubmit={handleSend} className="flex border-t border-gray-200">
                            <input
                                type="text"
                                placeholder="Enter message..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                className="flex-1 p-2 text-sm focus:outline-none"
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

            <button
                onClick={() => setOpen(!open)}
                className="w-14 h-14 flex items-center justify-center rounded-full bg-blue-500 text-white shadow-lg hover:bg-blue-600 transition-all"
            >
                <MessageCircle size={26}/>
            </button>
        </div>
    );
}
