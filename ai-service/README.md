# AI Service

## Install

```bash
pip install -r requirements.txt
```

## Run

```bash
uvicorn app:app --reload --host 127.0.0.1 --port 8000
```

## Endpoints

- `POST /parse-resume`
- `POST /recommend`
- `POST /roadmap`
- `POST /analyze-match`

## Sample `/analyze-match` payload

```json
{
  "student": {
    "skills": ["React", "Node"],
    "bio": "Passionate about full-stack dev",
    "cgpa": 8.5
  },
  "job": {
    "required_skills": ["React", "Node", "Docker"],
    "description": "Looking for a backend expert",
    "min_cgpa": 8.0
  }
}
```
