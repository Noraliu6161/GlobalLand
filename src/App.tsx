import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Header, Footer } from './components/Layout'
import { I18nProvider } from './i18n'
import { ProjectsProvider } from './projects/ProjectsProvider'
import { HomePage } from './pages/HomePage'
import { ProjectsPage } from './pages/ProjectsPage'
import { ProjectDetailPage } from './pages/ProjectDetailPage'
import { InsightsPage } from './pages/InsightsPage'
import { AboutPage } from './pages/AboutPage'
import { ContactPage } from './pages/ContactPage'

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
                <Route path="/insights" element={<InsightsPage />} />
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
