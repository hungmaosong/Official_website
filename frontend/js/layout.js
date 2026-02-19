// js/layout.js

function loadHeader() {
    // 1. 判斷路徑邏輯
    const isInnerPage = window.location.pathname.includes('/pages/');
    const imgPath = isInnerPage ? '../assets/images/' : './assets/images/';
    const productLink = isInnerPage ? 'products.html' : 'pages/products.html';

    // 2. 檢查登入狀態 (讀取 LocalStorage)
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const displayName = localStorage.getItem('name') || localStorage.getItem('username') || 'User';

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
                                    <input type="password" class="form-control" id="edit-password" placeholder="請輸入新密碼" required minlength="6">
                                    <button class="btn" type="button" id="toggleEditPassword">👁️</button>
                                </div>
                            </div>
                            
                            <div class="mb-3 input-group-tech">
                                <label>確認新密碼 (Confirm Password)</label>
                                <div class="input-group">
                                    <input type="password" class="form-control" id="edit-password-confirm" placeholder="請再次輸入新密碼" required minlength="6">
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
            toggleEditPasswordBtn.addEventListener('click', function() {
                const type = editPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
                editPasswordInput.setAttribute('type', type);
                this.textContent = type === 'password' ? '👁️' : '🙈';
            });
        }

        const toggleEditPasswordConfirmBtn = document.getElementById('toggleEditPasswordConfirm');
        const editPasswordConfirmInput = document.getElementById('edit-password-confirm');
        if (toggleEditPasswordConfirmBtn && editPasswordConfirmInput) {
            toggleEditPasswordConfirmBtn.addEventListener('click', function() {
                const type = editPasswordConfirmInput.getAttribute('type') === 'password' ? 'text' : 'password';
                editPasswordConfirmInput.setAttribute('type', type);
                this.textContent = type === 'password' ? '👁️' : '🙈';
            });
        }

        // 綁定打開 Profile 視窗的事件
        const profileBtn = document.getElementById('profile-btn');
        if (profileBtn) {
            profileBtn.addEventListener('click', function(e) {
                e.preventDefault();
                const currentUsername = localStorage.getItem('username');
                
                // 防呆：如果是 admin 測試帳號，不允許修改
                if (currentUsername === 'admin') {
                    alert("⚠️ 系統提示：最高管理員 (ADMIN) 帳號的檔案已鎖定，無法在此修改！");
                    return;
                }

                // 從資料庫抓取目前登入者的資料
                let usersDB = JSON.parse(localStorage.getItem('usersDatabase')) || [];
                const currentUser = usersDB.find(user => user.username === currentUsername);

                if (currentUser) {
                    // 把現有資料自動填入輸入框，確認密碼也先填入舊密碼
                    document.getElementById('edit-name').value = currentUser.name || '';
                    document.getElementById('edit-phone').value = currentUser.phone || '';
                    document.getElementById('edit-password').value = currentUser.password || '';
                    document.getElementById('edit-password-confirm').value = currentUser.password || '';
                    document.getElementById('edit-store').value = currentUser.store_711 || '';
                    
                    // 呼叫 Bootstrap 打開視窗
                    const profileModal = new bootstrap.Modal(document.getElementById('profileModal'));
                    profileModal.show();
                }
            });
        }

        // 綁定儲存修改資料的事件
        const profileForm = document.getElementById('profile-update-form');
        if (profileForm) {
            profileForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const newName = document.getElementById('edit-name').value.trim();
                const newPhone = document.getElementById('edit-phone').value.trim();
                const newPassword = document.getElementById('edit-password').value;
                const confirmPassword = document.getElementById('edit-password-confirm').value; // 抓取確認密碼
                const newStore = document.getElementById('edit-store').value;
                
                // 🔥 新增：防呆檢查兩次密碼是否一致
                if (newPassword !== confirmPassword) {
                    alert("⚠️ 系統提示：兩次輸入的密碼不一致，請重新確認！");
                    document.getElementById('edit-password-confirm').focus(); // 跳回確認密碼框
                    return; // 中斷儲存動作
                }

                const currentUsername = localStorage.getItem('username');
                let usersDB = JSON.parse(localStorage.getItem('usersDatabase')) || [];
                const userIndex = usersDB.findIndex(user => user.username === currentUsername);
                
                if (userIndex > -1) {
                    // 更新資料庫裡的該筆資料
                    usersDB[userIndex].name = newName;
                    usersDB[userIndex].phone = newPhone;
                    usersDB[userIndex].password = newPassword;
                    usersDB[userIndex].store_711 = newStore;
                    
                    localStorage.setItem('usersDatabase', JSON.stringify(usersDB));
                    
                    // 同步更新當前登入的快取
                    localStorage.setItem('name', newName);
                    localStorage.setItem('userStore', newStore);
                    
                    alert("✅ 個人資料更新成功！");
                    window.location.reload(); // 重新整理網頁讓右上角的名稱立刻更新
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

    // 7. 綁定「登出」按鈕的功能
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault(); 
            const confirmLogout = confirm("⚠️ 系統提示：確定要登出系統並清空目前的購物車嗎？");
            if (confirmLogout) {
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('username');
                localStorage.removeItem('name'); 
                localStorage.removeItem('userStore'); 
                localStorage.removeItem('techCart');
                alert("🚪 系統登出完畢，購物車已淨空，期待您再次回來！");
                window.location.href = isInnerPage ? '../index.html' : 'index.html';
            }
        });
    }
    
    // 8. 購物車權限攔截
    const navCartLink = document.getElementById('nav-cart-link');
    if (navCartLink) {
        navCartLink.addEventListener('click', function(e) {
            const isUserLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
            if (!isUserLoggedIn) {
                e.preventDefault(); 
                const confirmLogin = confirm("⚠️ 存取被拒：請先登入系統才能檢視購物車。\n\n是否立即前往登入頁面？");
                if (confirmLogin) {
                    window.location.href = isInnerPage ? 'login.html' : 'pages/login.html';
                }
            }
        });
    }

    // 9. 搜尋列功能
    const searchForm = document.getElementById('search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault(); 
            const searchInput = this.querySelector('input');
            const keyword = searchInput.value.trim(); 
            
            if (keyword) {
                const productLink = isInnerPage ? 'products.html' : 'pages/products.html';
                window.location.href = `${productLink}?search=${encodeURIComponent(keyword)}`;
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', loadHeader);