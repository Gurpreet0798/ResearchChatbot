# Academic Research Assistant

An AI-powered assistant designed to help scholars and students navigate academic literature. The assistant uses real-time data from academic APIs and maintains persistent context across sessions using a vector database.

## Features

- Real-time academic research assistance using arXiv API
- Persistent memory using Pinecone vector database
- Context-aware responses using Gemini AI
- Modern, responsive UI built with Next.js and Tailwind CSS

## Prerequisites

- Node.js 18+ and npm
- Pinecone account and API key
- Google Gemini API key

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd academic-research-assistant
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory with the following variables:
```
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_ENVIRONMENT=your_pinecone_environment
PINECONE_INDEX_NAME=academic-research
GEMINI_API_KEY=your_gemini_api_key
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Usage

1. Open the application in your web browser
2. Type your research query in the input field
3. The assistant will:
   - Search for relevant academic papers
   - Retrieve relevant context from previous interactions
   - Generate a comprehensive response using the available information

## Architecture

The application is built with a modular architecture:

- `src/lib/memory.ts`: Handles persistent memory using Pinecone
- `src/lib/academic-api.ts`: Manages interactions with academic APIs
- `src/lib/agent.ts`: Core AI agent that combines memory and API data
- `src/app/api/chat/route.ts`: API endpoint for chat interactions
- `src/app/page.tsx`: Main chat interface component

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT 