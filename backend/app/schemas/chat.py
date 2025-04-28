from pydantic import BaseModel


class Conversation(BaseModel):
    id: str
    user_id: str
    user_name: str
    user_email: str
    admin_id: str
    admin_name: str
    admin_email: str
