# Lokaler Vorschau-Server für die Entwicklung.
# Wie "python3 -m http.server", sagt dem Browser aber, nichts zwischenzuspeichern –
# so ist nach jeder Änderung sofort der neue Stand zu sehen.
# Start:  python3 scripts/serve.py   (dann http://localhost:8080 öffnen)
import http.server, os, sys

class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, must-revalidate")
        self.send_header("Expires", "0")
        super().end_headers()

if __name__ == "__main__":
    os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
    http.server.ThreadingHTTPServer(("", port), NoCacheHandler).serve_forever()
