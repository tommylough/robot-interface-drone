import json

class TelemetryFormatter:
    @staticmethod
    def format_telemetry(sensor_manager, orientation, position, flight_mode, timestamp):
        """Format sensor data into telemetry message"""
        return {
            'altitude': round(position['z'], 2),
            'target': round(0, 2),  # Will be set by caller
            'roll': round(orientation['roll'], 2),
            'pitch': round(orientation['pitch'], 2),
            'yaw': round(orientation['yaw'], 2),
            'gps': {
                'lat': round(position['x'], 6),
                'lon': round(position['y'], 6),
                'alt': round(position['z'], 2)
            },
            'battery': round(sensor_manager.battery, 1),
            'signal_strength': sensor_manager.signal_strength,
            'temperatures': {
                'body': round(sensor_manager.temperatures['body'], 1),
                'motors': {
                    'fl': round(sensor_manager.temperatures['fl'], 1),
                    'fr': round(sensor_manager.temperatures['fr'], 1),
                    'rl': round(sensor_manager.temperatures['rl'], 1),
                    'rr': round(sensor_manager.temperatures['rr'], 1)
                }
            },
            'wind_speed': round(sensor_manager.wind_speed, 1),
            'flight_mode': flight_mode
        }
    
    @staticmethod
    def create_message(camera_data, telemetry_data, timestamp):
        """Create complete WebSocket message"""
        return json.dumps({
            'type': 'sensor_data',
            'timestamp': timestamp,
            'camera': camera_data,
            'telemetry': telemetry_data
        })
