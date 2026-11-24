import json,sys
a=json.load(open(sys.argv[1]));b=json.load(open(sys.argv[2]))
for k in a:print(f"{k:22} {str(a[k]):>40}  ->  {b[k]}")
