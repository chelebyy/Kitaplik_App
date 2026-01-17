import os
from PIL import Image
import numpy as np

def analyze_and_process_logo():
    input_path = "assets/images/logo.png"
    output_path = "assets/images/notification_icon.png"
    
    if not os.path.exists(input_path):
        print(f"Error: {input_path} not found.")
        return

    try:
        img = Image.open(input_path).convert("RGBA")
        print(f"Original image size: {img.size}")
        
        # Analyze transparency
        np_img = np.array(img)
        alpha_channel = np_img[:, :, 3]
        
        # Check if image has any transparency
        has_transparency = np.min(alpha_channel) < 255
        print(f"Has transparency: {has_transparency}")
        
        if not has_transparency:
            print("Warning: Original logo has no transparency. This is likely the cause of the square icon.")
            # If no transparency, we might need a smart way to create it, 
            # e.g., if it's black on white, make white transparent.
            # For now, let's just assume we want to create a version that works.
        
        # Create a new image for the notification icon
        # Strategy: 
        # 1. Resize if too big (Android notification icons are usually small, but Expo handles resizing. 
        #    96x96 is a safe target for density, but keep original for quality if not huge)
        # 2. Make all non-transparent pixels WHITE.
        # 3. Ensure background is transparent.
        
        # Create a mask from the alpha channel
        # If the original image doesn't have good transparency, this might just result in a white square.
        # So we need to be careful.
        
        # Create a new image for the notification icon
        # Strategy: 
        # 1. Resize if too big (Android notification icons are usually small, but Expo handles resizing. 
        #    96x96 is a safe target for density, but keep original for quality if not huge)
        # 2. Make all non-transparent pixels WHITE.
        # 3. Ensure background is transparent.
        
        # Create a new white image with the same alpha channel
        # We want the shape of the logo, but filled with pure white (255, 255, 255)
        
        _, _, _, a = img.split()
        
        # If the image was originally "colored" but transparent, we just want the silhouette usually.
        # However, for the best look on Android, it should be a flat white shape on transparent bg.
        
        white_img = Image.new("RGBA", img.size, (255, 255, 255, 0))
        
        # Paste white using the original alpha as mask
        white_img.paste((255, 255, 255, 255), (0, 0), mask=a)
        
        # Save
        white_img.save(output_path, "PNG")
        print(f"Successfully generated {output_path}")
        
        # Verify
        output_img = Image.open(output_path)
        print(f"Output info: {output_img.format}, {output_img.size}, {output_img.mode}")

    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    analyze_and_process_logo()
