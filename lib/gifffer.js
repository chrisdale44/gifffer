(function webpackUniversalModuleDefinition(root, factory) {
  if (typeof exports === 'object' && typeof module === 'object')
    module.exports = factory();
  else if (typeof define === 'function' && define.amd)
    define("Gifffer", [], factory);
  else if (typeof exports === 'object')
    exports["Gifffer"] = factory();
  else
    root["Gifffer"] = factory();
})(this, function() {
var d = document;

var Gifffer = function(options) {
  var gifs = [],
      images = d.querySelectorAll('[data-gifffer]');

  for (var i = 0; i < images.length; i++) process(images[i], gifs, options);
  // returns each gif container to be usable programmatically
  return gifs;
};

function parseStyles(styles) {
  var stylesStr = '';
  for (prop in styles) stylesStr += prop + ':' + styles[prop] + ';';
  return stylesStr;
}

function createContainer(gif, altText) {
  var alt,
      container = d.createElement('BUTTON');

  container.setAttribute('aria-hidden', 'true');
  container.setAttribute('style', 'position:relative;');
  container.setAttribute('class', 'gifffer-container');

  // creating play button
  var play = d.createElement('DIV');
  play.setAttribute('class', 'gifffer-play-button');

  // create alt text if available
  if (altText) {
    alt = d.createElement('p');
    alt.setAttribute('class', 'gifffer-alt');
    alt.setAttribute('style', 'border:0;clip:rect(0 0 0 0);height:1px;overflow:hidden;padding:0;position:absolute;width:1px;');
    alt.innerText = altText + ', image';
  }

  // insert container to the DOM in place of the gif.
  gif.parentNode.replaceChild(container, gif);
  // insert button and gif to the container
  container.appendChild(gif);
  container.appendChild(play);
  
  altText ? container.parentNode.insertBefore(alt, container.nextSibling) : null;
  return { 
    container: container, 
    play: play 
  };
};

function process(gif, gifs) {
  var url, container, canvas, duration, play, gif, playing = false, 
      cc, isCanvas, durationTimeout, altText;

  url = gif.getAttribute('data-gifffer');
  duration = gif.getAttribute('data-gifffer-duration');
  altText = gif.getAttribute('data-gifffer-alt');
  gif.style.display = 'block';

  // creating the canvas
  canvas = document.createElement('canvas');
  isCanvas = !!(canvas.getContext && canvas.getContext('2d'));
  if (isCanvas) cc = createContainer(gif, altText);

  // waiting for image load
  gif.onload = function() {
    if (!isCanvas) return;

    // creating the container
    if (!cc) cc = createContainer(gif, altText);
    container = cc.container;
    play = cc.play;

    // add the container to the gif arraylist
    gifs.push(container);

    // canvas
    canvas.width = gif.width;
    canvas.height = gif.height;
    canvas.getContext('2d').drawImage(gif, 0, 0, gif.width, gif.height);
    container.appendChild(canvas);
    canvas.setAttribute('style', 'height: 100%; width:100%;');

    // listen for image click
    container.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      clearTimeout(durationTimeout);
      if (!playing) {
        playing = true;
        play.style.visibility = 'hidden';
        gif.style.visibility = 'visible';
        canvas.style.visibility = 'hidden';
        if (parseInt(duration) > 0) {
          durationTimeout = setTimeout(function() {
            playing = false;
            play.style.visibility = 'visible';
            gif.style.visibility = 'hidden';
            canvas.style.visibility = 'visible';
          }, duration);
        }
      } else {
        playing = false;
        play.style.visibility = 'visible';
        gif.style.visibility = 'hidden';
        canvas.style.visibility = 'visible';
      }
    });
  };
  gif.src = url;
}

return Gifffer;

});
