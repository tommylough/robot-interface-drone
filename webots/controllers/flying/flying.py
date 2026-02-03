from controller import Robot
import logging

from config import CONFIG
from hardware.sensors import SensorManager
from hardware.actuators import MotorController
from control.pid_controller import PIDController
from control.flight_modes import FlightModeManager
from communication.websocket_server import WebSocketServer
from communication.telemetry import TelemetryFormatter
from perception.camera_processor import CameraProcessor

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def main():
    # Initialize robot
    robot = Robot()
    timestep = int(robot.getBasicTimeStep())
    
    # Initialize subsystems
    sensors = SensorManager(robot, timestep)
    motors = MotorController(robot)
    pid = PIDController(CONFIG)
    flight_mode = FlightModeManager()
    camera_proc = CameraProcessor(CONFIG)
    websocket = WebSocketServer(CONFIG['host'], CONFIG['port'])
    
    # Set up callbacks
    def on_flight_mode_change(mode):
        flight_mode.set_mode(mode)
    
    def on_camera_switch(camera):
        camera_proc.set_active_camera(camera)
    
    def on_camera_control(pitch, yaw):
        """Handle manual camera gimbal control"""
        motors.set_camera_angle(pitch, yaw)
    
    websocket.set_flight_mode_callback(on_flight_mode_change)
    websocket.set_camera_switch_callback(on_camera_switch)
    websocket.set_camera_control_callback(on_camera_control)
    
    # Start WebSocket server
    websocket.start()
    
    # Wait one step for sensors to initialize
    robot.step(timestep)
    
    # Get initial position
    initial_position = sensors.get_position()
    initial_altitude = initial_position['z']
    pid.target_altitude = initial_altitude  # Start at current altitude
    
    frame_counter = 0
    
    # Main control loop
    while robot.step(timestep) != -1:
        # Read sensors
        orientation = sensors.get_orientation()
        angular_velocity = sensors.get_angular_velocity()
        position = sensors.get_position()
        altitude = position['z']
        
        # Update flight mode logic
        flight_mode.update(altitude, pid)
        
        # In idle mode, disable all motors and ignore commands
        if flight_mode.is_idle():
            # Update initial_altitude to current position when idle (for takeoff from landed position)
            initial_altitude = altitude
            pid.target_altitude = initial_altitude
            # Clear any commands from queue
            websocket.get_command()
            # Set all motors to zero
            motor_speeds = motors.set_motor_speeds(0, 0, 0, 0)
        else:
            # Handle user commands (only in manual mode)
            if flight_mode.is_manual_mode():
                command = websocket.get_command()
                if command:
                    pid.update_target_altitude(command['vertical'])
                    pid.update_disturbances(
                        command['roll'],
                        command['pitch'],
                        command['yaw']
                    )
                else:
                    pid.decay_disturbances(0.95)
            else:
                # Auto mode - decay disturbances faster
                pid.decay_disturbances(0.9)
            
            # Compute motor commands
            fl, fr, rl, rr = pid.compute_motor_commands(
                orientation,
                angular_velocity,
                altitude
            )
            
            # Set motor speeds
            motor_speeds = motors.set_motor_speeds(fl, fr, rl, rr)
        
        # Update simulated sensors
        sensors.update_simulated_sensors(motor_speeds, timestep)
        
        # Process camera and send telemetry
        frame_counter += 1
        if frame_counter % CONFIG['frame_interval'] == 0:
            try:
                image_data = sensors.get_camera_image()
                if image_data:
                    dimensions = sensors.get_camera_dimensions()
                    fps = camera_proc.calculate_fps()
                    
                    image_base64 = camera_proc.process_image(
                        image_data,
                        dimensions['width'],
                        dimensions['height']
                    )
                    
                    camera_data = camera_proc.create_camera_data(
                        image_base64,
                        dimensions['width'],
                        dimensions['height'],
                        fps
                    )
                    
                    telemetry_data = TelemetryFormatter.format_telemetry(
                        sensors,
                        orientation,
                        position,
                        flight_mode.get_mode(),
                        robot.getTime()
                    )
                    telemetry_data['target'] = round(pid.target_altitude, 2)
                    
                    message = TelemetryFormatter.create_message(
                        camera_data,
                        telemetry_data,
                        robot.getTime()
                    )
                    
                    websocket.update_frame(message)
                    
            except Exception as e:
                pass

if __name__ == '__main__':
    main()
