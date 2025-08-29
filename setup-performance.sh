#!/bin/bash

echo "🚀 Setting up Temet Platform Performance Optimizations..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install tsx globally for running TypeScript files
echo "📦 Installing tsx globally..."
npm install -g tsx

if [ $? -eq 0 ]; then
    echo "✅ tsx installed successfully"
else
    echo "❌ Failed to install tsx. Trying alternative approach..."
    npm install --save-dev tsx
fi

# Check if environment variables are set
echo "🔍 Checking environment variables..."

if [ -z "$NEXT_PUBLIC_APPWRITE_ENDPOINT" ]; then
    echo "⚠️  NEXT_PUBLIC_APPWRITE_ENDPOINT is not set"
fi

if [ -z "$NEXT_PUBLIC_APPWRITE_PROJECT" ]; then
    echo "⚠️  NEXT_PUBLIC_APPWRITE_PROJECT is not set"
fi

if [ -z "$APPWRITE_API_KEY" ]; then
    echo "⚠️  APPWRITE_API_KEY is not set"
fi

if [ -z "$NEXT_PUBLIC_APPWRITE_DATABASE_ID" ]; then
    echo "⚠️  NEXT_PUBLIC_APPWRITE_DATABASE_ID is not set"
fi

echo "📋 Environment variables checked"

# Create database indexes
echo "🗄️  Creating database indexes for performance optimization..."
npm run db:indexes

if [ $? -eq 0 ]; then
    echo "✅ Database indexes created successfully!"
    echo ""
    echo "🎉 Performance optimization setup complete!"
    echo ""
    echo "📊 Expected improvements:"
    echo "   • API Response Time: 11s → 200-500ms (20-50x faster)"
    echo "   • Database Queries: N+1 → 3 total queries"
    echo "   • Memory Usage: 50-70% reduction"
    echo ""
    echo "🚀 Your tasks route should now be blazingly fast!"
    echo ""
    echo "💡 Next steps:"
    echo "   1. Test the optimized route at /workspaces/[workspaceId]/tasks"
    echo "   2. Monitor response times in browser Network tab"
    echo "   3. Check console for performance metrics"
else
    echo "❌ Failed to create database indexes"
    echo "💡 Make sure your environment variables are set correctly"
    echo "💡 Check that you have the correct Appwrite API key permissions"
    exit 1
fi
