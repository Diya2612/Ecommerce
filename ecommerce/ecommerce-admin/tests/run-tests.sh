#!/bin/bash

# Quick Start Script for Playwright Tests
# This script helps you run your first Playwright test

echo "🎭 Playwright Test Setup - Quick Start"
echo "======================================"
echo ""

# Check if .env.test exists
if [ ! -f .env.test ]; then
    echo "⚠️  No .env.test file found. Creating from template..."
    cp .env.test.example .env.test
    echo "✅ Created .env.test file"
    echo "⚠️  Please edit .env.test with your test credentials before running tests"
    echo ""
    exit 1
fi

echo "✅ Environment file found"
echo ""

# Check if dev server is running
if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null ; then
    echo "✅ Dev server is already running on port 5173"
else
    echo "⚠️  Dev server is not running"
    echo "Starting dev server in background..."
    npm run dev &
    SERVER_PID=$!
    echo "Waiting for server to start..."
    sleep 5
    echo "✅ Dev server started (PID: $SERVER_PID)"
fi

echo ""
echo "Running Playwright tests..."
echo ""

# Run tests
npm test

echo ""
echo "✅ Tests complete!"
echo ""
echo "To view the HTML report, run:"
echo "  npm run test:report"
echo ""
