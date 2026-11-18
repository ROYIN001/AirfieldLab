import sys, gzip, csv, requests, io
W,E,S,N=100.494,100.717,13.806,14.023
out=open(sys.argv[1],'w',newline=''); w=csv.writer(out)
w.writerow(['latitude','longitude','area_in_meters','confidence','geometry','full_plus_code'])
csv.field_size_limit(10**8)
tot=kept=0
for tok in sys.argv[2:]:
    url=f'https://storage.googleapis.com/open-buildings-data/v3/polygons_s2_level_6_gzip_no_header/{tok}_buildings.csv.gz'
    r=requests.get(url, stream=True, verify='/root/.ccr/ca-bundle.crt', timeout=600); r.raise_for_status()
    r.raw.decode_content=False
    g=gzip.GzipFile(fileobj=r.raw)
    t=io.TextIOWrapper(g, encoding='utf-8')
    for row in csv.reader(t):
        tot+=1
        lat=float(row[0]); lon=float(row[1])
        if S<=lat<=N and W<=lon<=E:
            w.writerow(row); kept+=1
    print(tok, tot, kept, file=sys.stderr)
out.close()
