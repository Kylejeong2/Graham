export type BusinessDocument = {
    id: string;
    fileName: string;
    fileType: string;
    uploadedAt: Date;
    status: 'PROCESSING' | 'COMPLETED' | 'FAILED';
};