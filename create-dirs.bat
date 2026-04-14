@echo off
REM Create directory structure for authentication pages
mkdir "d:\user1\alister\projects\TrustChain\TrustChain\frontend\src\app\login"
mkdir "d:\user1\alister\projects\TrustChain\TrustChain\frontend\src\app\register"
mkdir "d:\user1\alister\projects\TrustChain\TrustChain\frontend\src\app\wallet-setup"

REM Create empty page.tsx files
type nul > "d:\user1\alister\projects\TrustChain\TrustChain\frontend\src\app\login\page.tsx"
type nul > "d:\user1\alister\projects\TrustChain\TrustChain\frontend\src\app\register\page.tsx"
type nul > "d:\user1\alister\projects\TrustChain\TrustChain\frontend\src\app\wallet-setup\page.tsx"

echo.
echo Directory structure created successfully!
echo.
echo Created directories:
echo - d:\user1\alister\projects\TrustChain\TrustChain\frontend\src\app\login\page.tsx
echo - d:\user1\alister\projects\TrustChain\TrustChain\frontend\src\app\register\page.tsx
echo - d:\user1\alister\projects\TrustChain\TrustChain\frontend\src\app\wallet-setup\page.tsx
pause
