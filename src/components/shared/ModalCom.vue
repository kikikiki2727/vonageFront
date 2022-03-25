<template>
  <div id="modal" v-if="showModal">
    <div id="modal_wrapper">
      <div id="modal_contents">
        <div id="modal_header">
          <span id="cross_button" @click="toggleModal">x</span>
        </div>
        <div id="modal_main">
          <slot name="modalContents">モーダルです</slot>
        </div>
        <div id="modal_footer">
          <button @click="toggleModal">OK</button>
        </div>
      </div>
    </div>
    <div id="overlay" @click.self="toggleModal" />
  </div>
</template>
<script>
export default {
  name: "ModalCom",
  data() {
    return {
      showModal: false,
    };
  },
  methods: {
    toggleModal() {
      this.showModal = !this.showModal;
    },
  },
};
</script>
<style scoped>
#modal_wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}

#modal_contents {
  z-index: 2;
  background: #fff;
  position: fixed;
  padding: 0 1em;
}

#modal_header {
  text-align: right;
}

#cross_button {
  cursor: pointer;
}

#modal_main {
  padding: 0 2em;
}

#overlay {
  z-index: 1;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}
</style>
