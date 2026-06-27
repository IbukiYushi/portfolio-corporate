import { newsData } from "./news/news-data.js";

/**
 * HTMLのheadの、scriptタグ記入のプロパティ
 * ・defer: 非同期でJSファイルがDL
 * ・type="module": ファイル内定義の変数がグローバル変数として扱われなくなり、他ファイルで同変数名を使用しても名前空間が分離されているのでお互いに影響を与えない（import文を使用するなら必要）
 */

/**
 * トップページ専用。JSONデータからニュースリストを生成してHTMLに挿入：
 * テンプレートリテラルでニュースリストごとに該当するターゲットIDのJSONデータを挿入し、HTMLに挿入
 */
const renderTopNewsList = () => {
  const container = document.querySelector('#news-top .p-top__news-list');
  if (!container) return;
  container.innerHTML = '';
  const topNewsEntries = Object.entries(newsData).slice(0, 4);
  if (topNewsEntries.length === 0) {
    container.innerHTML = `<li class="p-top__news-item--no-data">現在、新着情報はございません</li>`;
    return;
  }
  topNewsEntries.forEach(([id, data]) => {
    const htmlDatetime = data.date.replaceAll('.', '-');
    const listItem = `
      <li class="p-top__news-item">
        <a href="./news.html#${id}" class="p-top__news-link">
          <div class="p-top__news-meta">
            <span class="p-top__news-label p-top__news-label--${data.label}">${data.category}</span>
            <time datetime="${htmlDatetime}" class="p-top__news-date">${data.date}</time>
          </div>
          <p class="p-top__news-title">${data.title}</p>
        </a>
      </li>
    `;
    container.insertAdjacentHTML('beforeend', listItem);
  });
};

/**
 * トップページ専用。メインセクション群へのダウンスクロールボタンの処理：
 * メインセクション群トップの「ダウンスクロールボタン」押下で、HEROセクションからメインセクション群トップへ飛ばすスクロール。
 */
const toMainScroll = () => {
  const toMainScrollButton = document.querySelector('.c-btn-to-main');
  const mainSectionTop = document.querySelector('#main-section-top');
  if (!toMainScrollButton || !mainSectionTop) return;

  toMainScrollButton.addEventListener('click', () => {
    const targetPosition = mainSectionTop.getBoundingClientRect().top + window.pageYOffset;
    window.scrollTo({ top: targetPosition, behavior: 'smooth' });
  });
};

/**
 * JSONデータからニュースリストを生成してHTMLに挿入：
 * テンプレートリテラルでニュースリストごとに該当するターゲットIDのJSONデータを挿入し、HTMLに挿入
 */
const renderNewsList = () => {
  const container = document.querySelector('#news-list-container');
  if (!container) return;
  container.innerHTML = '';
  const newsEntries = Object.entries(newsData);
  if (newsEntries.length === 0) {
    container.innerHTML = `<li class="p-news__list--no-data">現在、新着情報はございません</li>`;
    return;
  }
  newsEntries.forEach(([id, data]) => {
    const listItem = `
      <li class="p-news__item">
        <button class="p-news__link open-modal-button" 
                type="button" 
                data-modal-target="${id}"
        >
          <div class="p-news__meta">
            <span class="p-news__label p-news__label--${data.label}">${data.category}</span>
            <time datetime="${data.date.replaceAll('.', '-')}">${data.date}</time>
          </div>
          <div class="p-news__content">
            <h3 class="p-news__item-title">${data.title}</h3>
            <p class="p-news__item-detail">${data.detail}</p>
          </div>
        </button>
      </li>
    `;
    container.insertAdjacentHTML('beforeend', listItem);
  });
};

/**
 * 採用情報の職種別による表示切り替え：
 * 募集要項・エントリー両エリア左上の職種別ボタンのクリックにより、対応する職種による表示（activeクラス）を切り替える
 */
const entryDetailActive = () => {
  const tabRecruitDetailButtons = document.querySelectorAll('.p-recruit__tab-btn');
  tabRecruitDetailButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // クリックされたナビゲーションタブの職種にのみ.activeをクラス付与
      tabRecruitDetailButtons.forEach((element) => {
        element.classList.remove('is-active');
      });
      const someBtnClassElements = document.querySelectorAll(`button[data-target="${btn.dataset.target}"]`);
      someBtnClassElements.forEach((element) => {
        element.classList.add('is-active');
      });
      // クリックされたナビゲーションタブの職種に連動して、該当する職種の募集要項の内容にのみ.activeをクラス付与
      const recruitDetailContent = document.querySelectorAll('.p-recruit__detail-content');
      recruitDetailContent.forEach((element) => {
        element.classList.remove('is-active');
      });
      const targetId = btn.dataset.target;
      const targetRecruitDetailContent = document.getElementById(`detail-content__${targetId}`);
      targetRecruitDetailContent.classList.add('is-active');
      // クリックされたナビゲーションタブの職種に連動して、該当するエントリーフォームの希望職種フォームのテキストを変更
      const btnText = btn.textContent;
      const recruitEntrySelectedJob = document.getElementById('selected-job');
      recruitEntrySelectedJob.value = btnText;
      recruitEntrySelectedJob.setAttribute('value', btnText);
    });
  });
};

/**
 * 採用情報のエントリーフォームのバリデーション：
 * 採用情報エントリーフォーム内のボタンのクリックにより、バリデーションチェックを行いエラー該当のものにメッセージを出す
 */
const handleEntryForm = () => {
  const entryForm = document.querySelector('.js-recruit-form');
  if (!entryForm) return;
  entryForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    let hasError = false;
    const inputs = entryForm.querySelectorAll('input, textarea');
    inputs.forEach((input) => {
      const formItem = input.closest('.js-form-item');
      const val = input.value.trim();
      let isItemError = false;
      // 読取専用の不正チェック
      if (input.hasAttribute('readonly') && !(val === "エンジニア" || val === "デザイナー" || val === "コンサルタント")) {
        isItemError = true;
      }
      // 必須チェック
      if (input.hasAttribute('required') && val === "") {
        isItemError = true;
        const errorText = formItem.querySelector('.error-message');
        if (errorText) errorText.innerText = "必須項目です";
      }
      // メール形式チェック
      if (input.type === 'email' && val !== "") {
        const emailRegex = /^[a-zA-Z0-9_.+-]+@([a-z0-9][a-z0-9-]*[a-z0-9]\.)+[a-z]{2,}$/;
        if (!emailRegex.test(val)) {
          isItemError = true;
          const errorMessage = formItem.querySelector('.error-message');
          errorMessage.innerText = "メールアドレス形式でご入力ください";
        }
      }
      // 電話番号形式チェック（任意項目だが入力がある場合のみ）
      if (input.type === 'tel' && val !== "") {
        const telRegex = /^(0[5-9]0[0-9]{8}|0[1-9][1-9][0-9]{7})$/;
        if (!telRegex.test(val)) {
          isItemError = true;
          const errorMessage = formItem.querySelector('.error-message');
          errorMessage.innerText = "電話番号形式の半角でご入力ください";
        }
      }
      // クラス付与の判定
      if (isItemError) {
        formItem.classList.add('is-error');
        hasError = true;
      } else {
        formItem.classList.remove('is-error');
      }
    });
    if (hasError) return;

    // 送信処理
    const submitBtn = entryForm.querySelector('.js-recruit-submit');
    try {
      submitBtn.disabled = true;
      submitBtn.textContent = "送信中...";
      const formData = new FormData(entryForm);
      // 擬似送信
      // 【デモ用実装】
      // サーバー環境（PHP等）がないローカル環境でも、送信後の演出（サンクスメッセージ表示やエラーハンドリング）を
      // 正しく確認できるように、Promiseを使用して通信をシミュレート（モック化）しています。
      // 実際の運用時は、この部分を実際の fetch API 呼び出しに差し替えて使用します。
      const mockResponse = await new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve({
            ok: true,
            json: () => Promise.resolve({
              status: "success",
              message: "成功"
            })
          });
        }, 300);
      });
      // const response = await fetch('send_mail.php', {
      //   method: 'POST',
      //   body: formData
      //   // 必要に応じて headers（.then(), .catch(), .finally()）なども追加
      // });
      // HTTPステータスチェック
      if (!mockResponse.ok) throw new Error('応答エラー');
      const data = await mockResponse.json();
      console.log("サーバーからのレスポンス:", data.message);
      if (data.status === "success") {
        (function showThanksMessage() {
          const form = document.querySelector('.js-recruit-form');
          const thanks = document.querySelector('.js-recruit-thanks');
          form.style.transition = 'opacity 0.5s ease';
          form.style.opacity = '0';
          setTimeout(() => {
            form.style.display = 'none';
            thanks.style.display = 'block';
            thanks.style.opacity = '1';
          }, 500);
        })();
      }
    } catch (error) {
      console.error("送信失敗:", error);
      alert("通信中に問題が発生しました。インターネット接続を確認し、もう一度お試しください。");
      submitBtn.disabled = false;
      submitBtn.textContent = "この職種にエントリーする";
    }
  });
};

/**
 * 採用情報ページのサンクスメッセージの「フォームに戻る」ボタンによる表示切り替え：
 * 「フォームに戻る」ボタン押下で、サンクスメッセージがフェードアウトし、フォームがフェードインする。
 */
const entryThanksMessageButton = () => {
  const entryForm = document.querySelector('.js-recruit-form');
  const thanksMessage = document.querySelector('.js-recruit-thanks');
  if (!entryForm || !thanksMessage) return;
  const submitBtn = entryForm.querySelector('.js-recruit-submit');
  const thanksMessageButton = thanksMessage.querySelector('.js-recruit-back-btn');
  const selectedJobInput = entryForm.querySelector('.js-selected-job');
  if (!submitBtn || !thanksMessageButton || !selectedJobInput) return;
  thanksMessageButton.addEventListener('click', () => {
    // サンクスメッセージがフェードアウト&フォームがフェードイン
    (function showEntryForm() {
      // サンクスメッセージのフェードアウト処理
      thanksMessage.style.transition = 'opacity 0.5s ease';
      thanksMessage.style.opacity = '0';
      setTimeout(() => {
        // フォーム表示による切り替え
        thanksMessage.style.display = 'none';
        entryForm.style.display = 'block';
        entryForm.style.opacity = '1';
        // フォーム値リセット
        const currentJob = selectedJobInput.value;
        entryForm.reset();
        selectedJobInput.value = currentJob;
        // エラー表示（is-errorクラス）全削除
        const formItems = entryForm.querySelectorAll('.js-form-item');
        formItems.forEach(item => item.classList.remove('is-error'));
      }, 200);
      // エントリーフォーム側のボタンの状態を復元
      submitBtn.disabled = false;
      submitBtn.textContent = "この職種にエントリーする";
    })();
  });
};

/**
 * お問合せフォームのバリデーション：
 * お問合せフォーム内のボタンのクリックにより、バリデーションチェックを行いエラー該当のものにメッセージを出す
 */
const handleContactForm = () => {
  const contactForm = document.querySelector('.js-contact-form');
  if (!contactForm) return;
  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    let hasError = false;
    const inputs = contactForm.querySelectorAll('input, textarea');
    inputs.forEach((input) => {
      const formItem = input.closest('.js-form-item');
      const val = input.value.trim();
      let isItemError = false;
      // 必須チェック
      if (input.hasAttribute('required') && val === "") {
        isItemError = true;
        const errorText = formItem.querySelector('.error-message');
        if (errorText) errorText.innerText = "必須項目です";
      }
      // メール形式チェック
      if (input.type === 'email' && val !== "") {
        const emailRegex = /^[a-zA-Z0-9_.+-]+@([a-z0-9][a-z0-9-]*[a-z0-9]\.)+[a-z]{2,}$/;
        if (!emailRegex.test(val)) {
          isItemError = true;
          const errorMessage = formItem.querySelector('.error-message');
          errorMessage.innerText = "メールアドレス形式でご入力ください";
        }
      }
      // 電話番号形式チェック（任意項目だが入力がある場合のみ）
      if (input.type === 'tel' && val !== "") {
        const telRegex = /^(0[5-9]0[0-9]{8}|0[1-9][1-9][0-9]{7})$/;
        if (!telRegex.test(val)) {
          isItemError = true;
          const errorMessage = formItem.querySelector('.error-message');
          errorMessage.innerText = "電話番号形式の半角でご入力ください";
        }
      }
      // クラス付与の判定
      if (isItemError) {
        formItem.classList.add('is-error');
        hasError = true;
      } else {
        formItem.classList.remove('is-error');
      }
    });
    if (hasError) return;

    // 送信処理
    const submitBtn = contactForm.querySelector('.js-form-submit');
    try {
      submitBtn.disabled = true;
      submitBtn.textContent = "送信中...";
      const formData = new FormData(contactForm);
      // 擬似送信
      // 【デモ用実装】
      // サーバー環境（PHP等）がないローカル環境でも、送信後の演出（サンクスメッセージ表示やエラーハンドリング）を
      // 正しく確認できるように、Promiseを使用して通信をシミュレート（モック化）しています。
      // 実際の運用時は、この部分を実際の fetch API 呼び出しに差し替えて使用します。
      const mockResponse = await new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve({
            ok: true,
            json: () => Promise.resolve({
              status: "success",
              message: "成功"
            })
          });
        }, 300);
      });
      // const response = await fetch('send_mail.php', {
      //   method: 'POST',
      //   body: formData
      //   // 必要に応じて headers（.then(), .catch(), .finally()）なども追加
      // });
      // HTTPステータスチェック
      if (!mockResponse.ok) throw new Error('応答エラー');
      const data = await mockResponse.json();
      console.log("サーバーからのレスポンス:", data.message);
      if (data.status === "success") {
        (function showThanksMessage() {
          const form = document.querySelector('.js-contact-form');
          const thanks = document.querySelector('.js-thanks-message');
          form.style.transition = 'opacity 0.5s ease';
          form.style.opacity = '0';
          setTimeout(() => {
            form.style.display = 'none';
            thanks.style.display = 'block';
            thanks.style.opacity = '1';
          }, 500);
        })();
      }
    } catch (error) {
      console.error("送信失敗:", error);
      alert("通信中に問題が発生しました。インターネット接続を確認し、もう一度お試しください。");
      submitBtn.disabled = false;
      submitBtn.textContent = "送信する";
    }
  });
};

/**
 * お問い合わせページのサンクスメッセージの「フォームに戻る」ボタンによる表示切り替え：
 * 「フォームに戻る」ボタン押下で、サンクスメッセージがフェードアウトし、フォームがフェードインする。
 */
const contactThanksMessageButton = () => {
  const contactForm = document.querySelector('.js-contact-form');
    const thanksMessage = document.querySelector('.js-thanks-message');
  if (!contactForm || !thanksMessage) return;
  const submitBtn = contactForm.querySelector('.js-form-submit');
  const thanksMessageButton = thanksMessage.querySelector('.js-back-btn');
  if (!submitBtn || !thanksMessageButton) return;
  thanksMessageButton.addEventListener('click', () => {
    // サンクスメッセージがフェードアウト&フォームがフェードイン
    (function showContactForm() {
      // サンクスメッセージのフェードアウト処理
      thanksMessage.style.transition = 'opacity 0.5s ease';
      thanksMessage.style.opacity = '0';
      setTimeout(() => {
        // フォーム表示による切り替え
        thanksMessage.style.display = 'none';
        contactForm.style.display = 'block';
        contactForm.style.opacity = '1';
        // フォーム値リセット
        contactForm.reset();
        // エラー表示（is-errorクラス）全削除
        const formItems = contactForm.querySelectorAll('.js-form-item');
        formItems.forEach(item => item.classList.remove('is-error'));
      }, 200);
      // 問い合わせフォーム側のボタンの状態を復元
      submitBtn.disabled = false;
      submitBtn.textContent = "送信する";
    })();
  });
};

/**
 * アコーディオン
 */
const accordion = () => {
  const accordionTriggers = document.querySelectorAll('.js-accordion-trigger');
  accordionTriggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const accordionParent = trigger.closest('.js-accordion');
      if (accordionParent) {
        accordionParent.classList.toggle('is-open');
      }
    });
  });
};

/**
 * ページネーション
 */
const paginationPerPage = 3;  // 1ページごとのリスト数の初期値設定
const pagination = (perPage = paginationPerPage, hashLinkedPage = '') => {
  const containerListUl = document.querySelector('ul.js-linked-to-pagination');
  if (!containerListUl) return;
  const containerList = containerListUl.querySelectorAll('li');
  const pager = document.querySelector('ul.pager');
  if (!containerList || !pager) return;
  let currentPage = 1; // カレントページ番号
  if(hashLinkedPage) {
    hashLinkedPage = Number(hashLinkedPage.replace('news-', '').replace('0', ''));
    currentPage = Math.ceil(hashLinkedPage / perPage);
  }
  const itemsPerPage = perPage; // 1ページごとのリスト数
  const totalItems = containerList.length; // リスト合計数
  const totalPage = Math.ceil(totalItems / itemsPerPage); // ページ合計数

  // ページリストの表示設定
  const pageListToDisplay = (current = 1) => {
    if (totalItems === 0) {
      const listSection = containerListUl.closest('.js-page-section');
      if (!listSection) return;
      listSection.innerHTML = '';
      const noListDataDisplay = `
        <div class="js-list__no-data">データがありません</div>
      `;
      listSection.insertAdjacentHTML('beforeend', noListDataDisplay);
    } else {
      const firstListIndexInRange = (current - 1) * itemsPerPage;
      containerList.forEach((list, i)  => {
        if (i >= firstListIndexInRange && i < firstListIndexInRange + itemsPerPage) {
          list.style.display = 'block';
          if (i === firstListIndexInRange + itemsPerPage - 1) {
            list.style.borderBottom = '3px solid #ccc';
          }
        } else {
          list.style.display = 'none';
        }
      });
    }
  };

  // ページャーの表示設定
  const pagerToDisplay = (listItemToDisplay = 'initial') => {
    let listItems = [];
    pager.innerHTML = '';
    const createPageItem = (type, content, isCurrent = false) => {
      const currentClass = isCurrent ? 'page-item--current' : '';
      return `
        <li class="page-item page-item--${type} ${currentClass}">
          <button>${content}</button>
        </li>
      `;
    };

    if (totalPage >= 11) {
      // initialまたはカレント番号5以下の場合の処理
      if ( listItemToDisplay === 'initial' || listItemToDisplay <= 5 ) {
        listItems.push(createPageItem('first', '≪'));
        listItems.push(createPageItem('previous', '＜'));
        listItems.push(createPageItem('1', '1', ['initial', 1].includes(listItemToDisplay)));
        for(let i = 2; i <= 7; i++) {
          listItems.push(createPageItem(i, i, (listItemToDisplay === i)));
        }
        listItems.push(createPageItem('ellipsis-next', '…'));
        listItems.push(createPageItem(totalPage, totalPage));
        listItems.push(createPageItem('next', '＞'));
        listItems.push(createPageItem('last', '≫'));
      // カレント番号が最終ページから数えて5つ目まで場合の処理
      } else if ( listItemToDisplay > (totalPage - 5) ) {
        listItems.push(createPageItem('first', '≪'));
        listItems.push(createPageItem('previous', '＜'));
        listItems.push(createPageItem('1', '1'));
        listItems.push(createPageItem('ellipsis-previous', '…'));
        for(let i = (totalPage - 6); i < totalPage; i++) {
          listItems.push(createPageItem(i, i, (listItemToDisplay === i)));
        }
        listItems.push(createPageItem(totalPage, totalPage, listItemToDisplay === totalPage));
        listItems.push(createPageItem('next', '＞'));
        listItems.push(createPageItem('last', '≫'));
      // カレント番号が上記条件分岐以外の数字番号の場合の処理
      } else {
        listItems.push(createPageItem('first', '≪'));
        listItems.push(createPageItem('previous', '＜'));
        listItems.push(createPageItem('1', '1'));
        listItems.push(createPageItem('ellipsis-previous', '…'));
        for(let i = (listItemToDisplay - 2); i <= (listItemToDisplay + 2); i++) {
          listItems.push(createPageItem(i, i, (listItemToDisplay === i)));
        }
        listItems.push(createPageItem('ellipsis-next', '…'));
        listItems.push(createPageItem(totalPage, totalPage));
        listItems.push(createPageItem('next', '＞'));
        listItems.push(createPageItem('last', '≫'));
      }
    } else {
      listItems.push(createPageItem('first', '≪'));
      listItems.push(createPageItem('previous', '＜'));
      listItems.push(createPageItem('1', '1', ['initial', 1].includes(listItemToDisplay)));
      for(let i = 2; i <= totalPage; i++) {
        listItems.push(createPageItem(i, i, (listItemToDisplay === i)));
      }
      listItems.push(createPageItem('next', '＞'));
      listItems.push(createPageItem('last', '≫'));
    }
    pager.innerHTML = listItems.join('');
  };

  // リストの初期表示の処理
  pageListToDisplay(currentPage);
  pagerToDisplay(currentPage);

  // ページボタン押下時の処理
  pager.addEventListener('click', (event) => {
    const btn = event.target.closest('button');
    if (!btn) return;
    const pageList = btn.closest('.page-item');
    if (!pageList) return;
    if (isNaN(btn.textContent)) {
      // ページャーの番号以外が押された時の処理。
      pageList.classList.forEach(className => {
        if (className.startsWith('page-item--')) {
          const pageListName = className.replace('page-item--', '');
          if (pageListName === 'first') {
            currentPage = 1;
          } else if (pageListName === 'previous') {
            currentPage = currentPage > 1 ? (currentPage - 1) : currentPage;
          } else if (pageListName === 'ellipsis-previous') {
            currentPage = Math.trunc((currentPage - 2) / 2);
          } else if (pageListName === 'ellipsis-next') {
            currentPage = Math.trunc((totalPage + currentPage + 2) / 2);
          } else if (pageListName === 'next') {
            currentPage = currentPage < totalPage ? (currentPage + 1) : currentPage;
          } else if (pageListName === 'last') {
            currentPage = totalPage;
          } else {
            currentPage = 1;
          }
        }
      });
    } else {
      // ページャーの番号が押された時の処理
      currentPage = Number(btn.textContent);
    }
    pageListToDisplay(currentPage);
    pagerToDisplay(currentPage);
  });
};

/**
 * ページ内リンクの表示ボタンの制御：
 * ページ内リンクの表示ボタンのクリックにより、対応するエリアの開閉状態（is-openクラス）を切り替える
 */
const toggleInPageLinkNavigation = () => {
  const accordionRightIconField = document.querySelector('.c-inpage-nav__trigger');
  if(!accordionRightIconField) return;
  accordionRightIconField.addEventListener('click', () => {
    const inPageLinkContainer = accordionRightIconField.closest('.c-inpage-nav');
    if (inPageLinkContainer) {
      inPageLinkContainer.classList.toggle('is-open');
    }
  });
  // トップページのみ、ヒーローセクションをスクロールで過ぎてから表示
  if (document.body.classList.contains('top-page')) {
    const scrollContainerEl = document.querySelector('main');
    if (!scrollContainerEl) return;
    const getScrollTop = () =>  window.pageYOffset || document.documentElement.scrollTop;
    const checkScrollPosition = () => {
      const rect = scrollContainerEl.getBoundingClientRect();
      const absoluteTop = rect.top + window.pageYOffset;
      accordionRightIconField.classList.toggle('is-inactive', getScrollTop() < absoluteTop);
    };
    window.addEventListener('scroll', checkScrollPosition);
    window.addEventListener('DOMContentLoaded', checkScrollPosition);
  }
};

/**
 * モーダルが開いているときの処理：
 * 背後のコンテンツをスクロールさせない。
 */
const modalOpenState = () => {
  const modal = document.querySelector('dialog[open]');
  const bodyContent = document.querySelector('body');
  const scrollContainer = document.querySelector('.c-modal__detail-inner');
  if(!modal || !bodyContent || !scrollContainer) return;
  bodyContent.style.overflow = 'hidden';
  scrollContainer.scrollTop = 0;
};

/**
 * ヘッダーのハンバーガーメニュー押下による連動モーダル表示：
 * ハンバーガーメニューのクリックにより、連動させた下層ページリンクのモーダルを表示させる
 */
const openModalHeaderHamburgerMenu = () => {
  const hamburgerMenuButton= document.querySelector('.hamburger-menu-button');
  const modal = document.querySelector('dialog[id="header-hamburger-menu-modal"]');
  if (!hamburgerMenuButton || !modal) return;
  hamburgerMenuButton.addEventListener('click', () => {
    modal.showModal();
    hamburgerMenuButton.setAttribute('aria-expanded', 'true');
    modalOpenState();
  });
  modal.addEventListener('close', () => {
    hamburgerMenuButton.setAttribute('aria-expanded', 'false');
  });
};

/**
 * リスト一覧のボタン化された各リスト押下による連動モーダル表示：
 * 各ボタン化されたリストのクリックにより、情報連動させたモーダルを表示させる
 */
const openModalListButtons = () => {
  const listButtons = document.querySelectorAll('.open-modal-button');
  const modal = document.querySelector('dialog[id="news-modal"]');
  if (!listButtons || !modal) return;
  const modalTitle = modal.querySelector('.c-modal__title h3');
  const modalCategory = modal.querySelector('.c-modal__meta .c-modal__category');
  const modalTime = modal.querySelector('.c-modal__meta .c-modal__time');
  const modalDetailInner = modal.querySelector('.c-modal__detail-inner');
  listButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.modalTarget;
      const newsDataList = newsData[targetId];
      if (newsDataList) {
        modalTitle.textContent = newsDataList.title;
        modalCategory.className = `c-modal__category ${newsDataList.label}`;
        modalCategory.textContent = newsDataList.category;
        modalTime.setAttribute('datetime', newsDataList.date.replaceAll('.', '-'));
        modalTime.textContent = newsDataList.date;
        modalDetailInner.textContent = newsDataList.detail;
        modal.showModal();
        modalOpenState();
      }
    });
  });
};

/**
 * ニュースページ専用。該当URLハッシュのモーダルを開く処理：
 * URLのハッシュ（#news-01など）を検知し、該当するモーダルを自動で開く
 */
const initHashModalOpen = () => {
  const hash = window.location.hash;
  if (!hash) return;
  const targetId = hash.replace('#', '');
  pagination(paginationPerPage, targetId);
  const newsDataList = newsData[targetId];
  if (!newsDataList) return;
  const modal = document.querySelector('dialog[id="news-modal"]');
  if (!modal) return;
  const modalTitle = modal.querySelector('.c-modal__title h3');
  const modalCategory = modal.querySelector('.c-modal__meta .c-modal__category');
  const modalTime = modal.querySelector('.c-modal__meta .c-modal__time');
  const modalDetailInner = modal.querySelector('.c-modal__detail-inner');
  if (!modalTitle || !modalCategory || !modalTime || !modalDetailInner) return;
  modalTitle.textContent = newsDataList.title;
  modalCategory.className = `c-modal__category ${newsDataList.label}`;
  modalCategory.textContent = newsDataList.category;
  modalTime.setAttribute('datetime', newsDataList.date.replaceAll('.', '-'));
  modalTime.textContent = newsDataList.date;
  modalDetailInner.textContent = newsDataList.detail;
  modal.showModal();
  modalOpenState();
};

/**
 * モーダルを閉じる処理：
 * モーダルカード内の「右上×印ボタン・モーダルカード外の黒背景部分・最下部の閉じるボタン」の押下でモーダルが閉じる。
 */
const modalClose = () => {
  const modals = document.querySelectorAll('dialog');
  const bodyContent = document.querySelector('body');
  if (!modals || !bodyContent) return;
  modals.forEach(modal => {
    modal.addEventListener('close', () => {
      bodyContent.style.overflow = 'visible';
      const topScrollButton = document.querySelector('.c-back-to-top--news');
      if(topScrollButton) topScrollButton.classList.remove('is-active');
    });
    // 黒背景部分の押下
    modal.addEventListener('click', (event) => {
      if (event.target === modal) {
        modal.close();
      }
    });
    // ×印ボタンの押下
    const modalCloseIconButton = modal.querySelector('.c-modal__close-btn');
    if (!modalCloseIconButton) return;
      modalCloseIconButton.addEventListener('click', () => {
      modal.close();
    });
    // 閉じるボタンの押下
    // const modalCloseForm = modal.querySelector('.c-modal__footer-form');
    // if (!modalCloseForm) return;
    // const modalCloseFormButton = modalCloseForm.querySelector('button');
    // if (!modalCloseFormButton) return;
    //   modalCloseFormButton.addEventListener('click', () => {
    //     // ここに処理
    // });
  });
};

/**
 * モーダルカードの詳細文の中のトップスクロールボタンの処理：
 * モーダルカード内の「トップスクロールボタン」の押下で詳細文の最上部まで戻る。
 */
const modalBodyDetailTopScroll = () => {
  const modal = document.querySelector('.c-modal');
  if (!modal) return;
  const modalBodyDetail = modal.querySelector('.c-modal__detail');
  if (!modalBodyDetail) return;
  const scrollContainer = modalBodyDetail.querySelector('.c-modal__detail-inner');
  const topScrollButton = modalBodyDetail.querySelector('.c-back-to-top--news');
  if (!scrollContainer || !topScrollButton) return;

  scrollContainer.addEventListener('scroll', () => {
    topScrollButton.classList.toggle('is-active', scrollContainer.scrollTop > 100);
  });

  topScrollButton.addEventListener('click', () => {
    scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
  });
};

/**
 * 汎用的なトップスクロールボタンの処理：
 * 「トップスクロールボタン」の押下でページ内の最上部まで戻る。
 */
const commonTopScroll = (scrollContainerEl = null) => {
  const topScrollButton = document.querySelector('.c-back-to-top');
  if (!topScrollButton) return;

  const getTargetSettings = () => {
    if (scrollContainerEl) {
      const el = document.querySelector(scrollContainerEl);
      if (el) {
        const absoluteTop = el.getBoundingClientRect().top + window.pageYOffset;
        return {
          activeThreshold: absoluteTop + 100,
          scrollToPosition: absoluteTop
        };
      }
    }
    return {
      activeThreshold: 100,
      scrollToPosition: 0
    };
  };

  const getScrollTop = () => {
    return window.pageYOffset || document.documentElement.scrollTop;
  };

  window.addEventListener('scroll', () => {
    topScrollButton.classList.toggle('is-active', getScrollTop() > getTargetSettings().activeThreshold);
  });

  topScrollButton.addEventListener('click', () => {
    window.scrollTo({
      top: getTargetSettings().scrollToPosition,
      behavior: 'smooth'
    });
  });
};

/**
 * ページ内の全初期化処理をまとめる
 */
const init = () => {
  if (document.body.classList.contains('top-page')) {
    renderTopNewsList();
    toMainScroll();
    commonTopScroll('#main-section-top');
  }
  if (document.body.classList.contains('about-page')) {
    commonTopScroll();
  }
  if (document.body.classList.contains('news-page')) {
    renderNewsList();
  }
  if (document.body.classList.contains('recruit-page')) {
    entryDetailActive();
    commonTopScroll();
  }
  if (document.querySelector('.js-recruit-form')) {
    handleEntryForm();
    entryThanksMessageButton();
  }
  if (document.querySelector('.js-contact-form')) {
    handleContactForm();
    contactThanksMessageButton();
  }
  if (document.querySelector('.js-accordion-trigger')) {
    accordion();
  }
  if (document.querySelector('.pagination')) {
    pagination(paginationPerPage);
  }
  if (document.querySelector('#inPageLink')) {
    toggleInPageLinkNavigation();
  }
  if (document.querySelector('dialog')) {
    modalOpenState();
    openModalHeaderHamburgerMenu();
    openModalListButtons();
    initHashModalOpen();
    modalClose();
    modalBodyDetailTopScroll();
  }
};
init();
// ※以下の処理は、外部ライブラリなどでscriptタグにdeferがつけられない時用
// const ExternalLibrary = () => {
//   test();
// };
// document.addEventListener('DOMContentLoaded', ExternalLibrary);