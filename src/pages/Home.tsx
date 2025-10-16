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
      {/* Background */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${pixelBackground})`,
          filter: 'brightness(0.85)',
        }}
      />
      
      <div className="relative z-10">
        {/* Navbar */}
        <header className="flex justify-between items-center p-6">
          <div className="pixel-font text-3xl font-bold glass-card px-6 py-3 rounded-xl shadow-lg">
            PESU
          </div>
          <nav className="flex gap-8 pixel-font text-sm">
            <a href="#about" className="glass-card px-4 py-2 rounded-lg hover:bg-white/20 transition-all">ABOUT</a>
            <a href="#features" className="glass-card px-4 py-2 rounded-lg hover:bg-white/20 transition-all">FEATURES</a>
            <a href="#team" className="glass-card px-4 py-2 rounded-lg hover:bg-white/20 transition-all">TEAM</a>
          </nav>
        </header>

        {/* Hero Section */}
        <section className="container mx-auto px-4 pt-20 pb-32 text-center">
          <h1 className="pixel-font text-6xl md:text-8xl font-bold text-white mb-6 drop-shadow-2xl tracking-wider">
            PESU-AI STUDENT HELPER
          </h1>
          <p className="text-2xl md:text-3xl text-white/90 mb-16 drop-shadow-lg font-semibold">
            Transform your notes into engaging learning experiences
          </p>
          
          {/* Upload Card */}
          <div className="max-w-3xl mx-auto glass-card p-10 rounded-2xl shadow-2xl">
            <div className="space-y-6">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".txt,.doc,.docx,.pdf,.ppt,.pptx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  disabled={isUploading}
                  className="w-full sm:w-auto pixel-font text-lg px-8 py-6 bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg transition-all hover:scale-105"
                >
                  <Upload className="mr-2 h-6 w-6" />
                  Upload File
                </Button>
              </label>

              <div className="text-muted-foreground pixel-font">Or paste your content here...</div>

              <Textarea
                placeholder="Paste your notes, study materials, or any content you want to learn..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[200px] resize-none glass-input font-mono text-base p-4 rounded-xl border-2 focus:border-primary/50 transition-all"
              />

              <Button
                onClick={handleSubmit}
                disabled={!content.trim()}
                className="w-full pixel-font text-lg px-8 py-6 bg-secondary hover:bg-secondary/90 text-white rounded-xl shadow-lg transition-all hover:scale-105"
              >
                <FileText className="mr-2 h-6 w-6" />
                Start Learning
              </Button>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-20 px-4">
          <div className="container mx-auto">
            <div className="glass-card p-12 rounded-2xl shadow-2xl max-w-5xl mx-auto">
              <h2 className="pixel-font text-5xl font-bold mb-8 text-center">ABOUT US</h2>
              <div className="glass-card p-8 rounded-xl">
                <h3 className="pixel-font text-3xl mb-6 text-primary">PROUD PESU STUDENTS</h3>
                <div className="space-y-4 text-lg">
                  <p className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <span className="font-bold text-secondary pixel-font text-xl">Thanas.R</span>
                    <span className="text-muted-foreground">AIML Branch • First Year</span>
                  </p>
                  <p className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <span className="font-bold text-secondary pixel-font text-xl">Tanay.S</span>
                    <span className="text-muted-foreground">CSE Branch • First Year</span>
                  </p>
                  <p className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <span className="font-bold text-secondary pixel-font text-xl">TN Pranav</span>
                    <span className="text-muted-foreground">CSE Branch • First Year</span>
                  </p>
                </div>
                <p className="mt-8 text-muted-foreground leading-relaxed">
                  Created to help PESU students prepare quickly with their short notes and study materials.
                  Our AI-powered platform transforms your content into interactive learning experiences.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 px-4 mb-24">
          <div className="container mx-auto">
            <h2 className="pixel-font text-5xl font-bold mb-16 text-center text-white drop-shadow-lg">
              LEARNING MODES
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { title: 'FLASH CARDS', desc: 'Quick revision with smart cards', icon: '📝', route: '/flashcards' },
                { title: 'QUIZ GAME', desc: 'Test your knowledge with adaptive difficulty', icon: '🎯', route: '/quiz' },
                { title: 'MEMORY MATCH', desc: 'Match concepts in a fun game', icon: '🎮', route: '/memory' },
                { title: 'THOUGHTSCAPE', desc: 'Visual mind maps of your content', icon: '🌐', route: '/thoughtscape' },
                { title: 'NOTES', desc: 'AI-organized study notes', icon: '📚', route: '/flashcards' },
                { title: 'ASK PESU', desc: 'AI assistant for help', icon: '💬', route: '/chat' },
              ].map((feature, idx) => (
                <div
                  key={idx}
                  onClick={() => navigate(feature.route)}
                  className="glass-card p-8 rounded-2xl hover:scale-105 transition-all cursor-pointer shadow-xl hover:shadow-2xl"
                >
                  <div className="text-5xl mb-4">{feature.icon}</div>
                  <h3 className="pixel-font text-2xl mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
