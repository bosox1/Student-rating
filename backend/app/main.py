from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Literal


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
    Student(id=4, name="Олег Шевченко", group="CS-22", points=102),
    Student(id=5, name="Олег Шевченко", group="CS-22", points=102),
    Student(id=6, name="Олег Шевченко", group="CS-22", points=102),
    Student(id=7, name="Олег Шевченко", group="CS-22", points=102),
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


SortKey = Literal["points", "name", "group", "id"]
SortDir = Literal["asc", "desc"]


def sort_students(data: list[Student], sort: SortKey, direction: SortDir) -> list[Student]:
    reverse = direction == "desc"

    if sort == "points":
        # points desc + стабільність
        return sorted(
            data,
            key=lambda s: (-s.points, s.name, s.id),
        )

    if sort == "name":
        return sorted(data, key=lambda s: (s.name, -s.points, s.id), reverse=reverse)

    if sort == "group":
        return sorted(data, key=lambda s: (s.group, -s.points, s.name, s.id), reverse=reverse)

    # id
    return sorted(data, key=lambda s: s.id, reverse=reverse)


@app.get("/rating", response_model=list[RatingItem])
def get_rating(
    group: Optional[str] = None,
    sort: SortKey = "points",
    dir: SortDir = "desc",
):
    # 1) фільтр
    filtered = students
    if group:
        filtered = [s for s in students if s.group == group]

    # 2) рейтинг завжди рахуємо за points desc (після фільтра)
    ranked = sorted(filtered, key=lambda s: (-s.points, s.name, s.id))
    rank_map = {s.id: i + 1 for i, s in enumerate(ranked)}

    # 3) view-сортування (можеш лишити тільки points, але хай буде)
    view = sort_students(filtered, sort=sort, direction=dir)

    # 4) збірка відповіді
    return [
        RatingItem(
            rank=rank_map[s.id],
            id=s.id,
            name=s.name,
            group=s.group,
            points=s.points,
        )
        for s in view
    ]


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
