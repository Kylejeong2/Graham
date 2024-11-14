//TODO: make this work by upload to cloudflare and parsing info 
import { toast } from "react-toastify";

export const handleFileUpload = async (
  file: File,
  agentId: string,
  setUploadedFile: (file: File | null) => void
) => {
  if (!file.type.includes('pdf')) {
    toast.error('Only PDF files are currently supported');
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

    const response = await fetch('/api/agent/upload-document', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload file');
    }

    const data = await response.json();
    if (data.success) {
      toast.success('File uploaded and processed successfully');
    } else {
      throw new Error('Failed to upload file');
    }
  } catch (error) {
    console.error('Error uploading file:', error);
    toast.error('Failed to upload file');
    setUploadedFile(null);
  }
}; 