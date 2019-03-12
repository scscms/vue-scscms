<template>
  <div :class="[sidebar,slide_class]">
    <div class="sidebar_div">
      <div class="el-message-box__header">
        <div class="el-message-box__title">
          <slot name='title'></slot>
        </div>
        <i class="el-message-box__close el-icon-close" @click="close"></i>
      </div>
      <slot name='content'>
        <div class="sidebar_content"></div>
      </slot>
      <slot name='foot'>
        <div class="sidebar_foot"></div>
      </slot>
    </div>
    <div class="sidebar_bg" @click="close"></div>
  </div>
</template>

<script>
export default {
  name: 'Sidebar',
  props: {
    str: {
      type: String,
      default: ''
    },
    beforeClose: {
      default: null
    }
  },
  data () {
    return {
      sidebar: 'sidebar',
      slide_class: ''
    }
  },
  methods: {
    close () {
      if (typeof this.beforeClose === 'function') {
        this.beforeClose(this.open)
      } else {
        this.open(false)
      }
    },
    open (param) {
      this.slide_class = param ? 'slide_in' : 'slide_out'
      this.$emit('SidebarOpen', !!param)
    }
  }
}
</script>
<style lang="less">
  .sidebar {
    .sidebar_bg, .sidebar_div {
      position: fixed;
      z-index: 2;
      top: 60px;
      left: 0;
      width: 100%;
      height: ~'calc(100% - 60px)';
      animation-duration: .5s;
      animation-fill-mode: both;
      background-color: rgba(0, 0, 0, 0.2);
      transform: translateX(100%)
    }
    .sidebar_div {
      width: 95%;
      display: block;
      z-index: 11;
      left: 5%;
      background-color: #fff;
    }
    .el-message-box__header {
      background-color: #fff;
      border-bottom: 1px solid #cfcfcf;
      .el-message-box__title {
        font-size: 18px;
        font-weight: bold;
        color: #333;
      }
      .el-message-box__close {
        display: inline-block;
        position: absolute;
        font-size: 14px;
        top: 10px;
        right: 20px;
        color: #999;
        cursor: pointer;
        line-height: 20px;
        text-align: center;
      }
    }
    .sidebar_content {
      height: ~'calc(100% - 100px)';
      padding: 10px 15px;
      overflow-y: auto;
      background-color: #fff;
    }
    .sidebar_foot {
      padding: 10px;
      border-top: 1px solid #bfcbd9
    }
  }

  .slide_in .sidebar_div {
    animation-name: slideIn;
    box-shadow: -5px 0 10px rgba(0, 0, 0, 0.3);
  }

  .slide_out .sidebar_div {
    animation-name: slide_out;
  }

  @keyframes slideIn {
    0% {
      opacity: 0;
      transform: translateX(100%)
    }
    100% {
      opacity: 1;
      transform: translateX(0%)
    }
  }

  @keyframes slide_out {
    0% {
      opacity: 1;
      transform: translateX(0%)
    }
    100% {
      opacity: 0;
      transform: translateX(100%)
    }
  }

  .slide_in .sidebar_bg {
    animation-name: opacity_in
  }

  .slide_out .sidebar_bg {
    animation-name: opacity_out
  }

  @keyframes opacity_in {
    0% {
      transform: translateX(100%)
    }
    1% {
      opacity: 0;
      transform: translateX(0%)
    }
    100% {
      opacity: 1;
      transform: translateX(0%)
    }
  }

  @keyframes opacity_out {
    0% {
      opacity: 1;
      transform: translateX(0%)
    }
    99% {
      opacity: 0;
      transform: translateX(0%)
    }
    100% {
      transform: translateX(100%)
    }
  }
</style>
