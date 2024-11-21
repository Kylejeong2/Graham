// import { OpenAI } from 'openai';

// export class OpenAIEmbeddings {
//   private openai: OpenAI;

//   constructor() {
//     this.openai = new OpenAI({
//       apiKey: process.env.OPENAI_API_KEY,
//     });
//   }

//   async embedDocuments(texts: string[]) {
//     const embeddings = await Promise.all(
//       texts.map(text => this.embedText(text))
//     );
//     return embeddings;
//   }

//   private async embedText(text: string) {
//     const response = await this.openai.embeddings.create({
//       model: 'text-embedding-3-small',
//       input: text,
//     });
//     return response.data[0].embedding;
//   }
// } 