import sys

def remove_text(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    text_block = """        <div className="relative z-10 flex flex-col items-center justify-center text-white max-w-md">
          <p className="text-xl font-bold uppercase text-center tracking-wider" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
            Track your GitHub activity and boost productivity
          </p>
        </div>"""

    content = content.replace(text_block, "")

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

remove_text(r'c:\Personal Project\CodePulse\Frontend\src\pages\LoginPage.tsx')
remove_text(r'c:\Personal Project\CodePulse\Frontend\src\pages\SignupPage.tsx')

print("Success")
