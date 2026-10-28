@echo off
title K.S. Chandra Research Archive - Web Dashboard
cd /d "%~dp0"
echo ======================================================================
echo    K.S. CHANDRA RESEARCH ARCHIVE
echo    Created and Hosted by K.S.Chandra 2026.
echo ======================================================================
echo Starting web server and opening dashboard...
python server.py
pause
