<#
.SYNOPSIS
PowerShell module with aliases faciliating local development.

.INPUTS
This script assumes that:
- $kjgameDir is defined and points to the root of the local clone of the game (i.e. this) repository.
#>
Set-StrictMode -Version Latest

$kjgameDirExists = Get-Variable -Name 'kjgameDir' -ErrorAction SilentlyContinue
if (-not $kjgameDirExists) {
    throw "`$kjgameDir is not set in $($MyInvocation.MyCommand.Path). Please ensure the PowerShell script importing this module exports `$kjgameDir."
}

$backendDir = "$kjgameDir\src"
$frontendDir = "$kjgameDir\web"
$pwsh = "$env:USERPROFILE\.dotnet\tools\pwsh.exe"

$crimson = '#DC143C' # https://www.color-hex.com/color/dc143c
$steel_blue = '#4682B4' # https://www.color-hex.com/color/4682b4
$blue_violet = '#8A2BE2' # https://www.color-hex.com/color/8a2be2
# $medium_violet_red = '#C71585' # https://www.color-hex.com/color/c71585

function Start-GameLocalDevTwoPanes {
    Write-Host "Starting game local dev with two panes"
    wt --window 0 new-tab --profile "PowerShell" --startingDirectory $kjgameDir --tabColor $blue_violet --title "Game dev localhost" `; `
    split-pane --profile "PowerShell" --startingDirectory $frontendDir --horizontal --tabColor $steel_blue --title "Frontend"  $pwsh -ExecutionPolicy RemoteSigned -Command "npm run dev" `; `
    split-pane --profile "PowerShell" --startingDirectory $backendDir --tabColor $crimson --title "Backend"  $pwsh -ExecutionPolicy RemoteSigned -Command "dotnet watch --project api --launch-profile https" `; `
    move-focus up
    code $kjgameDir
}
New-Alias game-start-localdev Start-GameLocalDevTwoPanes

function Start-GameVSCode {
    Write-Host "Starting game VS Code"
    Set-Location $kjgameDir
    code .
}
New-Alias game-start-code Start-GameVSCode

function Start-GameFrontend {
    Write-Host "Starting game localhost frontend"
    wt --window 0 new-tab --profile "PowerShell" --horizontal --tabColor $steel_blue --title "Frontend" --startingDirectory $frontendDir $pwsh -ExecutionPolicy RemoteSigned -Command "npm run dev"
}
New-Alias game-start-frontend Start-GameFrontend

function Start-GameBackend {
    Write-Host "Starting game localhost backend"
    wt --window 0 new-tab --profile "PowerShell" --tabColor $crimson --title "Backend" --startingDirectory $backendDir $pwsh -ExecutionPolicy RemoteSigned -Command "dotnet watch --project api --launch-profile https"
}
New-Alias game-start-backend Start-GameBackend

function Remove-FrontendPortUsage([string]$Port = "5173") {
    # Ideally I should leverage Invoke-AsAdmin from kj-invoke.psm1 after I figured out
    # how to capture the output of the elevated netstat command and return it for post-processing.
    # https://stackoverflow.com/questions/8761888/capturing-standard-out-and-error-with-start-process

    # Execute netstat command and capture output
    $netstatOutput = netstat -abno

    # Filter for lines containing :5173
    $filteredLine = $netstatOutput | Select-String ":$Port"

    # Extract the number using regex
    if ($null -ne $filteredLine) {
        if ($filteredLine.Line -match '\s+(\d+)$') {
            $extractedNumber = $matches[1]
            Write-Output "Going to kill PID: $extractedNumber"
            Stop-Process $extractedNumber
            Write-Output "Killed PID: $extractedNumber"
        } else {
            Write-Output "Number not found in the line."
        }
    } else {
        Write-Output ":$Port not found in netstat output."
    }
}
New-Alias game-clear-frontend-port Remove-FrontendPortUsage

# Docs researched while writing this script:
# https://stackoverflow.com/questions/67166275/how-to-open-new-tab-with-running-specific-command-in-powershell-windows-termina
# https://github.com/microsoft/terminal/issues/9895#issuecomment-823199630
# https://learn.microsoft.com/en-us/windows/terminal/command-line-arguments?tabs=windows
# https://learn.microsoft.com/en-us/windows/terminal/customize-settings/profile-advanced
# https://learn.microsoft.com/en-us/windows/terminal/tips-and-tricks
# https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_powershell_exe?view=powershell-5.1
