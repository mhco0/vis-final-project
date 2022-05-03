from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import pandas as pd                        
from pytrends.request import TrendReq

class requestHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        global pytrend
        self.send_response(200)
        self.send_header('content-type', 'application/json')
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
    
    def extractMethod(self, path):
        method = path.split('?')
        return method[0] if len(method) > 0 else ''
    
    def extractSearch(self, path):
        splitedSearch = path.split('search=')[1]
        splitedSearch = splitedSearch.split('-')
        search = ''
        for string in splitedSearch:
            search = search + ' ' + string
        return search



PORT = 8000
server = HTTPServer(('',PORT), requestHandler)
print(f'server running on port {PORT}')
pytrend = TrendReq()
server.serve_forever()