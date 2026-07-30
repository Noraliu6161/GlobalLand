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
                <Route path="/about" element={<AboutPage />} />
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
