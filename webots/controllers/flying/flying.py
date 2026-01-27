import asyncio
import websockets
import json
import base64
import io
from PIL import Image
import threading
import queue
import logging
from controller import Robot

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

CONFIG = {
    'host': 'localhost',
    'port': 8765,
    'frame_interval': 2,
    'jpeg_quality': 85,
    'k_vertical_thrust': 68.5,
    'k_vertical_offset': 0.6,
    'k_vertical_p': 3.0,
    'k_roll_p': 50.0,
    'k_pitch_p': 20.0,
}

robot = Robot()
timestep = int(robot.getBasicTimeStep())

camera = robot.getDevice('camera')
camera.enable(timestep)

imu = robot.getDevice('inertial unit')
imu.enable(timestep)

gps = robot.getDevice('gps')
gps.enable(timestep)

gyro = robot.getDevice('gyro')
gyro.enable(timestep)

front_left_motor = robot.getDevice('front left propeller')
front_right_motor = robot.getDevice('front right propeller')
rear_left_motor = robot.getDevice('rear left propeller')
rear_right_motor = robot.getDevice('rear right propeller')

motors = [front_left_motor, front_right_motor, rear_left_motor, rear_right_motor]
for motor in motors:
    motor.setPosition(float('inf'))
    motor.setVelocity(1.0)

clients = set()
motor_queue = queue.Queue(maxsize=1)
latest_frame = {'data': None, 'lock': threading.Lock()}

async def handler(websocket):
    clients.add(websocket)
    logger.info(f"Client connected. Total: {len(clients)}")

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
                        motor_queue.put_nowait({
                            'vertical': vertical,
                            'roll': roll,
                            'pitch': pitch,
                            'yaw': yaw
                        })
                    except queue.Full:
                        motor_queue.get_nowait()
                        motor_queue.put_nowait({
                            'vertical': vertical,
                            'roll': roll,
                            'pitch': pitch,
                            'yaw': yaw
                        })
            except (json.JSONDecodeError, ValueError, KeyError) as e:
                logger.warning(f"Invalid message: {e}")
    except websockets.exceptions.ConnectionClosed:
        pass
    except Exception as e:
        logger.error(f"Handler error: {e}")
    finally:
        clients.remove(websocket)

async def broadcast_frames():
    while True:
        with latest_frame['lock']:
            frame_data = latest_frame['data']

        if frame_data and clients:
            disconnected = set()
            for client in clients.copy():
                try:
                    await client.send(frame_data)
                except:
                    disconnected.add(client)
            for client in disconnected:
                clients.discard(client)
        await asyncio.sleep(0.016)

async def main():
    async with websockets.serve(handler, CONFIG['host'], CONFIG['port']):
        logger.info(f"WebSocket running on ws://localhost:{CONFIG['port']}")
        await broadcast_frames()

def run_websocket():
    asyncio.run(main())

ws_thread = threading.Thread(target=run_websocket, daemon=True)
ws_thread.start()

def clamp(value, low, high):
    return max(low, min(high, value))

# Wait ONE step for sensors
robot.step(timestep)

# Get initial altitude and set as target
initial_altitude = gps.getValues()[2]
target_altitude = max(1.0, initial_altitude)  # At least 1m target
logger.info(f"Starting at altitude: {initial_altitude:.2f}m, target: {target_altitude:.2f}m")

frame_count = 0
current_disturbances = {'roll': 0, 'pitch': 0, 'yaw': 0}

while robot.step(timestep) != -1:
    roll = imu.getRollPitchYaw()[0]
    pitch = imu.getRollPitchYaw()[1]
    altitude = gps.getValues()[2]
    roll_velocity = gyro.getValues()[0]
    pitch_velocity = gyro.getValues()[1]

    # Get user commands
    try:
        cmd = motor_queue.get_nowait()

        # Altitude adjustment
        if cmd['vertical'] > 0.1:
            target_altitude += 0.02
        elif cmd['vertical'] < -0.1:
            target_altitude -= 0.02
        target_altitude = max(0.5, min(15.0, target_altitude))

        # Disturbances
        current_disturbances['roll'] = cmd['roll'] * -0.8
        current_disturbances['pitch'] = cmd['pitch'] * -1.2
        current_disturbances['yaw'] = cmd['yaw'] * -1.3

    except queue.Empty:
        current_disturbances['roll'] *= 0.95
        current_disturbances['pitch'] *= 0.95
        current_disturbances['yaw'] *= 0.95

    # PID stabilization
    roll_input = CONFIG['k_roll_p'] * clamp(roll, -1.0, 1.0) + roll_velocity + current_disturbances['roll']
    pitch_input = CONFIG['k_pitch_p'] * clamp(pitch, -1.0, 1.0) + pitch_velocity + current_disturbances['pitch']
    yaw_input = current_disturbances['yaw']

    altitude_diff = clamp(target_altitude - altitude + CONFIG['k_vertical_offset'], -1.0, 1.0)
    vertical_input = CONFIG['k_vertical_p'] * (altitude_diff ** 3)

    # Motor outputs
    k = CONFIG['k_vertical_thrust']
    fl = k + vertical_input - roll_input + pitch_input - yaw_input
    fr = k + vertical_input + roll_input + pitch_input + yaw_input
    rl = k + vertical_input - roll_input - pitch_input + yaw_input
    rr = k + vertical_input + roll_input - pitch_input - yaw_input

    front_left_motor.setVelocity(fl)
    front_right_motor.setVelocity(-fr)
    rear_left_motor.setVelocity(-rl)
    rear_right_motor.setVelocity(rr)

    # Camera
    frame_count += 1
    if frame_count % CONFIG['frame_interval'] == 0 and clients:
        try:
            image_data = camera.getImage()
            if image_data:
                width = camera.getWidth()
                height = camera.getHeight()

                img = Image.frombytes('RGBA', (width, height), image_data, 'raw', 'BGRA')
                img = img.convert('RGB')
                buffer = io.BytesIO()
                img.save(buffer, format='JPEG', quality=CONFIG['jpeg_quality'])
                image_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')

                message = json.dumps({
                    'type': 'sensor_data',
                    'timestamp': robot.getTime(),
                    'camera': {'width': width, 'height': height, 'data': image_base64},
                    'telemetry': {
                        'altitude': round(altitude, 2),
                        'target': round(target_altitude, 2),
                        'roll': round(roll, 2),
                        'pitch': round(pitch, 2)
                    }
                })

                with latest_frame['lock']:
                    latest_frame['data'] = message

        except Exception as e:
            logger.error(f"Frame error: {e}")