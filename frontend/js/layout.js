// js/layout.js

function loadHeader() {
    // 1. 判斷路徑邏輯
    const isInnerPage = window.location.pathname.includes('/pages/');
    const imgPath = isInnerPage ? '../assets/images/' : './assets/images/';
    const productLink = isInnerPage ? 'products.html' : 'pages/products.html';

    // 2. 檢查登入狀態 (讀取 LocalStorage)
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const username = localStorage.getItem('username') || 'User';

    // 3. 動態決定右上角的「登入/登出」區塊 HTML
    let authHTML = '';
    if (isLoggedIn) {
        authHTML = `
            <li><span style="color: #06b6d4; margin-right: 15px; font-weight: bold; letter-spacing: 1px;">[ ${username.toUpperCase()} ]</span></li>
            <li><a href="#" id="logout-btn" style="color: #ef4444; text-shadow: 0 0 5px rgba(239, 68, 68, 0.5);">登出</a></li>
        `;
    } else {
        authHTML = `<li><a href="${isInnerPage ? 'login.html' : 'pages/login.html'}">登入</a></li>`;
    }

    // 4. 定義 HTML (完全保留你的結構)
    const headerHTML = `
    <header>
        <div class="logo">
            <a href="${isInnerPage ? '../index.html' : 'index.html'}">
                <img src="${imgPath}logo.png" alt="網站首頁">
            </a>
        </div>
        <nav>
            <button class="menu-toggle" aria-label="切換導航">☰</button>
            
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

    // 5. 插入到網頁
    document.body.insertAdjacentHTML('afterbegin', headerHTML);

    // 6. 綁定漢堡選單
    const menuToggle = document.querySelector('.menu-toggle');
    const navLeft = document.querySelector('.nav-left ul'); 
    if(menuToggle && navLeft){
        menuToggle.addEventListener('click', () => {
            navLeft.classList.toggle('active'); 
        });
    }

   // 7. 綁定「登出」按鈕的功能
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault(); // 阻止 <a> 標籤預設的跳轉行為
            
            // 🔥 新增：跳出確認視窗防呆
            const confirmLogout = confirm("⚠️ 系統提示：確定要登出系統並清空目前的購物車嗎？");
            
            // 只有當使用者按下「確定」時，才執行以下登出動作
            if (confirmLogout) {
                // 1. 清除 LocalStorage 裡的登入紀錄
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('username');
                
                // 🔥 2. 新增：銷毀購物車資料 (保護隱私)
                localStorage.removeItem('techCart');
                
                // 完全保留你的中文提示
                alert("🚪 系統登出完畢，購物車已淨空，期待您再次回來！");
                
                // 🔥 3. 新增：判斷路徑，強制將使用者踢回首頁 (index.html)
                const isInnerPage = window.location.pathname.includes('/pages/');
                window.location.href = isInnerPage ? '../index.html' : 'index.html';
            }
        });
    }
    
    // ==========================================
    // 🔥 8. 新增：購物車權限攔截 (Route Guard)
    // ==========================================
    const navCartLink = document.getElementById('nav-cart-link');
    if (navCartLink) {
        navCartLink.addEventListener('click', function(e) {
            // 再次確認當下的登入狀態
            const isUserLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
            
            // 如果 "未登入"
            if (!isUserLoggedIn) {
                e.preventDefault(); // 阻止原本跳轉到購物車的行為
                
                // 跳出確認視窗 (有確定與取消)
                const confirmLogin = confirm("⚠️ 存取被拒：請先登入系統才能檢視購物車。\n\n是否立即前往登入頁面？");
                
                if (confirmLogin) {
                    // 使用者點擊「確定」，跳轉到登入頁面
                    window.location.href = isInnerPage ? 'login.html' : 'pages/login.html';
                }
                // 如果使用者點擊「取消」，甚麼都不做（對話框會自動關閉，留在原畫面）
            }
        });
    }

    // ==========================================
    // 🔥 9. 新增：搜尋列功能 (Search Function)
    // ==========================================
    const searchForm = document.getElementById('search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault(); // 阻止表單預設的重整行為
            
            // 找到表單裡面的 input 元素，並取得輸入的值
            const searchInput = this.querySelector('input');
            const keyword = searchInput.value.trim(); // 移除前後空白
            
            if (keyword) {
                // 如果有輸入關鍵字，就跳轉到商品頁並帶上 search 參數
                // 使用 encodeURIComponent 確保中文網址不會亂碼
                const productLink = isInnerPage ? 'products.html' : 'pages/products.html';
                window.location.href = `${productLink}?search=${encodeURIComponent(keyword)}`;
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', loadHeader);