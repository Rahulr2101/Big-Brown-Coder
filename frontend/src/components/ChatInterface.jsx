
import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ChatMessage } from './ChatMessage';
import { ChatHeader } from './ChatHeader';




export const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
 

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const generateResponse = async (userMessage) => {
   
    setIsLoading(true);
    
    // Create the user message
    const newUserMessage = {
      id: Date.now().toString(),
      content: userMessage,
      role: 'user',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Example responses
    const responses = [
      "I understand your query and would be happy to assist you with that.",
      "That's an interesting question. Let me think about that for a moment...",
      "Based on my knowledge, I can provide the following information about your request.",
      "I've analyzed your message and here's what I think might help you most.",
      "Let me provide some insights on that topic.",
    ];
    
    const detailedResponses = [
      "I've analyzed your question thoroughly. The concept you're asking about has several dimensions worth exploring. First, consider the historical context which provides important background. Second, there are multiple perspectives to consider from different fields. Finally, recent developments have changed how we understand this area significantly. Would you like me to elaborate on any particular aspect?",
      "This is a fascinating area to explore. There are several key points that might be helpful for you to know: (1) The underlying principles are based on well-established research, (2) There are practical applications in various contexts, (3) Experts generally agree on the fundamentals, though there are some areas of ongoing debate. I can provide more specific information if you have a particular angle you're interested in.",
      "Thank you for bringing up this topic. I can offer some valuable insights here: The primary considerations involve balancing multiple factors, each with their own importance. Best practices have evolved significantly over time, and what works best often depends on your specific situation and goals. I'm happy to discuss more targeted advice if you can share more details about your specific needs.",
    ];
    
    // Randomly select a response
    const randomResponse = Math.random() > 0.7 
      ? detailedResponses[Math.floor(Math.random() * detailedResponses.length)]
      : responses[Math.floor(Math.random() * responses.length)];
    
    // Create the AI response
    const newAIMessage= {
      id: (Date.now() + 1).toString(),
      content: randomResponse,
      role: 'assistant',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, newAIMessage]);
    setIsLoading(false);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!inputValue.trim()) return;
    
    await generateResponse(inputValue);
    setInputValue('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col h-screen max-h-screen">
      <ChatHeader />
      
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <h3 className="text-xl font-medium mb-2">Welcome to MintAI</h3>
              <p className="text-muted-foreground mb-4">
                Start a conversation with our AI. Ask questions, request information, or just chat.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <Button 
                  variant="outline"
                  className="text-left justify-start h-auto py-3"
                  onClick={() => setInputValue("What can you help me with?")}
                >
                  "What can you help me with?"
                </Button>
                <Button 
                  variant="outline"
                  className="text-left justify-start h-auto py-3"
                  onClick={() => setInputValue("Tell me an interesting fact")}
                >
                  "Tell me an interesting fact"
                </Button>
                <Button 
                  variant="outline"
                  className="text-left justify-start h-auto py-3"
                  onClick={() => setInputValue("How does AI technology work?")}
                >
                  "How does AI technology work?"
                </Button>
                <Button 
                  variant="outline"
                  className="text-left justify-start h-auto py-3"
                  onClick={() => setInputValue("Give me ideas for a project")}
                >
                  "Give me ideas for a project"
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isLoading && (
              <div className="self-start bg-black/80 text-white rounded-2xl p-4 max-w-[80%] animate-pulse-light">
                <div className="loading-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
      
      <div className="border-t border-gray-100 p-4">
        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          <div className="flex-1 relative">
            <Textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message here..."
              className="resize-none min-h-[60px] max-h-[200px] pr-12"
              disabled={isLoading}
            />
            <Button 
              type="submit"
              size="icon"
              className="absolute bottom-2 right-2"
              disabled={!inputValue.trim() || isLoading}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="size-4"
              >
                <path d="m22 2-7 20-4-9-9-4Z" />
                <path d="M22 2 11 13" />
              </svg>
              <span className="sr-only">Send</span>
            </Button>
          </div>
        </form>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          MintAI may produce inaccurate information about people, places, or facts.
        </p>
      </div>
    </div>
  );
};
