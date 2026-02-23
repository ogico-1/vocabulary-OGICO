import re

content = open(r'c:\Users\norit\.gemini\antigravity\scratch\toeic-master-ai\app\vocabulary\weak\page.tsx', 'r', encoding='utf-8').read()

# Filter out comments and strings to avoid false positives?
# For now, let's just count <div and </div>

opens = [m.start() for m in re.finditer(r'<div', content)]
closes = [m.start() for m in re.finditer(r'</div', content)]

print(f"Total opens: {len(opens)}")
print(f"Total closes: {len(closes)}")

# Let's find where it breaks
stack = []
lines = content.splitlines()
for i, line in enumerate(lines):
    line_num = i + 1
    # Simple regex for matching tags in a line
    tags = re.findall(r'<(div)|(/div)', line)
    for tag in tags:
        if tag[0] == 'div':
            stack.append(line_num)
        elif tag[1] == '/div':
            if not stack:
                print(f"Error: </div> at line {line_num} has no matching <div")
            else:
                stack.pop()

if stack:
    print(f"Error: Unclosed <div at lines: {stack}")
else:
    print("All tags matched (simplified check)")
