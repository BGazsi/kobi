'use strict';

function ready(fn) {
  if (document.readyState !== 'loading') {
    fn();
  } else if (document.addEventListener) {
    document.addEventListener('DOMContentLoaded', fn);
  } else {
    document.attachEvent('onreadystatechange', function () {
      if (document.readyState !== 'loading') fn();
    });
  }
}

function deviceOS() {
  var useragent = navigator.userAgent;

  if (useragent.match(/Android/i)) {
    return 'android';
  } else if (useragent.match(/webOS/i)) {
    return 'webos';
  } else if (useragent.match(/iPhone/i)) {
    return 'iphone';
  } else if (useragent.match(/iPod/i)) {
    return 'ipod';
  } else if (useragent.match(/iPad/i)) {
    return 'ipad';
  } else if (useragent.match(/Windows Phone/i)) {
    return 'windows phone';
  } else if (useragent.match(/SymbianOS/i)) {
    return 'symbian';
  } else if (useragent.match(/RIM/i) || useragent.match(/BB/i)) {
    return 'blackberry';
  } else {
    return false;
  }
}

function indexInParent(node) {
  var children = node.parentNode.childNodes;
  var num = 0;
  for (var i = 0; i < children.length; i++) {
    if (children[i] === node) {
      return num;
    }
    if (children[i].nodeType === 1) {
      num++;
    }
  }
  return -1;
}

var slider = {
  init: function init() {
    if (!!deviceOS() || window.innerWidth <= 1023) {
      document.querySelectorAll('.shape-wrap').forEach(function (elem) {
        elem.classList.add('hidden');
      });
      return;
    }
    window.scrollTo({}, 0);
    window.addEventListener('wheel', this.scrollEventHandler.bind(this));
  },
  scrollEventHandler: function scrollEventHandler(event) {
    var _this = this;

    event.preventDefault();
    if (this.isScrolling) {
      return false;
    }
    this.isScrolling = true;

    if (event.deltaY > 0) {
      this.downScrollHandler();
    } else {
      this.upScrollHandler();
    }

    setTimeout(function () {
      _this.isScrolling = false;
    }, 1200);
    return false;
  },
  downScrollHandler: function downScrollHandler() {
    var activeSlide = document.querySelector('.slide.active');
    var newActiveSlide = document.querySelector('.slide.active + .slide');
    this.downScrollAnimation(activeSlide, newActiveSlide);
    this.changeSlide(newActiveSlide);
    this.setIndicators(newActiveSlide);
  },
  downScrollAnimation: function downScrollAnimation(activeSlide, newActiveSlide) {
    if (!newActiveSlide || !activeSlide) {
      return;
    }
    var shape = activeSlide.querySelector('svg.shape');
    var path = shape.querySelector('path');
    var pathInitHtml = activeSlide.querySelector('.shape-wrap').innerHTML;
    var newActiveYTransformation = !!activeSlide.style.transform.split('(')[1] ? +activeSlide.style.transform.split('(')[1].split(')')[0].split('v')[0] - 202 : '-202';
    newActiveSlide.style.transform = 'translateY(' + newActiveYTransformation + 'vh)';

    anime({
      targets: activeSlide,
      duration: 1100,
      easing: 'easeInOutSine',
      translateY: newActiveYTransformation + 'vh'
    });

    anime({
      targets: shape,
      scaleY: [{ value: [0.8, 1.8], duration: 550, easing: 'easeInQuad' }, { value: 1, duration: 550, easing: 'easeOutQuad' }]
    });

    anime({
      targets: path,
      duration: 1100,
      easing: 'easeOutQuad',
      d: path.getAttribute('pathdata:id')
    });

    setTimeout(function () {
      shape.innerHTML = pathInitHtml;
    }, 1100);
  },
  upScrollHandler: function upScrollHandler() {
    var activeSlide = document.querySelector('.slide.active');
    var newActiveSlide = document.querySelector('.slide.active').previousElementSibling;
    this.upScrollAnimation(activeSlide, newActiveSlide);
    this.changeSlide(newActiveSlide, 100);
    this.setIndicators(newActiveSlide);
  },
  upScrollAnimation: function upScrollAnimation(activeSlide, newActiveSlide) {
    if (!newActiveSlide || !activeSlide) {
      return;
    }
    var tempActiveYTransformation = !!activeSlide.style.transform.split('(')[1] ? +activeSlide.style.transform.split('(')[1].split(')')[0].split('v')[0] + 100 : '100';
    var newActiveYTransformation = !!activeSlide.style.transform.split('(')[1] ? +activeSlide.style.transform.split('(')[1].split(')')[0].split('v')[0] + 202 : '202';

    newActiveSlide.querySelector('.shape-wrap').classList.add('hidden');
    activeSlide.style.transform = 'translateY(' + tempActiveYTransformation + 'vh)';
    newActiveSlide.style.transform = 'translateY(' + tempActiveYTransformation + 'vh)';

    anime({
      targets: activeSlide,
      duration: 550,
      easing: 'easeInOutSine',
      translateY: newActiveYTransformation + 'vh'
    });
    anime({
      targets: newActiveSlide,
      duration: 550,
      easing: 'easeInOutSine',
      translateY: newActiveYTransformation + 'vh'
    });

    setTimeout(function () {
      newActiveSlide.querySelector('.shape-wrap').classList.remove('hidden');
    }, 550);
  },
  changeSlide: function changeSlide(slide, timeout) {
    var _this2 = this;

    if (!slide) {
      return false;
    }
    timeout = timeout || 700;
    document.querySelector('.slide.active').classList.remove('active');
    slide.classList.add('active');

    setTimeout(function () {
      _this2.changeTheme(slide);
    }, timeout);
  },
  changeTheme: function changeTheme(slide) {
    var themePath = slide.getAttribute('data-theme');
    document.querySelectorAll('[data-theme-dependent="1"]').forEach(function (elem) {
      var newSrc = elem.getAttribute('src').replace(new RegExp(/\/(light|dark)-theme/g), '/' + themePath);
      elem.setAttribute('src', newSrc);
    });
    var body = document.querySelector('body');
    body.classList.remove('light-theme', 'dark-theme');
    body.classList.add(themePath);
    document.querySelector('[data-ref="footer"]').classList.toggle('hidden', slide.getAttribute('data-disable-footer'));
  },
  setIndicators: function setIndicators(newActiveSlide) {
    if (!newActiveSlide) {
      return;
    }

    document.querySelectorAll('[data-ref~="indicators"]').forEach(function (indicators) {
      indicators.querySelectorAll('.indicator').forEach(function (indicator) {
        indicator.classList.toggle('active', indexInParent(indicator) <= indexInParent(newActiveSlide));
      });
    });
  }
};

function Carousel(element) {
  this.init = function (element) {
    this.element = element;
    this.transform = 0;
    this.elemNumber = this.element.getAttribute('data-elem-number') || 3;
    this.elemWidth = 100 / this.elemNumber;
    this.nextButton = this.element.querySelector('[data-ref="next"]');
    this.prevButton = this.element.querySelector('[data-ref="prev"]');
    this.nextButton.addEventListener('click', this.showNext.bind(this));
    this.prevButton.addEventListener('click', this.showPrev.bind(this));
  };
  this.showNext = function () {
    this.transform -= this.elemWidth;
    this.element.querySelector('.carousel-inner').style.transform = 'translateX(' + this.transform + '%)';
    this.setButtonViewStates();
  };
  this.showPrev = function () {
    this.transform += this.elemWidth;
    this.element.querySelector('.carousel-inner').style.transform = 'translateX(' + this.transform + '%)';
    this.setButtonViewStates();
  };
  this.setButtonViewStates = function () {
    this.nextButton.classList.toggle('hidden', this.transform <= -(this.element.querySelectorAll('.col').length - this.elemNumber) * this.elemWidth);
    this.prevButton.classList.toggle('hidden', this.transform >= 0);
  };
  this.init(element);
}

var main = function main() {
  slider.init();
  document.querySelectorAll('[data-component~="carousel"]').forEach(function (carouselElem) {
    new Carousel(carouselElem);
  });
};

ready(main);