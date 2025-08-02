import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ApiService from '../services/api'
import { 
  Search, 
  Filter, 
  Play, 
  Users, 
  MessageCircle, 
  DollarSign,
  Clock,
  Music,
  ChevronDown,
  X
} from 'lucide-react'

// UI Components (assuming they exist from shadcn/ui)
const Button = ({ children, variant = 'default', className = '', onClick, ...props }) => (
  <button 
    className={`px-4 py-2 rounded-md font-medium transition-colors ${
      variant === 'outline' ? 'border border-gray-300 bg-white hover:bg-gray-50 text-gray-700' :
      variant === 'ghost' ? 'hover:bg-gray-100 text-gray-700' :
      'bg-blue-600 hover:bg-blue-700 text-white'
    } ${className}`}
    onClick={onClick}
    {...props}
  >
    {children}
  </button>
)

const Input = ({ className = '', ...props }) => (
  <input 
    className={`px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
    {...props}
  />
)

const Select = ({ children, value, onValueChange, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedValue, setSelectedValue] = useState(value)

  const handleSelect = (newValue) => {
    setSelectedValue(newValue)
    onValueChange(newValue)
    setIsOpen(false)
  }

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="outline"
        className="w-full justify-between"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedValue || 'Select...'}
        <ChevronDown className="h-4 w-4" />
      </Button>
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
          {children}
        </div>
      )}
    </div>
  )
}

const SelectItem = ({ value, children, onSelect }) => (
  <div
    className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
    onClick={() => onSelect(value)}
  >
    {children}
  </div>
)

const Badge = ({ children, variant = 'default', className = '' }) => (
  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
    variant === 'outline' ? 'border border-gray-300 text-gray-700' :
    variant === 'destructive' ? 'bg-red-100 text-red-800' :
    variant === 'secondary' ? 'bg-gray-100 text-gray-800' :
    'bg-blue-100 text-blue-800'
  } ${className}`}>
    {children}
  </span>
)

const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
    {children}
  </div>
)

const CardContent = ({ children, className = '' }) => (
  <div className={`p-6 ${className}`}>
    {children}
  </div>
)

// Project Card Component (reused from main app)
const ProjectCard = ({ project, onClick }) => {
  const navigate = useNavigate()

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours} hours ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays} days ago`
    
    const diffInWeeks = Math.floor(diffInDays / 7)
    return `${diffInWeeks} weeks ago`
  }

  const handleClick = () => {
    navigate(`/project/${project.id}`)
  }

  // Parse collaboration needs
  let collaborationNeeds = []
  if (project.collaboration_needs) {
    try {
      collaborationNeeds = typeof project.collaboration_needs === 'string' 
        ? JSON.parse(project.collaboration_needs) 
        : project.collaboration_needs
    } catch (e) {
      collaborationNeeds = []
    }
  }

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={handleClick}>
      <CardContent>
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">{project.title}</h3>
          <Button variant="ghost" className="p-2 h-8 w-8">
            <Play className="h-4 w-4" />
          </Button>
        </div>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{project.description}</p>
        
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant="outline">{project.genre}</Badge>
          {project.bpm && <Badge variant="outline">{project.bpm} BPM</Badge>}
          {project.key && <Badge variant="outline">{project.key}</Badge>}
        </div>

        {/* Collaboration Needs */}
        {collaborationNeeds.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {collaborationNeeds.slice(0, 2).map((need, index) => (
              <Badge key={index} variant="destructive" className="text-xs">
                Need: {need}
              </Badge>
            ))}
            {collaborationNeeds.length > 2 && (
              <Badge variant="destructive" className="text-xs">
                +{collaborationNeeds.length - 2} more
              </Badge>
            )}
          </div>
        )}

        {/* Monetization Info */}
        {project.monetization_type === 'bounty' && project.bounty_amount && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-2 mb-3">
            <div className="flex items-center text-yellow-800 text-sm">
              <DollarSign className="h-4 w-4 mr-1" />
              ${project.bounty_amount} Bounty
            </div>
          </div>
        )}

        {project.is_unlockable && project.unlock_price && (
          <div className="bg-purple-50 border border-purple-200 rounded-md p-2 mb-3">
            <div className="flex items-center text-purple-800 text-sm">
              <DollarSign className="h-4 w-4 mr-1" />
              ${project.unlock_price} to Unlock
            </div>
          </div>
        )}

        {/* Stats and Creator */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              {project.collaborator_count || 0}
            </div>
            <div className="flex items-center">
              <MessageCircle className="h-4 w-4 mr-1" />
              {project.comment_count || 0}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-xs font-medium">
              {project.creator?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span className="text-xs">
              by {project.creator?.username || 'Unknown'} • {formatTimeAgo(project.created_at)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Main Explore Page Component
export default function ExplorePage() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGenre, setSelectedGenre] = useState('')
  const [selectedMonetization, setSelectedMonetization] = useState('')
  const [minBpm, setMinBpm] = useState('')
  const [maxBpm, setMaxBpm] = useState('')
  const [collaborationNeeds, setCollaborationNeeds] = useState([])
  const [sortBy, setSortBy] = useState('recent')
  
  // Filter options
  const genres = [
    'Hip Hop', 'Electronic', 'Pop', 'Rock', 'R&B', 'Jazz', 'Classical', 
    'Country', 'Folk', 'Reggae', 'Blues', 'Funk', 'House', 'Techno', 
    'Ambient', 'Lo-fi Hip Hop', 'Synthwave', 'Trap', 'Drill', 'Afrobeat'
  ]
  
  const monetizationOptions = [
    { value: '', label: 'All Projects' },
    { value: 'free', label: 'Free Collaboration' },
    { value: 'bounty', label: 'Bounty Projects' },
    { value: 'unlockable', label: 'Unlockable Content' }
  ]
  
  const collaborationRoles = [
    'Vocalist', 'Rapper', 'Producer', 'Beat Maker', 'Mix Engineer', 
    'Master Engineer', 'Songwriter', 'Guitarist', 'Bassist', 'Drummer',
    'Keyboardist', 'Violinist', 'Saxophonist', 'Trumpeter'
  ]
  
  const sortOptions = [
    { value: 'recent', label: 'Most Recent' },
    { value: 'trending', label: 'Trending' },
    { value: 'bounty', label: 'Highest Bounty' },
    { value: 'popular', label: 'Most Popular' }
  ]

  // Fetch projects with filters
  const fetchProjects = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      if (searchQuery) params.append('search', searchQuery)
      if (selectedGenre) params.append('genre', selectedGenre)
      if (selectedMonetization) params.append('monetization_type', selectedMonetization)
      if (minBpm) params.append('min_bpm', minBpm)
      if (maxBpm) params.append('max_bpm', maxBpm)
      if (collaborationNeeds.length > 0) params.append('collaboration_needs', collaborationNeeds.join(','))
      params.append('sort_by', sortBy)
      
      const response = await ApiService.exploreProjects(params.toString())
      setProjects(response.projects || [])
    } catch (err) {
      setError('Failed to load projects')
      console.error('Error fetching projects:', err)
    } finally {
      setLoading(false)
    }
  }

  // Initial load and when filters change
  useEffect(() => {
    fetchProjects()
  }, [searchQuery, selectedGenre, selectedMonetization, minBpm, maxBpm, collaborationNeeds, sortBy])

  // Add/remove collaboration need filter
  const toggleCollaborationNeed = (role) => {
    setCollaborationNeeds(prev => 
      prev.includes(role) 
        ? prev.filter(r => r !== role)
        : [...prev, role]
    )
  }

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('')
    setSelectedGenre('')
    setSelectedMonetization('')
    setMinBpm('')
    setMaxBpm('')
    setCollaborationNeeds([])
    setSortBy('recent')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Explore Projects</h1>
          <p className="text-gray-600">Discover amazing music projects and find collaboration opportunities</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search projects, genres, or collaborators..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full"
            />
          </div>

          {/* Filter Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Genre</label>
              <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                <SelectItem value="" onSelect={setSelectedGenre}>All Genres</SelectItem>
                {genres.map(genre => (
                  <SelectItem key={genre} value={genre} onSelect={setSelectedGenre}>
                    {genre}
                  </SelectItem>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Monetization</label>
              <Select value={selectedMonetization} onValueChange={setSelectedMonetization}>
                {monetizationOptions.map(option => (
                  <SelectItem key={option.value} value={option.value} onSelect={setSelectedMonetization}>
                    {option.label}
                  </SelectItem>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Min BPM</label>
              <Input
                type="number"
                placeholder="60"
                value={minBpm}
                onChange={(e) => setMinBpm(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max BPM</label>
              <Input
                type="number"
                placeholder="180"
                value={maxBpm}
                onChange={(e) => setMaxBpm(e.target.value)}
              />
            </div>
          </div>

          {/* Collaboration Needs Filter */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Looking for Collaborators</label>
            <div className="flex flex-wrap gap-2">
              {collaborationRoles.map(role => (
                <Button
                  key={role}
                  variant={collaborationNeeds.includes(role) ? 'default' : 'outline'}
                  className="text-xs"
                  onClick={() => toggleCollaborationNeed(role)}
                >
                  {role}
                </Button>
              ))}
            </div>
          </div>

          {/* Sort and Clear */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center space-x-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort by</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  {sortOptions.map(option => (
                    <SelectItem key={option.value} value={option.value} onSelect={setSortBy}>
                      {option.label}
                    </SelectItem>
                  ))}
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={clearFilters}>
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
              <div className="text-sm text-gray-500">
                {projects.length} projects found
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {(selectedGenre || selectedMonetization || collaborationNeeds.length > 0 || minBpm || maxBpm) && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap gap-2">
                {selectedGenre && (
                  <Badge variant="secondary" className="flex items-center">
                    Genre: {selectedGenre}
                    <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setSelectedGenre('')} />
                  </Badge>
                )}
                {selectedMonetization && (
                  <Badge variant="secondary" className="flex items-center">
                    {monetizationOptions.find(opt => opt.value === selectedMonetization)?.label}
                    <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setSelectedMonetization('')} />
                  </Badge>
                )}
                {collaborationNeeds.map(role => (
                  <Badge key={role} variant="secondary" className="flex items-center">
                    Need: {role}
                    <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => toggleCollaborationNeed(role)} />
                  </Badge>
                ))}
                {(minBpm || maxBpm) && (
                  <Badge variant="secondary" className="flex items-center">
                    BPM: {minBpm || '0'}-{maxBpm || '∞'}
                    <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => { setMinBpm(''); setMaxBpm('') }} />
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading projects...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600">{error}</p>
            <Button onClick={fetchProjects} className="mt-4">Try Again</Button>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12">
            <Music className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your filters or search terms</p>
            <Button onClick={clearFilters}>Clear All Filters</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(project => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

