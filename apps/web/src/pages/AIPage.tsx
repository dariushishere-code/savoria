import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Sparkles, Send, User } from 'lucide-react';
import { aiChat } from '../lib/api';
import { useAuth } from '../lib/auth';
import { useScrollReveal } from '../lib/scroll-animations';

type Message =
  | { role: 'user'; content: string }
  | { role: 'assistant'; content: string; thinking?: boolean };

const QUICK_PROMPTS = [
  'I have chicken, rice, and some spinach. What can I make in 30 minutes?',
  'Suggest a cozy vegetarian dinner for a rainy day.',
  'How do I keep a steak juicy without a thermometer?',
];

export function AIPage() {
  const revealRef = useScrollReveal<HTMLDivElement>();
  const { isAuthenticated, accessToken } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, busy]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    setInput('');
    setMessages((current) => [
      ...current,
      { role: 'user', content: trimmed },
      { role: 'assistant', content: '', thinking: true },
    ]);
    setBusy(true);
    try {
      const result = await aiChat(trimmed, accessToken, conversationId);
      setConversationId((current) => result.conversationId ?? current);
      setMessages((current) => [
        ...current.slice(0, -1),
        { role: 'assistant', content: result.reply },
      ]);
    } catch {
      setMessages((current) => [
        ...current.slice(0, -1),
        {
          role: 'assistant',
          content:
            'I hit a snag on my end — please give me another try in a moment. If this keeps happening, it might be temporary kitchen downtime.',
        },
      ]);
    } finally {
      setBusy(false);
    }
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void send(input);
  };

  return (
    <div ref={revealRef} className="ai-page">
      <section className="page-hero ai-hero">
        <div className="hero-grain" aria-hidden="true" />
        <div className="ai-hero-orb" aria-hidden="true" />
        <div className="container-app page-hero-inner">
          <span className="section-kicker" data-hero-animate>
            <Sparkles className="h-3.5 w-3.5" /> &nbsp;The AI Chef
          </span>
          <h1 className="page-title" data-hero-animate data-hero-delay="0.08">
            Your questions, answered like a chef
          </h1>
          <p className="page-sub" data-hero-animate data-hero-delay="0.16">
            Ask for a recipe from what‘s in your fridge, get substitution ideas, or fine-tune a
            dish you already love.
          </p>
        </div>
      </section>
<section className="container-app ai-chat-wrap">
        <div className="ai-chat" data-reveal="up">
          <div className="chat-scroll">
            {messages.length === 0 && !busy ? (
              <div className="chat-empty">
                <div className="ai-avatar">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h2>What are we cooking today?</h2>
                <p>Try one of these to get started, or type your own question.</p>
                <div className="ai-prompt-list">
                  {QUICK_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      className="ai-prompt-chip"
                      onClick={() => void send(prompt)}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="chat-messages">
                {messages.map((message, i) =>
                  message.role === 'user' ? (
                    <div key={i} className="chat-message is-user">
                      <span className="chat-bubble">
                        <User className="h-4 w-4" /> {message.content}
                      </span>
                    </div>
                  ) : (
                    <div key={i} className="chat-message is-ai">
                      <div className="ai-avatar">
                        <Sparkles className="h-4 w-4" />
                      </div>
                      <div className="chat-bubble">
                        {message.thinking ? (
                          <span className="typing-dots" aria-label="Thinking…">
                            <span />
                            <span />
                            <span />
                          </span>
                        ) : (
                          <p className="ai-reply">{message.content}</p>
                        )}
                      </div>
                    </div>
                  ),
                )}
                <div ref={endRef} />
              </div>
            )}
          </div>

          <div className="chat-composer">
            {!isAuthenticated && (
              <p className="chat-guest-note">
                You‘re browsing as a guest — you can still ask, but signing in lets the AI remember
                your taste over time.
              </p>
            )}
            <form className="chat-input-row" onSubmit={onSubmit}>
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    void send(input);
                  }
                }}
                placeholder="Ask the AI Chef anything…"
                rows={1}
                maxLength={800}
              />
              <button
                type="submit"
                className="chat-send"
                disabled={busy || !input.trim()}
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}