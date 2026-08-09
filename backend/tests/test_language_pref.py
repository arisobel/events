"""i18n Fase A1 (2026-08-09): preferência de idioma do usuário."""
import pytest
from pydantic import ValidationError
from sqlalchemy.orm import Session

from app.modules.auth import models as auth_models
from app.modules.auth import schemas as auth_schemas


def test_language_preference_accepts_supported_languages() -> None:
    for lang in ("pt-BR", "en", "he"):
        assert auth_schemas.LanguagePreference(f_language=lang).f_language == lang


def test_language_preference_rejects_unsupported_language() -> None:
    with pytest.raises(ValidationError):
        auth_schemas.LanguagePreference(f_language="xx")


def test_user_language_persists(db_session: Session, active_user: auth_models.User) -> None:
    assert active_user.f_language is None

    active_user.f_language = "he"
    db_session.commit()
    db_session.refresh(active_user)

    assert active_user.f_language == "he"

    # resposta expõe o idioma
    payload = auth_schemas.UserResponse.model_validate(active_user)
    assert payload.f_language == "he"
