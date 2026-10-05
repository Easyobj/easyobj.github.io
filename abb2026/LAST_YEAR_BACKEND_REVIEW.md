# 去年后台功能核对与今年对照（2026-10-05 / V5.9.10）

核对对象是本地 abb20250919game 源码，按控制器可执行代码和视图核对；没有登录或修改去年正式服务、没有读取去年正式数据库。导航由 treenode/access 数据动态生成，未取得去年的正式菜单/角色数据，因此“代码中存在”不等于每个员工去年都能看到，也不保证遗留模块在正式库有完整数据。

## 去年实际代码中的功能

后台通用功能复用的分阶段范围、独立页面与权限说明见 [ADMIN_REUSE_PLAN.md](ADMIN_REUSE_PLAN.md)；布局调整不代表网页账号管理和完整分页已经实现。

| 模块 | 功能与证据 | 今年状态 |
| --- | --- | --- |
| 后台登录/退出 | Admin/Login 的 index/dologin/loginout，更新登录时间；MD5密码实现 | 保留账号登录、退出，改强密码哈希、会话超时、限速和CSRF；不要复制MD5逻辑 |
| 首页统计 | Admin/Index/index：user总数、question1/question2特定状态数量、jiangpin记录数 | 今年显示参与用户、六站通关、中奖、核销数量 |
| 活动分数配置 | Admin/Prize/index/changestate：game分类对应基础score修改 | 旧计分不是今年PSD六站通关规则，不直接搬用；今年后台设置活动日期和抽奖开关 |
| 分数列表 | Admin/Prize/prize：score表的question1/question2/game及sum | 属于旧计分模块；今年有通关统计和开放题CSV，未新增完整逐用户六站分页明细 |
| 礼品配置 | Admin/Prize/jiangpin/changestatess：chancegoods列表、num修改、chance修改处理分支；视图表头出现“积分” | 今年七奖品固定总量/每日限额，按实际当日可抽剩余件数加权，不复用旧手填概率或积分 |
| 兑换人列表 | Admin/Prize/prizes：jiangpin分页，展示礼品、兑换人、时间、是否处理 | 今年最近100条中奖状态与现场核验；不是全部历史分页查询 |
| 标记处理 | Admin/Prize/changestates：kuaidi在0和1之间切换 | 不复用可反复切回的旧状态；今年二维码查询→人工确认→事务一次性核销与审计 |
| 后台账号管理 | Admin/System/userlist/adduser/edituser/deluser及role_user关联 | 今年运营/核验员固定角色，创建/密码重置/改角色由受控CLI完成，暂无网页账号CRUD |
| 角色及权限管理 | Admin/System/role/addrole/editrole/delrole/setting，access关联treenode，Base/loadMenu按权限生成菜单 | 今年服务端动作白名单和operator/redeemer两类权限；暂无动态角色/菜单编辑 |
| 轮播管理 | Admin/System/carousel_list/runadd/editcarousel/runeditcarousel/del | 遗留管理模块；今年PSD固定素材，不新增轮播编辑 |
| 修改本人密码 | Admin/Index/pwd：验证旧密码、比较两次新密码 | 今年尚无网页改密码，通过受控CLI重置；不会自动复用旧MD5 |
| 清除缓存 | Admin/Index/del 调用delFileByDir清Runtime | 今年不提供全Runtime网页清理，避免误删Session/日志/SDK缓存 |
| 上传工具 | Admin/Upload/editor/upload/showbg/usercsv 支持图片及xls/xlsx上传 | 工具端点本身不等于导入/导出业务；去年Upload直接继承Controller，复用需另审权限安全。今年无上传业务端点 |

去年首页视图还有“游戏人数”，但控制器对应查询已注释，不能算有效统计。分数页/兑换页的导出按钮与 PrizeController 中 daochu/daochuuser 都在注释块中，PHP token核对未发现可执行导出方法，不能说去年源码现在支持Excel导出。后台的userlist是“后台管理员列表”，不是活动参与者名单。

## 微信授权与扫一扫

- 去年 Other/Index/index 使用 snsapi_userinfo，code换OAuth access_token，再请求sns/userinfo；存openid、nickname、headimgurl。固定state=STATE、请求Host拼回调和关闭TLS验证的旧做法不复用。
- 今年入口保持微信环境限制；使用随机十分钟一次性state、固定配置域名/二级目录回调、TLS校验，并取得基本信息后更新今年users表昵称/头像。旧会话没有userinfo授权标记时重新授权，不改变用户、答题或中奖的唯一对应关系。
- 微信授权只保存活动所需OpenID、昵称和头像，不新增性别、地区、手机号或身份证。WeChat返回空头像时允许显示默认状态，不编造身份信息。头像/昵称不能代替现场本人资格核对。
- 去年 Other/View/Public/share.html 的微信扫一扫用needResult=1，但直接location.href=扫码内容；这是前台跳转，不是安全的后台领奖核销。今年不复制任意扫码跳转，而严格识别ABB2026二维码文本后通过PHP表单POST查询。
- 微信SDK由官方HTTPS资源加载。服务端stable_token force_refresh=false与去年普通令牌隔离，缓存只写今年Runtime；公众号网页登录域名、JS接口安全域名和出口IP白名单仍需以真实账号配置为准。

## 今年本轮变更与验收范围

1. V5.9.10：强制请求userinfo基本信息、核对token和profile的OpenID一致、最小字段保存；授权失败显示PHP重试页，不返回业务JSON页面。
2. 核验员登录后在手机微信点击扫一扫→自动查询→现场核验资格及本人→勾选两项→确认核销。二维码两分钟、奖品当天且两小时领取、更新失效、一次性消费和过期库存锁定不改变。
3. 非活动码、网址码、异常码、取消或扫码失败均不提交；手输仅为折叠备用。后台查到微信昵称及合法头像用于辅助核对，不提供自动实名判断。
4. 本地孤立缓存/签名测试、隔离数据库全业务回归及模拟原生扫码用于代码验证；真实微信授权、JS签名通过、摄像头扫码与现场发奖需由手机微信最终验收，不能用Pages静态预览替代。

## 正式服务器验证与当前阻塞

V5.9.10 代码已更新至今年服务器二级目录，私密配置未变，核验員现有账号可登录。用户确认已能取得微信昵称；本轮从服务器调用JS-SDK所需稳定版令牌，HTTP200/TLS正常，但微信返回40164，报出出口IP8.133.204.1不在白名单。OAuth用户令牌与SDK服务器令牌不同，因此两者并不矛盾。后台显示明确阻塞提示，不伪造签名或核销成功；需公众号管理员核对该AppID白名单（保留旧IP）及JS接口安全域名，再由手机微信验收。

官方参考：[网页授权](https://developers.weixin.qq.com/doc/service/guide/h5/auth.html)、[JS-SDK及扫一扫](https://developers.weixin.qq.com/doc/service/guide/h5/jssdk.html)、[稳定版令牌隔离规则](https://developers.weixin.qq.com/doc/service/api/base/api_getstableaccesstoken)。
