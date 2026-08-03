import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Header, Footer } from './components/Layout'
import { I18nProvider } from './i18n'
import { ProjectsProvider } from './projects/ProjectsProvider'
import { HomePage } from './pages/HomePage'
import { ProjectsPage } from './pages/ProjectsPage'
import { ProjectDetailPage } from './pages/ProjectDetailPage'
import { InsightsPage } from './pages/InsightsPage'
import { AboutPage } from './pages/AboutPage'
import { ContactPage } from './pages/ContactPage'
import { NewsPage } from './pages/NewsPage'
import { NewsDetailPage } from './pages/NewsDetailPage'
import { AboutConceptsIndex } from './pages/about-concepts/AboutConceptsIndex'
import { AboutConceptPage } from './pages/about-concepts/AboutConceptPage'

export default function App() {
  return (
    <BrowserRouter>
      <I18nProvider>
        <ProjectsProvider>
          <div className="site">
            <Header />
            <main className="site-main">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/projects" element={<ProjectsPage />} />
                <Route path="/projects/:slug" element={<ProjectDetailPage />} />
                <Route path="/company" element={<InsightsPage />} />
                <Route path="/insights" element={<Navigate to="/company" replace />} />
                <Route path="/news" element={<NewsPage />} />
                <Route path="/news/:slug" element={<NewsDetailPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/about-concepts" element={<AboutConceptsIndex />} />
                <Route path="/about-concepts/:id" element={<AboutConceptPage />} />
                <Route path="/contact" element={<ContactPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </ProjectsProvider>
      </I18nProvider>
    </BrowserRouter>
  )
}
