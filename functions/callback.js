const GITHUB_TOKEN_URL = 'https://github.com/login/oauth/access_token'

function html(body) {
  return new Response(body, {
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store'
    }
  })
}

function popupScript(payload) {
  const safePayload = JSON.stringify(payload).replace(/</g, '\\u003c')
  return `<!doctype html>
<html lang="zh-CN">
<head><meta charset="utf-8"><title>GitHub 登录完成</title></head>
<body>
<script>
(function () {
  var payload = ${safePayload};
  var message = 'authorization:github:success:' + JSON.stringify(payload);
  var count = 0;

  function send() {
    count += 1;
    if (window.opener && !window.opener.closed) {
      window.opener.postMessage(message, window.location.origin);
    }
    if (count < 5) {
      setTimeout(send, 350);
    } else {
      setTimeout(function () { window.close(); }, 500);
    }
  }

  send();
})();
</script>
<p>GitHub 登录完成，正在返回管理后台。如果窗口没有自动关闭，可以手动关闭后查看后台页面。</p>
</body>
</html>`
}

function errorScript(message) {
  const escaped = String(message).replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[ch]))
  const safeMessage = JSON.stringify({ error: message }).replace(/</g, '\\u003c')
  return `<!doctype html>
<html lang="zh-CN">
<head><meta charset="utf-8"><title>GitHub 登录失败</title></head>
<body>
<script>
(function () {
  var payload = ${safeMessage};
  var message = 'authorization:github:error:' + JSON.stringify(payload);
  var count = 0;

  function send() {
    count += 1;
    if (window.opener && !window.opener.closed) {
      window.opener.postMessage(message, window.location.origin);
    }
    if (count < 5) {
      setTimeout(send, 350);
    }
  }

  send();
})();
</script>
<p>GitHub 登录失败：${escaped}</p>
<p>请把这个错误提示发给 shunshi。</p>
</body>
</html>`
}

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url)

  if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) {
    return html(errorScript('Missing GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET'))
  }

  const code = url.searchParams.get('code')
  if (!code) {
    return html(errorScript('Missing code'))
  }

  const tokenResponse = await fetch(GITHUB_TOKEN_URL, {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'content-type': 'application/json',
      'user-agent': 'maixuzi-decap-oauth'
    },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: `${url.origin}/callback`
    })
  })

  const tokenData = await tokenResponse.json()
  if (!tokenResponse.ok || tokenData.error || !tokenData.access_token) {
    return html(errorScript(tokenData.error_description || tokenData.error || 'Token exchange failed'))
  }

  return html(popupScript({ token: tokenData.access_token, provider: 'github' }))
}
