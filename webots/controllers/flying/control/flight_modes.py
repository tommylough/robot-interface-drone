class FlightModeManager:
    def __init__(self):
        self.mode = 'idle'
        self.auto_targets = {
            'takeoff': 2.0,
            'land': 0.3,
            'hover': None
        }
        self.home_position = None
        self.emergency_stopped = False
    
    def set_mode(self, mode):
        """Set flight mode"""
        if mode in ['idle', 'manual', 'takeoff', 'land', 'hover', 'rth', 'emergency_stop']:
            # Emergency stop kills everything and lands
            if mode == 'emergency_stop':
                self.emergency_stopped = False  # Clear emergency flag
                self.mode = 'land'  # Initiate landing
                return True
            
            # Return to home
            if mode == 'rth':
                self.mode = 'rth'
                return True
            
            # Clear emergency stop flag when switching to other modes
            self.emergency_stopped = False
            
            self.mode = mode
            # Reset hover target when switching modes
            if mode != 'hover':
                self.auto_targets['hover'] = None
            return True
        return False
    
    def get_mode(self):
        """Get current flight mode"""
        return self.mode
    
    def set_home_position(self, position):
        """Set home position for return to home"""
        if self.home_position is None:
            self.home_position = position
    
    def update(self, altitude, pid_controller, current_position=None):
        """Update flight mode logic and set appropriate targets"""
        # Emergency stop overrides everything
        if self.emergency_stopped:
            pid_controller.disturbances = {'roll': 0, 'pitch': 0, 'yaw': 0}
            return
        
        # Set home position on first update if not set
        if current_position and self.home_position is None:
            self.set_home_position(current_position)
        
        if self.mode == 'idle':
            # Stay grounded, don't change altitude
            pass
        
        elif self.mode == 'rth':
            # Return to home position
            if self.home_position and current_position:
                # Calculate distance to home
                dx = self.home_position[0] - current_position[0]
                dz = self.home_position[2] - current_position[2]
                distance = (dx**2 + dz**2)**0.5
                
                # Navigate towards home
                if distance > 0.5:
                    # Still far from home, maintain altitude and navigate
                    pid_controller.set_target_altitude(2.0)
                    # Add navigation disturbances based on direction
                    pid_controller.disturbances['roll'] = max(-0.5, min(0.5, dz * 0.2))
                    pid_controller.disturbances['pitch'] = max(-0.5, min(0.5, dx * 0.2))
                else:
                    # Close to home, initiate landing
                    self.mode = 'land'
            else:
                # No home position set, just land
                self.mode = 'land'
        
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
