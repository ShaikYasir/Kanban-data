#!/bin/bash

# Daily Scheduler Kanban Setup Script
echo "🚀 Setting up Daily Scheduler Kanban for GitHub Pages deployment..."

# Initialize git repository if not already initialized
if [ ! -d ".git" ]; then
    echo "📁 Initializing Git repository..."
    git init
    git branch -M main
fi

# Add all files
echo "📋 Adding files to Git..."
git add .

# Create initial commit
echo "💾 Creating initial commit..."
git commit -m "Initial commit: Daily Scheduler Kanban application

Features:
- Kanban board interface with drag & drop
- Pomodoro timer integration
- Task categorization and priority management
- Daily statistics and productivity tracking
- Progressive Web App (PWA) support
- Responsive design for all devices
- Local storage for data persistence"

echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Create a new repository on GitHub named 'daily-scheduler-kanban'"
echo "2. Run: git remote add origin https://github.com/YOUR_USERNAME/daily-scheduler-kanban.git"
echo "3. Run: git push -u origin main"
echo "4. Go to repository Settings > Pages"
echo "5. Set Source to 'GitHub Actions'"
echo "6. Your app will be available at: https://YOUR_USERNAME.github.io/daily-scheduler-kanban"
echo ""
echo "🎉 Enjoy your new productivity app!"
