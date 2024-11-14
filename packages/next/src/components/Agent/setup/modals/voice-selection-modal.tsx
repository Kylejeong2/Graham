import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Play, Square } from "lucide-react";

interface VoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  voices: any[];
  isLoadingVoices: boolean;
  selectedVoice: string | null;
  playingVoiceId: string | null;
  handleVoiceSelect: (voice: any) => void;
  handlePreviewVoice: (voice: any, e: React.MouseEvent) => void;
}

export const VoiceSelectionModal = ({
  isOpen,
  onClose,
  voices,
  isLoadingVoices,
  selectedVoice,
  playingVoiceId,
  handleVoiceSelect,
  handlePreviewVoice
}: VoiceModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-blue-900">Select a Voice</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoadingVoices ? (
            <div className="col-span-full flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : voices.length > 0 ? (
            voices.map((voice) => (
              <Card 
                key={voice.voice_id} 
                className={`p-4 cursor-pointer hover:border-blue-500 transition-all ${
                  selectedVoice === voice.voice_id ? 'border-2 border-blue-500' : ''
                }`}
                onClick={() => handleVoiceSelect(voice)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-blue-900">{voice.name}</h3>
                    <p className="text-sm text-blue-600">
                      {voice.labels?.accent || 'English'}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className={`text-orange-500 ${playingVoiceId === voice.voice_id ? 'bg-orange-50' : ''}`}
                    onClick={(e) => handlePreviewVoice(voice, e)}
                  >
                    {playingVoiceId === voice.voice_id ? (
                      <Square className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-blue-900">
              No voices available
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}; 