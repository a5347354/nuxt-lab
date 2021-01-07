export const state = () => ({
  nowTrack: {
    // 曲目列表中的索引 [-1=無]
    trackIndex: -1,
    // 音樂資料 (deep copy)
    targetTrack: null,
  },
  // 播放設定
  config: {
    // audio tag instance
    audio: null,
    // 總播放時間（秒）
    totalTime: 0,
    // 播放時間（秒）
    nowTime: 0,
    // 音量[0〜1]
    volume: 1,
    // 是否播放 [true/false]
    isPlay: false,
    // 是否暫停 [true/false]
    isPause: false,
    // 是否加載中 [true/false]
    isLoading: false,
    // 重複播放[0=無|1=單歌重複]
    repeat: 0,
    // 當前正在播放的歌曲中 UUID
    uuid: null,
  },
})

export const getters = {
  getTotalTime(state) {
    return state.config.totalTime
  },
  getNowTime(state) {
    return state.config.nowTime
  },
  /**
   * 曲目當前是否正在播放
   * @param {any} state
   */
  isPlayerPlaying(state) {
    return Boolean(state.config.isPlay)
  },
  /**
   * 播放器是否靜音
   * @param state
   */
  isPlayerMuted(state) {
    return Boolean(state.config.volume === 0)
  },
}

export const mutations = {
  /**
   * 正在播放的曲目 > 插入曲目索引
   * @param player
   * @param trackIndex 索引
   */
  SET_TRACK_INDEX(player, trackIndex) {
    if (player.nowTrack.trackIndex !== trackIndex) {
      player.nowTrack.trackIndex = trackIndex
    }
  },
  /**
   * 總播放時間
   * @param player
   * @param time 時間（秒）
   */
  SET_TOTAL_TIME(player, time) {
    player.config.totalTime = time
  },
  /**
   * 設定目前歌曲進度
   * @param player
   * @param time 時間（秒）
   */
  SET_NOW_TIME(player, time) {
    player.config.nowTime = time
  },
  /**
   * 是否播放
   * @param player
   * @param isPlay 是否播放 [true/false]
   */
  SET_IS_PLAY(player, isPlay) {
    player.config.isPlay = isPlay
  },
  /**
   * 是否暫停
   * @param player
   * @param isPause 是否暫停 [true/false]
   */
  SET_IS_PAUSE(player, isPause) {
    player.config.isPause = isPause
  },
  SET_AUDIO(player, audio) {
    player.config.audio = audio
  },
  SET_AUDIO_SRC(player, src) {
    player.config.audio.src = src
    player.config.audio.load()
  },
  /**
   * 設定音量
   * @param player
   * @param volume 音量 [0~1]
   */
  SET_VOLUME(player, volume) {
    player.config.volume = volume
  },
  /**
   * 設定是否為加載狀態
   * @param player
   * @param isLoading 是否加載 [true/false]
   */
  SET_IS_LOADING(player, isLoading) {
    player.config.isLoading = isLoading
  },
}

export const actions = {
  /** Create a audio tag in html and enroll hooks of the audio
   * @param {*} param0
   */
  init({ state, commit, dispatch }) {
    if (window) {
      // For cypress
      window.getPlayerAudio = () => state.config.audio
      const audio = window.document.createElement('audio')
      audio.style.display = 'none' // added to fix ios issue
      audio.autoplay = false // avoid the user has not interacted with your page issue
      audio.oncanplay = () => {
        // 完成音樂信息的加載 seek 也會觸發此 event
        commit('SET_TOTAL_TIME', Number(state.config.audio.duration))
        commit('SET_LIMIT_TIME', Number(state.config.audio.duration))
        commit('SET_IS_LOADING', false)
      }
      audio.onplay = () => {
        commit('SET_IS_PLAY', true)
        commit('SET_IS_PAUSE', false)
        dispatch('setVolume', state.config.volume)
      }
      audio.onpause = () => {
        commit('SET_IS_PLAY', false)
        commit('SET_IS_PAUSE', true)
      }
      audio.ontimeupdate = () => {
        if (state.config.audio) {
          const nowTime = Math.floor(state.config.audio.currentTime)
          if (
            nowTime < state.config.nowTime ||
            nowTime >= state.config.nowTime + 1
          ) {
            commit('SET_NOW_TIME', nowTime)
          }
        }
      }
      audio.onended = () => {
        // 如果正常播放並重複播放一首歌曲，請再次播放
        if (state.config.repeat === 1) {
          dispatch('playTrack', { trackIndex: state.nowTrack.trackIndex })
        }
      }
      audio.onvolumechange = () => {
        commit('SET_VOLUME', state.config.audio.volume)
      }
      audio.onerror = () => {
        console.log(state.config.audio.error)
      }
      window.document.body.appendChild(audio)
      commit('SET_AUDIO', audio)
    }
    if (state.nowTrack.trackIndex > -1 && !state.nowTrack.targetTrack) {
      // 如果targetTrack不存在，則再次執行SET_TRACK_INDEX
      commit('SET_TRACK_INDEX', state.nowTrack.trackIndex)
    }
  },
  /**
   * 停止當前曲目
   * @param {Object} context
   */
  stop({ state, commit }) {
    if (state.config.audio) {
      state.config.audio.pause()
      commit('SET_NOW_TIME', 0)
      commit('SET_IS_LOADING', false)
    }
  },
  playOrPause({ state, commit, dispatch }) {
    const trackIndex = state.nowTrack.trackIndex
    if (trackIndex >= 0) {
      console.log(trackIndex)
      if (trackIndex !== state.nowTrack.trackIndex) {
        commit('SET_IS_PLAY', false)
        commit('SET_IS_PAUSE', false)
      }
      if (state.config.isPlay) {
        state.config.audio.pause()
      } else if (state.config.isPause) {
        state.config.audio.play()
      } else {
        dispatch('playTrack', { trackIndex })
      }
    }
  },
  playTrack(
    { state, commit, dispatch, rootState, rootGetters },
    { trackIndex }
  ) {
    dispatch('stop')
    commit('SET_IS_LOADING', true)
    try {
      commit('SET_TRACK_INDEX', trackIndex)
      commit('SET_NOW_TIME', 0)
      const src = `https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3`
      commit('SET_AUDIO_SRC', src)
      state.config.audio.play()
    } catch (err) {
      console.log(err)
    } finally {
      commit('SET_IS_LOADING', false)
    }
  },
  setVolume({ state }, volume) {
    state.config.audio.volume = volume
  },
}
