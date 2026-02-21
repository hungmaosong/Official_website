// frontend/js/auth.js

let currentCaptcha = '';

// 🎲 產生 4 碼隨機數字驗證碼 (純數字版)
function generateCaptcha() {
  const chars = '0123456789';
  let captcha = '';
  for (let i = 0; i < 4; i++) {
    captcha += chars[Math.floor(Math.random() * chars.length)];
  }
  return captcha;
}

// 🔄 更新畫面上的驗證碼
function refreshCaptcha() {
  const captchaDisplay = document.getElementById('captcha-code');
  if (captchaDisplay) {
    currentCaptcha = generateCaptcha();
    captchaDisplay.innerText = currentCaptcha;
  }
}

// 👁️ 綁定密碼眼睛按鈕的輔助函數
function bindEyeToggle(btnId, inputId) {
  const btn = document.getElementById(btnId);
  const input = document.getElementById(inputId);
  if (btn && input) {
    btn.addEventListener('click', function () {
      if (input.type === 'password') {
        input.type = 'text';
        this.innerText = '🙈';
      } else {
        input.type = 'password';
        this.innerText = '👁️';
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // ==========================================
  // 👁️ UI 互動：綁定所有密碼顯示按鈕
  // ==========================================
  bindEyeToggle('togglePassword', 'password'); // 登入頁
  bindEyeToggle('toggleRegPassword', 'reg-password'); // 註冊頁
  bindEyeToggle('toggleRegPasswordConfirm', 'reg-password-confirm'); // 註冊確認
  bindEyeToggle('toggleForgotNewPwd', 'forgot-new-password'); // 忘記密碼新密碼
  bindEyeToggle('toggleForgotConfirmPwd', 'forgot-confirm-password'); // 忘記密碼確認密碼

  // ==========================================
  // 🛡️ UI 互動：初始化登入頁的驗證碼
  // ==========================================
  const captchaRefreshBtn = document.getElementById('refresh-captcha');
  if (captchaRefreshBtn) {
    refreshCaptcha();
    captchaRefreshBtn.addEventListener('click', refreshCaptcha);
  }

  // ==========================================
  // 🛡️ 註冊邏輯 (API 連線)
  // ==========================================
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      const password = document.getElementById('reg-password').value;
      const confirmPassword = document.getElementById(
        'reg-password-confirm',
      ).value;

      if (password !== confirmPassword) {
        alert('⚠️ 錯誤：兩次輸入的密碼不一致，請重新確認！');
        return;
      }

      const userData = {
        username: document.getElementById('reg-username').value.trim(),
        password: password,
        name: document.getElementById('reg-name').value.trim(),
        phone: document.getElementById('reg-phone').value.trim(),
        email: document.getElementById('reg-email').value.trim(),
        store_711: document.getElementById('reg-store').value,
      };

      const submitBtn = document.querySelector(
        '#register-form button[type="submit"]',
      );
      const originalText = submitBtn.innerText;
      submitBtn.disabled = true;
      submitBtn.innerText = '⏳ 伺服器連線中...';

      try {
        const response = await fetch(
          'https://kcg-api.onrender.com/api/register',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
          },
        );

        const result = await response.json();

        if (response.ok && result.status === 'success') {
          alert(result.message + '\n\n系統即將引導您前往登入畫面...');
          window.location.href = 'login.html';
        } else {
          alert('⛔ 註冊失敗：' + (result.detail || '伺服器發生錯誤'));
        }
      } catch (error) {
        console.error('API 錯誤:', error);
        alert('⚠️ 無法連線至伺服器，請確認您的 Python 伺服器正在運行中。');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = originalText;
      }
    });
  }

  // ==========================================
  // 🔑 登入邏輯 (API 連線)
  // ==========================================
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      const captchaInput = document.getElementById('captcha-input');
      if (captchaInput && captchaInput.value !== currentCaptcha) {
        alert('⚠️ 驗證碼輸入錯誤，請重新輸入！');
        captchaInput.value = '';
        refreshCaptcha();
        return;
      }

      const loginData = {
        username: document.getElementById('username').value.trim(),
        password: document.getElementById('password').value,
      };

      const submitBtn = document.querySelector(
        '#login-form button[type="submit"]',
      );
      const originalText = submitBtn.innerText;
      submitBtn.disabled = true;
      submitBtn.innerText = '⏳ 身份核對中...';

      try {
        const response = await fetch('https://kcg-api.onrender.com/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(loginData),
        });

        const result = await response.json();

        if (response.ok && result.status === 'success') {
          // 👇 從這裡開始替換 👇
          const userData = result.data;

          // 1. 存入符合 layout.js 期望的正確鑰匙名稱！
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('username', userData.username);
          localStorage.setItem('name', userData.name); // 修正：改回原本的 'name'
          localStorage.setItem('userStore', userData.store_711); // 補回：門市資料
          localStorage.setItem('userPhone', userData.phone); // 順便補上電話信箱
          localStorage.setItem('userEmail', userData.email);

          // 2. 決定彈出視窗要顯示的名稱 (如果有設定名字就顯示名字，沒有就顯示帳號)
          const displayName = userData.name || userData.username;

          if (userData.role === 'admin') {
            alert(
              `歡迎回來，指揮官 [ ${displayName} ]。\n系統已解除最高權限限制。`,
            );
            window.location.href = 'admin.html';
          } else {
            alert(`登入成功，歡迎 [ ${displayName} ] 加入 KCG 總部。`);
            window.location.href = '../index.html';
          }
          // 👆 替換到這裡結束 👆
        } else {
          alert('⛔ 驗證失敗：' + (result.detail || '帳號或密碼錯誤'));
          document.getElementById('password').value = '';

          if (captchaInput) {
            captchaInput.value = '';
            refreshCaptcha();
          }
        }
      } catch (error) {
        console.error('API 錯誤:', error);
        alert('⚠️ 無法連線至伺服器，請確認您的 Python 伺服器正在運行中。');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = originalText;
      }
    });
  }

  // ==========================================
  // 🔄 忘記密碼系統 (純前端模擬)
  // ==========================================
  const forgotPwdForm = document.getElementById('forgot-password-form');
  if (forgotPwdForm) {
    const sendCodeBtn = document.getElementById('send-code-btn');
    const forgotUsername = document.getElementById('forgot-username');
    const forgotEmail = document.getElementById('forgot-email');
    const forgotCode = document.getElementById('forgot-code');
    const newPwd = document.getElementById('forgot-new-password');
    const confirmPwd = document.getElementById('forgot-confirm-password');
    const submitBtn = document.getElementById('reset-password-submit');

    let generatedCode = '';
    let timer = null;

    sendCodeBtn.onclick = function () {
      const userVal = forgotUsername.value.trim();
      const emailVal = forgotEmail.value.trim();

      if (!userVal || !emailVal) {
        alert('⚠️ 請先輸入帳號與註冊時的電子信箱！');
        return;
      }

      generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
      alert(
        `📧 【系統模擬發信】\n\n已發送驗證碼至：${emailVal}\n\n您的驗證碼為：${generatedCode}\n(請將此代碼填入下方驗證碼欄位)`,
      );

      forgotCode.disabled = false;
      newPwd.disabled = false;
      confirmPwd.disabled = false;
      submitBtn.disabled = false;

      sendCodeBtn.disabled = true;
      let countdown = 60;
      sendCodeBtn.textContent = `已發送 (${countdown}s)`;

      if (timer) clearInterval(timer);
      timer = setInterval(() => {
        countdown--;
        if (countdown > 0) {
          sendCodeBtn.textContent = `已發送 (${countdown}s)`;
        } else {
          clearInterval(timer);
          sendCodeBtn.disabled = false;
          sendCodeBtn.textContent = '重寄驗證碼';
        }
      }, 1000);
    };

    forgotPwdForm.onsubmit = function (e) {
      e.preventDefault();

      if (forgotCode.value.trim() !== generatedCode) {
        alert('⛔ 驗證碼錯誤或已失效，請重新輸入！');
        forgotCode.focus();
        return;
      }

      if (newPwd.value !== confirmPwd.value) {
        alert('⚠️ 兩次輸入的新密碼不一致，請重新確認！');
        confirmPwd.focus();
        return;
      }

      alert('🎉 密碼重置成功！(前端模擬)\n請使用您的新密碼重新登入系統。');
      const modal = bootstrap.Modal.getInstance(
        document.getElementById('forgotPasswordModal'),
      );
      if (modal) modal.hide();
      window.location.reload();
    };
  }
});
