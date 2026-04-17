@echo off
title 👑 AIOX Command Center
setlocal enabledelayedexpansion

:: ── CONFIGURAÇÕES CORES ANSI ──
set "ESC= "
set "G=%ESC%[92m"
set "C=%ESC%[96m"
set "M=%ESC%[95m"
set "Y=%ESC%[93m"
set "R=%ESC%[91m"
set "W=%ESC%[0m"
set "B=%ESC%[1m"

cd /d "%~dp0"

:MENU
cls
echo %C%  █████╗ ██╗ ██████╗ ██╗  ██╗
echo  ██╔══██╗██║██╔═══██╗╚██╗██╔╝
echo  ███████║██║██║   ██║ ╚███╔╝ 
echo  ██╔══██╗██║██║   ██║ ██╔██╗ 
echo  ██║  ██║██║╚██████╔╝██╔╝ ██╗
echo  ╚═╝  ╚═╝╚═╝ ╚═════╝ ╚═╝  ╚═╝
echo       %M%COMMAND CENTER v5.5.0 (Golden Master)%W%
echo %B%===================================================%W%
echo  [1] %G%MENTE & MÚSCULO%W%  - Terminal IA Interativo
echo  [2] %C%MÚSCULO (ROUTER)%W% - Proxy Ativado (Gemma 4/3)
echo  [3] %Y%DIAGNÓSTICO%W%      - Verificação de Saúde (Doctor)
echo  [4] %R%SAIR%W%             - Liberar VRAM e Encerrar
echo %B%===================================================%W%
echo.

:: AUTO-START TIMER
set "choice=1"
echo %W%Escolha uma opção (1-4) ou aguarde 5s para o %G%Modo Interativo%W%...
choice /c 1234 /t 5 /d 1 /n >nul
set "choice=%errorlevel%"

if "%choice%"=="1" goto MENTE
if "%choice%"=="2" goto MUSCULO
if "%choice%"=="3" goto DOCTOR
if "%choice%"=="4" goto EXIT

:MENTE
echo.
echo %G%[Mente]%W% Iniciando Interface de Inteligência Artificial...
echo.
node bin\aiox.js openclaude
goto AFTER

:MUSCULO
echo.
echo %C%[Músculo]%W% Ativando Execução via Neural Router...
echo %B%---------------------------------------------------%W%
set CLAUDE_CODE_USE_OPENAI=1
set OPENAI_BASE_URL=http://127.0.0.1:3100/v1
set OPENAI_API_KEY=local-muscle
set OPENAI_MODEL=aiox-muscle-v4
set OPENCLAUDE_ARGS=--dangerously-skip-permissions --append-system-prompt "VOCÊ É O MÚSCULO AIOX. Responda em PT-BR. Use ferramentas."

:: Wake up Ollama and start Router Proxy
where ollama >nul 2>nul
if %errorlevel% equ 0 start /b ollama serve >nul 2>&1
start /b node scripts\api-pool-proxy.js >nul 2>&1
ping 127.0.0.1 -n 3 > nul

node packages\openclaude-src\dist\cli.mjs %OPENCLAUDE_ARGS%
goto AFTER

:DOCTOR
echo.
echo %Y%[Doctor]%W% Executando diagnósticos do sistema...
echo.
node bin\aiox.js doctor
echo.
echo Pressione qualquer tecla para voltar ao menu...
pause >nul
goto MENU

:AFTER
echo.
echo %M%Processo encerrado.%W%
echo.
echo [R] Reiniciar Menu | [X] Sair
choice /c rx /n >nul
if %errorlevel% equ 1 goto MENU
goto EXIT

:EXIT
echo.
echo %C%Até logo, Operador. AIOX em repouso.%W%
timeout /t 2 >nul
exit
