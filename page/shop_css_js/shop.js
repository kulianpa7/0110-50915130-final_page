import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'
const supabase = createClient(
    'https://lfkfdizfmxzuuszmakod.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxma2ZkaXpmbXh6dXVzem1ha29kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzEyMjU1NDAsImV4cCI6MjA0NjgwMTU0MH0.5XRn9ePxrdgCtLj0znyVXoOYs6l1fmgQaYjSNzo73Wc')
console.log('Supabase Instance: ', supabase)

let cartItems = [];

// 獲取數據並顯示在頁面上
async function fetchPosts() {
    const { data, error } = await supabase.from('item').select('*');
    if (error) {
        console.log(error)
    } else {
        displayPosts(data);
        console.log(data)
    }
}

// 動態顯示數據
function displayPosts(posts) {
    const productList = $('#product-list');
    productList.empty(); // 清空目前的列表

    posts.forEach(post => {
        const postElement = `
            <div class="col-md-4 mb-4">
                <div class="card">
                    <div class="product-img">
                        <img src="${post.url}" alt="${post.names}">
                    </div>
                    <div class="card-body">
                        <h5 class="card-title">${post.names}</h5>
                        <p class="card-text">${post.description}</p>
                        <p class="card-text">價格：NT$ ${post.cost}</p>
                        <p class="card-text">
                            <small class="text-muted">創建時間：${new Date(post.created_at).toLocaleString()}</small>
                        </p>
                        <button 
                            class="btn btn-primary add-to-cart-btn"
                            onclick="handleAddToCart('${post.names}', ${post.cost}, '${post.url}')"
                        >
                            加入購物車 🛒
                        </button>
                    </div>
                </div>
            </div>
        `;
        productList.append(postElement);
    });
}

// 在頁面加載後立即獲取並顯示數據
$(document).ready(function () {
    fetchPosts();
});

// 處理加入購物車的函數
function handleAddToCart(names, cost, url) {
    const existingItem = cartItems.find(item => item.names === names);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cartItems.push({ names, cost, url, quantity: 1 });
    }
    updateCartDisplay();
    document.querySelector('.cart-sidebar').classList.add('open');
}

// 更新購物車顯示
function updateCartDisplay() {
    const cartItemsContainer = document.querySelector('.cart-items');
    const cartCount = document.querySelector('.cart-count');
    const totalAmount = document.querySelector('.total-amount');

    // 更新购物车数量
    cartCount.textContent = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    // 渲染购物车项
    cartItemsContainer.innerHTML = cartItems.map((item, index) => `
        <div class="cart-item">
            <img src="${item.url}" alt="${item.names}">
            <div class="cart-item-details">
                <h4>${item.names}</h4>
                <p>NT$ ${item.cost}</p>
                <div class="cart-item-quantity">
                    <button class="btn-quantity" onclick="changeQuantity(${index}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button class="btn-quantity" onclick="changeQuantity(${index}, 1)">+</button>
                </div>
            </div>
            <button class="cart-item-remove" onclick="removeFromCart(${index})">&times;</button>
        </div>
    `).join('');

    // 更新总金额
    const total = cartItems.reduce((sum, item) => sum + item.cost * item.quantity, 0);
    totalAmount.textContent = `NT$ ${total}`;

    // 結帳按鈕顯示
    const checkoutButton = total > 0 ?
        `<button class="btn btn-success" onclick="checkout()">結帳</button>` : '';
    document.querySelector('.cart-checkout').innerHTML = checkoutButton;
}

// 修改商品數量
function changeQuantity(index, delta) {
    cartItems[index].quantity += delta;
    if (cartItems[index].quantity <= 0) {
        removeCartItemWithAnimation(index);
    } else {
        updateCartDisplay();
    }
}

// 移除商品（带动画）
function removeCartItemWithAnimation(index) {
    const cartItem = document.querySelectorAll('.cart-item')[index];
    if (cartItem) {
        cartItem.classList.add('removing');  // 开始动画
        cartItem.addEventListener('animationend', () => {
            cartItems.splice(index, 1);  // 从数组中删除
            updateCartDisplay();  // 更新购物车显示
        }, { once: true }); // 确保动画结束后只触发一次更新
    }
}

// 移除商品
function removeFromCart(index) {
    removeCartItemWithAnimation(index);
}

// 解析 cookies 的函数
function parseCookies() {
    const cookies = document.cookie.split(';').map(cookie => cookie.trim());
    return cookies.reduce((acc, cookie) => {
        const [key, value] = cookie.split('=');
        acc[key] = decodeURIComponent(value);
        return acc;
    }, {});
}

async function checkout() {
    if (cartItems.length === 0) {
        alert("購物車是空的，無法結帳！");
        return;
    }

    // 計算總金額
    const total = cartItems.reduce((sum, item) => sum + item.cost * item.quantity, 0);
    const itemList = cartItems.map(item => `${item.names} (NT$ ${item.cost} x ${item.quantity})`).join(', ');

    // 提示用戶結帳信息
    if (!confirm(`您購買的商品: ${itemList}\n總金額: NT$ ${total}\n是否確定結帳？`)) {
        return;
    }

    const cookies = parseCookies();
    const userId = cookies.user_id;

    try {
        // 获取当前余额
        const { data: currentData, error: fetchError } = await supabase
            .from('users')
            .select('money')
            .eq('user_id', userId)
            .single();

        if (fetchError) {
            console.error('获取当前余额失败:', fetchError.message);
            throw new Error('獲取當前用戶餘額失敗');
        }

        const currentBalance = currentData?.money || 0;

        if (currentBalance < total) {
            const utterance = new SpeechSynthesisUtterance(`餘額不足`);
            speechSynthesis.speak(utterance);
            Swal.fire({
                icon: 'error',
                title: '餘額不足',
                text: '您的卡片餘額不足以完成此次結帳。'
            });
            return;
        }

        // 更新餘額到 Supabase
        const newBalance = currentBalance - total;
        const { data: updatedData, error: updateError } = await supabase
            .from('users')
            .update({ money: newBalance })
            .eq('user_id', userId);

        if (updateError) {
            console.error('更新餘額失败:', updateError.message);
            const utterance = new SpeechSynthesisUtterance(`結帳失敗，無法更新餘額`);
            speechSynthesis.speak(utterance);
            throw new Error(`結帳失敗，無法更新餘額：${updateError.message}`);

        }
        const utterance = new SpeechSynthesisUtterance(`結帳成功 扣除 ${total}元`);
        speechSynthesis.speak(utterance);
        Swal.fire({
            icon: 'success',
            title: '結帳成功',
            text: `成功從卡片儲值扣除 NT$ ${total}`
        });
        const cookie = document.cookie.split(";").map(ele => ele.trim());
        // 將數據轉換為 JSON 對象
        const cookieJson = cookie.reduce((acc, item) => {
            const [key, value] = item.split('=');
            acc[key] = value;
            return acc;
        }, {});
        const { data: ins, error: error } = await supabase
            .from('buy_list')
            .insert({
                user_id: cookieJson.user_id,
                description: `${itemList}`,
                total_cost:total
            });

        if (error) {
            console.error('Error inserting data:', error.message);
        } else {
            console.log('Data inserted successfully:', ins);
        }


        // 清空購物車
        cartItems = [];
        updateCartDisplay();
        document.querySelector('.cart-sidebar').classList.remove('open');

        // 更新本地显示
        $('#currentBalance').text(`${newBalance} 元`);

    } catch (error) {
        console.error('結帳錯誤:', error.message);
        Swal.fire({
            icon: 'error',
            title: '錯誤',
            text: `處理結帳時發生錯誤：${error.message}`
        });
    }
}

// 初始化購物車功能
function initCart() {
    const cartCounter = document.querySelector('.cart-counter');
    const cartSidebar = document.querySelector('.cart-sidebar');
    const cartClose = document.querySelector('.cart-close');

    cartCounter.addEventListener('click', () => {
        cartSidebar.classList.add('open');
    });

    // 修改關閉按鈕的邏輯
    cartClose.addEventListener('click', function () {
        // 直接關閉側邊欄，不清空購物車
        cartSidebar.classList.remove('open');
    });
}

// 將函數暴露給全局作用域
window.handleAddToCart = handleAddToCart;
window.changeQuantity = changeQuantity;
window.removeFromCart = removeFromCart;
window.checkout = checkout;  // 确保 checkout 函数对外暴露

// 在頁面加載後初始化購物車
document.addEventListener('DOMContentLoaded', initCart);


// copyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy
document.addEventListener('DOMContentLoaded', () => {
    if (sessionStorage.animationPlayed === 'false') {
        sessionStorage.setItem('animationPlayed', 'true');
        $('body').addClass('play-blur-animation');
    }
});
// copyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy
