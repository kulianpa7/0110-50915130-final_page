const loginForm = document.querySelector("form.login");
const signupForm = document.querySelector("form.signup");
const loginBtn = document.querySelector("label.login");
const signupBtn = document.querySelector("label.signup");
const signupLink = document.querySelector(".signup-link a");
const loginText = document.querySelector(".title-text .login");
const signupText = document.querySelector(".title-text .signup");

signupBtn.addEventListener("click", () => {
    loginForm.style.marginLeft = "-50%";
    loginText.style.marginLeft = "-50%";
});

loginBtn.addEventListener("click", () => {
    loginForm.style.marginLeft = "0%";
    loginText.style.marginLeft = "0%";
});

$("#login_s").on('click', function() {
    // 移除所有帶有 disabled-link 類的連結
    $('.nav-link').removeClass('disabled-link');
    // 設定 cookie auth=true，有效期為 1 小時（可以根據需求調整）
    document.cookie = "auth=true; path=/; max-age=" + 60 * 60 * 10;  // 設定 cookie 的有效期為 1 小時
});
$("#signup_s").on('click', function() {
    // 移除所有帶有 disabled-link 類的連結
    $('.nav-link').addClass('disabled-link');
    // 設定 cookie auth=true，有效期為 1 小時（可以根據需求調整）
    document.cookie = "auth=false; path=/; max-age=" + 60 * 60 * 10;  // 設定 cookie 的有效期為 1 小時
});