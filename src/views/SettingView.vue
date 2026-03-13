<template>
  <div class="setting-view">
    <h2 class="page-title">프로젝트 설정</h2>
    <p class="page-desc">프로젝트 정보와 대상 PostgreSQL 접속 정보를 설정합니다.</p>

    <div class="form-card">
      <ProjectForm
        :project="project"
        :loading="loading"
        :message="message"
        @submit="handleSubmit"
      />
    </div>
  </div>
</template>

<script>
import ProjectForm from '../components/project/ProjectForm.vue'
import { saveProject } from '../api/index.js'

export default {
  name: 'SettingView',
  components: {
    ProjectForm
  },
  props: {
    project: {
      type: Object,
      required: true
    }
  },
  emits: ['update-project'],
  data() {
    return {
      loading: false,
      message: { type: '', text: '' }
    }
  },
  methods: {
    async handleSubmit(formData) {
      this.loading = true
      this.message = { type: '', text: '' }

      try {
        const response = await saveProject(formData)
        this.message = { type: 'success', text: response.message || '프로젝트 설정이 저장되었습니다.' }
        this.$emit('update-project', formData)
      } catch (error) {
        this.message = { type: 'error', text: error.message || '저장 중 오류가 발생했습니다.' }
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.setting-view {
  max-width: 600px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.page-desc {
  color: #666;
  margin-bottom: 24px;
}

.form-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
</style>
