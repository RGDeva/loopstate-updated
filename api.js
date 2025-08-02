// API service for LoopState backend communication
const API_BASE_URL = 'http://localhost:5000/api';

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Project endpoints
  async getProjects(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/projects?${queryString}` : '/projects';
    return this.request(endpoint);
  }

  async getProject(id) {
    return this.request(`/projects/${id}`);
  }

  async createProject(projectData) {
    return this.request('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  }

  async updateProject(id, projectData) {
    return this.request(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(projectData),
    });
  }

  async exploreProjects(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/explore?${queryString}` : '/explore';
    return this.request(endpoint);
  }

  // Collaboration endpoints
  async requestCollaboration(projectId, collaborationData) {
    return this.request(`/projects/${projectId}/collaborate`, {
      method: 'POST',
      body: JSON.stringify(collaborationData),
    });
  }

  async updateCollaboratorStatus(projectId, collaboratorId, statusData) {
    return this.request(`/projects/${projectId}/collaborators/${collaboratorId}`, {
      method: 'PUT',
      body: JSON.stringify(statusData),
    });
  }

  // Comment endpoints
  async getProjectComments(projectId) {
    return this.request(`/projects/${projectId}/comments`);
  }

  async addComment(projectId, commentData) {
    return this.request(`/projects/${projectId}/comments`, {
      method: 'POST',
      body: JSON.stringify(commentData),
    });
  }

  // File endpoints
  async getProjectFiles(projectId) {
    return this.request(`/projects/${projectId}/files`);
  }

  async uploadFile(formData) {
    // For file uploads, don't set Content-Type header (let browser set it with boundary)
    const response = await fetch(`${API_BASE_URL}/files/upload`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }

  // Collaboration endpoints
  async getCollaborators(projectId) {
    return this.request(`/projects/${projectId}/collaborators`);
  }

  // Bounty endpoints
  async selectBountyWinner(projectId, winnerData) {
    return this.request(`/projects/${projectId}/bounty/winner`, {
      method: 'POST',
      body: JSON.stringify(winnerData),
    });
  }

  // User endpoints
  async getUsers() {
    return this.request('/users');
  }

  async getUser(id) {
    return this.request(`/users/${id}`);
  }

  async createUser(userData) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(id, userData) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id) {
    return this.request(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  // Explore projects with filters
  async exploreProjects(queryParams = '') {
    const url = queryParams ? `/explore?${queryParams}` : '/explore'
    const response = await fetch(`${this.baseURL}${url}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  }

  // Explore projects with filters
  async exploreProjects(queryParams = '') {
    const url = queryParams ? `/explore?${queryParams}` : '/explore'
    const response = await fetch(`${this.baseURL}${url}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  }
}

export default ApiService

