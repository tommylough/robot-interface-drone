class FlightModeManager:
    def __init__(self):
        self.mode = 'manual'
        self.auto_targets = {
            'takeoff': 2.0,
            'land': 0.3,
            'hover': None
        }
    
    def set_mode(self, mode):
        """Set flight mode"""
        if mode in ['manual', 'takeoff', 'land', 'hover']:
            self.mode = mode
            return True
        return False
    
    def get_mode(self):
        """Get current flight mode"""
        return self.mode
    
    def update(self, altitude, pid_controller):
        """Update flight mode logic and set appropriate targets"""
        if self.mode == 'takeoff':
            pid_controller.set_target_altitude(self.auto_targets['takeoff'])
            if abs(altitude - self.auto_targets['takeoff']) < 0.1:
                self.mode = 'hover'
        
        elif self.mode == 'land':
            pid_controller.set_target_altitude(self.auto_targets['land'])
            if altitude < 0.4:
                self.mode = 'manual'
        
        elif self.mode == 'hover':
            if self.auto_targets['hover'] is None:
                self.auto_targets['hover'] = altitude
            pid_controller.set_target_altitude(self.auto_targets['hover'])
    
    def is_manual_mode(self):
        """Check if in manual control mode"""
        return self.mode == 'manual'
