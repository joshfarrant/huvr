// Define global variables
var voteTimeout;  // A timeout which submits a vote on completion
var voted;        // Will be true when a vote has been submitted
var explode;      // Will return the exploding circle SVG
var touchEnabled; // Will be true when a touch event has been registered

// Define default configuration attributes
var defaultAttrs = {
  voteTime: 2000,
  elasticTime: 1000,
  resetTime: 300,
  innerColor: '#bbb',
  outlineColor: '#666',
  completionColor: '#2ecc71'
};
var d; // An object to hold various button positions & dimensions

// Button SVG components
var outline;
var inner;
var tick;
var overlay;

// Default attributes for button SVG components
var outlineAttrs;
var innerAttrs;
var tickAttrs;
var overlayAttrs;


function buildButton(radius) {

  // Sets button radius
  d = {
    circle: radius
  };

  // Calculates inner circle and stroke size ratios
  d.inner = ( d.circle * 0.4 );
  d.stroke = ( d.inner * 0.2 );

  // Calculates total diameter from button radius and stroke width
  d.total = ( d.stroke + ( d.circle * 2 ) );
  d.half = ( d.total * 0.5 );

  // Calculates tick position and scale on button
  d.tickPos = ( d.circle + ( d.stroke * 0.5 ) );
  d.tickScale = ( d.circle / 100 );


  // Default attributes for the button outline circle
  outlineAttrs = {
    r: ( d.circle - (d.stroke / 2) ),
    fill: 'transparent',
    stroke: defaultAttrs.outlineColor,
    strokeWidth: d.stroke
  };

  // Default attribues for the button centre circle
  innerAttrs = {
    r: d.inner,
    fill: defaultAttrs.innerColor
  };

  // Default attribues for the central tick
  tickAttrs = {
    fill: '#fff',
    fillOpacity: 0,
    transform: 'translate(' + d.tickPos + ', ' + d.tickPos + ') scale(' + d.tickScale + ', ' + d.tickScale + ')'
  };

  // Default attribues for the hidden overlay circle
  // Used to detect mouseover & touch events
  overlayAttrs = {
    r: d.circle,
    fill: 'transparent'
  };

  // Creates a Snap SVG element
  s = Snap(d.total, d.total);

  // Create basic SVGs
  // Defined in order of ascending z-index
  outline = s.circle(d.half, d.half, outlineAttrs.r);
  inner   = s.circle(d.half, d.half, innerAttrs.r);
  // var tick    = s.path('M117.5,132.5 L107.5,122.5 L102.5,127.5 L117.5,142.5 L147.5,112.5 L142.5,107.5 Z');
  tick    = s.path('M-7.5,7.5 L-17.5,-2.5 L-23.5,2.5 L-7.5,17.5 L22.5,-12.5 L17.5,-17.5 Z');
  overlay = s.circle(d.half, d.half, overlayAttrs.r);

  // Assign default attributes to each of the SVGs
  outline.attr(outlineAttrs);
  inner.attr(innerAttrs);
  tick.attr(tickAttrs);
  overlay.attr(overlayAttrs);


  // Handles mouseover and mouseout events on the transparent overlay circle
  overlay.mouseover(function() {

    // Returns the function if device is touch enabled
    // Used to prevent rogue mouseover events firing on touch devices
    if (touchEnabled) {
      return;
    }

    // Begins submitting a vote on mouseover
    // Assigns vote timer to the voteTimeout global variable
    voteTimeout = beginVote();

  }).mouseout(function() {

    // Returns the function if device is touch enabled
    // Used to prevent rogue mouseover events firing on touch devices
    if (touchEnabled) {
      return;
    }

    // On mouseout, checks to see if a vote has been submitted successfully
    if (!voted) {
      // If no vote has been submitted, the current vote is cancelled
      cancelVote(voteTimeout);
    } else {
      // If a vote has been submitted, the button is reset to it's success state
      resetVote(voteTimeout);
    }

  });

  // Handles touchstart and touchend events on the transparent overlay circle
  overlay.touchstart(function() {

    // Sets touchEnabled to true as a touch event has been registered
    touchEnabled = true;

    // Begins submitting a vote on touchstart
    // Assigns vote timer to the voteTimeout global variable
    voteTimeout = beginVote();

  }).touchend(function() {

    // Sets touchEnabled to true as a touch event has been registered
    touchEnabled = true;

    // On touchend, checks to see if a vote has been submitted successfully
    if (!voted) {
      // If no vote has been submitted, the current vote is cancelled
      cancelVote(voteTimeout);
    } else {
      // If a vote has been submitted, the button is reset to it's success state
      resetVote(voteTimeout);
    }

  });

  return {
    outline: outline,
    inner: inner,
    tick: tick,
    overlay: overlay
  };

}


// Function to begin vote timer and animation
// Called on mouseover or touchstart
function beginVote() {

  console.log('Vote started');

  // Starts timer which submits a vote on completion
  var timeout = setTimeout(function() {

    submitVote();

  }, defaultAttrs.voteTime);

  // Increases radius of inner circle and fades color in
  inner.animate({
    r: ( d.circle - d.stroke + 1 ),
    fill: defaultAttrs.completionColor
  }, defaultAttrs.voteTime);

  // Fades outline color in
  outline.animate({
    stroke: defaultAttrs.completionColor
  }, defaultAttrs.voteTime);

  // Returns active vote timer
  return timeout;

}


// Function which submits vote when vote timer completes
// Animates explode circle and fades in tick
function submitVote() {

  voted = true;

  console.log('Vote submitted!');

  // Creates explode SVG and sets default attributes
  explode = s.circle(d.half, d.half, 0).attr({
    fill: 'transparent',
    stroke: '#fff',
    strokeOpacity: 0.4,
    strokeWidth: d.stroke
  });

  // Increases radius of explode circle
  explode.animate({
    r: d.circle
  }, defaultAttrs.resetTime, mina.easeout, function() {

    // Resets radius when circle reaches edge of button
    explode.attr({
      r: 0
    });

    // Increases radius to that of the inner circle's default value
    explode.animate({
      r: d.inner
    }, defaultAttrs.elasticTime, mina.elastic);

  });

  // Fades in tick
  tick.animate({
    fillOpacity: 1
  }, defaultAttrs.resetTime, mina.easeout);

}


// Function to cancel a pending vote
// Must be passed the active vote's timer
function cancelVote(timeout) {

  console.log('Vote cancelled');

  // Clears active timer and cancels vote
  clearTimeout(timeout);

  // Stops any in progress animations
  inner.stop();
  outline.stop();

  // Fades inner circle's color back to default
  inner.animate({
    fill: innerAttrs.fill
  }, defaultAttrs.resetTime, mina.easein);

  // Springs inner circle's radius back to default
  inner.animate({
    r: innerAttrs.r
  }, defaultAttrs.elasticTime, mina.elastic);

  // Fades outline circle's color back to default
  outline.animate({
    stroke: outlineAttrs.stroke
  }, defaultAttrs.resetTime, mina.easein);

}


// Function to reset the button after a vote has been submitted
// Called on mouseout or touchend if voted is true
function resetVote(timeout) {

  console.log('Vote reset');

  // Ensures current vote timer is cleared
  // Although it should already have completed
  clearTimeout(timeout);

  // Stops any in progress animations
  inner.stop();
  explode.stop();

  // Springs inner circle's radius back to default
  // Changes it's color to the success color
  inner.animate({
    r: innerAttrs.r,
    fill: defaultAttrs.completionColor
  }, defaultAttrs.elasticTime, mina.elastic);

  // Very quickly fades explode circle out, before removing it completely
  explode.animate({
    strokeOpacity: 0
  }, defaultAttrs.resetTime, mina.linear, function() {

    explode.remove();

  });

}

$.fn.huvr = function(radius) {
  buildButton(radius);
}

$('body').huvr(125);

// $('#voteButton').huvr({
//   radius: 125,
//   color: '#2ecc71',
//   success: function() {
//     alert('Vote submitted!');
//   }
// });