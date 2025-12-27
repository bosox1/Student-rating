from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional
from fastapi.middleware.cors import CORSMiddleware

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

@app.get("/rating", response_model=list[RatingItem])
def get_rating(group: Optional[str] = None):
    filtered = students
    if group:
        filtered = [s for s in students if s.group == group]

    sorted_students = sorted(filtered, key=lambda s: s.points, reverse=True)

    rating = [
        RatingItem(
            rank=i + 1,
            id=s.id,
            name=s.name,
            group=s.group,
            points=s.points,
        )
        for i, s in enumerate(sorted_students)
    ]

    return rating

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