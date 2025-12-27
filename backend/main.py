from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional


app = FastAPI(title="Student Rating System")

@app.get("/health")
def health():
    return {"status": "ok"}


class Student(BaseModel):
    id: int
    name: str
    group: str
    points: int

students = [
    Student(id=1, name="Іван Петренко", group="CS-21", points=95),
    Student(id=2, name="Марія Коваль", group="CS-21", points=88),
    Student(id=3, name="Олег Шевченко", group="CS-22", points=102),
]

@app.get("/students", response_model=list[Student])
def get_students():
    return students

class RatingItem(BaseModel):
    rank: int
    id: int
    name: str
    group: str
    points: int

@app.get("/rating", response_model=list[Student])
def get_rating(group: Optional[str] = None):
    filtered = students
    if group:
        filtered = [s for s in students if s.group == group]

    return sorted(filtered, key=lambda s: s.points, reverse=True)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)