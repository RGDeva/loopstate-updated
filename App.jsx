import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'
import { PrivyProvider } from '@privy-io/react-auth'
import { privyConfig } from './config/privy'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.jsx'
import { Input } from '@/components/ui/input.jsx'
import { 
  Music, 
  Plus, 
  Search, 
  Filter, 
  Play, 
  Users, 
  MessageCircle, 
  DollarSign,
  Moon,
  Sun,
  Menu,
  Home as HomeIcon,
  Compass,
  User,
  Settings
} from 'lucide-react'
import ApiService from './services/api'
import ProjectCreateModal from './components/ProjectCreateModal'
import ProjectDetail from './components/ProjectDetail'
import ExplorePage from './components/ExplorePage'
import './App.css'

// Theme context for dark/light mode
const ThemeContext = React.createContext()

// Navigation Component
function Navigation({ isDark, toggleTheme, onProjectCreated }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const navigate = useNavigate()
  const { isLoggedIn, login, logout, user, userProfile, loading } = useAuth()

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Music className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">LoopState</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Button variant="ghost" className="flex items-center space-x-2" onClick={() => navigate('/')}>
              <HomeIcon className="h-4 w-4" />
              <span>Home</span>
            </Button>
            <Button variant="ghost" className="flex items-center space-x-2" onClick={() => navigate('/explore')}>
              <Compass className="h-4 w-4" />
              <span>Explore</span>
            </Button>
            
            {isLoggedIn && (
              <ProjectCreateModal
                trigger={
                  <Button className="flex items-center space-x-2">
                    <Plus className="h-4 w-4" />
                    <span>New Project</span>
                  </Button>
                }
                onProjectCreated={onProjectCreated}
              />
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="hidden md:flex"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            
            {/* Authentication Section */}
            {loading ? (
              <div className="h-8 w-8 animate-pulse bg-muted rounded-full" />
            ) : isLoggedIn ? (
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.profilePictureUrl} />
                  <AvatarFallback>
                    {userProfile?.username?.charAt(0)?.toUpperCase() || 
                     user?.email?.address?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:block text-sm font-medium">
                  {userProfile?.username || user?.email?.address?.split('@')[0] || 'User'}
                </span>
                <Button variant="outline" size="sm" onClick={logout}>
                  Logout
                </Button>
              </div>
            ) : (
              <Button onClick={login}>
                Login
              </Button>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border py-4">
            <div className="flex flex-col space-y-2">
              <Button variant="ghost" className="justify-start" onClick={() => navigate('/')}>
                <HomeIcon className="h-4 w-4 mr-2" />
                Home
              </Button>
              <Button variant="ghost" className="justify-start" onClick={() => navigate('/explore')}>
                <Compass className="h-4 w-4 mr-2" />
                Explore
              </Button>
              
              {isLoggedIn ? (
                <>
                  <ProjectCreateModal
                    trigger={
                      <Button className="justify-start">
                        <Plus className="h-4 w-4 mr-2" />
                        New Project
                      </Button>
                    }
                    onProjectCreated={onProjectCreated}
                  />
                  <div className="flex items-center space-x-3 px-3 py-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.profilePictureUrl} />
                      <AvatarFallback>
                        {userProfile?.username?.charAt(0)?.toUpperCase() || 
                         user?.email?.address?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">
                      {userProfile?.username || user?.email?.address?.split('@')[0] || 'User'}
                    </span>
                  </div>
                  <Button variant="outline" className="justify-start" onClick={logout}>
                    Logout
                  </Button>
                </>
              ) : (
                <Button className="justify-start" onClick={login}>
                  Login
                </Button>
              )}
              
              <Button variant="ghost" className="justify-start" onClick={toggleTheme}>
                {isDark ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
                {isDark ? 'Light Mode' : 'Dark Mode'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

// Project Card Component
function ProjectCard({ project, formatTimeAgo }) {
  const navigate = useNavigate()

  const handleCardClick = () => {
    navigate(`/project/${project.id}`)
  }

  const handlePlayClick = (e) => {
    e.stopPropagation() // Prevent card click when play button is clicked
    // TODO: Implement audio preview
  }

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleCardClick}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-1">{project.title}</CardTitle>
            <CardDescription className="text-sm">{project.description}</CardDescription>
          </div>
          <Button size="icon" variant="ghost" className="ml-2" onClick={handlePlayClick}>
            <Play className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Project Info */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{project.genre}</Badge>
            <Badge variant="outline">{project.bpm} BPM</Badge>
            <Badge variant="outline">{project.key}</Badge>
          </div>

          {/* Collaboration Needs */}
          {project.collaboration_needs && project.collaboration_needs.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {project.collaboration_needs.map((need, index) => (
                <Badge key={index} variant="destructive" className="text-xs">
                  Need: {need}
                </Badge>
              ))}
            </div>
          )}

          {/* Bounty/Monetization */}
          {project.monetization_type === 'bounty' && project.bounty_amount && (
            <div className="flex items-center space-x-2 text-green-600">
              <DollarSign className="h-4 w-4" />
              <span className="text-sm font-medium">${project.bounty_amount} Bounty</span>
            </div>
          )}

          {/* Unlockable Content */}
          {project.is_unlockable && project.unlock_price && (
            <div className="flex items-center space-x-2 text-blue-600">
              <DollarSign className="h-4 w-4" />
              <span className="text-sm font-medium">${project.unlock_price} to Unlock</span>
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>{project.collaborator_count}</span>
              </div>
              <div className="flex items-center space-x-1">
                <MessageCircle className="h-4 w-4" />
                <span>{project.comment_count}</span>
              </div>
            </div>
            <span>{formatTimeAgo(project.created_at)}</span>
          </div>

          {/* Creator Info */}
          {project.creator && (
            <div className="flex items-center space-x-2 pt-2 border-t border-border">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs">
                  {project.creator.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground">by {project.creator.username}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// HomePage Component
function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Fetch projects from API
  const fetchProjects = async () => {
    try {
      setLoading(true)
      const response = await ApiService.exploreProjects({ sort_by: 'recent' })
      setProjects(response.projects || [])
    } catch (err) {
      setError('Failed to load projects')
      console.error('Error fetching projects:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  // Handle new project creation
  const handleProjectCreated = (newProject) => {
    // Refresh the projects list
    fetchProjects()
  }

  // Helper function to format time ago
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours} hours ago`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays === 1) return '1 day ago'
    return `${diffInDays} days ago`
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          Collaborate Before It's Finished
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Share unfinished projects, find collaborators, and monetize your in-progress work. 
          The music collaboration platform built for creators.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <ProjectCreateModal
            trigger={
              <Button size="lg" className="text-lg px-8">
                <Plus className="h-5 w-5 mr-2" />
                Start a Project
              </Button>
            }
            onProjectCreated={handleProjectCreated}
          />
          <Button size="lg" variant="outline" className="text-lg px-8">
            <Compass className="h-5 w-5 mr-2" />
            Explore Projects
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects, genres, or collaborators..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" className="flex items-center space-x-2">
            <Filter className="h-4 w-4" />
            <span>Filters</span>
          </Button>
        </div>
      </div>

      {/* Project Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading projects...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No projects found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} formatTimeAgo={formatTimeAgo} />
          ))}
        </div>
      )}

      {/* Load More */}
      <div className="text-center mt-12">
        <Button variant="outline" size="lg">
          Load More Projects
        </Button>
      </div>
    </div>
  )
}

// Main App Component
function App() {
  const [isDark, setIsDark] = useState(false)

  const toggleTheme = () => {
    setIsDark(!isDark)
    document.documentElement.classList.toggle('dark')
  }

  return (
    <PrivyProvider
      appId={privyConfig.appId}
      config={privyConfig.config}
    >
      <AuthProvider>
        <div className={isDark ? 'dark' : ''}>
          <Router>
            <div className="min-h-screen bg-background text-foreground">
              <Navigation isDark={isDark} toggleTheme={toggleTheme} />
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/explore" element={<ExplorePage />} />
                <Route path="/project/:id" element={<ProjectDetail />} />
                {/* Add more routes here as we build them */}
              </Routes>
            </div>
          </Router>
        </div>
      </AuthProvider>
    </PrivyProvider>
  )
}

export default App

