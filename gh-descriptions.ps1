# Adds descriptions and topics to the repos that already exist but show up blank.
# Run from anywhere:   .\gh-descriptions.ps1

$ErrorActionPreference = "Stop"

gh auth status
if ($LASTEXITCODE -ne 0) { Write-Host "Run 'gh auth login' first." -ForegroundColor Red; exit 1 }

gh repo edit codinglamine/realpong-agent-lamine `
  --description "Reinforcement-learning agents for the RealPong arena. Two CNN policies (~1.7M params) trained by distilling a strong opponent, then PPO self-play against a pool of past selves with a pure win/loss reward." `
  --add-topic reinforcement-learning --add-topic pytorch --add-topic ppo --add-topic self-play --add-topic atari

gh repo edit codinglamine/realpong-arena-lamine `
  --description "Tournament arena used to evaluate the RealPong agents head-to-head." `
  --add-topic reinforcement-learning --add-topic pytorch

gh repo edit codinglamine/heydia-site `
  --add-topic ai-assistant --add-topic local-first --add-topic privacy

gh repo edit codinglamine/Marvel-Character-Recognizer-AI `
  --description "Image classifier that identifies Marvel characters from a photo." `
  --add-topic computer-vision --add-topic python

gh repo edit codinglamine/AI-Poster-Movie-recognizer `
  --description "Image classifier that identifies a film from its poster." `
  --add-topic computer-vision --add-topic python

Write-Host ""
Write-Host "Done. Check https://github.com/codinglamine?tab=repositories" -ForegroundColor Green
