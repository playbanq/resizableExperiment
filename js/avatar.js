/*
  The MIT License (MIT)

  Copyright (c) 2014 Jorge Zaccaro, Santiago Castillo

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
 * pixelsPerMeter: Scale used.
 * startingX: The starting xCoord.
 * startingY: The starting yCoord.
 */
PB.NewAvatarWithMass = function (mass, gravity, pixelsPerMeter, startingX, startingY) {
  // Set deffaults in case parameters are null.
  if (typeof(mass) == 'undefined' || isNaN(mass)) {
    mass = 0.05;
  }
  if (typeof(gravity) == 'undefined' || isNaN(gravity)) {
    gravity = 30;
  }
  if (typeof(startingX) == 'undefined' || isNaN(startingX)) {
    startingX = 0;
  }
  if (typeof(startingY) == 'undefined' || isNaN(startingY)) {
    startingY = 0;
  }

  // Private stuff.
  var xCoord = startingX;
  var yCoord = startingY;
  var xForce = 0;
  var xSpeed = 0;
  var ySpeed = 0;
  var xTargetSpeed = 0;
  var radius = pixelsPerMeter / 2;
  var keys = {'up': false, 'down': false, 'left': false,'right': false};
  var walk = {speed: 5};
  var jump = {maxSpeed: 14, minSpeed: 7};
  var jumping = false;
  var falling = true;
  
  // Public stuff.
  var properties = {
    /**
     * Return the avatar's position.
     */
    "getPosition": {
      value: function () {
        return {
          x: xCoord, 
          y: yCoord
        };
      }
    },
    
    /**
     * Set the avatar's position.
     */
    "setPosition": {
      value: function (x, y) {
        xCoord = x;
        yCoord = y;
      }
    },

    /**
     * Make the avatar jump.
     * PARAM:
     * action: If true, then the jump just started. False otherwise.
     */
    "jump": {
      value: function (action) {
        if (action) {
          if (!keys.up && !jumping && !falling) {
              keys.up = true;
              ySpeed = -jump.maxSpeed;
              jumping = true;
          }
        } else {
          keys.up = false;
          if(ySpeed < -jump.minSpeed){
              ySpeed = -jump.minSpeed;
          }
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
      value: function (action, direction) {
        if (action) {
          if (direction) {
            xTargetSpeed = walk.speed;;
          } else {
            xTargetSpeed = -walk.speed;
          }
        } else {
          xTargetSpeed = 0;        
        }
      }
    },
    
    /**
     * Check if the avatar should reset to its starting position.
     * PARAM
     * height: Screen height.
     */
    "shouldResetToStartingPosition": {
      value: function (height) {
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
      value: function (delay, ratio) {
        var factor = { 
              x: ratio.width || 1, 
              y: ratio.height || 1 
            };

        // Compute gravity.
        ySpeed += gravity * delay;
        if (ySpeed >= 0) {
          falling = true;
          jumping = false;
        }

        // Compute horizontal speed.
        if(xTargetSpeed > 0){
            xSpeed = (0.10 * xTargetSpeed) + ((1 - 0.10) * xSpeed); 
        } else{
            xSpeed = (0.20 * xTargetSpeed) + ((1 - 0.20) * xSpeed); 
        }
        if(Math.abs(xSpeed) < (0.10 * xTargetSpeed)){
            xSpeed = 0;
        }        
        
        // Compute avatar position
        xCoord += (xSpeed / factor.x) * delay * pixelsPerMeter;
        yCoord += ySpeed * delay * pixelsPerMeter;
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
      value: function (platforms, ratio, height) {
        // avatar.speed.y = 0;
        var collision = false;
        for (var i = 0; i < platforms.length; i++) {
            var platform = platforms[i];
            if (xCoord > platform[0] && xCoord * ratio.width < platform[0] * ratio.width + platform[2]) {
                if (yCoord + radius >= height - platform[1] * ratio.height &&
                    yCoord - radius < height - platform[1] * ratio.height ) {
                    
                    collision = true;

                    if (jumping && yCoord > height - platform[1] * ratio.height ) {
                      yCoord = height - platform[1] + radius;
                      falling = true;
                      ySpeed = 0;
                    } else if (falling && !jumping) { 
                      yCoord = height - platform[1] - radius; 
                      falling = false;
                      ySpeed = 0;
                    }

                    break;
                }
            }
        };
        if (!collision) {
          falling = true;
        } 
      }
    },

    /**
     * Draw the avatar.
     */
    "drawInContext": {
      value: function (context, ratio) {
        context.beginPath();
        context.arc(xCoord * ratio.width, yCoord, radius, 0, 2 * Math.PI);
        context.fillStyle = '#999';
        context.fill();
        context.stroke();
      }
    }
  };
  
  return Object.create({}, properties);
}; 