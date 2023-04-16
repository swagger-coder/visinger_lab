window.onload = async function () {
  
  dv = new DomVisual([
    'https://qiniu.sukoshi.xyz/src/images/68135789_p0.jpg',
    'https://qiniu.sukoshi.xyz/src/images/68686407_p0.jpg',
    'https://qiniu.sukoshi.xyz/src/images/banner-1.jpg',
  ])
  av = new AudioVisual()
  

  eventBus.on('play', () => {
    av.source ? av.togglePlay() : dv.alert()
  })

  eventBus.on('submit', () => av.play(false))

  eventBus.on('download', () => {
    av.source ? av.download() : dv.alert()
  })

  eventBus.on('progress', () => {})

}

const eventBus = {
  events: {},
  on (event, fn) {
    if (!this.events[event]) {
      this.events[event] = []
    }
    this.events[event].push(fn)
  },
  emit() {
    let e = this.events[[].shift.call(arguments)]
    if (!e || e.length < 1) return
    e.forEach(fn => {
      fn.apply(this, arguments)
    })
  }
}


function AbortFetch() {
  const controller = new AbortController()

  return {
    abort: controller.abort.bind(controller),
    fetch: function (url, params = {}) {
      return new Promise((reslove, reject) => {
        fetch(url, { signal: controller.signal, ...params }).then(result => {
          if (result.ok) return reslove(result)
          throw new Error('Network response was not ok.')
        }).catch(error => {
          reject(error)
        })
      })
    }
  }
}

