import React, { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Checkbox } from '@/components/ui/checkbox.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Upload, X, Plus, DollarSign, Lock, Gift } from 'lucide-react'
import ApiService from '../services/api.js'

const GENRES = [
  'Hip Hop', 'Pop', 'Rock', 'Electronic', 'R&B', 'Jazz', 'Country', 'Folk', 
  'Classical', 'Reggae', 'Blues', 'Funk', 'Soul', 'Punk', 'Metal', 'Indie',
  'Lo-fi Hip Hop', 'Synthwave', 'Indie Folk', 'Alternative', 'Other'
]

const COLLABORATION_ROLES = [
  'Vocalist', 'Rapper', 'Producer', 'Mix Engineer', 'Mastering Engineer',
  'Guitarist', 'Bassist', 'Drummer', 'Pianist', 'Songwriter', 'Lyricist',
  'Violinist', 'Saxophonist', 'Trumpeter', 'Harmonica', 'DJ', 'Other'
]

const KEYS = [
  'C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B',
  'Cm', 'C#m', 'Dm', 'D#m', 'Em', 'Fm', 'F#m', 'Gm', 'G#m', 'Am', 'A#m', 'Bm'
]

export default function ProjectCreateModal({ trigger, onProjectCreated }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState('basic')
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    genre: '',
    bpm: '',
    key: '',
    collaboration_needs: [],
    monetization_type: 'free',
    bounty_amount: '',
    bounty_deadline: '',
    unlock_price: '',
    files: []
  })

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleCollaborationNeedToggle = (role) => {
    setFormData(prev => ({
      ...prev,
      collaboration_needs: prev.collaboration_needs.includes(role)
        ? prev.collaboration_needs.filter(r => r !== role)
        : [...prev.collaboration_needs, role]
    }))
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)
      
      // Prepare project data
      const projectData = {
        ...formData,
        creator_id: 1, // TODO: Replace with actual user ID from auth
        bpm: formData.bpm ? parseInt(formData.bpm) : null,
        bounty_amount: formData.bounty_amount ? parseFloat(formData.bounty_amount) : null,
        unlock_price: formData.unlock_price ? parseFloat(formData.unlock_price) : null,
        is_unlockable: formData.monetization_type === 'unlockable'
      }

      // Create project
      const response = await ApiService.createProject(projectData)
      
      // Call callback to refresh project list
      if (onProjectCreated) {
        onProjectCreated(response)
      }
      
      // Reset form and close modal
      setFormData({
        title: '',
        description: '',
        genre: '',
        bpm: '',
        key: '',
        collaboration_needs: [],
        monetization_type: 'free',
        bounty_amount: '',
        bounty_deadline: '',
        unlock_price: '',
        files: []
      })
      setCurrentStep('basic')
      setOpen(false)
      
    } catch (error) {
      console.error('Error creating project:', error)
      alert('Failed to create project. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const isFormValid = formData.title && formData.description && formData.genre

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Create New Project</span>
          </DialogTitle>
          <DialogDescription>
            Share your unfinished work and find collaborators to bring your vision to life.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={currentStep} onValueChange={setCurrentStep} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="collaboration">Collaboration</TabsTrigger>
            <TabsTrigger value="monetization">Monetization</TabsTrigger>
            <TabsTrigger value="files">Files</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
                <CardDescription>Tell us about your project</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Project Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Midnight Vibes"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your project, what you're looking for, and your vision..."
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="genre">Genre *</Label>
                    <Select value={formData.genre} onValueChange={(value) => handleInputChange('genre', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select genre" />
                      </SelectTrigger>
                      <SelectContent>
                        {GENRES.map(genre => (
                          <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="bpm">BPM</Label>
                    <Input
                      id="bpm"
                      type="number"
                      placeholder="120"
                      value={formData.bpm}
                      onChange={(e) => handleInputChange('bpm', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="key">Key</Label>
                    <Select value={formData.key} onValueChange={(value) => handleInputChange('key', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select key" />
                      </SelectTrigger>
                      <SelectContent>
                        {KEYS.map(key => (
                          <SelectItem key={key} value={key}>{key}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="collaboration" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Collaboration Needs</CardTitle>
                <CardDescription>What roles are you looking for?</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {COLLABORATION_ROLES.map(role => (
                    <div key={role} className="flex items-center space-x-2">
                      <Checkbox
                        id={role}
                        checked={formData.collaboration_needs.includes(role)}
                        onCheckedChange={() => handleCollaborationNeedToggle(role)}
                      />
                      <Label htmlFor={role} className="text-sm">{role}</Label>
                    </div>
                  ))}
                </div>
                
                {formData.collaboration_needs.length > 0 && (
                  <div className="mt-4">
                    <Label>Selected Roles:</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.collaboration_needs.map(role => (
                        <Badge key={role} variant="secondary" className="flex items-center space-x-1">
                          <span>{role}</span>
                          <X 
                            className="h-3 w-3 cursor-pointer" 
                            onClick={() => handleCollaborationNeedToggle(role)}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monetization" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Monetization Options</CardTitle>
                <CardDescription>How do you want to monetize this project?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card 
                    className={`cursor-pointer transition-colors ${formData.monetization_type === 'free' ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => handleInputChange('monetization_type', 'free')}
                  >
                    <CardContent className="p-4 text-center">
                      <Gift className="h-8 w-8 mx-auto mb-2 text-green-600" />
                      <h3 className="font-semibold">Free</h3>
                      <p className="text-sm text-muted-foreground">Open collaboration</p>
                    </CardContent>
                  </Card>

                  <Card 
                    className={`cursor-pointer transition-colors ${formData.monetization_type === 'bounty' ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => handleInputChange('monetization_type', 'bounty')}
                  >
                    <CardContent className="p-4 text-center">
                      <DollarSign className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                      <h3 className="font-semibold">Bounty</h3>
                      <p className="text-sm text-muted-foreground">Reward best contribution</p>
                    </CardContent>
                  </Card>

                  <Card 
                    className={`cursor-pointer transition-colors ${formData.monetization_type === 'unlockable' ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => handleInputChange('monetization_type', 'unlockable')}
                  >
                    <CardContent className="p-4 text-center">
                      <Lock className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                      <h3 className="font-semibold">Unlockable</h3>
                      <p className="text-sm text-muted-foreground">Fans pay to access</p>
                    </CardContent>
                  </Card>
                </div>

                {formData.monetization_type === 'bounty' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="bounty_amount">Bounty Amount ($)</Label>
                      <Input
                        id="bounty_amount"
                        type="number"
                        placeholder="150"
                        value={formData.bounty_amount}
                        onChange={(e) => handleInputChange('bounty_amount', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="bounty_deadline">Deadline</Label>
                      <Input
                        id="bounty_deadline"
                        type="date"
                        value={formData.bounty_deadline}
                        onChange={(e) => handleInputChange('bounty_deadline', e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {formData.monetization_type === 'unlockable' && (
                  <div>
                    <Label htmlFor="unlock_price">Unlock Price ($)</Label>
                    <Input
                      id="unlock_price"
                      type="number"
                      placeholder="5"
                      value={formData.unlock_price}
                      onChange={(e) => handleInputChange('unlock_price', e.target.value)}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="files" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Upload Files</CardTitle>
                <CardDescription>Add your audio files, stems, lyrics, or reference materials</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium mb-2">Drag and drop files here</p>
                  <p className="text-sm text-muted-foreground mb-4">or click to browse</p>
                  <Button variant="outline">Choose Files</Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Supported formats: MP3, WAV, FLAC, AIFF, PDF, TXT, JPG, PNG
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <div className="space-x-2">
            {currentStep !== 'basic' && (
              <Button 
                variant="outline" 
                onClick={() => {
                  const steps = ['basic', 'collaboration', 'monetization', 'files']
                  const currentIndex = steps.indexOf(currentStep)
                  if (currentIndex > 0) setCurrentStep(steps[currentIndex - 1])
                }}
              >
                Previous
              </Button>
            )}
            {currentStep !== 'files' ? (
              <Button 
                onClick={() => {
                  const steps = ['basic', 'collaboration', 'monetization', 'files']
                  const currentIndex = steps.indexOf(currentStep)
                  if (currentIndex < steps.length - 1) setCurrentStep(steps[currentIndex + 1])
                }}
                disabled={currentStep === 'basic' && !isFormValid}
              >
                Next
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit} 
                disabled={!isFormValid || loading}
              >
                {loading ? 'Creating...' : 'Create Project'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

