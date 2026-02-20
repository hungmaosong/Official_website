// js/main.js

document.addEventListener("DOMContentLoaded", async () => {

    // ==========================================
    // 🔥 0. 全域資料庫判定引擎 (Sync with Python Backend)
    // ==========================================
    let appProducts = [];
    
    try {
        // 📞 打電話給 Python 餐廳 (API) 點餐
        console.log("連線至 Python 伺服器中...");
        const response = await fetch('http://localhost:8000/api/products');
        const data = await response.json();
        
        if (data.status === "success") {
            appProducts = data.data; // 把後端傳來的商品存起來！
            console.log("✅ 成功從 Python 後端取得商品資料！", appProducts);
        }
    } catch (error) {
        console.error("⚠️ 無法連線至後端伺服器，切換為本地備用資料庫...", error);
        // 備用方案：如果後端沒開，退回使用 LocalStorage 或 data.js
        if (localStorage.getItem('adminProducts')) {
            appProducts = JSON.parse(localStorage.getItem('adminProducts'));
        } else if (typeof productsData !== 'undefined') {
            appProducts = productsData;
        }
    }

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
    // 2. 商品列表渲染功能 (改讀取 appProducts)
    // ==========================================
    const productsContainer = document.getElementById("products-container");
    
    if (productsContainer) {
        
        if (appProducts.length === 0) {
            productsContainer.innerHTML = '<p class="text-white text-center">Data Error: 無商品資料</p>';
            return;
        }

        // --- 1. 取得網址上的參數 (加入搜尋參數) ---
        const urlParams = new URLSearchParams(window.location.search);
        const currentCategory = urlParams.get('category'); 
        const searchQuery = urlParams.get('search');       

        // --- 2. 篩選資料 ---
        let filteredProducts = appProducts;
        let categoryTitle = "全部商品 ALL PRODUCTS";

        // 定義分類名稱對照表 (用來顯示標題)
        const categoryMap = {
            'figure': '景品模型 FIGURE',
            'card': '稀有卡片 CARD',
            'clothes': '潮流服飾 APPAREL',
            'music': '音樂周邊 MUSIC GEAR',
            'other': '其他配件 OTHERS'
        };

        // 🔥 邏輯判斷：搜尋的優先權高於分類
        if (searchQuery) {
            const lowerKeyword = searchQuery.toLowerCase();
            filteredProducts = appProducts.filter(p => p.name.toLowerCase().includes(lowerKeyword));
            categoryTitle = `搜尋結果 SEARCH RESULTS`;
        } 
        else if (currentCategory && currentCategory !== 'all') {
            filteredProducts = appProducts.filter(p => p.category === currentCategory);
            if (categoryMap[currentCategory]) {
                categoryTitle = categoryMap[currentCategory];
            }
        }

        // --- 3. 更新頁面標題 (UX 優化) ---
        const pageTitleElement = document.querySelector('.section-title');
        if (pageTitleElement) {
            if (searchQuery) {
                pageTitleElement.innerHTML = `搜尋結果 <span class="highlight">"${searchQuery}"</span>`;
            } else {
                const parts = categoryTitle.split(' ');
                if (parts.length >= 2) {
                     pageTitleElement.innerHTML = `${parts[0]} <span class="highlight">${parts.slice(1).join(' ')}</span>`;
                } else {
                     pageTitleElement.innerText = categoryTitle;
                }
            }
        }

        // --- 4. 渲染邏輯 ---
        const itemsPerPage = 8;
        let currentPage = 1;

        function renderProducts(page) {
            productsContainer.innerHTML = "";
            
            const startIndex = (page - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const currentItems = filteredProducts.slice(startIndex, endIndex);

            if(currentItems.length === 0) {
                const emptyMessage = searchQuery ? `找不到包含「${searchQuery}」的商品` : '此分類目前沒有庫存';
                
                productsContainer.innerHTML = `
                    <div class="col-12 text-center" style="padding: 50px;">
                        <h3 class="text-muted" style="letter-spacing: 2px;">NO DATA FOUND</h3>
                        <p style="color: #64748b;">${emptyMessage}</p>
                        <a href="products.html" class="btn btn-outline-light mt-3">返回全部商品</a>
                    </div>`;
                const pagination = document.querySelector('.pagination-tech');
                if(pagination) pagination.style.display = 'none';
                return;
            } else {
                const pagination = document.querySelector('.pagination-tech');
                if(pagination) pagination.style.display = 'flex';
            }

            currentItems.forEach(product => {
                let stockHTML = '';
                let btnState = '';
                let btnText = '加入購物車';
                let btnClass = 'btn-primary';

                if (product.stock === 0) {
                    stockHTML = `<span class="stock-badge out-of-stock">庫存不足 OUT OF STOCK</span>`;
                    btnState = 'disabled';
                    btnText = '補貨中...';
                    btnClass = 'btn-secondary';
                } else if (product.stock <= 5) {
                    stockHTML = `<span class="stock-badge low-stock">剩餘庫存: ${product.stock} (稀有!)</span>`;
                } else {
                    stockHTML = `<span class="stock-badge normal-stock">庫存充足: ${product.stock}</span>`;
                }

                const productHTML = `
                    <div class="col-12 col-md-6 col-lg-3">
                        <div class="tech-card h-100 d-flex flex-column">
                            <div class="card-img-wrapper">
                                <img src="${product.image}" class="card-img-top" alt="${product.name}" onerror="this.src='../assets/images/logo.png'">
                                <div class="img-overlay"></div>
                            </div>
                            <div class="card-body-tech d-flex flex-column flex-grow-1">
                                <h5 class="card-title mb-1" style="color: #fff; font-weight: 600;">${product.name}</h5>
                                <div class="price-tag mb-2" style="color: var(--accent);">NT$${product.price}</div>
                                <div class="mb-3">${stockHTML}</div>
                                <div class="mt-auto d-grid gap-2">
                                    <button class="btn btn-outline-light btn-sm view-details-btn" data-id="${product.id}" style="border-radius: 50px;">查看詳情</button>
                                    <button class="btn ${btnClass} btn-sm add-to-cart" ${btnState}
                                        data-id="${product.id}" data-name="${product.name}"
                                        data-price="${product.price}" data-image="${product.image}" data-stock="${product.stock}"
                                        style="border-radius: 50px; border:none;">${btnText}</button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                productsContainer.insertAdjacentHTML('beforeend', productHTML);
            });

            updatePaginationButtons();
        }

        function updatePaginationButtons() {
            const prevBtn = document.getElementById('prev-page');
            const nextBtn = document.getElementById('next-page');
            const pageInfo = document.getElementById('page-info');

            if(prevBtn && nextBtn) {
                prevBtn.disabled = currentPage === 1;
                nextBtn.disabled = currentPage * itemsPerPage >= filteredProducts.length;
                if(pageInfo) pageInfo.innerText = `PAGE 0${currentPage}`;
            }
        }

        document.getElementById('prev-page')?.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderProducts(currentPage);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });

        document.getElementById('next-page')?.addEventListener('click', () => {
            if (currentPage * itemsPerPage < filteredProducts.length) {
                currentPage++;
                renderProducts(currentPage);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });

        renderProducts(currentPage);
    }

    // ==========================================
    // 3. 購物車互動功能 (Tech Modal & Toast)
    // ==========================================
    const cartModalEl = document.getElementById('cartModal');
    if (cartModalEl) {
        const cartModal = new bootstrap.Modal(cartModalEl);
        let currentProduct = {};

        document.addEventListener('click', function(e) {
            if (e.target && e.target.classList.contains('add-to-cart')) {
                
                const isUserLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
                if (!isUserLoggedIn) {
                    const confirmLogin = confirm("⚠️ 存取被拒：請先登入系統才能加入購物車。\n\n是否立即前往登入頁面？");
                    if (confirmLogin) {
                        const isInnerPage = window.location.pathname.includes('/pages/');
                        window.location.href = isInnerPage ? 'login.html' : 'pages/login.html';
                    }
                    return; 
                }

                const btn = e.target;
                currentProduct = {
                    id: btn.getAttribute('data-id'),
                    name: btn.getAttribute('data-name'),
                    price: parseInt(btn.getAttribute('data-price')),
                    image: btn.getAttribute('data-image'),
                    stock: parseInt(btn.getAttribute('data-stock')) 
                };

                document.getElementById('modal-product-name').textContent = currentProduct.name;
                document.getElementById('modal-product-price').textContent = `NT$${currentProduct.price}`;
                document.getElementById('modal-product-img').src = currentProduct.image;
                document.getElementById('modal-quantity').value = 1;

                cartModal.show();
            }
        });

        const btnMinus = document.getElementById('btn-minus');
        const btnPlus = document.getElementById('btn-plus');
        const inputQty = document.getElementById('modal-quantity');

        if (btnMinus && btnPlus && inputQty) {
            btnPlus.onclick = () => {
                if (parseInt(inputQty.value) < currentProduct.stock) {
                    inputQty.value = parseInt(inputQty.value) + 1;
                } else {
                    alert(`⚠️ 庫存不足：此商品目前僅剩 ${currentProduct.stock} 個！`);
                }
            };

            btnMinus.onclick = () => {
                if (parseInt(inputQty.value) > 1) {
                    inputQty.value = parseInt(inputQty.value) - 1;
                }
            };

            inputQty.onchange = () => {
                let currentVal = parseInt(inputQty.value);
                if (isNaN(currentVal) || currentVal < 1) {
                    inputQty.value = 1;
                }
                if (currentVal > currentProduct.stock) {
                    alert(`⚠️ 庫存警報：您輸入的數量 (${currentVal}) 已超出目前庫存上限！系統將自動調整為最大可購買數量：${currentProduct.stock} 個。`);
                    inputQty.value = currentProduct.stock;
                }
            };
        }

        const confirmBtn = document.getElementById('confirm-add-cart');
        if (confirmBtn) {
            confirmBtn.onclick = () => {
                const quantity = parseInt(document.getElementById('modal-quantity').value);
                
                let cart = JSON.parse(localStorage.getItem('techCart')) || [];
                const existingItemIndex = cart.findIndex(item => item.id === currentProduct.id);
                
                if (existingItemIndex > -1) {
                    let newQty = cart[existingItemIndex].quantity + quantity;
                    if (newQty > currentProduct.stock) {
                        alert(`⚠️ 商品庫存不足！您的購物車內已有 ${cart[existingItemIndex].quantity} 個，加上本次數量會超過庫存上限 (${currentProduct.stock})。`);
                        return; 
                    }
                    cart[existingItemIndex].quantity = newQty;
                } else {
                    cart.push({
                        id: currentProduct.id,
                        name: currentProduct.name,
                        price: currentProduct.price,
                        image: currentProduct.image,
                        quantity: quantity,
                        stock: currentProduct.stock 
                    });
                }
                
                localStorage.setItem('techCart', JSON.stringify(cart));
                cartModal.hide();

                setTimeout(() => {
                    showToast(currentProduct.name, quantity);
                }, 300);
            };
        }
    }

    function showToast(productName, quantity) {
        const toast = document.getElementById('cart-toast');
        const msg = document.getElementById('toast-message');
        
        if (toast && msg) {
            msg.textContent = `已將 ${quantity} 個「${productName}」加入購物車`;
            toast.classList.add('show');
            setTimeout(() => {
                toast.classList.remove('show');
            }, 3000);
        }
    }

    // ==========================================
    // 9. 購物車頁面渲染邏輯 (Cart Rendering)
    // ==========================================
    const cartItemsContainer = document.getElementById('cart_items');
    const totalPriceElement = document.getElementById('total_price');

    if (cartItemsContainer && totalPriceElement) {
        
        function renderCart() {
            let cart = JSON.parse(localStorage.getItem('techCart')) || [];
            cartItemsContainer.innerHTML = ''; 
            let total = 0; 

            if (cart.length === 0) {
                cartItemsContainer.innerHTML = `
                    <tr>
                        <td colspan="5" class="text-center empty-cart-msg">
                            <div class="py-5">
                                <div style="font-size: 3rem; color: rgba(6, 182, 212, 0.3); margin-bottom: 10px;">📦</div>
                                <p>您的購物車目前是空的</p>
                                <a href="products.html" class="btn btn-outline-tech mt-2">前往裝備庫</a>
                            </div>
                        </td>
                    </tr>
                `;
                totalPriceElement.innerText = `NT$0`;
                return;
            }

            cart.forEach((item, index) => {
                const subtotal = item.price * item.quantity; 
                total += subtotal; 

                const tr = document.createElement('tr');
                tr.className = 'cart-item-row';
                tr.innerHTML = `
                    <td>
                        <div class="d-flex align-items-center gap-3">
                            <div class="cart-img-box">
                                <img src="${item.image}" alt="${item.name}" onerror="this.src='../assets/images/logo.png'">
                            </div>
                            <span class="fw-bold text-white">${item.name}</span>
                        </div>
                    </td>
                    <td class="tech-text">NT$${item.price}</td>
                    <td class="tech-text">${item.quantity}</td>
                    <td class="tech-text highlight-text">NT$${subtotal}</td>
                    <td>
                        <div class="d-flex gap-2">
                            <button class="btn btn-outline-secondary btn-sm minus-item-btn" data-index="${index}" style="width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-weight: bold;">-</button>
                            <button class="btn btn-outline-info btn-sm plus-item-btn" data-index="${index}" style="width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-weight: bold;">+</button>
                        </div>
                    </td>
                `;
                cartItemsContainer.appendChild(tr);
            });

            totalPriceElement.innerText = `NT$${total}`;

            document.querySelectorAll('.plus-item-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const itemIndex = this.getAttribute('data-index');
                    updateCartQuantity(itemIndex, 1);
                });
            });

            document.querySelectorAll('.minus-item-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const itemIndex = this.getAttribute('data-index');
                    updateCartQuantity(itemIndex, -1);
                });
            });
        }

        function updateCartQuantity(index, change) {
            let cart = JSON.parse(localStorage.getItem('techCart')) || [];
            
            if (cart[index]) {
                let newQty = cart[index].quantity + change;

                if (change > 0 && newQty > cart[index].stock) {
                    alert(`⚠️ 資源不足：此商品的庫存上限為 ${cart[index].stock} 個！`);
                    return; 
                }

                cart[index].quantity = newQty;

                if (cart[index].quantity <= 0) {
                    if(confirm("⚠ 數量已為 0，是否將此商品從購物車移除？")) {
                        cart.splice(index, 1); 
                    } else {
                        cart[index].quantity = 1; 
                    }
                }
                
                localStorage.setItem('techCart', JSON.stringify(cart));
                renderCart(); 
            }
        }

        renderCart();
    } 

    // ==========================================
    // 🔥 10. 查看商品詳情 (Gallery Modal) - 讀取 appProducts
    // ==========================================
    document.addEventListener('click', function(e) {
        if (e.target && e.target.classList.contains('view-details-btn')) {
            const productId = e.target.getAttribute('data-id');
            
            // 使用字串比對，相容 Date.now() 產生的 ID
            const product = appProducts.find(p => p.id.toString() === productId);

            if (product) {
                document.getElementById('detail-modal-title').textContent = product.name;
                document.getElementById('detail-modal-price').textContent = `NT$${product.price}`;

                let images = [product.image];
                if (product.gallery && product.gallery.length > 0) {
                    images = images.concat(product.gallery);
                }

                const carouselContainer = document.getElementById('carousel-inner-container');
                carouselContainer.innerHTML = ''; 

                images.forEach((imgSrc, index) => {
                    const activeClass = index === 0 ? 'active' : ''; 
                    carouselContainer.innerHTML += `
                        <div class="carousel-item ${activeClass}">
                            <div style="background: #000; display:flex; justify-content:center; align-items:center; height: 400px; border-radius: 8px; overflow: hidden;">
                                <img src="${imgSrc}" style="max-height: 100%; max-width: 100%; object-fit: contain;" alt="${product.name}" onerror="this.src='../assets/images/logo.png'">
                            </div>
                        </div>
                    `;
                });

                const prevBtn = document.querySelector('.carousel-control-prev');
                const nextBtn = document.querySelector('.carousel-control-next');
                if (images.length > 1) {
                    prevBtn.style.display = 'flex';
                    nextBtn.style.display = 'flex';
                } else {
                    prevBtn.style.display = 'none';
                    nextBtn.style.display = 'none';
                }

                const detailAddCartBtn = document.getElementById('detail-modal-add-cart');
                
                detailAddCartBtn.className = `btn ${product.stock === 0 ? 'btn-secondary' : 'btn-primary'} px-4 add-to-cart`;
                detailAddCartBtn.disabled = product.stock === 0;
                detailAddCartBtn.textContent = product.stock === 0 ? '補貨中...' : '加入購物車';
                
                detailAddCartBtn.setAttribute('data-id', product.id);
                detailAddCartBtn.setAttribute('data-name', product.name);
                detailAddCartBtn.setAttribute('data-price', product.price);
                detailAddCartBtn.setAttribute('data-image', product.image);
                detailAddCartBtn.setAttribute('data-stock', product.stock);

                detailAddCartBtn.onclick = function() {
                    const detailModal = bootstrap.Modal.getInstance(document.getElementById('productDetailModal'));
                    if(detailModal) detailModal.hide();
                };

                const modal = new bootstrap.Modal(document.getElementById('productDetailModal'));
                modal.show();
            }
        }
    });

    // ==========================================
    // 11. 首頁動態儀表板 - 讀取 appProducts 並處理 Base64
    // ==========================================
    const newArrivalsList = document.getElementById('new-arrivals-list');
    const highStockList = document.getElementById('high-stock-list');
    const rareItemsList = document.getElementById('rare-items-list');

    if (newArrivalsList && highStockList && rareItemsList && appProducts.length > 0) {
        
        const isInnerPage = window.location.pathname.includes('/pages/');
        const linkPrefix = isInnerPage ? 'products.html' : 'pages/products.html';

        function createMiniCard(product, extraInfo, isAlert = false) {
            // 自動判斷是否為 Base64 (data:image)，如果是就不改變路徑
            const isBase64 = product.image.startsWith('data:image');
            let safeImgSrc = product.image;
            if(!isBase64) {
                safeImgSrc = isInnerPage ? product.image : product.image.replace('../', './');
            }

            const targetLink = `${linkPrefix}?search=${encodeURIComponent(product.name)}`;
            const themeColor = isAlert ? '#ef4444' : 'var(--accent)';
            const hoverBg = isAlert ? 'rgba(239, 68, 68, 0.1)' : 'rgba(6, 182, 212, 0.1)';

            return `
                <div class="d-flex align-items-center p-2 rounded mini-dashboard-card" 
                     style="background: rgba(255,255,255,0.03); border: 1px solid transparent; cursor: pointer; transition: all 0.3s;"
                     onclick="window.location.href='${targetLink}'"
                     onmouseover="this.style.background='${hoverBg}'; this.style.borderColor='${themeColor}';"
                     onmouseout="this.style.background='rgba(255,255,255,0.03)'; this.style.borderColor='transparent';">
                    
                    <img src="${safeImgSrc}" style="width: 48px; height: 48px; object-fit: cover; border-radius: 6px; margin-right: 15px; border: 1px solid rgba(255,255,255,0.1);" onerror="this.src='${isInnerPage?'../assets/images/logo.png':'./assets/images/logo.png'}'">
                    
                    <div class="flex-grow-1">
                        <h6 class="mb-1 text-white" style="font-size: 0.95rem; font-weight: 600;">${product.name}</h6>
                        <small style="color: ${themeColor}; font-size: 0.8rem;">${extraInfo}</small>
                    </div>
                    
                    <div style="font-weight: bold; font-family: var(--font-title); color: #f8fafc;">
                        NT$${product.price}
                    </div>
                </div>
            `;
        }

        const newestProducts = [...appProducts].reverse().slice(0, 3);
        newArrivalsList.innerHTML = newestProducts.map(p => createMiniCard(p, `庫存: ${p.stock}`)).join('');

        const highStockProducts = [...appProducts].sort((a, b) => b.stock - a.stock).slice(0, 3);
        highStockList.innerHTML = highStockProducts.map(p => createMiniCard(p, `補給充足: ${p.stock} 件`)).join('');

        const rareProducts = [...appProducts].filter(p => p.stock > 0).sort((a, b) => a.stock - b.stock).slice(0, 3);
        rareItemsList.innerHTML = rareProducts.map(p => createMiniCard(p, `⚠ 存量告急：僅剩 ${p.stock} 件！`, true)).join('');
    }

}); // 整個 DOMContentLoaded 結束


// ==========================================
// 12. 會員註冊系統 (Registration Logic)
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('register-form');
    
    if (registerForm) {
        const toggleRegPasswordBtn = document.getElementById('toggleRegPassword');
        const regPasswordInput = document.getElementById('reg-password');
        if (toggleRegPasswordBtn && regPasswordInput) {
            toggleRegPasswordBtn.addEventListener('click', function() {
                const type = regPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
                regPasswordInput.setAttribute('type', type);
                this.textContent = type === 'password' ? '👁️' : '🙈';
            });
        }

        const toggleRegPasswordConfirmBtn = document.getElementById('toggleRegPasswordConfirm');
        const regPasswordConfirmInput = document.getElementById('reg-password-confirm');
        if (toggleRegPasswordConfirmBtn && regPasswordConfirmInput) {
            toggleRegPasswordConfirmBtn.addEventListener('click', function() {
                const type = regPasswordConfirmInput.getAttribute('type') === 'password' ? 'text' : 'password';
                regPasswordConfirmInput.setAttribute('type', type);
                this.textContent = type === 'password' ? '👁️' : '🙈';
            });
        }

        registerForm.addEventListener('submit', function(e) {
            e.preventDefault(); 

            const name = document.getElementById('reg-name').value.trim(); 
            const username = document.getElementById('reg-username').value.trim();
            const password = document.getElementById('reg-password').value;
            const confirmPassword = document.getElementById('reg-password-confirm').value; 
            const phone = document.getElementById('reg-phone').value.trim();
            const email = document.getElementById('reg-email').value.trim();
            const store = document.getElementById('reg-store').value;

            if (password !== confirmPassword) {
                alert("⚠️ 權限申請失敗：兩次輸入的密碼不一致，請重新確認！");
                document.getElementById('reg-password-confirm').focus(); 
                return; 
            }

            let usersDB = JSON.parse(localStorage.getItem('usersDatabase')) || [];

            const isUserExist = usersDB.some(user => user.username === username);
            if (isUserExist) {
                alert("⚠️ 權限申請失敗：此登入代號 (帳號) 已被其他人使用，請更換一個！");
                document.getElementById('reg-username').focus();
                return; 
            }

            const newUser = {
                name: name,         
                username: username,
                password: password, 
                phone: phone,
                email: email,
                store_711: store,
                registerTime: new Date().toLocaleString()
            };

            usersDB.push(newUser);
            localStorage.setItem('usersDatabase', JSON.stringify(usersDB));

            alert(`✅ 存取權限建立成功！\n歡迎特務 [ ${name} ] 加入 KCG 君王卡牌研究室。\n\n系統將自動引導您前往登入...`);
            window.location.href = 'login.html'; 
        });
    }
});

// ==========================================
// 13. 會員登入系統 (Login Logic) 
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    
    if (loginForm) {
        const captchaDisplay = document.getElementById('captcha-code');
        const captchaInput = document.getElementById('captcha-input');
        const refreshBtn = document.getElementById('refresh-captcha');

        function generateCaptcha() {
            if (!captchaDisplay) return;
            const randomNum = Math.floor(Math.random() * 10000);
            const code = randomNum.toString().padStart(4, '0');
            captchaDisplay.innerText = code;
            captchaDisplay.setAttribute('data-code', code);
        }

        generateCaptcha();

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

        if (captchaInput) {
            captchaInput.addEventListener('input', () => {
                captchaInput.classList.remove('is-invalid');
            });
        }

        const togglePasswordBtn = document.getElementById('togglePassword');
        const passwordInput = document.getElementById('password');
        if (togglePasswordBtn && passwordInput) {
            togglePasswordBtn.addEventListener('click', function() {
                const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
                passwordInput.setAttribute('type', type);
                this.textContent = type === 'password' ? '👁️' : '🙈';
            });
        }

        loginForm.addEventListener('submit', function(e) {
            e.preventDefault(); 

            const usernameInput = document.getElementById('username');
            
            const userVal = usernameInput.value.trim();
            const passVal = passwordInput.value;
            const capVal = captchaInput.value.trim();
            const currentCaptcha = captchaDisplay ? captchaDisplay.getAttribute('data-code') : '';

            if (capVal !== currentCaptcha) {
                alert("⛔ 安全驗證失敗：驗證碼錯誤！");
                captchaInput.classList.add('is-invalid');
                captchaInput.value = '';
                captchaInput.focus();
                generateCaptcha(); 
                return; 
            }

            let usersDB = JSON.parse(localStorage.getItem('usersDatabase')) || [];
            const foundUser = usersDB.find(user => user.username === userVal);
            
            const isAdmin = (userVal === 'admin' && passVal === '123456');

            if (isAdmin) {
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('username', 'admin');
                localStorage.setItem('name', 'ADMIN');
                alert("✅ 身份驗證通過！歡迎 [ ADMIN ] 進入系統...");
                window.location.href = '../index.html';
                return;
            }

            if (!foundUser) {
                alert("⛔ 存取被拒：此登入代號 (帳號) 不存在！\n如果您還沒有權限，請點擊下方「註冊新身份」。");
                usernameInput.focus(); 
                passwordInput.value = ''; 
                captchaInput.value = '';  
                generateCaptcha();
                return;
            }

            if (foundUser.password !== passVal) {
                alert("⛔ 存取被拒：密碼輸入錯誤，請重新確認！");
                passwordInput.value = ''; 
                passwordInput.focus();
                captchaInput.value = '';  
                generateCaptcha();
                return;
            }

            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('username', foundUser.username);
            localStorage.setItem('name', foundUser.name);      
            localStorage.setItem('userStore', foundUser.store_711); 

            alert(`✅ 身份驗證通過！歡迎特務 [ ${foundUser.name} ] 進入系統...`);
            window.location.href = '../index.html';
        });
    }
});

// ==========================================
// 14. 結帳頁面邏輯 (Checkout Logic)
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    const checkoutForm = document.getElementById('checkout-form');

    if (checkoutForm) {
        console.log("✅ 結帳系統已連線！");

        const isUserLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        let cart = JSON.parse(localStorage.getItem('techCart')) || [];

        if (!isUserLoggedIn) {
            alert("⚠️ 存取被拒：請先完成身份驗證才能進行結帳！");
            window.location.href = 'login.html';
            return;
        }

        if (cart.length === 0) {
            alert("⚠️ 購物清單為空，無法發送訂單！請先挑選商品。");
            window.location.href = 'products.html';
            return;
        }

        const currentUsername = localStorage.getItem('username');
        let usersDB = JSON.parse(localStorage.getItem('usersDatabase')) || [];
        const currentUser = usersDB.find(user => user.username === currentUsername);

        if (currentUser) {
            document.getElementById('checkout-name').value = currentUser.name || currentUsername;
            document.getElementById('checkout-phone').value = currentUser.phone || '無資料';
            document.getElementById('checkout-email').value = currentUser.email || '無資料';
            document.getElementById('checkout-store').value = currentUser.store_711 || localStorage.getItem('userStore') || '未選擇門市';
        } else if (currentUsername === 'admin') {
            document.getElementById('checkout-name').value = '最高管理員 ADMIN';
            document.getElementById('checkout-phone').value = '0900-000-000';
            document.getElementById('checkout-email').value = 'admin@kcg.com';
            document.getElementById('checkout-store').value = 'KCG 總部直屬門市';
        }

        const checkoutItemsContainer = document.getElementById('checkout-items');
        const checkoutTotalElement = document.getElementById('checkout-total');
        let total = 0;

        checkoutItemsContainer.innerHTML = '';
        cart.forEach(item => {
            const subtotal = item.price * item.quantity;
            total += subtotal;

            checkoutItemsContainer.innerHTML += `
                <div class="d-flex align-items-center mb-3 pb-3" style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                    <img src="${item.image}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px; border: 1px solid rgba(6, 182, 212, 0.3); margin-right: 15px;" onerror="this.src='../assets/images/logo.png'">
                    <div class="flex-grow-1">
                        <h6 style="color: #fff; margin: 0 0 5px 0; font-size: 0.95rem;">${item.name}</h6>
                        <small style="color: #94a3b8; font-family: var(--font-title);">NT$${item.price} x ${item.quantity}</small>
                    </div>
                    <div style="color: var(--accent); font-weight: bold; font-family: var(--font-title);">
                        NT$${subtotal}
                    </div>
                </div>
            `;
        });
        
        checkoutTotalElement.innerText = `NT$${total}`;

        checkoutForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const orderNumber = 'KCG' + Date.now().toString().slice(-6) + Math.floor(Math.random() * 1000);

            alert(`🎉 訂單發送成功！\n\n📄 訂單編號：${orderNumber}\n💰 總金額：NT$${total}\n\n商品將盡速配送至您的取貨門市，請留意簡訊通知。`);

            localStorage.removeItem('techCart');
            window.location.href = '../index.html';
        });
    }
});

// ==========================================
// 15. 忘記密碼系統 (Forgot Password Logic) - 防重疊版
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    const forgotPwdForm = document.getElementById('forgot-password-form');
    
    if (forgotPwdForm) {
        console.log("✅ 忘記密碼系統大腦已連線！(防重疊模式啟動)");

        const sendCodeBtn = document.getElementById('send-code-btn');
        const forgotUsername = document.getElementById('forgot-username');
        const forgotEmail = document.getElementById('forgot-email');
        const forgotCode = document.getElementById('forgot-code');
        const newPwd = document.getElementById('forgot-new-password');
        const confirmPwd = document.getElementById('forgot-confirm-password');
        const submitBtn = document.getElementById('reset-password-submit');
        
        const toggleNewPwdBtn = document.getElementById('toggleForgotNewPwd');
        const toggleConfirmPwdBtn = document.getElementById('toggleForgotConfirmPwd');

        let generatedCode = ""; 
        let timer = null;       

        sendCodeBtn.onclick = function() {
            const userVal = forgotUsername.value.trim();
            const emailVal = forgotEmail.value.trim();

            if (!userVal || !emailVal) {
                alert("⚠️ 請先輸入帳號與註冊時的電子信箱！");
                return;
            }

            let usersDB = JSON.parse(localStorage.getItem('usersDatabase')) || [];
            const targetUser = usersDB.find(user => user.username === userVal && user.email === emailVal);

            if (!targetUser) {
                alert("⛔ 查無此人：帳號或電子信箱不正確，請重新確認！");
                return;
            }

            generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
            
            alert(`📧 【系統模擬發信】\n\n已發送驗證碼至：${emailVal}\n\n您的驗證碼為：${generatedCode}\n(請將此代碼填入下方驗證碼欄位)`);

            forgotCode.disabled = false;
            newPwd.disabled = false;
            confirmPwd.disabled = false;
            submitBtn.disabled = false;
            toggleNewPwdBtn.disabled = false;
            toggleConfirmPwdBtn.disabled = false;
            
            sendCodeBtn.disabled = true; 
            let countdown = 60;
            sendCodeBtn.textContent = `已發送 (${countdown}s)`;

            if(timer) clearInterval(timer);

            timer = setInterval(() => {
                countdown--;
                if (countdown > 0) {
                    sendCodeBtn.textContent = `已發送 (${countdown}s)`;
                } else {
                    clearInterval(timer);
                    sendCodeBtn.disabled = false;
                    sendCodeBtn.textContent = "重寄驗證碼";
                }
            }, 1000);
        };

        toggleNewPwdBtn.onclick = function() {
            const type = newPwd.getAttribute('type') === 'password' ? 'text' : 'password';
            newPwd.setAttribute('type', type);
            this.textContent = type === 'password' ? '👁️' : '🙈';
        };

        toggleConfirmPwdBtn.onclick = function() {
            const type = confirmPwd.getAttribute('type') === 'password' ? 'text' : 'password';
            confirmPwd.setAttribute('type', type);
            this.textContent = type === 'password' ? '👁️' : '🙈';
        };

        forgotPwdForm.onsubmit = function(e) {
            e.preventDefault();

            if (forgotCode.value.trim() !== generatedCode) {
                alert("⛔ 驗證碼錯誤或已失效，請重新輸入！");
                forgotCode.focus();
                return;
            }

            if (newPwd.value !== confirmPwd.value) {
                alert("⚠️ 兩次輸入的新密碼不一致，請重新確認！");
                confirmPwd.focus();
                return;
            }

            let usersDB = JSON.parse(localStorage.getItem('usersDatabase')) || [];
            const userIndex = usersDB.findIndex(user => user.username === forgotUsername.value.trim());

            if (userIndex > -1) {
                usersDB[userIndex].password = newPwd.value;
                localStorage.setItem('usersDatabase', JSON.stringify(usersDB));

                alert("🎉 密碼重置成功！\n請使用您的新密碼重新登入系統。");
                
                const modal = bootstrap.Modal.getInstance(document.getElementById('forgotPasswordModal'));
                if (modal) modal.hide();
                window.location.reload();
            } else {
                alert("⛔ 系統錯誤：找不到該用戶資料。");
            }
        };
    }
});