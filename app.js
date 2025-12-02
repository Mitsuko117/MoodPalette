const calendarEl = document.getElementById('calendar');
// HTMLの中の id="calendar" の要素（カレンダーの箱）を取ってきて、calendarEl という変数に入れている。
const modalBackdrop = document.getElementById('modalbackdrop');
// id="modalbackdrop"（黒い半透明の背景）を取っている。モーダルを開く/閉じるときに display を変えるため。
const modalDateText = document.getElementById('modaldatatext');
// モーダルの中の h3（どの日付を編集しているか表示する場所）を取っている。
const moodScoreInput = document.getElementById('moodscore');
//  タブで選んだスコアを保存しておく hidden input を取っている。
const moodNoteInput = document.getElementById('moodnote');
// メモを書く textarea を取っている。
const saveMoodBtn = document.getElementById('savemoodbtn');
// 「保存」ボタン
const deleteMoodBtn = document.getElementById('deletemoodbtn')
// 「削除」ボタン
const closeMoodBtn = document.getElementById('closemoodbtn');
// 「閉じる」ボタン
const moodTabs = document.querySelectorAll('.mood-tab');
//  class="mood-tab" のボタン（1〜5）を全部まとめて配列のように取っている。あとで「クリックされたタブだけ selected にする」ときに使う。

let currentDateKey = null;
// まだ何も選んでいないので null（空）でスタート。

// 日付ごとのデータをまとめて入れておく箱
let moodData = {};

// ページを開いたときに localStorage から全部読み込む
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);            // "2025-12-01" などの日付キー
  const raw = localStorage.getItem(key);      // そのキーに保存されている文字列

  try {
    const parsed = JSON.parse(raw);
    // score と note を持っていれば、気分データとして採用
    if (parsed && typeof parsed.score !== 'undefined') {
      moodData[key] = parsed;
    }
  } catch (e) {
    // JSONでないものは無視（他のアプリのlocalStorageが入っている可能性）
  }
}

function formatDate(date){
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2,'0');
  const d = String(date.getDate()).padStart(2,'0');
  return `${y}-${m}-${d}`;  
}

  const monthLabelEl = document.getElementById('month-label');
  function updateMonthLabel(year, month){
  const displayMonth = month + 1;
  monthLabelEl.textContent = `${year}年${displayMonth}月`;
}


const today = new Date();
let currentYear = today.getFullYear();
let currentMonth = today.getMonth();
function renderCalendar(year,month){
  updateMonthLabel(year, month);
// ① いったんカレンダーの中身を空にする
calendarEl.innerHTML = '';


// ② その月の1日と末日を求める
const firstDay = new Date(year,month, 1);
const lastDay = new Date(year, month +1, 0)
const firstWeekDay = firstDay.getDay();

// ③ 1日の前の「空白マス」を入れて、曜日位置をそろえる
for (let i = 0; i<firstWeekDay; i++){
    const emptyCell = document.createElement('div');
    emptyCell.className = 'day';
    calendarEl.appendChild(emptyCell);
}

// ④ 1日〜末日までの日付マスを作る
for (let d = 1; d <= lastDay.getDate(); d++) {
  const cell = document.createElement('div');
  cell.className = 'day';

  const dateObj = new Date(year, month, d);
  const dateKey = formatDate(dateObj); // "2025-12-01" のような文字列

  // とりあえずは日付の数字だけ表示
  cell.textContent = d;

  // すでにデータがあれば、色とスコアを表示
  const record = moodData[dateKey];
  if (record) {
    cell.classList.add('has-data');                 // CSSで背景色を変える
    cell.textContent = d + ' (' + record.score + ')'; // 例としてスコアも表示
  }

  // ⑤ この日をクリックしたときの処理
  cell.addEventListener('click', function () {
    currentDateKey = dateKey;             // いま編集中の日付を覚える
    modalDateText.textContent = dateKey;  // モーダルのタイトルに日付を表示
    modalBackdrop.style.display = 'flex'; // モーダルを表示

    // 過去の記録を呼び出す
    const r = moodData[dateKey];
    if (r) {
      moodScoreInput.value = r.score;
      moodNoteInput.value  = r.note;

      // タブの見た目も復元
      moodTabs.forEach(t => t.classList.remove('selected'));
      const tab = Array.from(moodTabs).find(
        t => t.getAttribute('data-score') == r.score
      );
      if (tab) tab.classList.add('selected');
    } else {
      // まだ記録がない日なら、空の状態にリセット
      moodScoreInput.value = '';
      moodNoteInput.value  = '';
      moodTabs.forEach(t => t.classList.remove('selected'));
    }
  });

  // ⑥ カレンダーの箱にこのマスを追加
  calendarEl.appendChild(cell);
}
}

// ページを開いたときに、今月のカレンダーを1回描画する
renderCalendar(currentYear, currentMonth);



    $('#savemoodbtn').on("click", function() {
//  id="savemoodbtn" の要素（保存ボタン）がクリックされたときに、この中の処理を実行してね、という意味。
    const moodscore = $("#moodscore").val();
// hidden input の #moodscore から、今選ばれているスコア（1〜5の文字列）を取り出して、moodscore という変数に入れている。
    const moodnote  = $("#moodnote").val();
//textarea の #moodnote から、メモの文字列を取り出して、moodnote という変数に入れている。 
    const dateKey = currentDateKey; // いま編集中の日付キー
// 1つの日付のデータを1つのオブジェクトにまとめる
    const value = {
    score: Number(moodscore),
    note: moodnote
    };
// localStorageには文字列しか入れられないので、JSONに変換
    localStorage.setItem(dateKey, JSON.stringify(value));
    moodData[currentDateKey] = value;

    renderCalendar(currentYear, currentMonth);
    modalBackdrop.style.display = 'none';
});

closeMoodBtn.addEventListener('click', function(){
  modalBackdrop.style.display = 'none';
})

// 背景(黒い部分)をクリックしたら閉じる
modalBackdrop.addEventListener('click', function (event) {
  // 中の白いモーダルをクリックしたときは閉じないようにする
  if (event.target === modalBackdrop) {
    modalBackdrop.style.display = 'none';
  }
});

moodTabs.forEach(tab=>{
  tab.addEventListener('click',() =>{
    // いったん全部のタブから selected を外す
    moodTabs.forEach(t =>t.classList.remove('selected'));

    // 今クリックしたタブだけ selected をつける
    tab.classList.add('selected');

    // data-score の値を hidden に入れる
    const score =tab.getAttribute('data-score');
    moodScoreInput.value = score;
  })
})

deleteMoodBtn.addEventListener('click', function () {
  if (!currentDateKey) {
    alert('日付を先に選んでください');
    return;
  }

  const ok = confirm(currentDateKey + ' の記録を削除しますか？');
  if (!ok) return;

  // localStorage から削除
  localStorage.removeItem(currentDateKey);

  // moodData からも削除
  delete moodData[currentDateKey];

  // 入力欄をリセット
  moodScoreInput.value = '';
  moodNoteInput.value  = '';
  moodTabs.forEach(t => t.classList.remove('selected'));

  // カレンダーを描き直す
  renderCalendar(currentYear, currentMonth);

  modalBackdrop.style.display = 'none';
});
