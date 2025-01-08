let cartItems = [];

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

// 在頁面加載後初始化購物車
document.addEventListener('DOMContentLoaded', initCart);