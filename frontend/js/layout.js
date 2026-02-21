// js/layout.js

function loadHeader() {
  // 1. 判斷路徑邏輯
  const isInnerPage = window.location.pathname.includes('/pages/');
  const imgPath = isInnerPage ? '../assets/images/' : './assets/images/';
  const productLink = isInnerPage ? 'products.html' : 'pages/products.html';

  // 2. 檢查登入狀態 (讀取 LocalStorage)
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const displayName =
    localStorage.getItem('name') || localStorage.getItem('username') || 'User';

  // 3. 動態決定右上角的 HTML
  // 🔥 將原本的 span 改成 a 標籤按鈕，並加上 Hover 發光特效
  let authHTML = '';
  if (isLoggedIn) {
    authHTML = `
            <li>
                <a href="#" id="profile-btn" class="auth-username" title="修改個人資料" style="color: #06b6d4; margin-right: 15px; font-weight: bold; letter-spacing: 1px; text-decoration: none; transition: all 0.3s;" onmouseover="this.style.color='#fff'; this.style.textShadow='0 0 10px rgba(6,182,212,0.8)';" onmouseout="this.style.color='#06b6d4'; this.style.textShadow='none';">
                    [ ${displayName.toUpperCase()} ]
                </a>
            </li>
            <li><a href="#" id="logout-btn" style="color: #ef4444; text-shadow: 0 0 5px rgba(239, 68, 68, 0.5);">登出</a></li>
        `;
  } else {
    authHTML = `<li><a href="${isInnerPage ? 'login.html' : 'pages/login.html'}">登入</a></li>`;
  }

  // 4. 定義 Header HTML
  const headerHTML = `
    <header>
        <div class="logo">
            <a href="${isInnerPage ? '../index.html' : 'index.html'}">
                <img src="${imgPath}logo.png" alt="網站首頁">
            </a>
        </div>
        
        <button class="menu-toggle" aria-label="切換導航">☰</button>
        
        <nav class="nav-menu">
            <div class="nav-left">
                <ul>
                    <li><a href="${productLink}?category=figure">景品</a></li>
                    <li><a href="${productLink}?category=card">卡片</a></li>
                    <li><a href="${productLink}?category=clothes">衣服</a></li>
                    <li><a href="${productLink}?category=music">樂器</a></li>
                    <li><a href="${productLink}?category=other">其他</a></li>
                    <li class="search-wrapper">
                        <form id="search-form">
                            <input type="text" placeholder="搜尋商品...">
                        </form>
                    </li>
                </ul>
            </div>

            <div class="nav-right">
                <ul>
                    <li><a href="${isInnerPage ? 'cart.html' : 'pages/cart.html'}" id="nav-cart-link">購物車</a></li>
                    ${authHTML}
                    <li><a href="${isInnerPage ? 'contact_us.html' : 'pages/contact_us.html'}">聯絡我們</a></li>
                </ul>
            </div>
        </nav>
    </header>
    `;

  document.body.insertAdjacentHTML('afterbegin', headerHTML);

  // ==========================================
  // 🔥 5. 注入「會員資料修改 (Profile)」的 Modal 視窗
  // ==========================================
  if (isLoggedIn) {
    const profileModalHTML = `
        <div class="modal fade" id="profileModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content tech-modal">
                    <div class="modal-header border-bottom-0">
                        <h5 class="modal-title tech-title">👤 個人資料設定 (PROFILE)</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="profile-update-form">
                            <div class="mb-3 input-group-tech">
                                <label>顯示名稱 (Name)</label>
                                <input type="text" class="form-control" id="edit-name" required>
                            </div>
                            <div class="mb-3 input-group-tech">
                                <label>連絡電話 (Phone)</label>
                                <input type="tel" class="form-control" id="edit-phone" required pattern="[0-9]{10}">
                            </div>

                            <div class="mb-3 input-group-tech">
                                <label>修改密碼 (Password)</label>
                                <div class="input-group">
                                    <input type="password" class="form-control" id="edit-password" placeholder="若不修改密碼請留白" minlength="6">
                                    <button class="btn" type="button" id="toggleEditPassword">👁️</button>
                                </div>
                            </div>
                            
                            <div class="mb-3 input-group-tech">
                                <label>確認新密碼 (Confirm Password)</label>
                                <div class="input-group">
                                    <input type="password" class="form-control" id="edit-password-confirm" placeholder="再次輸入新密碼" minlength="6">
                                    <button class="btn" type="button" id="toggleEditPasswordConfirm">👁️</button>
                                </div>
                            </div>

                            <div class="mb-4 input-group-tech">
                                <label>預設補給站 (7-11 取貨門市)</label>
                                <select class="form-control" id="edit-store" required style="cursor: pointer;">
                                    <option value="台北-信義區-鑫信義門市">台北市信義區 - 鑫信義門市 (店號: 123456)</option>
                                    <option value="台中-西屯區-逢甲門市">台中市西屯區 - 逢甲門市 (店號: 234567)</option>
                                    <option value="高雄-大寮區-鳳林門市">高雄市大寮區 - 鳳林門市 (店號: 345678)</option>
                                    <option value="花蓮-新城鄉-太魯閣門市">花蓮縣新城鄉 - 太魯閣門市 (店號: 456789)</option>
                                </select>
                            </div>
                            <div class="d-grid">
                                <button type="submit" class="btn btn-login">💾 儲存變更 (SAVE)</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
        `;
    document.body.insertAdjacentHTML('beforeend', profileModalHTML);

    // 🔥 綁定密碼眼睛按鈕的切換功能
    const toggleEditPasswordBtn = document.getElementById('toggleEditPassword');
    const editPasswordInput = document.getElementById('edit-password');
    if (toggleEditPasswordBtn && editPasswordInput) {
      toggleEditPasswordBtn.addEventListener('click', function () {
        const type =
          editPasswordInput.getAttribute('type') === 'password'
            ? 'text'
            : 'password';
        editPasswordInput.setAttribute('type', type);
        this.textContent = type === 'password' ? '👁️' : '🙈';
      });
    }

    const toggleEditPasswordConfirmBtn = document.getElementById(
      'toggleEditPasswordConfirm',
    );
    const editPasswordConfirmInput = document.getElementById(
      'edit-password-confirm',
    );
    if (toggleEditPasswordConfirmBtn && editPasswordConfirmInput) {
      toggleEditPasswordConfirmBtn.addEventListener('click', function () {
        const type =
          editPasswordConfirmInput.getAttribute('type') === 'password'
            ? 'text'
            : 'password';
        editPasswordConfirmInput.setAttribute('type', type);
        this.textContent = type === 'password' ? '👁️' : '🙈';
      });
    }

    // 🌟 修正1：綁定打開 Profile 視窗的事件，直接讀取 LocalStorage 獨立變數
    const profileBtn = document.getElementById('profile-btn');
    if (profileBtn) {
      profileBtn.addEventListener('click', function (e) {
        e.preventDefault();
        const currentUsername = localStorage.getItem('username');

        if (currentUsername === 'admin') {
          alert(
            '⚠️ 系統提示：最高管理員 (ADMIN) 帳號的檔案已鎖定，無法在此修改！',
          );
          return;
        }

        // 直接把目前存在瀏覽器裡的資料填入輸入框
        document.getElementById('edit-name').value =
          localStorage.getItem('name') || '';
        document.getElementById('edit-phone').value =
          localStorage.getItem('userPhone') || '';
        document.getElementById('edit-password').value = ''; // 基於安全，不自動填入密碼
        document.getElementById('edit-password-confirm').value = '';

        // 檢查門市是否有在選單內，沒有的話預設選第一個
        const savedStore = localStorage.getItem('userStore');
        const storeSelect = document.getElementById('edit-store');
        let storeExists = false;
        for (let i = 0; i < storeSelect.options.length; i++) {
          if (storeSelect.options[i].value === savedStore) {
            storeExists = true;
            break;
          }
        }
        storeSelect.value = storeExists
          ? savedStore
          : storeSelect.options[0].value;

        const profileModal = new bootstrap.Modal(
          document.getElementById('profileModal'),
        );
        profileModal.show();
      });
    }

    // 🌟 修正2：綁定儲存修改資料的事件 (API 真實連線版)
    const profileForm = document.getElementById('profile-update-form');
    if (profileForm) {
      // 注意這裡加上了 async
      profileForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const newName = document.getElementById('edit-name').value.trim();
        const newPhone = document.getElementById('edit-phone').value.trim();
        const newPassword = document.getElementById('edit-password').value;
        const confirmPassword = document.getElementById(
          'edit-password-confirm',
        ).value;
        const newStore = document.getElementById('edit-store').value;

        // 防呆檢查兩次密碼是否一致
        if (newPassword || confirmPassword) {
          if (newPassword !== confirmPassword) {
            alert('⚠️ 系統提示：兩次輸入的新密碼不一致，請重新確認！');
            document.getElementById('edit-password-confirm').focus();
            return;
          }
        }

        const currentUsername = localStorage.getItem('username');

        // 1. 打包要送給 Python 伺服器的資料
        const updateData = {
          name: newName,
          phone: newPhone,
          password: newPassword, // 如果沒填就是空字串，後端會自動忽略
          store_711: newStore,
        };

        // 讓按鈕變成讀取中，防止連點
        const submitBtn = document.querySelector(
          '#profile-update-form button[type="submit"]',
        );
        const originalText = submitBtn.innerText;
        submitBtn.disabled = true;
        submitBtn.innerText = '⏳ 寫入資料庫中...';

        try {
          // 2. 呼叫後端 PUT API 修改資料
          const response = await fetch(
            `https://kcg-api.onrender.com/api/users/${currentUsername}`,
            {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(updateData),
            },
          );

          const result = await response.json();

          if (response.ok && result.status === 'success') {
            // 3. 伺服器修改成功後，同步更新前端的 LocalStorage 快取
            localStorage.setItem('name', result.data.name);
            localStorage.setItem('userPhone', result.data.phone);
            localStorage.setItem('userStore', result.data.store_711);

            alert('✅ 個人資料已成功永久寫入真實資料庫！');
            window.location.reload(); // 重新整理網頁讓右上角的名稱立刻更新
          } else {
            alert('⛔ 更新失敗：' + (result.detail || '伺服器發生錯誤'));
          }
        } catch (error) {
          console.error('API 錯誤:', error);
          alert('⚠️ 無法連線至伺服器，請確認您的 Python 伺服器正在運行中。');
        } finally {
          // 恢復按鈕狀態
          submitBtn.disabled = false;
          submitBtn.innerText = originalText;
        }
      });
    }
  }

  // 6. 綁定漢堡選單
  const menuToggle = document.querySelector('.menu-toggle');
  const navMenu = document.querySelector('.nav-menu');

  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      if (navMenu) navMenu.classList.toggle('active');
    });
  }

  // 7. 綁定「登出」按鈕的功能 (物理全清除版)
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function (e) {
      e.preventDefault();
      const confirmLogout = confirm(
        '⚠️ 系統提示：確定要登出系統並清空目前的購物車嗎？',
      );
      if (confirmLogout) {
        // 列出所有你在截圖中看到的 Key，通通刪掉
        const keysToRemove = [
          'isLoggedIn',
          'username',
          'name',
          'userStore',
          'userPhone',
          'userEmail',
          'userRealName',
          'techCart',
          'lastActiveAdminTab', // 如果連分頁紀錄都不想要留也可以刪掉
        ];

        keysToRemove.forEach((key) => localStorage.removeItem(key));

        alert('🚪 系統已安全登出，資料已從瀏覽器清除。');
        window.location.href = isInnerPage ? '../index.html' : 'index.html';
      }
    });
  }

  // 8. 購物車權限攔截
  const navCartLink = document.getElementById('nav-cart-link');
  if (navCartLink) {
    navCartLink.addEventListener('click', function (e) {
      const isUserLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
      if (!isUserLoggedIn) {
        e.preventDefault();
        const confirmLogin = confirm(
          '⚠️ 存取被拒：請先登入系統才能檢視購物車。\n\n是否立即前往登入頁面？',
        );
        if (confirmLogin) {
          window.location.href = isInnerPage
            ? 'login.html'
            : 'pages/login.html';
        }
      }
    });
  }

  // 9. 搜尋列功能
  const searchForm = document.getElementById('search-form');
  if (searchForm) {
    searchForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const searchInput = this.querySelector('input');
      const keyword = searchInput.value.trim();

      if (keyword) {
        const productLink = isInnerPage
          ? 'products.html'
          : 'pages/products.html';
        window.location.href = `${productLink}?search=${encodeURIComponent(keyword)}`;
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', loadHeader);
