#!/bin/bash

# Chatbot Quick Start Script
# Run this to complete the chatbot setup

echo "🤖 Yamini Infotech - Chatbot Setup"
echo "===================================="
echo ""

# Step 1: Check if virtual environment is activated
if [[ -z "$VIRTUAL_ENV" ]]; then
    echo "⚠️  Virtual environment not activated!"
    echo "   Run: source .venv/bin/activate"
    exit 1
fi

# Step 2: Check Mistral API Key
if grep -q "your_mistral_api_key_here" backend/.env; then
    echo "⚠️  MISTRAL_API_KEY not set!"
    echo ""
    echo "   Please edit backend/.env and add your Mistral API key:"
    echo "   MISTRAL_API_KEY=your_actual_api_key"
    echo ""
    echo "   Get your key from: https://console.mistral.ai/api-keys/"
    echo ""
    read -p "   Press Enter after you've added the API key..."
fi

# Step 3: Create database tables
echo ""
echo "📊 Step 1: Creating chatbot database tables..."
cd backend
python init_chatbot_db.py

if [ $? -ne 0 ]; then
    echo "❌ Failed to create tables"
    exit 1
fi

# Step 4: Seed knowledge base
echo ""
echo "📚 Step 2: Seeding sample knowledge base..."
python seed_chatbot_knowledge.py

if [ $? -ne 0 ]; then
    echo "❌ Failed to seed knowledge"
    exit 1
fi

# Success!
echo ""
echo "✅ Chatbot setup complete!"
echo ""
echo "🎯 Next Steps:"
echo "   1. Restart your backend server (Ctrl+C and run again)"
echo "   2. Login to admin: http://localhost:5173/admin"
echo "   3. Go to 'AI Chatbot' → 'Knowledge Base'"
echo "   4. Click 'Rebuild Index' button"
echo "   5. Test chatbot on customer portal"
echo ""
echo "📖 Full guide: See CHATBOT_SETUP_GUIDE.md"
