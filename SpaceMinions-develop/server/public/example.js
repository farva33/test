var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#2d2d2d',
    parent: 'phaser-example',
    physics: {
        default: 'arcade',
        arcade: { debug: true }
    },
    scene: {
        preload: preload,
        create: create,
        update: update

    }
    
};

var bullets;
var ship;
var badShip;
var speed;
var stats;
var cursors;
var lastFired = 0;
var mousePosition = new Phaser.Math.Vector2();
var mouseX;
var mouseY;
var isDown;
var socketIO;
var controls;
var players = {}

var bg;
var stars;
var ship;
var bullets;
var lastFired = 0;
var cursors;
var fire;

var game = new Phaser.Game(config);

function preload () {
    this.load.image('ship', 'assets/ship.png');
    this.load.image('badShip', 'assets/badship.png');
    this.load.image('bullet', 'assets/bomb.png');
    this.load.image('red', 'assets/flame1.png');
    this.load.image('background', 'assets/nebula.jpg');
    this.load.image('stars', 'assets/stars.png');
    this.load.atlas('space', 'assets/space.png', 'assets/space.json');
}

function create () {
    //this.physics.world.setBounds(0, 0, 1200 * 3, 800 * 3);
    socketIO = io();

    socketIO.on('currentPlayers', function(players, myID) {
        console.log("current players recieved" + JSON.stringify(players));
        //console.log("Size: " + players.length);
        for (player in players) {
            if (player != myID) {
                console.log("physics?? " + JSON.stringify(this.physics));

                //lol = this.physics.add.image(400, 500, 'badship').setDepth(1);
            }
            
         //   badShip = this.add.sprite(400, 500, 'badShip').setDepth(1);
            console.log("player: "+ JSON.stringify(player))
        }
    }, this);

    socketIO.on('newPlayer', function(socket) {
        console.log('a user connected');
    });
    

    var Bullet = new Phaser.Class({

        Extends: Phaser.GameObjects.Image,

        initialize:

        function Bullet (scene)
        {
            Phaser.GameObjects.Image.call(this, scene, 0, 0, 'bullet');

            this.speed = Phaser.Math.GetSpeed(400, 1);
        },

        fire: function (x, y)
        {
            this.setPosition(x, y - 50);

            this.setActive(true);
            this.setVisible(true);
        },

        update: function (time, delta)
        {
            this.y -= this.speed * delta;

            if (this.y < -50)
            {
                this.setActive(false);
                this.setVisible(false);
            }
        }

    });

    bullets = this.add.group({
        classType: Bullet,
        maxSize: 10,
        runChildUpdate: true
    });



    this.textures.addSpriteSheetFromAtlas('mine-sheet', { atlas: 'space', frame: 'mine', frameWidth: 64 });
    this.textures.addSpriteSheetFromAtlas('asteroid1-sheet', { atlas: 'space', frame: 'asteroid1', frameWidth: 96 });
    this.textures.addSpriteSheetFromAtlas('asteroid2-sheet', { atlas: 'space', frame: 'asteroid2', frameWidth: 96 });
    this.textures.addSpriteSheetFromAtlas('asteroid3-sheet', { atlas: 'space', frame: 'asteroid3', frameWidth: 96 });
    this.textures.addSpriteSheetFromAtlas('asteroid4-sheet', { atlas: 'space', frame: 'asteroid4', frameWidth: 64 });

    this.anims.create({ key: 'mine-anim', frames: this.anims.generateFrameNumbers('mine-sheet', { start: 0, end: 15 }), frameRate: 20, repeat: -1 });
    this.anims.create({ key: 'asteroid1-anim', frames: this.anims.generateFrameNumbers('asteroid1-sheet', { start: 0, end: 24 }), frameRate: 20, repeat: -1 });
    this.anims.create({ key: 'asteroid2-anim', frames: this.anims.generateFrameNumbers('asteroid2-sheet', { start: 0, end: 24 }), frameRate: 20, repeat: -1 });
    this.anims.create({ key: 'asteroid3-anim', frames: this.anims.generateFrameNumbers('asteroid3-sheet', { start: 0, end: 24 }), frameRate: 20, repeat: -1 });
    this.anims.create({ key: 'asteroid4-anim', frames: this.anims.generateFrameNumbers('asteroid4-sheet', { start: 0, end: 24 }), frameRate: 20, repeat: -1 });

    //  World size is 8000 x 6000

    bg = this.add.tileSprite(400, 300, 800, 600, 'background').setScrollFactor(0);

    //  Add our planets, etc

    this.add.image(512, 680, 'space', 'blue-planet').setOrigin(0).setScrollFactor(0.6);
    this.add.image(2833, 1246, 'space', 'brown-planet').setOrigin(0).setScrollFactor(0.6);
    this.add.image(3875, 531, 'space', 'sun').setOrigin(0).setScrollFactor(0.6);
    var galaxy = this.add.image(5345 + 1024, 327 + 1024, 'space', 'galaxy').setBlendMode(1).setScrollFactor(0.6);
    this.add.image(908, 3922, 'space', 'gas-giant').setOrigin(0).setScrollFactor(0.6);
    this.add.image(3140, 2974, 'space', 'brown-planet').setOrigin(0).setScrollFactor(0.6).setScale(0.8).setTint(0x882d2d);
    this.add.image(6052, 4280, 'space', 'purple-planet').setOrigin(0).setScrollFactor(0.6);

    for (var i = 0; i < 8; i++)
    {
        this.add.image(Phaser.Math.Between(0, 8000), Phaser.Math.Between(0, 6000), 'space', 'eyes').setBlendMode(1).setScrollFactor(0.8);
    }

    stars = this.add.tileSprite(400, 300, 800, 600, 'stars').setScrollFactor(0);

    var particles = this.add.particles('space');

    var emitter = particles.createEmitter({
        frame: 'red',
        speed: 100,
        lifespan: {
            onEmit: function (particle, key, t, value)
            {
                return Phaser.Math.Percent(ship.body.speed, 0, 300) * 2000;
            }
        },
        alpha: {
            onEmit: function (particle, key, t, value)
            {
                return Phaser.Math.Percent(ship.body.speed, 0, 300);
            }
        },
        angle: {
            onEmit: function (particle, key, t, value)
            {
                var v = Phaser.Math.Between(-15, 15);
                return ship.angle - 90 + v
               // return (ship.angle - 180) + v;
            }
        },
        scale: { start: 0.4, end: 0 },
        blendMode: 'ADD'
    });

    ship = this.physics.add.image(400, 500, 'ship').setDepth(1);

    emitter.startFollow(ship);

    this.cameras.main.startFollow(ship);

    this.add.sprite(4300, 3000).play('asteroid1-anim');

    this.tweens.add({
        targets: galaxy,
        angle: 360,
        duration: 100000,
        ease: 'Linear',
        loop: -1
    });


    this.input.on('pointerdown', function (pointer) {

        isDown = true;
        mousePosition.x = pointer.worldX;
        mousePosition.y = pointer.worldY;
        this.physics.moveToObject(ship, mousePosition, 500);
        

    }, this);

    this.input.on('pointermove', function (pointer) {
    });

    this.input.on('pointerup', function (pointer) {

        isDown = false;

    });

   // var cursor = this.add.image(0, 0, 'cursor').setVisible(false);

   // this.input.on('pointermove', function (pointer)
   // {
     //   cursor.setVisible(true).setPosition(pointer.x, pointer.y);

        
   // }, this);




    cursors = this.input.keyboard.createCursorKeys();

    speed = Phaser.Math.GetSpeed(300, 1);
    //var enableObstacleCollide = true;
    //ship.body.setCollideWorldBounds(true);

    var controlConfig = {
        camera: this.cameras.main,
        left: cursors.left,
        right: cursors.right,
        up: cursors.up,
        down: cursors.down,
        zoomIn: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q),
        zoomOut: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E),
        acceleration: 0.06,
        drag: 0.0005,
        maxSpeed: 1.0
    };

    controls = new Phaser.Cameras.Controls.SmoothedKeyControl(controlConfig);
}

function update (time, delta) {

    var distance = Phaser.Math.Distance.Between(ship.x, ship.y, mousePosition.x, mousePosition.y);
   // this.physics.arcade.collide(player, obstacle, function() {  
    //    if (enableObstacleCollide) {    return true;  }  return false;
    //});
    if (distance < 4) {
        ship.body.reset(ship.x, ship.y);
    }

    if (isDown) {
        ship.setRotation(Phaser.Math.Angle.Between(mousePosition.x, mousePosition.y, ship.x, ship.y) - Math.PI / 2);
        
         //console.log("X: " + mousePosition.x, "Y: " + mousePosition.y);
       //  console.log("sX: " + ship.x, "sY: " + ship.y);
    }
    
    if (Math.abs(ship.x - mouseX) < 10 && Math.abs(ship.y - mouseY) < 10) {
      //  ship.setVelocity(0, 0);
    } 

    controls.update(delta);

    bg.tilePositionX += ship.body.deltaX() * 0.5;
    bg.tilePositionY += ship.body.deltaY() * 0.5;

    stars.tilePositionX += ship.body.deltaX() * 2;
    stars.tilePositionY += ship.body.deltaY() * 2;

    /*
    if (cursors.left.isDown)
    {
        ship.x -= speed * delta;
    }
    else if (cursors.right.isDown)
    {
        ship.x += speed * delta;
    }

    if (cursors.up.isDown && time > lastFired)
    //if (isDown)
    {
        var bullet = bullets.get();

        if (bullet)
        {
            bullet.fire(ship.x, ship.y);
            bullet.fire(ship.x, ship.y)
            //bullet.fire();

            lastFired = time + 50;
        }
    }
    */
}
