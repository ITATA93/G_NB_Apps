#!/usr/bin/env pwsh
# Script de Validación Rápida de Scripts NocoBase
# Verifica que todos los comandos npm estén operacionales

Write-Host "🔍 Iniciando Validación de Scripts NocoBase..." -ForegroundColor Cyan
Write-Host ""

$ErrorCount = 0
$SuccessCount = 0
$TotalTests = 0

# Función para probar un comando
function Test-NpmScript {
    param(
        [string]$CommandName,
        [string]$Args = "--help"
    )
    
    $script:TotalTests++
    Write-Host "Probando: " -NoNewline -ForegroundColor Yellow
    Write-Host "npm run $CommandName -- $Args" -ForegroundColor White
    
    try {
        $output = npm run $CommandName -- $Args 2>&1
        $exitCode = $LASTEXITCODE
        
        if ($exitCode -eq 0) {
            Write-Host "  ✅ OK" -ForegroundColor Green
            $script:SuccessCount++
        }
        else {
            Write-Host "  ⚠️  Exit Code: $exitCode" -ForegroundColor Yellow
            $script:ErrorCount++
        }
    }
    catch {
        Write-Host "  ❌ ERROR: $_" -ForegroundColor Red
        $script:ErrorCount++
    }
    Write-Host ""
}

# Pruebas de Scripts Principales
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  SCRIPTS DE GESTIÓN DE DATOS" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Test-NpmScript "nb:collections"
Test-NpmScript "nb:fields"
Test-NpmScript "nb:data"

Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  SCRIPTS DE GESTIÓN DE USUARIOS" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Test-NpmScript "nb:users"
Test-NpmScript "nb:roles"
Test-NpmScript "nb:permissions"
Test-NpmScript "nb:auth"

Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  SCRIPTS DE INTERFAZ DE USUARIO" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Test-NpmScript "nb:ui"
Test-NpmScript "nb:themes"

Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  SCRIPTS DE AUTOMATIZACIÓN" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Test-NpmScript "nb:workflows"
Test-NpmScript "nb:async-tasks"
Test-NpmScript "nb:notifications"

Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  SCRIPTS DE SISTEMA" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Test-NpmScript "nb:system"
Test-NpmScript "nb:plugins"
Test-NpmScript "nb:backup"
Test-NpmScript "nb:datasources"
Test-NpmScript "nb:api-keys"

Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  SCRIPTS DE CONTENIDO" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Test-NpmScript "nb:files"
Test-NpmScript "nb:charts"
Test-NpmScript "nb:public-forms"
Test-NpmScript "nb:import-export"
Test-NpmScript "nb:localization"

Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  SCRIPTS ADICIONALES" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Test-NpmScript "nb:departments"
Test-NpmScript "nb:categories"
Test-NpmScript "nb:db-views"
Test-NpmScript "nb:env-vars"
Test-NpmScript "nb:apps"
Test-NpmScript "nb:custom-requests"
Test-NpmScript "nb:verification"
Test-NpmScript "nb:routes"

Write-Host ""
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  RESUMEN" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$SuccessRate = [math]::Round(($SuccessCount / $TotalTests) * 100, 2)

Write-Host "Total de Pruebas: " -NoNewline
Write-Host $TotalTests -ForegroundColor White

Write-Host "Exitosas: " -NoNewline
Write-Host $SuccessCount -ForegroundColor Green

Write-Host "Con Errores: " -NoNewline
$ErrorColor = if ($ErrorCount -eq 0) { "Green" } else { "Yellow" }
Write-Host $ErrorCount -ForegroundColor $ErrorColor

Write-Host "Tasa de Éxito: " -NoNewline
$RateColor = if ($SuccessRate -ge 95) { "Green" } elseif ($SuccessRate -ge 80) { "Yellow" } else { "Red" }
Write-Host "$SuccessRate%" -ForegroundColor $RateColor

Write-Host ""

if ($ErrorCount -eq 0) {
    Write-Host "🎉 TODOS LOS SCRIPTS ESTÁN OPERACIONALES" -ForegroundColor Green
    exit 0
}
else {
    Write-Host "⚠️  ALGUNOS SCRIPTS REQUIEREN REVISIÓN" -ForegroundColor Yellow
    exit 1
}
