import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export const ChatHeader = () => {
  return (
    <header className="border-b border-gray-100 p-4 flex items-center justify-between">
      <Link to="/" className="flex items-center">
        <span className="text-xl font-bold">Mint<span className="text-primary/80">AI</span></span>
      </Link>
      
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="size-4 mr-2"
          >
            <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
            <path d="M12 18h.01" />
          </svg>
          New Chat
        </Button>
      </div>
    </header>
  );
};
