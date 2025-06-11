class Player extends Phaser.Physics.Arcade.Sprite {

    // x,y - starting sprite location
    // spriteKey - key for the sprite image asset
    // leftKey - key for moving left
    // rightKey - key for moving right
    constructor(scene, x, y, texture, frame, leftKey, rightKey, jumpKey, playerSpeed, acceleration, drag, jumpVelocity, health, pconfig = {}) {
        super(scene, x, y, texture, frame);

         console.log("Player constructor received pconfig:", pconfig); // Add this line
    console.log("Is pconfig.jsonkey present?", pconfig ? pconfig.jsonkey : 'pconfig is falsy');
    console.log("Is pconfig.spritekey present?", pconfig ? pconfig.spritekey : 'pconfig is falsy');

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
        this.hasWon = false;
        this.walksfxCD = 500;
        
        this.walksfx = this.scene.sound.add("walk", {
                            volume: 0.15   // Can adjust volume using this, goes from 0 to 1
            });

        this.vfx = {};

        scene.add.existing(this);
        //this.setCollideWorldBounds(true);

        this.initParticle(pconfig);

        return this;
    }

    initParticle(Particleconfig){

         if (!Particleconfig || !Particleconfig.jsonkey || !Particleconfig.spritekey) {
            console.warn("Player: Walk particle 'jsonkey' or 'spritekey' not provided in config.", Particleconfig);
            //console.log('Texture jsonkey exists:', this.textures.exists(Particleconfig.jsonkey));
            //console.log('Texture spritekey exists:', this.textures.exists(Particleconfig.spritekey));
            this.vfx.walk = undefined; // Explicitly mark as undefined or a no-op object
            return;
        }

        if (!Particleconfig) {
            console.warn("No particle config given")
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

        if (!this.vfx.walk) {
            console.error("Player: Failed to create walk particle emitter with key:", Particleconfig.jsonkey);
        } 
        else if (this.vfx.walk) {
            console.log("exists.");
        }

        //this.vfx.walk.stop();
    }


    update() {
        this.walksfxCD++;

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
                     if (this.walksfxCD >= 20){
                        this.scene.sound.play("walk", {
                            volume: 0.05   // Can adjust volume using this, goes from 0 to 1
            });
                        this.walksfxCD = 0;
                     }
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
                     if (this.walksfxCD >= 20){
                         this.scene.sound.play("walk", {
                            volume: 0.05   // Can adjust volume using this, goes from 0 to 1
            });
                        this.walksfxCD = 0;
                     }
                    
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
            this.isInvincible = true;
            this.scene.sound.play("hit", {
                            volume: 0.5   // Can adjust volume using this, goes from 0 to 1
            });
            this.HP -= amnt;
            if (this.HP == 0) {
                this.die();
            }
            this.scene.cameras.main.shake(100, 0.0003);
            if (this.scene.HitParticle){
                this.scene.HitParticle.emitParticleAt(this.x, this.y);
            }
            this.setAlpha(0.5);
            this.scene.time.delayedCall(750, () => {
                this.isInvincible = false;
                this.setAlpha(1);
            })
        }
    } else {
        this.die();
    }
    }

    die(){
        //this.scene.cameras.main.shake(100, 0.0015, true);
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
       /*  this.scene.time.delayedCall(100, () => {
               this.scene.cameras.main.shake(100, 0, true);
            }) */
    }

    win(){
        //this.scene.cameras.main.shake(100, 0.0015, true);
        this.scene.sound.play("win", {
                            volume: 0.5   // Can adjust volume using this, goes from 0 to 1
            });
         this.JUMP_VELOCITY = 0;
        this.DRAG = 9999;
        this.ACCELERATION = 0;
        this.HP = 0;
        this.isInvincible = true;
        //this.visible = false;
        this.hasWon = true;
        //this.setVelocityX(0);
       //this.setVelocityY(0);
         /* this.left = leftKey;
        this.right = rightKey;
        this.jump = jumpKey; */
        this.vfx.walk.stop();
        
    }

}