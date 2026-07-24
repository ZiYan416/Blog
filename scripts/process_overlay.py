import os
from PIL import Image, ImageEnhance, ImageOps

input_path = os.path.join(os.getcwd(), 'public', 'images', 'hero-overlay.png')
output_silver_path = os.path.join(os.getcwd(), 'public', 'images', 'hero-overlay-silver.png')

print(f"Loading {input_path}...")
img = Image.open(input_path).convert('RGBA')

r, g, b, a = img.split()

# 1. Create a silver-iron metallic grayscale version of RGB channels
# Use luminance weighting (L = 0.299*R + 0.587*G + 0.114*B)
gray = ImageOps.grayscale(Image.merge('RGB', (r, g, b)))

# 2. Boost brightness and contrast for bright silver steel metallic shine
enhancer_bright = ImageEnhance.Brightness(gray)
silver_bright = enhancer_bright.enhance(1.45)  # Make it bright silver-white

enhancer_contrast = ImageEnhance.Contrast(silver_bright)
silver_contrast = enhancer_contrast.enhance(1.3)  # Crisp metallic contrast

# 3. Add subtle cool silver-iron tone (R: 98%, G: 100%, B: 105%)
r_silver = silver_contrast.point(lambda p: min(255, int(p * 0.96)))
g_silver = silver_contrast.point(lambda p: min(255, int(p * 1.0)))
b_silver = silver_contrast.point(lambda p: min(255, int(p * 1.06)))

# Re-combine with the original untouched Alpha mask (transparent windows remain 100% clean)
silver_img = Image.merge('RGBA', (r_silver, g_silver, b_silver, a))

silver_img.save(output_silver_path, 'PNG')
print(f"Saved bright silver metallic cabin overlay to {output_silver_path} successfully!")
