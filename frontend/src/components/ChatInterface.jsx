import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ChatMessage } from './ChatMessage';
import { ChatHeader } from './ChatHeader';
import axios from 'axios';

export const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const backendUrl = " https://finance-api-784408624700.asia-south1.run.app/chat"; // Replace with your backend URL

  // Load chat history from localStorage when the component mounts
  useEffect(() => {
    const savedMessages = localStorage.getItem('chatHistory');
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
  }, []);

  // Save messages to localStorage whenever the messages state changes
  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(messages));
  }, [messages]);

  // Scroll to the bottom of the chat when new messages are added
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

    // Add the user message to the chat history
    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);

    try {
      // Send the user's message and the entire chat history to the backend
      const response = await axios.post(backendUrl, {
        message: userMessage,
        history: updatedMessages, // Include the chat history
      });
      console.log(response);

      // Create the AI response
      const newAIMessage = {
        id: (Date.now() + 1).toString(),
        content: response.data.response,
        role: 'assistant',
        timestamp: new Date(),
      };

      // Add the AI response to the chat history
      setMessages((prev) => [...prev, newAIMessage]);
    } catch (error) {
      console.error("Error communicating with the backend:", error);

      // Show an error message if the backend fails
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, I encountered an error. Please try again.",
        role: 'assistant',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
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

  // Clear chat history
  const clearChatHistory = () => {
    localStorage.removeItem('chatHistory');
    setMessages([]);
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
              <div className="self-start bg-black/80 text-white rounded-2xl p-4 max-w-[80%]">
                <div className="flex items-center gap-2">
                  <div className="loading-dots">
                    <span className="dot"></span>
                    <span className="dot"></span>
                    <span className="dot"></span>
                  </div>
                  <span>Thinking...</span>
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
        <Button
          variant="outline"
          className="w-full mt-2"
          onClick={clearChatHistory}
        >
          Clear Chat History
        </Button>
      </div>
    </div>
  );
};