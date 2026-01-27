import base64
import io
from PIL import Image
import time

class CameraProcessor:
    def __init__(self, config):
        self.config = config
        self.active_camera = 'front'
        self.last_frame_time = time.time()
        self.frame_count = 0
    
    def set_active_camera(self, camera_type):
        """Switch between front and bottom camera"""
        if camera_type in ['front', 'bottom']:
            self.active_camera = camera_type
            return True
        return False
    
    def process_image(self, image_data, width, height):
        """Process raw image data into JPEG base64"""
        if not image_data:
            return None
        
        # Convert raw image data
        img = Image.frombytes('RGBA', (width, height), image_data, 'raw', 'BGRA')
        img = img.convert('RGB')
        
        # Simulate bottom camera
        if self.active_camera == 'bottom':
            img = img.rotate(180)
            img = Image.blend(img, Image.new('RGB', img.size, (0, 0, 0)), 0.3)
        
        # Encode to JPEG
        buffer = io.BytesIO()
        img.save(buffer, format='JPEG', quality=self.config['jpeg_quality'])
        return base64.b64encode(buffer.getvalue()).decode('utf-8')
    
    def calculate_fps(self):
        """Calculate current FPS"""
        current_time = time.time()
        time_diff = current_time - self.last_frame_time
        fps = 1.0 / time_diff if time_diff > 0 else 0
        self.last_frame_time = current_time
        self.frame_count += 1
        return fps
    
    def create_camera_data(self, image_base64, width, height, fps):
        """Create camera data dict for telemetry"""
        return {
            'width': width,
            'height': height,
            'data': image_base64,
            'active': self.active_camera,
            'resolution': f"{width}x{height}",
            'fps': round(fps, 1)
        }
