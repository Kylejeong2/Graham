import axios from 'axios';

const RETELL_API_BASE_URL = 'https://api.retellai.com';

const RETELL_API_KEY = process.env.NEXT_PUBLIC_RETELL_API_KEY;

if (!RETELL_API_KEY) {
  throw new Error('NEXT_PUBLIC_RETELL_API_KEY is not set in the environment variables');
}

const retellAxios = axios.create({
  baseURL: RETELL_API_BASE_URL,
  headers: {
    'Authorization': `Bearer ${RETELL_API_KEY}`,
    'Content-Type': 'application/json',
  },
});

export interface RetellAgent {
  agent_id: string;
  llm_websocket_url: string;
  agent_name?: string;
  voice_id: string;
  voice_model?: 'eleven_turbo_v2' | 'eleven_turbo_v2_5' | 'eleven_multilingual_v2' | null;
  fallback_voice_ids?: string[] | null;
  voice_temperature?: number;
  voice_speed?: number;
  responsiveness?: number;
  interruption_sensitivity?: number;
  enable_backchannel?: boolean;
  backchannel_frequency?: number;
  backchannel_words?: string[] | null;
  reminder_trigger_ms?: number;
  reminder_max_count?: number;
  ambient_sound?: 'coffee-shop' | 'convention-hall' | 'summer-outdoor' | 'mountain-outdoor' | 'static-noise' | 'call-center' | null;
  ambient_sound_volume?: number;
  language?: 'en-US' | 'en-IN' | 'en-GB' | 'de-DE' | 'es-ES' | 'es-419' | 'hi-IN' | 'ja-JP' | 'pt-PT' | 'pt-BR' | 'fr-FR' | 'multi';
  webhook_url?: string | null;
  boosted_keywords?: string[] | null;
  opt_out_sensitive_data_storage?: boolean;
  pronunciation_dictionary?: Array<{ word: string; alphabet: string; phoneme: string }> | null;
  normalize_for_speech?: boolean;
  end_call_after_silence_ms?: number;
  enable_voicemail_detection?: boolean;
  voicemail_message?: string;
  post_call_analysis_data?: Array<{ type: string; name: string; description: string; examples: string[] }> | null;
  last_modification_timestamp: number;
}

export interface RetellPhoneNumber {
  id: string;
  phone_number: string;
  inbound_agent_id: string;
  outbound_agent_id: string;
  area_code: string;
  nickname: string;
  created_at?: string;
  updated_at?: string;
}

export interface RetellLLM {
  llm_id: string;
  llm_websocket_url: string;
  model: string;
  general_prompt: string;
  general_tools: any[] | null;
  states: any[] | null;
  starting_state: string | null;
  begin_message: string | null;
}

export const createRetellLLM = async (llmData: {
  model?: 'gpt-3.5-turbo' | 'gpt-4-turbo' | 'gpt-4o' | 'gpt-4o-mini' | 'claude-3.5-sonnet' | 'claude-3-haiku';
  general_prompt: string;
  general_tools?: any[];
  states?: any[];
  starting_state?: string;
  begin_message?: string;
  inbound_dynamic_variables_webhook_url?: string;
}): Promise<RetellLLM> => {
  try {
    const response = await retellAxios.post('/create-retell-llm', llmData);
    return response.data;
  } catch (error) {
    console.error('Error creating Retell LLM:', error);
    throw error;
  }
};

export const updateRetellLLM = async (llmId: string, llmData: {
  model?: 'gpt-3.5-turbo' | 'gpt-4-turbo' | 'gpt-4o' | 'gpt-4o-mini' | 'claude-3.5-sonnet' | 'claude-3-haiku';
  general_prompt?: string;
  general_tools?: any[];
  states?: any[];
  starting_state?: string;
  begin_message?: string;
  inbound_dynamic_variables_webhook_url?: string;
}): Promise<RetellLLM> => {
  try {
    const response = await retellAxios.patch(`/update-retell-llm/${llmId}`, llmData);
    return response.data;
  } catch (error) {
    console.error('Error updating Retell LLM:', error);
    throw error;
  }
};

export const getRetellLLM = async (llmId: string) => {
  try {
    const response = await retellAxios.get(`/get-retell-llm/${llmId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting Retell LLM:', error);
    throw error;
  }
};

export const createRetellAgent = async (agentData: {
  llm_websocket_url: string;
  agent_name?: string;
  voice_id: string;
  voice_model?: 'eleven_turbo_v2' | 'eleven_turbo_v2_5' | 'eleven_multilingual_v2' | null;
  fallback_voice_ids?: string[] | null;
  voice_temperature?: number;
  voice_speed?: number;
  responsiveness?: number;
  interruption_sensitivity?: number;
  enable_backchannel?: boolean;
  backchannel_frequency?: number;
  backchannel_words?: string[] | null;
  reminder_trigger_ms?: number;
  reminder_max_count?: number;
  ambient_sound?: 'coffee-shop' | 'convention-hall' | 'summer-outdoor' | 'mountain-outdoor' | 'static-noise' | 'call-center' | null;
  ambient_sound_volume?: number;
  language?: 'en-US' | 'en-IN' | 'en-GB' | 'de-DE' | 'es-ES' | 'es-419' | 'hi-IN' | 'ja-JP' | 'pt-PT' | 'pt-BR' | 'fr-FR' | 'multi';
  webhook_url?: string | null;
  boosted_keywords?: string[] | null;
  opt_out_sensitive_data_storage?: boolean;
  pronunciation_dictionary?: Array<{ word: string; alphabet: string; phoneme: string }> | null;
  normalize_for_speech?: boolean;
  end_call_after_silence_ms?: number;
  enable_voicemail_detection?: boolean;
  voicemail_message?: string;
  post_call_analysis_data?: Array<{ type: string; name: string; description: string; examples: string[] }> | null;
}): Promise<RetellAgent> => {
  try {
    const response = await retellAxios.post('/create-agent', agentData);
    return response.data;
  } catch (error) {
    console.error('Error creating Retell agent:', error);
    throw error;
  }
};

export const updateRetellAgent = async (agentId: string, agentData: Partial<RetellAgent>): Promise<RetellAgent> => {
  try {
    const response = await retellAxios.patch(`/update-agent/${agentId}`, agentData);
    return response.data;
  } catch (error) {
    console.error('Error updating Retell agent:', error);
    throw error;
  }
};

export const deleteRetellAgent = async (agentId: string): Promise<void> => {
  try {
    await retellAxios.delete(`/delete-agent/${agentId}`);
  } catch (error) {
    console.error('Error deleting Retell agent:', error);
    throw error;
  }
};

export const createRetellPhoneNumber = async (phoneData: Partial<RetellPhoneNumber>): Promise<RetellPhoneNumber> => {
  try {
    const response = await retellAxios.post('/create-phone-number', {
      inbound_agent_id: phoneData?.inbound_agent_id,
      outbound_agent_id: phoneData?.outbound_agent_id,
      area_code: phoneData.area_code,
      nickname: phoneData?.nickname
    });
    return {
      id: response.data.id,
      phone_number: response.data.phone_number,
      inbound_agent_id: response.data.inbound_agent_id,
      outbound_agent_id: response.data.outbound_agent_id,
      area_code: response.data.area_code,
      nickname: response.data.nickname
    };
  } catch (error) {
    console.error('Error creating Retell phone number:', error);
    throw error;
  }
};

export const updateRetellPhoneNumber = async (phoneNumber: string, phoneData: {
    inbound_agent_id?: string;
    outbound_agent_id?: string;
    nickname?: string;
}): Promise<RetellPhoneNumber> => {
    try {
        const response = await retellAxios.patch(`/update-phone-number/${phoneNumber}`, phoneData);
        return response.data;
    } catch (error) {
        console.error('Error updating Retell phone number:', error);
        throw error;
    }
};

export const deleteRetellPhoneNumber = async (phoneNumber: string) => {
  try {
    const response = await retellAxios.delete(`/delete-phone-number/${phoneNumber}`);
    return response;
  } catch (error) {
    console.error('Error deleting Retell phone number:', error);
    throw error;
  }
};

export const listPhoneNumbers = async (): Promise<RetellPhoneNumber[]> => {
  try {
    const response = await retellAxios.get('/list-phone-numbers');
    return response.data;
  } catch (error) {
    console.error('Error listing Retell phone numbers:', error);
    throw error;
  }
};

export const getRetellConcurrency = async (): Promise<number> => {
  try {
    const response = await retellAxios.get('/get-concurrency');
    return response.data.concurrency;
  } catch (error) {
    console.error('Error getting Retell concurrency:', error);
    throw error;
  }
};

export const createRetellPhoneCall = async (phoneNumber: string, agentId: string): Promise<any> => {
  try {
    const response = await retellAxios.post('/create-phone-call', { phone_number: phoneNumber, agent_id: agentId });
    return response.data;
  } catch (error) {
    console.error('Error creating Retell phone call:', error);
    throw error;
  }
};