import { useState } from 'react';
import { Upload, FileText, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
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
    <div className="min-h-screen relative">
      {/* Background */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${pixelBackground})`,
          filter: 'brightness(0.7)',
        }}
      />
      
      {/* Gradient Overlay */}
      <div className="fixed inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background/80" />
      
      <div className="relative z-10 pb-24">
        {/* Top Navigation */}
        <header className="flex justify-between items-center p-4 md:p-6">
          <div className="text-xl md:text-2xl font-bold glass-card px-4 md:px-6 py-2 md:py-3 rounded-xl shadow-lg">
            PESU
          </div>
          <nav className="hidden md:flex gap-6 text-sm font-medium">
            <a href="#features" className="glass-card px-4 py-2 rounded-lg hover:bg-white/10 dark:hover:bg-white/10 transition-all">
              FEATURES
            </a>
            <a href="#about" className="glass-card px-4 py-2 rounded-lg hover:bg-white/10 dark:hover:bg-white/10 transition-all">
              ABOUT
            </a>
          </nav>
        </header>

        {/* Hero Section */}
        <section className="container mx-auto px-4 pt-12 md:pt-20 pb-16 md:pb-24 text-center">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 md:mb-6 drop-shadow-2xl tracking-tight">
            PESU-AI STUDENT HELPER
          </h1>
          <p className="text-lg md:text-2xl text-white/90 mb-12 md:mb-16 drop-shadow-lg font-medium max-w-3xl mx-auto">
            Transform your notes into engaging learning experiences
          </p>
          
          {/* Upload Card */}
          <div className="max-w-2xl mx-auto glass-card p-6 md:p-10 rounded-2xl shadow-2xl backdrop-blur-xl border border-white/10">
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
                  className="w-full sm:w-auto text-base md:text-lg px-6 md:px-8 py-5 md:py-6 bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg transition-all hover:scale-105"
                >
                  <Upload className="mr-2 h-5 w-5" />
                  Upload File
                </Button>
              </label>

              <div className="text-muted-foreground text-sm">Or paste your content here...</div>

              <Textarea
                placeholder="Paste your notes, study materials, or any content you want to learn..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[150px] md:min-h-[200px] resize-none glass-input text-sm md:text-base p-4 rounded-xl border-2 border-white/10 focus:border-primary/50 transition-all bg-background/40"
              />

              <Button
                onClick={handleSubmit}
                disabled={!content.trim()}
                className="w-full text-base md:text-lg px-6 md:px-8 py-5 md:py-6 bg-secondary hover:bg-secondary/90 text-white rounded-xl shadow-lg transition-all hover:scale-105"
              >
                <FileText className="mr-2 h-5 w-5" />
                Start Learning
              </Button>
            </div>
          </div>
        </section>

        {/* Learning Modes Section */}
        <section id="features" className="py-12 md:py-20 px-4">
          <div className="container mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold mb-12 md:mb-16 text-center text-white drop-shadow-lg">
              LEARNING MODES
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
              {[
                { title: 'NOTES & FLASH CARDS', desc: 'Quick revision with smart cards and AI-organized notes', icon: '📝', route: '/flashcards' },
                { title: 'QUIZ GAME', desc: 'Test your knowledge with adaptive difficulty', icon: '🎯', route: '/quiz' },
                { title: 'MEMORY MATCH', desc: 'Match concepts in a fun game', icon: '🎮', route: '/memory' },
                { title: 'THOUGHTSCAPE', desc: 'Visual mind maps of your content', icon: '🌐', route: '/thoughtscape' },
              ].map((feature, idx) => (
                <div
                  key={idx}
                  onClick={() => navigate(feature.route)}
                  className="glass-card p-6 md:p-8 rounded-2xl hover:scale-105 transition-all cursor-pointer shadow-xl hover:shadow-2xl backdrop-blur-xl border border-white/10"
                >
                  <div className="text-4xl md:text-5xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl md:text-2xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-sm md:text-base text-muted-foreground">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Ask PESU Section */}
        <section className="py-12 md:py-20 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="glass-card p-8 md:p-12 rounded-2xl shadow-2xl backdrop-blur-xl border border-white/10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center text-white drop-shadow-lg flex items-center justify-center gap-3">
                <MessageSquare className="h-8 w-8 md:h-10 md:w-10" />
                Chat with AI Assistant
              </h2>
              <p className="text-center text-muted-foreground mb-8 text-sm md:text-base">
                Ask me anything about AI!
              </p>
              <div className="glass-card p-6 md:p-8 rounded-xl bg-card/40 border border-white/5 min-h-[200px] md:min-h-[250px] flex flex-col items-center justify-center text-center">
                <p className="text-base md:text-lg text-muted-foreground mb-2">Start a conversation...</p>
                <p className="text-xs md:text-sm text-muted-foreground/70">Feature will be implemented soon</p>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-12 md:py-20 px-4">
          <div className="container mx-auto">
            <div className="glass-card p-8 md:p-12 rounded-2xl shadow-2xl max-w-5xl mx-auto backdrop-blur-xl border border-white/10">
              <h2 className="text-3xl md:text-5xl font-bold mb-8 text-center">ABOUT US</h2>
              <div className="glass-card p-6 md:p-8 rounded-xl bg-card/40 border border-white/5">
                <h3 className="text-2xl md:text-3xl mb-6 text-primary font-bold">PROUD PESU STUDENTS</h3>
                <div className="space-y-4 text-sm md:text-lg">
                  <p className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <span className="font-bold text-secondary text-lg md:text-xl">Thanas.R</span>
                    <span className="text-muted-foreground">AIML Branch • First Year</span>
                  </p>
                  <p className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <span className="font-bold text-secondary text-lg md:text-xl">Tanay.S</span>
                    <span className="text-muted-foreground">CSE Branch • First Year</span>
                  </p>
                  <p className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <span className="font-bold text-secondary text-lg md:text-xl">TN Pranav</span>
                    <span className="text-muted-foreground">CSE Branch • First Year</span>
                  </p>
                </div>
                <p className="mt-8 text-muted-foreground leading-relaxed text-sm md:text-base">
                  Created to help PESU students prepare quickly with their short notes and study materials.
                  Our AI-powered platform transforms your content into interactive learning experiences.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
