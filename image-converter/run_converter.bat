@echo off
chcp 65001 >nul
title Конвертер изображений

echo.
echo ========================================
echo    🖼️ Конвертер изображений
echo ========================================
echo.

REM Проверяем наличие Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python не найден! Установите Python 3.7+
    pause
    exit /b 1
)

REM Проверяем наличие зависимостей
echo 🔍 Проверка зависимостей...
python -c "import PIL, pillow_avif" >nul 2>&1
if errorlevel 1 (
    echo 📦 Установка зависимостей...
    pip install -r requirements.txt
    if errorlevel 1 (
        echo ❌ Ошибка установки зависимостей!
        pause
        exit /b 1
    )
)

echo ✅ Зависимости установлены
echo.

REM Запускаем интерактивный конвертер
echo 🚀 Запуск конвертера...
python interactive_converter.py

echo.
echo Нажмите любую клавишу для выхода...
pause >nul 