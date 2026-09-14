# Pushes studyos, then adds first-attempt/ to realpong-agent-lamine.
# Logs everything to push-log.txt so failures are visible.
# Run from the studyos folder:   .\fix-push.ps1

Set-Location $PSScriptRoot
$log = Join-Path $PSScriptRoot "push-log.txt"
"=== run $(Get-Date -Format o) ===" | Out-File $log

function Step($label, [scriptblock]$block) {
    "`n--- $label ---" | Out-File $log -Append
    try   { & $block 2>&1 | Out-File $log -Append; "exit: $LASTEXITCODE" | Out-File $log -Append }
    catch { "EXCEPTION: $_" | Out-File $log -Append }
    Write-Host "$label -> done" -ForegroundColor Cyan
}

Step "versions"   { git --version; gh --version }
Step "gh auth"    { gh auth status }

# git identity — set it locally for these repos if it is missing
$name  = (git config user.name)
$email = (git config user.email)
"user.name = '$name'  user.email = '$email'" | Out-File $log -Append
if (-not $name)  { Step "set name"  { git config user.name  "codinglamine" } }
if (-not $email) { Step "set email" { git config user.email "ahmadou.lamine2019@gmail.com" } }

# ---------- studyos ----------
Step "add"        { git add -A }

$staged = git diff --cached --name-only
$leaks  = $staged | Where-Object { $_ -match '(^|/)\.env$' -or $_ -match '(^|/)\.env\.(?!example)' }
"staged file count: $($staged.Count)" | Out-File $log -Append
$staged | Out-File $log -Append
if ($leaks) {
    "ABORTED - secrets staged:" | Out-File $log -Append
    $leaks | Out-File $log -Append
    Write-Host "ABORTED - a .env was staged. See push-log.txt" -ForegroundColor Red
    exit 1
}

Step "commit"     { git commit -m "Initial commit: StudyOS" -m "Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>" -m "Claude-Session: https://claude.ai/code/session_01PiozadYnm6b1zSnBEhSPbD" }
Step "branch"     { git branch -M main }
Step "repo create" { gh repo create studyos --public --source . --remote origin --push --description "Study and productivity app for the IB Diploma - assignments, grades, EE/TOK/IA tracking, time tracking and an AI study helper. React 19 + Express + Anthropic API." }
Step "topics"     { gh repo edit codinglamine/studyos --add-topic ib --add-topic react --add-topic typescript --add-topic productivity }

# ---------- first attempt ----------
$src  = "$env:USERPROFILE\Downloads\Real Pong"
$work = Join-Path $env:TEMP "realpong-agent-lamine"
if (Test-Path $work) { Remove-Item $work -Recurse -Force }

Step "clone arena repo" { git clone https://github.com/codinglamine/realpong-agent-lamine.git $work }

if (Test-Path $work) {
    $dest = Join-Path $work "first-attempt"
    New-Item -ItemType Directory -Path $dest -Force | Out-Null
    foreach ($f in "train_realpong_ale.py","agent_ale.py","realpong.py","promote_to_realpong.py","realpong_ale_log.csv","realpong_ale_out.txt") {
        Copy-Item (Join-Path $src $f) $dest -ErrorAction SilentlyContinue
    }
    Copy-Item (Join-Path $src "FIRST-ATTEMPT-README.md") (Join-Path $dest "README.md") -ErrorAction SilentlyContinue

    $top = Join-Path $work "README.md"
    if (-not (Select-String -Path $top -Pattern "the attempt that failed" -Quiet -ErrorAction SilentlyContinue)) {
        Add-Content $top "`n## Before this: the attempt that failed`n`nA policy-gradient agent, and the three findings that produced the network above - a selection criterion that rewarded ball-tracking instead of scoring, an environment that would not build, and a network far too small for the opponent. The code and the full training log are in [``first-attempt/``](first-attempt/).`n"
    }

    Push-Location $work
    Step "commit first-attempt" { git add -A; git commit -m "Add first-attempt/: the policy-gradient version and why it was replaced" -m "125 episodes, 0 games won, mean score -20.4 to -19.8." -m "Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>" }
    Step "push first-attempt"   { git push }
    Pop-Location
    Remove-Item $work -Recurse -Force -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "Finished. Log written to push-log.txt" -ForegroundColor Green
