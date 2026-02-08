from PIL import Image

# Open the image
img = Image.open('assets/images/Screenshot 2026-01-08 at 5.02.05 PM_cropped.png')

# Convert to RGBA
img = img.convert('RGBA')

# Get the image data
pixels = img.load()

# Gray color
gray = (211, 211, 211, 255)  # with alpha

# Make gray pixels transparent
for y in range(img.height):
    for x in range(img.width):
        if pixels[x, y][:3] == (211, 211, 211):  # check RGB
            pixels[x, y] = (211, 211, 211, 0)  # set alpha to 0

# Save the image
img.save('assets/images/Screenshot 2026-01-08 at 5.02.05 PM_transparent.png')

print('Transparent image saved as Screenshot 2026-01-08 at 5.02.05 PM_transparent.png')