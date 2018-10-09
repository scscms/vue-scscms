import { quillEditor } from 'vue-quill-editor'
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
export default {
  quillEditor,
  upFile: require('./upFile.vue').default,
  Sidebar: require('./Sidebar.vue').default
}
