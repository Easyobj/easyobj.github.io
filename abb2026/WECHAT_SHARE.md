# 微信自定义分享（V5.9.30）

## 文案在哪里改

源码：`Application/Common/Conf/share.php`，FTP 包中为同一路径。只修改这一处，再同步发布：

```php
return [
    'enabled' => true,
    'title' => 'ABB机器人工博会',
    'description' => '探索 ABB Robotics 互动体验',
    'image_path' => 'assets/social/wechat-share-logo-v5933.png',
];
```

当前沿用原页面标题/描述，封面使用官方 ABB Robotics 横向标志的方形安全留白 PNG，适配微信卡片缩略图；不填密钥或临时链接。网页 title、description、og:title、og:description、og:image 与原生分享使用同一配置，不再分别编辑模板里的硬编码。

好友分享使用标题、描述、链接和图片；朋友圈接口设置标题、链接和图片，不传描述。分享链接固定为服务器配置 app_url 加 `/index.php`，不携带当前页面 scene、OAuth code/state、用户 ID、兑奖码或中奖状态。Pages 元信息指向 index.html，仅静态预览，不调用微信接口。

## 接入方式

- 已授权的正式微信页面由 PHP 注入 JS-SDK 签名及公开分享数据，不新增 JSON 业务 API或公开签名端点。
- 请求接口仅为 updateAppMessageShareData / updateTimelineShareData，不重新启用扫码/摄像头。使用官方 HTTPS JSSDK 1.6.0，异步加载，失败或超时不会阻塞活动脚本及界面。
- 服务端签名使用配置的固定 origin、实际 REQUEST_URI 完整查询参数，排除 hash。应用页内导航仅改变 #，无需反复重签；PHP 表单跳转后新文档重新生成签名。
- 票据/令牌仅缓存于今年 Application/Runtime/wechat-js-sdk，目录实际 PHP 用户0700，缓存文件0600且 PHP guard 防直访。AppSecret、access_token、jsapi_ticket 不下发浏览器。
- stable_token force_refresh=false 与去年普通令牌分离；不强制刷新、不关闭 TLS校验。共享缓存及30秒错误冷却避免重复请求。分享签名网络超时限制为3秒，授权兑换仍保持原有超时。
- wx.ready 后设置分享参数；wx.error/加载失败只将分享状态标记为失败，不阻断生产活动页、答题或抽奖。接口 success 仅表示“分享参数设置成功”，不是用户已实际分享，不增加徽章、抽奖次数、库存或奖励，也不自动给好友发消息。

## 公众号配置和当前阻塞

服务器历史日志曾记录 stable_token 返回 40164（出口 IP **8.133.204.1** 未被当前公众号白名单接受），这解释了此前签名失败。最新服务器检查已能取得有效 token/jsapi_ticket，且没有新的签名错误；网页授权昵称正常与此并不矛盾，OAuth 用户令牌不是 JS-SDK 所需服务器令牌。若真机仍失败，应继续核对该公众号的 JS 接口安全域名和实际访问的协议/域名。

公众号管理员需检查当前账号的接口IP白名单包含8.133.204.1，保留其他已有IP；JS接口安全域名包含www.abbrobotics.com.cn（不要填协议或活动二级路径）。网页授权域名仍保留原设置。修正后等待错误缓存冷却，再重新打开活动页检验。

真实验收：手机微信登录活动，等待签名成功；分别从右上角分享给好友及朋友圈，检查实际标题/描述/封面/链接；点击卡片重新走微信授权，确认链接不带个人信息。iOS/Android都需验证，浏览器模拟不能替代原生发送测试。旧卡片有缓存，须新打开页面并重新发送，不以旧聊天卡片作为新配置结果。

本轮代码已完成签名/缓存及分享参数的隔离检查、375/390px PHP渲染+模拟SDK检查、412项业务回归；这些只确认实现与非阻断降级行为，不证明公众号配置和真实微信客户端已通过。

官方依据：[JS-SDK及分享接口](https://developers.weixin.qq.com/doc/service/guide/h5/jssdk.html)、[稳定版令牌](https://developers.weixin.qq.com/doc/service/api/base/api_getstableaccesstoken)。
