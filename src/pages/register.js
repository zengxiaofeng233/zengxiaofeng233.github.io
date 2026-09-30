import './register.css';

export function register() {
  return `<article class="registration-page">
    <header class="registration-heading">
      <p class="registration-eyebrow">AWTC / DRIVER REGISTRATION</p>
      <h1>REGISTER <span>赛事报名</span></h1>
      <p class="registration-intro">从这里，驶上发车格。</p>
      <p class="registration-lead">请先阅读注册须知并准备好报名资料，再通过页面底部的按钮前往填写车手注册表。</p>
      <div class="registration-steps" aria-label="报名流程"><span>01 阅读须知</span><span>02 准备资料</span><span>03 前往报名</span></div>
    </header>
    <section class="registration-section" aria-labelledby="registration-notice">
      <div class="registration-section-heading"><span>01 / NOTICE</span><h2 id="registration-notice">注册须知</h2></div>
      <div class="registration-copy">
        <p>注册车手时请严格按照问卷要求来进行回答，并在对应的地方填上正确答案，若 3 次注册皆不符合规定将失去本赛季参赛资格（注册所需内容见赛会文书和问卷本体）</p>
        <p>补充：若注册被驳回，再次注册时需完整填写注册问卷</p>
        <p>注册成功之后将获得进入车手群的资格</p>
        <p class="registration-callout">每个车手一个赛季最多只能注册两次，若超出限制或故意退群将被拉黑（记录 QQ 号）</p>
        <h3>注册时间</h3><p>车手注册时间没有任何限制，但是赛季结束后将会暂停车手注册，直到新赛季开始后再次开放注册。</p>
      </div>
    </section>
    <section class="registration-section" aria-labelledby="registration-character">
      <div class="registration-section-heading"><span>02 / CHARACTER</span><h2 id="registration-character">角色与立绘要求</h2></div>
      <div class="registration-copy">
        <h3>以角色的名字参赛</h3><p>注册的车手必须为任意二次元游戏 / 动画（番剧）、漫画作品的角色的中英文名字，并提交该角色的立绘，且能查询到出处（查询网站为萌娘百科）。本赛季支持自设，但需通过赛会统一审核。</p>
        <h3>角色限制</h3>
        <ul><li>为避免侵权，暂不支持以虚拟主播的名字注册车手，包括国内外各平台和社团。</li><li>不支持 R18G 血腥违禁作品，以及有政治、设定争议或敏感的角色。</li><li>不得填写 3D 游戏角色，部分有 2D 角色立绘的游戏除外。</li><li>角色需有明确的五官四肢，立绘至少上半身需要有明确的五官与四肢；需具有出品的相关作品，如动画、番剧、漫画、插画等，以及详细的人设、世界观等。</li></ul>
        <h3>需要事先申请的角色</h3><p>合作 IP 游戏白线的角色注册，车手可提前向赛会申请注册，由白线制作组方统一决定是否授予注册权。</p><p>AWTC 旗下的角色（如爱妮米娅等），车手可提前向赛会申请注册，由赛会统一决定是否授予注册权。</p>
        <div class="registration-callout"><h3>立绘文件准备</h3><p>推荐在 WIKI 或者萌娘百科获取角色立绘。图片要求为 PNG 格式，不能有人物以外的其他内容。</p></div>
      </div>
    </section>
    <section class="registration-section" aria-labelledby="registration-materials">
      <div class="registration-section-heading"><span>03 / CHECKLIST</span><h2 id="registration-materials">报名资料清单</h2></div>
      <div class="registration-copy"><p>填写表单前，请准备以下信息与文件。</p>
        <ol class="registration-checklist">
          <li><span>01</span><div><h3>报名 ID（中文）</h3></div></li>
          <li><span>02</span><div><h3>报名 ID（英文）</h3></div></li>
          <li><span>03</span><div><h3>QQ 号</h3></div></li>
          <li><span>04</span><div><h3>ID 出处作品</h3></div></li>
          <li><span>05</span><div><h3>曾经是否有过比赛经历？</h3></div></li>
          <li><span>06</span><div><h3>角色立绘</h3><p>PNG 格式，不能有人物以外的其他内容。</p></div></li>
          <li><span>07</span><div><h3>巴林计时赛成绩 · 数值</h3><p>F1 25（26 DLC 仅限奥迪或凯迪拉克车队同等性能）巴林计时赛成绩。</p><p>输入格式为 <strong>XX.XXX</strong>：例如 <strong>1:28.954</strong>，请输入 <strong>88.954</strong>。</p></div></li>
          <li><span>08</span><div><h3>巴林计时赛成绩 · 截图</h3><p>上传 F1 25（26 DLC 仅限奥迪或凯迪拉克车队同等性能）巴林计时赛成绩截图。</p></div></li>
        </ol>
        <p class="registration-game-path">26 DLC 计时赛入口：主界面 → F1 世界赛车 → 游玩 → 方向键向右至计时赛模式高亮 → 进入并选择 F1 26。</p>
      </div>
    </section>
    <section class="registration-section" aria-labelledby="registration-groups">
      <div class="registration-section-heading"><span>04 / CLASSIFICATION</span><h2 id="registration-groups">分组安排</h2></div>
      <div class="registration-copy"><h3>季前测试与分组</h3><p>在正式比赛开始之前，将会安排一定场次的季前测试。在季前测试结束之前注册并参与测试赛的车手，将在测试赛之后由赛会按照测试结果、TT 成绩以及上赛季成绩安排分组等级（需要完赛）。</p><h3>学院组安排</h3><p>若未能参加并完赛一场测试赛，或在测试赛结束之后注册车手，将会安排为学院组。</p><p>每个赛季赛会都会根据车手在比赛中的表现随时调整车手的等级，赛会拥有最终解释权。</p></div>
    </section>
    <section class="registration-action" aria-labelledby="registration-ready">
      <div><p class="registration-eyebrow">READY TO RACE?</p><h2 id="registration-ready">准备好，加入发车阵列。</h2><p>阅读完以上要求并备齐资料后，前往腾讯文档填写报名表。</p></div>
      <div class="registration-buttons">
        <a class="registration-button" href="https://docs.qq.com/form/page/DRk1OTVVPeUdGcVhF" target="_blank" rel="noopener noreferrer">前往报名 <span aria-hidden="true">↗</span><small>腾讯文档 · 新窗口打开</small></a>
        <a class="registration-button registration-group-button" href="https://qm.qq.com/cgi-bin/qm/qr?k=6wjK0APitLw16fivFSyxfzm2zFUsVqw0&amp;jump_from=webapi&amp;authKey=vUK+M+yI4FS6mImSL6XTDbcGB5tWQe1+CKFNfyFqLN376bax9jzLgApa0Q5oL5lw" target="_blank" rel="noopener noreferrer" title="AWTC锦标赛">加入QQ群 <span aria-hidden="true">↗</span><small>AWTC锦标赛 · 新窗口打开</small></a>
      </div>
    </section>
  </article>`;
}
