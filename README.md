# SmartClips.io

SmartClips.io is an AI-powered video creation and editing platform that helps users create engaging content through smart clipping, avatar generation, and script generation.

## 🚀 Features

- **Smart Clipper**: Automatically extract the most interesting segments from your videos
- **Avatar Creator**: Create engaging avatar videos with AI-generated visuals
- **Script Generator**: Generate compelling scripts and turn them into videos
- **Video Editor**: Edit and enhance your video content
- **Social Integration**: Share your content directly to social media platforms
- **Content Calendar**: Plan and schedule your content releases

## 📋 Tech Stack

- **Frontend**: React with TypeScript
- **UI Framework**: Tailwind CSS with Shadcn UI components
- **Authentication**: Supabase Auth
- **Database**: Supabase
- **Build Tool**: Vite
- **Routing**: React Router
- **Form Handling**: React Hook Form with Zod validation
- **Video Processing**: Cloudinary

## 🛠️ Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/smartclips.git
   cd smartclips
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## 🏗️ Project Structure

```
smartclips/
├── public/             # Static assets
├── src/
│   ├── components/     # Reusable UI components
│   ├── context/        # React context providers
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utility functions and libraries
│   ├── pages/          # Page components
│   ├── App.tsx         # Main application component
│   ├── main.tsx        # Application entry point
│   └── index.css       # Global styles
├── .env                # Environment variables (create this)
├── package.json        # Project dependencies and scripts
└── vite.config.ts      # Vite configuration
```

## 📱 Core Features Explained

### Smart Clipper

The Smart Clipper feature allows users to upload videos and automatically extract the most engaging segments based on AI analysis. Users can:

1. Upload videos to Cloudinary
2. Specify clip parameters (duration, number of clips)
3. Provide a prompt to guide the AI in selecting relevant segments
4. Download or share the generated clips

### Avatar Creator

Create AI-powered avatar videos with customizable characters and backgrounds. This feature enables:

1. Selecting or uploading avatar templates
2. Adding scripts for the avatar to narrate
3. Customizing voice, appearance, and animations
4. Generating a final video with the avatar presenting your content

### Script Generator

Generate engaging scripts for your videos using AI. Features include:

1. Topic selection and content type specification
2. Tone and style customization
3. Script length and format options
4. Direct integration with video creation tools

## 🔐 Authentication

The application uses Supabase for authentication with the following features:

- Email/password authentication
- Social login (Google, Facebook, Apple)
- User profile management
- Role-based access control

## 🧩 Components

The UI is built using Shadcn UI components, which are based on Radix UI primitives and styled with Tailwind CSS. This provides:

- Accessible and customizable UI components
- Consistent design language
- Dark/light mode support
- Responsive layouts

## 🚀 Deployment

To build the application for production:

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## 🧪 Development

For development with hot-reload:

```bash
npm run dev
```

For linting:

```bash
npm run lint
```

## 📄 License

[MIT](LICENSE)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Project Origin

This project was originally created with [Lovable](https://lovable.dev/projects/3ba4ae96-5ecb-4089-93a3-66ad5d0c8015)...
