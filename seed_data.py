import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from src.models.user import db, User
from src.models.project import Project, ProjectCollaborator, ProjectComment
from src.main import app
import json
from datetime import datetime, timedelta

def seed_database():
    with app.app_context():
        # Clear existing data
        db.drop_all()
        db.create_all()
        
        # Create sample users
        users = [
            User(username='alex_producer', email='alex@example.com'),
            User(username='sarah_vocalist', email='sarah@example.com'),
            User(username='mike_guitarist', email='mike@example.com'),
            User(username='emma_mixer', email='emma@example.com'),
            User(username='david_drummer', email='david@example.com')
        ]
        
        for user in users:
            db.session.add(user)
        
        db.session.commit()
        
        # Create sample projects
        projects = [
            Project(
                title='Midnight Vibes',
                description='Lo-fi hip hop track with dreamy synths, looking for a vocalist to complete this chill masterpiece',
                genre='Lo-fi Hip Hop',
                bpm=85,
                key='Am',
                creator_id=1,
                collaboration_needs=json.dumps(['Vocalist', 'Mix Engineer']),
                monetization_type='bounty',
                bounty_amount=150.0,
                bounty_deadline=datetime.utcnow() + timedelta(days=14),
                created_at=datetime.utcnow() - timedelta(hours=2)
            ),
            Project(
                title='Electric Dreams',
                description='Synthwave anthem with retro vibes, need guitar and bass to bring the 80s energy',
                genre='Synthwave',
                bpm=120,
                key='Dm',
                creator_id=2,
                collaboration_needs=json.dumps(['Guitarist', 'Bassist']),
                monetization_type='free',
                created_at=datetime.utcnow() - timedelta(hours=5)
            ),
            Project(
                title='Summer Breeze',
                description='Chill pop track perfect for summer playlists, looking for a producer to polish the sound',
                genre='Pop',
                bpm=110,
                key='C',
                creator_id=3,
                collaboration_needs=json.dumps(['Producer']),
                monetization_type='bounty',
                bounty_amount=200.0,
                bounty_deadline=datetime.utcnow() + timedelta(days=21),
                created_at=datetime.utcnow() - timedelta(days=1)
            ),
            Project(
                title='Urban Nights',
                description='Hip hop beat with jazz influences, seeking a rapper and mix engineer',
                genre='Hip Hop',
                bpm=95,
                key='Gm',
                creator_id=4,
                collaboration_needs=json.dumps(['Rapper', 'Mix Engineer']),
                monetization_type='unlockable',
                is_unlockable=True,
                unlock_price=5.0,
                created_at=datetime.utcnow() - timedelta(hours=8)
            ),
            Project(
                title='Acoustic Sunset',
                description='Indie folk song with beautiful melodies, need a vocalist and harmonica player',
                genre='Indie Folk',
                bpm=75,
                key='D',
                creator_id=5,
                collaboration_needs=json.dumps(['Vocalist', 'Harmonica']),
                monetization_type='free',
                created_at=datetime.utcnow() - timedelta(hours=12)
            )
        ]
        
        for project in projects:
            db.session.add(project)
        
        db.session.commit()
        
        # Create sample collaborators
        collaborators = [
            ProjectCollaborator(project_id=1, user_id=2, role='Vocalist', status='pending'),
            ProjectCollaborator(project_id=1, user_id=4, role='Mix Engineer', status='accepted'),
            ProjectCollaborator(project_id=2, user_id=3, role='Guitarist', status='accepted'),
            ProjectCollaborator(project_id=3, user_id=1, role='Producer', status='pending'),
            ProjectCollaborator(project_id=3, user_id=5, role='Additional Producer', status='accepted')
        ]
        
        for collab in collaborators:
            db.session.add(collab)
        
        # Create sample comments
        comments = [
            ProjectComment(project_id=1, user_id=2, content='Love the vibe! I can definitely add some vocals to this. When do you need it by?', timestamp=45.5),
            ProjectComment(project_id=1, user_id=4, content='The mix is coming along nicely. Just need to work on the low end a bit more.'),
            ProjectComment(project_id=2, user_id=3, content='Added some guitar layers. Check out the new version!', timestamp=120.0),
            ProjectComment(project_id=3, user_id=1, content='This has great potential. I can help with the production if you\'re interested.'),
            ProjectComment(project_id=3, user_id=5, content='The melody is catchy! Would love to collaborate on this.')
        ]
        
        for comment in comments:
            db.session.add(comment)
        
        db.session.commit()
        
        print("Database seeded successfully!")
        print(f"Created {len(users)} users")
        print(f"Created {len(projects)} projects")
        print(f"Created {len(collaborators)} collaborations")
        print(f"Created {len(comments)} comments")

if __name__ == '__main__':
    seed_database()

