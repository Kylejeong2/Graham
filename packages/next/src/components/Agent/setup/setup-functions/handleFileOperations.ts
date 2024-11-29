import { toast } from "react-toastify";

export const handleFileUpload = async (
  file: File,
  agentId: string,
  setUploadedFile: (file: File | null) => void,
  userId: string
) => {
  if (!file.type.includes('pdf') && !file.type.includes('docx')) {
    toast.error('Only PDF and DOCX files are currently supported');
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    toast.error('File size must be less than 5MB');
    return;
  }

  setUploadedFile(file);
  
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('agentId', agentId);
    formData.append('userId', userId);
    const response = await fetch('/api/agent/information/upload-to-cloudflare', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to upload file');
    }

    const data = await response.json();
    if (data.success) {
      toast.success('File uploaded successfully');
    } else {
      throw new Error(data.error || 'Failed to process file');
    }
  } catch (error: any) {
    console.error('Error uploading file:', error);
    toast.error(error.message || 'Failed to upload file');
    setUploadedFile(null);
  }
}; 