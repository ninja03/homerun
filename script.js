document.addEventListener("DOMContentLoaded", () => {
  // キャンバスとコンテキストの取得
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");

  // 要素の取得
  const bat = document.getElementById("bat");
  const pitchCountElement = document.getElementById("pitch-count");
  const hitCountElement = document.getElementById("hit-count");
  const flightDistanceElement = document.getElementById("flight-distance");
  const gameMessageElement = document.getElementById("game-message");

  // プレイヤー画像の読み込み
  const playerImage = document.getElementById("player");

  // ゲーム状態
  let gameState = {
    pitchCount: 0,
    hitCount: 0,
    isGameOver: false,
    isBallInPlay: false,
    isSwinging: false,
    ball: null,
    animationId: null,
    endGameCalled: false, // ゲーム終了処理が呼び出されたかどうかを追跡
    lastSwingTime: 0, // 最後にバットを振った時刻
  };

  // ボールクラス
  class Ball {
    constructor() {
      this.x = canvas.width / 2;
      this.y = -20; // 画面外から開始
      this.radius = 20; // ボールの大きさをさらに大きくする
      this.speed = 2; // 速度をさらに遅くする
      this.isHit = false;
      this.hitAngle = 0;
      this.hitPower = 0;
      this.distance = 0;
    }

    update() {
      if (!this.isHit) {
        // 通常の落下
        this.y += this.speed;
      } else {
        // ヒット後の飛行
        this.x += Math.cos(this.hitAngle) * this.hitPower;
        this.y -= Math.sin(this.hitAngle) * this.hitPower;

        // 飛距離の計算（単純な移動距離）
        this.distance = Math.sqrt(
          Math.pow(this.x - canvas.width / 2, 2) +
            Math.pow(this.y - (canvas.height - 100), 2),
        );
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = "yellow"; // ボールの色を黄色に変更
      ctx.fill();
      ctx.strokeStyle = "#333";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.closePath();
    }

    isInHitZone() {
      // バットの位置（プレイヤーの少し上）でのヒット判定
      // 判定範囲をさらに広げる
      return this.y >= canvas.height - 200 && this.y <= canvas.height - 100;
    }

    isOutOfBounds() {
      return this.y > canvas.height || this.x < 0 || this.x > canvas.width ||
        this.y < -50;
    }
  }

  // ゲームの初期化
  function initGame() {
    gameState = {
      pitchCount: 0,
      hitCount: 0,
      isGameOver: false,
      isBallInPlay: false,
      isSwinging: false,
      ball: null,
      animationId: null,
      endGameCalled: false,
      lastSwingTime: 0,
    };

    updateStats();
    flightDistanceElement.textContent = "";
    gameMessageElement.textContent = "";
    gameMessageElement.innerHTML = ""; // 再開ボタンを確実に削除

    // 最初の投球を開始
    throwBall();
  }

  // 投球
  function throwBall() {
    // 投球数が10に達したら、ゲーム終了
    if (gameState.pitchCount >= 10) {
      // 10球目が終わったらゲーム終了
      forceEndGame();
      return;
    }

    gameState.pitchCount++;
    gameState.isBallInPlay = true;
    gameState.ball = new Ball();
    updateStats();

    // 投球数が10に達したら、このボールが最後であることを表示
    if (gameState.pitchCount >= 10) {
      console.log("最後の投球です！");
      // 最後の投球後、少し待ってからゲーム終了
      setTimeout(forceEndGame, 2000);
    }
  }

  // バットをスイング
  function swingBat() {
    if (gameState.isSwinging || gameState.isGameOver) return;

    gameState.isSwinging = true;
    gameState.lastSwingTime = Date.now(); // 現在の時刻を記録
    bat.classList.add("swing");

    // スイング後、バットを元の位置に戻す
    setTimeout(() => {
      bat.classList.remove("swing");
      gameState.isSwinging = false;
    }, 300);
  }

  // ボールをヒット
  function hitBall() {
    gameState.ball.isHit = true;
    gameState.hitCount++;
    updateStats();

    // ランダムな角度と力でボールを飛ばす
    gameState.ball.hitAngle = Math.PI / 4 + (Math.random() * Math.PI / 4); // 45〜90度
    gameState.ball.hitPower = 10 + Math.random() * 10; // 10〜20の力

    // ヒット効果音の代わりにコンソールに表示
    console.log("ホームラン！");

    // 3ヒット達成したらゲームクリア条件を満たしたことを表示
    if (gameState.hitCount >= 3 && !gameState.endGameCalled) {
      console.log("ゲームクリア条件達成！");
    }
  }

  // 統計情報の更新
  function updateStats() {
    pitchCountElement.textContent = `投球: ${gameState.pitchCount} / 10`;
    hitCountElement.textContent = `ホームラン: ${gameState.hitCount} / 3`;
  }

  // 強制的にゲーム終了
  function forceEndGame() {
    if (!gameState.endGameCalled) {
      gameState.endGameCalled = true;
      console.log("ゲーム強制終了！");

      // ボールの動きを停止
      gameState.isBallInPlay = false;

      // ゲーム終了処理を実行
      endGame();
    }
  }

  // ゲームの終了
  function endGame() {
    console.log("ゲーム終了処理実行！");
    gameState.isGameOver = true;
    cancelAnimationFrame(gameState.animationId); // アニメーションを確実に停止

    // ゲーム終了メッセージを表示
    let message = "";
    if (gameState.hitCount >= 3) {
      message = "ゲームクリア！おめでとう！";
    } else {
      message = "ゲームオーバー！もう一度挑戦しよう！";
    }

    // ゲームキャンバスを描画停止
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // プレイヤーの描画
    ctx.drawImage(
      playerImage,
      canvas.width / 2 - 50,
      canvas.height - 120,
      100,
      100,
    );

    // 既存のコンテンツをクリア
    gameMessageElement.innerHTML = "";

    // 目立つエフェクトを追加
    gameMessageElement.style.backgroundColor = "#f8f8f8";
    gameMessageElement.style.padding = "20px";
    gameMessageElement.style.borderRadius = "10px";
    gameMessageElement.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.1)";

    // メッセージを表示
    const messageText = document.createElement("div");
    messageText.textContent = message;
    messageText.style.fontSize = "28px";
    messageText.style.fontWeight = "bold";
    messageText.style.marginBottom = "20px";
    messageText.style.color = gameState.hitCount >= 3 ? "#4CAF50" : "#FF6347";
    gameMessageElement.appendChild(messageText);

    // 飛距離の合計を表示
    if (gameState.hitCount > 0) {
      const distanceText = document.createElement("div");
      distanceText.textContent = `合計飛距離: ${
        flightDistanceElement.textContent.replace("飛距離: ", "")
      }`;
      distanceText.style.fontSize = "20px";
      distanceText.style.marginBottom = "20px";
      gameMessageElement.appendChild(distanceText);
    }

    // 再開ボタンを作成
    const restartButton = document.createElement("button");
    restartButton.textContent = "もう一度プレイ";
    restartButton.style.padding = "12px 24px";
    restartButton.style.fontSize = "20px";
    restartButton.style.backgroundColor = "#4CAF50";
    restartButton.style.color = "white";
    restartButton.style.border = "none";
    restartButton.style.borderRadius = "5px";
    restartButton.style.cursor = "pointer";
    restartButton.style.transition = "background-color 0.3s";

    // ホバーエフェクト
    restartButton.onmouseover = () => {
      restartButton.style.backgroundColor = "#45a049";
    };
    restartButton.onmouseout = () => {
      restartButton.style.backgroundColor = "#4CAF50";
    };

    restartButton.addEventListener("click", () => {
      // ゲームを再開
      initGame();
    });

    gameMessageElement.appendChild(restartButton);

    // 要素を確実に表示させるためのトリック
    setTimeout(() => {
      // スクロールして確実に見えるようにする
      gameMessageElement.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }

  // ゲームループ
  function gameLoop() {
    // キャンバスをクリア
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // プレイヤーの描画
    ctx.drawImage(
      playerImage,
      canvas.width / 2 - 50,
      canvas.height - 120,
      100,
      100,
    );

    // ボールの更新と描画
    if (gameState.isBallInPlay) {
      gameState.ball.update();
      gameState.ball.draw();

      // ボールがまだヒットされておらず、ヒットゾーンにある場合、直近のスイングをチェック
      if (!gameState.ball.isHit && gameState.ball.isInHitZone()) {
        const currentTime = Date.now();
        const swingTimeDiff = currentTime - gameState.lastSwingTime;
        
        // 300ms以内にスイングしていればヒット判定
        if (swingTimeDiff <= 300) {
          hitBall();
        }
      }

      // ボールが画面外に出たら新しい投球を開始
      if (gameState.ball.isOutOfBounds()) {
        if (gameState.ball.isHit) {
          // 飛距離を表示
          const distance = Math.floor(gameState.ball.distance / 10);
          flightDistanceElement.textContent = `飛距離: ${distance} メートル！`;
        }

        gameState.isBallInPlay = false;

        // 投球数が10未満なら次の投球、10以上ならゲーム終了
        if (gameState.pitchCount < 10) {
          setTimeout(throwBall, 1500);
        } else {
          // 10球目が終わったらゲーム終了
          setTimeout(forceEndGame, 500);
        }
      }
    }

    // ゲームが終了していなければループを続ける
    if (!gameState.isGameOver) {
      gameState.animationId = requestAnimationFrame(gameLoop);
    }
  }

  // クリックイベントの設定
  canvas.addEventListener("click", swingBat);

  // ゲーム開始
  initGame();
  gameLoop();
});
