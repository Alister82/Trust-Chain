@echo off
setlocal enabledelayedexpansion

set "base=d:\user1\alister\projects\TrustChain\TrustChain\frontend\src\app"

REM Create directories
for %%D in (login register wallet-setup) do (
    if not exist "!base!\%%D" (
        mkdir "!base!\%%D"
        echo Created directory: !base!\%%D
    )
    REM Create page.tsx file
    type nul > "!base!\%%D\page.tsx"
    echo Created file: !base!\%%D\page.tsx
)

echo.
echo ========================================
echo Directory structure created successfully!
echo ========================================
echo.
dir "!base!" /B
