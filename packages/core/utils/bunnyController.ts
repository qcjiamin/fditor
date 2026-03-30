import {
  ALL_FORMATS,
  AudioBufferSink,
  BlobSource,
  CanvasSink,
  Input,
  UrlSource,
  type WrappedAudioBuffer,
  type WrappedCanvas
} from 'mediabunny'

export class BunnyController {
  videoFrameIterator: AsyncGenerator<WrappedCanvas, void, unknown> | null = null
  audioBufferIterator: AsyncGenerator<WrappedAudioBuffer, void, unknown> | null = null
  totalDuration: number = 0
  /** The timestamp within the media file when the playback was started. */
  playbackTimeAtStart: number = 0
  audioContext: AudioContext | null = null
  gainNode: GainNode | null = null
  #muted = false
  #volume = 1
  videoSink: CanvasSink | null = null
  audioSink: AudioBufferSink | null = null
  playing = false
  /** 音频开始播放的媒体时间 */
  audioContextStartTime: number = 0
  nextFrame: WrappedCanvas | null = null
  /**绘制回调，结合fabric编辑器，让外部控制如何绘制；meidiaBunny的demo是直接通过cavans2dContext 来绘制 */
  renderCallback: (canvas: HTMLCanvasElement | OffscreenCanvas) => void = () => {}
  queuedAudioNodes: Set<AudioBufferSourceNode> = new Set()
  /** 是否在视频的渲染循环中 */
  inAnimation: boolean = false
  /**
   * Used to prevent async race conditions. When seekId is incremented, already-running async functions will be prevented
   * from having an effect.
   * 在 updateNextFrame 中生效。如果在等待 next() 的过程中发生了 seek / reload / restart，asyncId 会变。
   * 旧的 updateNextFrame() 就会检测到“我已经过时了”，然后立即退出，不再绘制或处理旧帧， 避免就得异步加载影响新状态。
   */
  asyncId: number = 0
  constructor() {
    // this.init();
  }

  /** 初始化上下文环境，返回第一帧的画面 */
  async init(resource: File | string, renderCallback?: (canvas: HTMLCanvasElement | OffscreenCanvas) => void) {
    const source = resource instanceof File ? new BlobSource(resource) : new UrlSource(resource)
    if (renderCallback) {
      this.renderCallback = renderCallback
    }
    const input = new Input({
      source,
      formats: ALL_FORMATS
    })
    this.playbackTimeAtStart = 0
    // 这里 input 拿取到了基本的媒体信息（轨道、时长等）
    this.totalDuration = await input.computeDuration()

    const videoTrack = await input.getPrimaryVideoTrack()
    const audioTrack = await input.getPrimaryAudioTrack()
    // 加载新的资源，让之前可能存在的异步任务结果变成不处理
    this.asyncId++

    if (videoTrack) {
      if (videoTrack.codec === null) {
        throw new Error('Unsupported video codec. ')
      } else if (!(await videoTrack.canDecode())) {
        throw new Error('Unable to decode the video track. ')
      }
    } else {
      // 在编辑器中，如果是视频，必须要有视频轨道
      throw new Error('No video track found.')
    }
    if (audioTrack) {
      if (audioTrack.codec === null) {
        throw new Error('Unsupported audio codec. ')
      } else if (!(await audioTrack.canDecode())) {
        throw new Error('Unable to decode the audio track. ')
      }
    }
    if (!videoTrack && !audioTrack) {
      throw new Error('No audio or video track found.')
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext

    // We must create the audio context with the matching sample rate for correct acoustic results
    // (especially for low-sample rate files)
    this.audioContext = new AudioContext({ sampleRate: audioTrack?.sampleRate })
    this.gainNode = this.audioContext.createGain()
    this.gainNode.connect(this.audioContext.destination)
    this.updateVolume()

    const videoCanBeTransparent = videoTrack ? await videoTrack.canBeTransparent() : false

    // For video, let's use a CanvasSink as it handles rotation and closing video samples for us.
    // Pool size of 2: We'll only ever have the current and the next frame around, so we only need two canvases.
    this.videoSink =
      videoTrack &&
      new CanvasSink(videoTrack, {
        poolSize: 2,
        fit: 'contain', // In case the video changes dimensions over time
        alpha: videoCanBeTransparent
      })
    // For audio, we'll use an AudioBufferSink to directly retrieve AudioBuffers compatible with the Web Audio API
    this.audioSink = audioTrack && new AudioBufferSink(audioTrack)

    // 适配fabric的绘制，这里初始化后应该拿到第一帧画面并返回
    // this.videoFrameIterator?.return() // Dispose of the current iterator
    // this.videoFrameIterator = this.videoSink.canvases(this.getPlaybackTime())

    // // Get the first two frames
    // const firstFrame = (await this.videoFrameIterator.next()).value ?? null
    // const secondFrame = (await this.videoFrameIterator.next()).value ?? null

    // this.nextFrame = secondFrame
    // if (!firstFrame) throw new Error('No first frame')
    // return firstFrame.canvas
    return await this.startVideoIterator()
  }

  /** 更新音量，考虑到静音和音量的加权平方的情况，需要调用 updateVolume */
  updateVolume() {
    const actualVolume = this.muted ? 0 : this.volume
    this.gainNode!.gain.value = actualVolume ** 2 // Quadratic for more fine-grained control
  }
  get volume() {
    return this.#volume
  }
  set volume(value: number) {
    this.#volume = value
    this.updateVolume()
  }
  get muted() {
    return this.#muted
  }
  set muted(value: boolean) {
    this.#muted = value
    this.updateVolume()
  }

  async startVideoIterator() {
    if (!this.videoSink) return
    /** seek 和 在播放完后执行play时，要消除上次异步的影响。例如连续seek */
    this.asyncId++
    // seek时会重新构建迭代器，所以每次调用都需要清理掉上一次创建的迭代器
    await this.videoFrameIterator?.return()
    this.videoFrameIterator = this.videoSink.canvases(this.getPlaybackTime())
    const firstFrame = (await this.videoFrameIterator.next()).value ?? null
    const secondFrame = (await this.videoFrameIterator.next()).value ?? null
    this.nextFrame = secondFrame
    if (!firstFrame) throw new Error('No first frame')
    return firstFrame.canvas
  }

  async updateNextFrame() {
    const currentAsyncId = this.asyncId

    // We have a loop here because we may need to iterate over multiple frames until we reach a frame in the future
    while (true) {
      const newNextFrame = (await this.videoFrameIterator!.next()).value ?? null
      if (!newNextFrame) {
        break
      }

      if (currentAsyncId !== this.asyncId) {
        break
      }

      const playbackTime = this.getPlaybackTime()
      //* 如果解码出来马上就落后于播放时间的进度了，直接绘制它， 即追帧， 一直追到解码到了超过播放进度的帧
      if (newNextFrame.timestamp <= playbackTime) {
        // Draw it immediately
        // context.clearRect(0, 0, canvas.width, canvas.height)
        // context.drawImage(newNextFrame.canvas, 0, 0)
        if (!this.renderCallback) throw new Error('No render callback')
        // 消费产出的帧
        this.renderCallback(newNextFrame.canvas)
      } else {
        // Save it for later
        this.nextFrame = newNextFrame
        break
      }
    }
  }

  render(requestFrame = true) {
    const playbackTime = this.getPlaybackTime()
    if (playbackTime >= this.totalDuration) {
      this.pause()
      this.playbackTimeAtStart = playbackTime
    }
    //* 暂停时，playbackTime不变，用这个判断可以让循环空转，暂停迭代器执行解码
    if (this.nextFrame && this.nextFrame.timestamp <= playbackTime) {
      this.renderCallback(this.nextFrame.canvas)
      this.nextFrame = null

      this.updateNextFrame()
    }
    if (requestFrame) {
      requestAnimationFrame(() => this.render())
    }
  }

  /** Loops over the audio buffer iterator, scheduling the audio to be played in the audio context. */
  async runAudioIterator() {
    if (!this.audioSink) return
    // To play back audio, we loop over all audio chunks (typically very short) of the file and play them at the correct
    // timestamp. The result is a continuous, uninterrupted audio signal.
    for await (const { buffer, timestamp } of this.audioBufferIterator!) {
      const node = this.audioContext!.createBufferSource()
      node.buffer = buffer
      node.connect(this.gainNode!)

      const startTimestamp = this.audioContextStartTime! + timestamp - this.playbackTimeAtStart

      // Two cases: Either, the audio starts in the future or in the past
      if (startTimestamp >= this.audioContext!.currentTime) {
        // If the audio starts in the future, easy, we just schedule it
        node.start(startTimestamp)
      } else {
        // If it starts in the past, then let's only play the audible section that remains from here on out
        node.start(this.audioContext!.currentTime, this.audioContext!.currentTime - startTimestamp)
      }

      this.queuedAudioNodes.add(node)
      //* 播放完和调用 node.stop 都会触发 onended，让node自然被清理
      node.onended = () => {
        this.queuedAudioNodes.delete(node)
      }

      // If we're more than a second ahead of the current playback time, let's slow down the loop until time has
      // passed.
      // 最新解码出数据的时间戳比当前播放进度快1s以上的话，降低解码频率以节省资源
      if (timestamp - this.getPlaybackTime() >= 1) {
        await new Promise<void>((resolve) => {
          const id = setInterval(() => {
            if (timestamp - this.getPlaybackTime() < 1) {
              clearInterval(id)
              resolve()
            }
          }, 100)
        })
      }
    }
  }

  //#region 播放控制*/
  /** Returns the current playback time in the media file. 播放时由音频的时间戳来决定*/
  getPlaybackTime = () => {
    if (this.playing) {
      // To ensure perfect audio-video sync, we always use the audio context's clock to determine playback time, even
      // when there is no audio track.
      return this.audioContext!.currentTime - this.audioContextStartTime! + this.playbackTimeAtStart
    } else {
      return this.playbackTimeAtStart
    }
  }

  async seek(time: number) {
    // const wasPlaying = this.playing
    if (this.playing) {
      this.pause()
    }
    if (time > this.totalDuration) throw new Error('time is out of range when seeking')
    this.playbackTimeAtStart = time
    const seekFrame = await this.startVideoIterator()
    if (!this.renderCallback) throw new Error('No render callback')
    this.renderCallback(seekFrame!)
    // if (wasPlaying && this.playbackTimeAtStart < this.totalDuration) {
    // void this.play();
  }

  async play() {
    //如果未启动，启动一个视频的渲染循环
    if (!this.inAnimation) {
      void this.render()
      this.inAnimation = true
    }

    if (this.audioContext?.state === 'suspended') {
      // 关联硬件设备
      this.audioContext.resume()
    }
    //? 单独的视频播放器需要这个，基于时间线的编辑器，没有视频循环功能，不需要这个
    //* 编辑器依然要这个，因为事件状态保存在自身内部，如果先播放第一遍，
    //* 播放第二遍，到达视频开始位置时，就满足这个判断了，此时就需要创建新的迭代器
    if (this.getPlaybackTime() === this.totalDuration) {
      // If we're at the end, let's snap back to the start
      this.playbackTimeAtStart = 0
      await this.startVideoIterator()
    }
    this.audioContextStartTime = this.audioContext!.currentTime
    this.playing = true

    if (this.audioSink) {
      // Start the audio iterator
      void this.audioBufferIterator?.return()
      this.audioBufferIterator = this.audioSink?.buffers(this.getPlaybackTime())
      void this.runAudioIterator()
    }
  }

  pause() {
    this.playbackTimeAtStart = this.getPlaybackTime()
    this.playing = false
    this.audioBufferIterator?.return() // 中止迭代器，哪怕是在迭代中
    this.audioBufferIterator = null // 每次播放时重新构建迭代器
    // Stop all audio nodes that were already queued to play
    for (const node of this.queuedAudioNodes) {
      node.stop()
    }
    this.queuedAudioNodes.clear()
  }
  //#endregion
}
