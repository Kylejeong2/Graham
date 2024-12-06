import { toast } from "react-toastify";
import type { MutableRefObject } from 'react';

interface VoiceHandlerProps {
  voice: any;
  agentId: string;
  systemPrompt: string;
  setSelectedVoice: (id: string) => void;
  setSelectedVoiceName: (name: string) => void;
  onClose: () => void;
}

interface PreviewHandlerProps {
  voice: any;
  e: React.MouseEvent;
  audioRef: MutableRefObject<HTMLAudioElement | null>;
  playingVoiceId: string | null;
  setPlayingVoiceId: (id: string | null) => void;
}

export const handleVoiceSelect = async ({
  voice,
  agentId,
  systemPrompt,
  setSelectedVoice,
  setSelectedVoiceName,
  onClose
}: VoiceHandlerProps) => {
  try {
    setSelectedVoice(voice.voice_id);
    setSelectedVoiceName(voice.name);
    onClose();

    const response = await fetch(`/api/agent/updateAgent`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agentId,
        systemPrompt,
        voiceId: voice.voice_id,
        voiceName: voice.name,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update voice');
    }
    
    toast.success('Voice updated successfully');
  } catch (error) {
    console.error('Error updating voice:', error);
    toast.error('Failed to update voice selection');
  }
};

export const handlePreviewVoice = async ({
  voice,
  e,
  audioRef,
  playingVoiceId,
  setPlayingVoiceId
}: PreviewHandlerProps) => {
  e.stopPropagation();
  
  if (audioRef.current) {
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
  }

  if (playingVoiceId === voice.voice_id) {
    setPlayingVoiceId(null);
    return;
  }

  if (voice.preview_url) {
    const audio = new Audio(voice.preview_url);
    audioRef.current = audio;
    
    try {
      setPlayingVoiceId(voice.voice_id);
      await audio.play();
      
      audio.onended = () => {
        setPlayingVoiceId(null);
      };
    } catch (error) {
      console.error('Error playing audio:', error);
      toast.error('Failed to play voice preview');
      setPlayingVoiceId(null);
    }
  } else {
    toast.error('No preview available for this voice');
  }
}; 