<#
.SYNOPSIS
    46Hz Letterbox Launcher Script (Windows PowerShell)
    Starts PostgreSQL container via WSLC/Docker if not running,
    verifies environment, generates Prisma client, and launches dev server.
#>

param(
    [switch]$Verify,
    [switch]$VerifyOnly,
    [switch]$NoStart,
    [switch]$Seed,
    [switch]$Prod,
    [int]$Port = 3000
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $ScriptDir
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "             46Hz - 마음의 소리 익명 우체통               " -ForegroundColor Cyan
Write-Host "          Human-Centered Heart Sound Letterbox            " -ForegroundColor DarkCyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Check or create .env
if (-not (Test-Path "$ScriptDir\.env")) {
    if (Test-Path "$ScriptDir\.env.example") {
        Write-Host "[INFO] .env not found. Creating from .env.example..." -ForegroundColor Yellow
        Copy-Item "$ScriptDir\.env.example" "$ScriptDir\.env"
    } else {
        Write-Host "[WARN] .env not found and .env.example missing." -ForegroundColor Yellow
    }
}

# 2. Check PostgreSQL Port 5432
function Test-PortOpen {
    param([string]$Server = "127.0.0.1", [int]$Port = 5432)
    try {
        $tcp = New-Object System.Net.Sockets.TcpClient
        $iar = $tcp.BeginConnect($Server, $Port, $null, $null)
        $ok = $iar.AsyncWaitHandle.WaitOne(1500, $false)
        if ($ok) {
            $tcp.EndConnect($iar)
            $tcp.Close()
            return $true
        }
        $tcp.Close()
        return $false
    } catch {
        return $false
    }
}

Write-Host "`n[1/4] Checking PostgreSQL database service (port 5432)..." -ForegroundColor White
$isPortOpen = Test-PortOpen -Server "127.0.0.1" -Port 5432

if (-not $isPortOpen) {
    Write-Host "[INFO] Port 5432 is not responding. Checking container managers..." -ForegroundColor Yellow
    
    $wslcPath = "C:\Program Files\WSL\wslc.exe"
    $hasWslc = (Test-Path $wslcPath) -or (Get-Command "wslc.exe" -ErrorAction SilentlyContinue)
    $hasDocker = Get-Command "docker" -ErrorAction SilentlyContinue

    if ($hasWslc) {
        $cli = if (Test-Path $wslcPath) { $wslcPath } else { "wslc.exe" }
        Write-Host "[INFO] Managing container with WSLC ($cli)..." -ForegroundColor Cyan
        
        $containers = & $cli ps -a
        if ($containers -match "46hz-postgres") {
            Write-Host "[INFO] Starting existing 46hz-postgres container..." -ForegroundColor Green
            & $cli start 46hz-postgres
        } else {
            Write-Host "[INFO] Creating and launching 46hz-postgres container..." -ForegroundColor Green
            & $cli run -d --name 46hz-postgres -p 127.0.0.1:5432:5432 `
                -e POSTGRES_USER=46hz -e POSTGRES_PASSWORD=46hz -e POSTGRES_DB=46hz_letterbox `
                -v 46hz_postgres_data:/var/lib/postgresql/data `
                postgres:16-alpine
        }
    } elseif ($hasDocker) {
        Write-Host "[INFO] Managing container with Docker CLI..." -ForegroundColor Cyan
        $containers = docker ps -a --format "{{.Names}}"
        if ($containers -contains "46hz-postgres") {
            docker start 46hz-postgres
        } else {
            docker run -d --name 46hz-postgres -p 127.0.0.1:5432:5432 `
                -e POSTGRES_USER=46hz -e POSTGRES_PASSWORD=46hz -e POSTGRES_DB=46hz_letterbox `
                -v 46hz_postgres_data:/var/lib/postgresql/data `
                postgres:16-alpine
        }
    } else {
        Write-Host "[ERROR] Neither WSLC nor Docker CLI was found, and PostgreSQL is not listening on 5432." -ForegroundColor Red
        Write-Host "Please start PostgreSQL manually or start WSLC container." -ForegroundColor Red
        exit 1
    }

    # Wait for PostgreSQL to be ready
    Write-Host "[INFO] Waiting for PostgreSQL to accept connections..." -ForegroundColor Gray
    $retries = 15
    while ($retries -gt 0) {
        Start-Sleep -Seconds 1
        if (Test-PortOpen -Server "127.0.0.1" -Port 5432) {
            Write-Host "[OK] PostgreSQL is ready and listening on 127.0.0.1:5432." -ForegroundColor Green
            $isPortOpen = $true
            break
        }
        $retries--
    }

    if (-not $isPortOpen) {
        Write-Host "[ERROR] Timed out waiting for PostgreSQL to start." -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "[OK] PostgreSQL is online and listening on 127.0.0.1:5432." -ForegroundColor Green
}

# 3. Synchronize Prisma Schema
Write-Host "`n[2/4] Verifying Prisma Client and Schema sync..." -ForegroundColor White
& npx prisma generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Prisma generate failed." -ForegroundColor Red
    exit 1
}

# 4. Optional Backend Verification or Seeding
if ($Seed) {
    Write-Host "`n[SEED] Running database seeder..." -ForegroundColor Cyan
    & npm run prisma:seed
}

if ($Verify -or $VerifyOnly) {
    Write-Host "`n[VERIFY] Executing backend & architecture integrity test..." -ForegroundColor Cyan
    & npx tsx scripts/verify_backend.ts
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Backend verification failed." -ForegroundColor Red
        exit 1
    }
    if ($VerifyOnly) {
        Write-Host "`n[OK] VerifyOnly mode completed successfully. Exiting without launching server." -ForegroundColor Green
        exit 0
    }
}

if ($NoStart) {
    Write-Host "`n[OK] Environment initialized. Exiting as requested by -NoStart." -ForegroundColor Green
    exit 0
}

# 5. Launch Service
Write-Host "`n[3/4] Preparing application startup..." -ForegroundColor White
Write-Host "----------------------------------------------------------" -ForegroundColor DarkGray
Write-Host "  Web App:       http://localhost:$Port" -ForegroundColor Green
Write-Host "  Admin Portal:  http://localhost:$Port/admin" -ForegroundColor Green
Write-Host "  Passcode:      local-admin (Admin) / local-moderator (Mod)" -ForegroundColor Gray
Write-Host "  Default Lang:  ko_KR (Korean First)" -ForegroundColor Gray
Write-Host "----------------------------------------------------------" -ForegroundColor DarkGray

if ($Prod) {
    Write-Host "`n[4/4] Launching Next.js Production Build on port $Port..." -ForegroundColor Cyan
    & npm run build
    & npm run start -- -p $Port
} else {
    Write-Host "`n[4/4] Launching Next.js Dev Server on port $Port..." -ForegroundColor Cyan
    & npm run dev -- -p $Port
}
