import asyncio
import websockets
import json
import base64
import io
from PIL import Image
import threading
import queue
import logging
import random
import time
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

# Flight state
flight_state = {
    'mode': 'manual',
    'battery': 100.0,
    'signal_strength': 100,
    'temperatures': {'body': 25.0, 'fl': 25.0, 'fr': 25.0, 'rl': 25.0, 'rr': 25.0},
    'wind_speed': 0.0,
    'active_camera': 'front',
    'start_time': time.time(),
    'last_frame_time': time.time(),
    'frame_count': 0,
}

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

                elif data['type'] == 'flight_mode':
                    mode = data.get('mode', 'manual')
                    if mode in ['manual', 'takeoff', 'land', 'hover']:
                        flight_state['mode'] = mode
                        logger.info(f"Flight mode changed to: {mode}")

                elif data['type'] == 'camera_switch':
                    camera_type = data.get('camera', 'front')
                    if camera_type in ['front', 'bottom']:
                        flight_state['active_camera'] = camera_type
                        logger.info(f"Camera switched to: {camera_type}")

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

def update_simulated_sensors(motor_speeds, altitude, time_elapsed):
    """Update simulated sensor values"""
    avg_motor_speed = sum(abs(s) for s in motor_speeds) / len(motor_speeds)
    drain_rate = 0.01 + (avg_motor_speed / 100.0) * 0.02
    flight_state['battery'] = max(0, flight_state['battery'] - drain_rate * (timestep / 1000.0))

    gps_pos = gps.getValues()
    distance = (gps_pos[0]**2 + gps_pos[1]**2)**0.5
    base_signal = max(20, 100 - (distance * 2))
    flight_state['signal_strength'] = int(base_signal + random.uniform(-5, 5))

    base_temp = 25.0
    motor_heat = (avg_motor_speed / 100.0) * 40.0
    flight_state['temperatures']['body'] = base_temp + motor_heat * 0.5 + random.uniform(-1, 1)
    flight_state['temperatures']['fl'] = base_temp + motor_heat + random.uniform(-2, 2)
    flight_state['temperatures']['fr'] = base_temp + motor_heat + random.uniform(-2, 2)
    flight_state['temperatures']['rl'] = base_temp + motor_heat + random.uniform(-2, 2)
    flight_state['temperatures']['rr'] = base_temp + motor_heat + random.uniform(-2, 2)

    flight_state['wind_speed'] = max(0, 5 + random.uniform(-3, 8))

robot.step(timestep)

initial_altitude = gps.getValues()[2]
target_altitude = max(1.0, initial_altitude)
logger.info(f"Starting at altitude: {initial_altitude:.2f}m, target: {target_altitude:.2f}m")

frame_count = 0
current_disturbances = {'roll': 0, 'pitch': 0, 'yaw': 0}
auto_mode_altitude_targets = {'takeoff': 2.0, 'land': 0.3, 'hover': None}

while robot.step(timestep) != -1:
    roll = imu.getRollPitchYaw()[0]
    pitch = imu.getRollPitchYaw()[1]
    yaw = imu.getRollPitchYaw()[2]
    altitude = gps.getValues()[2]
    roll_velocity = gyro.getValues()[0]
    pitch_velocity = gyro.getValues()[1]
    gps_position = gps.getValues()

    if flight_state['mode'] == 'takeoff':
        target_altitude = auto_mode_altitude_targets['takeoff']
        if abs(altitude - target_altitude) < 0.1:
            flight_state['mode'] = 'hover'
    elif flight_state['mode'] == 'land':
        target_altitude = auto_mode_altitude_targets['land']
        if altitude < 0.4:
            flight_state['mode'] = 'manual'
    elif flight_state['mode'] == 'hover':
        if auto_mode_altitude_targets['hover'] is None:
            auto_mode_altitude_targets['hover'] = altitude
        target_altitude = auto_mode_altitude_targets['hover']

    if flight_state['mode'] == 'manual':
        try:
            cmd = motor_queue.get_nowait()

            if cmd['vertical'] > 0.1:
                target_altitude += 0.02
            elif cmd['vertical'] < -0.1:
                target_altitude -= 0.02
            target_altitude = max(0.5, min(15.0, target_altitude))

            current_disturbances['roll'] = cmd['roll'] * -0.8
            current_disturbances['pitch'] = cmd['pitch'] * -1.2
            current_disturbances['yaw'] = cmd['yaw'] * -1.3

        except queue.Empty:
            current_disturbances['roll'] *= 0.95
            current_disturbances['pitch'] *= 0.95
            current_disturbances['yaw'] *= 0.95
    else:
        current_disturbances['roll'] *= 0.9
        current_disturbances['pitch'] *= 0.9
        current_disturbances['yaw'] *= 0.9

    roll_input = CONFIG['k_roll_p'] * clamp(roll, -1.0, 1.0) + roll_velocity + current_disturbances['roll']
    pitch_input = CONFIG['k_pitch_p'] * clamp(pitch, -1.0, 1.0) + pitch_velocity + current_disturbances['pitch']
    yaw_input = current_disturbances['yaw']

    altitude_diff = clamp(target_altitude - altitude + CONFIG['k_vertical_offset'], -1.0, 1.0)
    vertical_input = CONFIG['k_vertical_p'] * (altitude_diff ** 3)

    k = CONFIG['k_vertical_thrust']
    fl = k + vertical_input - roll_input + pitch_input - yaw_input
    fr = k + vertical_input + roll_input + pitch_input + yaw_input
    rl = k + vertical_input - roll_input - pitch_input + yaw_input
    rr = k + vertical_input + roll_input - pitch_input - yaw_input

    front_left_motor.setVelocity(fl)
    front_right_motor.setVelocity(-fr)
    rear_left_motor.setVelocity(-rl)
    rear_right_motor.setVelocity(rr)

    motor_speeds = [fl, -fr, -rl, rr]
    update_simulated_sensors(motor_speeds, altitude, robot.getTime())

    current_time = time.time()
    flight_state['frame_count'] += 1
    time_diff = current_time - flight_state['last_frame_time']
    fps = 1.0 / time_diff if time_diff > 0 else 0
    flight_state['last_frame_time'] = current_time

    frame_count += 1
    if frame_count % CONFIG['frame_interval'] == 0 and clients:
        try:
            image_data = camera.getImage()
            if image_data:
                width = camera.getWidth()
                height = camera.getHeight()

                img = Image.frombytes('RGBA', (width, height), image_data, 'raw', 'BGRA')
                img = img.convert('RGB')

                if flight_state['active_camera'] == 'bottom':
                    img = img.rotate(180)
                    img = Image.blend(img, Image.new('RGB', img.size, (0, 0, 0)), 0.3)

                buffer = io.BytesIO()
                img.save(buffer, format='JPEG', quality=CONFIG['jpeg_quality'])
                image_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')

                message = json.dumps({
                    'type': 'sensor_data',
                    'timestamp': robot.getTime(),
                    'camera': {
                        'width': width,
                        'height': height,
                        'data': image_base64,
                        'active': flight_state['active_camera'],
                        'resolution': f"{width}x{height}",
                        'fps': round(fps, 1)
                    },
                    'telemetry': {
                        'altitude': round(altitude, 2),
                        'target': round(target_altitude, 2),
                        'roll': round(roll, 2),
                        'pitch': round(pitch, 2),
                        'yaw': round(yaw, 2),
                        'gps': {
                            'lat': round(gps_position[0], 6),
                            'lon': round(gps_position[1], 6),
                            'alt': round(gps_position[2], 2)
                        },
                        'battery': round(flight_state['battery'], 1),
                        'signal_strength': flight_state['signal_strength'],
                        'temperatures': {
                            'body': round(flight_state['temperatures']['body'], 1),
                            'motors': {
                                'fl': round(flight_state['temperatures']['fl'], 1),
                                'fr': round(flight_state['temperatures']['fr'], 1),
                                'rl': round(flight_state['temperatures']['rl'], 1),
                                'rr': round(flight_state['temperatures']['rr'], 1)
                            }
                        },
                        'wind_speed': round(flight_state['wind_speed'], 1),
                        'flight_mode': flight_state['mode']
                    }
                })

                with latest_frame['lock']:
                    latest_frame['data'] = message

        except Exception as e:
            logger.error(f"Frame error: {e}")