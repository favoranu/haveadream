import shutil, time, os
src = r"C:\Users\nomad\had-token\public\whitepaper-print-fixed.html"
dst = r"C:\Users\nomad\had-token\public\whitepaper-print.html"
for i in range(50):
    try:
        with open(dst, "r+b") as f:
            data = open(src, "rb").read()
            f.seek(0)
            f.write(data)
            f.truncate()
        print("OK via python truncate", i)
        break
    except Exception as e:
        print(i, e)
        time.sleep(0.2)
else:
    print("FAILED")
