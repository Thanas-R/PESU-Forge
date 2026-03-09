import { Upload, Cpu, Rocket } from 'lucide-react';

const steps = [
  {
    step: 1,
    title: 'Upload Your Notes',
    description: 'Paste text or upload PDF, TXT, or DOCX files with your study material.',
    Icon: Upload,
  },
  {
    step: 2,
    title: 'AI Processes Content',
    description: 'Our AI analyzes your notes and generates summaries, flashcards, quizzes, and mind maps.',
    Icon: Cpu,
  },
  {
    step: 3,
    title: 'Start Learning',
    description: 'Pick a learning mode and study interactively - retain more, stress less.',
    Icon: Rocket,
  },
];

export function HowItWorks() {
  return (
    <section className="py-12 md:py-20 px-4">
      <div className="container mx-auto max-w-5xl">
        <h2 className="text-3xl md:text-5xl font-bold mb-12 md:mb-16 text-center text-white drop-shadow-lg">
          HOW IT WORKS
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {steps.map((s, idx) => (
            <div key={idx} className="relative flex flex-col items-center text-center">
              {/* Connector line (hidden on mobile & last item) */}
              {idx < steps.length - 1 && (
                <div className="hidden md:block absolute top-10 left-[60%] w-[calc(100%-20%)] h-px border-t-2 border-dashed border-primary/40" />
              )}

              {/* Step circle */}
              <div className="w-20 h-20 rounded-2xl glass-card border border-primary/30 flex items-center justify-center mb-5 shadow-lg shadow-primary/10">
                <s.Icon className="h-8 w-8 text-primary" />
              </div>

              {/* Step number badge */}
              <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full mb-3">
                STEP {s.step}
              </span>

              <h3 className="text-lg md:text-xl font-bold mb-2 text-foreground">{s.title}</h3>
              <p className="text-sm text-muted-foreground max-w-xs">{s.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
