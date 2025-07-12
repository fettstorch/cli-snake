# Terminal Snake Game 🐍

A simple terminal-based Snake game. Enjoy!

<img src="https://github.com/user-attachments/assets/8734ee76-5697-47b2-9cef-268225ece162" width="300" />

## Getting Started 
```bash
npm i @fettstorch/snake -g
```
OR
```bash
npx @fettstorch/snake
```

## How to Play
- Use ←↑↓→ or WASD to control the snake
- Eat flies (%) to grow
- Avoid hitting walls and yourself

### Patch Notes (v1.0.0 🎉)
- Added a global leaderboard
- Added a sleep factor for vertical movement so that vertical/horizontal movement is roughly equal (not perfect due to the inability to actually read out a terminal's character/font aspect ratio)
- Added a score multiplier. The more flies are currently being swallowed the more points you get. This rewards ideal pathing.
- Added input buffering in order to make the controls more responsive. This should prevent losing very quickly executed inputs.

## Deployment

For instructions on how to deploy the serverless functions, please see the [web/README.md](./web/README.md).


