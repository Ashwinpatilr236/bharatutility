import base64

with open('public/parksignal-logo.png', 'rb') as f:
    b64_trans = base64.b64encode(f.read()).decode('utf-8')

with open('public/parksignal-emblem.png', 'rb') as f:
    b64_emblem = base64.b64encode(f.read()).decode('utf-8')

svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 745 253" fill="none" width="100%" height="100%">
  <image href="data:image/png;base64,{b64_trans}" x="0" y="0" width="745" height="253" />
</svg>'''

with open('public/parksignal-logo.svg', 'w', encoding='utf-8') as f:
    f.write(svg_content)

print('Generated public/parksignal-logo.svg successfully!')
