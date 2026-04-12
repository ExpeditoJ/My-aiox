@echo off
title AIOX AI Terminal
setlocal
cd /d "%~dp0"

echo ===================================================
echo   🦾 AIOX Músculo (OpenClaude) - Terminal Engine 
echo   Powered by Gemini Native / AIOX Mente
echo ===================================================
echo.
echo [1/2] Verificando motor local (Ollama)...

:: Wake up native Ollama engine invisibly if present
where ollama >nul 2>nul
if %errorlevel% equ 0 (
    start /b ollama serve >nul 2>&1
) else (
    if exist "%LOCALAPPDATA%\Programs\Ollama\ollama.exe" (
        start /b "" "%LOCALAPPDATA%\Programs\Ollama\ollama.exe" serve >nul 2>&1
    )
)

echo [2/2] Iniciando Interface de Inteligência Artificial...
echo.
node bin\aiox.js openclaude
echo.
echo Processo encerrado. Pressione qualquer tecla para sair.
pause >nul
endlocal
