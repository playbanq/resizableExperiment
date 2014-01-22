/*
  The MIT License (MIT)

  Copyright (c) 2013 Chess Team

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in
  all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
  THE SOFTWARE.
*/

// Global used to avoid polluting the namespace.
var PB = PB || {};

/**
 * Create a new Avatar basic object.
 * PARAM:
 * mass: Avatar's mass.
 * gravity: The force of gravity to apply.
 * startingX: The starting xCoord.
 * startingY: The starting yCoord.
 */
PB.NewAvatarWithMass = function(mass, gravity, startingX, startingY){
  // Set deffaults in case parameters are null.
  if(typeof(mass) == 'undefined' || isNaN(mass)){
    mass = 0.05;
  }
  if(typeof(gravity) == 'undefined' || isNaN(gravity)){
    gravity = 30;
  }
  if(typeof(startingX) == 'undefined' || isNaN(startingX)){
    startingX = 0;
  }
  if(typeof(startingY) == 'undefined' || isNaN(startingY)){
    startingY = 0;
  }

  // Private stuff.
  var xCoord = startingX;
  var yCoord = startingY;
  var xForce = 0;
  var yForce = gravity;
  var xSpeed = 0;
  var ySpeed = 0;
  var radius = 10.0;
  var keys = {'up': false, 'down': false, 'left': false,'right': false};
  var walk = {force: 400};
  var jump = {force: 400, duration: 300};
  var jumping = false;
  
  // Public stuff.
  var properties = {
    /**
     * Return the avatar's position.
     */
    "getPosition": {
      value: function(){
        return {x: xCoord, y: yCoord};
      }
    },
    
    /**
     * Set the avatar's position.
     */
    "setPosition": {
      value: function(x, y){
        xCoord = x;
        yCoord = y;
      }
    },
    
    /**
     * Return the avatar's force.
     */
    "getForce": {
      value: function(){
        return {x: xForce, y: yForce};
      }
    },
    
    /**
     * Set the avatar's force.
     */
    "setPosition": {
      value: function(x, y){
        xForce = x;
        yForce = y;
      }
    },

    /**
     * Return the avatar's speed.
     */
    "getSpeed": {
      value: function(){
        return {x: xForce, y: yForce};
      }
    },
    
    /**
     * Set the avatar's speed.
     */
    "setSpeed": {
      value: function(x, y){
        xSpeed = x;
        ySpeed = y;
      }
    },

    /**
     * Make the avatar jump.
     * PARAM:
     * action: If true, then the jump just started. False otherwise.
     */
    "jump": {
      value: function(action){
        if(action){
          if (!keys.up && !jumping) {
              keys.up = true;
              yForce = -jump.force;
              jumping = true;
              setTimeout(function () {
                  // if (avatar.keys.up) {
                      yForce = gravity;
                      ySpeed = 0;
                  // }
              }, jump.duration);
          }
        } else{
          keys.up = false;
          yForce = 0;
        }
      }
    },

    /**
     * Move in the given direction.
     * PARAM
     * action: If true, then the movement just started. False otherwise.
     * direction: If true movement is to the right, if false movement is to the left.
     */
    "move": {
      value: function(action, direction){
        if(action){
          if(direction){
            xForce = walk.force;
          }else{
            xForce = -walk.force;
          }
        }else{
          if(direction){
            keys.right = false;
            xForce = 0;
          }else{
            keys.left = false;
            xForce = 0;
          }
        }
      }
    },
    
    /**
     * Check if the avatar should reset to its starting position.
     * PARAM
     * height: Screen height.
     */
    "shouldResetToStartingPosition": {
      value: function(height){
        if (yCoord > height) {
            xSpeed = 0;
            ySpeed = 0;
            xForce = 0;
            xCoord = startingX;
            yCoord = startingY;
        }
      }
    },

    /**
     * Compute the avatar's resulting position after the given delay.
     * PARAM
     * delay: Time interval.
     */
    "computePosition": {
      value: function(delay){
        // Compute avatar forces and resulting acceleration and speed
        xSpeed = (xForce/mass) * delay;
        ySpeed += (yForce/mass) * delay;
        
        // Compute avatar position
        xCoord += xSpeed * delay;
        yCoord += ySpeed * delay;
      }
    },

    /**
     * Adjust position according to platform.
     * PARAM
     * platform: The relative platform.
     * ration: ?
     * sign: Indicates if the screen is increasing or decreasing in size.
     */
    "adjustPositionAccordingToPlatform": {
      value: function(platform, ratio, sign){
        if (xCoord > platform[0] * ratio.width && xCoord  < platform[0] * ratio.width + platform[2]) {
            xCoord += sign * (xCoord - platform[0] * ratio.width) / (platform[2] * ratio.width);
        }
      }
    },

    /**
     * Iterates the platforms looking for collisions.
     * PARAM
     * platforms: Array of platforms.
     * ratio: ? 
     * height: Height of the screen.
     */
    "checkForCollisions": {
      value: function(platforms, ratio, height){
        // avatar.speed.y = 0;
        var collision = false;
        for(var i = 0; i < platforms.length; i++) {
            var platform = platforms[i];
            if (xCoord > platform[0] * ratio.width && xCoord  < platform[0] * ratio.width + platform[2]) {
                if (yCoord + radius >= height - platform[1] * ratio.height &&
                    yCoord + radius < height - platform[1] * ratio.height + 2 * radius) {
                    ySpeed = 0;
                    yForce = 0;
                    collision = true;
                    jumping = false;
                }
            }
        };
        if (!collision) {
          yForce = gravity;
        } 
      }
    },

    /**
     * Draw the avatar.
     */
    "drawInContext": {
      value: function(context){
        context.beginPath();
        context.arc(xCoord, yCoord, radius, 0, 2 * Math.PI);
        context.fillStyle = '#999';
        context.fill();
        context.stroke();
      }
    }
  };
  
  return Object.create({}, properties);
}; 