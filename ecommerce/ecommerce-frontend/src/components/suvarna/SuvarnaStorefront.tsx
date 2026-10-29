'use client';

import React, { useEffect, useRef } from 'react';
import { ABOUT_IMGS } from './aboutImages';

export default function SuvarnaStorefront() {
  useEffect(() => {

    // Set WhatsApp number (digits only, e.g. "919876543210")
    const WA_NUMBER = "";

    // Contact details shown on the site
    const CONTACT = { email: "", address: "" };

    // Social media links
    const SOCIAL = [
      { name: "Instagram", icon: "i-ig", url: "https://www.instagram.com/suvarna_dpc_hub/" },
      { name: "Facebook",  icon: "i-fb", url: "" },
      { name: "YouTube",   icon: "i-yt", url: "" },
      { name: "X",         icon: "i-x",  url: "" },
      { name: "LinkedIn",  icon: "i-in", url: "" }
    ];

    const CATS = [
      { id: "prints", name: "Photo prints",        icon: "i-print",  blurb: "Everyday and keepsake prints in many sizes." },
      { id: "large",  name: "Large-format prints", icon: "i-large",  blurb: "Posters, canvas and banners up to several feet." },
      { id: "albums", name: "Albums and books",    icon: "i-album",  blurb: "Bound albums and photo books for every story." },
      { id: "invites",name: "Video invites",       icon: "i-video",  blurb: "Share-ready invitation videos for any occasion." },
      { id: "wall",   name: "Frames and canvas",   icon: "i-frame",  blurb: "Framed prints and canvas wraps for your walls." },
      { id: "gifts",  name: "Photo gifts",         icon: "i-gift",   blurb: "Mugs, magnets and calendars made from your photos." },
      { id: "event",  name: "Wedding and events",  icon: "i-heart",  blurb: "Welcome boards, backdrops and printed invitations." },
      { id: "box",    name: "Curation Box",        icon: "i-box",    blurb: "A keepsake set built around your celebration." }
    ];

    const O = (name: string, ...c: [string, number][]) => ({ name, choices: c });

    interface ProductOption {
      name: string;
      choices: [string, number][];
    }

    interface ProductDef {
      id: string;
      cat: string;
      kind: 'photo' | 'invite' | 'text' | 'note';
      name: string;
      unit: string;
      base: number;
      blurb: string;
      opts: ProductOption[];
    }

    const PRODUCTS: ProductDef[] = [
      { id: "classic-prints", cat: "prints", kind: "photo", name: "Classic photo prints", unit: "per print", base: 8,
        blurb: "Sharp, colour-true prints on paper made to last.",
        opts: [O("Size", ["4×6 in",0], ["5×7 in",7], ["6×8 in",12], ["8×12 in",27]), O("Finish", ["Glossy",0], ["Matte",0], ["Silk",2]) ] },
      { id: "retro-prints", cat: "prints", kind: "photo", name: "Retro border prints", unit: "per print", base: 12,
        blurb: "Prints with a classic white border.",
        opts: [O("Size", ["3×4 in",0], ["4×6 in",8]), O("Border", ["White",0], ["Cream",0])] },

      { id: "poster", cat: "large", kind: "photo", name: "Custom poster", unit: "each", base: 199,
        blurb: "Bold, high-resolution posters for rooms and events.",
        opts: [O("Size", ["A3",0], ["A2",250], ["2×3 ft",450], ["3×4 ft",900]), O("Finish", ["Matte",0], ["Glossy",50])] },
      { id: "big-canvas", cat: "large", kind: "photo", name: "Large canvas print", unit: "each", base: 899,
        blurb: "Gallery-quality canvas for statement walls.",
        opts: [O("Size", ["2×3 ft",0], ["3×4 ft",1200], ["4×6 ft",3200]), O("Frame", ["Gallery wrap",0], ["Wooden frame",700])] },
      { id: "banner", cat: "large", kind: "photo", name: "Event banner", unit: "each", base: 499,
        blurb: "Banners for celebrations, shops and stages.",
        opts: [O("Size", ["3×2 ft",0], ["4×3 ft",300], ["6×3 ft",700], ["8×4 ft",1500]), O("Material", ["Flex",0], ["Fabric",400])] },

      { id: "lay-flat-album", cat: "albums", kind: "photo", name: "Lay-flat photo album", unit: "each", base: 1499,
        blurb: "Pages that open flat, bound with a navy cover.",
        opts: [O("Pages", ["20 pages",0], ["30 pages",600], ["40 pages",1200]), O("Size", ["8×8 in",0], ["10×10 in",500], ["12×12 in",1100]), O("Cover", ["Navy leatherette",0], ["Fabric",200], ["Photo cover",0])] },
      { id: "mini-album", cat: "albums", kind: "photo", name: "Mini album", unit: "each", base: 399,
        blurb: "A pocket-size album that makes a lovely gift.",
        opts: [O("Pages", ["12 pages",0], ["20 pages",200]), O("Cover", ["Navy",0], ["Cream",0])] },
      { id: "photo-book", cat: "albums", kind: "photo", name: "Softcover photo book", unit: "each", base: 699,
        blurb: "A story in pages, from trips to first birthdays.",
        opts: [O("Size", ["A5",0], ["A4",400]), O("Pages", ["24 pages",0], ["40 pages",500])] },

      { id: "video-invite", cat: "invites", kind: "invite", name: "Video invitation", unit: "each", base: 999,
        blurb: "A designed invitation video you can share in one tap.",
        opts: [O("Occasion", ["Wedding",0], ["Engagement",0], ["Birthday",0], ["Baby shower",0], ["Housewarming",0], ["Festival",0]), O("Length", ["Up to 30 seconds",0], ["Up to 60 seconds",600]), O("Language", ["English",0], ["Hindi",0], ["Marathi",0])] },
      { id: "save-the-date", cat: "invites", kind: "invite", name: "Save the date video", unit: "each", base: 599,
        blurb: "A short, elegant announcement to send early.",
        opts: [O("Occasion", ["Wedding",0], ["Engagement",0], ["Anniversary",0]), O("Language", ["English",0], ["Hindi",0], ["Marathi",0])] },

      { id: "framed-print", cat: "wall", kind: "photo", name: "Framed photo print", unit: "each", base: 499,
        blurb: "A finished frame, ready to hang.",
        opts: [O("Size", ["8×10 in",0], ["12×18 in",450], ["18×24 in",1100]), O("Frame", ["Black",0], ["Walnut",100], ["Gold",200])] },
      { id: "canvas-wrap", cat: "wall", kind: "photo", name: "Canvas wrap", unit: "each", base: 599,
        blurb: "Your photo stretched on a wooden frame.",
        opts: [O("Size", ["12×18 in",0], ["18×24 in",600], ["24×36 in",1500])] },

      { id: "photo-mug", cat: "gifts", kind: "photo", name: "Photo mug", unit: "each", base: 299,
        blurb: "A daily reminder of a favourite moment.",
        opts: [O("Type", ["White ceramic",0], ["Colour-change",150])] },
      { id: "photo-magnets", cat: "gifts", kind: "photo", name: "Photo fridge magnets", unit: "per set", base: 249,
        blurb: "Small squares of big memories.",
        opts: [O("Set", ["Set of 4",0], ["Set of 8",220])] },
      { id: "wall-calendar", cat: "gifts", kind: "photo", name: "Photo wall calendar", unit: "each", base: 499,
        blurb: "Twelve months, twelve of your best pictures.",
        opts: [O("Size", ["A4",0], ["A3",300])] },

      { id: "welcome-board", cat: "event", kind: "text", name: "Welcome board", unit: "each", base: 999,
        blurb: "A printed board to greet guests at the entrance.",
        opts: [O("Size", ["2×3 ft",0], ["3×4 ft",700]), O("Mount", ["Foam board",0], ["Wooden stand",800])] },
      { id: "photo-backdrop", cat: "event", kind: "text", name: "Photo backdrop", unit: "each", base: 1999,
        blurb: "A printed backdrop for portraits and stages.",
        opts: [O("Size", ["6×4 ft",0], ["8×6 ft",1400]), O("Material", ["Flex",0], ["Fabric",600])] },
      { id: "invite-cards", cat: "event", kind: "text", name: "Printed invitation cards", unit: "per card", base: 12,
        blurb: "Cards with matte or textured paper and foil options.",
        opts: [O("Paper", ["Matte",0], ["Textured",6]), O("Finish", ["Plain",0], ["Gold foil",14])] },

      { id: "curation-box", cat: "box", kind: "note", name: "The Curation Box", unit: "each", base: 3499,
        blurb: "A navy and gold keepsake set built around your celebration.",
        opts: [O("Occasion", ["Wedding",0], ["Engagement",0], ["Anniversary",0], ["Baby arrival",0]), O("Contents", ["Prints and mini album",0], ["Invitation cards and video invite",1500], ["Full keepsake set",4000])] }
    ];

    /* ---------- helpers ---------- */
    const $ = (s: string, r: Document | HTMLElement = document): any => r.querySelector(s);
    const esc = (s: any) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] || c));
    const money = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");
    const cat = (id: string) => CATS.find((c) => c.id === id);
    const prod = (id: string): any => PRODUCTS.find((p) => p.id === id);
    const fromPrice = (p: ProductDef) => p.base + p.opts.reduce((s, o) => s + Math.min(...o.choices.map((c) => c[1])), 0);
    const unitPrice = (p: ProductDef, sel: number[]) => p.base + p.opts.reduce((s, o, i) => s + o.choices[sel[i]][1], 0);
    const waUrl = (t: string) => (WA_NUMBER ? "https://wa.me/" + WA_NUMBER : "https://wa.me/") + "?text=" + encodeURIComponent(t);

    let toastTimer: any;
    function toast(msg: string) {
      const t = $("#toast");
      if (!t) return;
      t.textContent = msg;
      t.classList.add("show");
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => t.classList.remove("show"), 2400);
    }

    /* ---------- cart ---------- */
    let cart: any[] = [];
    try {
      cart = JSON.parse(localStorage.getItem("suvarna_cart") || "[]");
      if (!Array.isArray(cart)) cart = [];
    } catch (e) {
      cart = [];
    }

    function saveCart() {
      try {
        localStorage.setItem("suvarna_cart", JSON.stringify(cart));
      } catch (e) {}
      const cartN = $("#cartN");
      if (cartN) {
        cartN.textContent = cart.reduce((s, i) => s + i.qty, 0);
      }
    }
    const cartTotal = () => cart.reduce((s, i) => s + i.unit * i.qty, 0);

    /* ---------- tiles ---------- */
    const tile = (p: ProductDef) => `<div class="tile" aria-hidden="true"><svg class="icon"><use href="#${cat(p.cat)?.icon || 'i-print'}"/></svg></div>`;
    function card(p: ProductDef) {
      return `<a class="card" href="#/p/${p.id}">${tile(p)}<h3>${esc(p.name)}</h3><p class="bl">${esc(p.blurb)}</p><p class="pr">From ${money(fromPrice(p))} <span class="muted" style="font-weight:400">${esc(p.unit)}</span></p></a>`;
    }

    /* ---------- views ---------- */
    function homeView() {
      document.title = "Suvarna Custom: custom prints, albums and video invites";
      const popular = ["classic-prints", "lay-flat-album", "video-invite", "poster", "canvas-wrap", "photo-mug", "welcome-board", "curation-box"].map(prod).filter(Boolean);
      return `
      <section class="hero"><div class="wrap">
        <h1>Custom prints, albums and video invites, ordered online.</h1>
        <p class="lede">Choose a product, add your photos and details, and we make it and send it to your door. Made by the team that has printed family memories since the Konica roll days.</p>
        <div class="actions"><a class="btn" href="#/c/all">Shop all products</a><a class="btn ghost" href="#/c/invites">See video invites</a></div>
      </div></section>

      <section class="sec"><div class="wrap">
        <div class="shead"><h2>Shop by category</h2></div>
        <div class="cats">${CATS.map((c) => `<a class="cat" href="#/c/${c.id}"><svg class="icon" aria-hidden="true"><use href="#${c.icon}"/></svg><h3>${esc(c.name)}</h3><p>${esc(c.blurb)}</p></a>`).join("")}</div>
      </div></section>

      <section class="sec" style="padding-top:0"><div class="wrap">
        <div class="shead"><h2>Popular right now</h2><a href="#/c/all">View all products</a></div>
        <div class="grid">${popular.map(card).join("")}</div>
      </div></section>

      <section class="sec story-band"><div class="wrap">
        <h2>From a Konica roll machine to Suvarna 2.0</h2>
        <p>We began with roll photo printing, moved to digital prints and albums, then to video invites. Now everything is in one place, ordered from anywhere.</p>
        <p style="margin-top:1.2rem"><a class="btn ghost" href="#/about">Read our story</a></p>
      </div></section>

      <section class="sec"><div class="wrap">
        <div class="shead"><h2>From our blog</h2><a href="#/blog">All articles</a></div>
        <div class="posts three">${POSTS.slice(0, 3).map(postCard).join("")}</div>
      </div></section>

      <section class="sec"><div class="wrap trust">
        <div><h3>Order from anywhere</h3><p>Pick your product online, add your photos and details, and we take it from there.</p></div>
        <div><h3>Preview before we finish</h3><p>For albums and invites we share a preview for your approval.</p></div>
        <div><h3>Delivered to your door</h3><p>We pack your order carefully and send it by courier.</p></div>
      </div></section>`;
    }

    function listView(id: string | null, q?: string) {
      let list = PRODUCTS.slice();
      let title = "";
      let intro = "";
      let crumb = "";
      if (q != null) {
        const t = q.toLowerCase();
        list = list.filter((p) => (p.name + " " + p.blurb + " " + (cat(p.cat)?.name || "")).toLowerCase().includes(t));
        title = `Results for "${esc(q)}"`;
        intro = "";
        crumb = "Search";
      } else if (id === "all") {
        title = "All products";
        intro = "Everything we make, in one place.";
        crumb = "All products";
      } else if (id) {
        const c = cat(id);
        if (!c) return notFound();
        list = list.filter((p) => p.cat === id);
        title = c.name;
        intro = c.blurb;
        crumb = c.name;
      }
      document.title = title.replace(/&quot;/g, '"') + " | Suvarna Custom";
      return `<div class="wrap">
        <p class="crumbs"><a href="#/">Home</a> / ${esc(crumb)}</p>
        <div class="tools"><div><h1 style="font-size:clamp(2rem,4.4vw,3rem)">${title}</h1>${intro ? `<p class="muted" style="margin-top:.4rem">${esc(intro)}</p>` : ""}</div>
          <label class="muted">Sort <select id="sort" aria-label="Sort products"><option value="f">Featured</option><option value="l">Price: low to high</option><option value="h">Price: high to low</option></select></label></div>
        <div class="grid" id="plist">${list.length ? list.map(card).join("") : ""}</div>
        ${list.length ? "" : `<p class="empty">No products found. Try a different word, or <a href="#/c/all" style="color:var(--gold)">browse everything</a>.</p>`}
        <div style="height:64px"></div>
      </div>`;
    }

    /* ---------- product page ---------- */
    let draft: any = null;
    function ratio(p: ProductDef) {
      const i = p.opts.findIndex((o) => o.name === "Size" || o.name === "Set");
      const label = i >= 0 ? p.opts[i].choices[draft.sel[i]][0] : "";
      const m = label.match(/(\d+(?:\.\d+)?)\s*[×x]\s*(\d+(?:\.\d+)?)/);
      if (m) return { w: +m[1], h: +m[2] };
      if (/^A\d/.test(label)) return { w: 1, h: 1.414 };
      return { w: 1, h: 1 };
    }
    function frameColor(p: ProductDef) {
      const i = p.opts.findIndex((o) => o.name === "Frame" || o.name === "Border" || o.name === "Cover");
      if (i < 0) return null;
      const l = p.opts[i].choices[draft.sel[i]][0].toLowerCase();
      if (l.includes("black")) return "#111";
      if (l.includes("walnut")) return "#6b4423";
      if (l.includes("gold")) return "#C99A2E";
      if (l.includes("white")) return "#f4f1ea";
      if (l.includes("cream")) return "#e8dcc0";
      if (l.includes("navy")) return "#1b2f6b";
      return null;
    }
    function previewHTML(p: ProductDef) {
      if (p.kind === "invite") {
        return `<div class="icard"><svg class="icon" aria-hidden="true"><use href="#i-heart"/></svg><p class="sm">Together with their families</p><p class="nm">${esc(draft.f.names || "Your names")}</p><p class="sm">invite you to celebrate</p><p class="wh">${esc([draft.f.date && new Date(draft.f.date + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }), draft.f.venue].filter(Boolean).join(", ") || "Date and venue")}</p></div><p class="pvnote">Sample layout. We design your video around your details.</p>`;
      }
      if (p.kind === "note") return `<div class="tile" style="width:min(100%,300px);font-size:5rem"><svg class="icon" aria-hidden="true"><use href="#i-box"/></svg></div><p class="pvnote">Tell us what you would like inside, and we will confirm the set with you.</p>`;
      const { w, h } = ratio(p), fc = frameColor(p);
      const style = `width:min(100%, ${Math.round(440 * w / h)}px); aspect-ratio:${w}/${h}; border:${fc ? 10 : 1}px solid ${fc || "var(--line)"}`;
      let inner = "";
      if (p.kind === "photo") inner = draft.files.length ? `<img src="${draft.files[0].url}" alt="Preview of your photo">` : `<div class="ph"><svg class="icon" aria-hidden="true"><use href="#i-print"/></svg><span>Your photo appears here</span></div>`;
      else inner = `<div class="tb"><div class="t1">${esc(draft.f.l1 || "Aarav and Diya")}</div><div class="t2">${esc(draft.f.l2 || "Welcome to our wedding")}</div></div>`;
      const thumbs = draft.files.length > 1 ? `<div class="thumbs">${draft.files.map((f: any) => `<img src="${f.url}" alt="">`).join("")}</div>` : "";
      return `<div class="frame" style="${style}">${inner}</div>${thumbs}<p class="pvnote">${p.kind === "photo" ? "Preview only. Your photo stays on your device here." : "Sample layout. We confirm the design with you."}</p>`;
    }
    function priceHTML(p: ProductDef) {
      const u = unitPrice(p, draft.sel);
      return `<b>${money(u * draft.qty)}</b><span>${money(u)} ${esc(p.unit)}${draft.qty > 1 ? ` &times; ${draft.qty}` : ""}. Sample price.</span>`;
    }
    function productView(id: string) {
      const p = prod(id);
      if (!p) return notFound();
      if (draft && draft.files) draft.files.forEach((f: any) => URL.revokeObjectURL(f.url));
      draft = { pid: id, sel: p.opts.map(() => 0), qty: 1, f: {}, files: [] };
      const c = cat(p.cat);
      document.title = p.name + " (Coming Soon) | Suvarna Custom";

      /*
      // =========================================================================
      // ORIGINAL PRODUCT CONFIGURATION & ORDERING CODE (COMMENTED OUT FOR NOW)
      // =========================================================================
      const fields = p.kind === "photo"
        ? `<label class="fl"><span>Your photos</span><input id="files" type="file" accept="image/*" multiple></label>`
        : p.kind === "invite"
        ? `<label class="fl"><span>Names</span><input data-f="names" type="text" placeholder="For example, Aarav and Diya"></label>
           <div class="two"><label class="fl"><span>Event date</span><input data-f="date" type="date"></label><label class="fl"><span>Venue or city</span><input data-f="venue" type="text" placeholder="Venue or city"></label></div>`
        : p.kind === "text"
        ? `<label class="fl"><span>Names or heading</span><input data-f="l1" type="text" placeholder="For example, Aarav and Diya"></label>
           <label class="fl"><span>Second line</span><input data-f="l2" type="text" placeholder="For example, Welcome to our wedding"></label>`
        : "";
      return `<div class="wrap">
        <p class="crumbs"><a href="#/">Home</a> / <a href="#/c/${c?.id}">${esc(c?.name)}</a> / ${esc(p.name)}</p>
        <div class="pgrid">
          <div class="pvcol"><div class="pvbox" id="pv">${previewHTML(p)}</div></div>
          <div class="info">
            <h1>${esc(p.name)}</h1>
            <p class="desc">${esc(p.blurb)}</p>
            <div class="price" id="price">${priceHTML(p)}</div>
            ${p.opts.map((o: ProductOption, oi: number) => `<div class="og" role="radiogroup" aria-label="${esc(o.name)}"><span>${esc(o.name)}</span><div class="chips">${o.choices.map((ch: [string, number], ci: number) => `<button type="button" class="chip" role="radio" aria-checked="${ci === 0}" data-act="opt" data-o="${oi}" data-c="${ci}">${esc(ch[0])}${ch[1] ? `<small>+${money(ch[1])}</small>` : ""}</button>`).join("")}</div></div>`).join("")}
            ${fields}
            <label class="fl"><span>Notes for us (optional)</span><textarea data-f="notes" placeholder="Colours, custom size, delivery city and anything else"></textarea></label>
            <div class="qtyrow"><span class="muted">Quantity</span><div class="qty"><button type="button" data-act="qty" data-d="-1" aria-label="Decrease quantity">&minus;</button><output id="qtyv">1</output><button type="button" data-act="qty" data-d="1" aria-label="Increase quantity">+</button></div></div>
            <div class="buyrow"><button class="btn" type="button" data-act="add">Add to cart</button><button class="btn ghost" type="button" data-act="buy">Buy now</button></div>
            <p class="assure">We confirm the final price, timeline and delivery charges with you before we start.</p>
          </div>
        </div>
      </div>`;
      // =========================================================================
      */

      // =========================================================================
      // COMING SOON UI FOR PRODUCT PAGES
      // =========================================================================
      return `<div class="wrap">
        <p class="crumbs"><a href="#/">Home</a> / <a href="#/c/${c?.id}">${esc(c?.name)}</a> / ${esc(p.name)}</p>
        <div class="pgrid" style="align-items:center;min-height:50vh;padding-block:2.5rem 5rem">
          <div class="pvcol">
            <div class="pvbox" style="padding:3rem 2rem;text-align:center">
              <div class="tile" style="width:160px;height:160px;margin-inline:auto;font-size:4rem">
                <svg class="icon" aria-hidden="true"><use href="#${cat(p.cat)?.icon || 'i-print'}"/></svg>
              </div>
              <p class="pvnote" style="margin-top:1.5rem;font-size:.95rem">${esc(p.blurb)}</p>
            </div>
          </div>
          <div class="info" style="display:grid;gap:1.2rem">
            <div style="display:inline-flex;align-items:center;gap:.6rem">
              <span style="display:inline-block;padding:.3rem .9rem;border-radius:999px;border:1.5px solid var(--gold);color:var(--gold-2);font-size:.82rem;font-weight:600;letter-spacing:.08em;text-transform:uppercase;background:rgba(230,185,74,.08)">
                Coming Soon
              </span>
              <span class="muted" style="font-size:.92rem">${esc(c?.name)}</span>
            </div>
            <h1 style="font-size:clamp(2.2rem,5vw,3.2rem)">${esc(p.name)}</h1>
            <p class="desc" style="font-size:1.15rem;line-height:1.6;color:var(--muted)">
              We are currently preparing online orders for <strong>${esc(p.name)}</strong>. It will be launched here shortly with full preview and customisation options.
            </p>
            <div style="padding:1.4rem;border:1px solid var(--line-soft);border-radius:14px;background:var(--bg-2);margin-top:.4rem">
              <p style="color:var(--ink);font-weight:500">Need this product right away?</p>
              <p class="muted" style="font-size:.92rem;margin-top:.3rem">
                You can order directly with our team on WhatsApp with your photos and specifications.
              </p>
              <div class="buyrow" style="margin-top:1.2rem">
                <a class="btn" href="${waUrl("Hello Suvarna! I am inquiring about " + p.name + " (Coming Soon). Can I place a custom order?")}" target="_blank" rel="noopener">
                  <svg class="icon" aria-hidden="true" style="font-size:1.2rem"><use href="#i-wa"/></svg>
                  Order via WhatsApp
                </a>
                <a class="btn ghost" href="#/c/${c?.id || 'all'}">
                  Browse other products
                </a>
              </div>
            </div>
            <p class="assure">
              Our workshop is open and printing family memories since the Konica roll days.
            </p>
          </div>
        </div>
      </div>`;
    }
    function refreshProduct() {
      const p = prod(draft.pid);
      if (!p) return;
      const pv = $("#pv");
      if (pv) pv.innerHTML = previewHTML(p);
      const pr = $("#price");
      if (pr) pr.innerHTML = priceHTML(p);
      const qv = $("#qtyv");
      if (qv) qv.textContent = draft.qty;
    }
    function addToCart() {
      const p = prod(draft.pid);
      if (p.kind === "photo" && !draft.files.length) { toast("Add at least one photo first"); $("#files")?.focus(); return false; }
      if (p.kind === "invite" && !(draft.f.names || "").trim()) { toast("Add the names for your invite"); $('[data-f="names"]')?.focus(); return false; }
      const extra: string[] = [];
      if (draft.f.names) extra.push("Names: " + draft.f.names);
      if (draft.f.l1) extra.push("Heading: " + draft.f.l1);
      if (draft.f.l2) extra.push("Second line: " + draft.f.l2);
      if (draft.f.date) extra.push("Date: " + draft.f.date);
      if (draft.f.venue) extra.push("Venue: " + draft.f.venue);
      if (draft.f.notes) extra.push("Notes: " + draft.f.notes);
      cart.push({ pid: p.id, sel: draft.sel.slice(), qty: draft.qty, unit: unitPrice(p, draft.sel), extra, files: draft.files.map((f: any) => f.name) });
      saveCart();
      toast("Added to your cart");
      return true;
    }

    /* ---------- cart and checkout ---------- */
    function lineMeta(i: any) {
      const p = prod(i.pid);
      const o = p.opts.map((op: ProductOption, k: number) => op.name + ": " + op.choices[i.sel[k]][0]).join(", ");
      return { p, o };
    }
    function cartView() {
      document.title = "Your cart | Suvarna Custom";
      if (!cart.length) return `<div class="wrap"><p class="crumbs"><a href="#/">Home</a> / Cart</p><div class="empty"><h1 style="font-size:2.2rem;color:var(--ink)">Your cart is empty</h1><p style="margin:.8rem 0 1.4rem">Add a product to get started.</p><a class="btn" href="#/c/all">Shop all products</a></div></div>`;
      return `<div class="wrap"><p class="crumbs"><a href="#/">Home</a> / Cart</p>
        <div class="cgrid">
          <div><h1 style="font-size:clamp(2rem,4vw,2.8rem);margin-bottom:1.2rem">Your cart</h1>
            ${cart.map((i, n) => { const { p, o } = lineMeta(i); return `<div class="line">${tile(p)}<div><h3>${esc(p.name)}</h3><p class="meta">${esc(o)}${i.files.length ? `<br>Photos: ${esc(i.files.join(", "))}` : ""}${i.extra.length ? `<br>${esc(i.extra.join(" | "))}` : ""}</p>
              <div class="ctl"><div class="qty"><button type="button" data-act="cq" data-i="${n}" data-d="-1" aria-label="Decrease quantity">&minus;</button><output>${i.qty}</output><button type="button" data-act="cq" data-i="${n}" data-d="1" aria-label="Increase quantity">+</button></div><button class="linkbtn" type="button" data-act="rm" data-i="${n}">Remove</button></div></div>
              <div class="amt">${money(i.unit * i.qty)}</div></div>`; }).join("")}
          </div>
          <aside class="sum"><h3>Order summary</h3>
            <div class="row" style="margin-top:.8rem"><span>Subtotal</span><span>${money(cartTotal())}</span></div>
            <div class="row"><span class="muted">Delivery</span><span class="muted">Confirmed after address</span></div>
            <div class="row tot"><span>Total so far</span><span>${money(cartTotal())}</span></div>
            <a class="btn block" style="margin-top:1.2rem" href="#/checkout">Continue to checkout</a>
            <p class="note">Sample prices. Delivery charges are added once we confirm your address.</p>
          </aside>
        </div></div>`;
    }
    function orderText(d: any) {
      const L = ["Hello Suvarna! I would like to place this order:", ""];
      cart.forEach((i, n) => {
        const { p, o } = lineMeta(i);
        L.push(`${n + 1}. ${p.name} x ${i.qty}`, "   " + o);
        if (i.files.length) L.push("   Photos: " + i.files.join(", ") + " (I will send these in this chat)");
        i.extra.forEach((e: string) => L.push("   " + e));
        L.push("   Price: " + money(i.unit * i.qty));
      });
      L.push("", "Subtotal (sample prices): " + money(cartTotal()), "", "Delivery details", "Name: " + (d.name || ""), "Phone: " + (d.phone || ""), "Address: " + (d.addr || ""), "City and PIN: " + (d.city || ""));
      return L.join("\n");
    }
    const co: any = {};
    function checkoutView() {
      document.title = "Checkout | Suvarna Custom";
      Object.keys(co).forEach((k) => delete co[k]);
      if (!cart.length) return cartView();
      return `<div class="wrap"><p class="crumbs"><a href="#/">Home</a> / <a href="#/cart">Cart</a> / Checkout</p>
        <div class="cgrid">
          <div><h1 style="font-size:clamp(2rem,4vw,2.8rem)">Delivery details</h1>
            <div class="two"><label class="fl"><span>Full name</span><input data-c="name" type="text" autocomplete="name"></label><label class="fl"><span>Phone number</span><input data-c="phone" type="tel" autocomplete="tel" inputmode="tel"></label></div>
            <label class="fl"><span>Address</span><textarea data-c="addr" autocomplete="street-address"></textarea></label>
            <label class="fl"><span>City and PIN code</span><input data-c="city" type="text" autocomplete="postal-code"></label>
          </div>
          <aside class="sum"><h3>Place your order</h3>
            ${cart.map((i) => `<div class="row"><span>${esc(prod(i.pid).name)} &times; ${i.qty}</span><span>${money(i.unit * i.qty)}</span></div>`).join("")}
            <div class="row tot"><span>Total so far</span><span>${money(cartTotal())}</span></div>
            <button class="btn block" style="margin-top:1.2rem" type="button" data-act="send">Send order on WhatsApp</button>
            <button class="btn ghost block" style="margin-top:.7rem" type="button" data-act="copyo">Copy order</button>
            <p class="status" id="cstatus" role="status"></p>
            <p class="note">Online payment is not connected in this preview. Once the store is live, customers will pay here by UPI or card.</p>
          </aside>
        </div></div>`;
    }
    const notFound = () => `<div class="wrap"><div class="empty"><h1 style="font-size:2.2rem;color:var(--ink)">We could not find that page</h1><p style="margin:.8rem 0 1.4rem">It may have moved.</p><a class="btn" href="#/">Back to home</a></div></div>`;

    /* ---------- content pages ---------- */
    const contactLine = () => `<p>Message us on <a href="${waUrl("Hello Suvarna!")}" target="_blank" rel="noopener">WhatsApp</a>${CONTACT.email ? ` or write to <a href="mailto:${esc(CONTACT.email)}">${esc(CONTACT.email)}</a>` : ""}.</p>`;

    const POSTS = [
      { slug: "send-photos-on-whatsapp-for-printing", tag: "Tips", date: "September 2026", cat: "prints",
        title: "How to send photos on WhatsApp so they print sharp",
        summary: "A small change in how you send photos can make a big difference to the finished print.",
        body: `<p>WhatsApp shrinks photos to save data when you send them the usual way. That is fine on a phone screen, but prints show the difference, and large prints show it most.</p>
          <h2>Send photos as documents</h2>
          <p>When you attach files in WhatsApp, choose <strong>Document</strong> instead of the gallery or photo option. Documents are sent as the original file, with nothing squeezed out.</p>
          <h2>Send the original, not a copy</h2>
          <ul><li>Use the photo straight from your phone or camera, not a screenshot.</li><li>Avoid pictures downloaded from social media, which are already compressed.</li><li>If a photo was forwarded many times, ask the person who took it for the original.</li></ul>
          <h2>Help us get it right</h2>
          <ul><li>Tell us the size and product you want when you send the files.</li><li>For albums, name the files in the order you would like them, or tell us the chapters.</li><li>Mention anything to leave out or crop.</li></ul>
          <p>If a photo is too small for the size you chose, we will tell you before printing so you can pick a size that suits it.</p>` },
      { slug: "choosing-the-right-size-for-a-large-print", tag: "Guide", date: "September 2026", cat: "large",
        title: "Choosing the right size for a large print",
        summary: "Poster, canvas or banner: how to match the size to your photo and your space.",
        body: `<p>A bigger print makes a bigger impression, but only when the photo can carry it. Here is how to choose.</p>
          <h2>Think about where it will hang</h2>
          <p>A print seen from across a room can be larger and less detailed than one viewed up close. A welcome board at a wedding entrance is read from a few steps away, while a framed portrait in a hallway is looked at from close by.</p>
          <h2>Start with the original file</h2>
          <p>Large prints need a lot of detail. As a common rule of thumb, big prints viewed from a distance look good at around 100 to 150 pixels per inch, so a print several feet wide needs a high-resolution original. Screenshots and photos saved from social media rarely have enough.</p>
          <h2>Pick the product for the job</h2>
          <ul><li><strong>Poster:</strong> a flexible, affordable choice for rooms and events.</li><li><strong>Canvas:</strong> a textured, gallery look that suits living rooms and offices.</li><li><strong>Banner:</strong> made for celebrations, shops and stages, in flex or fabric.</li></ul>
          <p>Not sure your photo is big enough? Send it to us as a document on WhatsApp and we will check it before you order.</p>` },
      { slug: "what-to-include-in-a-wedding-video-invite", tag: "Weddings", date: "September 2026", cat: "invites",
        title: "What to include in a wedding video invite",
        summary: "A short checklist so your video invitation says everything guests need to know.",
        body: `<p>A video invite is easy to share and easy to watch, as long as it covers the essentials. Use this checklist before you send your details.</p>
          <h2>The essentials</h2>
          <ul><li>Names of the couple, spelled exactly as you want them shown.</li><li>Names of the families or the people hosting.</li><li>Date, time and each ceremony you are inviting guests to.</li><li>Venue and city, with a map link if the place is hard to find.</li></ul>
          <h2>Make it feel like you</h2>
          <ul><li>Choose the language guests will read most easily: English, Hindi, Marathi or a mix.</li><li>Share two or three favourite photos of the couple.</li><li>Pick the mood: traditional, modern or playful.</li></ul>
          <h2>Keep it short</h2>
          <p>Most guests watch on a phone, often without sound. A video of around 30 to 60 seconds with clear, readable text works best.</p>
          <h2>Add a way to reply</h2>
          <p>Include a phone number or message link for RSVPs so guests know how to confirm.</p>
          <p>We share a preview for your approval before the final video goes out.</p>` },
      { slug: "make-a-photo-album-that-tells-a-story", tag: "Albums", date: "September 2026", cat: "albums",
        title: "How to make a photo album that tells a story",
        summary: "Choose fewer, better photos and arrange them in chapters that people enjoy turning through.",
        body: `<p>The albums people keep returning to are the ones that feel like a story, not a pile of pictures.</p>
          <h2>Choose fewer, better photos</h2>
          <p>Pick the strongest shots from each moment and leave out near-duplicates. A shorter album that flows will be opened more often than a long one.</p>
          <h2>Arrange it in chapters</h2>
          <p>For a wedding, that could be getting ready, the ceremony, family portraits and the celebration. For a trip, use the days or the places.</p>
          <h2>Mix your shots</h2>
          <ul><li>Use wide photos to set the scene and close-ups for feeling.</li><li>Give a favourite photo a full page.</li><li>Leave some empty space so the pages can breathe.</li></ul>
          <h2>Pick the right format</h2>
          <p>Lay-flat albums suit wide, panoramic photos because the picture is not lost in the fold. Mini albums make lovely gifts for parents and grandparents.</p>
          <p>Send us your photos and a few notes on the order you would like, and we will design the pages and share a preview for you to approve.</p>` }
    ];
    const postCard = (p: any) => `<a class="post-card" href="#/blog/${p.slug}"><span class="tag">${esc(p.tag)} | ${esc(p.date)}</span><h3>${esc(p.title)}</h3><p>${esc(p.summary)}</p></a>`;

    function blogView() {
      document.title = "Blog | Suvarna Custom";
      return `<div class="wrap"><p class="crumbs"><a href="#/">Home</a> / Blog</p>
        <div class="prose" style="max-width:none"><h1>The Suvarna blog</h1><p class="lead" style="max-width:40rem">Guides and ideas for prints, albums and video invites.</p></div>
        <div class="posts" style="padding-bottom:clamp(48px,7vw,90px)">${POSTS.map(postCard).join("")}</div></div>`;
    }
    function postView(slug: string) {
      const p = POSTS.find((x) => x.slug === slug);
      if (!p) return notFound();
      document.title = p.title + " | Suvarna Custom";
      const c = cat(p.cat);
      return `<div class="wrap"><p class="crumbs"><a href="#/">Home</a> / <a href="#/blog">Blog</a> / ${esc(p.tag)}</p>
        <article class="prose"><h1>${esc(p.title)}</h1><p class="post-meta">${esc(p.date)} | Suvarna</p>${p.body}
          <div class="cta-box"><p>Ready to order?</p><a class="btn" href="#/c/${c?.id}">Shop ${esc(c?.name.toLowerCase())}</a></div>
        </article>
        <div style="padding-bottom:clamp(48px,7vw,90px)"><div class="shead"><h2>More to read</h2><a href="#/blog">All articles</a></div>
          <div class="posts">${POSTS.filter((x) => x.slug !== slug).slice(0, 2).map(postCard).join("")}</div></div></div>`;
    }

    function aboutView() {
      document.title = "About us | Suvarna Custom";
      const caps = ["Where it began: the Konica roll photo printing machine", "A puja to bless the new machine", "Early days with the Konica machine"];
      return `<div class="wrap"><p class="crumbs"><a href="#/">Home</a> / About us</p>
        <div class="prose" style="max-width:none">
          <div style="max-width:46rem"><h1>About Suvarna</h1>
          <p class="lead">We began with roll photo developing and printing on a Konica machine. Today we make prints, albums, video invites and keepsakes, and we deliver them wherever you are.</p></div>
          <div class="gallery">${ABOUT_IMGS.map((s, i) => `<figure><img src="${s}" alt="${esc(caps[i])}" loading="lazy"><figcaption>${esc(caps[i])}</figcaption></figure>`).join("")}</div>
          <div style="max-width:46rem">
          <h2>Our journey</h2>
          <p><strong>Roll photo printing.</strong> Film came in and prints went out. Families trusted us with the pictures from their weddings, festivals and everyday moments.</p>
          <p><strong>Digital photo prints.</strong> When cameras went digital, we moved with them, with sharper prints from files and screens.</p>
          <p><strong>Albums.</strong> Prints became albums, so family stories could sit on a shelf and be handed down.</p>
          <p><strong>Video invites.</strong> As celebrations moved to phones, we began making video invitations that families could share in a tap.</p>
          <p><strong>Suvarna 2.0.</strong> Now everything lives in one place, and you can order online from anywhere.</p>
          <h2>What we make</h2>
          <ul><li><a href="#/c/prints">Photo prints</a> and <a href="#/c/large">large-format prints</a></li><li><a href="#/c/albums">Albums and photo books</a></li><li><a href="#/c/invites">Video invites</a></li><li><a href="#/c/wall">Frames and canvas</a> and <a href="#/c/gifts">photo gifts</a></li><li><a href="#/c/event">Wedding and event</a> prints and the <a href="#/c/box">Curation Box</a></li></ul>
          <h2>How we work</h2>
          <p>Every order is made to your details. For albums and invites we share a preview for your approval, and we confirm the price, timeline and delivery with you before we start. We treat every photo as if it were our own family's.</p>
          <h2>Get in touch</h2>
          ${contactLine()}
          ${CONTACT.address ? `<p>${esc(CONTACT.address)}</p>` : ""}
          <div class="cta-box"><p>Have something in mind?</p><a class="btn" href="#/c/all">Shop all products</a></div>
          </div>
        </div></div>`;
    }

    function privacyView() {
      document.title = "Privacy policy | Suvarna Custom";
      return `<div class="wrap"><p class="crumbs"><a href="#/">Home</a> / Privacy policy</p>
        <div class="prose"><h1>Privacy policy</h1>
          <p class="post-meta">Last updated: 29 September 2026</p>
          <p>This policy explains what personal information Suvarna collects when you visit this website or place an order, how we use it, and the choices you have. By using the site or placing an order, you agree to it.</p>

          <h2>Information we collect</h2>
          <ul><li><strong>Contact and delivery details:</strong> your name, phone number, address, city and PIN code.</li><li><strong>Order details:</strong> the products, options and notes you choose, and your messages with us on WhatsApp.</li><li><strong>Photos and files:</strong> the images and details you send so we can make your order.</li><li><strong>Usage information:</strong> basic data about how you use the site, such as pages viewed and device type, collected through cookies or similar tools.</li></ul>

          <h2>How we use your information</h2>
          <ul><li>To make, pack and deliver your order.</li><li>To contact you about previews, price, timeline and delivery.</li><li>To answer questions and provide support, including reprints.</li><li>To keep records and meet legal and tax requirements.</li><li>To understand how the site is used and improve it.</li></ul>

          <h2>Your photos</h2>
          <p>Your photos and files are used to fulfil your order. We do not publish them or use them in our marketing unless you agree. We keep them only as long as needed to complete your order and handle any questions or reprints.</p>

          <h2>Who we share information with</h2>
          <p>We share only what is needed with the services that help us serve you, such as courier partners for delivery, payment providers when online payment is available, messaging platforms such as WhatsApp for our conversations, and hosting or analytics providers for the site. We do not sell your personal information.</p>

          <h2>Payments</h2>
          <p>When online payment is available, it is handled by our payment provider. We do not store your card details.</p>

          <h2>Cookies</h2>
          <p>The site may use cookies and similar technology to remember your cart and understand site use. You can change your browser settings to limit cookies, though parts of the site may then work less well.</p>

          <h2>Your choices</h2>
          <p>You can ask to see, correct or delete the personal information we hold about you, subject to records we must keep by law. Contact us using the details below.</p>

          <h2>Children</h2>
          <p>This site is meant for adults placing orders. We do not knowingly collect personal information from children without a parent or guardian.</p>

          <h2>Security</h2>
          <p>We take reasonable steps to protect your information, but no method of sending or storing data online is completely secure.</p>

          <h2>Changes to this policy</h2>
          <p>We may update this policy from time to time. The date at the top shows when it was last changed.</p>

          <h2>Contact us</h2>
          ${contactLine()}
          ${CONTACT.address ? `<p>${esc(CONTACT.address)}</p>` : ""}
        </div></div>`;
    }

    function renderFooter() {
      const soc = [{ name: "WhatsApp", icon: "i-wa", url: waUrl("Hello Suvarna! I would like to know more about your products.") }].concat(SOCIAL.filter((s) => s.url));
      const footwrap = $("#footwrap");
      if (!footwrap) return;
      footwrap.innerHTML = `
        <div>
          <a class="brand" href="#/"><svg class="icon" aria-hidden="true"><use href="#i-mark"/></svg><span>Suvarna</span></a>
          <p class="muted" style="margin-top:.8rem;max-width:26rem">Custom prints, albums and video invites, from the team that has printed family memories since the Konica roll days.</p>
          <div class="social" aria-label="Social media">${soc.map((s) => `<a href="${esc(s.url)}" target="_blank" rel="noopener"><svg class="icon" aria-hidden="true"><use href="#${s.icon}"/></svg>${esc(s.name)}</a>`).join("")}</div>
        </div>
        <div><h4>Shop</h4><div class="links"><a href="#/c/all">All products</a>${["prints", "large", "albums", "invites", "box"].map((id) => `<a href="#/c/${id}">${esc(cat(id)?.name)}</a>`).join("")}</div></div>
        <div><h4>Company</h4><div class="links"><a href="#/about">About us</a><a href="#/blog">Blog</a><a href="#/privacy">Privacy policy</a><a href="#/cart">Cart</a>${CONTACT.email ? `<a href="mailto:${esc(CONTACT.email)}">${esc(CONTACT.email)}</a>` : ""}${CONTACT.address ? `<span>${esc(CONTACT.address)}</span>` : ""}</div></div>
        <p class="fine">&copy; 2026 Suvarna. Store preview with sample products and prices.</p>`;
    }

    /* ---------- router ---------- */
    function route() {
      const parts = window.location.hash.replace(/^#\/?/, "").split("/");
      const [a, b] = [parts[0], decodeURIComponent(parts.slice(1).join("/") || "")];
      let html = "";
      if (!a) html = homeView();
      else if (a === "c") html = listView(b || "all");
      else if (a === "s") html = listView(null, b);
      else if (a === "p") html = productView(b);
      else if (a === "cart") html = cartView();
      else if (a === "checkout") html = checkoutView();
      else if (a === "about") html = aboutView();
      else if (a === "blog") html = b ? postView(b) : blogView();
      else if (a === "privacy") html = privacyView();
      else html = notFound();

      const appEl = $("#app");
      if (appEl) appEl.innerHTML = html;

      const cur = a === "c" ? "#/c/" + b : (a === "about" || a === "blog") ? "#/" + a : "";
      document.querySelectorAll("#catnav a").forEach((l) => l.classList.toggle("on", l.getAttribute("href") === cur));
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });

      const sort = $("#sort");
      if (sort) {
        sort.addEventListener("change", () => {
          const cid = a === "c" ? (b || "all") : null;
          let list = a === "s"
            ? PRODUCTS.filter((p) => (p.name + " " + p.blurb + " " + (cat(p.cat)?.name || "")).toLowerCase().includes(b.toLowerCase()))
            : PRODUCTS.filter((p) => cid === "all" || p.cat === cid);
          if (sort.value === "l") list.sort((x, y) => fromPrice(x) - fromPrice(y));
          if (sort.value === "h") list.sort((x, y) => fromPrice(y) - fromPrice(x));
          const plist = $("#plist");
          if (plist) plist.innerHTML = list.map(card).join("");
        });
      }
    }

    /* ---------- events ---------- */
    const clickHandler = (e: MouseEvent) => {
      const link = (e.target as HTMLElement).closest("a") as HTMLAnchorElement | null;
      if (link) {
        const href = link.getAttribute("href");
        if (href && href.startsWith("#") && href.length > 1) {
          e.preventDefault();
          if (window.location.hash !== href) {
            window.location.hash = href;
          }
          route();
          return;
        }
      }

      const t = (e.target as HTMLElement).closest("[data-act]") as HTMLElement | null;
      if (!t) return;
      const act = t.dataset.act;
      if (act === "opt") {
        draft.sel[+(t.dataset.o || 0)] = +(t.dataset.c || 0);
        t.parentElement?.querySelectorAll(".chip").forEach((c) => c.setAttribute("aria-checked", String(c === t)));
        refreshProduct();
      } else if (act === "qty") {
        draft.qty = Math.max(1, draft.qty + +(t.dataset.d || 0));
        refreshProduct();
      } else if (act === "add") {
        addToCart();
      } else if (act === "buy") {
        if (addToCart()) {
          window.location.hash = "#/cart";
          route();
        }
      } else if (act === "cq") {
        const i = cart[+(t.dataset.i || 0)];
        if (i) {
          i.qty = Math.max(1, i.qty + +(t.dataset.d || 0));
          saveCart();
          route();
        }
      } else if (act === "rm") {
        cart.splice(+(t.dataset.i || 0), 1);
        saveCart();
        route();
      } else if (act === "send") {
        if (!co.name || !co.phone || !co.addr) {
          const s = $("#cstatus");
          if (s) s.textContent = "Please add your name, phone number and address.";
          return;
        }
        window.open(waUrl(orderText(co)), "_blank", "noopener");
      } else if (act === "copyo") {
        const s = $("#cstatus");
        navigator.clipboard.writeText(orderText(co)).then(
          () => { if (s) s.textContent = "Order copied."; },
          () => { if (s) s.textContent = "Copy did not work. Use the WhatsApp button instead."; }
        );
      }
    };

    const inputHandler = (e: Event) => {
      const t = e.target as HTMLInputElement | HTMLTextAreaElement;
      if (t.dataset.f !== undefined && draft) {
        draft.f[t.dataset.f] = t.value;
        if (t.dataset.f !== "notes") refreshProduct();
      } else if (t.dataset.c !== undefined) {
        co[t.dataset.c] = t.value;
      } else if (t.id === "files" && draft) {
        const fileInput = t as HTMLInputElement;
        draft.files.forEach((f: any) => URL.revokeObjectURL(f.url));
        draft.files = Array.from(fileInput.files || []).map((f) => ({ name: f.name, url: URL.createObjectURL(f) }));
        refreshProduct();
      }
    };

    const keydownHandler = (e: KeyboardEvent) => {
      const target = e.target as HTMLInputElement;
      if (target && target.id === "q" && e.key === "Enter" && target.value.trim()) {
        e.preventDefault();
        window.location.hash = "#/s/" + encodeURIComponent(target.value.trim());
        route();
        target.blur();
      }
    };

    document.addEventListener("click", clickHandler);
    document.addEventListener("input", inputHandler);
    document.addEventListener("keydown", keydownHandler);
    window.addEventListener("hashchange", route);
    window.addEventListener("popstate", route);

    /* ---------- init ---------- */
    const catnav = $("#catnav");
    if (catnav) {
      catnav.innerHTML = `<a href="#/c/all">All products</a>` + CATS.map((c) => `<a href="#/c/${c.id}">${esc(c.name)}</a>`).join("") + `<a href="#/about">About us</a><a href="#/blog">Blog</a>`;
    }
    renderFooter();
    const wafab = $("#wafab");
    if (wafab) {
      wafab.href = waUrl("Hello Suvarna! I would like to know more about your products.");
    }
    saveCart();
    route();

    return () => {
      document.removeEventListener("click", clickHandler);
      document.removeEventListener("input", inputHandler);
      document.removeEventListener("keydown", keydownHandler);
      window.removeEventListener("hashchange", route);
      window.removeEventListener("popstate", route);
    };
  }, []);

  return (
    <>
      {/* SVG Icon Definitions */}
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
        <defs>
          <symbol id="i-mark" viewBox="0 0 48 48">
            <circle cx="24" cy="24" r="6" />
            <circle cx="24" cy="3.6" r="3.4" />
            <circle cx="24" cy="44.4" r="3.4" />
            <circle cx="41.7" cy="13.8" r="3.4" />
            <circle cx="41.7" cy="34.2" r="3.4" />
            <circle cx="6.3" cy="34.2" r="3.4" />
            <circle cx="6.3" cy="13.8" r="3.4" />
            <path d="M24 18V7M24 30v11M29.2 21l9.5-5.5M29.2 27l9.5 5.5M18.8 27l-9.5 5.5M18.8 21l-9.5-5.5" />
          </symbol>
          <symbol id="i-print" viewBox="0 0 48 48">
            <rect x="6" y="8" width="36" height="32" rx="3" />
            <path d="M6 32l11-11 9 9 6-6 10 10" />
            <circle cx="33" cy="17" r="3" />
          </symbol>
          <symbol id="i-large" viewBox="0 0 48 48">
            <rect x="6" y="5" width="36" height="26" rx="2" />
            <path d="M24 31v11M16 42h16" />
            <path d="M14 24l6-6M14 24v-5M14 24h5M34 12l-6 6M34 12v5M34 12h-5" />
          </symbol>
          <symbol id="i-album" viewBox="0 0 48 48">
            <path d="M9 8h27a3 3 0 0 1 3 3v29H12a3 3 0 0 1-3-3z" />
            <path d="M15 8v32" />
            <rect x="21" y="16" width="12" height="10" rx="1.5" />
          </symbol>
          <symbol id="i-video" viewBox="0 0 48 48">
            <rect x="13" y="4" width="22" height="40" rx="5" />
            <path d="M21 19l9 5-9 5z" />
          </symbol>
          <symbol id="i-box" viewBox="0 0 48 48">
            <rect x="6" y="16" width="36" height="24" rx="3" />
            <path d="M6 25h36" />
            <rect x="20.5" y="22" width="7" height="7" rx="1.5" />
            <path d="M12 16l3-8h18l3 8" />
          </symbol>
          <symbol id="i-gift" viewBox="0 0 48 48">
            <rect x="8" y="21" width="32" height="19" rx="2" />
            <rect x="6" y="14" width="36" height="7" rx="2" />
            <path d="M24 14v26" />
            <path d="M24 14c-3-8-11-6-8 0M24 14c3-8 11-6 8 0" />
          </symbol>
          <symbol id="i-heart" viewBox="0 0 48 48">
            <path d="M24 40S7 30 7 18a9 9 0 0 1 17-4 9 9 0 0 1 17 4c0 12-17 22-17 22z" />
          </symbol>
          <symbol id="i-frame" viewBox="0 0 48 48">
            <rect x="6" y="6" width="36" height="36" rx="2" />
            <rect x="14" y="14" width="20" height="20" />
          </symbol>
          <symbol id="i-cart" viewBox="0 0 48 48">
            <path d="M5 6h6l4 22h22l4-16H13" />
            <circle cx="19" cy="38" r="2.5" />
            <circle cx="34" cy="38" r="2.5" />
          </symbol>
          <symbol id="i-search" viewBox="0 0 48 48">
            <circle cx="21" cy="21" r="11" />
            <path d="M30 30l12 12" />
          </symbol>
          <symbol id="i-wa" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              stroke="none"
              d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.39-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35zM12.05 21.78h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88 2.64 0 5.12 1.03 6.99 2.9a9.83 9.83 0 0 1 2.89 6.99c0 5.45-4.44 9.88-9.88 9.88zm8.41-18.3A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.89 0-3.18-1.24-6.17-3.48-8.42z"
            />
          </symbol>
          <symbol id="i-ig" viewBox="0 0 48 48">
            <rect x="6" y="6" width="36" height="36" rx="10" />
            <circle cx="24" cy="24" r="8" />
            <circle cx="35" cy="13" r="1.6" />
          </symbol>
          <symbol id="i-fb" viewBox="0 0 48 48">
            <path d="M28 42V26h5l1-6h-6v-4c0-2 1-3 3-3h3V8h-5c-5 0-8 3-8 8v4h-5v6h5v16z" />
          </symbol>
          <symbol id="i-yt" viewBox="0 0 48 48">
            <rect x="4" y="11" width="40" height="26" rx="8" />
            <path d="M20 18l10 6-10 6z" />
          </symbol>
          <symbol id="i-x" viewBox="0 0 48 48">
            <path d="M10 8l28 32M38 8L10 40" />
          </symbol>
          <symbol id="i-in" viewBox="0 0 48 48">
            <path d="M13 20v16M13 12.5v.5M21 36V20M21 27c0-4 3-7 7-7s6 3 6 7v9" />
          </symbol>
        </defs>
      </svg>

      {/* Preview Announcement Bar */}
      <div className="previewbar">
        Store preview. Products and prices are samples, and online payment is not switched on yet.
      </div>

      {/* Sticky Header */}
      <header className="site">
        <div className="wrap">
          <div className="hrow">
            <a className="brand" href="#/" aria-label="Suvarna Custom, home">
              <svg className="icon" aria-hidden="true">
                <use href="#i-mark" />
              </svg>
              <span>Suvarna</span>
            </a>
            <div className="search" role="search">
              <svg className="icon" aria-hidden="true">
                <use href="#i-search" />
              </svg>
              <input
                id="q"
                type="search"
                placeholder="Search prints, albums, invites, gifts"
                aria-label="Search products"
              />
            </div>
            <a className="cartbtn" href="#/cart" aria-label="Open cart">
              <svg className="icon" aria-hidden="true">
                <use href="#i-cart" />
              </svg>
              <span>Cart</span>
              <b id="cartN">0</b>
            </a>
          </div>
        </div>
        <nav className="catnav" aria-label="Categories">
          <div className="wrap" id="catnav" />
        </nav>
      </header>

      {/* Main Content Mount Point */}
      <main id="app" />

      {/* Footer */}
      <footer>
        <div className="wrap" id="footwrap" />
      </footer>

      {/* WhatsApp Floating Action Button */}
      <a
        className="wafab"
        id="wafab"
        href="#"
        target="_blank"
        rel="noopener"
        aria-label="Chat with us on WhatsApp"
      >
        <svg className="icon" aria-hidden="true">
          <use href="#i-wa" />
        </svg>
      </a>

      {/* Toast Notification */}
      <div className="toast" id="toast" role="status" aria-live="polite" />
    </>
  );
}
