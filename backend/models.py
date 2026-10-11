import uuid
import json
from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(100), default="")
    college = Column(String(150), default="")
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    study_state = relationship("UserStudyState", back_populates="user", uselist=False, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "full_name": self.full_name or "",
            "college": self.college or "",
            "is_verified": bool(self.is_verified),
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

class EmailOTP(Base):
    __tablename__ = "email_otps"

    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String(255), index=True, nullable=False)
    otp_code = Column(String(6), nullable=False)
    purpose = Column(String(50), default="registration") # registration, login, reset
    expires_at = Column(DateTime, nullable=False)
    is_used = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class UserStudyState(Base):
    __tablename__ = "user_study_states"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, index=True, nullable=False)
    data_json = Column(Text, nullable=False, default="{}")
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="study_state")

    def get_data(self):
        try:
            return json.loads(self.data_json) if self.data_json else {}
        except Exception:
            return {}

    def set_data(self, data):
        self.data_json = json.dumps(data)
        self.updated_at = datetime.utcnow()

    def extract_llm_context(self):
        """
        Extracts customized study context for personalized LLM prompting.
        """
        data = self.get_data()
        return {
            "subjects": data.get("subjects", []),
            "gapScores": data.get("gapScores", {}),
            "mistakeLog": data.get("mistakeLog", []),
            "currentDate": datetime.utcnow().strftime("%Y-%m-%d"),
            "user_name": self.user.full_name if self.user else "Student",
            "college": self.user.college if self.user else ""
        }
