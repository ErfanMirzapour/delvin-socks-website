"""Run against a fresh local dev database with ADMIN_PASSWORD=test-bootstrap-password and DB_SEED=true."""
import concurrent.futures
import http.cookiejar
import http.server
import threading
import urllib.parse
import hashlib
import pathlib
import sqlite3
import json
import os
import time
import urllib.error
import urllib.request
import uuid

base = os.environ.get("TEST_BASE_URL", "http://localhost:43219")
def client():
    return urllib.request.build_opener(urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()))
def call(opener, path, method="GET", payload=None, headers=None):
    req = urllib.request.Request(base + path, data=json.dumps(payload).encode() if payload is not None else None,
                                 method=method, headers={"Content-Type": "application/json", **(headers or {})})
    try:
        response = opener.open(req, timeout=30)
    except urllib.error.HTTPError as error:
        response = error
    with response:
        return response.status, json.load(response)

if os.environ.get("TEST_STORAGE_MOCK") == "true":
    class StorageMock(http.server.BaseHTTPRequestHandler):
        objects = {}
        def log_message(self, *_):
            pass
        def do_POST(self):
            name = urllib.parse.unquote(self.path.rsplit("/", 1)[-1])
            self.objects[name] = self.rfile.read(int(self.headers["Content-Length"]))
            self.send_response(200); self.end_headers(); self.wfile.write(b"{}")
        def do_GET(self):
            name = urllib.parse.unquote(self.path.rsplit("/", 1)[-1])
            if name not in self.objects:
                self.send_response(404); self.end_headers(); return
            self.send_response(200); self.send_header("Content-Type", "image/png"); self.end_headers(); self.wfile.write(self.objects[name])
        def do_DELETE(self):
            body = json.loads(self.rfile.read(int(self.headers["Content-Length"])))
            if not isinstance(body, dict) or not isinstance(body.get("prefixes"), list):
                self.send_response(400); self.end_headers(); return
            for name in body["prefixes"]: self.objects.pop(name, None)
            self.send_response(200); self.end_headers(); self.wfile.write(b"[]")
    server = http.server.ThreadingHTTPServer(("127.0.0.1", 43225), StorageMock)
    threading.Thread(target=server.serve_forever, daemon=True).start()

a, b = client(), client()
for _ in range(60):
    try:
        status, _ = call(a, "/api/products")
        if status == 200:
            break
    except (OSError, urllib.error.URLError):
        time.sleep(1)
else:
    raise AssertionError("test server did not start")
for opener in (a, b):
    assert call(opener, "/api/login", "POST", {"password": "test-bootstrap-password"})[0] == 200
assert call(a, "/api/admin/password", "PATCH", {"current": "test-bootstrap-password", "next": "test-changed-password"})[0] == 200
assert call(b, "/api/orders")[0] == 401
assert call(a, "/api/orders")[0] == 200
assert call(client(), "/api/login", "POST", {"password": "test-bootstrap-password"})[0] == 401
assert call(client(), "/api/login", "POST", {"password": "test-changed-password"})[0] == 200
if os.environ.get("TEST_STORAGE_MOCK") == "true":
    image = b"\x89PNG\r\n\x1a\npreview-image"
    boundary = "delvin-image-test-boundary"
    multipart = (f"--{boundary}\r\nContent-Disposition: form-data; name=\"file\"; filename=\"test.png\"\r\nContent-Type: image/png\r\n\r\n".encode()
                 + image + f"\r\n--{boundary}--\r\n".encode())
    request = urllib.request.Request(base + "/api/upload", data=multipart, method="POST",
                                     headers={"Content-Type": "multipart/form-data; boundary=" + boundary})
    with a.open(request, timeout=30) as response:
        assert response.status == 200
        image_url = json.load(response)["url"]
    with a.open(base + image_url, timeout=30) as response:
        assert response.read() == image
    status, test_product = call(a, "/api/products", "POST", {"title": "Image test", "price": 1, "stock": 1, "image": image_url})
    assert status == 200
    assert call(a, f"/api/products/{test_product['id']}", "DELETE")[0] == 200
    try:
        a.open(base + image_url + "?after-delete=1", timeout=30)
        raise AssertionError("deleted product image is still accessible")
    except urllib.error.HTTPError as error:
        assert error.code == 404

_, products = call(a, "/api/products")
product = next(p for p in products if p["stock"] >= 2)
order = {"fullname": "Test Person", "phone": "09123456789", "address": "Test address", "postal_code": "1234567890", "items": [{"id": product["id"], "qty": 1}]}
key = str(uuid.uuid4())
def submit(_):
    return call(client(), "/api/orders", "POST", order, {"Idempotency-Key": key})
with concurrent.futures.ThreadPoolExecutor(max_workers=2) as executor:
    results = list(executor.map(submit, range(2)))
assert results[0] == results[1] and results[0][0] == 200, results
for quantity in (0, -1, 1.5):
    invalid = {**order, "items": [{"id": product["id"], "qty": quantity}]}
    assert call(client(), "/api/orders", "POST", invalid, {"Idempotency-Key": str(uuid.uuid4())})[0] == 400
invalid = {**order, "items": [{"id": product["id"], "qty": product["stock"]}, {"id": product["id"], "qty": 1}]}
assert call(client(), "/api/orders", "POST", invalid, {"Idempotency-Key": str(uuid.uuid4())})[0] == 400
# The test database is disposable: exercise upgrading the old production hash.
databases = [p for p in pathlib.Path(".cloudflare/state/v3/d1/miniflare-D1DatabaseObject").glob("*.sqlite") if p.name != "metadata.sqlite"]
assert len(databases) == 1, databases
with sqlite3.connect(databases[0]) as db:
    salt = bytes.fromhex("00112233445566778899aabbccddeeff")
    derived = hashlib.pbkdf2_hmac("sha256", b"pbkdf2-test-password", salt, 210000).hex()
    db.execute("UPDATE settings SET value=? WHERE key='admin_password_hash'", (f"pbkdf2-sha256$210000${salt.hex()}${derived}",))
assert call(client(), "/api/login", "POST", {"password": "pbkdf2-test-password"})[0] == 200
with sqlite3.connect(databases[0]) as db:
    assert db.execute("SELECT value FROM settings WHERE key='admin_password_hash'").fetchone()[0].startswith("scrypt$")
    legacy = hashlib.sha256(b"socks:legacy-test-password").hexdigest()
    db.execute("UPDATE settings SET value=? WHERE key='admin_password_hash'", (legacy,))
assert call(client(), "/api/login", "POST", {"password": "legacy-test-password"})[0] == 200
with sqlite3.connect(databases[0]) as db:
    assert db.execute("SELECT value FROM settings WHERE key='admin_password_hash'").fetchone()[0].startswith("scrypt$")
print("API bootstrap, legacy password migration, sessions, checkout validation, and concurrent retry checks passed")
