class MotorController:
    def __init__(self, robot):
        self.robot = robot
        
        # Initialize propeller motors
        self.front_left = robot.getDevice('front left propeller')
        self.front_right = robot.getDevice('front right propeller')
        self.rear_left = robot.getDevice('rear left propeller')
        self.rear_right = robot.getDevice('rear right propeller')
        
        self.motors = [self.front_left, self.front_right, self.rear_left, self.rear_right]
        
        # Set propeller motors to velocity control mode
        for motor in self.motors:
            motor.setPosition(float('inf'))
            motor.setVelocity(1.0)
        
        # Initialize camera gimbal motors and lock them in place
        try:
            self.camera_yaw = robot.getDevice('camera yaw')
            self.camera_pitch = robot.getDevice('camera pitch')
            self.camera_roll = robot.getDevice('camera roll')
            
            # Set gimbal to neutral position and lock
            self.camera_yaw.setPosition(0)
            self.camera_pitch.setPosition(0)
            self.camera_roll.setPosition(0)
        except:
            pass  # Camera gimbal might not be available
    
    def set_motor_speeds(self, fl, fr, rl, rr):
        """Set velocities for all four motors"""
        self.front_left.setVelocity(fl)
        self.front_right.setVelocity(-fr)  # Reversed
        self.rear_left.setVelocity(-rl)    # Reversed
        self.rear_right.setVelocity(rr)
        
        return [fl, -fr, -rl, rr]  # Return actual speeds for telemetry
    
    def set_camera_angle(self, pitch_deg, yaw_deg):
        """Set camera gimbal angles in degrees"""
        import math
        
        if hasattr(self, 'camera_pitch') and hasattr(self, 'camera_yaw'):
            # Convert degrees to radians
            pitch_rad = math.radians(pitch_deg)
            yaw_rad = math.radians(yaw_deg)
            
            # Set motor positions
            self.camera_pitch.setPosition(pitch_rad)
            self.camera_yaw.setPosition(yaw_rad)
            
            return True
        return False
