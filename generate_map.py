states = {
    "Jammu and Kashmir": (150, 50),
    "Himachal Pradesh": (160, 80),
    "Punjab": (130, 90),
    "Uttarakhand": (180, 90),
    "Haryana": (150, 110),
    "Rajasthan": (100, 150),
    "Uttar Pradesh": (190, 140),
    "Bihar": (250, 150),
    "Sikkim": (280, 110),
    "Arunachal Pradesh": (330, 100),
    "Assam": (310, 120),
    "Nagaland": (340, 130),
    "Manipur": (335, 150),
    "Mizoram": (320, 170),
    "Tripura": (300, 160),
    "Meghalaya": (300, 130),
    "West Bengal": (270, 170),
    "Jharkhand": (240, 180),
    "Odisha": (250, 220),
    "Chhattisgarh": (210, 200),
    "Madhya Pradesh": (170, 190),
    "Gujarat": (80, 200),
    "Maharashtra": (130, 240),
    "Goa": (120, 280),
    "Karnataka": (140, 300),
    "Telangana": (180, 260),
    "Andhra Pradesh": (200, 290),
    "Kerala": (150, 350),
    "Tamil Nadu": (190, 340)
}

svg_content = ['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">']
svg_content.append('<rect width="100%" height="100%" fill="#f8fafc"/>')
for state, (x, y) in states.items():
    id_name = state.replace(" ", "_")
    svg_content.append(f'<g id="{id_name}" style="cursor:pointer">')
    svg_content.append(f'<circle cx="{x}" cy="{y}" r="15" fill="#e2e8f0" stroke="#64748b" stroke-width="2"><title>{state}</title></circle>')
    svg_content.append(f'<text x="{x}" y="{y+5}" text-anchor="middle" font-size="10" fill="#334155" style="pointer-events:none; font-family: Arial, sans-serif;">{state[:2].upper()}</text>')
    svg_content.append('</g>')
svg_content.append('</svg>')

with open("india.svg", "w") as f:
    f.write("\n".join(svg_content))
print("india.svg generated successfully.")
