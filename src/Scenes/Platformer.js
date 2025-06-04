class Platformer extends Phaser.Scene {
    constructor() {
        super("platformerScene");
    }

    init() {
        // variables and settings
        this.ACCELERATION = 500;
        this.DRAG = 1100;    // DRAG < ACCELERATION = icy slide
        this.physics.world.gravity.y = 1500;
        this.JUMP_VELOCITY = -625;

        this.CAM = this.cameras.main

        this.vfx = {};
    }

    create() {

        this.playerParticleConfig = {
            jsonkey: 'kenny-particles',
            spritekey: ['circle_05.png']
        };

        // Create a new tilemap game object which uses 18x18 pixel tiles, and is
        // 45 tiles wide and 25 tiles tall.
        this.map = this.add.tilemap("platformer-level-1", 18, 18, 45, 25);

        // Add a tileset to the map
        // First parameter: name we gave the tileset in Tiled
        // Second parameter: key for the tilesheet (from this.load.image in Load.js)
        this.tileset = this.map.addTilesetImage("tilemap_packed", "tilemap_tiles");
        this.tileset2 = this.map.addTilesetImage("stonetilemap", "stone_tiles");

        // Create a layer
        this.groundLayer = this.map.createLayer("Ground", [this.tileset, this.tileset2], 0, 0);
        this.foreLayer = this.map.createLayer("Foreground", this.tileset, 0, 0);
        this.Backlayer = this.map.createLayer("Background", this.tileset, 0, 0);
        /* this.groundLayer.setScale(2.0);
        this.foreLayer.setScale(2.0);
        this.Backlayer.setScale(2.0); */

        // Make it collidable
        this.groundLayer.setCollisionByProperty({
            collides: true
        });

        my.AKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        my.DKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        my.SPACEKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.keys = this.map.createFromObjects("Objects", {
            name: "key",
            key: "tilemap_sheet",
            frame: 27
        });

        // Since createFromObjects returns an array of regular Sprites, we need to convert 
        // them into Arcade Physics sprites (STATIC_BODY, so they don't move) 
        this.physics.world.enable(this.keys, Phaser.Physics.Arcade.STATIC_BODY);

        // Create a Phaser group out of the array this.coins
        // This will be used for collision detection below.
        this.keyGroup = this.add.group(this.keys);

       /*  for (this.Keyz in this.keyGroup){
            this.Keyz.setScale(2);
        } */

        // set up player avatar
        //my.sprite.player = this.physics.add.sprite(game.config.width/4, game.config.height/2, "platformer_characters", "tile_0000.png").setScale(SCALE)
        my.sprite.player = new Player(this, game.config.width/4 - 340, game.config.height/2 - 200, "platformer_characters", "tile_0000.png", my.AKey, my.DKey, my.SPACEKey, null, this.ACCELERATION, this.DRAG, this.JUMP_VELOCITY, this.playerParticleConfig).setScale(1);
        this.Player = this.physics.add.existing(my.sprite.player, 0);
        this.Player.setCollideWorldBounds(true);

        // Enable collision handling
        this.physics.add.collider(my.sprite.player, this.groundLayer);

// Handle collision detection with coins
        this.physics.add.overlap(my.sprite.player, this.keyGroup, (obj1, obj2) => {
            obj2.destroy(); // remove coin on overlap

            this.CoinParticle = this.add.particles(0, 0, 'kenny-particles', {
            frame: 'star_04.png',
            scale: { start: 0.30, end: 0 },
            tint: [0xffff00, 0xffd700, 0xffec8b],
            blendMode: 'NORMAL',
            x: my.sprite.player.x,
            y: my.sprite.player.y,
            //moveTo: true,
            speedX: {min: -200, max: 200 },
            speedY: -20,
            angle: {min: 45, max: 135},
            gravityY: 340,
            rotate: {min: 30, max: 360},
            lifespan: {min: 100, max: 1000},
            //duration: 5,
            maxParticles: 5,
            //quantity: 5

                
            });

            this.CoinParticle.start();
    });

        // set up Phaser-provided cursor key input
        cursors = this.input.keyboard.createCursorKeys();

        
        // debug key listener (assigned to D key)
        this.input.keyboard.on('keydown-D', () => {
            this.physics.world.drawDebug = this.physics.world.drawDebug ? false : true
            this.physics.world.debugGraphic.clear()
        }, this);


        //camera
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(this.Player, true, 0.25, 0.25); // (target, [,roundPixels][,lerpX][,lerpY])
        this.cameras.main.setDeadzone(200, 70);
        this.cameras.main.setZoom(2.5);

        
        

    }

    update() {
        //this.CAM.startFollow(this.Player, true, 0.7, 0.1);
        //this.CAM.setZoom(1.25);
        this.Player.update();
       
    }
}