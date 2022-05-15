from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import pandas as pd                        
from pytrends.request import TrendReq
from urllib.parse import urlparse, unquote

class requestHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        global pytrend
        self.send_response(200)
        self.send_header('content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', 'http://localhost:8000')
        self.end_headers()
        print(self.path)
        method = self.extractMethod(self.path)
        if method == '/InterestOverTime':
            search = self.extractSearch(self.path)
            pytrend.build_payload([search])
            df = pytrend.interest_over_time()
            print(df.head())
            js = df.to_json(orient = 'records')
            self.wfile.write(js.encode())

        elif method == '/InterestByRegion':
            search = self.extractSearch(self.path)
            pytrend.build_payload([search])
            df = pytrend.interest_by_region(resolution='COUNTRY', inc_low_vol=True,  inc_geo_code=True)
            print(df.head())
            js = df.to_json(orient = 'index')
            self.wfile.write(js.encode())
    
    def extractMethod(self, path):
        method = path.split('?')
        return method[0] if len(method) > 0 else ''
    
    def extractSearch(self, path):
        query = urlparse(path).query
        query_components = dict(qc.split("=") for qc in query.split("&"))
        search = query_components["search"]
        return unquote(search)



PORT = 9000
server = HTTPServer(('',PORT), requestHandler)
print(f'server running on port {PORT}')
pytrend = TrendReq()
server.serve_forever()