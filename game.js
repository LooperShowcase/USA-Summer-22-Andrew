kaboom({
  global: true,
  fullscreen: true,
  scale: 2,
  clearColor: [0, 0, 1, 0.7],
});

loadRoot("./sprites/");
loadSprite("mario", "mario.png");
loadSprite("coin", "coin.png");
loadSprite("goomba", "evil_mushroom.png");
loadSprite("block", "block.png");
loadSprite("surprise", "surprise.png");
loadSprite("unboxed", "unboxed.png");
loadSprite("mushroom", "mushroom.png");
loadSound("gameSound", "gameSound.mp3");
loadSound("jumpSound", "jumpSound.mp3");
loadSprite("castle", "castle.png");
///////////////////////////////
scene("lose", () => {
  add([
    text("U suck\n press r to restart", 32),
    pos(width() / 2, height() / 2),
    origin("center"),
  ]);
  keyPress("r", () => {
    go("game");
  });
});
////////////////////////////////////
scene("win", (score) => {
  add([
    text("U won the gameeeee\n press r to restart\nScore:" + score, 32),
    pos(width() / 2, height() / 2),
    origin("center"),
  ]);
  keyPress("r", () => {
    go("game");
  });
});
scene("start", () => {
  add([
    text("welcome", 42),
    pos(width() / 2, height() / 2 - 100),
    origin("center"),
  ]);
  const button = add([
    rect(150, 50),
    pos(width() / 2, height() / 2),
    origin("center"),
  ]);
  add([
    text("start", 28),
    pos(width() / 2, height() / 2),
    origin("center"),
    color(0, 0, 0),
  ]);
  button.action(() => {
    if (button.isHovered()) {
      button.color = rgb(0.5, 0.5, 0.5);
      if (mouseIsClicked()) {
        go("game");
      } else {
        button.color = rgb(1, 1, 1);
      }
    }
  });
});
//////////////////////////////
scene("game", () => {
  layers(["bg", "obj", "ui"]);
  const map = [
    "                              ",
    "                              ",
    "            ===     ====             ",
    "                        ===      ",
    "     ==   ==                      ",
    "            =      =            ",
    "           =      =       ===   @  ",
    "    $   = =    $     ===            ",
    "     = =   $    = ====?          ",
    "  = =  ^      ^^^^   =                   ",
    "======================================",
  ];
  play("gameSound");
  const moveSpeed = 120;
  const jumpForce = 400;
  let isJumping = false;
  let isBig = false;
  const mapSymbols = {
    width: 20,
    height: 20,

    "=": [sprite("block"), solid()],
    $: [sprite("surprise"), solid(), "surprise-coin"],
    "?": [sprite("surprise"), solid(), "surprise-mushroom"],
    C: [sprite("coin"), "coin"],
    V: [sprite("unboxed"), solid(), "unboxed"],
    M: [sprite("mushroom"), "mushroom", body()],
    "^": [sprite("goomba"), "goomba", body(), solid()],
    "@": [sprite("castle"), "castle"],
  };
  const gameLevel = addLevel(map, mapSymbols);
  const player = add([
    sprite("mario"),
    solid(),
    pos(30, 0),
    body(),
    origin("bot"),
    big(jumpForce),
  ]);
  let score = 0;
  const scoreLabel = add([
    text("Score:" + score),
    pos(player.pos.x, player.pos.y - 50),
    layer("ui"),
    {
      value: score,
    },
  ]);

  keyDown("right", () => {
    player.move(moveSpeed, 0);
  });

  keyDown("left", () => {
    player.move(-moveSpeed, 0);
  });
  keyDown("up", () => {
    if (player.grounded()) {
      isJumping = true;
      player.jump(400);
    }
  });
  player.on("headbump", (obj) => {
    if (obj.is("surprise-coin")) {
      gameLevel.spawn("C", obj.gridPos.sub(0, 1));
      destroy(obj);
      gameLevel.spawn("V", obj.gridPos);
    }
    if (obj.is("surprise-mushroom")) {
      gameLevel.spawn("M", obj.gridPos.sub(0, 1));
      destroy(obj);
      gameLevel.spawn("V", obj.gridPos);
    }
  });
  player.collides("coin", (obj) => {
    destroy(obj);
    scoreLabel.value += 100;
    scoreLabel.text = "Score: " + scoreLabel.value;
  });
  player.collides("mushroom", (obj) => {
    destroy(obj);
    player.biggify(10);
    isBig = true;
  });
  player.collides("goomba", (obj) => {
    if (isJumping) {
      destroy(obj);
    } else {
      if (isBig) {
        destroy(obj);
        player.smallify();
      } else {
        destroy(player);
        go("lose");
      }
    }
  });

  action("mushroom", (x) => {
    x.move(20, 0);
  });

  action("goomba", (x) => {
    x.move(20, 0);
  });

  player.action(() => {
    camPos(player.pos);
    if (player.grounded()) {
      isJumping = false;
    } else {
      isJumping = true;
    }
    if (player.pos.x > 641.9845199999993) {
      go("win", scoreLabel.value);
    }
  });
});

start("start");
