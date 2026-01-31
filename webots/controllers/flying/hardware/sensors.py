class SensorManager:
    def __init__(self, robot, timestep):
        self.robot = robot
        self.timestep = timestep
        
        # Initialize sensors
        self.camera = robot.getDevice('camera')
        self.camera.enable(timestep)
        
        self.imu = robot.getDevice('inertial unit')
        self.imu.enable(timestep)
        
        self.gps = robot.getDevice('gps')
        self.gps.enable(timestep)
        
        self.gyro = robot.getDevice('gyro')
        self.gyro.enable(timestep)
        
        # Initialize compass if available
        try:
            self.compass = robot.getDevice('compass')
            self.compass.enable(timestep)
            self.has_compass = True
        except:
            self.has_compass = False
        
        # Simulated sensor state
        self.battery = 100.0
        self.signal_strength = 100
        self.temperatures = {
            'body': 25.0,
            'fl': 25.0,
            'fr': 25.0,
            'rl': 25.0,
            'rr': 25.0
        }
        self.wind_speed = 0.0
    
    def get_orientation(self):
        """Get roll, pitch, yaw from IMU"""
        rpy = self.imu.getRollPitchYaw()
        return {
            'roll': rpy[0],
            'pitch': rpy[1],
            'yaw': rpy[2]
        }
    
    def get_compass_heading(self):
        """Get compass heading in degrees (0-360)"""
        if self.has_compass:
            import math
            compass_values = self.compass.getValues()
            # Compass returns [x, y, z] north vector
            # Calculate heading from x and y components
            heading_rad = math.atan2(compass_values[0], compass_values[1])
            heading_deg = math.degrees(heading_rad)
            # Normalize to 0-360
            if heading_deg < 0:
                heading_deg += 360
            return heading_deg
        else:
            # Fallback to yaw from IMU converted to compass heading
            import math
            rpy = self.imu.getRollPitchYaw()
            heading_deg = math.degrees(rpy[2])
            # Normalize to 0-360
            if heading_deg < 0:
                heading_deg += 360
            return heading_deg
    
    def get_angular_velocity(self):
        """Get angular velocities from gyro"""
        gyro_values = self.gyro.getValues()
        return {
            'roll_velocity': gyro_values[0],
            'pitch_velocity': gyro_values[1]
        }
    
    def get_position(self):
        """Get GPS position"""
        gps_values = self.gps.getValues()
        return {
            'x': gps_values[0],
            'y': gps_values[1],
            'z': gps_values[2]
        }
    
    def update_simulated_sensors(self, motor_speeds, timestep):
        """Update simulated sensor values based on flight state"""
        import random
        
        avg_motor_speed = sum(abs(s) for s in motor_speeds) / len(motor_speeds)
        
        # Battery drain
        drain_rate = 0.01 + (avg_motor_speed / 100.0) * 0.02
        self.battery = max(0, self.battery - drain_rate * (timestep / 1000.0))
        
        # Signal strength (decreases with distance)
        gps_pos = self.gps.getValues()
        distance = (gps_pos[0]**2 + gps_pos[1]**2)**0.5
        base_signal = max(20, 100 - (distance * 2))
        self.signal_strength = int(base_signal + random.uniform(-5, 5))
        
        # Temperatures
        base_temp = 25.0
        motor_heat = (avg_motor_speed / 100.0) * 40.0
        self.temperatures['body'] = base_temp + motor_heat * 0.5 + random.uniform(-1, 1)
        self.temperatures['fl'] = base_temp + motor_heat + random.uniform(-2, 2)
        self.temperatures['fr'] = base_temp + motor_heat + random.uniform(-2, 2)
        self.temperatures['rl'] = base_temp + motor_heat + random.uniform(-2, 2)
        self.temperatures['rr'] = base_temp + motor_heat + random.uniform(-2, 2)
        
        # Wind speed
        self.wind_speed = max(0, 5 + random.uniform(-3, 8))
    
    def get_camera_image(self):
        """Get raw image data from camera"""
        return self.camera.getImage()
    
    def get_camera_dimensions(self):
        """Get camera width and height"""
        return {
            'width': self.camera.getWidth(),
            'height': self.camera.getHeight()
        }
