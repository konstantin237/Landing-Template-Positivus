#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Скрипт для оптимизации путей к изображениям в проекте.
Автоматически выбирает наиболее легкий формат изображения (original/webp/avif)
и обновляет пути в файлах html, pug, php, scss.
"""

import os
import re
import sys
from pathlib import Path
from typing import Dict, List, Tuple, Optional


class ImageOptimizer:
    def __init__(self):
        # Получаем путь к корневой папке проекта (3 уровня вверх от скрипта)
        script_path = Path(__file__).resolve()
        self.project_root = script_path.parent.parent.parent.parent
        
        # Поддерживаемые расширения изображений (кроме svg)
        self.image_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.bmp', '.tiff'}

    def get_file_size(self, file_path: Path) -> int:
        """Получает размер файла в байтах."""
        try:
            return file_path.stat().st_size if file_path.exists() else float('inf')
        except:
            return float('inf')

    def find_image_variants(self, image_path: str) -> Dict[str, Tuple[str, int]]:
        """
        Находит все варианты изображения (original, webp, avif) и их размеры.
        Возвращает словарь {формат: (путь, размер_в_байтах)}
        """
        variants = {}
        
        # Преобразуем относительный путь в абсолютный
        # Убираем ./ в начале если есть
        clean_path = image_path.lstrip('./')
        abs_image_path = self.project_root / clean_path
        
        print(f"    🔍 Проверяем: {abs_image_path}")
        
        if not abs_image_path.exists():
            print(f"    ❌ Оригинальное изображение не найдено")
            return variants
            
        # Получаем информацию об оригинальном изображении
        original_size = self.get_file_size(abs_image_path)
        variants['original'] = (image_path, original_size)
        print(f"    ✅ Оригинал: {original_size} байт")
        
        # Ищем webp и avif варианты в соседних папках
        parent_dir = abs_image_path.parent
        filename_without_ext = abs_image_path.stem
        
        for format_name in ['webp', 'avif']:
            format_dir = parent_dir / format_name
            format_file = format_dir / f"{filename_without_ext}.{format_name}"
            
            if format_file.exists():
                # Создаем относительный путь для варианта
                try:
                    relative_path = str(format_file.relative_to(self.project_root)).replace('\\', '/')
                    size = self.get_file_size(format_file)
                    variants[format_name] = (relative_path, size)
                    print(f"    ✅ {format_name}: {size} байт")
                except ValueError:
                    # Если не удается создать относительный путь
                    print(f"    ❌ Ошибка создания относительного пути для {format_name}")
            else:
                print(f"    ❌ {format_name} не найден: {format_file}")
        
        return variants

    def get_optimal_image_info(self, variants: Dict[str, Tuple[str, int]]) -> Dict:
        """Определяет оптимальный путь и приоритеты."""
        if not variants:
            return {}
            
        # Сортируем по размеру файла (меньше = лучше)
        sorted_variants = sorted(variants.items(), key=lambda x: x[1][1])
        
        result = {
            'main_src': sorted_variants[0][1][0],  # Самый легкий вариант
            'data_attributes': {}
        }
        
        print(f"    📊 Самый легкий: {sorted_variants[0][0]} ({sorted_variants[0][1][1]} байт)")
        
        # Устанавливаем приоритеты для avif и webp
        avif_info = variants.get('avif')
        webp_info = variants.get('webp')
        
        if avif_info:
            result['data_attributes']['data-avif-src'] = avif_info[0]
            
        if webp_info:
            result['data_attributes']['data-webp-src'] = webp_info[0]
        
        # Сравниваем avif и webp для установки приоритетов
        if avif_info and webp_info:
            avif_size = avif_info[1]
            webp_size = webp_info[1]
            
            if avif_size < webp_size:
                result['data_attributes']['data-avif-priority'] = '1'
                result['data_attributes']['data-webp-priority'] = '2'
                print(f"    🏆 AVIF легче WebP: {avif_size} < {webp_size}")
            else:
                result['data_attributes']['data-avif-priority'] = '2'
                result['data_attributes']['data-webp-priority'] = '1'
                print(f"    🏆 WebP легче AVIF: {webp_size} < {avif_size}")
        elif avif_info:
            result['data_attributes']['data-avif-priority'] = '1'
        elif webp_info:
            result['data_attributes']['data-webp-priority'] = '1'
        
        return result

    def process_html_php_file(self, file_path: Path) -> bool:
        """Обрабатывает HTML/PHP файлы."""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original_content = content
            
            # Паттерн для поиска img тегов
            img_pattern = r'<img([^>]*?)src=["\']([^"\']+\.(jpg|jpeg|png|gif|webp|avif|bmp|tiff))["\']([^>]*?)>'
            
            def replace_img(match):
                before_src = match.group(1)
                image_path = match.group(2)
                extension = match.group(3)
                after_src = match.group(4)
                
                print(f"  🖼️ Найден img: {image_path}")
                
                # Пропускаем SVG
                if image_path.lower().endswith('.svg'):
                    return match.group(0)
                
                variants = self.find_image_variants(image_path)
                if not variants:
                    return match.group(0)
                
                optimal_info = self.get_optimal_image_info(variants)
                if not optimal_info:
                    return match.group(0)
                
                # Создаем новый тег
                new_src = optimal_info['main_src']
                data_attrs = ''
                
                for attr_name, attr_value in optimal_info.get('data_attributes', {}).items():
                    data_attrs += f' {attr_name}="{attr_value}"'
                
                new_tag = f'<img{before_src}src="{new_src}"{after_src}{data_attrs}>'
                print(f"  ✅ Заменен на: {new_tag}")
                return new_tag
            
            content = re.sub(img_pattern, replace_img, content, flags=re.IGNORECASE)
            
            if content != original_content:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                return True
            
            return False
            
        except Exception as e:
            print(f"❌ Ошибка при обработке {file_path}: {e}")
            return False

    def process_pug_file(self, file_path: Path) -> bool:
        """Обрабатывает PUG файлы."""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original_content = content
            
            # Ищем все строки с src="image"
            lines = content.split('\n')
            new_lines = []
            
            i = 0
            while i < len(lines):
                line = lines[i]
                
                # Ищем img( в строке
                if 'img(' in line:
                    # Ищем src в этой строке или следующих
                    img_block_lines = [line]
                    src_match = None
                    
                    # Проверяем текущую строку на наличие src
                    src_pattern = r'src=["\']([^"\']+\.(jpg|jpeg|png|gif|webp|avif|bmp|tiff))["\']'
                    src_match = re.search(src_pattern, line, re.IGNORECASE)
                    
                    # Если src не найден в текущей строке, ищем в следующих
                    if not src_match:
                        j = i + 1
                        while j < len(lines) and not lines[j].strip().endswith(')'):
                            img_block_lines.append(lines[j])
                            src_match = re.search(src_pattern, lines[j], re.IGNORECASE)
                            if src_match:
                                break
                            j += 1
                        
                        # Добавляем строку с закрывающей скобкой если она есть
                        if j < len(lines):
                            img_block_lines.append(lines[j])
                    
                    if src_match:
                        image_path = src_match.group(1)
                        print(f"  🖼️ Найден Pug img: {image_path}")
                        
                        # Пропускаем SVG
                        if not image_path.lower().endswith('.svg'):
                            variants = self.find_image_variants(image_path)
                            if variants:
                                optimal_info = self.get_optimal_image_info(variants)
                                if optimal_info:
                                    # Заменяем src на оптимальный
                                    new_src = optimal_info['main_src']
                                    
                                    # Заменяем src во всем блоке
                                    for k in range(len(img_block_lines)):
                                        img_block_lines[k] = img_block_lines[k].replace(image_path, new_src)
                                    
                                    # Добавляем data-атрибуты перед закрывающей скобкой
                                    data_attrs = optimal_info.get('data_attributes', {})
                                    if data_attrs:
                                        # Находим строку с закрывающей скобкой
                                        for k in range(len(img_block_lines)):
                                            if ')' in img_block_lines[k]:
                                                # Убираем скобку
                                                img_block_lines[k] = img_block_lines[k].replace(')', '')
                                                
                                                # Добавляем атрибуты
                                                indent = ' ' * (len(img_block_lines[0]) - len(img_block_lines[0].lstrip()) + 4)
                                                for attr_name, attr_value in data_attrs.items():
                                                    img_block_lines.append(f'{indent}{attr_name}="{attr_value}"')
                                                
                                                # Добавляем закрывающую скобку
                                                img_block_lines.append(f'{indent})')
                                                break
                                    
                                    print(f"  ✅ Обновлен Pug блок")
                    
                    new_lines.extend(img_block_lines)
                    i += len(img_block_lines) - 1
                else:
                    new_lines.append(line)
                
                i += 1
            
            new_content = '\n'.join(new_lines)
            
            if new_content != original_content:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                return True
            
            return False
            
        except Exception as e:
            print(f"❌ Ошибка при обработке {file_path}: {e}")
            return False

    def process_scss_file(self, file_path: Path) -> bool:
        """Обрабатывает SCSS файлы."""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original_content = content
            
            # Паттерн для поиска url() в SCSS
            url_pattern = r'url\(["\']?([^"\'()]+\.(jpg|jpeg|png|gif|webp|avif|bmp|tiff))["\']?\)'
            
            def replace_url(match):
                image_path = match.group(1)
                
                print(f"  🖼️ Найден SCSS url: {image_path}")
                
                # Пропускаем SVG
                if image_path.lower().endswith('.svg'):
                    return match.group(0)
                
                variants = self.find_image_variants(image_path)
                if not variants:
                    return match.group(0)
                
                optimal_info = self.get_optimal_image_info(variants)
                if not optimal_info:
                    return match.group(0)
                
                new_path = optimal_info['main_src']
                new_url = match.group(0).replace(image_path, new_path)
                print(f"  ✅ Заменен на: {new_url}")
                return new_url
            
            content = re.sub(url_pattern, replace_url, content, flags=re.IGNORECASE)
            
            if content != original_content:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                return True
            
            return False
            
        except Exception as e:
            print(f"❌ Ошибка при обработке {file_path}: {e}")
            return False

    def process_file(self, file_path: Path) -> bool:
        """Обрабатывает файл в зависимости от его типа."""
        print(f"\n📄 Обрабатываем: {file_path.relative_to(self.project_root)}")
        
        file_extension = file_path.suffix.lower()
        
        if file_extension in ['.html', '.htm', '.php']:
            return self.process_html_php_file(file_path)
        elif file_extension == '.pug':
            return self.process_pug_file(file_path)
        elif file_extension in ['.scss', '.sass']:
            return self.process_scss_file(file_path)
        
        return False

    def run(self):
        """Запускает процесс оптимизации."""
        print("🚀 Запуск оптимизации изображений...")
        print(f"📁 Корневая папка проекта: {self.project_root}")
        
        # Находим все файлы для обработки
        file_patterns = ['**/*.html', '**/*.htm', '**/*.php', '**/*.pug', '**/*.scss', '**/*.sass']
        files_to_process = []
        
        for pattern in file_patterns:
            files_to_process.extend(self.project_root.glob(pattern))
        
        # Исключаем файлы из папки prod
        files_to_process = [f for f in files_to_process if 'prod' not in f.parts]
        
        if not files_to_process:
            print("⚠️ Не найдены файлы для обработки")
            return
        
        print(f"📄 Найдено файлов для обработки: {len(files_to_process)}")
        
        updated_files = 0
        for file_path in files_to_process:
            if self.process_file(file_path):
                updated_files += 1
                print(f"✅ Обновлен: {file_path.relative_to(self.project_root)}")
            else:
                print(f"⚪ Без изменений: {file_path.relative_to(self.project_root)}")
        
        print(f"\n✨ Завершено! Обновлено файлов: {updated_files} из {len(files_to_process)}")


def main():
    """Основная функция."""
    try:
        optimizer = ImageOptimizer()
        optimizer.run()
    except KeyboardInterrupt:
        print("\n❌ Операция прервана пользователем")
    except Exception as e:
        print(f"\n❌ Критическая ошибка: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()