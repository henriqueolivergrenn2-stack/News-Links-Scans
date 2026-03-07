#!/usr/bin/env python3
"""
Servidor otimizado para Manhwa Links - Termux Android
"""

import http.server
import socketserver
import os
import sys

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-cache')
        super().end_headers()
    
    def log_message(self, format, *args):
        print(f"[+] {args[0]}")

def main():
    print("""
╔══════════════════════════════════════════════════════════════╗
║                    📚 MANHWA LINKS                           ║
║                                                              ║
║  Acesse: http://localhost:8080                               ║
║  Pressione Ctrl+C para parar                                 ║
╚══════════════════════════════════════════════════════════════╝
""")
    
    try:
        with socketserver.TCPServer(("", PORT), Handler) as httpd:
            print(f"✓ Servidor rodando na porta {PORT}")
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n✗ Servidor encerrado")
    except OSError:
        print(f"✗ Porta {PORT} em uso. Tente: python3 server.py --port {PORT+1}")

if __name__ == "__main__":
    main()
