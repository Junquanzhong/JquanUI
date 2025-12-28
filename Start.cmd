where live-server >nul 2>nul && (echo Starting live-server... & live-server) || (echo Installing live-server... & npm install -g live-server & live-server)
