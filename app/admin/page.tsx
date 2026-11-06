"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import type { Product, Order } from "@/lib/catalog";
import { categoryFa } from "@/lib/catalog";
import { Logo, Photo } from "../(shop)/_ui";

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

  if (authed === null) return <div className="p-10 text-center text-[var(--soft)]">…</div>;

  if (!authed) {
    return (
      <div className="mx-auto w-full max-w-sm px-4 py-16">
        <div className="soft-card p-7 text-center">
          <Logo />
          <h1 className="hand text-3xl mt-5">ورود به پنل</h1>
          <p className="text-sm text-[var(--soft)] mt-2 leading-7">رمز پیش‌فرض <code dir="ltr">admin123</code> است — بعد از ورود عوضش کنید.</p>
          <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} onKeyDown={(e) => e.key === "Enter" && login()}
            placeholder="رمز مدیریت" className="mt-6" />
          {msg && <div className="mt-3 text-sm text-[#8f2f17] font-bold">{msg}</div>}
          <button onClick={login} className="btn w-full mt-4">ورود</button>
        </div>
      </div>
    );
  }

  const L = "grid gap-1.5 text-sm font-bold";
  const ghost = "rounded-full px-4 py-2 text-sm font-bold bg-[var(--bg)] hover:bg-white";

  return (
    <div className="mx-auto w-full max-w-3xl px-3 py-5 pb-20">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <div className="flex items-center gap-3">
          <Logo />
          <span className="tag text-xs font-bold text-[var(--terra)] whitespace-nowrap">پنل مدیریت</span>
        </div>
        <div className="flex items-center gap-4 text-xs font-bold text-[var(--soft)] whitespace-nowrap">
          <Link href="/" className="hover:text-[var(--ink)]">فروشگاه ↗</Link>
          <button onClick={() => { setShowPw(!showPw); setPwMsg(""); }} className="hover:text-[var(--ink)]">تغییر رمز</button>
          <button onClick={() => fetch("/api/login", { method: "DELETE" }).then(() => location.reload())} className="hover:text-[var(--ink)]">خروج</button>
        </div>
      </div>

      {showPw && (
        <div className="mt-4 soft-card p-5">
          <div className="hand text-xl mb-3">تغییر رمز مدیریت</div>
          <div className="grid gap-2.5">
            <input type="password" value={curPw} onChange={(e) => setCurPw(e.target.value)} placeholder="رمز فعلی" />
            <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="رمز جدید (حداقل ۶ کاراکتر)" />
            <input type="password" value={newPw2} onChange={(e) => setNewPw2(e.target.value)} placeholder="تکرار رمز جدید" onKeyDown={(e) => e.key === "Enter" && changePassword()} />
            {pwMsg && <div className="text-sm font-bold">{pwMsg}</div>}
            <button onClick={changePassword} className="btn btn-forest">ثبت رمز جدید ✓</button>
          </div>
        </div>
      )}

      <div className="mt-5 grid grid-cols-2 gap-1 bg-[var(--paper)] rounded-full p-1.5 sticky top-2 z-10 shadow-[0_10px_24px_-18px_rgba(58,42,32,.5)]">
        {(["products", "orders"] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`py-2.5 rounded-full font-bold text-sm transition ${tab === t ? "bg-[var(--ink)] text-[var(--paper)]" : "text-[var(--soft)]"}`}>
            {t === "products" ? `🧦 محصولات (${products.length.toLocaleString("fa-IR")})` : `📦 سفارش‌ها (${orders.length.toLocaleString("fa-IR")})`}
          </button>
        ))}
      </div>

      {msg && <div className="mt-3 rounded-2xl bg-[#f6d5cb] text-[#8f2f17] p-3 text-sm font-bold">{msg}</div>}

      {tab === "products" && (
        <div className="mt-4">
          <button onClick={() => setEditing({ ...emptyProduct })} className="btn w-full text-lg">+ افزودن جوراب</button>
          <div className="mt-4 space-y-3">
            {products.map((p) => (
              <div key={p.id} className="soft-card p-3 flex gap-3 items-center">
                <Photo p={p} className="w-16 h-16 rounded-[16px] shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="hand text-lg truncate">{p.title}</div>
                  <div className="text-xs text-[var(--soft)] leading-6">
                    {categoryFa(p.category)} · {p.price.toLocaleString("fa-IR")} تومان · موجودی {p.stock.toLocaleString("fa-IR")}
                    {p.stock <= 0 && <b className="text-[var(--terra)]"> (ناموجود)</b>}
                    {!p.image && <span className="text-[var(--terra)]"> · بدون عکس</span>}
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <button onClick={() => setEditing({ ...p })} className={ghost}>ویرایش</button>
                  <button onClick={() => delProduct(p.id)} className="rounded-full px-4 py-2 text-sm font-bold text-[var(--terra)] hover:bg-[#f6d5cb]">حذف</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "orders" && (
        <div className="mt-4 space-y-3">
          {orders.length === 0 && <div className="soft-card p-10 text-center hand text-xl text-[var(--soft)]">هنوز سفارشی ثبت نشده.</div>}
          {orders.map((o) => (
            <div key={o.id} className="soft-card overflow-hidden">
              <button onClick={() => setOpenOrder(openOrder === o.id ? null : o.id)} className="w-full p-4 text-right">
                <div className="flex justify-between items-center gap-2">
                  <span className="font-black">#{o.id.toLocaleString("fa-IR")} — {o.fullname}</span>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${o.status === "new" ? "bg-[var(--mustard)]/30 text-[#7a5410]" : "bg-[var(--forest)] text-[var(--paper)]"}`}>
                    {o.status === "new" ? "جدید" : "ارسال شد"}
                  </span>
                </div>
                <div className="text-xs text-[var(--soft)] mt-1" dir="ltr">{o.phone} · {o.total.toLocaleString("fa-IR")} ت</div>
              </button>
              {openOrder === o.id && (
                <div className="px-4 pb-4 text-sm leading-8 border-t border-dashed border-[#e3d6c2] pt-3">
                  <div>📞 <b dir="ltr">{o.phone}</b></div>
                  <div>📍 {o.address}</div>
                  <div>📮 کدپستی: <b>{o.postal_code}</b></div>
                  {o.note && <div>📝 {o.note}</div>}
                  <div className="mt-2 bg-[var(--bg)] rounded-2xl p-3">
                    {o.items.map((it, i) => (
                      <div key={i} className="flex justify-between gap-3"><span>{it.title} × {it.qty.toLocaleString("fa-IR")}</span><span>{(it.price * it.qty).toLocaleString("fa-IR")}</span></div>
                    ))}
                    <div className="flex justify-between font-black border-t border-dashed border-[#d9c9b1] mt-2 pt-2"><span>جمع</span><span>{o.total.toLocaleString("fa-IR")} تومان</span></div>
                  </div>
                  <div className="text-xs text-[var(--soft)]">{o.created_at}</div>
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => setStatus(o.id, o.status === "new" ? "sent" : "new")} className={`btn flex-1 text-sm ${o.status === "new" ? "btn-forest" : ""}`}>
                      {o.status === "new" ? "✓ علامت «ارسال شد»" : "↩ برگردان به «جدید»"}
                    </button>
                    <a href={`tel:${o.phone}`} className={`${ghost} grid place-items-center`}>تماس</a>
                  </div>
                  <button onClick={() => delOrder(o.id)} className="mt-2 w-full py-2 rounded-full text-[var(--terra)] font-bold text-sm hover:bg-[#f6d5cb]">🗑 حذف این سفارش</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 bg-[#3a2a20]/50 p-3 grid items-end md:items-center justify-items-center" onClick={() => setEditing(null)}>
          <div className="w-full max-w-lg bg-[var(--paper)] rounded-[28px] p-5 max-h-[92dvh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="hand text-2xl">{editing.id ? "ویرایش جوراب" : "جوراب جدید"}</div>
            <div className="knit !h-2.5 my-3" style={{ ["--c" as string]: "#e3d6c2" }} />
            <div className="grid gap-3">
              <label className={L}>عنوان<input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></label>
              <div className="grid grid-cols-2 gap-3">
                <label className={L}>دسته
                  <select className="w-full bg-white border-2 border-[#e3d6c2] rounded-2xl px-4 py-3 outline-none focus:border-[var(--terra)]" value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })}>
                    <option value="men">مردانه</option><option value="women">زنانه</option><option value="kids">بچگانه</option>
                  </select></label>
                <label className={L}>قیمت (تومان)<input type="number" value={editing.price} onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })} /></label>
              </div>
              <label className={L}>موجودی (تعداد جفت)<input type="number" value={editing.stock} onChange={(e) => setEditing({ ...editing, stock: Number(e.target.value) })} /></label>
              <div className={L}>عکس
                <div className="flex gap-2 items-center">
                  {editing.image && <img src={editing.image} alt="" className="w-16 h-16 rounded-[16px] object-cover" />}
                  <label className="flex-1 text-center py-3.5 rounded-2xl border-2 border-dashed border-[#d9c9b1] font-bold cursor-pointer bg-white hover:border-[var(--terra)]">
                    {uploading ? "در حال آپلود…" : "📷 انتخاب عکس از گوشی"}
                    <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                      const f = e.target.files?.[0]; if (!f) return;
                      const url = await uploadFile(f); if (url) setEditing((ed) => ed ? { ...ed, image: url } : ed);
                    }} />
                  </label>
                </div>
                <input value={editing.image} onChange={(e) => setEditing({ ...editing, image: e.target.value })} placeholder="یا لینک عکس…" dir="ltr" />
              </div>
              <label className={L}>توضیح<textarea rows={2} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></label>
              <div className="flex gap-2 mt-1">
                <button onClick={saveProduct} className="btn flex-1">ذخیره ✓</button>
                <button onClick={() => setEditing(null)} className={ghost}>بستن</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
