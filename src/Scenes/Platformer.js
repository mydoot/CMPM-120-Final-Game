class Platformer extends Phaser.Scene {
    constructor() {
        super("platformerScene");
    }

    preload() {

        this.load.scenePlugin({
            key: 'rexuiplugin',
            url: "./lib/rexuiplugin.min.js",
            sceneKey: 'rexUI'
        });
    }

    init() {
        // variables and settings
        this.ACCELERATION = 500;
        this.DRAG = 1100;    // DRAG < ACCELERATION = icy slide
        this.physics.world.gravity.y = 1500;
        this.JUMP_VELOCITY = -625;
        this.HEALTH = 3;

        this.CAM = this.cameras.main

        this.vfx = {};

        this.DamageCD = 100;
        this.coins = 0;
    }

    create() {

        this.load.scenePlugin('rexuiplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexuiplugin.min.js', 'rexUI', 'rexUI');


        this.playerParticleConfig = {
            jsonkey: 'kenny-particles',
            spritekey: ['circle_05.png']
        };

        this.playerParticleConfig2 = {
            jsonkey: 'kenny-particles',
            spritekey: ['magic_05.png']
        };

        // Create a new tilemap game object which uses 18x18 pixel tiles, and is
        // 45 tiles wide and 25 tiles tall.
        this.map = this.add.tilemap("platformer-level-1", 18, 18, 20, 50);

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

        this.foreLayer.setCollisionByProperty({
            danger: true,
            win: true
        });

        this.groundLayer.forEachTile(tile => {
            if (tile.properties.oneWay) {
                // If it does, we'll change its collision rules
                tile.setCollision(false, false, true, false);
                // This means: setCollision(left, right, top, bottom)
                // Only the top side will now be collidable.
            }
        });



        my.AKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        my.DKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        my.SPACEKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.keys = this.map.createFromObjects("Objects", {
            name: "coin",
            key: "tilemap_sheet",
            frame: 151
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
        my.sprite.player = new Player(this, game.config.width / 4 - 140, game.config.height / 2 + 350, "platformer_characters", "tile_0000.png", my.AKey, my.DKey, my.SPACEKey, null, this.ACCELERATION, this.DRAG, this.JUMP_VELOCITY, this.HEALTH, this.playerParticleConfig, this.playerParticleConfig2).setScale(1);
        this.Player = this.physics.add.existing(my.sprite.player, 0);
        this.Player.setCollideWorldBounds(true);

        // Enable collision handling
        this.physics.add.collider(my.sprite.player, this.groundLayer);

        // Unique effects with tiles
        this.physics.add.overlap(my.sprite.player, this.foreLayer, this.TileEffecthandler, null, this);

        // Handle collision detection with coins
        this.physics.add.overlap(my.sprite.player, this.keyGroup, (obj1, obj2) => {
            obj2.destroy(); // remove coin on overlap
            this.coins++;
            this.CoinParticle = this.add.particles(0, 0, 'kenny-particles', {
                frame: 'star_04.png',
                scale: { start: 0.30, end: 0 },
                tint: [0xffff00, 0xffd700, 0xffec8b],
                blendMode: 'NORMAL',
                x: my.sprite.player.x,
                y: my.sprite.player.y,
                //moveTo: true,
                speedX: { min: -200, max: 200 },
                speedY: -20,
                angle: { min: 45, max: 135 },
                gravityY: 340,
                rotate: { min: 30, max: 360 },
                lifespan: { min: 100, max: 1000 },
                //duration: 5,
                maxParticles: 5,
                //quantity: 5

            });

             const textObject = this.label2.getElement('text');

        textObject.setText("Coins: " + this.coins);

        this.label.layout();

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
        this.cameras.main.setDeadzone(50, 70);
        this.cameras.main.setZoom(3.5);

        this.TEXT = "HP: " + this.Player.HP;
        this.labelText = this.add.text(0, 0, this.TEXT, {
            fontSize: '10'
        });

        this.TEXT2 = "Restart"
        this.labelText2 = this.add.text(0, 0, this.TEXT2, {
            fontSize: '10'
        });

        this.TEXT2 = "Coins: " + this.coins;
        this.labelText2 = this.add.text(0, 0, this.TEXT2, {
            fontSize: '10'
        });


        this.backgroundColor = 0x1f2645;
        this.strokeColor = 0xffffff;
        this.background = this.rexUI.add.roundRectangle(0, 0, 0, 0, 2, this.backgroundColor).setStrokeStyle(2, this.strokeColor);
        this.background2 = this.rexUI.add.roundRectangle(0, 0, 0, 0, 2, this.backgroundColor).setStrokeStyle(2, this.strokeColor);

        this.label = this.rexUI.add.label({
            x: this.cameras.main.width / 2 - 145,
            y: this.cameras.main.height / 2 - 110,
            background: this.background,
            text: this.labelText,
            space: {
                left: 15,
                right: 15,
                top: 10,
                bottom: 10
            },
        });

        this.label2 = this.rexUI.add.label({
            x: this.cameras.main.width / 2 + 145,
            y: this.cameras.main.height / 2 - 110 ,
            background: this.background2,
            text: this.labelText2,
            space: {
                left: 15,
                right: 15,
                top: 10,
                bottom: 10
            },
        });

        this.MenuLabel = this.rexUI.add.buttons({
            x: this.cameras.main.width / 2,
            y: this.cameras.main.height / 2,

            buttons: [
                this.button1 = this.rexUI.add.label({
                    x: this.cameras.main.width / 2,
                    y: this.cameras.main.height / 2,
                    background: this.rexUI.add.roundRectangle(0, 0, 0, 0, 2, this.backgroundColor).setStrokeStyle(2, this.strokeColor),
                    text: this.add.text(0, 0, "Restart", {
                        fontSize: '10'
                    })
                }),
                this.button2 = this.rexUI.add.label({
                    x: this.cameras.main.width / 2,
                    y: this.cameras.main.height / 2,
                    background: this.rexUI.add.roundRectangle(0, 0, 0, 0, 2, this.backgroundColor).setStrokeStyle(2, this.strokeColor),
                    text: this.add.text(0, 0, "Next Level", {
                        fontSize: '10'
                    })
                }),

            ],
            space: {
                left: 15,
                right: 15,
                top: 10,
                bottom: 10
            },
        });


        this.MenuLabel.buttons.forEach((button, index) => {
            button.setInteractive()
                .on('pointerdown', () => {
                    console.log('Button clicked!');
                    if (index == 0){
                        this.scene.restart();
                    }
                    else if (index == 1){
                        this.scene.start("platformerScene2");
                    }
                })
                .on('pointerover', () => {
                    // Make the background slightly darker on hover
                    button.getElement('background').setStrokeStyle(1, 0xffffff);
                })
                .on('pointerout', () => {
                    // Remove the stroke
                    button.getElement('background').setStrokeStyle();
                });

            button.visible = false;
        })

        this.label.layout();
        this.label.setScrollFactor(0)
        this.label.getElement('background').setDepth(0);
        this.label.getElement('text').setDepth(1);
        
        this.label2.layout();
        this.label2.setScrollFactor(0)
        this.label2.getElement('background').setDepth(0);
        this.label2.getElement('text').setDepth(1);

        this.MenuLabel.layout();
        this.MenuLabel.setScrollFactor(0)
        /* this.MenuLabel.getElement('background').setDepth(0);
        this.MenuLabel.getElement('text').setDepth(1);
 */
        //this.MenuLabel.visible = false;

        console.log('Button created:', this.MenuLabel);

        /* this.MenuLabel.setInteractive().on('pointerdown', () => {
       console.log('Standard Phaser pointerdown event fired!');
}); */

    }

    update() {
        this.counter++;
        //console.log(this.DamageCD);

        //this.CAM.startFollow(this.Player, true, 0.7, 0.1);
        //this.CAM.setZoom(1.25);
        this.Player.update();

        //changehealthtext()

    }

    changehealthtext() {
        const textObject = this.label.getElement('text');

        textObject.setText("HP: " + this.Player.HP);

        this.label.layout();
    }

    changecointext() {
        const textObject = this.label2.getElement('text');

        textObject.setText("Coins: " + this.coins);

        this.label.layout();
    }

    TileEffecthandler(player, tile) {
        if (tile.properties.danger) {
            /* const now = this.time.now;
            if (!player.damageTime || now > player.damageTime + 1000) { // 1000ms = 1 second
                player.health -= damagePerSecond;
                player.lastLavaDamage = now;
                console.log("Player took lava damage! Health:", player.health);
            } */
            console.log("taken 1 damage");
            player.takeDamage(1);
            console.log("player health = " + player.HP);
            this.changehealthtext()
            if (player.isDead == true){
                this.MenuLabel.buttons.forEach((button, index) => {
                button.visible = true;
                if (index == 1) {
                    button.visible = false;
                }
            })
            }

        }

        if (tile.properties.win) {
            this.MenuLabel.buttons.forEach((button, index) => {
                button.visible = true;
            })
        }
    }
}