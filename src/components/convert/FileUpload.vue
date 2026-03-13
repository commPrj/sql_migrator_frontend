<template>
  <div class="file-upload">
    <div
      class="upload-area"
      :class="{ 'drag-over': isDragging, disabled: disabled }"
      @dragover.prevent="isDragging = true"
      @dragleave="isDragging = false"
      @drop.prevent="handleDrop"
      @click="openFileDialog"
    >
      <input
        type="file"
        ref="fileInput"
        accept=".xml"
        @change="handleFileSelect"
        hidden
      />

      <div class="upload-icon">&#128194;</div>
      <p class="upload-text">
        XML 파일을 드래그하거나 클릭하여 선택하세요
      </p>
      <p class="upload-hint">MyBatis XML 파일 (.xml)</p>
    </div>

    <!-- 선택된 파일 정보 -->
    <div class="file-info" v-if="fileName">
      <span class="file-name">{{ fileName }}</span>
      <button class="btn-remove" @click="clearFile">삭제</button>
    </div>
  </div>
</template>

<script>
import { parseMyBatisXml } from '../../utils/xmlParser.js'

export default {
  name: 'FileUpload',
  props: {
    disabled: {
      type: Boolean,
      default: false
    }
  },
  emits: ['file-parsed'],
  data() {
    return {
      isDragging: false,
      fileName: ''
    }
  },
  methods: {
    openFileDialog() {
      if (!this.disabled) {
        this.$refs.fileInput.click()
      }
    },

    handleDrop(e) {
      this.isDragging = false
      if (this.disabled) return

      const files = e.dataTransfer.files
      if (files.length > 0) {
        this.processFile(files[0])
      }
    },

    handleFileSelect(e) {
      const files = e.target.files
      if (files.length > 0) {
        this.processFile(files[0])
      }
    },

    async processFile(file) {
      if (!file.name.endsWith('.xml')) {
        alert('XML 파일만 업로드 가능합니다.')
        return
      }

      this.fileName = file.name

      try {
        const content = await file.text()
        const { namespace, queries } = parseMyBatisXml(content)

        this.$emit('file-parsed', {
          fileName: file.name,
          namespace,
          queries
        })
      } catch (error) {
        alert('XML 파싱 오류: ' + error.message)
        this.clearFile()
      }
    },

    clearFile() {
      this.fileName = ''
      this.$refs.fileInput.value = ''
      this.$emit('file-parsed', { fileName: '', namespace: '', queries: [] })
    }
  }
}
</script>

<style scoped>
.file-upload {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.upload-area {
  border: 2px dashed #ccc;
  border-radius: 12px;
  padding: 40px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  background: #fafafa;
}

.upload-area:hover {
  border-color: #667eea;
  background: #f0f4ff;
}

.upload-area.drag-over {
  border-color: #667eea;
  background: #e8edff;
}

.upload-area.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.upload-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.upload-text {
  font-size: 16px;
  color: #333;
  margin-bottom: 8px;
}

.upload-hint {
  font-size: 14px;
  color: #888;
}

.file-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #e8f5e9;
  border-radius: 8px;
}

.file-name {
  font-size: 14px;
  color: #2e7d32;
  font-weight: 500;
}

.btn-remove {
  padding: 4px 12px;
  background: #ffebee;
  color: #c62828;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
}

.btn-remove:hover {
  background: #ffcdd2;
}
</style>
