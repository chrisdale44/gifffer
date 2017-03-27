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
var playSize = 60;

var Gifffer = function(options) {
  var images, i, gifs = [];

  images = d.querySelectorAll('[data-gifffer]');
  for (i = 0; i < images.length; i++) process(images[i], gifs, options);
  // returns each gif container to be usable programmatically
  return gifs;
};

function parseStyles(styles) {
  var stylesStr = '';
  for (prop in styles) stylesStr += prop + ':' + styles[prop] + ';';
  return stylesStr;
}

function createContainer(w, h, gif, altText, opts) {
  var alt,
      container = d.createElement('BUTTON');
      cls = gif.getAttribute('class');
      id = gif.getAttribute('id');
      playButtonStyles = opts && opts.playButtonStyles ? parseStyles(opts.playButtonStyles) : [
        'width:' + playSize + 'px',
        'height:' + playSize + 'px',
        'border-radius:' + (playSize/2) + 'px',
        'background:rgba(0, 0, 0, 0.3)',
        'position:absolute',
        'top:50%',
        'left:50%',
        'margin:-' + (playSize/2) + 'px'
      ].join(';'),
      playButtonIconStyles = opts && opts.playButtonIconStyles ? parseStyles(opts.playButtonIconStyles) : [
        'width: 0',
        'height: 0',
        'border-top: 14px solid transparent',
        'border-bottom: 14px solid transparent',
        'border-left: 14px solid rgba(0, 0, 0, 0.5)',
        'position: absolute',
        'left: 26px',
        'top: 16px'
      ].join(';');

  cls ? container.setAttribute('class', gif.getAttribute('class')) : null;
  id ? container.setAttribute('id', gif.getAttribute('id')) : null;
  container.setAttribute('style', 'position:relative;cursor:pointer;background:none;border:none;padding:0;');
  container.setAttribute('aria-hidden', 'true');

  // creating play button
  var play = d.createElement('DIV');
  play.setAttribute('class', 'gifffer-play-button');
  play.setAttribute('style', playButtonStyles);

  var trngl = d.createElement('DIV');
  trngl.setAttribute('style', playButtonIconStyles);
  play.appendChild(trngl);

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
  container.appendChild(gif)
  container.appendChild(play);
  
  altText ? container.parentNode.insertBefore(alt, container.nextSibling) : null;
  return { 
    container: container, 
    play: play 
  };
};

function calculatePercentageDim (gif, w, h, wOrig, hOrig) {
  var parentDimW = gif.parentNode.offsetWidth;
  var parentDimH = gif.parentNode.offsetHeight;
  var ratio = wOrig / hOrig;

  if (w.toString().indexOf('%') > 0) {
    w = parseInt(w.toString().replace('%', ''));
    w = (w / 100) * parentDimW;
    h = w / ratio;
  } else if (h.toString().indexOf('%') > 0) {
    h = parseInt(h.toString().replace('%', ''));
    h = (h / 100) * parentDimW;
    w = h / ratio;
  }

  return { w: w, h: h };
};

function process(gif, gifs, options) {
  var url, container, canvas, w, h, duration, play, gif, playing = false, cc, isCanvas, durationTimeout, dims, altText;

  url = gif.getAttribute('data-gifffer');
  w = gif.getAttribute('data-gifffer-width');
  h = gif.getAttribute('data-gifffer-height');
  duration = gif.getAttribute('data-gifffer-duration');
  altText = gif.getAttribute('data-gifffer-alt');
  gif.style.display = 'block';

  // creating the canvas
  canvas = document.createElement('canvas');
  isCanvas = !!(canvas.getContext && canvas.getContext('2d'));
  if (w && h && isCanvas) cc = createContainer(w, h, gif, altText, options);

  // waiting for image load
  gif.onload = function() {
    if (!isCanvas) return;

    w = w || gif.width;
    h = h || gif.height;

    // creating the container
    if (!cc) cc = createContainer(w, h, gif, altText, options);
    container = cc.container;
    play = cc.play;
    dims = calculatePercentageDim(container, w, h, gif.width, gif.height);

    // add the container to the gif arraylist
    gifs.push(container);

    // canvas
    canvas.width = gif.width;
    canvas.height = gif.height;
    canvas.getContext('2d').drawImage(gif, 0, 0, gif.width, gif.height);
    container.appendChild(canvas);
    canvas.setAttribute('style', 'height: 100%; width:100%;');
    //container.setAttribute('style', 'position:relative;cursor:pointer;width:' + dims.w + 'px;height:' + dims.h + 'px;background:none;border:none;padding:0;');


    // listening for image click
    container.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      clearTimeout(durationTimeout);
      if (!playing) {
        playing = true;
        btn.style.visibility = 'hidden';
        gif.style.visibility = 'visible';
        canvas.style.visibility = 'hidden';
        if (parseInt(duration) > 0) {
          durationTimeout = setTimeout(function() {
            playing = false;
            $(btn).toggleClass('pause');
            gif.style.visibility = 'hidden';
            canvas.style.visibility = 'visible';
          }, duration);
        }
      } else {
        playing = false;
        btn.style.visibility = 'visible';
        gif.style.visibility = 'hidden';
        canvas.style.visibility = 'visible';
      }
    });
    


    if (w.toString().indexOf('%') > 0 && h.toString().indexOf('%') > 0) {
      container.style.width = w;
      container.style.height = h;
    } else if (w.toString().indexOf('%') > 0) {
      container.style.width = w;
      container.style.height = 'inherit';
    } else if (h.toString().indexOf('%') > 0) {
      container.style.width = 'inherit';
      container.style.height = h;
    } else {
      container.style.width = dims.w + 'px';
      container.style.height = dims.h + 'px';
    }

  };
  gif.src = url;
}

return Gifffer;

});
