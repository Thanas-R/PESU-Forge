import { useState } from 'react';
import { Upload, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import pixelBackground from '@/assets/pixel-background.png';

export default function Home() {
  const [content, setContent] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const text = await file.text();
      setContent(text);
      toast({
        title: 'File uploaded successfully!',
        description: 'Your content is ready for processing.',
      });
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: 'Please try again with a different file.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = () => {
    if (!content.trim()) {
      toast({
        title: 'No content provided',
        description: 'Please paste or upload content first.',
        variant: 'destructive',
      });
      return;
    }

    localStorage.setItem('learning-content', content);
    toast({
      title: 'Content saved!',
      description: 'Choose a learning mode from the dock below.',
    });
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${pixelBackground})`,
          filter: 'brightness(0.7)',
        }}
      />
      
      <div className="relative z-10">
        {/* Hero Section */}
        <header className="flex justify-between items-center p-6">
          <div className="pixel-font text-3xl font-bold border-4 border-foreground bg-background px-4 py-2">
            PESU
          </div>
          <nav className="flex gap-6 pixel-font text-sm">
            <a href="#about" className="hover:text-primary transition-colors">About</a>
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <a href="#team" className="hover:text-primary transition-colors">Team</a>
          </nav>
        </header>

        <section className="container mx-auto px-4 pt-20 pb-32 text-center">
          <h1 className="pixel-font text-6xl md:text-8xl font-bold text-white mb-6 drop-shadow-lg">
            PESU-AI Student Helper
          </h1>
          <p className="text-2xl md:text-3xl text-white mb-12 drop-shadow-md">
            Transform your notes into engaging learning experiences
          </p>
          
          <Card className="max-w-3xl mx-auto p-8 bg-card/90 backdrop-blur-md pixel-border">
            <div className="space-y-6">
              <div className="flex gap-4 justify-center">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept=".txt,.doc,.docx,.pdf,.ppt,.pptx"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    disabled={isUploading}
                    className="pixel-button bg-primary text-primary-foreground"
                  >
                    <Upload className="mr-2 h-5 w-5" />
                    Upload File
                  </Button>
                </label>
              </div>

              <div className="relative">
                <Textarea
                  placeholder="Or paste your content here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[200px] resize-none pixel-border font-mono"
                />
              </div>

              <Button
                onClick={handleSubmit}
                disabled={!content.trim()}
                className="w-full pixel-button bg-secondary text-secondary-foreground text-lg"
              >
                <FileText className="mr-2 h-5 w-5" />
                Start Learning
              </Button>
            </div>
          </Card>
        </section>

        {/* About Section */}
        <section id="about" className="bg-card/95 backdrop-blur-md py-16 pixel-border my-8 mx-4 md:mx-8">
          <div className="container mx-auto px-4">
            <h2 className="pixel-font text-4xl font-bold mb-8 text-center">About Us</h2>
            <div className="max-w-4xl mx-auto">
              <Card className="p-8 pixel-border bg-background/50">
                <h3 className="pixel-font text-2xl mb-4 text-primary">Proud PESU Students</h3>
                <div className="space-y-4 text-lg">
                  <p className="flex items-center gap-3">
                    <span className="font-bold text-secondary">Thanas.R</span>
                    <span className="text-muted-foreground">AIML Branch • First Year</span>
                  </p>
                  <p className="flex items-center gap-3">
                    <span className="font-bold text-secondary">Tanay.S</span>
                    <span className="text-muted-foreground">CSE Branch • First Year</span>
                  </p>
                  <p className="flex items-center gap-3">
                    <span className="font-bold text-secondary">TN Pranav</span>
                    <span className="text-muted-foreground">CSE Branch • First Year</span>
                  </p>
                </div>
                <p className="mt-6 text-muted-foreground">
                  Created to help PESU students prepare quickly with their short notes and study materials.
                  Our AI-powered platform transforms your content into interactive learning experiences.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 px-4">
          <div className="container mx-auto">
            <h2 className="pixel-font text-4xl font-bold mb-12 text-center text-white drop-shadow-lg">
              Learning Modes
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: 'Flash Cards', desc: 'Quick revision with smart cards', icon: '📝' },
                { title: 'Quiz Game', desc: 'Test your knowledge with adaptive difficulty', icon: '🎯' },
                { title: 'Memory Match', desc: 'Match concepts in a fun game', icon: '🎮' },
                { title: 'Thoughtscape', desc: 'Visual mind maps of your content', icon: '🌐' },
                { title: 'Notes', desc: 'AI-organized study notes', icon: '📚' },
                { title: 'Ask PESU', desc: 'AI assistant for help', icon: '💬' },
              ].map((feature, idx) => (
                <Card
                  key={idx}
                  className="p-6 pixel-border bg-card/90 backdrop-blur-md hover:scale-105 transition-transform cursor-pointer"
                >
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="pixel-font text-xl mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.desc}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
