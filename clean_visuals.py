import sys

def clean_login_page():
    file_path = r'c:\Personal Project\CodePulse\Frontend\src\pages\LoginPage.tsx'
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        
    for i, line in enumerate(lines):
        if '<div className="w-full flex justify-between items-center p-4">' in line:
            lines[i] = '      <div className="w-full flex justify-end items-center p-4">\n'
            lines[i+1] = ""
            lines[i+2] = ""
            lines[i+3] = ""
            lines[i+4] = ""
            lines[i+5] = ""
            lines[i+6] = ""
            break

    apple_idx = -1
    passkey_end_idx = -1
    for i, line in enumerate(lines):
        if '{/* Apple */}' in line:
            apple_idx = i
        if '<span>Continue with Passkey</span>' in line:
            for j in range(i, len(lines)):
                if '</button>' in lines[j]:
                    passkey_end_idx = j
                    break
            break

    if apple_idx != -1 and passkey_end_idx != -1:
        for k in range(apple_idx, passkey_end_idx + 1):
            lines[k] = ""

    with open(file_path, 'w', encoding='utf-8') as f:
        f.writelines(lines)
    print("LoginPage cleaned")

def clean_signup_page():
    file_path = r'c:\Personal Project\CodePulse\Frontend\src\pages\SignupPage.tsx'
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        
    for i, line in enumerate(lines):
        if '<div className="w-full flex justify-between items-center p-4">' in line:
            lines[i] = '      <div className="w-full flex justify-end items-center p-4">\n'
            lines[i+1] = ""
            lines[i+2] = ""
            lines[i+3] = ""
            lines[i+4] = ""
            lines[i+5] = ""
            break

    with open(file_path, 'w', encoding='utf-8') as f:
        f.writelines(lines)
    print("SignupPage cleaned")

clean_login_page()
clean_signup_page()
print("Success")
