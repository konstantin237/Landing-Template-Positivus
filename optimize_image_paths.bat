@echo off
chcp 65001 >nul
echo ================================================================
echo               OPTIMIZE IMAGES PATHS
echo ================================================================
echo.

:: Проверяем наличие Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python не найден в системе!
    echo 💡 Установите Python с официального сайта: https://python.org
    echo.
    pause
    exit /b 1
)

:: Путь к Python скрипту
set SCRIPT_PATH=dev\assets\python\libs\optimize_images_paths.py

:: Проверяем существование скрипта
if not exist "%SCRIPT_PATH%" (
    echo ❌ Скрипт не найден: %SCRIPT_PATH%
    echo 💡 Убедитесь, что скрипт находится в правильной папке
    echo.
    pause
    exit /b 1
)

echo 🚀 Запуск оптимизации изображений...
echo 📁 Папка проекта: %CD%
echo 🐍 Скрипт: %SCRIPT_PATH%
echo.

:: Запускаем Python скрипт
python "%SCRIPT_PATH%"

:: Проверяем код завершения
if errorlevel 1 (
    echo.
    echo ❌ Скрипт завершился с ошибкой!
) else (
    echo.
    echo ✅ Скрипт успешно выполнен!
)

echo.
echo ================================================================
pause