import { Settings } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAccessibility } from '@/hooks/useAccessibility';

export const AccessibilitySettings = () => {
  const {
    fontSize,
    setFontSize,
    dyslexicFont,
    setDyslexicFont,
    reducedMotion,
    setReducedMotion,
    highContrast,
    setHighContrast,
    ttsEnabled,
    setTtsEnabled,
    ttsVoice,
    setTtsVoice,
  } = useAccessibility();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          className="p-3 rounded-full bg-primary text-primary-foreground hover:scale-110 transition-transform pixel-border"
          aria-label="Accessibility Settings"
        >
          <Settings className="h-6 w-6" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-card pixel-border">
        <DialogHeader>
          <DialogTitle className="pixel-font text-2xl flex items-center gap-2">
            <Settings className="h-6 w-6" />
            Accessibility
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-2 accessibility-setting">
            <Label htmlFor="font-size" className="pixel-font">
              Font Size: {fontSize}px
            </Label>
            <Slider
              id="font-size"
              min={12}
              max={24}
              step={1}
              value={[fontSize]}
              onValueChange={(value) => setFontSize(value[0])}
              className="w-full"
            />
          </div>

          <div className="flex items-center justify-between accessibility-setting">
            <Label htmlFor="dyslexic-font" className="pixel-font">
              OpenDyslexic Font
            </Label>
            <Switch
              id="dyslexic-font"
              checked={dyslexicFont}
              onCheckedChange={setDyslexicFont}
            />
          </div>

          <div className="flex items-center justify-between accessibility-setting">
            <Label htmlFor="reduced-motion" className="pixel-font">
              Reduced Motion
            </Label>
            <Switch
              id="reduced-motion"
              checked={reducedMotion}
              onCheckedChange={setReducedMotion}
            />
          </div>

          <div className="flex items-center justify-between accessibility-setting">
            <Label htmlFor="high-contrast" className="pixel-font">
              High Contrast
            </Label>
            <Switch
              id="high-contrast"
              checked={highContrast}
              onCheckedChange={setHighContrast}
            />
          </div>

          <div className="space-y-4 accessibility-setting">
            <div className="flex items-center justify-between">
              <Label htmlFor="tts-enabled" className="pixel-font">
                Enable Text-to-Speech
              </Label>
              <Switch
                id="tts-enabled"
                checked={ttsEnabled}
                onCheckedChange={setTtsEnabled}
              />
            </div>

            {ttsEnabled && (
              <div className="space-y-2">
                <Label htmlFor="tts-voice" className="pixel-font">
                  Text-to-Speech Voice
                </Label>
                <Select value={ttsVoice} onValueChange={setTtsVoice}>
                  <SelectTrigger id="tts-voice">
                    <SelectValue placeholder="Select voice" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="off">Off</SelectItem>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="male">Male Voice</SelectItem>
                    <SelectItem value="female">Female Voice</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
