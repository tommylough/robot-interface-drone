class PIDController:
    def __init__(self, config):
        self.config = config
        self.target_altitude = 1.0
        self.disturbances = {'roll': 0, 'pitch': 0, 'yaw': 0}
    
    def clamp(self, value, low, high):
        """Clamp value between low and high"""
        return max(low, min(high, value))
    
    def update_target_altitude(self, vertical_command):
        """Update target altitude based on vertical command"""
        if vertical_command > 0.1:
            self.target_altitude += 0.02
        elif vertical_command < -0.1:
            self.target_altitude -= 0.02
        
        self.target_altitude = max(0.5, min(15.0, self.target_altitude))
    
    def set_target_altitude(self, altitude):
        """Directly set target altitude (for auto modes)"""
        self.target_altitude = altitude
    
    def update_disturbances(self, roll_cmd, pitch_cmd, yaw_cmd):
        """Update disturbances from user commands"""
        self.disturbances['roll'] = roll_cmd * -0.8
        self.disturbances['pitch'] = pitch_cmd * -1.2
        self.disturbances['yaw'] = yaw_cmd * -1.3
    
    def decay_disturbances(self, decay_rate=0.95):
        """Decay disturbances over time (for stabilization)"""
        self.disturbances['roll'] *= decay_rate
        self.disturbances['pitch'] *= decay_rate
        self.disturbances['yaw'] *= decay_rate
    
    def compute_motor_commands(self, orientation, angular_velocity, altitude):
        """Compute motor commands based on PID control"""
        roll = orientation['roll']
        pitch = orientation['pitch']
        roll_velocity = angular_velocity['roll_velocity']
        pitch_velocity = angular_velocity['pitch_velocity']
        
        # PID for roll and pitch stabilization
        roll_input = (self.config['k_roll_p'] * self.clamp(roll, -1.0, 1.0) + 
                     roll_velocity + self.disturbances['roll'])
        
        pitch_input = (self.config['k_pitch_p'] * self.clamp(pitch, -1.0, 1.0) + 
                      pitch_velocity + self.disturbances['pitch'])
        
        yaw_input = self.disturbances['yaw']
        
        # Altitude control
        altitude_diff = self.clamp(
            self.target_altitude - altitude + self.config['k_vertical_offset'],
            -1.0, 1.0
        )
        vertical_input = self.config['k_vertical_p'] * (altitude_diff ** 3)
        
        # Motor mixing
        k = self.config['k_vertical_thrust']
        fl = k + vertical_input - roll_input + pitch_input - yaw_input
        fr = k + vertical_input + roll_input + pitch_input + yaw_input
        rl = k + vertical_input - roll_input - pitch_input + yaw_input
        rr = k + vertical_input + roll_input - pitch_input - yaw_input
        
        return fl, fr, rl, rr
