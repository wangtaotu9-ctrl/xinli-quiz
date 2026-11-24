/* ============================================================
   上架配置 · 你只需要改这一个文件
   改完后重新上传/部署即可生效，不用碰其它文件
   ============================================================ */
window.SHOP_CONFIG = {
  // 1) 你的商品链接：闲鱼 / 小红书店铺 / 抖音小店 的 0.99 元商品页
  //    买家点「去拍下」会跳到这里；留空则按钮不显示
  shopUrl: "",            // 例："https://www.goofish.com/item?id=xxxxx"

  // 2) 价格展示（仅文案，不参与收款）
  price: "0.99",

  // 3) 解锁码：付款后由「自动发货」发给买家，买家在测试页输入即可开始
  //    这里做成「一批通码」，简单好上手；要「一人一码」请看文档里的平台方案
  codes: {
    "ta":        ["TA-520", "XINDONG-01"],
    "banwei":    ["BW-996", "BANWEI-01"],
    "innerdrama":["NX-108", "NEIXIN-01"],
    "city":      ["CITY-01", "CHENGSHI-01"],
    "zizhi":     ["ZZTJ-01", "JIAN-01"]
  },

  // 4) 自动发货消息模板（复制去平台后台用，{link} 换成部署后的链接，{code} 换成码）
  deliveryText: "感谢拍下～\n测试链接：{link}\n解锁码：{code}\n打开链接输入解锁码即可开始，答案只在你自己手机里计算，不上传。\n（虚拟商品，一经发出不支持退款，介意慎拍；仅供娱乐，不是心理诊断）",

  // 5) 品牌名（会显示在每页顶部）
  series: "心里那点事 · 趣味小测",

  // 6) 访问统计（画像分析用；不填 = 完全不统计、不发任何请求）
  //    —— 二选一，别同时填 ——
  //    【方式 A 推荐】注册 51LA https://v6.51.la/ 或百度统计 https://tongji.baidu.com，
  //      添加站点后把平台给的「整段统计代码」原样粘进下面两个反引号之间。
  //      用反引号（不是双引号）就是为了能容纳代码里的双引号和换行，一个字都不用改。
  //      平台以后改格式也不会失效。
  //    【方式 B】只填 ID：provider "51la" 需 id(项目ID)+ck(校验密钥)；
  //      provider "baidu" 只需 id(hm.js? 后面那串)。
  //    填好后双击 一键部署到GitHub.bat 重跑一次即生效。
  //    渠道追踪：小红书发链接加 ?from=xhs，抖音 ?from=douyin，公众号 ?from=wx。
  stats: {
    snippet: `<script charset="UTF-8" id="LA_COLLECT" src="//sdk.51.la/js-sdk-pro.min.js"></script>
<script>LA.init({id:"3RviySM8ztI6eZPP",ck:"3RviySM8ztI6eZPP"})</script>`,      // 方式 A：整段 <script> 代码粘进两个反引号之间
    provider: "",     // 方式 B："51la" 或 "baidu"
    id: "",           // 方式 B：项目ID / siteId
    ck: ""            // 方式 B：51LA 校验密钥（百度留空）
  }
};
