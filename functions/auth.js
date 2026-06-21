const GITHUB_AUTHORIZE_URL = 'https://github.com/login/oauth/authorize'

function html(body) {
  return new Response(body, {
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store'
    }
  })
}

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url)

  if (!env.GITHUB_CLIENT_ID) {
    return new Response(JSON.stringify({ error: 'Missing GITHUB_CLIENT_ID' }), {
      status: 500,
      headers: { 'content-type': 'application/json; charset=utf-8' }
    })
  }

  const scope = url.searchParams.get('scope') || 'repo,user'
  const siteId = url.searchParams.get('site_id') || 'maixuzi'
  const state = crypto.randomUUID() + ':' + siteId

  const redirect = new URL(GITHUB_AUTHORIZE_URL)
  redirect.searchParams.set('client_id', env.GITHUB_CLIENT_ID)
  redirect.searchParams.set('redirect_uri', `${url.origin}/callback`)
  redirect.searchParams.set('scope', scope)
  redirect.searchParams.set('state', state)

  const redirectTo = JSON.stringify(redirect.toString()).replace(/</g, '\\u003c')

  return html(`<!doctype html>
<html lang="zh-CN">
<head><meta charset="utf-8"><title>正在连接 GitHub</title></head>
<body>
<script>
(function () {
  var provider = 'github';
  var message = 'authorizing:' + provider;
  var redirectTo = ${redirectTo};
  var redirected = false;

  function go() {
    if (redirected) return;
    redirected = true;
    window.location.href = redirectTo;
  }

  window.addEventListener('message', function (event) {
    if (event.data === message) {
      go();
    }
  });

  if (window.opener && !window.opener.closed) {
    window.opener.postMessage(message, window.location.origin);
    setTimeout(function () {
      window.opener.postMessage(message, window.location.origin);
    }, 300);
    setTimeout(function () {
      window.opener.postMessage(message, window.location.origin);
    }, 700);
  }

  setTimeout(go, 1800);
})();
</script>
<p>正在连接 GitHub 授权，请稍候……</p>
</body>
</html>`)
}
