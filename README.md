# 📱 Daily Achievement Tracker

A beautiful, modern web app for tracking daily activities, setting goals, and building productive habits.

## ✨ Features

- **📊 Activity Logging** - Track time, distance, and count-based activities
- **🎯 Goal Setting** - Set and track progress toward your objectives  
- **✅ Daily Routines** - Manage recurring tasks and habits
- **📈 Statistics** - Comprehensive analytics and progress tracking
- **🌙 Dark Mode** - Beautiful light and dark themes
- **📱 PWA Ready** - Install as a native-like app on any device
- **☁️ Cloud Sync** - Optional Supabase integration for data backup

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/yourusername/daily-achievement-tracker.git
cd daily-achievement-tracker

# Install dependencies
npm install

# Start development server
npm run dev
```

### Quick Start (No Setup Required)
```bash
# Install dependencies
npm install

# Start the app
npm run dev
```

The app works completely offline by default! No database setup required.

### Build for Production
```bash
# Build the app
npm run build

# Preview the build
npm run preview
```

## 🌐 Deployment

### Web Deployment
The app is ready to deploy to any static hosting service:

- **Netlify**: Drag the `dist` folder or connect your GitHub repo
- **Vercel**: Import from GitHub for automatic deployments
- **GitHub Pages**: Enable in repository settings

### Mobile App (Optional)
Convert to native mobile apps using Capacitor:

```bash
# Add mobile platforms
npx cap add android
npx cap add ios

# Build and sync
npm run build
npx cap sync

# Open in native IDEs
npx cap open android
npx cap open ios
```

## 🛠️ Tech Stack

- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Vite** - Fast build tool and dev server
- **Lucide React** - Beautiful icons
- **Capacitor** - Native mobile app wrapper
- **Supabase** - Optional backend and authentication

## 📖 Usage

### Adding Activities
1. Select a category or create a new one
2. Enter amounts in natural formats:
   - Time: `1h 30m`, `90min`, `1:30`
   - Distance: `5km`, `3.2mi`, `1500m`  
   - Count: `12`, `5x`, `3 times`
3. Add optional notes
4. Track your progress over time

### Setting Goals
1. Go to the Dashboard tab
2. Click "New Goal"
3. Set target amounts and dates
4. Watch your progress automatically update

### Daily Routines
1. Visit the Daily Routines tab
2. Add recurring tasks
3. Check them off each day
4. Build consistent habits

## 🎨 Customization

### Categories
- Add custom categories in Settings
- Choose between Time, Distance, or Count types
- Mark important categories as "habits"

### Themes
- Toggle between light and dark modes
- Automatic system preference detection
- Persistent theme selection

## 📱 PWA Features

- **Offline Support** - Works without internet
- **Install Prompt** - Add to home screen
- **Native Feel** - App-like experience
- **Push Notifications** - Coming soon

## 🔧 Configuration

### Environment Variables (Optional)
For Supabase integration, create a `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📄 License

MIT License - feel free to use and modify!

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

**Built with ❤️ for productivity enthusiasts**