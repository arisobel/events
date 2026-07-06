"""Schedule module - SQLAlchemy models.

Activity: uma atividade do cronograma de um evento (religioso, infantil,
refeição, entretenimento...). É o backbone consumido pela gestão, pelo futuro
App do Hóspede e pelos displays de TV do hotel.

Modelagem de tempo: `f_date` (dia) + `f_start_time`/`f_end_time` como "HH:MM"
(string) — simples de exibir/ordenar e sem dor de fuso; o "agora/próximo" dos
displays combina data+hora on-the-fly.
"""
from datetime import datetime

from sqlalchemy import Column, Date, DateTime, ForeignKey, Integer, String, Text

from app.db.base import Base


class Activity(Base):
    __tablename__ = "t_activity"

    id = Column(Integer, primary_key=True, index=True)
    f_event_id = Column(Integer, ForeignKey("t_event.id"), nullable=False, index=True)
    f_title = Column(String(200), nullable=False)
    # religioso | refeicao | infantil | palestra | entretenimento | geral (validado no schema)
    f_activity_type = Column(String(30), nullable=False, default="geral")
    # all | men | women | children | youth
    f_audience = Column(String(20), nullable=False, default="all")
    f_location = Column(String(150))
    f_date = Column(Date, nullable=False, index=True)
    f_start_time = Column(String(5), nullable=False)  # "HH:MM"
    f_end_time = Column(String(5))                     # "HH:MM" (opcional)
    f_description = Column(Text)
    f_sort_order = Column(Integer, nullable=False, default=0)
    f_created_at = Column(DateTime, default=datetime.utcnow)
