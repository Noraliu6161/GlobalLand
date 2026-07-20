import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { loadProjects, type ProjectsSource } from '../lib/loadProjects'
import type { Project } from '../data/projects'

type ProjectsContextValue = {
  projects: Project[]
  source: ProjectsSource
  loading: boolean
}

const ProjectsContext = createContext<ProjectsContextValue | null>(null)

const loaded = loadProjects()

export function ProjectsProvider({ children }: { children: ReactNode }) {
  const value = useMemo<ProjectsContextValue>(
    () => ({
      projects: loaded.projects,
      source: loaded.source,
      loading: false,
    }),
    [],
  )

  return <ProjectsContext.Provider value={value}>{children}</ProjectsContext.Provider>
}

export function useProjects() {
  const ctx = useContext(ProjectsContext)
  if (!ctx) throw new Error('useProjects must be used within ProjectsProvider')
  return ctx
}
