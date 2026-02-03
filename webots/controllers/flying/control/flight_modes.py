class FlightModeManager:
    def __init__(self):
        self.mode = 'idle'
        self.auto_targets = {
            'takeoff': 2.0,
            'land': 0.3,
            'hover': None
        }
    
    def set_mode(self, mode):
        """Set flight mode"""
        if mode in ['idle', 'manual', 'takeoff', 'land', 'hover']:
            self.mode = mode
            # Reset hover target when switching modes
            if mode != 'hover':
                self.auto_targets['hover'] = None
            return True
        return False
    
    def get_mode(self):
        """Get current flight mode"""
        return self.mode
    
    def update(self, altitude, pid_controller):
        """Update flight mode logic and set appropriate targets"""
        if self.mode == 'idle':
            # Stay grounded, don't change altitude
            pass
        
        elif self.mode == 'takeoff':
            pid_controller.set_target_altitude(self.auto_targets['takeoff'])
            if abs(altitude - self.auto_targets['takeoff']) < 0.1:
                self.mode = 'manual'  # Switch to manual for user control
        
        elif self.mode == 'land':
            # Clear all disturbances for vertical descent
            pid_controller.disturbances = {'roll': 0, 'pitch': 0, 'yaw': 0}
            
            # Fast descent until close to ground, then slow down
            if altitude > 1.5:
                # High altitude: drop very fast
                target = max(0.1, altitude - 1.0)
            elif altitude > 0.8:
                # Medium altitude: fast descent
                target = max(0.1, altitude - 0.4)
            elif altitude > 0.3:
                # Getting close: slow down
                target = max(0.1, altitude - 0.1)
            else:
                # Final approach: gentle touchdown
                target = max(0.1, altitude - 0.02)
            
            pid_controller.set_target_altitude(target)
            
            # When close to ground, switch to idle
            if altitude < 0.12:
                self.mode = 'idle'
        
        elif self.mode == 'hover':
            if self.auto_targets['hover'] is None:
                self.auto_targets['hover'] = altitude
            pid_controller.set_target_altitude(self.auto_targets['hover'])
            # Clear disturbances to stop movement
            pid_controller.decay_disturbances(0.85)
    
    def is_manual_mode(self):
        """Check if in manual control mode"""
        return self.mode == 'manual'
    
    def is_idle(self):
        """Check if in idle mode (grounded)"""
        return self.mode == 'idle'
