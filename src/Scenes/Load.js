class Load extends Phaser.Scene {
    constructor() {
        super("loadScene");
    }

    preload() {
        this.load.setPath("./assets/");

        // Load characters spritesheet
        this.load.atlas("platformer_characters", "tilemap-characters-packed.png", "tilemap-characters-packed.json");

        // Load tilemap information
        this.load.image("tilemap_tiles", "tilemap_packed.png");         
        this.load.image("stone_tiles", "stone_packed.png");                     // Packed tilemap
        this.load.tilemapTiledJSON("platformer-level-1", "Level 1.tmj"); 
        
        this.load.tilemapTiledJSON("platformer-level-2", "Level 2.tmj"); // Tilemap in JSON
   
        this.load.spritesheet("tilemap_sheet", "tilemap_packed.png", {
            frameWidth: 18,
            frameHeight: 18
        });

        this.load.multiatlas("kenny-particles", "kenny-particles.json");

        this.load.audio("hit", "61_Hit_03.wav");
        this.load.audio("coin", "DSGNTonl_USABLE-Coin Zap_HY_PC-001.wav");
        this.load.audio("win", "DSGNSynth_BUFF-Mecha Level Up_HY_PC-001.wav");
        this.load.audio("walk", "DSGNMisc_STEP-Whimsical Step_HY_PC-002.wav");
    }

    create() {
        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNames('platformer_characters', {
                prefix: "tile_",
                start: 0,
                end: 1,
                suffix: ".png",
                zeroPad: 4
            }),
            frameRate: 15,
            repeat: -1
        });

        this.anims.create({
            key: 'idle',
            defaultTextureKey: "platformer_characters",
            frames: [
                { frame: "tile_0000.png" }
            ],
            repeat: -1
        });

        this.anims.create({
            key: 'jump',
            defaultTextureKey: "platformer_characters",
            frames: [
                { frame: "tile_0001.png" }
            ],
        });

         // ...and pass to the next Scene
         this.scene.start("platformerScene");
    }

    // Never get here since a new scene is started in create()
    update() {
    }
}