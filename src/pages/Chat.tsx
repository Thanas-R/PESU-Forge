import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import pixelBackground from '@/assets/pixel-background.png';

export default function Chat() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Array<{ text: string; isUser: boolean }>>([
    { text: 'hi', isUser: false },
  ]);
  const { toast } = useToast();

  const handleSend = () => {
    if (!message.trim()) return;

    setMessages([...messages, { text: message, isUser: true }]);
    setMessage('');

    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          text: 'This feature will be implemented soon! The askPESU AI assistant will help you with your queries.',
          isUser: false,
        },
      ]);
    }, 500);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${pixelBackground})`,
          filter: 'brightness(0.5)',
        }}
      />

      <div className="relative z-10 container mx-auto px-4 py-8 h-screen flex flex-col">
        <h1 className="pixel-font text-4xl mb-8 text-center text-white drop-shadow-lg">
          Chat with AI Assistant
        </h1>

        <Card className="flex-1 flex flex-col bg-card/90 backdrop-blur-md pixel-border overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] p-4 rounded-lg pixel-border ${
                    msg.isUser
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 border-t border-border">
            <div className="flex gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Message..."
                className="flex-1 pixel-border"
              />
              <Button onClick={handleSend} className="pixel-button">
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
