    document.addEventListener('DOMContentLoaded', () => {
      const canvas = document.getElementById('game-canvas');
      const ctx = canvas.getContext('2d');

      const container = document.getElementById('game-container');
      const startScreen = document.getElementById('start-screen');
      const gameOverScreen = document.getElementById('game-over-screen');
      const winnerText = document.getElementById('winner-text');
      const startBtn = document.getElementById('start-btn');
      const vsComputerBtn = document.getElementById('vs-computer-btn');
      const playAgainBtn = document.getElementById('play-again-btn');
      const mainMenuBtn = document.getElementById('main-menu-btn');

      const player1ScoreElement = document.getElementById('player1-score');
      const player2ScoreElement = document.getElementById('player2-score');

      let gameRunning = false;
      let vsComputer = false;

      function resizeCanvas() {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
      }
      window.addEventListener('resize', resizeCanvas);
      resizeCanvas();

      const ball = {
        x: 0,
        y: 0,
        radius: 10,
        speed: 0.01,
        dx: 0.01,
        dy: 0.01,
        reset() {
          this.x = canvas.width / 2;
          this.y = canvas.height / 2;
          this.dx = (Math.random() > 0.5 ? 1 : -1) * canvas.width * this.speed;
          this.dy = (Math.random() > 0.5 ? 1 : -1) * canvas.height * this.speed;
        }
      };

      const paddleWidth = canvas.width * 0.015;
      const paddleHeight = canvas.height * 0.2;

      const player1 = {
        x: canvas.width * 0.03,
        y: canvas.height / 2 - paddleHeight / 2,
        width: paddleWidth,
        height: paddleHeight,
        speed: canvas.height * 0.04,
        upPressed: false,
        downPressed: false,
        score: 0
      };

      const player2 = {
        x: canvas.width - paddleWidth - canvas.width * 0.03,
        y: canvas.height / 2 - paddleHeight / 2,
        width: paddleWidth,
        height: paddleHeight,
        speed: canvas.height * 0.04,
        upPressed: false,
        downPressed: false,
        score: 0
      };

      const winningScore = 5;

      function updatePlayers() {
        player1.speed = canvas.height * 0.04;
        player2.speed = canvas.height * 0.04;
        player1.height = canvas.height * 0.2;
        player2.height = canvas.height * 0.2;
        player1.width = player2.width = canvas.width * 0.015;
        player1.x = canvas.width * 0.03;
        player2.x = canvas.width - player2.width - canvas.width * 0.03;
      }

      function resetGame() {
        player1.score = 0;
        player2.score = 0;
        player1ScoreElement.textContent = '0';
        player2ScoreElement.textContent = '0';
        updatePlayers();
        ball.reset();
        player1.y = player2.y = canvas.height / 2 - player1.height / 2;
      }

      function startGame(isAI) {
        vsComputer = isAI;
        gameRunning = true;
        startScreen.style.display = 'none';
        gameOverScreen.style.display = 'none';
        if (window.innerWidth < 768) {
          document.getElementById('mobile-controls').style.display = 'flex';
        }
        resetGame();
        gameLoop();
      }

      function endGame(winner) {
        gameRunning = false;
        winnerText.textContent = `${winner} Wins!`;
        gameOverScreen.style.display = 'flex';
      }

      function update() {
        // Move players
        player1.y += player1.upPressed ? -player1.speed : player1.downPressed ? player1.speed : 0;
        if (!vsComputer) {
          player2.y += player2.upPressed ? -player2.speed : player2.downPressed ? player2.speed : 0;
        } else {
          const target = ball.y - player2.height / 2;
          player2.y += target > player2.y ? player2.speed * 0.6 : -player2.speed * 0.6;
        }

        // Boundary checks
        [player1, player2].forEach(p => {
          if (p.y < 0) p.y = 0;
          if (p.y + p.height > canvas.height) p.y = canvas.height - p.height;
        });

        // Move ball
        ball.x += ball.dx;
        ball.y += ball.dy;

        if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
          ball.dy = -ball.dy;
        }

        const checkCollision = (p, reverse) => {
          if (
            ball.x + ball.radius > p.x &&
            ball.x - ball.radius < p.x + p.width &&
            ball.y > p.y &&
            ball.y < p.y + p.height
          ) {
            const relY = ball.y - (p.y + p.height / 2);
            const norm = relY / (p.height / 2);
            const angle = norm * (Math.PI / 4);
            ball.dx = (reverse ? -1 : 1) * Math.abs(ball.dx) * 1.05;
            ball.dy = ball.speed * canvas.height * Math.sin(angle);
            ball.x = reverse ? p.x - ball.radius : p.x + p.width + ball.radius;
          }
        };

        checkCollision(player1, false);
        checkCollision(player2, true);

        if (ball.x < 0) {
          player2.score++;
          player2ScoreElement.textContent = player2.score;
          player2.score >= winningScore ? endGame(vsComputer ? 'Computer' : 'Player 2') : ball.reset();
        } else if (ball.x > canvas.width) {
          player1.score++;
          player1ScoreElement.textContent = player1.score;
          player1.score >= winningScore ? endGame('Player 1') : ball.reset();
        }
      }

      function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw center line
        ctx.setLineDash([10, 10]);
        ctx.strokeStyle = 'white';
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, 0);
        ctx.lineTo(canvas.width / 2, canvas.height);
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw paddles and ball
        ctx.fillStyle = '#fff';
        ctx.fillRect(player1.x, player1.y, player1.width, player1.height);
        ctx.fillRect(player2.x, player2.y, player2.width, player2.height);

        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      function gameLoop() {
        if (gameRunning) {
          update();
          draw();
          requestAnimationFrame(gameLoop);
        }
      }

      // Event Listeners
      document.addEventListener('keydown', e => {
        if (e.key === 'w') player1.upPressed = true;
        if (e.key === 's') player1.downPressed = true;
        if (e.key === 'ArrowUp') player2.upPressed = true;
        if (e.key === 'ArrowDown') player2.downPressed = true;
      });

      document.addEventListener('keyup', e => {
        if (e.key === 'w') player1.upPressed = false;
        if (e.key === 's') player1.downPressed = false;
        if (e.key === 'ArrowUp') player2.upPressed = false;
        if (e.key === 'ArrowDown') player2.downPressed = false;
      });

      startBtn.onclick = () => startGame(false);
      vsComputerBtn.onclick = () => startGame(true);
      playAgainBtn.onclick = () => startGame(vsComputer);
      mainMenuBtn.onclick = () => {
        gameOverScreen.style.display = 'none';
        startScreen.style.display = 'flex';
        document.getElementById('mobile-controls').style.display = 'none';
      };
    });