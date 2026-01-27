class MotorController:
    def __init__(self, robot):
        self.robot = robot
        
        # Initialize motors
        self.front_left = robot.getDevice('front left propeller')
        self.front_right = robot.getDevice('front right propeller')
        self.rear_left = robot.getDevice('rear left propeller')
        self.rear_right = robot.getDevice('rear right propeller')
        
        self.motors = [self.front_left, self.front_right, self.rear_left, self.rear_right]
        
        # Set motors to velocity control mode
        for motor in self.motors:
            motor.setPosition(float('inf'))
            motor.setVelocity(1.0)
    
    def set_motor_speeds(self, fl, fr, rl, rr):
        """Set velocities for all four motors"""
        self.front_left.setVelocity(fl)
        self.front_right.setVelocity(-fr)  # Reversed
        self.rear_left.setVelocity(-rl)    # Reversed
        self.rear_right.setVelocity(rr)
        
        return [fl, -fr, -rl, rr]  # Return actual speeds for telemetry
