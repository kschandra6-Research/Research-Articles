"""
K.S. Chandra Research Archive - Web Server
Created and Hosted by K.S.Chandra 2026.

Features:
- High performance HTTP server with Range Requests (HTTP 206 Partial Content) for smooth PDF streaming
- MIME type mapping for PDFs, JSON, JS, CSS, WebP/JPG
- Cross-Origin Resource Sharing (CORS) headers
- Automatic free port detection and browser launcher
"""

import http.server
import socketserver
import os
import sys
import mimetypes
import webbrowser
import socket

# Ensure correct base directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
os.chdir(BASE_DIR)

# Add standard MIME types
mimetypes.add_type('application/pdf', '.pdf')
mimetypes.add_type('application/json', '.json')
mimetypes.add_type('application/javascript', '.js')
mimetypes.add_type('text/css', '.css')
mimetypes.add_type('image/jpeg', '.jpg')
mimetypes.add_type('image/png', '.png')
mimetypes.add_type('image/webp', '.webp')

class AcademicArchiveHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Enable CORS and caching headers
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Range, Content-Type')
        self.send_header('Accept-Ranges', 'bytes')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200, "OK")
        self.end_headers()

    def do_GET(self):
        # Support HTTP Range requests for large PDF streaming (e.g. 25MB files)
        path = self.translate_path(self.path)
        if os.path.isfile(path) and 'Range' in self.headers and path.lower().endswith('.pdf'):
            self.handle_range_request(path)
        else:
            super().do_GET()

    def handle_range_request(self, file_path):
        try:
            file_size = os.path.getsize(file_path)
            range_header = self.headers.get('Range')
            
            # Example: bytes=0-1023
            range_match = range_header.strip().replace('bytes=', '')
            parts = range_match.split('-')
            start = int(parts[0]) if parts[0] else 0
            end = int(parts[1]) if len(parts) > 1 and parts[1] else file_size - 1

            if start >= file_size or end >= file_size or start > end:
                self.send_error(416, "Requested Range Not Satisfiable")
                return

            length = end - start + 1

            self.send_response(206, "Partial Content")
            self.send_header('Content-Type', 'application/pdf')
            self.send_header('Content-Range', f'bytes {start}-{end}/{file_size}')
            self.send_header('Content-Length', str(length))
            self.send_header('Accept-Ranges', 'bytes')
            self.send_header('Cache-Control', 'public, max-age=3600')
            self.end_headers()

            with open(file_path, 'rb') as f:
                f.seek(start)
                bytes_to_send = length
                buffer_size = 64 * 1024
                while bytes_to_send > 0:
                    chunk = f.read(min(bytes_to_send, buffer_size))
                    if not chunk:
                        break
                    self.wfile.write(chunk)
                    bytes_to_send -= len(chunk)
        except (ConnectionResetError, BrokenPipeError):
            pass
        except Exception as e:
            self.send_error(500, f"Error processing range request: {str(e)}")

def find_available_port(start_port=8000, max_attempts=50):
    for port in range(start_port, start_port + max_attempts):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            if s.connect_ex(('127.0.0.1', port)) != 0:
                return port
    return start_port

def run_server(port=None, auto_open=True):
    chosen_port = port if port else find_available_port(8000)
    handler = AcademicArchiveHandler

    with socketserver.TCPServer(("", chosen_port), handler) as httpd:
        url = f"http://localhost:{chosen_port}"
        print("=" * 70)
        print("  K.S. CHANDRA RESEARCH ARCHIVE - WEB DASHBOARD SERVER")
        print("  Created and Hosted by K.S.Chandra 2026.")
        print("=" * 70)
        print(f"  * Server running at: {url}")
        print(f"  * Serving folder:    {BASE_DIR}")
        print("  * Features:")
        print("    - 8 Peer-reviewed published articles")
        print("    - Built-in interactive PDF reader")
        print("    - 1 article per session download restriction")
        print("    - Mandatory academic citation agreement modal")
        print("    - Fast HTTP 206 Partial Content PDF streaming")
        print("=" * 70)
        print("  Press Ctrl+C to stop the server.\n")

        if auto_open:
            webbrowser.open(url)

        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server gracefully...")

if __name__ == '__main__':
    port_arg = int(sys.argv[1]) if len(sys.argv) > 1 and sys.argv[1].isdigit() else None
    auto_browser = '--no-browser' not in sys.argv
    run_server(port=port_arg, auto_open=auto_browser)
