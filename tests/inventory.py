"""Exercise the production SQLite schema, including racing shipment requests."""
import concurrent.futures
import pathlib
import re
import sqlite3
import tempfile

schema = pathlib.Path("lib/db.ts").read_text().split("const SCHEMA_STATEMENTS = [", 1)[1].split("\n];", 1)[0]
statements = re.findall(r"`([^`]*)`", schema)
with tempfile.TemporaryDirectory() as temp:
    db_path = str(pathlib.Path(temp) / "test.db")
    db = sqlite3.connect(db_path)
    for statement in statements:
        db.execute(statement)
    db.execute("INSERT INTO products (title, price, stock) VALUES ('socks', 10, 3)")
    db.execute("INSERT INTO orders (fullname, phone, address, postal_code, items_json) VALUES ('a','b','c','d',?)", ('[{"product_id":1,"qty":2}]',))
    db.commit()

    def ship():
        with sqlite3.connect(db_path, timeout=10) as connection:
            connection.execute("UPDATE orders SET status='sent' WHERE id=1")
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as executor:
        list(executor.map(lambda _: ship(), range(2)))
    assert db.execute("SELECT stock FROM products").fetchone()[0] == 1
    db.execute("UPDATE orders SET status='new' WHERE id=1")
    assert db.execute("SELECT stock FROM products").fetchone()[0] == 3
    db.execute("UPDATE products SET stock=1")
    try:
        db.execute("UPDATE orders SET status='sent' WHERE id=1")
        raise AssertionError("shipment with insufficient stock succeeded")
    except sqlite3.IntegrityError as error:
        assert "insufficient_stock" in str(error)
    assert db.execute("SELECT stock FROM products").fetchone()[0] == 1
    assert db.execute("SELECT status FROM orders").fetchone()[0] == "new"
    db.execute("INSERT INTO orders (fullname, phone, address, postal_code, status) VALUES ('a','b','c','d','sent')")
    try:
        db.execute("UPDATE orders SET status='new' WHERE id=2")
        raise AssertionError("legacy shipment reversal succeeded")
    except sqlite3.IntegrityError as error:
        assert "shipment_history_missing" in str(error)
    print("Inventory concurrency, reversal, shortage and legacy history checks passed")
