import sys

file_path = r'c:\Personal Project\CodePulse\Frontend\src\pages\LoginPage.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

new_url = 'https://www.panavision.com/images/default-source/credits/credits_posters_a_minecraft_movie-350x525.jpg?sfvrsn=fb7e81f5_1'

# Replace Left Side Image to provided poster URL
content = content.replace(
    "style={{ backgroundImage: 'url(/Focus.webp)' }}",
    f"style={{ backgroundImage: 'url({new_url})' }}"
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Success")
