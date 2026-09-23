"use client";
import { useEffect, useState } from "react";
import type { Product, Order } from "@/lib/catalog";
import { categoryFa } from "@/lib/catalog";

type Tab = "products" | "orders";

const emptyProduct = { title: "", category: "men", price: 0, stock: 0, image: "", description: "" };

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [pw, setPw] = useState("");
  const [tab, setTab] = useState<Tab>("products");
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<(Order & { items: Order["items"] })[]>([]);
  const [editing, setEditing] = useState<(typeof emptyProduct & { id?: number }) | null>(null);
  const [msg, setMsg] = useState("");
  const [uploading, setUploading] = useState(false);
  const [openOrder, setOpenOrder] = useState<number | null>(null);
  const [showPw, setShowPw] = useState(false);
  const [curPw, setCurPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [newPw2, setNewPw2] = useState("");
  const [pwMsg, setPwMsg] = useState("");

  async function loadProducts() {
    const r = await fetch("/api/products?category=all", { cache: "no-store" });
    if (r.ok) setProducts((await r.json()) as Product[]);
    else if (r.status === 401) setAuthed(false);
  }
  async function loadOrders() {
    const r = await fetch("/api/orders", { cache: "no-store" });
    if (r.ok) setOrders((await r.json()) as (Order & { items: Order["items"] })[]);
  }

  useEffect(() => {
    fetch("/api/products?category=all").then((r) => {
      // products are public; auth checked on write. Try orders to detect session:
      setAuthed(null);
      loadProducts();
      fetch("/api/orders").then((o) => {
        if (o.ok) { setAuthed(true); loadOrders(); }
        else setAuthed(false);
      });
    });
  }, []);

  async function login() {
    const r = await fetch("/api/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: pw }) });
    if (r.ok) { setAuthed(true); setMsg(""); loadProducts(); loadOrders(); }
    else setMsg("رمز اشتباه است");
  }

  async function uploadFile(f: File): Promise<string | null> {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", f);
      const r = await fetch("/api/upload", { method: "POST", body: fd });
      const j = (await r.json()) as { url?: string; error?: string };
      if (!r.ok) throw new Error(j.error);
      return j.url as string;
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : "خطا در آپلود");
      return null;
    } finally {
      setUploading(false);
    }
  }

  async function saveProduct() {
    if (!editing || !editing.title.trim()) { setMsg("عنوان لازم است"); return; }
    const method = editing.id ? "PATCH" : "POST";
    const url = editing.id ? `/api/products/${editing.id}` : "/api/products";
    const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(editing) });
    if (r.ok) { setEditing(null); setMsg(""); loadProducts(); }
    else setMsg("خطا در ذخیره");
  }

  async function delProduct(id: number) {
    if (!confirm("حذف شود؟")) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    loadProducts();
  }

  async function setStatus(id: number, status: string) {
    await fetch(`/api/orders/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    loadOrders();
  }

  async function delOrder(id: number) {
    if (!confirm("این سفارش حذف شود؟ (موجودیِ سفارشِ ارسال‌شده برنمی‌گردد)")) return;
    const r = await fetch(`/api/orders/${id}`, { method: "DELETE" });
    if (r.ok) { setOpenOrder(null); loadOrders(); }
    else setMsg("خطا در حذف سفارش");
  }

  async function changePassword() {
    setPwMsg("");
    if (newPw !== newPw2) { setPwMsg("تکرار رمز جدید یکی نیست"); return; }
    if (newPw.length < 6) { setPwMsg("رمز جدید حداقل ۶ کاراکتر باشد"); return; }
    const r = await fetch("/api/admin/password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ current: curPw, next: newPw }),
    });
    const j = (await r.json().catch(() => ({}))) as { error?: string };
    if (r.ok) {
      setPwMsg("✓ رمز عوض شد");
      setCurPw(""); setNewPw(""); setNewPw2("");
    } else setPwMsg(j.error || "خطا در تغییر رمز");
  }

  if (authed === null) return <div className="p-10 text-center text-neutral-500">…</div>;

  if (!authed) {
    return (
      <div className="mx-auto max-w-sm px-4 py-16">
        <h1 className="text-2xl font-black text-center">🔐 ورود به پنل</h1>
        <p className="text-center text-sm text-neutral-500 mt-2 leading-7">رمز پیش‌فرض <code dir="ltr">admin123</code> است — در <code dir="ltr">.env</code> عوضش کنید.</p>
        <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} onKeyDown={(e) => e.key === "Enter" && login()}
          placeholder="رمز مدیریت" className="mt-6 w-full rounded-2xl border px-4 py-3" />
        {msg && <div className="mt-3 text-sm text-red-600">{msg}</div>}
        <button onClick={login} className="mt-3 w-full py-3 rounded-2xl bg-black text-white font-black">ورود</button>
      </div>
    );
  }

  const inp = "w-full rounded-2xl border px-4 py-3 bg-white text-[15px]";

  return (
    <div className="mx-auto max-w-3xl px-3 py-5 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black">🛠 پنل مدیریت</h1>
        <div className="flex items-center gap-3">
          <button onClick={() => { setShowPw(!showPw); setPwMsg(""); }}
            className="text-xs underline text-neutral-500">تغییر رمز</button>
          <button onClick={() => fetch("/api/login", { method: "DELETE" }).then(() => location.reload())}
            className="text-xs underline text-neutral-500">خروج</button>
        </div>
      </div>

      {showPw && (
        <div className="mt-3 rounded-2xl border bg-white p-4">
          <div className="font-black text-sm mb-2">🔑 تغییر رمز مدیریت</div>
          <div className="grid gap-2">
            <input type="password" value={curPw} onChange={(e) => setCurPw(e.target.value)} placeholder="رمز فعلی" className={inp} />
            <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="رمز جدید (حداقل ۶ کاراکتر)" className={inp} />
            <input type="password" value={newPw2} onChange={(e) => setNewPw2(e.target.value)} placeholder="تکرار رمز جدید" className={inp} onKeyDown={(e) => e.key === "Enter" && changePassword()} />
            {pwMsg && <div className="text-sm">{pwMsg}</div>}
            <button onClick={changePassword} className="py-3 rounded-2xl bg-black text-white font-black text-sm">ثبت رمز جدید ✓</button>
          </div>
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-2 bg-neutral-100 rounded-2xl p-1.5 sticky top-2 z-10">
        {(["products", "orders"] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`py-2.5 rounded-xl font-black text-sm ${tab === t ? "bg-white shadow" : "text-neutral-500"}`}>
            {t === "products" ? `محصولات (${products.length.toLocaleString("fa-IR")})` : `سفارش‌ها (${orders.length.toLocaleString("fa-IR")})`}
          </button>
        ))}
      </div>

      {msg && <div className="mt-3 text-sm bg-red-50 border border-red-200 rounded-2xl p-3">{msg}</div>}

      {tab === "products" && (
        <div className="mt-4">
          <button onClick={() => setEditing({ ...emptyProduct })} className="w-full py-3.5 rounded-2xl bg-black text-white font-black">+ افزودن محصول</button>
          <div className="mt-3 space-y-2">
            {products.map((p) => (
              <div key={p.id} className="rounded-2xl border bg-white p-3 flex gap-3 items-center">
                <img src={p.image || "/socks/sock-1.svg"} alt="" className="w-16 h-16 rounded-xl object-cover border" />
                <div className="flex-1 min-w-0">
                  <div className="font-black truncate">{p.title}</div>
                  <div className="text-xs text-neutral-500">{categoryFa(p.category)} • {p.price.toLocaleString("fa-IR")} ت • موجودی {p.stock.toLocaleString("fa-IR")} {p.stock <= 0 && <b className="text-red-600">(ناموجود)</b>}</div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <button onClick={() => setEditing({ ...p })} className="px-4 py-1.5 rounded-xl border text-sm font-bold">ویرایش</button>
                  <button onClick={() => delProduct(p.id)} className="px-4 py-1.5 rounded-xl border border-red-200 text-red-600 text-sm font-bold">حذف</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "orders" && (
        <div className="mt-4 space-y-2">
          {orders.length === 0 && <div className="rounded-2xl border p-8 text-center text-neutral-500">هنوز سفارشی ثبت نشده.</div>}
          {orders.map((o) => (
            <div key={o.id} className="rounded-2xl border bg-white overflow-hidden">
              <button onClick={() => setOpenOrder(openOrder === o.id ? null : o.id)} className="w-full p-4 text-right">
                <div className="flex justify-between items-center gap-2">
                  <span className="font-black">#{o.id.toLocaleString("fa-IR")} — {o.fullname}</span>
                  <span className={`text-xs font-black px-3 py-1 rounded-full ${o.status === "new" ? "bg-amber-100 text-amber-800" : "bg-green-100 text-green-800"}`}>
                    {o.status === "new" ? "جدید" : "ارسال شد"}
                  </span>
                </div>
                <div className="text-xs text-neutral-500 mt-1" dir="ltr">{o.phone} • {o.total.toLocaleString("fa-IR")} ت</div>
              </button>
              {openOrder === o.id && (
                <div className="px-4 pb-4 text-sm leading-8 border-t pt-3">
                  <div>📞 <b dir="ltr">{o.phone}</b></div>
                  <div>📍 {o.address}</div>
                  <div>📮 کدپستی: <b>{o.postal_code}</b></div>
                  {o.note && <div>📝 {o.note}</div>}
                  <div className="mt-2 bg-neutral-50 rounded-xl p-3">
                    {o.items.map((it, i) => (
                      <div key={i} className="flex justify-between"><span>{it.title} × {it.qty.toLocaleString("fa-IR")}</span><span>{(it.price * it.qty).toLocaleString("fa-IR")}</span></div>
                    ))}
                    <div className="flex justify-between font-black border-t mt-2 pt-2"><span>جمع</span><span>{o.total.toLocaleString("fa-IR")} تومان</span></div>
                  </div>
                  <div className="text-xs text-neutral-400">{o.created_at}</div>
                  <div className="mt-2 flex gap-2">
                    <button onClick={() => setStatus(o.id, o.status === "new" ? "sent" : "new")} className="flex-1 py-2.5 rounded-xl bg-black text-white font-bold text-sm">
                      {o.status === "new" ? "✓ علامت «ارسال شد»" : "↩ برگردان به «جدید»"}
                    </button>
                    <a href={`tel:${o.phone}`} className="px-5 py-2.5 rounded-xl border font-bold text-sm">تماس</a>
                  </div>
                  <button onClick={() => delOrder(o.id)} className="mt-2 w-full py-2 rounded-xl border border-red-200 text-red-600 font-bold text-sm">🗑 حذف این سفارش</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/50 p-3 grid items-end md:items-center justify-items-center" onClick={() => setEditing(null)}>
          <div className="w-full max-w-lg bg-[#FFFDF8] rounded-3xl p-5 max-h-[92dvh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="font-black text-lg">{editing.id ? "ویرایش محصول" : "محصول جدید"}</div>
            <div className="mt-3 grid gap-3">
              <label className="block text-sm font-bold">عنوان<input className={inp} value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block text-sm font-bold">دسته
                  <select className={inp} value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })}>
                    <option value="men">مردانه</option><option value="women">زنانه</option><option value="kids">بچگانه</option>
                  </select></label>
                <label className="block text-sm font-bold">قیمت (تومان)<input type="number" className={inp} value={editing.price} onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })} /></label>
              </div>
              <label className="block text-sm font-bold">موجودی (تعداد)<input type="number" className={inp} value={editing.stock} onChange={(e) => setEditing({ ...editing, stock: Number(e.target.value) })} /></label>
              <div className="text-sm font-bold">عکس
                <div className="flex gap-2 items-center mt-1">
                  {editing.image && <img src={editing.image} alt="" className="w-14 h-14 rounded-xl object-cover border" />}
                  <label className="flex-1 text-center py-3 rounded-2xl border border-dashed font-bold cursor-pointer bg-white">
                    {uploading ? "در حال آپلود…" : "📷 انتخاب از گوشی"}
                    <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                      const f = e.target.files?.[0]; if (!f) return;
                      const url = await uploadFile(f); if (url) setEditing((ed) => ed ? { ...ed, image: url } : ed);
                    }} />
                  </label>
                </div>
                <input className={inp + " mt-2"} value={editing.image} onChange={(e) => setEditing({ ...editing, image: e.target.value })} placeholder="یا لینک عکس…" dir="ltr" />
              </div>
              <label className="block text-sm font-bold">توضیح<textarea className={inp} rows={2} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></label>
              <div className="flex gap-2">
                <button onClick={saveProduct} className="flex-1 py-3.5 rounded-2xl bg-black text-white font-black">ذخیره ✓</button>
                <button onClick={() => setEditing(null)} className="px-6 py-3.5 rounded-2xl border font-bold">بستن</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
