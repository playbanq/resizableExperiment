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

var canvas = document.getElementById('resizableCanvas');
    // canvas.width = '500';
    // canvas.height = '300';
// Full page canvas
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
var context = canvas.getContext('2d'),
    canvasOffset = canvas.getBoundingClientRect(),
    screen = {
        width: window.innerWidth,
        height: window.innerHeight
    },
    resize = {
        lastWidth: window.innerWidth,
        lastHeight: window.innerHeight
    },
    ratio = {
        width: 1,
        height: 1
    },
    pixelsPerMeter = 50;
    gravity = 30;

// Platforms
var platforms = [
    // [startX, heightY, widthX]
    [200, 300, 150],
    [450, 200, 200],
    [900, 250, 300]
];

// Avatar
var avatar = PB.NewAvatarWithMass(0.05, gravity, pixelsPerMeter, 250, 150);

// Clock
var clock = {
    last: (new Date()).getTime(),
    current: null,
    fps: 30
};

// Handle window resize consequences
window.onresize = function () {
    
}

// Render
setInterval(function () {
    // Check actual delay
    clock.current = (new Date()).getTime();
    var frameDelay = clock.current - clock.last;
    clock.last = clock.current;

    context.clearRect(0, 0, canvasOffset.width, canvasOffset.height);
    // Adjust the canvas size to the window size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Adjust platform offsets according to the resizing
    if (window.innerWidth > screen.width/2) {
        ratio.width = canvas.width/screen.width;
    }
    if (window.innerHeight > screen.height/2) {
        ratio.height = canvas.height/screen.height;
    }

    // Draw platforms
    platforms.forEach(function (platform) {
        context.beginPath();
        context.moveTo(platform[0] * ratio.width, canvas.height - platform[1] * ratio.height);
        context.lineTo(platform[0] * ratio.width + platform[2], canvas.height - platform[1] * ratio.height);
        context.stroke();
    });

    // Check if the avatar should return to its starting position.
    avatar.shouldResetToStartingPosition(screen.height);

    // Compute the avatar' position.
    avatar.computePosition(frameDelay/1000, ratio);

    // Check collisions.
    avatar.checkForCollisions(platforms, ratio, canvas.height);

    // Draw avatar
    avatar.drawInContext(context, ratio);

}, 1000/clock.fps);

// Handle key events
window.onkeydown = function (event) {
    var key = event.keyCode || event.charCode;

    switch (key) {
    case 37:
        avatar.move(true, false);
        break;
    case 38:
        avatar.jump(true);
        break;
    case 39:
        avatar.move(true, true);
        break;
    case 40:
        break;
    default:
        break;
    }
}
window.onkeyup = function (event) {
    var key = event.keyCode || event.charCode;

    switch (key) {
    case 37:
        avatar.move(false, true);
        break;
    case 38:
        avatar.jump(false);
        break;
    case 39:
        avatar.move(false, false);
        break;
    case 40:
        //avatar.keys.down = false;
        break;
    default:
        break;
    }
}