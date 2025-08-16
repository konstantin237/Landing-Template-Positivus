#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Скрипт для оптимизации путей к изображениям в проекте.
Автоматически выбирает наиболее легкий формат изображения (original/webp/avif)
и обновляет пути в файлах html, pug, php, scss, css.
"""

import os
import re
import sys
from pathlib import Path
from typing import Dict, List, Tuple, Optional


class ImageOptimizer:
    def __init__(self):
        # Получаем путь к корневой папке проекта (4 уровня вверх от скрипта)
        # dev/assets/python/libs/optimize_images_paths.py -> BASIC-START-TEMPLATE
        script_path = Path(__file__).resolve()
        self.project_root = script_path.parent.parent.parent.parent.parent
        
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
        abs_image_path = self.project_root / 'dev' / clean_path
        
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
                # Создаем относительный путь для варианта относительно dev/
                try:
                    dev_relative_path = str(format_file.relative_to(self.project_root / 'dev')).replace('\\', '/')
                    size = self.get_file_size(format_file)
                    variants[format_name] = (dev_relative_path, size)
                    print(f"    ✅ {format_name}: {size} байт")
                except ValueError:
                    # Если не удается создать относительный путь
                    print(f"    ❌ Ошибка создания относительного пути для {format_name}")
            else:
                print(f"    ❌ {format_name} не найден: {format_file}")
        
        return variants

    def get_optimal_image_info(self, variants: Dict[str, Tuple[str, int]]) -> Dict:
        """Определяет оптимальный путь и приоритеты для всех форматов."""
        if not variants:
            return {}
            
        # Сортируем по размеру файла (меньше = лучше)
        sorted_variants = sorted(variants.items(), key=lambda x: x[1][1])
        
        result = {
            'main_src': sorted_variants[0][1][0],  # Самый легкий вариант
            'data_attributes': {}
        }
        
        print(f"    📊 Самый легкий: {sorted_variants[0][0]} ({sorted_variants[0][1][1]} байт)")
        
        # Получаем оригинальный путь для создания потенциальных путей
        original_path = variants.get('original', ['', 0])[0]
        if original_path:
            # Создаем потенциальные пути к webp и avif
            path_parts = Path(original_path)
            parent = path_parts.parent
            stem = path_parts.stem
            original_ext = path_parts.suffix.lstrip('.')  # Расширение без точки
            
            # ИСПРАВЛЕНИЕ: правильно создаем пути, используя прямые слэши
            potential_webp = str(parent / 'webp' / f'{stem}.webp').replace('\\', '/')
            potential_avif = str(parent / 'avif' / f'{stem}.avif').replace('\\', '/')
            
            # Добавляем data-original-ext
            result['data_attributes']['data-original-ext'] = original_ext
            
            # Создаем список всех форматов с их информацией
            all_formats = []
            
            # Добавляем существующие форматы
            for format_name, (path, size) in variants.items():
                all_formats.append({
                    'name': format_name,
                    'path': path,
                    'size': size,
                    'exists': True
                })
            
            # Добавляем потенциальные форматы (если их нет в существующих)
            if 'webp' not in variants:
                all_formats.append({
                    'name': 'webp',
                    'path': potential_webp,
                    'size': float('inf'),  # Максимальный размер для несуществующих
                    'exists': False
                })
            
            if 'avif' not in variants:
                all_formats.append({
                    'name': 'avif',
                    'path': potential_avif,
                    'size': float('inf'),  # Максимальный размер для несуществующих
                    'exists': False
                })
            
            # Сортируем форматы: сначала существующие по размеру, потом несуществующие
            all_formats.sort(key=lambda x: (not x['exists'], x['size']))
            
            # Устанавливаем приоритеты и пути для всех форматов
            priority = 1
            for format_info in all_formats:
                format_name = format_info['name']
                format_path = format_info['path']
                
                # Добавляем src атрибут
                result['data_attributes'][f'data-{format_name}-src'] = format_path
                
                # Добавляем priority атрибут
                result['data_attributes'][f'data-{format_name}-priority'] = str(priority)
                
                if format_info['exists']:
                    print(f"    🏆 {format_name}: приоритет {priority} (размер: {format_info['size']} байт)")
                else:
                    print(f"    🔮 {format_name}: приоритет {priority} (потенциальный файл)")
                
                priority += 1
        
        return result

    def process_html_php_file(self, file_path: Path) -> bool:
        """Обрабатывает HTML/PHP файлы."""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original_content = content
            
            # Паттерн для поиска img тегов (включая уже обработанные с data-атрибутами)
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
                
                # Проверяем, если тег уже обработан (содержит data-webp-src или data-avif-src)
                full_tag = match.group(0)
                if 'data-webp-src=' in full_tag or 'data-avif-src=' in full_tag or 'data-original-src=' in full_tag:
                    print(f"  ⚪ Уже обработан, пропускаем")
                    return match.group(0)
                
                variants = self.find_image_variants(image_path)
                if not variants:
                    return match.group(0)
                
                optimal_info = self.get_optimal_image_info(variants)
                if not optimal_info:
                    return match.group(0)
                
                # Удаляем существующие data-атрибуты из before_src и after_src на всякий случай
                before_src = re.sub(r'\s+data-(webp|avif|original)-(src|priority|ext)=["\'][^"\']*["\']', '', before_src)
                after_src = re.sub(r'\s+data-(webp|avif|original)-(src|priority|ext)=["\'][^"\']*["\']', '', after_src)
                
                # Создаем новый тег с переносами строк и отступами
                new_src = optimal_info['main_src']
                
                # Определяем базовый отступ (количество пробелов перед <img)
                # Находим начало строки с img тегом
                lines_before = content[:match.start()].split('\n')
                current_line = lines_before[-1] if lines_before else ''
                base_indent = len(current_line) - len(current_line.lstrip()) if current_line.strip() == '' else 0
                
                # Добавляем отступ для атрибутов (базовый + 4 пробела)
                attr_indent = ' ' * (base_indent + 4)
                
                # Начинаем новый тег
                new_tag = f'<img{before_src}src="{new_src}"{after_src}'
                
                # Добавляем data-атрибуты каждый с новой строки в правильном порядке
                data_attrs = optimal_info.get('data_attributes', {})
                
                # Сортируем атрибуты по приоритету: сначала по priority, потом по типу
                def sort_attrs(item):
                    attr_name, attr_value = item
                    if '-priority' in attr_name:
                        # Извлекаем приоритет для сортировки
                        priority = int(attr_value)
                        return (priority, 1)  # priority атрибуты идут вторыми
                    elif '-src' in attr_name:
                        # Для src атрибутов извлекаем приоритет из соответствующего priority атрибута
                        format_name = attr_name.replace('data-', '').replace('-src', '')
                        priority_key = f'data-{format_name}-priority'
                        priority = int(data_attrs.get(priority_key, '999'))
                        return (priority, 0)  # src атрибуты идут первыми
                    else:
                        return (0, 2)  # остальные атрибуты (например, data-original-ext)
                
                sorted_attrs = sorted(data_attrs.items(), key=sort_attrs)
                
                for attr_name, attr_value in sorted_attrs:
                    # Исправляем слэши на прямые
                    attr_value_fixed = str(attr_value).replace('\\', '/')
                    new_tag += f'\n{attr_indent}{attr_name}="{attr_value_fixed}"'
                
                new_tag += '>'
                
                print(f"  ✅ Заменен на многострочный формат")
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
                    img_block_end_index = i  # Индекс последней строки блока img
                    
                    # Проверяем текущую строку на наличие src
                    src_pattern = r'src=["\']([^"\']+\.(jpg|jpeg|png|gif|webp|avif|bmp|tiff))["\']'
                    src_match = re.search(src_pattern, line, re.IGNORECASE)
                    
                    # Если src не найден в текущей строке, ищем в следующих
                    if not src_match:
                        j = i + 1
                        while j < len(lines):
                            current_line = lines[j]
                            img_block_lines.append(current_line)
                            img_block_end_index = j
                            
                            src_match = re.search(src_pattern, current_line, re.IGNORECASE)
                            if src_match:
                                break
                            
                            # Если нашли закрывающую скобку, прерываем поиск
                            if ')' in current_line:
                                break
                                
                            j += 1
                    
                    if src_match:
                        image_path = src_match.group(1)
                        print(f"  🖼️ Найден Pug img: {image_path}")
                        
                        # Проверяем, не обработан ли уже блок
                        full_block = '\n'.join(img_block_lines)
                        if 'data-webp-src=' in full_block or 'data-avif-src=' in full_block or 'data-original-src=' in full_block:
                            print(f"  ⚪ Уже обработан, пропускаем")
                            new_lines.extend(img_block_lines)
                            i = img_block_end_index + 1
                            continue
                        
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
                                                # Определяем правильный отступ (такой же как у img строки)
                                                base_indent = len(img_block_lines[0]) - len(img_block_lines[0].lstrip())
                                                attr_indent = ' ' * (base_indent + 12)  # +12 пробелов для выравнивания атрибутов
                                                
                                                # Убираем скобку из строки
                                                img_block_lines[k] = img_block_lines[k].replace(')', '').rstrip()
                                                
                                                # Сортируем атрибуты как в HTML версии
                                                def sort_attrs(item):
                                                    attr_name, attr_value = item
                                                    if '-priority' in attr_name:
                                                        priority = int(attr_value)
                                                        return (priority, 1)
                                                    elif '-src' in attr_name:
                                                        format_name = attr_name.replace('data-', '').replace('-src', '')
                                                        priority_key = f'data-{format_name}-priority'
                                                        priority = int(data_attrs.get(priority_key, '999'))
                                                        return (priority, 0)
                                                    else:
                                                        return (0, 2)
                                                
                                                sorted_attrs = sorted(data_attrs.items(), key=sort_attrs)
                                                
                                                # Добавляем атрибуты с правильными отступами
                                                attrs_to_add = []
                                                for attr_name, attr_value in sorted_attrs:
                                                    # Используем прямые слэши для всех путей
                                                    attr_value_fixed = str(attr_value).replace('\\', '/')
                                                    attrs_to_add.append(f'{attr_indent}{attr_name}="{attr_value_fixed}"')
                                                
                                                # Добавляем закрывающую скобку с правильным отступом
                                                attrs_to_add.append(f'{attr_indent})')
                                                
                                                # Заменяем последнюю строку блока на строку без скобки
                                                # и добавляем все атрибуты
                                                img_block_lines = img_block_lines[:k+1] + attrs_to_add
                                                break
                                    
                                    print(f"  ✅ Обновлен Pug блок")
                    
                    # Добавляем все строки img блока
                    new_lines.extend(img_block_lines)
                    # Перемещаем указатель на следующую строку после блока
                    i = img_block_end_index + 1
                else:
                    # Если это не img строка, просто добавляем её
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

    def process_scss_css_file(self, file_path: Path) -> bool:
        """Обрабатывает SCSS/CSS файлы."""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original_content = content
            
            # Паттерн для поиска url() в SCSS/CSS
            url_pattern = r'url\(["\']?([^"\'()]+\.(jpg|jpeg|png|gif|webp|avif|bmp|tiff))["\']?\)'
            
            def replace_url(match):
                image_path = match.group(1)
                
                print(f"  🖼️ Найден SCSS/CSS url: {image_path}")
                
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
        print(f"\n📄 Обрабатываем: {file_path.relative_to(self.project_root / 'dev')}")
        
        file_extension = file_path.suffix.lower()
        
        if file_extension in ['.html', '.htm', '.php']:
            return self.process_html_php_file(file_path)
        elif file_extension == '.pug':
            return self.process_pug_file(file_path)
        elif file_extension in ['.scss', '.sass', '.css']:
            return self.process_scss_css_file(file_path)
        
        return False

    def get_user_choice(self) -> List[str]:
        """Показывает меню и возвращает список расширений для обработки."""
        print("\n" + "="*60)
        print("🎯 МЕНЮ ВЫБОРА РЕЖИМА ОБРАБОТКИ")
        print("="*60)
        print("1. Обработать все файлы (pug, scss, html, css, php)")
        print("2. Только препроцессоры (pug, scss)")
        print("3. Только постобработка (html, php, css)")
        print("4. Выбрать файлы вручную")
        print("="*60)
        
        while True:
            try:
                choice = input("Выберите режим (1-4): ").strip()
                
                if choice == '1':
                    return ['.pug', '.scss', '.sass', '.html', '.htm', '.php', '.css']
                elif choice == '2':
                    return ['.pug', '.scss', '.sass']
                elif choice == '3':
                    return ['.html', '.htm', '.php', '.css']
                elif choice == '4':
                    print("\n📝 Введите расширения файлов через запятую (например: html, scss, pug)")
                    print("Доступные расширения: html, htm, php, pug, scss, sass, css")
                    
                    user_input = input("Расширения: ").strip()
                    if not user_input:
                        print("❌ Не введены расширения!")
                        continue
                    
                    # Парсим ввод пользователя
                    extensions = []
                    for ext in user_input.split(','):
                        ext = ext.strip().lower()
                        # Добавляем точку если её нет
                        if not ext.startswith('.'):
                            ext = '.' + ext
                        
                        # Проверяем что расширение поддерживается
                        if ext in ['.html', '.htm', '.php', '.pug', '.scss', '.sass', '.css']:
                            extensions.append(ext)
                        else:
                            print(f"⚠️ Неподдерживаемое расширение: {ext}")
                    
                    if extensions:
                        return extensions
                    else:
                        print("❌ Не найдено поддерживаемых расширений!")
                        continue
                else:
                    print("❌ Неверный выбор! Введите 1, 2, 3 или 4")
                    continue
                    
            except KeyboardInterrupt:
                print("\n❌ Операция прервана пользователем")
                sys.exit(0)

    def run(self):
        """Запускает процесс оптимизации."""
        print("🚀 Скрипт оптимизации изображений")
        print(f"📁 Корневая папка проекта: {self.project_root}")
        
        # Получаем выбор пользователя
        selected_extensions = self.get_user_choice()
        
        print(f"\n🎯 Выбранные расширения: {', '.join(selected_extensions)}")
        
        # Находим все файлы для обработки в папке dev
        dev_folder = self.project_root / 'dev'
        files_to_process = []
        
        for extension in selected_extensions:
            pattern = f'**/*{extension}'
            files_to_process.extend(dev_folder.glob(pattern))
        
        # Исключаем файлы из папки prod
        files_to_process = [f for f in files_to_process if 'prod' not in f.parts]
        
        if not files_to_process:
            print("⚠️ Не найдены файлы для обработки")
            return
        
        print(f"📄 Найдено файлов для обработки: {len(files_to_process)}")
        print("="*60)
        
        updated_files = 0
        for file_path in files_to_process:
            if self.process_file(file_path):
                updated_files += 1
                print(f"✅ Обновлен: {file_path.relative_to(self.project_root / 'dev')}")
            else:
                print(f"⚪ Без изменений: {file_path.relative_to(self.project_root / 'dev')}")
        
        print("="*60)
        print(f"✨ Завершено! Обновлено файлов: {updated_files} из {len(files_to_process)}")


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