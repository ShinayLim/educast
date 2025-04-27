@echo off
echo Setting up the Educational Podcast Platform for Windows...

echo Creating necessary directories...
mkdir uploads
mkdir uploads\audios
mkdir uploads\videos
mkdir uploads\thumbnails

echo Renaming Windows-specific files...
copy server\index-windows.ts server\index.ts

echo Setup complete!
echo.
echo To start the application, run:
echo npm run dev
echo.
echo Or with command prompt:
echo set NODE_ENV=development && tsx server/index.ts
echo.
pause