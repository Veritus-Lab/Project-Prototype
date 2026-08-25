@echo off
setlocal

cd /d "%~dp0"

set "PORT=3000"
if not "%~1"=="" set "PORT=%~1"

echo.
echo ========================================
echo  FLERNK - servidor local
echo ========================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo [ERRO] Node.js nao encontrado no PATH.
  echo Instale o Node.js compatível com o projeto e tente novamente.
  pause
  exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
  echo [ERRO] npm nao encontrado no PATH.
  echo Reinstale o Node.js ou corrija o PATH e tente novamente.
  pause
  exit /b 1
)

if not exist "package.json" (
  echo [ERRO] package.json nao encontrado.
  echo Execute este arquivo dentro da pasta raiz do projeto.
  pause
  exit /b 1
)

if not exist ".env.local" (
  echo [AVISO] .env.local nao encontrado.
  echo Tentando copiar variaveis publicas do worktree validado...

  if exist "..\task-6-recovered\.env.local" (
    findstr /B "NEXT_PUBLIC_" "..\task-6-recovered\.env.local" > ".env.local"
  )
)

if not exist ".env.local" (
  echo.
  echo [ERRO] .env.local nao encontrado.
  echo Crie este arquivo a partir de .env.example com:
  echo - NEXT_PUBLIC_SUPABASE_URL
  echo - NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  echo - NEXT_PUBLIC_SITE_URL
  echo.
  echo O servidor nao sera iniciado para evitar o erro de configuracao do Supabase.
  pause
  exit /b 1
)

findstr /B "NEXT_PUBLIC_SUPABASE_URL=" ".env.local" >nul 2>nul
if errorlevel 1 (
  echo.
  echo [ERRO] NEXT_PUBLIC_SUPABASE_URL ausente em .env.local.
  pause
  exit /b 1
)

findstr /B "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=" ".env.local" >nul 2>nul
if errorlevel 1 (
  echo.
  echo [ERRO] NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ausente em .env.local.
  pause
  exit /b 1
)

if not exist "node_modules\" (
  echo Instalando dependencias...
  call npm ci
  if errorlevel 1 (
    echo.
    echo [ERRO] Falha ao instalar dependencias.
    pause
    exit /b 1
  )
  echo.
)

echo Subindo em http://localhost:%PORT%
echo Para parar o servidor, pressione Ctrl+C nesta janela.
echo.

start "" "http://localhost:%PORT%"
call npm run dev -- -p %PORT%

endlocal
