# CloakedChat Deployment Guide

## 🚀 Quick Deploy to Vercel

1. **Fork/Clone the Repository**
   ```bash
   git clone <your-repo-url>
   cd cloaked-chat
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set Up Environment Variables**
   Create a `.env.local` file:
   ```env
   OPENROUTER_API_KEY=your_openrouter_api_key_here
   NEXT_PUBLIC_APP_NAME=CloakedChat
   ```

4. **Get Your OpenRouter API Key**
   - Visit [OpenRouter.ai](https://openrouter.ai)
   - Sign up for an account
   - Navigate to API Keys section
   - Create a new API key
   - Copy the key to your `.env.local` file

5. **Test Locally**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

6. **Deploy to Vercel**
   - Push your code to GitHub
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your repository
   - Add environment variables:
     - `OPENROUTER_API_KEY`: Your OpenRouter API key
     - `NEXT_PUBLIC_APP_NAME`: CloakedChat
   - Deploy!

## 🔧 Manual Deployment Options

### Vercel CLI
```bash
npm install -g vercel
vercel --prod
```

### Docker
```bash
# Build the Docker image
docker build -t cloaked-chat .

# Run the container
docker run -p 3000:3000 -e OPENROUTER_API_KEY=your_key cloaked-chat
```

### Static Export (for other hosts)
```bash
# Add to next.config.js
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  }
}

# Build and export
npm run build
```

## 📱 PWA Features

The app includes:
- Service worker for offline functionality
- App manifest for installation
- Optimized caching strategies
- Mobile-first responsive design

## 🔒 Security Notes

- API key is server-side only (not exposed to client)
- CORS headers configured for security
- Input validation on all endpoints
- Rate limiting recommended for production

## 🎨 Customization

### Branding
- Update `public/manifest.json` with your app details
- Replace placeholder icons in `public/` directory
- Modify colors in `tailwind.config.ts`

### Features
- Add new artifact types in `ArtifactRenderer.tsx`
- Customize system prompt in `openrouter.ts`
- Add new file types in `FileUpload.tsx`

## 📊 Monitoring

Recommended tools:
- Vercel Analytics (built-in)
- Sentry for error tracking
- Google Analytics for usage metrics

## 🚨 Troubleshooting

### Common Issues

1. **API Key Not Working**
   - Verify key is correct in environment variables
   - Check OpenRouter account has credits
   - Ensure key has proper permissions

2. **Build Failures**
   - Clear `.next` directory: `rm -rf .next`
   - Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
   - Check Node.js version (requires 18+)

3. **PWA Not Installing**
   - Ensure HTTPS (required for PWA)
   - Check manifest.json is accessible
   - Verify service worker registration

4. **File Upload Issues**
   - Check file size limits (10MB default)
   - Verify file types are supported
   - Ensure proper MIME type detection

## 📈 Performance Optimization

- Images are optimized automatically
- Code splitting enabled
- PWA caching strategies implemented
- Lazy loading for components

## 🔄 Updates

To update the app:
1. Pull latest changes
2. Run `npm install` for new dependencies
3. Update environment variables if needed
4. Redeploy

---

**Need help?** Check the main README.md or create an issue in the repository.