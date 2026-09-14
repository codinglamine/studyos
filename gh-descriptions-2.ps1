# Round two: the repos the first script did not cover, plus two corrections.
# Run from anywhere:   .\gh-descriptions-2.ps1

$ErrorActionPreference = "Stop"
gh auth status
if ($LASTEXITCODE -ne 0) { Write-Host "Run 'gh auth login' first." -ForegroundColor Red; exit 1 }

# --- corrections to round one -------------------------------------------------

# the arena is yours and it solves a real problem; say so
gh repo edit codinglamine/realpong-arena-lamine `
  --description "Dockerised tournament arena for two-player Atari Pong from pixels. Alternates sides between games and reports per-game scores, win rate and rolling accuracy live. Docker because multi-agent-ale-py has no Windows wheel." `
  --add-topic docker --add-topic atari --add-topic pettingzoo

# it works both directions, not just poster -> film
gh repo edit codinglamine/AI-Poster-Movie-recognizer `
  --description "Identifies a film from its poster, and finds posters from a film title."

gh repo edit codinglamine/Marvel-Character-Recognizer-AI `
  --description "Image classifier that recognises major Marvel and MCU characters in a photo."

# --- not covered before -------------------------------------------------------

gh repo edit codinglamine/Scratch-Meteor-Game `
  --description "Scratch arcade game: dodge falling meteors across three lives, with meteor speed ramping at scores 3, 5 and 20. Built with custom blocks, clones and variables." `
  --add-topic scratch --add-topic game

gh repo edit codinglamine/CS50x-Scratch-Prob-Set-1 `
  --description "CS50x Problem Set 0 - the Scratch submission." `
  --add-topic cs50x --add-topic scratch

gh repo edit codinglamine/tic-tac-toe-ai `
  --description "Two-player Tic-Tac-Toe in the terminal. An early Python exercise." `
  --add-topic python

gh repo edit codinglamine/tournament `
  --description "Fork of the Pong tournament environment used for the competition: the arena, the reference agent and the submission template. Upstream code, not mine." `
  --add-topic reinforcement-learning

Write-Host ""
Write-Host "Done. https://github.com/codinglamine?tab=repositories" -ForegroundColor Green
Write-Host ""
Write-Host "Three things I did NOT do, because they are your call:" -ForegroundColor Yellow
Write-Host "  1. tic-tac-toe-ai has no AI in it - it is a two-player terminal game."
Write-Host "     Rename it:  gh repo rename tic-tac-toe --repo codinglamine/tic-tac-toe-ai"
Write-Host "  2. CS50x-Scratch-Prob-Set-1 has no README and looks like a duplicate of"
Write-Host "     Scratch-Meteor-Game. Either add a README or delete it."
Write-Host "  3. codinglamine/skills is an unmodified fork of anthropics/skills."
Write-Host "     A fork you have not changed adds nothing to the account - consider deleting."
