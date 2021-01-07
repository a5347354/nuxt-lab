<template>
  <div @click.prevent="playOrPause" @mousedown.stop>
    <img v-if="isPause" class="play-btn" src="@@/assets/img/playBtn.svg" />
    <img v-else class="play-btn" src="@@/assets/img/pauseBtn.svg" />
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  data() {
    return {
      isPause: true,
    }
  },
  computed: {
    ...mapState({
      player: (state) => state.player,
    }),
  },
  mounted() {
    this.$store.dispatch('player/init')
  },
  methods: {
    playOrPause() {
      if (this.player.config.isLoading === true) {
        return false
      }
      this.$store.commit('player/SET_TRACK_INDEX', 0)
      this.$store.dispatch('player/playOrPause')
      this.isPause = !this.isPause
    },
  },
}
</script>

<style lang="scss" scoped>
.play-btn {
  width: 100px;
  height: 100px;
}
</style>
