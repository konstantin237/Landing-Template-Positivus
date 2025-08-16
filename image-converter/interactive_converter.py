#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Интерактивный конвертер изображений
Автоматически находит изображения и создает webp и avif копии в подпапках
"""

import os
import sys
from pathlib import Path
from image_converter import ImageConverter
import logging

def get_user_input(prompt: str, default: str = None) -> str:
    """Получает ввод от пользователя"""
    if default:
        user_input = input(f"{prompt} [{default}]: ").strip()
        return user_input if user_input else default
    else:
        return input(f"{prompt}: ").strip()

def get_yes_no(prompt: str, default: bool = True) -> bool:
    """Получает да/нет ответ от пользователя"""
    default_str = "Y" if default else "N"
    while True:
        response = input(f"{prompt} [{default_str}]: ").strip().lower()
        if not response:
            return default
        if response in ['y', 'yes', 'да', 'д']:
            return True
        if response in ['n', 'no', 'нет', 'н']:
            return False
        print("Пожалуйста, введите 'y' или 'n'")

def get_quality() -> int:
    """Получает качество сжатия от пользователя"""
    while True:
        try:
            quality = int(input("Качество сжатия (1-100) [80]: ").strip() or "80")
            if 1 <= quality <= 100:
                return quality
            else:
                print("Качество должно быть от 1 до 100")
        except ValueError:
            print("Пожалуйста, введите число от 1 до 100")

def select_formats() -> list:
    """Позволяет пользователю выбрать форматы для конвертации"""
    print("\n📁 Выберите форматы для конвертации:")
    print("1. Только WebP")
    print("2. Только AVIF")
    print("3. WebP и AVIF")
    
    while True:
        choice = input("Ваш выбор (1-3) [3]: ").strip() or "3"
        if choice == "1":
            return ["webp"]
        elif choice == "2":
            return ["avif"]
        elif choice == "3":
            return ["webp", "avif"]
        else:
            print("Пожалуйста, выберите 1, 2 или 3")

def main():
    """Основная функция интерактивного конвертера"""
    print("🖼️  Интерактивный конвертер изображений")
    print("=" * 50)
    print("📁 Автоматический поиск изображений и создание webp/avif копий")
    print("📂 WebP копии сохраняются в папках 'webp' рядом с оригиналами")
    print("📂 AVIF копии сохраняются в папках 'avif' рядом с оригиналами")
    print("=" * 50)
    
    # Получаем папку для поиска
    while True:
        search_dir = get_user_input("Введите путь к папке для поиска изображений")
        if os.path.exists(search_dir):
            break
        else:
            print(f"❌ Папка не найдена: {search_dir}")
            if not get_yes_no("Попробовать снова?"):
                sys.exit(1)
    
    # Выбираем форматы
    formats = select_formats()
    
    # Получаем качество
    print(f"\n🎯 Выбранные форматы: {', '.join(formats).upper()}")
    quality = get_quality()
    
    # Показываем настройки
    print("\n📋 Настройки конвертации:")
    print(f"  Папка для поиска: {search_dir}")
    print(f"  Форматы: {', '.join(formats).upper()}")
    print(f"  Качество: {quality}")
    print(f"  WebP копии: папки 'webp' рядом с оригиналами")
    print(f"  AVIF копии: папки 'avif' рядом с оригиналами")
    
    # Подтверждение
    if not get_yes_no("\nНачать поиск и конвертацию?"):
        print("❌ Конвертация отменена")
        sys.exit(0)
    
    # Создаем конвертер и запускаем
    try:
        converter = ImageConverter(search_dir)
        
        # Сначала показываем найденные изображения
        images = converter.find_images()
        if not images:
            print("❌ Изображения для конвертации не найдены")
            sys.exit(1)
        
        print(f"\n🔍 Найдено {len(images)} изображений:")
        for i, img_path in enumerate(images, 1):
            print(f"  {i}. {img_path}")
        
        if not get_yes_no(f"\nПродолжить конвертацию {len(images)} изображений?"):
            print("❌ Конвертация отменена")
            sys.exit(0)
        
        # Запускаем конвертацию
        successful, total = converter.convert_all(formats, quality)
        
        print(f"\n✅ Конвертация завершена!")
        print(f"   Успешно: {successful}/{total} файлов")
        
        if successful == total:
            print("🎉 Все изображения успешно конвертированы!")
            print("📁 WebP копии сохранены в папках 'webp' рядом с оригиналами")
            print("📁 AVIF копии сохранены в папках 'avif' рядом с оригиналами")
        else:
            print("⚠️  Некоторые файлы не удалось конвертировать")
        
    except Exception as e:
        print(f"❌ Ошибка при конвертации: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 