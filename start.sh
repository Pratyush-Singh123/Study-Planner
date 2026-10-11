#!/usr/bin/env bash
# ============================================================
# GapFill — One-Click Development Server Launcher
# Launches Flask Backend (:5001) + Vite React Frontend (:5173)
# ============================================================

set -e
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

echo "============================================================"
echo "🚀 Launching GapFill Study Planner"
echo "  • Backend API:     http://localhost:5001"
echo "  • Frontend Web:    http://localhost:5173"
echo "  • Email SMTP:      smtp.gmail.com:587 (Active)"
echo "============================================================"

npm run dev
