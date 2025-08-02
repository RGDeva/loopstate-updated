import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { 
  Play, 
  Pause,
  Download,
  Upload,
  MessageCircle, 
  Users, 
  DollarSign,
  Clock,
  Music,
  FileAudio,
  FileText,
  Image as ImageIcon,
  Send,
  Heart,
  Share2,
  MoreHorizontal
} from 'lucide-react'
import ApiService from '../services/api'

export default function ProjectDetail() {
  const { id } = useParams()
  const [project, setProject] = useState(null)
  const [comments, setComments] = useState([])
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [newComment, setNewComment] = useState('')
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  // Fetch project details
  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        setLoading(true)
        const projectResponse = await ApiService.getProject(id)
        
        setProject(projectResponse)
        setComments(projectResponse.comments || [])
        setFiles(projectResponse.files || [])
      } catch (err) {
        setError('Failed to load project details')
        console.error('Error fetching project details:', err)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchProjectDetails()
    }
  }, [id])

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

  // Format duration for audio player
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Handle comment submission
  const handleCommentSubmit = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return

    try {
      const comment = await ApiService.addComment(id, {
        content: newComment,
        user_id: 1 // TODO: Replace with actual user ID from auth
      })
      
      setComments(prev => [comment, ...prev])
      setNewComment('')
    } catch (error) {
      console.error('Error adding comment:', error)
      alert('Failed to add comment. Please try again.')
    }
  }

  // Handle file upload
  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('project_id', id)
      formData.append('user_id', 1) // TODO: Replace with actual user ID

      const uploadedFile = await ApiService.uploadFile(formData)
      setFiles(prev => [uploadedFile, ...prev])
    } catch (error) {
      console.error('Error uploading file:', error)
      alert('Failed to upload file. Please try again.')
    }
  }

  // Handle collaboration request
  const handleCollaborationRequest = async () => {
    try {
      await ApiService.requestCollaboration(id, {
        user_id: 1, // TODO: Replace with actual user ID
        message: 'I would like to collaborate on this project!'
      })
      alert('Collaboration request sent!')
    } catch (error) {
      console.error('Error sending collaboration request:', error)
      alert('Failed to send collaboration request. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading project...</p>
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">{error || 'Project not found'}</p>
          <Button onClick={() => window.history.back()}>Go Back</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Project Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Project Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{project.title}</h1>
                <p className="text-lg text-muted-foreground mb-4">{project.description}</p>
                
                {/* Project Metadata */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="secondary">{project.genre}</Badge>
                  {project.bpm && <Badge variant="outline">{project.bpm} BPM</Badge>}
                  {project.key && <Badge variant="outline">{project.key}</Badge>}
                </div>

                {/* Collaboration Needs */}
                {project.collaboration_needs && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {(() => {
                      try {
                        const needs = typeof project.collaboration_needs === 'string' 
                          ? JSON.parse(project.collaboration_needs) 
                          : project.collaboration_needs;
                        return needs.map((need, index) => (
                          <Badge key={index} variant="destructive" className="text-xs">
                            Need: {need}
                          </Badge>
                        ));
                      } catch (e) {
                        return null;
                      }
                    })()}
                  </div>
                )}

                {/* Creator Info */}
                {project.creator && (
                  <div className="flex items-center space-x-3 mb-4">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {project.creator.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{project.creator.username}</p>
                      <p className="text-sm text-muted-foreground">
                        Created {formatTimeAgo(project.created_at)}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2">
                <Button onClick={handleCollaborationRequest}>
                  <Users className="h-4 w-4 mr-2" />
                  Collaborate
                </Button>
                <Button variant="outline">
                  <Heart className="h-4 w-4 mr-2" />
                  Like
                </Button>
                <Button variant="outline">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>

            {/* Monetization Info */}
            {project.monetization_type === 'bounty' && project.bounty_amount && (
              <Card className="mb-6 border-yellow-200 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-800">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 text-yellow-700 dark:text-yellow-300">
                    <DollarSign className="h-5 w-5" />
                    <span className="font-semibold">${project.bounty_amount} Bounty Available</span>
                  </div>
                  <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
                    Reward for the best contribution to this project
                  </p>
                </CardContent>
              </Card>
            )}

            {project.is_unlockable && project.unlock_price && (
              <Card className="mb-6 border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 text-blue-700 dark:text-blue-300">
                    <DollarSign className="h-5 w-5" />
                    <span className="font-semibold">${project.unlock_price} to Unlock Full Access</span>
                  </div>
                  <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                    Get access to all project files and stems
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Audio Player */}
          <div className="lg:w-96">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Music className="h-5 w-5" />
                  <span>Audio Preview</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Waveform Placeholder */}
                <div className="bg-muted rounded-lg h-24 mb-4 flex items-center justify-center">
                  <p className="text-muted-foreground text-sm">Waveform visualization</p>
                </div>
                
                {/* Player Controls */}
                <div className="flex items-center space-x-4 mb-4">
                  <Button
                    size="icon"
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  
                  <div className="flex-1">
                    <div className="bg-muted rounded-full h-2 mb-1">
                      <div 
                        className="bg-primary rounded-full h-2 transition-all duration-300"
                        style={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{formatDuration(currentTime)}</span>
                      <span>{formatDuration(duration)}</span>
                    </div>
                  </div>
                </div>

                {/* Download Button */}
                <Button variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Download Preview
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Tabs for different sections */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
          <TabsTrigger value="comments">Comments</TabsTrigger>
          <TabsTrigger value="collaborators">Collaborators</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Project Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold">{project.collaborator_count}</p>
                <p className="text-sm text-muted-foreground">Collaborators</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <MessageCircle className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold">{project.comment_count}</p>
                <p className="text-sm text-muted-foreground">Comments</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <FileAudio className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold">{files.length}</p>
                <p className="text-sm text-muted-foreground">Files</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Clock className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold">{formatTimeAgo(project.created_at)}</p>
                <p className="text-sm text-muted-foreground">Created</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {comments.slice(0, 3).map((comment) => (
                  <div key={comment.id} className="flex items-start space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {comment.user?.username?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-medium">{comment.user?.username || 'Anonymous'}</span>
                        {' '}commented: {comment.content}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatTimeAgo(comment.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
                {comments.length === 0 && (
                  <p className="text-muted-foreground text-center py-4">
                    No activity yet. Be the first to comment!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="files" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Project Files</CardTitle>
                <div>
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    onChange={handleFileUpload}
                    accept="audio/*,image/*,.pdf,.txt,.doc,.docx"
                  />
                  <Button onClick={() => document.getElementById('file-upload').click()}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload File
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {files.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {file.file_type?.startsWith('audio/') ? (
                        <FileAudio className="h-5 w-5 text-blue-500" />
                      ) : file.file_type?.startsWith('image/') ? (
                        <ImageIcon className="h-5 w-5 text-green-500" />
                      ) : (
                        <FileText className="h-5 w-5 text-gray-500" />
                      )}
                      <div>
                        <p className="font-medium">{file.filename}</p>
                        <p className="text-sm text-muted-foreground">
                          Uploaded by {file.user?.username || 'Unknown'} • {formatTimeAgo(file.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {files.length === 0 && (
                  <div className="text-center py-8">
                    <FileAudio className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No files uploaded yet</p>
                    <p className="text-sm text-muted-foreground">Upload audio files, stems, or reference materials</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Comments</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Comment Form */}
              <form onSubmit={handleCommentSubmit} className="mb-6">
                <div className="flex space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Textarea
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows={3}
                    />
                    <div className="flex justify-end mt-2">
                      <Button type="submit" disabled={!newComment.trim()}>
                        <Send className="h-4 w-4 mr-2" />
                        Comment
                      </Button>
                    </div>
                  </div>
                </div>
              </form>

              {/* Comments List */}
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex items-start space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {comment.user?.username?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-muted rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm">
                            {comment.user?.username || 'Anonymous'}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatTimeAgo(comment.created_at)}
                          </span>
                        </div>
                        <p className="text-sm">{comment.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {comments.length === 0 && (
                  <div className="text-center py-8">
                    <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No comments yet</p>
                    <p className="text-sm text-muted-foreground">Start the conversation!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="collaborators" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Collaborators</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Project Creator */}
                {project.creator && (
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {project.creator.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{project.creator.username}</p>
                        <p className="text-sm text-muted-foreground">Project Creator</p>
                      </div>
                    </div>
                    <Badge variant="secondary">Owner</Badge>
                  </div>
                )}

                {/* Placeholder for other collaborators */}
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No collaborators yet</p>
                  <p className="text-sm text-muted-foreground">
                    Send collaboration requests to work together!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

