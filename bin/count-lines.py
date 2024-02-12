import os

ignore_paths = [
  '.\\node_modules\\',
  '.\\.next\\',
  '.\\.git\\',
]

def is_ignore_path(path: str):
  for p in ignore_paths:
    if path.startswith(p):
      return True
  return False

counts: dict[str, int] = {}

for path, dirs, files in os.walk('.'):
  if is_ignore_path(path):
    continue
  for file in files:
    filepath = os.path.join(path, file)
    if is_ignore_path(filepath):
      continue
    suffix = filepath.split('.')[-1].lower()
    lines = 0
    try:
      with open(filepath, 'r', encoding='utf8') as f:
        lines = f.readlines().__len__()
    except Exception as e:
      print('error:', e)
    if suffix in counts:
      counts[suffix] += lines
    else:
      counts[suffix] = lines

for count in counts:
  print(count, '\t:', counts[count])
