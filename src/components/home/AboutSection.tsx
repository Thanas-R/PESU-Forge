import { forwardRef } from 'react';
import { Github, Linkedin } from 'lucide-react';

export const AboutSection = forwardRef<HTMLElement>((_, ref) => {
  return (
    <section ref={ref} id="about" className="py-12 md:py-20 px-4">
      <div className="container mx-auto">
        <div className="glass-card p-8 md:p-12 rounded-2xl shadow-2xl max-w-5xl mx-auto backdrop-blur-xl border border-white/10">
          <h2 className="text-3xl md:text-5xl font-bold mb-8 text-center">ABOUT</h2>

          {/* Project description */}
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-10 text-sm md:text-base leading-relaxed">
            PESU Forge is an AI-powered study companion built to help students turn raw notes into
            interactive learning experiences - flashcards, quizzes, memory games, and visual mind maps -
            all generated in seconds.
          </p>

          <div className="glass-card p-6 md:p-8 rounded-xl bg-card/40 border border-white/5">
            <h3 className="text-xl md:text-2xl mb-6 text-primary font-bold">BUILT BY</h3>
            <div className="flex items-center gap-4">
              <div className="flex flex-col">
                <span className="text-foreground font-bold text-base md:text-lg">Thanas R</span>
                <span className="text-muted-foreground text-sm">AIML - 2025-29</span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href="https://github.com/Thanas-R?tab=repositories"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
                  aria-label="GitHub"
                >
                  <Github className="h-5 w-5" />
                </a>
                <a
                  href="https://www.linkedin.com/in/thanasr/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

AboutSection.displayName = 'AboutSection';
