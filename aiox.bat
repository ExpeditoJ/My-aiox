@echo off
title 👑 AIOX Command Center
setlocal enabledelayedexpansion

:: ── CONFIGURAÇÕES CORES ANSI ──
set "ESC="
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
echo  ██╔══██║██║██║   ██║ ██╔██╗ 
echo  ██║  ██║██║╚██████╔╝██╔╝ ██╗
echo  ╚═╝  ╚═╝╚═╝ ╚═════╝ ╚═╝  ╚═╝
echo       %M%COMMAND CENTER v5.0.3%W%
echo %B%===================================================%W%
echo  [1] %G%MENTE & MÚSCULO%W%  - Terminal IA Interativo
echo  [2] %C%MÚSCULO (YOLO)%W%  - Execução Autônoma de Alta Performance
echo  [3] %Y%DIAGNÓSTICO%W%      - Verificação de Saúde (Doctor)
echo  [4] %M%NEURAL ROUTER%W%   - Trocar Marcha (Turbo/Logic/Heavy)
echo  [5] %R%SAIR%W%             - Liberar VRAM e Encerrar
echo %B%===================================================%W%
echo.

:: AUTO-START TIMER
set "choice=1"
echo %W%Escolha uma opção (1-5) ou aguarde 5s para o %G%Modo Interativo%W%...
choice /c 12345 /t 5 /d 1 /n >nul
set "choice=%errorlevel%"

if "%choice%"=="1" goto MENTE
if "%choice%"=="2" goto MUSCULO
if "%choice%"=="3" goto DOCTOR
if "%choice%"=="4" goto ROUTER
if "%choice%"=="5" goto EXIT

:ROUTER
cls
echo %M%  ███╗   ██╗███████╗██╗   ██╗██████╗  █████╗ ██╗     
echo  ████╗  ██║██╔════╝██║   ██║██╔══██╗██╔══██╗██║     
echo  ██╔██╗ ██║█████╗  ██║   ██║██████╔╝███████║██║     
echo  ██║╚██╗██║██╔══╝  ██║   ██║██╔══██╗██╔══██║██║     
echo  ██║ ╚████║███████╗╚██████╔╝██║  ██║██║  ██║███████╗
echo  ╚═╝  ╚═══╝╚══════╝ ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝%W%
echo           %Y%AIOX NEURAL ROUTER v1.0%W%
echo %B%---------------------------------------------------%W%
echo  [1] %G%TURBO%W%  - Llama 3.2 (1B) [Velocidade Máxima]
echo  [2] %C%LOGIC%W%  - Llama 3.2 (3B) [Equilíbrio]
echo  [3] %Y%HEAVY%W%  - Gemma 3 (4B)   [Raciocínio Bruto]
echo  [4] %R%VOLTAR%W%
echo %B%---------------------------------------------------%W%
set /p rchoice="Escolha a marcha: "
if "%rchoice%"=="1" node scripts\switch-muscle.js turbo
if "%rchoice%"=="2" node scripts\switch-muscle.js logic
if "%rchoice%"=="3" node scripts\switch-muscle.js heavy
if "%rchoice%"=="4" goto MENU
timeout /t 2 >nul
goto MENU

:MENTE
echo.
echo %G%[Mente]%W% Iniciando Interface de Inteligência Artificial...
echo.
:: Wake up Ollama invisibly
where ollama >nul 2>nul
if %errorlevel% equ 0 start /b ollama serve >nul 2>&1
node bin\aiox.js openclaude
goto AFTER

:MUSCULO
echo.
echo %C%[Músculo]%W% Ativando Execução Autônoma (Build Local)...
echo %B%---------------------------------------------------%W%
:: Configurações de Prompt para evitar alucinações
set "PROMPT_BASE=VOCÊ É O MÚSCULO AIOX. REGRAS: 1. NUNCA explique ou descreva as ferramentas que você vê. 2. Apenas EXECUTE o que o usuário pedir usando as ferramentas. 3. Responda SEMPRE em Português do Brasil. 4. Seja extremamente técnico e direto."

:: ── MÚSCULO TURBO (Marcha 1) ──
if "%rchoice%"=="1" (
    set OPENAI_MODEL=llama3.2:1b
    set "EXTRA_PROMPT=Mode: TURBO (1B). FOCUS ON ACTION. %PROMPT_BASE%"
)
:: ── MÚSCULO LOGIC (Marcha 2) ──
if "%rchoice%"=="2" (
    set OPENAI_MODEL=llama3.2
    set "EXTRA_PROMPT=Mode: LOGIC (3B). Balanced reasoning. %PROMPT_BASE%"
)
:: ── MÚSCULO HEAVY (Marcha 3) ──
if "%rchoice%"=="3" (
    set OPENAI_MODEL=gemma3:4b
    set "EXTRA_PROMPT=Mode: HEAVY (4B). Maximum reasoning power. %PROMPT_BASE%"
)

set CLAUDE_CODE_USE_OPENAI=1
set OPENAI_BASE_URL=http://localhost:3100/v1
set OPENAI_MODEL=aiox-turbo
set OPENCLAUDE_ARGS=--dangerously-skip-permissions
start /b node scripts\api-pool-proxy.js >nul 2>&1
:: Wake up Ollama
where ollama >nul 2>nul
if %errorlevel% equ 0 start /b ollama serve >nul 2>&1
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
echo %M%Processo encerrado.%W% Liberando hardware...
call :CLEANUP
echo.
echo [R] Reiniciar Menu | [X] Sair
choice /c rx /n >nul
if %errorlevel% equ 1 goto MENU
goto EXIT

:CLEANUP
:: Gaming Mode: Liberação de VRAM
taskkill /f /im ollama* /t >nul 2>&1
taskkill /f /im node.exe /fi "WINDOWTITLE eq AIOX Pool Proxy" >nul 2>&1
echo %G%✓ VRAM Liberada.%W%
goto :eof

:EXIT
echo.
echo %C%Até logo, Operador. AIOX em repouso.%W%
timeout /t 2 >nul
exit
