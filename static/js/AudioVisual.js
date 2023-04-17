class AudioVisual {
  constructor (options) {
    this.canvas = document.querySelector('#music-canvas')
    this.ctx = this.canvas.getContext('2d')

    this.ac = new AudioContext()
    this.analyser = this.ac.createAnalyser()
    this.analyser.fftSize = 128
    this.analyser.connect(this.ac.destination)

    this.sourceDuration = 0
    this.startTime = 0
    this.loading = false
    this.started = false
    this.songInfo = null
    this.af = null
    this.abf = null
    this.beginTime = (new Date()).getTime() / 1000
    this.passTime = 0
    this.currentTime = 0
    this.seekLoc = 0
    this.endNature = true

    this.defaultSetting = {
      centerX: 0.5,
      centerY: 0.7,
      lineWidth: 6,
      lineSpacing: 2,
      lineColor: '#e93b81',
      lineColorO: 1,
      shadowColor: '#231018',
      shadowColorO: 1,
      shadowBlur: 2,
      isRound: true
    }
    this.opt = Object.assign({}, this.defaultSetting, options)

    this.handleEvent()
    this.resizeCavnas()

    window.addEventListener('resize', this.resizeCavnas.bind(this))
  }

  colorToRGB (color) {
    if (color.length !== 7 && !color.startsWith('#')) return [0, 0, 0]
    let rgb = []
    color = color.replace('#', '')
    for (let i = 0; i < 3; i++) {
      rgb.push(parseInt(color.substring(i * 2, i * 2 + 2), 16))
    }
    return rgb
  }

  handleEvent () {
    eventBus.emit('echosetting', this.defaultSetting)
    eventBus.on('setting', data => {
      this.opt = Object.assign({}, this.opt, data)
    })

    eventBus.on('showHover', ({event, sArea, sHover, insTime}) => {
    
      var seekBarPos = sArea.getBoundingClientRect().left;
      // let seekBarPos = sArea.offset()    // 获取进度条长度
      var seekT = event.clientX - seekBarPos  //获取当前鼠标在进度条上的位置
      this.seekLoc = this.sourceDuration * (seekT / sArea.offsetWidth) //当前鼠标位置的音频播放秒数： 音频长度(单位：s)*（鼠标在进度条上的位置/进度条的宽度）
      // console.log(seekT)
      sHover.style.width = seekT + 'px'  //设置鼠标移动到进度条上变暗的部分宽度
      var cM = this.seekLoc / 60    // 计算播放了多少分钟： 音频播放秒速/60
      
      let ctMinutes = Math.floor(cM)  // 向下取整
      let ctSeconds = Math.floor(this.seekLoc - ctMinutes * 60) // 计算播放秒数
      
      if( (ctMinutes < 0) || (ctSeconds < 0) )
        return;
      
      if( (ctMinutes < 0) || (ctSeconds < 0) )
        return;
      
      if(ctMinutes < 10)
        ctMinutes = '0'+ctMinutes;
      if(ctSeconds < 10)
        ctSeconds = '0'+ctSeconds;
      if( isNaN(ctMinutes) || isNaN(ctSeconds) )
          insTime.innerText = '--:--';
      else
          insTime.innerText = ctMinutes+':'+ctSeconds;  // 设置鼠标移动到进度条上显示的信息
      // console.log(insTime.innerText)
      // insTime.css({'left':seekT,'margin-left':'-21px'}).fadeIn(0);
      insTime.style.left = seekT + 'px';
      insTime.style.marginLeft = '-21px';
      insTime.style.opacity = 0.7;
      insTime.style.visibility = 'visible';
      // insTime.classList.add('fade-in');
    })

    eventBus.on('hideHover', ({sHover, insTime}) => {
      sHover.style.width = 0;
      insTime.innerText = '00:00'
      insTime.style.left = '0px'
      insTime.style.marginLeft = '0px'
      insTime.style.opacity = 0;
    })

    eventBus.on('timeupdate', () => {
      nTime = new Date();      // 获取当前时间
      nTime = nTime.getTime(); // 将该时间转化为毫秒数

        // 计算当前音频播放的时间
      curMinutes = Math.floor(audio.currentTime  / 60);
          curSeconds = Math.floor(audio.currentTime  - curMinutes * 60);
          
      // 计算当前音频总时间
      durMinutes = Math.floor(audio.duration / 60);
      durSeconds = Math.floor(audio.duration - durMinutes * 60);
          
      // 计算播放进度百分比
      playProgress = (audio.currentTime  / audio.duration) * 100;
          
          // 如果时间为个位数，设置其格式
      if(curMinutes < 10)
        curMinutes = '0'+curMinutes;
      if(curSeconds < 10)
        curSeconds = '0'+curSeconds;
      
      if(durMinutes < 10)
        durMinutes = '0'+durMinutes;
      if(durSeconds < 10)
        durSeconds = '0'+durSeconds;
          
      if( isNaN(curMinutes) || isNaN(curSeconds) )
          tProgress.text('00:00');
      else
          tProgress.text(curMinutes+':'+curSeconds);
      
      if( isNaN(durMinutes) || isNaN(durSeconds) )
          totalTime.text('00:00');
      else
          totalTime.text(durMinutes+':'+durSeconds);
      
      if( isNaN(curMinutes) || isNaN(curSeconds) || isNaN(durMinutes) || isNaN(durSeconds) )
          time.removeClass('active');
      else
          time.addClass('active');

          // 设置播放进度条的长度
      seekBar.width(playProgress+'%');
          
          // 进度条为100 即歌曲播放完时
      if( playProgress == 100 )
      {
          playPauseBtn.attr('class','btn play-pause icon-jiediankaishi iconfont'); // 显示播放按钮
          seekBar.width(0);              // 播放进度条重置为0
          tProgress.text('00:00');       // 播放时间重置为 00:00
          musicImgs.removeClass('buffering').removeClass('active');  // 移除相关类名
          clearInterval(buffInterval);   // 清除定时器
          selectTrack(1);  // 添加这一句，可以实现自动播放
      }
      
    })

    eventBus.on('clickBar', () => {
      this.currentTime = this.seekLoc
      this.beginTime = (new Date()).getTime() / 1000
      console.log(this.source)
      console.log(this.ac.state)
      if (this.source && this.ac.state === 'suspended') {
        this.togglePlay()
      }else if(!this.source){
        return;
      }
      this.endNature = false
      this.source.stop()
      this.started = false
    })
  }

  async loadData () {
    // const { songInfo } = this
    this.singer = this.getOption("#singer-list")
    this.song = this.getOption("#song-list")
    this.mode = this.getOption("#mode-list")

    if (this.af) {
      this.af.abort()
      this.af = null
    }

    this.af = AbortFetch()
    this.loading = true
    if(this.source){
      this.source.stop()
      this.started = false
    }

    // "/wavs?"+"singer="+this.singer+"&song="+this.song+"&mode="+this.mode
    let ab = await this.af.fetch("https://qiniu.sukoshi.xyz/cloud-music/Aimer%20-%20%E8%8A%B1%E3%81%B2%E3%82%99%E3%82%89%E3%81%9F%E3%81%A1%E3%81%AE%E3%83%9E%E3%83%BC%E3%83%81.mp3")
      .then(result => result.arrayBuffer())
      .catch(({ name }) => {
        if (name === 'AbortError') return console.log('cancel')
        this.loading = false
        eventBus.emit('change', {
          state: "error",
          duration: "T_T",
          currentTime: "T_T",
        })
        return alert("初始化数据失败，请尝试刷新页面（◔‸◔）")
      })
    console.log(ab)
    this.abf = ab// 必须复制，否则会解析失败
    console.log()
    if (!ab) return
    this.decodeAudioData(ab.slice(0), true)
  }
  
  decodeAudioData(ab, isInit = false) {
    let { ac, analyser } = this
    this.source = ac.createBufferSource()
    ac.decodeAudioData(ab, buffer => {
      if(isInit || this.endNature) {
        this.currentTime = 0
      }
      this.endNature = true
      this.beginTime = (new Date()).getTime() / 1000
      this.source.buffer = buffer
      this.buffer = buffer
      this.source.connect(analyser)
      this.source.start(0, this.currentTime)
      this.source.onended = () => {
        this.onended && this.onended()
        this.decodeAudioData(this.abf.slice(0))
      }
      if(isInit) {
        console.log("init")
        // lrc: "/lyrics?"+"singer="+this.singer+"&song="+this.song+"&mode="+this.mode
        // title: this.singer + " - " + this.song
        eventBus.emit('init', { title: "Aimer - 花びらたちのマーチ", 
        lrc:"https://qiniu.sukoshi.xyz/cloud-music/Aimer%20-%20%E8%8A%B1%E3%81%B2%E3%82%99%E3%82%89%E3%81%9F%E3%81%A1%E3%81%AE%E3%83%9E%E3%83%BC%E3%83%81.txt", duration: this.source.buffer.duration})
        let dom = document.querySelector('.icon-play1')
        dom.classList.add('click')
      }
      this.loading = false
      this.started = true
      this.startTime = this.currentTime
      this.sourceDuration = buffer.duration
      console.log(ac.currentTime);
      this.refreshUI()
    }, error => {
      console.log(error)
    })
  }

  getOption(id) {
    const select = document.querySelector(id);
    return select.options[select.selectedIndex].value
  }

  stop () {
    let { source, started } = this
    if (source && started) {
      console.log("stopped")
      source.onended = null
      source.stop()
    }
    this.source = null
    this.started = false
  }

  play (isReload = true) {
    if (!isReload && this.loading) return console.log("loading...")
    this.stop()
    this.loadData()
  }

  togglePlay () {
    const { ac } = this
    let dom = document.querySelector('.icon-play1')
    if (ac.state === 'running') {

      dom.classList.remove('click')
      return ac.suspend()
    }else if (ac.state === 'suspended') {
      this.currentTime += this.passTime
      this.beginTime = (new Date()).getTime() / 1000
      dom.classList.add('click')
      return ac.resume()
    }else {
      this.source.start(0)
    }

  }

  resizeCavnas () {
    const { canvas } = this
    this.cw = canvas.width = canvas.clientWidth
    this.ch = canvas.height = canvas.clientHeight
  }

  draw () {
    const { ctx, cw, ch, analyser } = this
    const { lineColor, lineColorO, shadowColor, shadowColorO, shadowBlur, lineWidth, lineSpacing, isRound } = this.opt

    let bufferLen = analyser.frequencyBinCount
    let buffer = new Uint8Array(bufferLen)
    analyser.getByteFrequencyData(buffer)

    let cx = this.cw * this.opt.centerX
    let cy = this.ch * this.opt.centerY
    let sp = (lineWidth + lineSpacing) / 2
    
    ctx.clearRect(0, 0, cw, ch)
    ctx.beginPath()
    ctx.lineWidth = lineWidth
    ctx.shadowBlur = shadowBlur
    ctx.strokeStyle = `rgba(${this.colorToRGB(lineColor).join(',')}, ${lineColorO})`
    ctx.shadowColor = `rgba(${this.colorToRGB(shadowColor).join(',')}, ${shadowColorO})`
    if (isRound) {
      ctx.lineCap = "round"
    } else {
      ctx.lineCap = "butt"
    }
  
    for (let i = 0; i < bufferLen; i++) {
      let h = buffer[i] + 1
      let xl = cx - i * (lineWidth + lineSpacing) - sp
      let xr = cx + i * (lineWidth + lineSpacing) + sp
      let y1 = cy - h / 2
      let y2 = cy + h / 2
      ctx.moveTo(xl, y1)
      ctx.lineTo(xl, y2)
      ctx.moveTo(xr, y1)
      ctx.lineTo(xr, y2)
    }

    ctx.stroke()
    ctx.closePath()
  }

  refreshUI () {
    const { ac: { state, currentTime }, source, loading, started, startTime } = this
    
    this.draw()
    try {
      if (state === 'running' && !loading && started) {
        this.passTime = (new Date()).getTime() / 1000 - this.beginTime
        // this.currentTime = this.nowTime
        // console.log(this.currentTime - this.beginTime)
        eventBus.emit('change', {
          state,
          duration: source.buffer.duration,
          currentTime: this.currentTime + this.passTime,
        })
      }
    } catch (error) {
      console.log(error)
    }
    requestAnimationFrame(this.refreshUI.bind(this))
  }

  download() {
    // buffer必须是arraybuffer对象, 传audiobuffer对象会报错
    const buffer = this.abf;
  
    console.log(buffer);
    // 创建一个 Blob 对象来表示二进制数据
    let blob = new Blob([buffer], { type: 'audio/wav' });
  
    // 创建一个下载链接
    let url = URL.createObjectURL(blob);
  
    // 创建一个下载链接元素
    let downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = 'audio.wav'; // 设置下载的文件名
    downloadLink.style.display = 'none';
  
    // 添加到 DOM 中并触发点击事件进行下载
    document.body.appendChild(downloadLink);
    downloadLink.click();
  
    // 清理下载链接和 Blob URL
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);
  }

  
  
}