import { create } from 'zustand'
import { saveProject, loadProject, listProjects } from '../utils/projectStorage'

const useProjectStore = create((set) => ({
  projectName: 'Untitled Project',
  projects: [],
  isSaving: false,

  setProjectName: (name) => set({ projectName: name }),

  saveCurrentProject: async (canvasJSON, projectName) => {
    set({ isSaving: true })
    await saveProject({ name: projectName, canvas: canvasJSON, savedAt: Date.now() })
    set({ isSaving: false })
  },

  loadProjects: async () => {
    const projects = await listProjects()
    set({ projects })
  },

  loadProjectById: async (id) => {
    return await loadProject(id)
  },
}))

export default useProjectStore
