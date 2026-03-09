import { useState, useRef } from 'react';
import { Upload, FileText, X, StickyNote, Target, Gamepad2, Network } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import pixelBackground from '@/assets/pixel-background.png';
import { HowItWorks } from '@/components/home/HowItWorks';
import { AboutSection } from '@/components/home/AboutSection';

async function extractPdfText(file: File): Promise<string> {
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
  const ab = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: ab }).promise;
  const pages: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const tc = await page.getTextContent();
    pages.push(tc.items.map((item: any) => ('str' in item ? item.str : '')).join(' '));
  }
  return pages.join('\n\n');
}

export default function Home() {
  const [content, setContent] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ name: string; preview: string }>>([]);
  const navigate = useNavigate();
  const { toast } = useToast();
  const featuresRef = useRef<HTMLElement>(null);
  const aboutRef = useRef<HTMLElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newFiles: Array<{ name: string; preview: string }> = [];
    let combinedContent = content;

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const ext = file.name.toLowerCase().split('.').pop() || '';
        let extractedText = '';

        if (ext === 'txt') {
          extractedText = await file.text();
        } else if (ext === 'pdf') {
          extractedText = await extractPdfText(file);
        } else if (ext === 'docx') {
          const ab = await file.arrayBuffer();
          const mammoth = await import('mammoth/mammoth.browser');
          const result = await mammoth.extractRawText({ arrayBuffer: ab });
          extractedText = (result.value || '').trim();
        } else if (ext === 'doc') {
          toast({ title: 'Legacy .doc not supported', description: `${file.name}: Convert to .docx, .pdf, or .txt.`, variant: 'destructive' });
          continue;
        } else {
          toast({ title: 'Unsupported file type', description: `${file.name}: Use .pdf, .txt, or .docx.`, variant: 'destructive' });
          continue;
        }

        if (extractedText.trim()) {
          combinedContent += (combinedContent ? '\n\n' : '') + extractedText;
          newFiles.push({
            name: file.name,
            preview: extractedText.slice(0, 200) + (extractedText.length > 200 ? '...' : ''),
          });
        }
      }

      if (newFiles.length > 0) {
        setContent(combinedContent);
        setUploadedFiles([...uploadedFiles, ...newFiles]);
        toast({ title: `${newFiles.length} file(s) uploaded!`, description: 'Content added to the input below.' });
      }
    } catch (error) {
      toast({ title: 'Upload failed', description: 'Please try again with a different file.', variant: 'destructive' });
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const removeFile = (index: number) => setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));

  const scrollToSection = (ref: React.RefObject<HTMLElement>) =>
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const handleSubmit = () => {
    if (!content.trim()) {
      toast({ title: 'No content provided', description: 'Please paste or upload content first.', variant: 'destructive' });
      return;
    }
    if (content.trim().length < 50) {
      toast({ title: 'Content too short', description: 'Please provide at least 50 characters.', variant: 'destructive' });
      return;
    }
    localStorage.setItem('learning-content', content);
    toast({ title: 'Content saved!', description: 'Choose a learning mode from the dock below.' });
  };

  const features = [
    { title: 'NOTES & FLASH CARDS', desc: 'Quick revision with smart cards and AI-organized notes', Icon: StickyNote, route: '/flashcards' },
    { title: 'QUIZ GAME', desc: 'Test your knowledge with adaptive difficulty', Icon: Target, route: '/quiz' },
    { title: 'MEMORY MATCH', desc: 'Match concepts in a fun game', Icon: Gamepad2, route: '/memory' },
    { title: 'THOUGHTSCAPE', desc: 'Visual mind maps of your content', Icon: Network, route: '/thoughtscape' },
  ];

  return (
    <div className="min-h-screen relative">
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${pixelBackground})`, filter: 'brightness(0.85) saturate(1.2)' }}
      />
      <div className="fixed inset-0 bg-gradient-to-b from-background/30 via-background/50 to-background/70 dark:from-background/70 dark:via-background/80 dark:to-background/90" />

      <div className="relative z-10 pb-24">
        {/* Navigation */}
        <header className="flex justify-between items-center p-4 md:p-6">
          <div className="text-xl md:text-2xl font-bold glass-card px-4 md:px-6 py-2 md:py-3 rounded-xl shadow-lg">Forge</div>
          <nav className="hidden md:flex gap-6 text-sm font-medium">
            <button onClick={() => scrollToSection(featuresRef)} className="glass-card px-4 py-2 rounded-lg hover:bg-white/10 transition-all">FEATURES</button>
            <button onClick={() => scrollToSection(aboutRef)} className="glass-card px-4 py-2 rounded-lg hover:bg-white/10 transition-all">ABOUT</button>
          </nav>
        </header>

        {/* Hero */}
        <section className="container mx-auto px-4 pt-12 md:pt-20 pb-16 md:pb-24 text-center">
          <h1 className="text-4xl md:text-6xl lg:text-8xl font-black text-white mb-4 md:mb-6 drop-shadow-2xl tracking-tight font-sans">PESU Forge</h1>
          <p className="text-lg md:text-2xl text-white/90 mb-12 md:mb-16 drop-shadow-lg font-medium max-w-3xl mx-auto">
            Transform your notes into engaging learning experiences
          </p>

          {/* Upload Card */}
          <div className="max-w-2xl mx-auto glass-card p-6 md:p-10 rounded-2xl shadow-2xl backdrop-blur-xl border border-white/10">
            <div className="space-y-6">
              <input ref={fileInputRef} type="file" accept=".txt,.docx,.pdf" onChange={handleFileUpload} className="hidden" multiple />

              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-full sm:w-auto text-base md:text-lg px-6 md:px-8 py-5 md:py-6 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-lg transition-all hover:scale-105"
              >
                <Upload className="mr-2 h-5 w-5" />
                {isUploading ? 'Uploading...' : 'Upload File'}
              </Button>

              <p className="text-xs text-muted-foreground">Supports PDF, TXT, and DOCX</p>

              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Uploaded Files:</p>
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="glass-card p-3 rounded-lg border border-white/10 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          {file.name}
                        </span>
                        <button onClick={() => removeFile(index)} className="text-muted-foreground hover:text-destructive transition-colors" aria-label="Remove file">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground">{file.preview}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="text-muted-foreground text-sm">Or paste your content here...</div>

              <Textarea
                placeholder="Paste your notes, study materials, or any content you want to learn..."
                value={content}
                onChange={(e) => { setContent(e.target.value); localStorage.setItem('learning-content', e.target.value); }}
                className="min-h-[150px] md:min-h-[200px] resize-none glass-input text-sm md:text-base p-4 rounded-xl border-2 border-white/10 focus:border-primary/50 transition-all bg-background/40"
              />

              <Button
                onClick={handleSubmit}
                disabled={!content.trim()}
                className="w-full text-base md:text-lg px-6 md:px-8 py-5 md:py-6 bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-xl shadow-lg transition-all hover:scale-105"
              >
                <FileText className="mr-2 h-5 w-5" />
                Start Learning
              </Button>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <HowItWorks />

        {/* Learning Modes */}
        <section ref={featuresRef} id="features" className="py-12 md:py-20 px-4">
          <div className="container mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold mb-12 md:mb-16 text-center text-white drop-shadow-lg">LEARNING MODES</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
              {features.map((f, idx) => (
                <div
                  key={idx}
                  onClick={() => navigate(f.route)}
                  className="glass-card p-6 md:p-8 rounded-2xl hover:scale-105 transition-all cursor-pointer shadow-xl hover:shadow-2xl backdrop-blur-xl border border-white/10"
                >
                  <f.Icon className="h-10 w-10 md:h-12 md:w-12 mb-4 text-primary" />
                  <h3 className="text-xl md:text-2xl font-bold mb-3">{f.title}</h3>
                  <p className="text-sm md:text-base text-muted-foreground">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* About */}
        <AboutSection ref={aboutRef} />
      </div>
    </div>
  );
}
