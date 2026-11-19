"""Run against a fresh local dev database with ADMIN_PASSWORD=test-bootstrap-password and DB_SEED=true."""
import concurrent.futures
import http.cookiejar
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
databases = [p for p in pathlib.Path(".wrangler/state/v3/d1/miniflare-D1DatabaseObject").glob("*.sqlite") if p.name != "metadata.sqlite"]
assert len(databases) == 1, databases
with sqlite3.connect(databases[0]) as db:
    legacy = hashlib.sha256(b"socks:legacy-test-password").hexdigest()
    db.execute("UPDATE settings SET value=? WHERE key='admin_password_hash'", (legacy,))
assert call(client(), "/api/login", "POST", {"password": "legacy-test-password"})[0] == 200
with sqlite3.connect(databases[0]) as db:
    assert db.execute("SELECT value FROM settings WHERE key='admin_password_hash'").fetchone()[0].startswith("scrypt$")
print("API bootstrap, legacy password migration, sessions, checkout validation, and concurrent retry checks passed")
