/**
 * صفحة أدوات بنك السولو: توليد/فحص بنك D1 مع خيارات مرنة.
 */
export const SOLO_BANK_GENERATOR_PAGE_HTML = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>أدوات بنك السولو</title>
  <style>
    :root { color-scheme: dark; }
    body { font-family: system-ui, sans-serif; background: #111827; color: #e5e7eb; margin: 0; padding: 18px; }
    .wrap { max-width: 860px; margin: 0 auto; }
    h1 { margin: 0 0 10px; font-size: 1.25rem; }
    .card { background: #1f2937; border: 1px solid #374151; border-radius: 12px; padding: 14px; margin-top: 12px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit,minmax(170px,1fr)); gap: 10px; }
    label { display: block; font-size: 0.82rem; color: #9ca3af; margin-bottom: 4px; text-align: right; }
    input, select { width: 100%; box-sizing: border-box; background: #111827; color: #f3f4f6; border: 1px solid #4b5563; border-radius: 8px; padding: 8px; font-size: 0.94rem; }
    .row { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 12px; }
    button { font-size: 0.95rem; padding: 0.7rem 1rem; background: #2563eb; color: #fff; border: none; border-radius: 10px; cursor: pointer; }
    button.secondary { background: #4b5563; }
    button.danger { background: #b91c1c; }
    button:disabled { opacity: 0.55; cursor: not-allowed; }
    .muted { color: #9ca3af; font-size: 0.82rem; line-height: 1.5; }
    .status { margin-top: 10px; color: #d1d5db; font-size: 0.88rem; }
    .log { margin-top: 10px; color: #9ca3af; font-size: 0.88rem; white-space: pre-wrap; line-height: 1.55; background: #0b1220; border: 1px solid #374151; border-radius: 10px; padding: 10px; min-height: 56px; }
  </style>
</head>
<body>
  <div class="wrap">
    <h1>أدوات توليد بنك السولو</h1>
    <div class="card">
      <div class="grid">
        <div>
          <label for="level">المستوى</label>
          <input id="level" type="number" min="1" max="100" value="1" />
        </div>
        <div>
          <label for="lang">اللغة</label>
          <select id="lang">
            <option value="ar" selected>العربية</option>
            <option value="en">English</option>
          </select>
        </div>
        <div>
          <label for="goal">عدد الألغاز المطلوب توليدها</label>
          <input id="goal" type="number" min="1" max="500" value="100" />
        </div>
        <div>
          <label for="difficulty">درجة الصعوبة (اختياري)</label>
          <select id="difficulty">
            <option value="auto" selected>تلقائي حسب المستوى</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
          </select>
        </div>
        <div>
          <label for="perReq">عدد الإدراج بكل دفعة HTTP</label>
          <input id="perReq" type="number" min="1" max="10" value="1" />
        </div>
        <div>
          <label for="pauseMs">فاصل بين الدفعات (ms)</label>
          <input id="pauseMs" type="number" min="500" max="60000" value="14000" />
        </div>
        <div>
          <label for="maxRounds">أقصى عدد دفعات</label>
          <input id="maxRounds" type="number" min="1" max="1000" value="200" />
        </div>
        <div>
          <label for="details">تفاصيل أوسع في الرد</label>
          <select id="details">
            <option value="1" selected>نعم</option>
            <option value="0">لا</option>
          </select>
        </div>
      </div>
      <div class="row">
        <button type="button" id="b">ابدأ التوليد</button>
        <button type="button" class="secondary" id="r">تحديث العدد في D1</button>
        <button type="button" class="danger" id="clr">حذف كل الأسئلة</button>
      </div>
      <div id="s" class="status"></div>
      <div id="m" class="log"></div>
      <p class="muted">ملاحظة: إن ظهرت أخطاء 429/RESOURCE_EXHAUSTED فالحصة منخفضة؛ ارفع الفاصل الزمني أو قلّل per-request.</p>
    </div>
  </div>
  <input type="hidden" id="k" value="__INJECT_KEY__" />
  <script>
(function () {
  var b = document.getElementById('b');
  var r = document.getElementById('r');
  var clr = document.getElementById('clr');
  var m = document.getElementById('m');
  var s = document.getElementById('s');
  var key = document.getElementById('k').value;

  var levelInput = document.getElementById('level');
  var langInput = document.getElementById('lang');
  var goalInput = document.getElementById('goal');
  var difficultyInput = document.getElementById('difficulty');
  var perReqInput = document.getElementById('perReq');
  var pauseInput = document.getElementById('pauseMs');
  var maxRoundsInput = document.getElementById('maxRounds');
  var detailsInput = document.getElementById('details');

  function n(v, def) {
    var x = Number(v);
    return Number.isFinite(x) ? x : def;
  }
  function clamp(v, min, max) {
    return Math.min(max, Math.max(min, v));
  }
  function getCfg() {
    var level = clamp(Math.floor(n(levelInput.value, 1)), 1, 100);
    var lang = langInput.value === 'en' ? 'en' : 'ar';
    var goal = clamp(Math.floor(n(goalInput.value, 100)), 1, 500);
    var perReq = clamp(Math.floor(n(perReqInput.value, 1)), 1, 10);
    var pauseMs = clamp(Math.floor(n(pauseInput.value, 14000)), 500, 60000);
    var maxRounds = clamp(Math.floor(n(maxRoundsInput.value, 200)), 1, 1000);
    var details = detailsInput.value === '1';
    var difficulty = difficultyInput.value === 'auto' ? null : clamp(Math.floor(n(difficultyInput.value, 1)), 1, 5);
    return { level: level, lang: lang, goal: goal, perReq: perReq, pauseMs: pauseMs, maxRounds: maxRounds, details: details, difficulty: difficulty };
  }

  function refreshCount() {
    if (!key) return Promise.resolve();
    var c = getCfg();
    var q = '/solo-bank/status?level=' + c.level + '&lang=' + c.lang + '&details=' + (c.details ? '1' : '0');
    if (c.difficulty != null) q += '&difficulty=' + c.difficulty;
    return fetch(q, { headers: { 'X-Wonder-Solo-Key': key } })
      .then(function (res) { return res.json(); })
      .then(function (j) {
        if (!j.ok) {
          s.textContent = j.error || 'خطأ في الحالة';
          return;
        }
        var diffTxt = j.requestedDifficulty == null ? 'auto' : String(j.requestedDifficulty);
        s.textContent =
          'في D1 (level/lang/difficulty=' + j.level + '/' + j.language + '/' + diffTxt + '): ' +
          j.puzzlesAtLevelLang + ' | إجمالي الجدول: ' + j.puzzlesTotal;
      })
      .catch(function (e) {
        s.textContent = 'تعذر جلب الحالة: ' + (e.message || e);
      });
  }

  if (!key) {
    m.textContent = 'المفتاح غير مضبوط على السيرفر (SOLO_BANK_WEB_KEY).';
    b.disabled = true;
    r.disabled = true;
    clr.disabled = true;
    return;
  }

  r.onclick = function () { refreshCount(); };
  refreshCount();

  clr.onclick = function () {
    var warn1 = confirm(
      'تحذير: سيتم حذف جميع الأسئلة من جدول D1 (puzzles) دفعة واحدة.\\n' +
      'هذا الإجراء لا يمكن التراجع عنه. هل تريد المتابعة؟'
    );
    if (!warn1) return;

    var warn2 = confirm(
      'تأكيد أخير: سيؤثر الحذف على جميع المستويات واللغات.\\n' +
      'اضغط موافق فقط إذا كنت متأكد 100%.'
    );
    if (!warn2) return;

    var typed = prompt('للتأكيد النهائي اكتب بالضبط: DELETE');
    if (typed !== 'DELETE') {
      m.textContent = 'تم إلغاء الحذف: لم يتم إدخال كلمة التأكيد الصحيحة.';
      return;
    }

    b.disabled = true;
    r.disabled = true;
    clr.disabled = true;
    m.textContent = 'جارٍ حذف كل الأسئلة من D1...';

    fetch('/solo-bank/clear', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Wonder-Solo-Key': key
      },
      body: JSON.stringify({
        confirm: 'DELETE_ALL_PUZZLES',
        clearHistory: true
      })
    })
      .then(function (res) {
        return res.text().then(function (t) {
          var j = null;
          try { j = JSON.parse(t); } catch (_) {}
          return { res: res, j: j, raw: t };
        });
      })
      .then(function (x) {
        if (!x.res.ok) {
          var errMsg = (x.j && x.j.error)
            ? x.j.error
            : ((x.raw || '').slice(0, 240) || 'non-json response');
          m.textContent = 'فشل الحذف HTTP ' + x.res.status + ': ' + errMsg;
          return;
        }
        if (!x.j || x.j.ok !== true) {
          m.textContent =
            'فشل الحذف: السيرفر أعاد استجابة غير متوقعة (ليست JSON صحيحة).\\n' +
            'تحقق من نشر آخر نسخة للـ Worker ثم أعد المحاولة.';
          return;
        }
        var deletedPuzzles = Number(x.j.deletedPuzzles) || 0;
        var deletedHistory = Number(x.j.deletedSoloHistory) || 0;
        m.textContent =
          'تم الحذف بنجاح.\\n' +
          '- puzzles المحذوفة: ' + deletedPuzzles + '\\n' +
          '- solo_player_puzzles المحذوفة: ' + deletedHistory;
        refreshCount();
      })
      .catch(function (e) {
        m.textContent = 'خطأ شبكة أثناء الحذف: ' + (e.message || e);
      })
      .finally(function () {
        b.disabled = false;
        r.disabled = false;
        clr.disabled = false;
      });
  };

  b.onclick = function () {
    var cfg = getCfg();
    var lines = [];
    var left = cfg.goal;
    var totalIns = 0;
    var totalSkip = 0;
    var round = 0;
    b.disabled = true;
    r.disabled = true;
    clr.disabled = true;

    function finish() {
      lines.push('— انتهى. محفوظ جديد: ' + totalIns + ' | متجاوز (تكرار): ' + totalSkip);
      m.textContent = lines.join('\\n');
      refreshCount();
      b.disabled = false;
      r.disabled = false;
      clr.disabled = false;
    }

    function step() {
      if (left <= 0 || round >= cfg.maxRounds) {
        finish();
        return;
      }
      round += 1;
      m.textContent = lines.concat(['الدفعة ' + round + ' — بقي يُطلب: ' + left]).join('\\n');

      var body = {
        count: left,
        level: cfg.level,
        language: cfg.lang,
        perRequest: cfg.perReq,
        details: cfg.details
      };
      if (cfg.difficulty != null) body.difficulty = cfg.difficulty;

      fetch('/solo-bank/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Wonder-Solo-Key': key },
        body: JSON.stringify(body)
      })
        .then(function (res) { return res.json().then(function (j) { return { res: res, j: j }; }); })
        .then(function (x) {
          var res = x.res;
          var j = x.j || {};
          if (!res.ok) {
            lines.push('HTTP ' + res.status + ': ' + (j.error || JSON.stringify(j)));
            m.textContent = lines.join('\\n');
            refreshCount();
            b.disabled = false;
            r.disabled = false;
            clr.disabled = false;
            return;
          }
          if (!j.success) {
            lines.push('فشل: ' + (j.error || JSON.stringify(j)));
            m.textContent = lines.join('\\n');
            refreshCount();
            b.disabled = false;
            r.disabled = false;
            clr.disabled = false;
            return;
          }

          var ins = Number(j.inserted) || 0;
          var sk = Number(j.skipped) || 0;
          totalIns += ins;
          totalSkip += sk;
          lines.push(
            'دفعة ' + round + ': +محفوظ ' + ins + '، +متجاوز ' + sk +
            (j.errors && j.errors.length ? ' | أخطاء: ' + j.errors.slice(0, 2).join('؛ ') : '')
          );

          var errJoin = (j.errors || []).join(' ');
          if (ins === 0 && sk === 0 && j.errors && j.errors.length) {
            if (/429|RESOURCE_EXHAUSTED|quota|rate/i.test(errJoin)) {
              lines.push('حد معدل المزود — انتظار أطول ثم إعادة المحاولة…');
              m.textContent = lines.join('\\n');
              round -= 1;
              setTimeout(step, Math.max(cfg.pauseMs, 22000));
              return;
            }
            lines.push('توقف: لم يتم إدراج أي عنصر في هذه الجولة. راجع تفاصيل الأخطاء.');
            m.textContent = lines.join('\\n');
            refreshCount();
            b.disabled = false;
            r.disabled = false;
            clr.disabled = false;
            return;
          }

          left = typeof j.remaining === 'number' ? j.remaining : Math.max(0, left - ins);
          m.textContent = lines.join('\\n');
          setTimeout(step, cfg.pauseMs);
        })
        .catch(function (e) {
          lines.push('شبكة: ' + (e.message || e));
          m.textContent = lines.join('\\n');
          refreshCount();
          b.disabled = false;
          r.disabled = false;
          clr.disabled = false;
        });
    }

    lines.push(
      'بدء التوليد: المستوى=' + cfg.level +
      '، اللغة=' + cfg.lang +
      '، المطلوب=' + cfg.goal +
      '، الصعوبة=' + (cfg.difficulty == null ? 'auto' : cfg.difficulty) +
      '، لكل دفعة=' + cfg.perReq
    );
    m.textContent = lines.join('\\n');
    step();
  };
})();
  </script>
</body>
</html>`;
