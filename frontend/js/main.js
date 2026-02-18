// js/main.js

document.addEventListener("DOMContentLoaded", () => {

    // ==========================================
    // 1. 輪播圖功能 (只在有輪播圖的頁面執行)
    // ==========================================
    var myCarousel = document.querySelector('#carouselExampleIndicators');
    if (myCarousel) {
        new bootstrap.Carousel(myCarousel, {
            interval: 3000,
            ride: 'carousel'
        });
    }

    // ==========================================
    // 2. 商品列表渲染功能 (裝備庫核心)
    // ==========================================
    const productsContainer = document.getElementById("products-container");
    
    if (productsContainer) {
        
        // 確保 data.js 有正確載入
        if (typeof productsData === 'undefined') {
            console.error("錯誤：找不到 productsData，請確認 data.js 是否有在 main.js 之前載入。");
            productsContainer.innerHTML = '<p class="text-white text-center">無法讀取商品資料 (Data Error)</p>';
            return;
        }

        const itemsPerPage = 8; // 設定一頁顯示 8 個商品
        let currentPage = 1;

        // --- 核心函式：畫出商品 (Tech Style) ---
        function renderProducts(page) {
            productsContainer.innerHTML = ""; // 先清空畫面
            
            const startIndex = (page - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const currentItems = productsData.slice(startIndex, endIndex);

            if(currentItems.length === 0) {
                productsContainer.innerHTML = '<div class="col-12 text-center text-muted" style="color: #cbd5e1;">目前沒有庫存 / NO DATA</div>';
                return;
            }

            // 生成 HTML
            currentItems.forEach(product => {
                // 1. 判斷庫存狀態
                let stockHTML = '';
                let btnState = ''; // 按鈕狀態 (是否禁用)
                let btnText = '加入購物車';
                let btnClass = 'btn-primary';

                if (product.stock === 0) {
                    // 缺貨狀態
                    stockHTML = `<span class="stock-badge out-of-stock">庫存不足 OUT OF STOCK</span>`;
                    btnState = 'disabled';
                    btnText = '補貨中...';
                    btnClass = 'btn-secondary'; // 灰色按鈕
                } else if (product.stock <= 5) {
                    // 低庫存警示
                    stockHTML = `<span class="stock-badge low-stock">剩餘庫存: ${product.stock} (稀有!)</span>`;
                } else {
                    // 正常庫存
                    stockHTML = `<span class="stock-badge normal-stock">庫存充足: ${product.stock}</span>`;
                }

                // 2. 生成 HTML
                const productHTML = `
                    <div class="col-12 col-md-6 col-lg-3">
                        <div class="tech-card h-100 d-flex flex-column">
                            <div class="card-img-wrapper">
                                <img src="${product.image}" class="card-img-top" alt="${product.name}">
                                <div class="img-overlay"></div>
                            </div>
                            
                            <div class="card-body-tech d-flex flex-column flex-grow-1">
                                <h5 class="card-title mb-1" style="color: #fff; font-weight: 600;">${product.name}</h5>
                                
                                <div class="price-tag mb-2" style="color: var(--accent);">
                                    NT$${product.price}
                                </div>
                                
                                <div class="mb-3">
                                    ${stockHTML}
                                </div>
                                
                                <div class="mt-auto d-grid gap-2">
                                    <button class="btn btn-outline-light btn-sm" style="border-radius: 50px;">查看詳情</button>
                                    
                                    <button class="btn ${btnClass} btn-sm add-to-cart" 
                                        ${btnState}
                                        data-id="${product.id}" 
                                        data-name="${product.name}"
                                        data-price="${product.price}"
                                        data-image="${product.image}"
                                        data-stock="${product.stock}"
                                        style="border-radius: 50px; border:none;">
                                        ${btnText}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                productsContainer.insertAdjacentHTML('beforeend', productHTML);
            });

            updatePaginationButtons();
        }

        // --- 更新分頁按鈕狀態 ---
        function updatePaginationButtons() {
            const prevBtn = document.getElementById('prev-page');
            const nextBtn = document.getElementById('next-page');
            const pageInfo = document.getElementById('page-info');

            if(prevBtn && nextBtn) {
                prevBtn.disabled = currentPage === 1;
                nextBtn.disabled = currentPage * itemsPerPage >= productsData.length;
                if(pageInfo) pageInfo.innerText = `PAGE 0${currentPage}`; // 補零更有科技感
            }
        }

        // --- 綁定分頁點擊事件 ---
        document.getElementById('prev-page')?.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderProducts(currentPage);

                // 🔥 新增這行：平滑滾動到最上方
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });

        document.getElementById('next-page')?.addEventListener('click', () => {
            if (currentPage * itemsPerPage < productsData.length) {
                currentPage++;
                renderProducts(currentPage);

                // 🔥 新增這行：平滑滾動到最上方
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });

        // 初次執行渲染
        renderProducts(currentPage);
    }

    // ==========================================
    // 3. 購物車互動功能 (Tech Modal & Toast)
    // ==========================================
    
    // 只有當頁面上有 cartModal 時才執行這段邏輯
    const cartModalEl = document.getElementById('cartModal');
    if (cartModalEl) {
        
        // 初始化 Bootstrap Modal
        const cartModal = new bootstrap.Modal(cartModalEl);
        
        // 暫存當前選擇的商品
        let currentProduct = {};

        // A. 打開視窗 (事件委派)
        document.addEventListener('click', function(e) {
            if (e.target && e.target.classList.contains('add-to-cart')) {
                const btn = e.target;
                
                // 抓取按鈕上的資料
                currentProduct = {
                    id: btn.getAttribute('data-id'),
                    name: btn.getAttribute('data-name'),
                    price: btn.getAttribute('data-price'),
                    image: btn.getAttribute('data-image')
                };

                // 填入資料到 Modal
                document.getElementById('modal-product-name').textContent = currentProduct.name;
                document.getElementById('modal-product-price').textContent = `NT$${currentProduct.price}`;
                document.getElementById('modal-product-img').src = currentProduct.image;
                
                // 重置數量
                document.getElementById('modal-quantity').value = 1;

                // 顯示視窗
                cartModal.show();
            }
        });

        // B. 數量加減按鈕
        const btnMinus = document.getElementById('btn-minus');
        const btnPlus = document.getElementById('btn-plus');
        const inputQty = document.getElementById('modal-quantity');

        if (btnMinus && btnPlus && inputQty) {
            btnPlus.addEventListener('click', () => {
                inputQty.value = parseInt(inputQty.value) + 1;
            });

            btnMinus.addEventListener('click', () => {
                if (parseInt(inputQty.value) > 1) {
                    inputQty.value = parseInt(inputQty.value) - 1;
                }
            });
        }

        // C. 確認加入按鈕
        const confirmBtn = document.getElementById('confirm-add-cart');
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                const quantity = parseInt(document.getElementById('modal-quantity').value);
                
                // --- 未來這裡會加入 localStorage 儲存邏輯 ---
                console.log(`[系統] 加入購物車: ${currentProduct.name} x ${quantity}`);

                // 關閉視窗
                cartModal.hide();

                // 顯示通知
                setTimeout(() => {
                    showToast(currentProduct.name, quantity);
                }, 300);
            });
        }
    }

    // D. 通知顯示函式 (Toast)
    function showToast(productName, quantity) {
        const toast = document.getElementById('cart-toast');
        const msg = document.getElementById('toast-message');
        
        if (toast && msg) {
            msg.textContent = `已將 ${quantity} 個「${productName}」加入購物車`;
            toast.classList.add('show');
            
            // 3秒後自動消失
            setTimeout(() => {
                toast.classList.remove('show');
            }, 3000);
        }
    }

    // ==========================================
    // 4. 登入頁密碼顯示切換
    // ==========================================
    const togglePasswordBtn = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');

    if (togglePasswordBtn && passwordInput) {
        togglePasswordBtn.addEventListener('click', function() {
            // 切換 type 屬性
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            // 切換圖示
            this.textContent = type === 'password' ? '👁️' : '🙈';
        });
    }

    // ==========================================
    // 5. 安全驗證碼邏輯 (Captcha System)
    // ==========================================
    const captchaDisplay = document.getElementById('captcha-code');
    const captchaInput = document.getElementById('captcha-input');
    const refreshBtn = document.getElementById('refresh-captcha');
    const loginForm = document.querySelector('#login_block form');

    // 隨機產生 4 位數驗證碼
    function generateCaptcha() {
        if (!captchaDisplay) return;
        
        const randomNum = Math.floor(Math.random() * 10000);
        const code = randomNum.toString().padStart(4, '0');
        
        captchaDisplay.innerText = code;
        captchaDisplay.setAttribute('data-code', code);
    }

    // 初始化
    generateCaptcha();

    // 點擊刷新按鈕
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            captchaDisplay.style.opacity = '0.5';
            setTimeout(() => {
                generateCaptcha();
                captchaDisplay.style.opacity = '1';
                captchaInput.value = '';
                captchaInput.focus();
            }, 200);
        });
    }

    // 攔截表單登入
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const userCode = captchaInput.value;
            const realCode = captchaDisplay.getAttribute('data-code');

            if (userCode !== realCode) {
                alert("⛔ 安全驗證失敗：驗證碼錯誤！");
                captchaInput.classList.add('is-invalid');
                captchaInput.value = '';
                generateCaptcha();
            } else {
                alert("✅ 身份驗證通過！正在進入系統...");
                // 這裡之後會接真正的登入跳轉
            }
        });
        
        captchaInput.addEventListener('input', () => {
            captchaInput.classList.remove('is-invalid');
        });
    }
});