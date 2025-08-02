from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    privy_id = db.Column(db.String(255), unique=True, nullable=True)  # Privy user ID
    email = db.Column(db.String(255), unique=True, nullable=False)
    phone = db.Column(db.String(50), nullable=True)  # Phone number from Privy
    wallet_address = db.Column(db.String(255), nullable=True)  # Crypto wallet address
    username = db.Column(db.String(100), unique=True, nullable=False)
    bio = db.Column(db.Text, nullable=True)
    avatar_url = db.Column(db.String(500), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'privy_id': self.privy_id,
            'email': self.email,
            'phone': self.phone,
            'wallet_address': self.wallet_address,
            'username': self.username,
            'bio': self.bio,
            'avatar_url': self.avatar_url,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
    
    def __repr__(self):
        return f'<User {self.username}>'

