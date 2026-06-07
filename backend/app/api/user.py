"""
用户信息接口（成员A 维护）

GET  /api/users/me — 获取个人信息
PUT  /api/users/me — 修改个人资料
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user_id
from app.models.user import User, UserTag
from app.models.tag import Tag
from app.schemas.user import UserUpdateRequest
from app.utils.response import ok, err

router = APIRouter()


@router.get("/me")
def get_current_user(
    current_user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """获取当前用户信息，含标签列表"""
    user = db.get(User, current_user_id)
    if not user:
        return err(404, "用户不存在")

    tags = [
        t[0]
        for t in db.query(Tag.name)
        .join(UserTag, UserTag.tag_id == Tag.id)
        .filter(UserTag.user_id == current_user_id)
        .all()
    ]

    return ok("success", {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "avatar_url": user.avatar_url,
        "nickname": user.nickname,
        "major": user.major,
        "grade": user.grade,
        "bio": user.bio,
        "tags": tags,
        "created_at": user.created_at.isoformat() if user.created_at else None,
    })


@router.put("/me")
def update_current_user(
    req: UserUpdateRequest,
    current_user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """修改个人资料，所有字段可选；标签先删后插"""
    user = db.get(User, current_user_id)
    if not user:
        return err(404, "用户不存在")

    payload = req.model_dump(exclude_unset=True)
    tags = payload.pop("tags", None)

    for field, value in payload.items():
        setattr(user, field, value)

    if tags is not None:
        db.query(UserTag).filter(UserTag.user_id == current_user_id).delete()
        for name in tags:
            tag = db.query(Tag).filter(Tag.name == name).first()
            if tag:
                db.add(UserTag(user_id=current_user_id, tag_id=tag.id))

    db.commit()
    return ok("修改成功", {})
