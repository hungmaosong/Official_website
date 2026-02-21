// frontend/js/main.js

document.addEventListener('DOMContentLoaded', async () => {
  // ==========================================
  // 🔥 0. 全域資料庫判定引擎 (Sync with Python Backend)
  // ==========================================
  let appProducts = [];

  try {
    console.log('連線至 Python 伺服器中...');
    const response = await fetch('https://kcg-api.onrender.com/api/products');
    const data = await response.json();

    if (data.status === 'success') {
      appProducts = data.data;
      console.log('✅ 成功從 Python 後端取得商品資料！', appProducts);
    }
  } catch (error) {
    console.error('⚠️ 無法連線至後端伺服器，切換為本地備用資料庫...', error);
    if (localStorage.getItem('adminProducts')) {
      appProducts = JSON.parse(localStorage.getItem('adminProducts'));
    } else if (typeof productsData !== 'undefined') {
      appProducts = productsData;
    }
  }

  // ==========================================
  // 1. 輪播圖功能
  // ==========================================
  var myCarousel = document.querySelector('#carouselExampleIndicators');
  if (myCarousel) {
    new bootstrap.Carousel(myCarousel, { interval: 3000, ride: 'carousel' });
  }

  // ==========================================
  // 2. 商品列表渲染功能
  // ==========================================
  const productsContainer = document.getElementById('products-container');

  if (productsContainer) {
    if (appProducts.length === 0) {
      productsContainer.innerHTML =
        '<p class="text-white text-center">Data Error: 無商品資料</p>';
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const currentCategory = urlParams.get('category');
    const searchQuery = urlParams.get('search');

    let filteredProducts = appProducts;
    let categoryTitle = '全部商品 ALL PRODUCTS';

    const categoryMap = {
      figure: '景品模型 FIGURE',
      card: '稀有卡片 CARD',
      clothes: '潮流服飾 APPAREL',
      music: '音樂周邊 MUSIC GEAR',
      other: '其他配件 OTHERS',
    };

    if (searchQuery) {
      const lowerKeyword = searchQuery.toLowerCase();
      filteredProducts = appProducts.filter((p) =>
        p.name.toLowerCase().includes(lowerKeyword),
      );
      categoryTitle = `搜尋結果 SEARCH RESULTS`;
    } else if (currentCategory && currentCategory !== 'all') {
      filteredProducts = appProducts.filter(
        (p) => p.category === currentCategory,
      );
      if (categoryMap[currentCategory])
        categoryTitle = categoryMap[currentCategory];
    }

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

    const itemsPerPage = 8;
    let currentPage = 1;

    function renderProducts(page) {
      productsContainer.innerHTML = '';
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const currentItems = filteredProducts.slice(startIndex, endIndex);

      if (currentItems.length === 0) {
        const emptyMessage = searchQuery
          ? `找不到包含「${searchQuery}」的商品`
          : '此分類目前沒有庫存';
        productsContainer.innerHTML = `
                    <div class="col-12 text-center" style="padding: 50px;">
                        <h3 class="text-muted" style="letter-spacing: 2px;">NO DATA FOUND</h3>
                        <p style="color: #64748b;">${emptyMessage}</p>
                        <a href="products.html" class="btn btn-outline-light mt-3">返回全部商品</a>
                    </div>`;
        const pagination = document.querySelector('.pagination-tech');
        if (pagination) pagination.style.display = 'none';
        return;
      } else {
        const pagination = document.querySelector('.pagination-tech');
        if (pagination) pagination.style.display = 'flex';
      }

      currentItems.forEach((product) => {
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

      if (prevBtn && nextBtn) {
        prevBtn.disabled = currentPage === 1;
        nextBtn.disabled =
          currentPage * itemsPerPage >= filteredProducts.length;
        if (pageInfo) pageInfo.innerText = `PAGE 0${currentPage}`;
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
  // 3. 購物車互動功能
  // ==========================================
  const cartModalEl = document.getElementById('cartModal');
  if (cartModalEl) {
    const cartModal = new bootstrap.Modal(cartModalEl);
    let currentProduct = {};

    document.addEventListener('click', function (e) {
      if (e.target && e.target.classList.contains('add-to-cart')) {
        const isUserLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        if (!isUserLoggedIn) {
          const confirmLogin = confirm(
            '⚠️ 存取被拒：請先登入系統才能加入購物車。\n\n是否立即前往登入頁面？',
          );
          if (confirmLogin) {
            const isInnerPage = window.location.pathname.includes('/pages/');
            window.location.href = isInnerPage
              ? 'login.html'
              : 'pages/login.html';
          }
          return;
        }

        const btn = e.target;
        currentProduct = {
          id: btn.getAttribute('data-id'),
          name: btn.getAttribute('data-name'),
          price: parseInt(btn.getAttribute('data-price')),
          image: btn.getAttribute('data-image'),
          stock: parseInt(btn.getAttribute('data-stock')),
        };

        document.getElementById('modal-product-name').textContent =
          currentProduct.name;
        document.getElementById('modal-product-price').textContent =
          `NT$${currentProduct.price}`;
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
          alert(
            `⚠️ 庫存警報：您輸入的數量 (${currentVal}) 已超出目前庫存上限！系統將自動調整為最大可購買數量：${currentProduct.stock} 個。`,
          );
          inputQty.value = currentProduct.stock;
        }
      };
    }

    const confirmBtn = document.getElementById('confirm-add-cart');
    if (confirmBtn) {
      confirmBtn.onclick = () => {
        const quantity = parseInt(
          document.getElementById('modal-quantity').value,
        );
        let cart = JSON.parse(localStorage.getItem('techCart')) || [];
        const existingItemIndex = cart.findIndex(
          (item) => item.id === currentProduct.id,
        );

        if (existingItemIndex > -1) {
          let newQty = cart[existingItemIndex].quantity + quantity;
          if (newQty > currentProduct.stock) {
            alert(
              `⚠️ 商品庫存不足！您的購物車內已有 ${cart[existingItemIndex].quantity} 個，加上本次數量會超過庫存上限 (${currentProduct.stock})。`,
            );
            return;
          }
          cart[existingItemIndex].quantity = newQty;
        } else {
          cart.push({ ...currentProduct, quantity: quantity });
        }

        localStorage.setItem('techCart', JSON.stringify(cart));
        cartModal.hide();

        setTimeout(() => showToast(currentProduct.name, quantity), 300);
      };
    }
  }

  function showToast(productName, quantity) {
    const toast = document.getElementById('cart-toast');
    const msg = document.getElementById('toast-message');
    if (toast && msg) {
      msg.textContent = `已將 ${quantity} 個「${productName}」加入購物車`;
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 3000);
    }
  }

  // ==========================================
  // 9. 購物車頁面渲染邏輯
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

      document.querySelectorAll('.plus-item-btn').forEach((btn) => {
        btn.addEventListener('click', function () {
          updateCartQuantity(this.getAttribute('data-index'), 1);
        });
      });

      document.querySelectorAll('.minus-item-btn').forEach((btn) => {
        btn.addEventListener('click', function () {
          updateCartQuantity(this.getAttribute('data-index'), -1);
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
          if (confirm('⚠ 數量已為 0，是否將此商品從購物車移除？')) {
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
  // 10. 查看商品詳情 (Gallery Modal)
  // ==========================================
  document.addEventListener('click', function (e) {
    if (e.target && e.target.classList.contains('view-details-btn')) {
      const productId = e.target.getAttribute('data-id');
      const product = appProducts.find((p) => p.id.toString() === productId);

      if (product) {
        document.getElementById('detail-modal-title').textContent =
          product.name;
        document.getElementById('detail-modal-price').textContent =
          `NT$${product.price}`;

        let images = [product.image];
        if (product.gallery && product.gallery.length > 0) {
          images = images.concat(product.gallery);
        }

        const carouselContainer = document.getElementById(
          'carousel-inner-container',
        );
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

        const detailAddCartBtn = document.getElementById(
          'detail-modal-add-cart',
        );
        detailAddCartBtn.className = `btn ${product.stock === 0 ? 'btn-secondary' : 'btn-primary'} px-4 add-to-cart`;
        detailAddCartBtn.disabled = product.stock === 0;
        detailAddCartBtn.textContent =
          product.stock === 0 ? '補貨中...' : '加入購物車';

        detailAddCartBtn.setAttribute('data-id', product.id);
        detailAddCartBtn.setAttribute('data-name', product.name);
        detailAddCartBtn.setAttribute('data-price', product.price);
        detailAddCartBtn.setAttribute('data-image', product.image);
        detailAddCartBtn.setAttribute('data-stock', product.stock);

        detailAddCartBtn.onclick = function () {
          const detailModal = bootstrap.Modal.getInstance(
            document.getElementById('productDetailModal'),
          );
          if (detailModal) detailModal.hide();
        };

        const modal = new bootstrap.Modal(
          document.getElementById('productDetailModal'),
        );
        modal.show();
      }
    }
  });

  // ==========================================
  // 11. 首頁動態儀表板
  // ==========================================
  const newArrivalsList = document.getElementById('new-arrivals-list');
  const highStockList = document.getElementById('high-stock-list');
  const rareItemsList = document.getElementById('rare-items-list');

  if (
    newArrivalsList &&
    highStockList &&
    rareItemsList &&
    appProducts.length > 0
  ) {
    const isInnerPage = window.location.pathname.includes('/pages/');
    const linkPrefix = isInnerPage ? 'products.html' : 'pages/products.html';

    function createMiniCard(product, extraInfo, isAlert = false) {
      const isBase64 = product.image.startsWith('data:image');
      let safeImgSrc = product.image;
      if (!isBase64) {
        safeImgSrc = isInnerPage
          ? product.image
          : product.image.replace('../', './');
      }

      const targetLink = `${linkPrefix}?search=${encodeURIComponent(product.name)}`;
      const themeColor = isAlert ? '#ef4444' : 'var(--accent)';
      const hoverBg = isAlert
        ? 'rgba(239, 68, 68, 0.1)'
        : 'rgba(6, 182, 212, 0.1)';

      return `
                <div class="d-flex align-items-center p-2 rounded mini-dashboard-card" 
                     style="background: rgba(255,255,255,0.03); border: 1px solid transparent; cursor: pointer; transition: all 0.3s;"
                     onclick="window.location.href='${targetLink}'"
                     onmouseover="this.style.background='${hoverBg}'; this.style.borderColor='${themeColor}';"
                     onmouseout="this.style.background='rgba(255,255,255,0.03)'; this.style.borderColor='transparent';">
                    
                    <img src="${safeImgSrc}" style="width: 48px; height: 48px; object-fit: cover; border-radius: 6px; margin-right: 15px; border: 1px solid rgba(255,255,255,0.1);" onerror="this.src='${isInnerPage ? '../assets/images/logo.png' : './assets/images/logo.png'}'">
                    
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
    newArrivalsList.innerHTML = newestProducts
      .map((p) => createMiniCard(p, `庫存: ${p.stock}`))
      .join('');

    const highStockProducts = [...appProducts]
      .sort((a, b) => b.stock - a.stock)
      .slice(0, 3);
    highStockList.innerHTML = highStockProducts
      .map((p) => createMiniCard(p, `補給充足: ${p.stock} 件`))
      .join('');

    // 🔥 修正：加入嚴格條件，庫存必須大於 0 且「小於等於 5」才算告急
    const rareProducts = [...appProducts]
      .filter((p) => p.stock > 0 && p.stock <= 5)
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 3);

    // 如果有低庫存商品才渲染，沒有的話就顯示安全提示
    if (rareProducts.length > 0) {
      rareItemsList.innerHTML = rareProducts
        .map((p) => createMiniCard(p, `⚠ 存量告急：僅剩 ${p.stock} 件！`, true))
        .join('');
    } else {
      rareItemsList.innerHTML = `
                <div class="text-center p-3 mt-2" style="background: rgba(255,255,255,0.03); border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);">
                    <span style="color: #22c55e; font-size: 1.2rem;">✅</span><br>
                    <span style="color: #94a3b8; font-size: 0.9rem;">目前全品項庫存充足</span>
                </div>
            `;
    }
  }

  // ==========================================
  // 14. 結帳頁面邏輯 (無縫跳轉終極版)
  // ==========================================
  const checkoutForm = document.getElementById('checkout-form');
  if (checkoutForm) {
    const isUserLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    let cart = JSON.parse(localStorage.getItem('techCart')) || [];

    // 如果沒登入，默默導回登入頁
    if (!isUserLoggedIn) {
      window.location.replace('login.html');
      return;
    }

    // 🔥 修正：如果購物車是空的，默默導回商品頁就好，不要彈出 alert 干擾跳轉！
    if (cart.length === 0) {
      window.location.replace('products.html');
      return;
    }

    const currentUsername = localStorage.getItem('username');

    // 🌟 自動帶入個人資料
    if (currentUsername === 'admin') {
      document.getElementById('checkout-name').value = '最高管理員 ADMIN';
      document.getElementById('checkout-phone').value = '0900-000-000';
      document.getElementById('checkout-email').value = 'admin@kcg.com';

      const storeInput = document.getElementById('checkout-store');
      if (storeInput) storeInput.value = 'KCG 總部直屬門市';
    } else {
      document.getElementById('checkout-name').value =
        localStorage.getItem('name') || currentUsername || '';
      document.getElementById('checkout-phone').value =
        localStorage.getItem('userPhone') || '';
      document.getElementById('checkout-email').value =
        localStorage.getItem('userEmail') || '';

      const savedStore = localStorage.getItem('userStore') || '';
      const storeInput = document.getElementById('checkout-store');

      if (storeInput) {
        if (storeInput.tagName === 'SELECT') {
          let storeExists = false;
          for (let i = 0; i < storeInput.options.length; i++) {
            if (storeInput.options[i].value === savedStore) {
              storeExists = true;
              break;
            }
          }
          if (storeExists) storeInput.value = savedStore;
        } else {
          storeInput.value = savedStore;
        }
      }
    }

    // --- 渲染購物車清單 ---
    const checkoutItemsContainer = document.getElementById('checkout-items');
    const checkoutTotalElement = document.getElementById('checkout-total');
    let total = 0;

    if (checkoutItemsContainer) {
      checkoutItemsContainer.innerHTML = '';
      cart.forEach((item) => {
        const subtotal = item.price * item.quantity;
        total += subtotal;
        checkoutItemsContainer.innerHTML += `
                    <div class="d-flex align-items-center mb-3 pb-3" style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                        <img src="${item.image}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px; border: 1px solid rgba(6, 182, 212, 0.3); margin-right: 15px;" onerror="this.src='../assets/images/logo.png'">
                        <div class="flex-grow-1">
                            <h6 style="color: #fff; margin: 0 0 5px 0; font-size: 0.95rem;">${item.name}</h6>
                            <small style="color: #94a3b8; font-family: var(--font-title);">NT$${item.price} x ${item.quantity}</small>
                        </div>
                        <div style="color: var(--accent); font-weight: bold; font-family: var(--font-title);">NT$${subtotal}</div>
                    </div>
                `;
      });
    }

    if (checkoutTotalElement) {
      checkoutTotalElement.innerText = `NT$${total}`;
    }

    // --- 真實結帳 API 連線邏輯 ---
    // 🔥 修正：使用 onsubmit 徹底覆蓋舊事件，並回傳 false 阻擋任何預設重整
    checkoutForm.onsubmit = async function (e) {
      e.preventDefault();
      e.stopPropagation();

      const confirmOrder = confirm(
        `🛒 最終確認\n\n您即將送出這筆訂單，總金額為：NT$${total}\n確定要結帳嗎？`,
      );
      if (!confirmOrder) return false;

      const orderItems = cart.map((item) => ({
        id: parseInt(item.id),
        name: item.name,
        price: parseInt(item.price),
        quantity: parseInt(item.quantity),
      }));

      const orderData = {
        username: currentUsername,
        shipping_name: document.getElementById('checkout-name').value.trim(),
        shipping_phone: document.getElementById('checkout-phone').value.trim(),
        shipping_store: document.getElementById('checkout-store').value,
        total_amount: total,
        items: orderItems,
      };

      const submitBtn = checkoutForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerText;
      submitBtn.disabled = true;
      submitBtn.innerText = '⏳ 訂單傳輸與扣除庫存中...';

      try {
        const response = await fetch(
          'https://kcg-api.onrender.com/api/orders',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData),
          },
        );

        const result = await response.json();

        if (response.ok && result.status === 'success') {
          // 1. 顯示成功訊息
          alert(
            `🎉 訂單發送成功！\n\n📄 訂單編號：${result.order_number}\n💰 總金額：NT$${total}\n\n系統已自動為您扣除庫存，商品將盡速配送至您的取貨門市！`,
          );

          // 2. 清空購物車
          localStorage.removeItem('techCart');

          // 3. 🔥 直接強制導向首頁，不留歷史紀錄
          window.location.replace('../index.html');
        } else {
          alert('⛔ 結帳失敗：' + (result.detail || '伺服器發生錯誤'));
          submitBtn.disabled = false;
          submitBtn.innerText = originalText;
        }
      } catch (error) {
        console.error('API 錯誤:', error);
        alert('⚠️ 無法連線至伺服器，請確認您的 Python 伺服器正在運行中。');
        submitBtn.disabled = false;
        submitBtn.innerText = originalText;
      }

      return false; // 徹底阻擋表單重整
    };
  }
});
