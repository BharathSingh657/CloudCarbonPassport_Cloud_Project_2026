@echo off
echo Checking Python and Scikit-Learn installation...
"C:\Users\bhara\anaconda3\python.exe" -c "import sklearn, pandas, joblib; print('Python environment OK. Scikit-learn:', sklearn.__version__, 'Pandas:', pandas.__version__)"
echo.
pause
