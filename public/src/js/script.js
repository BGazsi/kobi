function ready(fn) {
  if (document.readyState !== 'loading') {
    fn()
  } else if (document.addEventListener) {
    document.addEventListener('DOMContentLoaded', fn)
  } else {
    document.attachEvent('onreadystatechange', function() {
      if (document.readyState !== 'loading')
        fn()
    })
  }
}

function deviceOS() {
  let useragent = navigator.userAgent;

  if(useragent.match(/Android/i)) {
    return 'android';
  } else if(useragent.match(/webOS/i)) {
    return 'webos';
  } else if(useragent.match(/iPhone/i)) {
    return 'iphone';
  } else if(useragent.match(/iPod/i)) {
    return 'ipod';
  } else if(useragent.match(/iPad/i)) {
    return 'ipad';
  } else if(useragent.match(/Windows Phone/i)) {
    return 'windows phone';
  } else if(useragent.match(/SymbianOS/i)) {
    return 'symbian';
  } else if(useragent.match(/RIM/i) || useragent.match(/BB/i)) {
    return 'blackberry';
  } else {
    return false;
  }
}

const slider = {
  init: function () {
    if (!deviceOS() && window.innerHeight < 700) {
      document.querySelector('footer').classList.add('hidden')
      document.querySelector('.info').style.display = 'block'
      document.querySelector('header').style.position = 'absolute'
    }
    if (!!deviceOS() || window.innerWidth <= 1023  || window.innerHeight < 700) {
      document.querySelector('body').classList.add('continuous')
      document.querySelectorAll('.shape-wrap').forEach(elem => {
        elem.classList.add('hidden')
      })
      return
    }
    window.scrollTo({}, 0)
    document.querySelector('body').style.overflow = 'hidden'
    window.addEventListener('wheel', this.scrollEventHandler.bind(this))
  },
  scrollEventHandler: function (event) {
    event.preventDefault()
    if (this.isScrolling) {
      return false
    }
    this.isScrolling = true

    if (event.deltaY > 0) {
      this.downScrollHandler()
    } else {
      this.upScrollHandler()
    }

    setTimeout(() => {
      this.isScrolling = false
    }, 1200)
    return false
  },
  downScrollHandler: function () {
    let activeSlide = document.querySelector('.slide.active');
    let newActiveSlide = document.querySelector('.slide.active + .slide')
    this.downScrollAnimation(activeSlide, newActiveSlide)
    this.changeSlide(newActiveSlide)
  },
  downScrollAnimation: function (activeSlide, newActiveSlide) {
    if (!newActiveSlide || !activeSlide) {
      return
    }
    let shape = activeSlide.querySelector('svg.shape');
    let path = shape.querySelector('path');
    let pathInitHtml = activeSlide.querySelector('.shape-wrap').innerHTML
    let newActiveYTransformation = !!activeSlide.style.transform.split('(')[1] ? +activeSlide.style.transform.split('(')[1].split(')')[0].split('v')[0] - 202 : '-202'
    newActiveSlide.style.transform = 'translateY(' + newActiveYTransformation + 'vh)'

    anime({
      targets: activeSlide,
      duration: 1100,
      easing: 'easeInOutSine',
      translateY: newActiveYTransformation + 'vh'
    });

    anime({
      targets: shape,
      scaleY: [
        {value:[0.8,1.8],duration: 550,easing: 'easeInQuad'},
        {value:1,duration: 550,easing: 'easeOutQuad'}
      ]
    });

    anime({
      targets: path,
      duration: 1100,
      easing: 'easeOutQuad',
      d: path.getAttribute('pathdata:id')
    });

    setTimeout(() => {
      shape.innerHTML = pathInitHtml
    }, 1100)
  },
  upScrollHandler: function () {
    let activeSlide = document.querySelector('.slide.active');
    let newActiveSlide = document.querySelector('.slide.active').previousElementSibling
    this.upScrollAnimation(activeSlide, newActiveSlide)
    this.changeSlide(newActiveSlide, 100)
  },
  upScrollAnimation: function (activeSlide, newActiveSlide) {
    if (!newActiveSlide || !activeSlide) {
      return
    }
    let tempActiveYTransformation = !!activeSlide.style.transform.split('(')[1] ? +activeSlide.style.transform.split('(')[1].split(')')[0].split('v')[0] + 100 : '100'
    let newActiveYTransformation = !!activeSlide.style.transform.split('(')[1] ? +activeSlide.style.transform.split('(')[1].split(')')[0].split('v')[0] + 202 : '202'

    newActiveSlide.querySelector('.shape-wrap').classList.add('hidden')
    activeSlide.style.transform = 'translateY(' + tempActiveYTransformation + 'vh)'
    newActiveSlide.style.transform = 'translateY(' + tempActiveYTransformation + 'vh)'

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

    setTimeout(() => {
      newActiveSlide.querySelector('.shape-wrap').classList.remove('hidden')
    }, 550)
  },
  changeSlide: function (slide, timeout) {
    if (!slide) {
      return false
    }
    timeout = timeout || 700
    document.querySelector('.slide.active').classList.remove('active')
    slide.classList.add('active')

    setTimeout(() => {
      this.changeTheme(slide)
    }, timeout)
  },
  changeTheme: function (slide) {
    let themePath = slide.getAttribute('data-theme')
    document.querySelectorAll('[data-theme-dependent="1"]').forEach(elem => {
      let newSrc = elem.getAttribute('src').replace(new RegExp(/\/(light|dark)-theme/g), '/' + themePath)
      elem.setAttribute('src', newSrc)
    })
    let body = document.querySelector('body')
    body.classList.remove('light-theme', 'dark-theme')
    body.classList.add(themePath)
    document.querySelector('[data-ref="footer"]').classList.toggle('hidden', slide.getAttribute('data-disable-footer'))
  }
}

function Carousel (element) {
  this.init = function (element) {
    this.element = element
    this.transform = 0
    this.elemNumber = this.element.getAttribute('data-elem-number') || 3
    this.elemWidth = 100 / this.elemNumber
    this.nextButton = this.element.parentElement.querySelector('[data-ref="next"]')
    this.prevButton = this.element.parentElement.querySelector('[data-ref="prev"]')
    this.nextButton.addEventListener('click', this.showNext.bind(this))
    this.prevButton.addEventListener('click', this.showPrev.bind(this))
  }
  this.showNext = function () {
    this.transform -= this.elemWidth
    this.element.querySelector('.carousel-inner').style.transform = 'translateX(' + this.transform + '%)'
    this.setButtonViewStates()
  }
  this.showPrev = function () {
    this.transform += this.elemWidth
    this.element.querySelector('.carousel-inner').style.transform = 'translateX(' + this.transform + '%)'
    this.setButtonViewStates()
  }
  this.setButtonViewStates = function () {
    this.nextButton.classList.toggle('hidden', this.transform <= -(this.element.querySelectorAll('.col').length - this.elemNumber) * this.elemWidth)
    this.prevButton.classList.toggle('hidden', this.transform >= 0)
  }
  this.init(element)
}

const main = function () {
  slider.init()
  document.querySelectorAll('[data-component~="carousel"]').forEach(carouselElem => {
    new Carousel(carouselElem)
  })
}

ready(main)
