const GITHUB_AUTHORIZE_URL = 'https://github.com/login/oauth/authorize'

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

  return Response.redirect(redirect.toString(), 302)
}
