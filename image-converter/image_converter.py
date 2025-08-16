#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Конвертер изображений
Автоматически находит изображения и создает webp и avif копии в подпапках
"""

import os
import sys
import argparse
from pathlib import Path
from PIL import Image
import pillow_avif  # Для поддержки avif
from typing import List, Tuple, Optional
import logging

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class ImageConverter:
    """Класс для конвертации изображений"""
    
    # Поддерживаемые форматы для конвертации
    SUPPORTED_INPUT_FORMATS = {'.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.tga', '.gif'}
    SUPPORTED_OUTPUT_FORMATS = {'webp', 'avif'}
    
    def __init__(self, search_dir: str):
        """
        Инициализация конвертера
        
        Args:
            search_dir: Папка для поиска изображений
        """
        self.search_dir = Path(search_dir)
        
        if not self.search_dir.exists():
            raise FileNotFoundError(f"Папка не найдена: {self.search_dir}")
        
        logger.info(f"Конвертер инициализирован:")
        logger.info(f"  Папка для поиска: {self.search_dir}")
    
    def find_images(self) -> List[Path]:
        """
        Находит все изображения для конвертации в указанной папке и подпапках
        
        Returns:
            Список путей к изображениям
        """
        images = []
        
        for file_path in self.search_dir.rglob('*'):
            if file_path.is_file() and file_path.suffix.lower() in self.SUPPORTED_INPUT_FORMATS:
                # Пропускаем файлы, которые уже находятся в папках webp или avif
                if 'webp' not in file_path.parts and 'avif' not in file_path.parts:
                    images.append(file_path)
        
        logger.info(f"Найдено {len(images)} изображений для конвертации")
        return images
    
    def create_output_dirs(self, image_path: Path) -> Tuple[Path, Path]:
        """
        Создает папки webp и avif рядом с оригинальным изображением
        
        Args:
            image_path: Путь к исходному изображению
            
        Returns:
            Кортеж (путь к папке webp, путь к папке avif)
        """
        # Получаем папку, где находится изображение
        image_dir = image_path.parent
        
        # Создаем пути к подпапкам
        webp_dir = image_dir / 'webp'
        avif_dir = image_dir / 'avif'
        
        # Создаем папки если их нет
        webp_dir.mkdir(exist_ok=True)
        avif_dir.mkdir(exist_ok=True)
        
        return webp_dir, avif_dir
    
    def convert_image(self, image_path: Path, output_format: str, quality: int = 80) -> bool:
        """
        Конвертирует одно изображение
        
        Args:
            image_path: Путь к исходному изображению
            output_format: Формат для конвертации (webp или avif)
            quality: Качество сжатия (1-100)
            
        Returns:
            True если конвертация успешна, False иначе
        """
        try:
            # Создаем папки для выходных файлов
            webp_dir, avif_dir = self.create_output_dirs(image_path)
            
            # Выбираем папку в зависимости от формата
            output_dir = webp_dir if output_format == 'webp' else avif_dir
            
            # Открываем изображение
            with Image.open(image_path) as img:
                # Конвертируем в RGB если нужно
                if img.mode in ('RGBA', 'LA', 'P'):
                    # Сохраняем прозрачность для PNG
                    if img.mode == 'RGBA':
                        img = img.convert('RGBA')
                    else:
                        img = img.convert('RGB')
                
                # Формируем имя выходного файла
                output_filename = f"{image_path.stem}.{output_format}"
                output_path = output_dir / output_filename
                
                # Сохраняем в выбранном формате
                if output_format == 'webp':
                    img.save(output_path, 'WEBP', quality=quality, method=6)
                elif output_format == 'avif':
                    img.save(output_path, 'AVIF', quality=quality)
                else:
                    logger.error(f"Неподдерживаемый формат: {output_format}")
                    return False
                
                logger.info(f"Конвертировано: {image_path.name} -> {output_dir.name}/{output_filename}")
                return True
                
        except Exception as e:
            logger.error(f"Ошибка при конвертации {image_path.name}: {e}")
            return False
    
    def convert_all(self, output_formats: List[str] = None, quality: int = 80) -> Tuple[int, int]:
        """
        Конвертирует все найденные изображения
        
        Args:
            output_formats: Список форматов для конвертации (по умолчанию: webp и avif)
            quality: Качество сжатия
            
        Returns:
            Кортеж (успешные, общие)
        """
        if output_formats is None:
            output_formats = ['webp', 'avif']
        
        images = self.find_images()
        if not images:
            logger.warning("Изображения для конвертации не найдены")
            return 0, 0
        
        successful = 0
        total = len(images) * len(output_formats)
        
        logger.info(f"Начинаю конвертацию {len(images)} изображений в форматы: {', '.join(output_formats)}")
        
        for i, image_path in enumerate(images, 1):
            logger.info(f"Обрабатываю {i}/{len(images)}: {image_path.name}")
            
            for output_format in output_formats:
                if self.convert_image(image_path, output_format, quality):
                    successful += 1
        
        logger.info(f"Конвертация завершена: {successful}/{total} файлов")
        return successful, total

def main():
    """Основная функция"""
    parser = argparse.ArgumentParser(
        description="Автоматический конвертер изображений в webp и avif форматы",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Примеры использования:
  python image_converter.py /path/to/search
  python image_converter.py /path/to/search --formats webp
  python image_converter.py /path/to/search --quality 90
  python image_converter.py /path/to/search --verbose
        """
    )
    
    parser.add_argument(
        'search_dir',
        help='Папка для поиска изображений (включая подпапки)'
    )
    
    parser.add_argument(
        '--formats', '-f',
        nargs='+',
        choices=['webp', 'avif'],
        default=['webp', 'avif'],
        help='Форматы для конвертации (по умолчанию: webp avif)'
    )
    
    parser.add_argument(
        '--quality', '-q',
        type=int,
        default=80,
        choices=range(1, 101),
        metavar='[1-100]',
        help='Качество сжатия (по умолчанию: 80)'
    )
    
    parser.add_argument(
        '--verbose', '-v',
        action='store_true',
        help='Подробный вывод'
    )
    
    args = parser.parse_args()
    
    # Настройка логирования
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)
    
    # Проверяем существование папки для поиска
    if not os.path.exists(args.search_dir):
        logger.error(f"Папка не найдена: {args.search_dir}")
        sys.exit(1)
    
    try:
        # Создаем конвертер
        converter = ImageConverter(args.search_dir)
        
        # Запускаем конвертацию
        successful, total = converter.convert_all(args.formats, args.quality)
        
        if successful == total:
            logger.info("✅ Все изображения успешно конвертированы!")
            logger.info("📁 WebP копии сохранены в папках 'webp' рядом с оригиналами")
            logger.info("📁 AVIF копии сохранены в папках 'avif' рядом с оригиналами")
        else:
            logger.warning(f"⚠️ Конвертировано {successful} из {total} файлов")
            sys.exit(1)
            
    except Exception as e:
        logger.error(f"Ошибка: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 