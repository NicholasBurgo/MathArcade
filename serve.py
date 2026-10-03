#!/usr/bin/env python3
# Serves this folder to the local network (your tablet), telling browsers to
# check for a newer copy every time, so updates show up on a plain refresh.
#   python3 serve.py          -> http://<this computer's IP>:8380
#   python3 serve.py 9000     -> a different port
import functools
import http.server
import pathlib
import sys


class NoCache(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache')
        super().end_headers()


port = int(sys.argv[1]) if len(sys.argv) > 1 else 8380
here = pathlib.Path(__file__).resolve().parent
handler = functools.partial(NoCache, directory=str(here))
print(f'Serving {here} on port {port} (Ctrl+C to stop)')
http.server.ThreadingHTTPServer(('0.0.0.0', port), handler).serve_forever()
