// src/stores/courseStore.js
import { defineStore } from 'pinia'
import axios from 'axios'

export const useCourseStore = defineStore('courseStore', {
  state: () => ({
    courses: [],
    searchName: '',
    searchCoachName: '',
    searchCoachId: '',
  }),
  actions: {
    async fetchCourses() {
      try {
        const res = await axios.get('http://localhost:8080/api/courses')
        this.courses = res.data
      } catch (err) {
        console.error('取得課程失敗', err)
      }
    },
    async searchByCourseName() {
      if (!this.searchName) return this.fetchCourses()
      try {
        const res = await axios.get('http://localhost:8080/api/courses/course_search', {
          params: { name: this.searchName }
        })
        this.courses = res.data
      } catch (err) {
        console.error('依課程名稱搜尋失敗', err)
      }
    },
    async searchByCoachName() {
      if (!this.searchCoachName) return this.fetchCourses()
      try {
        const res = await axios.get('http://localhost:8080/api/courses/coach_search', {
          params: { coachName: this.searchCoachName }
        })
        this.courses = res.data
      } catch (err) {
        console.error('依教練名稱搜尋失敗', err)
      }
    },
    async searchByCoachId() {
      if (!this.searchCoachId) return this.fetchCourses()
      try {
        const res = await axios.get('http://localhost:8080/api/courses/coach', {
          params: { coachId: this.searchCoachId }
        })
        this.courses = res.data
      } catch (err) {
        console.error('依教練 ID 搜尋失敗', err)
      }
    },
  },
})
