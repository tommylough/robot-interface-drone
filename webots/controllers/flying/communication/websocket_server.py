import asyncio
import websockets
import json
import queue
import logging
import threading

logger = logging.getLogger(__name__)

class WebSocketServer:
    def __init__(self, host, port):
        self.host = host
        self.port = port
        self.clients = set()
        self.command_queue = queue.Queue(maxsize=1)
        self.flight_mode_callback = None
        self.camera_switch_callback = None
        self.latest_frame = {'data': None, 'lock': threading.Lock()}
    
    def set_flight_mode_callback(self, callback):
        """Set callback for flight mode changes"""
        self.flight_mode_callback = callback
    
    def set_camera_switch_callback(self, callback):
        """Set callback for camera switches"""
        self.camera_switch_callback = callback
    
    async def handler(self, websocket):
        """Handle WebSocket connections"""
        self.clients.add(websocket)
        logger.info(f"Client connected. Total: {len(self.clients)}")
        
        try:
            async for message in websocket:
                try:
                    data = json.loads(message)
                    
                    if data['type'] == 'motor_command':
                        vertical = max(-1.0, min(1.0, float(data.get('vertical', 0.0))))
                        roll = max(-1.0, min(1.0, float(data.get('roll', 0.0))))
                        pitch = max(-1.0, min(1.0, float(data.get('pitch', 0.0))))
                        yaw = max(-1.0, min(1.0, float(data.get('yaw', 0.0))))
                        
                        try:
                            self.command_queue.put_nowait({
                                'vertical': vertical,
                                'roll': roll,
                                'pitch': pitch,
                                'yaw': yaw
                            })
                        except queue.Full:
                            self.command_queue.get_nowait()
                            self.command_queue.put_nowait({
                                'vertical': vertical,
                                'roll': roll,
                                'pitch': pitch,
                                'yaw': yaw
                            })
                    
                    elif data['type'] == 'flight_mode' and self.flight_mode_callback:
                        mode = data.get('mode', 'manual')
                        self.flight_mode_callback(mode)
                    
                    elif data['type'] == 'camera_switch' and self.camera_switch_callback:
                        camera = data.get('camera', 'front')
                        self.camera_switch_callback(camera)
                        
                except (json.JSONDecodeError, ValueError, KeyError) as e:
                    logger.warning(f"Invalid message: {e}")
        except websockets.exceptions.ConnectionClosed:
            pass
        except Exception as e:
            logger.error(f"Handler error: {e}")
        finally:
            self.clients.remove(websocket)
    
    async def broadcast_frames(self):
        """Continuously broadcast frames to all clients"""
        while True:
            with self.latest_frame['lock']:
                frame_data = self.latest_frame['data']
            
            if frame_data and self.clients:
                disconnected = set()
                for client in self.clients.copy():
                    try:
                        await client.send(frame_data)
                    except:
                        disconnected.add(client)
                for client in disconnected:
                    self.clients.discard(client)
            
            await asyncio.sleep(0.016)
    
    async def run(self):
        """Start WebSocket server"""
        async with websockets.serve(self.handler, self.host, self.port):
            logger.info(f"WebSocket running on ws://{self.host}:{self.port}")
            await self.broadcast_frames()
    
    def start(self):
        """Start server in background thread"""
        thread = threading.Thread(target=lambda: asyncio.run(self.run()), daemon=True)
        thread.start()
    
    def get_command(self):
        """Get next command from queue (non-blocking)"""
        try:
            return self.command_queue.get_nowait()
        except queue.Empty:
            return None
    
    def update_frame(self, frame_data):
        """Update latest frame for broadcasting"""
        with self.latest_frame['lock']:
            self.latest_frame['data'] = frame_data
