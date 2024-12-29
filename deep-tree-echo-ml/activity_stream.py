#!/usr/bin/env python3
import curses
import asyncio
import json
import time
import os
import argparse
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional
import psutil
import signal
from enum import Enum

class StreamType(Enum):
    ALL = "all"
    COGNITIVE = "cognitive"
    SENSORY = "sensory"
    ML = "ml"
    BROWSER = "browser"
    TERMINAL = "terminal"
    PERSONALITY = "personality"
    EMERGENCY = "emergency"

class ActivityStream:
    def __init__(self, screen, stream_type: StreamType):
        self.screen = screen
        self.stream_type = stream_type
        self.last_update = 0
        self.update_interval = 0.5  # Update every 500ms
        
        # Use current directory for activity files
        self.echo_dir = Path('activity_logs')
        print(f"ActivityStream initialized. Echo dir: {self.echo_dir}")
        
        # Create directories if they don't exist
        for subdir in ['cognitive', 'sensory', 'ml', 'browser', 'terminal', 'personality', 'emergency']:
            subdir_path = self.echo_dir / subdir
            subdir_path.mkdir(parents=True, exist_ok=True)
            
            # Create activity file
            activity_file = subdir_path / 'activity.json'
            if not activity_file.exists():
                with open(activity_file, 'w') as f:
                    json.dump([], f)
        
        self.running = True
        
        # Initialize colors
        curses.start_color()
        curses.use_default_colors()
        curses.init_pair(1, curses.COLOR_GREEN, -1)
        curses.init_pair(2, curses.COLOR_YELLOW, -1)
        curses.init_pair(3, curses.COLOR_RED, -1)
        curses.init_pair(4, curses.COLOR_CYAN, -1)
        curses.init_pair(5, curses.COLOR_MAGENTA, -1)
        curses.init_pair(6, curses.COLOR_BLUE, -1)
        
        # Activity paths
        self.paths = {
            'cognitive': self.echo_dir / 'cognitive' / 'activity.json',
            'sensory': self.echo_dir / 'sensory' / 'activity.json',
            'ml': self.echo_dir / 'ml' / 'activity.json',
            'browser': self.echo_dir / 'browser' / 'activity.json',
            'terminal': self.echo_dir / 'terminal' / 'activity.json',
            'personality': self.echo_dir / 'personality' / 'activity.json',
            'emergency': self.echo_dir / 'emergency' / 'activity.json'
        }
        
        # Initialize state
        self.activities = {k: [] for k in self.paths.keys()}
        self.max_items = 100
        self.system_stats = {}
        
        # Initialize screen state
        self.last_screen_state = {}
        
    def _screen_state_changed(self) -> bool:
        """Check if screen state has changed"""
        current_state = {
            'activities': self.activities,
            'stats': self.system_stats
        }
        changed = current_state != self.last_screen_state
        self.last_screen_state = current_state
        return changed
        
    def update_activities(self):
        """Update activity states"""
        try:
            for activity_type, path in self.paths.items():
                if path.exists():
                    try:
                        with open(path) as f:
                            data = json.load(f)
                            if isinstance(data, list):
                                self.activities[activity_type] = data[-self.max_items:]
                            elif isinstance(data, dict):
                                if 'history' in data:
                                    self.activities[activity_type] = data['history'][-self.max_items:]
                                else:
                                    self.activities[activity_type] = [data]
                            print(f"Updated {activity_type} activities: {len(self.activities[activity_type])} entries")  # Debug
                    except Exception as e:
                        print(f"Error updating {activity_type} activities: {str(e)}")  # Debug
        except Exception as e:
            print(f"Error in update_activities: {str(e)}")  # Debug
            self.activities['emergency'].append({
                'time': time.time(),
                'error': f"Error updating activities: {str(e)}"
            })
            
    def update_system_stats(self):
        """Update system statistics"""
        try:
            self.system_stats = {
                'cpu': psutil.cpu_percent(interval=0.1),
                'memory': psutil.virtual_memory().percent,
                'disk': psutil.disk_usage('/').percent,
                'time': datetime.now().isoformat()
            }
        except Exception as e:
            self.activities['emergency'].append({
                'time': time.time(),
                'error': f"Error updating stats: {str(e)}"
            })
            
    def get_activity_color(self, activity_type: str) -> int:
        """Get color for activity type"""
        colors = {
            'cognitive': curses.color_pair(1),
            'sensory': curses.color_pair(4),
            'ml': curses.color_pair(5),
            'browser': curses.color_pair(6),
            'terminal': curses.color_pair(2),
            'personality': curses.color_pair(5),
            'emergency': curses.color_pair(3)
        }
        return colors.get(activity_type, curses.color_pair(0))
        
    def update_display(self):
        """Update the display with latest activities"""
        try:
            self.screen.clear()
            
            # Get latest activities
            activities = []
            
            if self.stream_type == StreamType.ALL:
                # Gather from all components
                for component in ['cognitive', 'sensory', 'ml', 'browser', 'terminal', 'personality', 'emergency']:
                    activity_file = self.echo_dir / component / 'activity.json'
                    if activity_file.exists():
                        try:
                            with open(activity_file) as f:
                                component_activities = json.load(f)
                                for activity in component_activities:
                                    activity['component'] = component
                                activities.extend(component_activities)
                        except json.JSONDecodeError:
                            pass  # Skip invalid JSON files
            else:
                # Get activities for specific component
                activity_file = self.echo_dir / self.stream_type.value / 'activity.json'
                if activity_file.exists():
                    try:
                        with open(activity_file) as f:
                            activities = json.load(f)
                            for activity in activities:
                                activity['component'] = self.stream_type.value
                    except json.JSONDecodeError:
                        pass
                        
            # Sort by timestamp
            activities.sort(key=lambda x: x.get('time', 0))
            
            # Display activities
            max_y, max_x = self.screen.getmaxyx()
            current_line = 0
            
            # Display header
            header = f"Deep Tree Echo Activity Stream - {self.stream_type.value}"
            self.screen.addstr(current_line, 0, header, curses.A_BOLD)
            current_line += 2
            
            # Display system info
            cpu = psutil.cpu_percent()
            memory = psutil.virtual_memory().percent
            self.screen.addstr(current_line, 0, 
                             f"System: CPU {cpu}% | Memory {memory}%",
                             curses.A_DIM)
            current_line += 2
            
            # Check if we have any activities
            if not activities:
                if time.time() - self.last_update > 30:  # Heartbeat every 30s
                    self.screen.addstr(current_line, 0, 
                                     "System active - no events",
                                     curses.A_DIM)
                    self.last_update = time.time()
            else:
                # Show most recent activities first
                for activity in reversed(activities[-50:]):  # Show last 50 activities
                    if current_line >= max_y - 2:
                        break
                        
                    # Format timestamp
                    timestamp = datetime.fromtimestamp(activity.get('time', 0))
                    time_str = timestamp.strftime("%H:%M:%S")
                    
                    # Format component
                    component = activity.get('component', 'unknown')
                    
                    # Format description
                    description = activity.get('description', '')
                    
                    # Construct line
                    line = f"{time_str} [{component}] {description}"
                    
                    # Determine attributes
                    attrs = curses.A_NORMAL
                    if component == 'emergency':
                        attrs = curses.color_pair(1) | curses.A_BOLD  # Red for emergency
                        line = "!!! " + line
                    
                    # Truncate if needed
                    if len(line) > max_x:
                        line = line[:max_x-3] + "..."
                        
                    try:
                        self.screen.addstr(current_line, 0, line, attrs)
                        current_line += 1
                    except curses.error:
                        break  # Stop if we run out of screen space
                        
            self.screen.refresh()
            
        except Exception as e:
            self.screen.addstr(0, 0, f"Error updating display: {str(e)}")
            self.screen.refresh()
            
    def run(self):
        """Main interface loop"""
        try:
            # Hide cursor
            curses.curs_set(0)
            
            while self.running:
                try:
                    current_time = time.time()
                    
                    # Only update if enough time has passed
                    if current_time - self.last_update >= self.update_interval:
                        # Update data
                        self.update_activities()
                        self.update_system_stats()
                        self.last_update = current_time
                        
                        # Only redraw if state changed
                        if self._screen_state_changed():
                            # Clear screen
                            self.screen.erase()
                            
                            # Draw interface
                            self.update_display()
                            
                            # Refresh screen
                            self.screen.refresh()
                    
                    # Check for quit
                    self.screen.timeout(100)  # 100ms timeout for getch
                    try:
                        key = self.screen.getch()
                        if key == ord('q'):
                            self.running = False
                        elif key == ord('c'):
                            self.screen.clear()
                    except curses.error:
                        pass
                        
                    # Small sleep to prevent CPU hogging
                    time.sleep(0.05)
                    
                except Exception as e:
                    try:
                        self.screen.addstr(0, 0, f"Error: {str(e)}")
                        self.screen.refresh()
                        time.sleep(1)
                    except curses.error:
                        pass
                    
        except KeyboardInterrupt:
            pass
        finally:
            curses.curs_set(1)

def main(stream_type: StreamType = StreamType.ALL, verbose: bool = False):
    """Main entry point"""
    if verbose:
        # Simple logging mode
        echo_dir = Path('activity_logs')
        echo_dir.mkdir(parents=True, exist_ok=True)
        print(f"Monitoring activity logs in: {echo_dir}")
        
        paths = {
            'cognitive': echo_dir / 'cognitive' / 'activity.json',
            'sensory': echo_dir / 'sensory' / 'activity.json',
            'ml': echo_dir / 'ml' / 'activity.json',
            'browser': echo_dir / 'browser' / 'activity.json',
            'terminal': echo_dir / 'terminal' / 'activity.json',
            'personality': echo_dir / 'personality' / 'activity.json',
            'emergency': echo_dir / 'emergency' / 'activity.json'
        }
        
        # Create directories and empty files if they don't exist
        for component, path in paths.items():
            path.parent.mkdir(parents=True, exist_ok=True)
            if not path.exists():
                with open(path, 'w') as f:
                    json.dump([], f)
                print(f"Created {component} log file: {path}")
        
        last_seen = {k: [] for k in paths.keys()}
        print("Starting event monitor... (Press Ctrl+C to stop)")
        print("-" * 80)
        
        try:
            while True:
                any_events = False
                for activity_type, path in paths.items():
                    if path.exists():
                        try:
                            with open(path) as f:
                                activities = json.load(f)
                                if isinstance(activities, list):
                                    new_activities = activities[len(last_seen[activity_type]):]
                                    for activity in new_activities:
                                        any_events = True
                                        timestamp = activity.get('time', time.time())
                                        if isinstance(timestamp, (int, float)):
                                            timestamp = datetime.fromtimestamp(timestamp).strftime('%H:%M:%S')
                                        
                                        # Format message
                                        msg = activity.get('description', str(activity))
                                        if activity_type == 'emergency':
                                            print(f"\033[91m[{timestamp}] !!! {activity_type}: {msg}\033[0m")  # Red for emergency
                                        else:
                                            print(f"[{timestamp}] {activity_type}: {msg}")
                                            
                                    last_seen[activity_type] = activities
                        except json.JSONDecodeError:
                            print(f"Warning: Invalid JSON in {activity_type} log")
                        except Exception as e:
                            print(f"Error reading {activity_type} activities: {e}")
                
                # Add a heartbeat message every 30 seconds if no real events
                if not any_events and time.time() % 30 < 0.1:
                    print(f"[{datetime.now().strftime('%H:%M:%S')}] System running - no events in last 30s")
                
                time.sleep(0.1)
        except KeyboardInterrupt:
            print("\nStopping activity stream...")
            return
    else:
        # Curses UI mode
        curses.wrapper(lambda screen: ActivityStream(screen, stream_type).run())

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Deep Tree Echo Activity Stream")
    parser.add_argument("--type", choices=[t.value for t in StreamType], default=StreamType.ALL.value,
                      help="Type of activities to display")
    parser.add_argument("--verbose", "-v", action="store_true",
                      help="Use verbose logging mode instead of UI")
    args = parser.parse_args()
    
    main(StreamType(args.type), args.verbose)
