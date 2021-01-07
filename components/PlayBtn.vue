<template>
  <div @click.prevent="playOrPause()" @mousedown.stop>
    <img src="@@/assets/img/playBtn.svg" />
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
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
    },
  },
}
</script>
