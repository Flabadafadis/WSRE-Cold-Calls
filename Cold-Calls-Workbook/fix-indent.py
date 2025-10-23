#!/usr/bin/env python3
"""Fix indentation by removing leading 2 spaces from all lines"""

import re

with open('app.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Split into lines
lines = content.split('\n')

# Remove 2-space indent from each line (except lines that are already at column 0)
fixed_lines = []
for line in lines:
    if line.startswith('  ') and not line.startswith('   '):
        # Remove exactly 2 spaces
        fixed_lines.append(line[2:])
    else:
        fixed_lines.append(line)

# Join back
fixed_content = '\n'.join(fixed_lines)

# Write back
with open('app.js', 'w', encoding='utf-8') as f:
    f.write(fixed_content)

print('✅ Fixed indentation in app.js')
print(f'   Processed {len(lines)} lines')
