// import axios from 'axios';
// import mammoth from 'mammoth';

// export async function processDocument(file: File) {
//   const fileType = file.type;
//   let text: string;

//   if (fileType === 'application/pdf') {
//     const formData = new FormData();
//     formData.append('file', file);
    
//     const response = await axios.post('https://api.chunkr.ai/v1/process', formData, {
//       headers: {
//         'Authorization': `Bearer ${process.env.CHUNKR_API_KEY}`,
//         'Content-Type': 'multipart/form-data'
//       },
//       params: {
//         mode: 'ocr',
//         chunkSize: 1000,
//         overlap: 200
//       }
//     });

//     return response.data.chunks;

//   } else if (fileType === 'application/msword' || fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
//     const arrayBuffer = await file.arrayBuffer();
//     const result = await mammoth.extractRawText({ arrayBuffer });
//     text = result.value;
    
//     // Send to Chunkr API for consistent chunking
//     const response = await axios.post('https://api.chunkr.ai/v1/chunk', {
//       text,
//       chunkSize: 1000,
//       overlap: 200
//     }, {
//       headers: {
//         'Authorization': `Bearer ${process.env.CHUNKR_API_KEY}`,
//         'Content-Type': 'application/json'
//       }
//     });

//     return response.data.chunks;
//   }

//   throw new Error('Unsupported file type');
// } 