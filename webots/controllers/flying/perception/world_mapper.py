class WorldMapper:
    """Extracts world object positions for mapping"""
    
    def __init__(self, supervisor):
        self.supervisor = supervisor
        self.map_data = None
        self._build_map()
    
    def _build_map(self):
        """Build map data from world objects"""
        objects = []
        
        # Get root node
        root = self.supervisor.getRoot()
        children = root.getField('children')
        
        for i in range(children.getCount()):
            node = children.getMFNode(i)
            if node is None:
                continue
            
            # Get node type
            node_type = node.getTypeName()
            
            # Skip certain node types
            if node_type in ['WorldInfo', 'Viewpoint', 'TexturedBackground', 
                            'TexturedBackgroundLight', 'Floor', 'Forest']:
                continue
            
            # Get DEF name if it exists
            def_name = node.getDef()
            if not def_name:
                def_name = node_type
            
            # Get translation field
            translation_field = node.getField('translation')
            if translation_field:
                pos = translation_field.getSFVec3f()
                
                # Categorize objects
                category = self._categorize_object(node_type)
                
                objects.append({
                    'name': def_name,
                    'type': node_type,
                    'category': category,
                    'position': {
                        'x': round(pos[0], 2),
                        'y': round(pos[1], 2),
                        'z': round(pos[2], 2)
                    }
                })
        
        # Add world bounds
        self.map_data = {
            'bounds': {
                'min_x': -200,
                'max_x': 200,
                'min_y': -200,
                'max_y': 200
            },
            'objects': objects
        }
    
    def _categorize_object(self, node_type):
        """Categorize object for map display"""
        if 'Windmill' in node_type:
            return 'windmill'
        elif 'Manor' in node_type or 'Building' in node_type:
            return 'building'
        elif 'Pine' in node_type or 'Tree' in node_type:
            return 'tree'
        elif 'Road' in node_type:
            return 'road'
        elif 'Tesla' in node_type or 'Car' in node_type or 'Vehicle' in node_type:
            return 'vehicle'
        elif 'Box' in node_type or 'Container' in node_type:
            return 'container'
        elif 'Manhole' in node_type:
            return 'manhole'
        else:
            return 'object'
    
    def get_map_data(self):
        """Return map data"""
        return self.map_data
