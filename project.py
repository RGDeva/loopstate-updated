from flask import Blueprint, jsonify, request
from src.models.project import Project, ProjectFile, ProjectCollaborator, ProjectComment, db
from src.models.user import User
import json
from datetime import datetime

project_bp = Blueprint('project', __name__)

@project_bp.route('/projects', methods=['GET'])
def get_projects():
    """Get all projects with optional filtering"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    genre = request.args.get('genre')
    status = request.args.get('status', 'active')
    monetization_type = request.args.get('monetization_type')
    
    query = Project.query.filter_by(status=status)
    
    if genre:
        query = query.filter(Project.genre.ilike(f'%{genre}%'))
    
    if monetization_type:
        query = query.filter_by(monetization_type=monetization_type)
    
    projects = query.order_by(Project.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    result = []
    for project in projects.items:
        project_data = project.to_dict()
        # Add creator info
        creator = User.query.get(project.creator_id)
        project_data['creator'] = creator.to_dict() if creator else None
        
        # Add collaboration stats
        project_data['collaborator_count'] = len(project.collaborators)
        project_data['comment_count'] = len(project.comments)
        
        result.append(project_data)
    
    return jsonify({
        'projects': result,
        'total': projects.total,
        'pages': projects.pages,
        'current_page': page
    })

@project_bp.route('/projects', methods=['POST'])
def create_project():
    """Create a new project"""
    data = request.json
    
    # Parse collaboration needs if provided
    collaboration_needs = data.get('collaboration_needs', [])
    if isinstance(collaboration_needs, list):
        collaboration_needs = json.dumps(collaboration_needs)
    
    project = Project(
        title=data['title'],
        description=data.get('description'),
        genre=data.get('genre'),
        bpm=data.get('bpm'),
        key=data.get('key'),
        creator_id=data['creator_id'],
        collaboration_needs=collaboration_needs,
        monetization_type=data.get('monetization_type', 'free'),
        bounty_amount=data.get('bounty_amount'),
        bounty_deadline=datetime.fromisoformat(data['bounty_deadline']) if data.get('bounty_deadline') else None,
        is_unlockable=data.get('is_unlockable', False),
        unlock_price=data.get('unlock_price')
    )
    
    db.session.add(project)
    db.session.commit()
    
    return jsonify(project.to_dict()), 201

@project_bp.route('/projects/<int:project_id>', methods=['GET'])
def get_project(project_id):
    """Get a specific project with full details"""
    project = Project.query.get_or_404(project_id)
    project_data = project.to_dict()
    
    # Add creator info
    creator = User.query.get(project.creator_id)
    project_data['creator'] = creator.to_dict() if creator else None
    
    # Add collaborators
    collaborators = []
    for collab in project.collaborators:
        collab_data = collab.to_dict()
        user = User.query.get(collab.user_id)
        collab_data['user'] = user.to_dict() if user else None
        collaborators.append(collab_data)
    project_data['collaborators'] = collaborators
    
    # Add files
    project_data['files'] = [file.to_dict() for file in project.files]
    
    # Add comments
    comments = []
    for comment in project.comments:
        comment_data = comment.to_dict()
        user = User.query.get(comment.user_id)
        comment_data['user'] = user.to_dict() if user else None
        comments.append(comment_data)
    project_data['comments'] = comments
    
    return jsonify(project_data)

@project_bp.route('/projects/<int:project_id>', methods=['PUT'])
def update_project(project_id):
    """Update a project"""
    project = Project.query.get_or_404(project_id)
    data = request.json
    
    # Update fields
    project.title = data.get('title', project.title)
    project.description = data.get('description', project.description)
    project.genre = data.get('genre', project.genre)
    project.bpm = data.get('bpm', project.bpm)
    project.key = data.get('key', project.key)
    project.status = data.get('status', project.status)
    
    # Update collaboration needs
    if 'collaboration_needs' in data:
        collaboration_needs = data['collaboration_needs']
        if isinstance(collaboration_needs, list):
            collaboration_needs = json.dumps(collaboration_needs)
        project.collaboration_needs = collaboration_needs
    
    # Update monetization settings
    project.monetization_type = data.get('monetization_type', project.monetization_type)
    project.bounty_amount = data.get('bounty_amount', project.bounty_amount)
    if data.get('bounty_deadline'):
        project.bounty_deadline = datetime.fromisoformat(data['bounty_deadline'])
    project.is_unlockable = data.get('is_unlockable', project.is_unlockable)
    project.unlock_price = data.get('unlock_price', project.unlock_price)
    
    db.session.commit()
    return jsonify(project.to_dict())

@project_bp.route('/projects/<int:project_id>/collaborate', methods=['POST'])
def request_collaboration(project_id):
    """Request to collaborate on a project"""
    project = Project.query.get_or_404(project_id)
    data = request.json
    
    # Check if user is already a collaborator
    existing = ProjectCollaborator.query.filter_by(
        project_id=project_id,
        user_id=data['user_id']
    ).first()
    
    if existing:
        return jsonify({'error': 'User is already a collaborator'}), 400
    
    collaborator = ProjectCollaborator(
        project_id=project_id,
        user_id=data['user_id'],
        role=data['role'],
        status='pending'
    )
    
    db.session.add(collaborator)
    db.session.commit()
    
    return jsonify(collaborator.to_dict()), 201

@project_bp.route('/projects/<int:project_id>/collaborators/<int:collaborator_id>', methods=['PUT'])
def update_collaborator_status(project_id, collaborator_id):
    """Update collaborator status (accept/reject)"""
    collaborator = ProjectCollaborator.query.get_or_404(collaborator_id)
    data = request.json
    
    collaborator.status = data.get('status', collaborator.status)
    collaborator.contribution_percentage = data.get('contribution_percentage', collaborator.contribution_percentage)
    
    db.session.commit()
    return jsonify(collaborator.to_dict())

@project_bp.route('/projects/<int:project_id>/comments', methods=['POST'])
def add_comment(project_id):
    """Add a comment to a project"""
    project = Project.query.get_or_404(project_id)
    data = request.json
    
    comment = ProjectComment(
        project_id=project_id,
        user_id=data['user_id'],
        content=data['content'],
        timestamp=data.get('timestamp')
    )
    
    db.session.add(comment)
    db.session.commit()
    
    # Return comment with user info
    comment_data = comment.to_dict()
    user = User.query.get(comment.user_id)
    comment_data['user'] = user.to_dict() if user else None
    
    return jsonify(comment_data), 201

@project_bp.route('/projects/<int:project_id>/files', methods=['POST'])
def upload_file(project_id):
    """Upload a file to a project (placeholder - actual file upload would need additional handling)"""
    project = Project.query.get_or_404(project_id)
    data = request.json
    
    file_record = ProjectFile(
        project_id=project_id,
        filename=data['filename'],
        original_filename=data['original_filename'],
        file_type=data['file_type'],
        file_size=data.get('file_size'),
        file_path=data['file_path'],
        uploaded_by=data['uploaded_by'],
        is_stem=data.get('is_stem', False)
    )
    
    db.session.add(file_record)
    db.session.commit()
    
    return jsonify(file_record.to_dict()), 201

@project_bp.route('/projects/<int:project_id>/bounty/winner', methods=['POST'])
def select_bounty_winner(project_id):
    """Select a bounty winner"""
    project = Project.query.get_or_404(project_id)
    data = request.json
    
    if project.monetization_type != 'bounty':
        return jsonify({'error': 'Project is not a bounty project'}), 400
    
    project.bounty_winner_id = data['winner_id']
    project.status = 'completed'
    
    db.session.commit()
    return jsonify(project.to_dict())

@project_bp.route('/explore', methods=['GET'])
def explore_projects():
    """Get projects for the explore page with enhanced filtering"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 12, type=int)
    sort_by = request.args.get('sort_by', 'recent')  # 'recent', 'trending', 'bounty', 'popular'
    
    # Filter parameters
    search = request.args.get('search', '')
    genre = request.args.get('genre', '')
    monetization_type = request.args.get('monetization_type', '')
    min_bpm = request.args.get('min_bpm', type=int)
    max_bpm = request.args.get('max_bpm', type=int)
    collaboration_needs = request.args.get('collaboration_needs', '')
    
    query = Project.query.filter_by(status='active')
    
    # Apply search filter
    if search:
        search_term = f'%{search}%'
        query = query.filter(
            Project.title.ilike(search_term) |
            Project.description.ilike(search_term) |
            Project.genre.ilike(search_term)
        )
    
    # Apply genre filter
    if genre:
        query = query.filter(Project.genre.ilike(f'%{genre}%'))
    
    # Apply monetization filter
    if monetization_type:
        if monetization_type == 'unlockable':
            query = query.filter(Project.is_unlockable == True)
        else:
            query = query.filter(Project.monetization_type == monetization_type)
    
    # Apply BPM filters
    if min_bpm:
        query = query.filter(Project.bpm >= min_bpm)
    if max_bpm:
        query = query.filter(Project.bpm <= max_bpm)
    
    # Apply collaboration needs filter
    if collaboration_needs:
        needs_list = collaboration_needs.split(',')
        for need in needs_list:
            query = query.filter(Project.collaboration_needs.ilike(f'%{need.strip()}%'))
    
    # Apply sorting
    if sort_by == 'recent':
        query = query.order_by(Project.created_at.desc())
    elif sort_by == 'bounty':
        query = query.filter(Project.bounty_amount.isnot(None)).order_by(Project.bounty_amount.desc())
    elif sort_by == 'trending':
        # Simple trending based on recent activity (comments/collaborators)
        query = query.order_by(Project.updated_at.desc())
    elif sort_by == 'popular':
        # Sort by number of collaborators and comments (popularity)
        query = query.order_by(Project.updated_at.desc())  # Simplified for now
    
    projects = query.paginate(page=page, per_page=per_page, error_out=False)
    
    result = []
    for project in projects.items:
        project_data = project.to_dict()
        
        # Add creator info
        creator = User.query.get(project.creator_id)
        project_data['creator'] = creator.to_dict() if creator else None
        
        # Add stats
        project_data['collaborator_count'] = len(project.collaborators)
        project_data['comment_count'] = len(project.comments)
        
        # Parse collaboration needs
        if project.collaboration_needs:
            try:
                project_data['collaboration_needs'] = json.loads(project.collaboration_needs)
            except:
                project_data['collaboration_needs'] = []
        else:
            project_data['collaboration_needs'] = []
        
        result.append(project_data)
    
    return jsonify({
        'projects': result,
        'total': projects.total,
        'pages': projects.pages,
        'current_page': page,
        'has_next': projects.has_next,
        'has_prev': projects.has_prev
    })

