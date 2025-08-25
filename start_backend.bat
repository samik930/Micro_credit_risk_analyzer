@echo off
echo Starting Micro Credit Risk Analyzer Backend...
cd backend
python -m pip install -r requirements.txt
python seed_data.py
python main.py
