// Decap CMS GitHub OAuth gateway for Cloudflare Workers
// Environment variables required:
// - GITHUB_CLIENT_ID
// - GITHUB_CLIENT_SECRET
//
// Routes:
// - GET /auth?provider=github&site_id=...&scope=repo,user
// - GET /callback?code=...&state=...

const GITHUB_AUTHORIZE_URL = 'https://github.com/login/oauth/authorize'
const GITHUB_TOKEN_URL = 'https://github.com/login/oauth/access_token'

function html(body) {
  return new Response(body, {
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store'
    }
  })
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
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
<p>GitHub 登录失败：${message}</p>
</body>
</html>`
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url)

    if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) {
      return json({ error: 'Missing GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET' }, 500)
    }

    if (url.pathname === '/' || url.pathname === '') {
      return json({ ok: true, service: 'maixuzi decap oauth' })
    }

    if (url.pathname === '/auth') {
      const scope = url.searchParams.get('scope') || 'repo,user'
      const siteId = url.searchParams.get('site_id') || 'maixuzi'
      const state = crypto.randomUUID() + ':' + siteId

      const redirect = new URL(GITHUB_AUTHORIZE_URL)
      redirect.searchParams.set('client_id', env.GITHUB_CLIENT_ID)
      redirect.searchParams.set('redirect_uri', `${url.origin}/callback`)
      redirect.searchParams.set('scope', scope)
      redirect.searchParams.set('state', state)

      return Response.redirect(redirect.toString(), 302)
    }

    if (url.pathname === '/callback') {
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

    return json({ error: 'Not found' }, 404)
  }
}
