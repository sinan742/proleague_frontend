import React, { useState, useEffect, useRef } from 'react';
import api from '../api';
import './ChatAssistant.css';

const ChatAssistant = () => {
    const [messages, setMessages] = useState([
        { role: 'ai', text: "Welcome to ProLeague! I'm your AI Scout. Ask me about matches or teams! ⚽" }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const chatEndRef = useRef(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setLoading(true);

        try {
            // FIXED URL: Added 'api/' and the trailing '/' to avoid 405 errors
            const res = await api.post('ask-ai/', { query: input });
            
            setMessages(prev => [...prev, { 
                role: 'ai', 
                text: res.data.bot_response 
            }]);
        } catch (err) {
            console.error("Chat Error:", err);
            const errorMsg = err.response?.status === 429 
                ? "AI is taking a break. Try in 30 seconds! ⏳" 
                : "Trouble connecting to the stadium. Try again! 🏟️";
            
            setMessages(prev => [...prev, { role: 'ai', text: errorMsg }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="ai-chat-wrapper">
            <div className="chat-window">
                <div className="chat-header">
                    <div className="status-dot"></div>
                    <p>ProLeague <span>AI Scout</span></p>
                </div>
                
                <div className="chat-body">
                    {messages.map((msg, i) => (
                        <div key={i} className={`message-bubble ${msg.role}`}>
                            <div className="avatar">{msg.role === 'ai' ? '🤖' : '👤'}</div>
                            <div className="text-content">{msg.text}</div>
                        </div>
                    ))}
                    {loading && (
                        <div className="ai-typing">
                            <span></span><span></span><span></span>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>

                <div className="chat-footer">
                    <input 
                        value={input} 
                        onChange={(e) => setInput(e.target.value)} 
                        placeholder="Ask about matches..."
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    />
                    <button onClick={handleSend} disabled={loading}>
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatAssistant;