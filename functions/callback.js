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
  function send() {
    if (window.opener) {
      window.opener.postMessage('authorization:github:success:' + JSON.stringify(payload), '*');
    }
    window.close();
  }
  send();
  setTimeout(send, 500);
})();
</script>
<p>GitHub 登录完成，可以关闭此窗口。</p>
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
  if (window.opener) {
    window.opener.postMessage('authorization:github:error:' + JSON.stringify(payload), '*');
  }
  window.close();
})();
</script>
<p>GitHub 登录失败：${escaped}</p>
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
