#!/bin/bash

# Script to find and kill processes running on specific ports

echo "Checking for processes on ports 3000, 4001, and 5001..."

# Function to find and kill process on a specific port
kill_process_on_port() {
  local port=$1
  local pid=$(lsof -ti :$port)
  
  if [ -n "$pid" ]; then
    echo "Found process $pid running on port $port. Killing..."
    kill -9 $pid
    echo "Process on port $port has been terminated."
  else
    echo "No process found running on port $port."
  fi
}

# Kill processes on commonly used ports in the app
kill_process_on_port 3000
kill_process_on_port 4001
kill_process_on_port 5001

echo "Port clean-up complete." 