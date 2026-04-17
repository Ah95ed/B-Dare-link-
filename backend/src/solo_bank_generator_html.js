/**
 * زر «100 سؤال»: كل طلب = لغز واحد (SOLO_BANK_SAFE_AI_CHUNK=1) + فجوة ~14s بين طلبات المتصفح
 * لتفادي حدّ الطبقة المجانية (429) من Google.
 */
export const SOLO_BANK_GENERATOR_PAGE_HTML = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>توليد 100 سؤال</title>
  <style>
    body { font-family: system-ui, sans-serif; background: #111; color: #eee; text-align: center; padding: 2rem; margin: 0; }
    button { font-size: 1.05rem; padding: 0.85rem 1.5rem; background: #2563eb; color: #fff; border: none; border-radius: 10px; cursor: pointer; margin: 0.25rem; }
    button.secondary { background: #374151; }
    button:disabled { opacity: 0.5; cursor: not-allowed; }
    #m { margin-top: 1rem; font-size: 0.92rem; color: #9ca3af; max-width: 32rem; margin-left: auto; margin-right: auto; line-height: 1.55; white-space: pre-wrap; }
    #s { margin-top: 0.75rem; font-size: 0.9rem; color: #d1d5db; }
  </style>
</head>
<body>
  <button type="button" id="b">توليد 100 سؤال</button>
  <button type="button" class="secondary" id="r">تحديث العدد في D1</button>
  <p id="s"></p>
  <p id="m"></p>
  <input type="hidden" id="k" value="__INJECT_KEY__" />
  <script>
(function () {
  var b = document.getElementById('b');
  var r = document.getElementById('r');
  var m = document.getElementById('m');
  var s = document.getElementById('s');
  var k = document.getElementById('k').value;
  var level = 1;
  var lang = 'ar';
  var GOAL = 100;
  var MAX_ROUNDS = 150;
  var PAUSE_MS = 14000;
  var PAUSE_AFTER_429_MS = 22000;

  function refreshCount() {
    if (!k) return Promise.resolve();
    return fetch('/solo-bank/status?level=' + level + '&lang=' + lang, {
      headers: { 'X-Wonder-Solo-Key': k }
    }).then(function (res) { return res.json(); }).then(function (j) {
      if (j.ok) {
        s.textContent = 'في D1 — لهذا المستوى/اللغة: ' + j.puzzlesAtLevelLang + ' | إجمالي الجدول: ' + j.puzzlesTotal;
      } else {
        s.textContent = j.error || 'خطأ الحالة';
      }
    }).catch(function (e) {
      s.textContent = 'تعذر جلب العدد: ' + (e.message || e);
    });
  }

  if (!k) {
    m.textContent = 'المفتاح غير مضبوط على السيرفر (SOLO_BANK_WEB_KEY).';
    b.disabled = true;
    r.disabled = true;
    return;
  }

  refreshCount();
  r.onclick = function () { refreshCount(); };

  b.onclick = function () {
    b.disabled = true;
    r.disabled = true;
    var lines = [];
    var left = GOAL;
    var totalIns = 0;
    var totalSkip = 0;
    var round = 0;

    function step() {
      if (left <= 0 || round >= MAX_ROUNDS) {
        lines.push('— انتهى. محفوظ جديد: ' + totalIns + ' | متجاوز (تكرار): ' + totalSkip);
        m.textContent = lines.join('\\n');
        refreshCount();
        b.disabled = false;
        r.disabled = false;
        return;
      }
      round += 1;
      m.textContent = lines.concat(['الدفعة ' + round + ' — بقي يُطلب: ' + left]).join('\\n');

      fetch('/solo-bank/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Wonder-Solo-Key': k },
        body: JSON.stringify({ count: left, level: level, language: lang })
      })
        .then(function (res) { return res.json().then(function (j) { return { res: res, j: j }; }); })
        .then(function (x) {
          var res = x.res;
          var j = x.j;
          if (!res.ok) {
            lines.push('HTTP ' + res.status + ': ' + (j.error || JSON.stringify(j)));
            m.textContent = lines.join('\\n');
            refreshCount();
            b.disabled = false;
            r.disabled = false;
            return;
          }
          if (!j.success) {
            lines.push('فشل: ' + (j.error || JSON.stringify(j)));
            m.textContent = lines.join('\\n');
            refreshCount();
            b.disabled = false;
            r.disabled = false;
            return;
          }
          totalIns += Number(j.inserted) || 0;
          totalSkip += Number(j.skipped) || 0;
          lines.push(
            'دفعة ' + round + ': +محفوظ ' + (j.inserted | 0) + '، +متجاوز ' + (j.skipped | 0) +
              (j.errors && j.errors.length ? ' | أخطاء: ' + j.errors.slice(0, 2).join('؛ ') : '')
          );
          var errJoin = (j.errors || []).join(' ');
          if ((j.inserted | 0) === 0 && (j.skipped | 0) === 0 && j.errors && j.errors.length) {
            if (/429|RESOURCE_EXHAUSTED|quota|rate/i.test(errJoin)) {
              lines.push('حدّ معدّل Google — إيقاف مؤقت ثم إعادة المحاولة…');
              m.textContent = lines.join('\\n');
              round -= 1;
              setTimeout(step, PAUSE_AFTER_429_MS);
              return;
            }
            lines.push('توقف: راجع النموذج في wrangler (GEMINI_MODEL)، أو فعّل الفوترة في Google AI Studio لرفع الحصّة.');
            m.textContent = lines.join('\\n');
            refreshCount();
            b.disabled = false;
            r.disabled = false;
            return;
          }
          left = typeof j.remaining === 'number' ? j.remaining : Math.max(0, left - (j.inserted || 0));
          m.textContent = lines.join('\\n');
          setTimeout(step, PAUSE_MS);
        })
        .catch(function (e) {
          lines.push('شبكة: ' + (e.message || e));
          m.textContent = lines.join('\\n');
          refreshCount();
          b.disabled = false;
          r.disabled = false;
        });
    }

    lines.push('بدء توليد ' + GOAL + ' لغزاً — الطبقة المجانية لـ Google بطيئة؛ انتظر عدة دقائق بين الدفعات.');
    m.textContent = lines.join('\\n');
    step();
  };
})();
  </script>
</body>
</html>`;
