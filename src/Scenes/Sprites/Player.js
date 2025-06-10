class Player extends Phaser.Physics.Arcade.Sprite {

    // x,y - starting sprite location
    // spriteKey - key for the sprite image asset
    // leftKey - key for moving left
    // rightKey - key for moving right
    constructor(scene, x, y, texture, frame, leftKey, rightKey, jumpKey, playerSpeed, acceleration, drag, jumpVelocity, health, pconfig = {}, pconfig2 = {}) {
        super(scene, x, y, texture, frame);

         console.log("Player constructor received pconfig:", pconfig); // Add this line
    console.log("Is pconfig2.jsonkey present?", pconfig2 ? pconfig2.jsonkey : 'pconfig2 is falsy');
    console.log("Is pconfig2.spritekey present?", pconfig2 ? pconfig2.spritekey : 'pconfig2 is falsy');

        this.left = leftKey;
        this.right = rightKey;
        this.jump = jumpKey;
        this.playerSpeed = playerSpeed;
        this.JUMP_VELOCITY = jumpVelocity;
        this.DRAG = drag;
        this.ACCELERATION = acceleration;
        this.HP = health;
        this.isInvincible = false;
        this.isDead = false;

        this.vfx = {};

        scene.add.existing(this);
        //this.setCollideWorldBounds(true);

        this.initParticle(pconfig, pconfig2);

        return this;
    }

    initParticle(Particleconfig, Particleconfig2){

         if (!Particleconfig2 || !Particleconfig2.jsonkey || !Particleconfig2.spritekey) {
            console.warn("Player: hit particle 'jsonkey' or 'spritekey' not provided in config.", Particleconfig2);
            //console.log('Texture jsonkey exists:', this.textures.exists(Particleconfig.jsonkey));
            //console.log('Texture spritekey exists:', this.textures.exists(Particleconfig.spritekey));
            this.vfx.walk = undefined; // Explicitly mark as undefined or a no-op object
            return;
        }

        if (!Particleconfig2) {
            console.warn("No particle config 2 given")
        }

        this.vfx.walk = this.scene.add.particles(0, 0, Particleconfig.jsonkey , {
            frame: Particleconfig.spritekey,
            random: true,
            scale: {start: 0.03, end: 0.1},
            maxAliveParticles: 45,
            lifespan: 350,
            //duration: 200, 
            gravityY: -400,
            frequency: 40,
            alpha: {start: 0.5, end: 0.1}, 
        });

        this.vfx.hit = this.scene.add.particles(0, 0, Particleconfig2.jsonkey, {
            frame: Particleconfig2.spritekey,
            //random: true,
            scale: { start: 0.03, end: 0.2 },
            //maxAliveParticles: 45,
            alpha: { start: 0.5, end: 0.1 },
            speedX: { min: -200, max: 200 },
            speedY: -30,
            angle: { min: 45, max: 135 },
            gravityY: -340,
            rotate: { min: 30, max: 360 },
            lifespan: { min: 100, max: 1000 },
            duration: 50,
            maxParticles: 15,
            //quantity: 5
            //x: this.x,
            //y: this.y
        });
        
        //this.vfx.hit.start();

        if (!this.vfx.hit) {
            console.error("Player: Failed to create walk particle emitter with key:", Particleconfig2.jsonkey);
        } 
        else if (this.vfx.hit) {
            console.log("exists.");
        }

        //this.vfx.walk.stop();
    }


    update() {
        this.setMaxVelocity(500,1000);
        //console.log(this.body.velocity.x)
        if (!this.isDead) {

            if(this.left.isDown) {
                 if (this.body.velocity.x >= 50){
                     this.setVelocityX(-50);
                 }
                 this.setAccelerationX(-this.ACCELERATION);
                 
                 this.resetFlip();
                 this.anims.play('walk', true);
     
                 this.vfx.walk.startFollow(this, this.displayWidth/2-10, this.displayHeight/2-5, false);
                 this.vfx.walk.setParticleSpeed(20, 0);
     
                 // Only play smoke effect if touching the ground
     
                 if (this.body.blocked.down) {
     
                     this.vfx.walk.start();
                 }
                 else {
                     this.vfx.walk.stop();
                 }
     
             } else if(this.right.isDown) {
                 if (this.body.velocity.x <= -50){
                     this.setVelocityX(50);
                 }
                  this.setAccelerationX(this.ACCELERATION);
     
                 this.setFlip(true, false);
                 this.anims.play('walk', true);
     
                 this.vfx.walk.startFollow(this, this.displayWidth/2-15, this.displayHeight/2, false);
                 this.vfx.walk.setParticleSpeed(20, 0);
     
                 // Only play smoke effect if touching the ground
     
                 if (this.body.blocked.down) {
     
                     this.vfx.walk.start();
     
                 }
                 else {
                     this.vfx.walk.stop();
                 }
     
             } else {
                  this.setAccelerationX(0);
             this.setDragX(this.DRAG);
                 this.vfx.walk.stop();
                 this.anims.play('idle');
             }
     
             // player jump
             // note that we need body.blocked rather than body.touching b/c the former applies to tilemap tiles and the latter to the "ground"
             if(!my.sprite.player.body.blocked.down) {
                 this.anims.play('jump');
             }
             if(my.sprite.player.body.blocked.down && Phaser.Input.Keyboard.JustDown(this.jump)) {
                   this.setVelocityY(this.JUMP_VELOCITY);
     
             }
             if(Phaser.Input.Keyboard.JustUp(this.jump)){
                 console.log(this.body.velocity);
                 if (this.body.velocity.y < 0){
                     console.log("reduced jump height");
                     this.setVelocityY(this.body.velocity.y * 0.5);
                 }
             }
        }
    }

    takeDamage(amnt){
    if (this.HP > 0){
        if (this.isInvincible == false) {
            this.vfx.hit.startFollow(this, this.displayWidth/2, this.displayHeight/2, false);
            this.vfx.hit.start();
            //this.vfx.hit.setParticleSpeed(20, 0);
            this.HP -= amnt;
            this.isInvincible = true;
            this.setAlpha(0.5);
            this.scene.time.delayedCall(750, () => {
                this.isInvincible = false;
                //this.vfx.hit.stop();
                this.setAlpha(1);
            })
        }
    } else {
        this.die();
    }
    }

    die(){
        this.isDead = true;
         this.JUMP_VELOCITY = 0;
        this.DRAG = 0;
        this.ACCELERATION = 0;
        this.HP = 0;
        this.isInvincible = true;
        this.visible = false;
         /* this.left = leftKey;
        this.right = rightKey;
        this.jump = jumpKey; */
        this.vfx.walk.stop();
    }

}