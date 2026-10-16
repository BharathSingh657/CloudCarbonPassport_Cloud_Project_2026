@echo off
cd /d "C:\Users\bhara\Desktop\CLOUD\CloudCarbonPassport_Cloud_Project_2026"
echo =======================================================
echo Training Green AI Carbon Forecasting Model...
echo =======================================================
"C:\Users\bhara\anaconda3\python.exe" src\ml_model\train_carbon_forecaster.py
echo.
echo Model training execution completed.
pause
