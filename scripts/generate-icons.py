"""
BLACKROCK PWA Icon Generator
Generates all required PWA icons from a base design.

Requirements:
    pip install Pillow cairosvg

Usage:
    python scripts/generate-icons.py
"""

import os
import sys

# Check for required packages
try:
    from PIL import Image, ImageDraw, ImageFilter
except ImportError:
    print("Installing Pillow...")
    os.system(f"{sys.executable} -m pip install Pillow")
    from PIL import Image, ImageDraw, ImageFilter

try:
    import cairosvg
    HAS_CAIROSVG = True
except ImportError:
    HAS_CAIROSVG = False
    print("Note: cairosvg not found. Using fallback icon generation.")
    print("For best quality, install cairosvg: pip install cairosvg")

# Icon sizes required for PWA
ICON_SIZES = [16, 32, 72, 96, 128, 144, 152, 180, 192, 384, 512]

# Brand colors
BRAND_PRIMARY = "#6366f1"
BRAND_DARK = "#030303"
BRAND_LIGHT = "#818cf8"

def hex_to_rgb(hex_color):
    """Convert hex color to RGB tuple."""
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

def create_icon_from_svg(svg_path, output_path, size):
    """Create PNG icon from SVG using cairosvg."""
    cairosvg.svg2png(
        url=svg_path,
        write_to=output_path,
        output_width=size,
        output_height=size
    )
    print(f"  Created {output_path} ({size}x{size})")

def create_icon_fallback(output_path, size):
    """Create a professional icon without SVG conversion."""
    # Create image with dark background
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Calculate dimensions
    padding = size * 0.1
    corner_radius = size * 0.18

    # Draw rounded rectangle background
    bg_color = hex_to_rgb(BRAND_DARK)

    # Draw background (rounded corners approximation)
    draw.rounded_rectangle(
        [0, 0, size-1, size-1],
        radius=int(corner_radius),
        fill=bg_color
    )

    # Draw border
    border_color = (39, 39, 42)  # surface-700
    draw.rounded_rectangle(
        [1, 1, size-2, size-2],
        radius=int(corner_radius)-1,
        outline=border_color,
        width=max(1, size // 128)
    )

    # Draw "B" letter
    brand_color = hex_to_rgb(BRAND_PRIMARY)

    # Calculate B dimensions
    b_left = size * 0.28
    b_top = size * 0.22
    b_width = size * 0.48
    b_height = size * 0.56

    # B stem
    stem_width = size * 0.12
    draw.rectangle(
        [b_left, b_top, b_left + stem_width, b_top + b_height],
        fill=brand_color
    )

    # B top bump
    bump_height = b_height * 0.42
    draw.ellipse(
        [b_left + stem_width * 0.5, b_top,
         b_left + b_width, b_top + bump_height],
        fill=brand_color
    )

    # B bottom bump (slightly larger)
    bottom_bump_top = b_top + b_height * 0.48
    draw.ellipse(
        [b_left + stem_width * 0.5, bottom_bump_top,
         b_left + b_width * 1.05, b_top + b_height],
        fill=brand_color
    )

    # Cut out the inner parts of the B bumps (dark color)
    inner_offset = size * 0.06

    # Top inner cutout
    draw.ellipse(
        [b_left + stem_width + inner_offset, b_top + inner_offset,
         b_left + b_width - inner_offset * 2, b_top + bump_height - inner_offset],
        fill=bg_color
    )

    # Bottom inner cutout
    draw.ellipse(
        [b_left + stem_width + inner_offset, bottom_bump_top + inner_offset,
         b_left + b_width * 1.05 - inner_offset * 2, b_top + b_height - inner_offset],
        fill=bg_color
    )

    # Accent line on the left
    accent_width = max(2, size * 0.015)
    accent_color = (*brand_color, 180)  # Semi-transparent
    accent_img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    accent_draw = ImageDraw.Draw(accent_img)
    accent_draw.rounded_rectangle(
        [b_left - size * 0.08, b_top - size * 0.04,
         b_left - size * 0.08 + accent_width, b_top + b_height + size * 0.04],
        radius=int(accent_width),
        fill=accent_color
    )
    img = Image.alpha_composite(img, accent_img)

    # Save the icon
    img.save(output_path, 'PNG')
    print(f"  Created {output_path} ({size}x{size})")

def main():
    # Get paths
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    icons_dir = os.path.join(project_root, 'public', 'icons')
    svg_path = os.path.join(icons_dir, 'icon.svg')

    # Ensure icons directory exists
    os.makedirs(icons_dir, exist_ok=True)

    print("\n[BLACKROCK Icon Generator]")
    print("=" * 40)
    print(f"Output directory: {icons_dir}\n")

    # Generate icons for each size
    print("Generating icons...")

    for size in ICON_SIZES:
        # Determine output filename
        if size == 180:
            filename = 'apple-touch-icon.png'
        elif size in [16, 32]:
            filename = f'favicon-{size}x{size}.png'
        else:
            filename = f'icon-{size}x{size}.png'

        output_path = os.path.join(icons_dir, filename)

        # Generate icon
        if HAS_CAIROSVG and os.path.exists(svg_path):
            create_icon_from_svg(svg_path, output_path, size)
        else:
            create_icon_fallback(output_path, size)

    # Create favicon.ico (multi-size)
    print("\nCreating favicon.ico...")
    favicon_sizes = [16, 32, 48]
    favicon_images = []

    for size in favicon_sizes:
        if size == 48:
            # Generate 48x48 specifically for favicon
            temp_path = os.path.join(icons_dir, 'temp-48.png')
            if HAS_CAIROSVG and os.path.exists(svg_path):
                create_icon_from_svg(svg_path, temp_path, size)
            else:
                create_icon_fallback(temp_path, size)
            favicon_images.append(Image.open(temp_path))
        else:
            img_path = os.path.join(icons_dir, f'favicon-{size}x{size}.png')
            if os.path.exists(img_path):
                favicon_images.append(Image.open(img_path))

    if favicon_images:
        favicon_path = os.path.join(icons_dir, 'favicon.ico')
        favicon_images[0].save(
            favicon_path,
            format='ICO',
            sizes=[(img.width, img.height) for img in favicon_images]
        )
        print(f"  Created {favicon_path}")

        # Close all images before cleanup
        for img in favicon_images:
            img.close()

        # Clean up temp file
        temp_path = os.path.join(icons_dir, 'temp-48.png')
        if os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except PermissionError:
                pass  # File may still be locked, ignore

    print("\n[SUCCESS] Icon generation complete!")
    print(f"\nGenerated {len(ICON_SIZES) + 1} icon files in {icons_dir}")

    # Print next steps
    print("\n[Next steps]")
    print("1. Update your layout.tsx to reference the new icons")
    print("2. Run 'npm install next-pwa' to enable PWA")
    print("3. Uncomment the PWA config in next.config.js")

if __name__ == '__main__':
    main()
