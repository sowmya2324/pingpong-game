document.addEventListener("DOMContentLoaded", function () {
      const canvas = document.getElementById("game-canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = 800;
      canvas.height = 500;

      const player1ScoreElement = document.getElementById("player1-score");
      const player2ScoreElement = document.getElementById("player2-score");
      const startScreen = document.getElementById("start-screen");
      const gameOverScreen = document.getElementById("game-over-screen");
      const winnerText = document.getElementById("winner-text");

      const startBtn = document.getElementById("start-btn");
      const vsComputerBtn = document.getElementById("vs-computer-btn");
      const playAgainBtn = document.getElementById("play-again-btn");
      const mainMenuBtn = document.getElementById("main-menu-btn");

      let gameRunning = false;
      let vsComputer = false;
      const winningScore = 5;

      const ball = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        radius: 10,
        speed: 5,
        dx: 4,
        dy: 4,
        reset() {
          this.x = canvas.width / 2;
          this.y = canvas.height / 2;
          this.dx = this.speed * (Math.random() > 0.5 ? 1 : -1);
          this.dy = this.speed * (Math.random() > 0.5 ? 1 : -1);
        },
      };

      const paddleHeight = 100;
      const paddleWidth = 15;

      const player1 = {
        x: 20,
        y: canvas.height / 2 - paddleHeight / 2,
        width: paddleWidth,
        height: paddleHeight,
        speed: 8,
        dy: 0,
        upPressed: false,
        downPressed: false,
        score: 0,
      };

      const player2 = {
        x: canvas.width - 20 - paddleWidth,
        y: canvas.height / 2 - paddleHeight / 2,
        width: paddleWidth,
        height: paddleHeight,
        speed: 8,
        dy: 0,
        upPressed: false,
        downPressed: false,
        score: 0,
      };

      // Event listeners
      startBtn.onclick = () => { vsComputer = false; startGame(); };
      vsComputerBtn.onclick = () => { vsComputer = true; startGame(); };
      playAgainBtn.onclick = () => { gameOverScreen.style.display = 'none'; resetGame(); requestAnimationFrame(gameLoop); };
      mainMenuBtn.onclick = () => { gameOverScreen.style.display = 'none'; startScreen.style.display = 'flex'; };

      document.addEventListener("keydown", (e) => {
        if (!gameRunning) return;
        if (e.key === "w") player1.upPressed = true;
        if (e.key === "s") player1.downPressed = true;
        if (!vsComputer) {
          if (e.key === "ArrowUp") player2.upPressed = true;
          if (e.key === "ArrowDown") player2.downPressed = true;
        }
      });

      document.addEventListener("keyup", (e) => {
        if (e.key === "w") player1.upPressed = false;
        if (e.key === "s") player1.downPressed = false;
        if (e.key === "ArrowUp") player2.upPressed = false;
        if (e.key === "ArrowDown") player2.downPressed = false;
      });

      // Touch controls
      function setHold(button, onPress, onRelease) {
        let interval;
        button.addEventListener("touchstart", (e) => {
          e.preventDefault();
          onPress();
          interval = setInterval(onPress, 50);
        });
        button.addEventListener("touchend", (e) => {
          clearInterval(interval);
          onRelease();
        });
      }

      setHold(document.getElementById("p1-up"), () => player1.upPressed = true, () => player1.upPressed = false);
      setHold(document.getElementById("p1-down"), () => player1.downPressed = true, () => player1.downPressed = false);
      setHold(document.getElementById("p2-up"), () => player2.upPressed = true, () => player2.upPressed = false);
      setHold(document.getElementById("p2-down"), () => player2.downPressed = true, () => player2.downPressed = false);

      function startGame() {
        gameRunning = true;
        startScreen.style.display = "none";
        gameOverScreen.style.display = "none";
        resetGame();
        requestAnimationFrame(gameLoop);
      }

      function resetGame() {
        player1.score = 0;
        player2.score = 0;
        player1ScoreElement.textContent = "0";
        player2ScoreElement.textContent = "0";
        ball.reset();
        player1.y = canvas.height / 2 - player1.height / 2;
        player2.y = canvas.height / 2 - player2.height / 2;
      }

      function endGame(winner) {
        gameRunning = false;
        winnerText.textContent = ${winner} Wins!;
        gameOverScreen.style.display = "flex";
      }

      function update() {
        player1.dy = player1.upPressed ? -player1.speed : player1.downPressed ? player1.speed : 0;
        player2.dy = player2.upPressed ? -player2.speed : player2.downPressed ? player2.speed : 0;

        if (vsComputer) {
          const center = player2.y + player2.height / 2;
          if (center < ball.y - 10) player2.dy = player2.speed;
          else if (center > ball.y + 10) player2.dy = -player2.speed;
          else player2.dy = 0;
        }

        player1.y += player1.dy;
        player2.y += player2.dy;

        player1.y = Math.max(0, Math.min(canvas.height - player1.height, player1.y));
        player2.y = Math.max(0, Math.min(canvas.height - player2.height, player2.y));

        ball.x += ball.dx;
        ball.y += ball.dy;

        if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) ball.dy *= -1;

        if (ball.x - ball.radius < player1.x + player1.width &&
            ball.y > player1.y && ball.y < player1.y + player1.height) {
          ball.dx = Math.abs(ball.dx) * 1.05;
          ball.x = player1.x + player1.width + ball.radius;
        }

        if (ball.x + ball.radius > player2.x &&
            ball.y > player2.y && ball.y < player2.y + player2.height) {
          ball.dx = -Math.abs(ball.dx) * 1.05;
          ball.x = player2.x - ball.radius;
        }

        if (ball.x - ball.radius < 0) {
          player2.score++;
          player2ScoreElement.textContent = player2.score;
          if (player2.score >= winningScore) endGame(vsComputer ? "Computer" : "Player 2");
          else ball.reset();
        } else if (ball.x + ball.radius > canvas.width) {
          player1.score++;
          player1ScoreElement.textContent = player1.score;
          if (player1.score >= winningScore) endGame("Player 1");
          else ball.reset();
        }
      }

      function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#fff";
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

      ball.reset();
    });
