/* ============================================
   阿澈的小破站 v4 —— 唯一的 JS 文件
   功能：时钟 / 假留言板 / 文章展开 / 彩蛋
   彩蛋提示：去按 Konami 秘技，或者连点三次 ©
   ============================================ */

(function () {
  "use strict";

  /* ---------- 1. 顶部时钟 ---------- */
  const clock = document.getElementById("clock");
  function tick() {
    if (!clock) return;
    const now = new Date();
    const p = (n) => String(n).padStart(2, "0");
    clock.textContent =
      p(now.getHours()) + ":" + p(now.getMinutes()) + ":" + p(now.getSeconds());
  }
  tick();
  setInterval(tick, 1000);

  /* ---------- 2. 主页"最后更新"日期 ---------- */
  const nowdate = document.getElementById("nowdate");
  if (nowdate) {
    const d = new Date();
    nowdate.textContent = d.getFullYear() + "-" +
      String(d.getMonth() + 1).padStart(2, "0") + "-" +
      String(d.getDate()).padStart(2, "0") +
      "（对，这个日期是假的，每次打开都会变，我懒得手动改）";
  }

  /* ---------- 3. 假留言板（localStorage，只存你自己） ---------- */
  const form = document.getElementById("gb-form");
  const list = document.getElementById("gb-list");
  const KEY = "ache-guestbook-v1";

  function loadMsgs() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; }
    catch (e) { return []; }
  }
  function saveMsgs(arr) {
    try { localStorage.setItem(KEY, JSON.stringify(arr)); } catch (e) {}
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function renderMsgs() {
    if (!list) return;
    const msgs = loadMsgs();
    if (!msgs.length) {
      list.innerHTML = '<li><span class="gb-who">（空）</span>还没有留言，当第一个吧。反正只有你自己能看见。</li>';
      return;
    }
    list.innerHTML = msgs.map(function (m) {
      return '<li><span class="gb-who">' + escapeHtml(m.name) +
        '<span class="gb-when">' + m.time + "</span></span>" +
        escapeHtml(m.text) + "</li>";
    }).join("");
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const name = document.getElementById("gb-name").value.trim();
      const text = document.getElementById("gb-text").value.trim();
      if (!name || !text) return;
      const now = new Date();
      const msgs = loadMsgs();
      msgs.unshift({
        name: name,
        text: text,
        time: now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0") + "-" + String(now.getDate()).padStart(2, "0")
      });
      saveMsgs(msgs);
      renderMsgs();
      form.reset();
    });
    renderMsgs();
  }

  /* ---------- 4. 文章展开 ---------- */
  document.querySelectorAll(".note-title button").forEach(function (btn) {
    btn.addEventListener("click", function () {
      btn.closest(".note").classList.toggle("open");
    });
  });

  /* ---------- 5. 彩蛋 A：Konami 秘技 → 网站倒过来 ---------- */
  const KONAMI = [
    "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
    "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"
  ];
  let konamiPos = 0;
  document.addEventListener("keydown", function (e) {
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    konamiPos = (key === KONAMI[konamiPos]) ? konamiPos + 1 : 0;
    if (konamiPos === KONAMI.length) {
      document.body.classList.toggle("cheat-mode");
      console.log("%c作弊模式已%s。", "color:#b3392b;font-size:16px", document.body.classList.contains("cheat-mode") ? "开启" : "关闭");
      konamiPos = 0;
    }
  });

  /* ---------- 6. 彩蛋 B：连点三次 © ----------
     修复说明：
     1. 不再挑"包含©的那一行"，直接监听整个页脚 —— 以前用
        includes("©") 判断，文件编码不是 UTF-8 时 © 会对不上，
        彩蛋就静默失效了。现在点页脚任意文字都算。
     2. 每点一下弹小气泡提示，点到第几下看得见。
     3. 两次点击间隔放宽到 2 秒。
  */
  (function () {
    const foot = document.querySelector(".site-foot");
    if (!foot) return;

    let clicks = 0;
    let timer = null;

    function toast(msg) {
      let t = document.getElementById("site-toast");
      if (!t) {
        t = document.createElement("div");
        t.id = "site-toast";
        t.style.cssText =
          "position:fixed;left:50%;bottom:28px;transform:translateX(-50%);" +
          "background:#1c1b18;color:#f7f3ea;padding:7px 18px;border-radius:20px;" +
          "font-size:.85rem;z-index:2000;opacity:0;transition:opacity .25s;" +
          "box-shadow:0 4px 14px rgba(0,0,0,.25);pointer-events:none;";
        document.body.appendChild(t);
      }
      t.textContent = msg;
      t.style.opacity = "1";
      clearTimeout(t._hide);
      t._hide = setTimeout(function () { t.style.opacity = "0"; }, 1000);
    }

    foot.addEventListener("click", function (e) {
      // 点到链接（比如 humans.txt）不算
      if (e.target.closest && e.target.closest("a")) return;

      clicks++;
      clearTimeout(timer);
      timer = setTimeout(function () { clicks = 0; }, 2000);

      if (clicks === 1) toast("还有 2 下 →");
      else if (clicks === 2) toast("还有 1 下 →");
      else {
        clicks = 0;
        toast("🎉 找到了！");
        showEgg();
      }
    });

    function showEgg() {
      const d = document.createElement("div");
      d.style.cssText =
        "position:fixed;inset:0;display:flex;align-items:center;justify-content:center;" +
        "background:rgba(28,27,24,.6);z-index:3000;";
      d.innerHTML =
        '<div style="background:#fdfbf4;border:2px solid #1c1b18;border-radius:8px;' +
        'padding:28px 38px;text-align:center;box-shadow:8px 8px 0 rgba(0,0,0,.2);max-width:90%;">' +
        "<p style='font-size:2rem;margin:0'>🏅</p>" +
        "<h3 style='margin:.4em 0'>恭喜你找到隐藏彩蛋</h3>" +
        "<p>奖励：一句真诚的「真闲」。</p>" +
        "<p style='font-size:.8rem;color:#6b665a'>这个彩蛋只对三种人有效：无聊的人、认真的人、以及既无聊又认真的人。</p>" +
        "<button id='egg-close' style='margin-top:10px;padding:6px 22px;cursor:pointer;font-size:.95rem'>收下奖状</button></div>";
      document.body.appendChild(d);
      d.querySelector("#egg-close").addEventListener("click", function () { d.remove(); });
    }
  })();

  /* ---------- 7. console 留言（给翻开发者工具的人） ---------- */
  console.log("%c嘿，别翻了，这里没有秘密。", "color:#3d6b4f;font-size:18px;font-weight:bold");
  console.log("%c……好吧其实有一个：把页面拉到最底下，连点三次 © 试试。", "color:#6b665a;font-size:13px");
  console.log("%c（以及：这个网站没有框架，没有构建工具，连压缩都没压，够手工了吧。）", "color:#6b665a;font-size:12px");
})();
