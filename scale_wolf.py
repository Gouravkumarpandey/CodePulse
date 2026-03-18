import sys

def scale_wolf(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    old_class = 'className="absolute bottom-6 left-6 w-20 h-20 object-contain select-none pointer-events-none z-20"'
    new_class = 'className="absolute bottom-6 left-6 w-32 h-32 object-contain select-none pointer-events-none z-20"'

    content = content.replace(old_class, new_class)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

scale_wolf(r'c:\Personal Project\CodePulse\Frontend\src\pages\LoginPage.tsx')
scale_wolf(r'c:\Personal Project\CodePulse\Frontend\src\pages\SignupPage.tsx')

print("Success")
