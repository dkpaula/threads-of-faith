#!/bin/bash

# Script to start the MERN blog application (both frontend and backend)

# First, kill any existing processes on our ports
if [ -f "tools/kill-server.sh" ]; then
  echo "Cleaning up ports before starting..."
  ./tools/kill-server.sh
fi

# Start backend server
echo "Starting backend server..."
cd backend
PORT=5001 npm run dev &
BACKEND_PID=$!
echo "Backend server started with PID: $BACKEND_PID"

# Wait a moment for backend to initialize
sleep 3

# Start frontend server
echo "Starting frontend server..."
cd ../frontend
HOST=0.0.0.0 PORT=3000 npm start &
FRONTEND_PID=$!
echo "Frontend server started with PID: $FRONTEND_PID"

# Trap to catch ctrl+c and kill both servers
trap "echo 'Shutting down servers...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT

# Keep script running
echo "Both servers are now running. Press Ctrl+C to stop."
wait 