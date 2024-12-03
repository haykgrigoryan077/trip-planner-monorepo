## Getting Started

### Prerequisites

Ensure you have the following installed:
- **Python 3.7+**
- **pip** (Python package installer)

---

## Setup Guide

### Installation Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/vacation-api.git
   cd vacation-api

2. Create a virtual environment:

Windows:
    python -m venv env
    .\env\Scripts\activate

Linux / macOS:
    python3 -m venv env
    source env/bin/activate

3. Install dependencies:
    pip install -r requirements.txt

4. Start the Flask server:
    python app.py

5. Testing the API
    After starting the server, you can interact with the API using curl commands.

    curl -X POST http://127.0.0.1:5000/recommendations \
    -H "Content-Type: application/json" \
    -d '{"ratings": [3.5, 4.0, 5.0, 2.0, 3.0, 4.5, 1.0, 3.5, 4.0]}'

    curl -X POST http://127.0.0.1:5000/cost \
    -H "Content-Type: application/json" \
    -d '{"vacation_type": "family", "num_children": 2, "num_days": 7, "city_name": "Paris"}'

    curl "http://127.0.0.1:5000/city-info?city_name=Paris&vacation_type=family"

    ------------------------------------

    cURL on Windows
    For Windows, ensure curl is in your PATH or use PowerShell with curl as follows:

    curl.exe -X POST http://127.0.0.1:5000/recommendations `
    -H "Content-Type: application/json" `
    -d "{""ratings"": [3.5, 4.0, 5.0, 2.0, 3.0, 4.5, 1.0, 3.5, 4.0]}"