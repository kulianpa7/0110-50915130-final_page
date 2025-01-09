import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'
const supabase = createClient(
    'https://lfkfdizfmxzuuszmakod.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxma2ZkaXpmbXh6dXVzem1ha29kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzEyMjU1NDAsImV4cCI6MjA0NjgwMTU0MH0.5XRn9ePxrdgCtLj0znyVXoOYs6l1fmgQaYjSNzo73Wc'
)
$(document).ready(function () {
    
    const cookie = document.cookie.split(";").map(ele => ele.trim());
    // 將數據轉換為 JSON 對象
    const cookieJson = cookie.reduce((acc, item) => {
        const [key, value] = item.split('=');
        acc[key] = value;
        return acc;
    }, {});
    console.log(cookieJson);
    if(cookieJson.auth === 'true'){
        console.log(cookieJson.user_id)
        setupRealtimeUpdates(cookieJson.user_id);
        $('#container').removeClass('islogin');
    }else{
        document.cookie = "user_id=; path=/; max-age=0;";
        document.cookie = "money=; path=/; max-age=0;";
        document.cookie = "name=; path=/; max-age=0;";
        console.log($('#wrapper').attr('class'));
        $('#wrapper').removeClass('islogin');
    }
        
    $('#signup_s').on('click', async function (e) {
        e.preventDefault();
        // 取得用戶輸入的數據
        const userId = $('#signup_card').val();
        const userName = $('#signup_name').val();

        // 檢查是否有缺少欄位
        if (!userId || !userName) {
            alert('請填寫所有欄位！');
            return;
        }

        // 檢查是否已經有相同的 user_id
        const { data: existingUser, error: checkError } = await supabase
            .from('users')  // 指定資料表
            .select('user_id')  // 查詢 user_id 欄位
            .eq('user_id', userId)  // 檢查是否有相同的 user_id
            .single();  // 只獲取一個結果
        if (existingUser) {
            // 如果已有相同的 user_id
            alert('該使用者 ID 已經註冊過，請使用其他 ID');
            return;
        }

        // 如果 user_id 不重複，插入新資料
        const { data, error } = await supabase
            .from('users')  // 指定資料表
            .insert([
                { user_id: userId, name: userName }
            ]);

        if (error) {
            console.error('插入錯誤:', error);
            alert('註冊失敗，請重試');
        } else {
            console.log('註冊成功:', data);
            alert('註冊成功');
        }
    });

    $('#login_s').on('click', async function (e) {
        e.preventDefault();
        // 取得用戶輸入的數據
        const userId = $('#login_card').val();
        // 檢查是否有缺少欄位
        if (!userId) {
            alert('請填寫所有欄位！');
            return;
        }
        // 檢查是否存在該用戶資料
        const { data: existingUser, error: checkError } = await supabase
            .from('users')  // 指定資料表
            .select('user_id,money,name')  // 查詢 user_id
            .eq('user_id', userId)  // 檢查是否有相同的 user_id
            .single();  // 只獲取一個結果

        if (checkError) {
            alert('該用戶尚未註冊');
            console.error('查詢錯誤:', checkError);
            return;
        } else {
            // 移除所有帶有 disabled-link 類的連結
            $('.nav-link').removeClass('disabled-link');
            // 設定 cookie，保存 user_id, money, 和 name，有效期為 1 小時（3600 秒）
            document.cookie = `auth=true; path=/; max-age=${60 * 60}`;
            document.cookie = `user_id=${existingUser.user_id}; path=/; max-age=${60 * 60}`;
            document.cookie = `money=${existingUser.money}; path=/; max-age=${60 * 60}`;
            document.cookie = `name=${existingUser.name}; path=/; max-age=${60 * 60}`;

            if ($("#balanceAmount").length === 0) {
                $('.moneys').append(`
                    <span class="navbar-text text-white">
                      餘額: <span id="balanceAmount">${existingUser.money}</span> 元
                    </span>
                `);
            }
            if ($("#logout").length === 0)
                $(".logout").append(`<button type="submit" class="btn btn-warning w-10" id="logout">登出</button>`);

            $("#logout").on('click', function () {
                // 清空 cookie
                document.cookie = "auth=false; path=/;";
                document.cookie = "user_id=; path=/; max-age=0;";
                document.cookie = "money=; path=/; max-age=0;";
                document.cookie = "name=; path=/; max-age=0;";
                window.location.reload();  // 刷新頁面
            });

            alert('登入成功');
            $('#container').removeClass('islogin');
            $('#wrapper').addClass('islogin');
            console.log('登入成功:', existingUser);
        }
    });
});
// 設置實時訂閱，並過濾特定 id 和 balanceAmount 值
async function setupRealtimeUpdates(id) {
    // 檢查是否存在該用戶資料
    const { data: existingUser, error: checkError } = await supabase
        .from('users')  // 指定資料表
        .select('user_id,money,name')  // 查詢 user_id
        .eq('user_id', id)  // 檢查是否有相同的 user_id
        .single();  // 只獲取一個結果
    document.cookie = `user_id=${existingUser.user_id}; path=/; max-age=${60 * 60}`;
    document.cookie = `money=${existingUser.money}; path=/; max-age=${60 * 60}`;
    document.cookie = `name=${existingUser.name}; path=/; max-age=${60 * 60}`;
    const channel = supabase
        .channel('realtime:users')
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'users',
                filter: `user_id=eq.${id}`  // 設定篩選條件
            },
            payload => {
                console.log('Realtime update for specific ID and balanceAmount:', payload);
                if (payload.eventType === "UPDATE") {
                    $("#balanceAmount").text(payload.new.money);
                }
            }
        )
        .subscribe();
    return channel;
}