import{_ as a,c as r,e as i,w as d,f as t,N as p,h as u,i as e,p as l,t as o}from"./index-bpa48Sxk.js";const c={class:"api-support-view"},m={class:"card-section"},h={class:"meta-list"},y={class:"code-grid"},f={__name:"ApiReferenceView",setup(g){const s="https://api.dawclaudecode.com";return(w,n)=>(u(),r("section",c,[i(t(p),{class:"support-card",bordered:!1},{default:d(()=>[n[7]||(n[7]=e("header",{class:"card-header"},[e("div",null,[e("h2",null,"API 集成示例"),e("p",null,"快速复制粘贴即可调用 DawAPI，以下示例基于当前环境配置。")])],-1)),e("div",m,[n[3]||(n[3]=e("h3",null,"基础信息",-1)),e("ul",h,[e("li",null,[n[0]||(n[0]=e("strong",null,"Base URL：",-1)),l(o(t(s)),1)]),n[1]||(n[1]=e("li",null,[e("strong",null,"认证方式："),l("Authorization: Bearer sk-XXXX")],-1)),n[2]||(n[2]=e("li",null,[e("strong",null,"常用端点："),l("/dashboard/status · /dashboard/bill · /v1/chat/completions")],-1))])]),e("div",y,[e("article",null,[n[4]||(n[4]=e("h4",null,"cURL",-1)),e("pre",null,[e("code",null,'curl -X POST "'+o(t(s))+`/v1/chat/completions" \\ 
  -H "Authorization: Bearer \${TOKEN}" \\ 
  -H "Content-Type: application/json" \\ 
  -d '{
    "model": "gpt-4o-mini",
    "messages": [
      {"role": "system", "content": "You are DawAPI."},
      {"role": "user", "content": "Say hi"}
    ]
  }'`,1)])]),e("article",null,[n[5]||(n[5]=e("h4",null,"JavaScript (fetch)",-1)),e("pre",null,[e("code",null,'const response = await fetch("'+o(t(s))+`/v1/chat/completions", {
  method: "POST",
  headers: {
    "Authorization": \`Bearer \${TOKEN}\`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are DawAPI." },
      { role: "user", content: "Say hi" }
    ]
  })
});
const data = await response.json();`,1)])]),e("article",null,[n[6]||(n[6]=e("h4",null,"Python (requests)",-1)),e("pre",null,[e("code",null,`import requests

headers = {
  "Authorization": f"Bearer {TOKEN}",
  "Content-Type": "application/json"
}

payload = {
  "model": "gpt-4o-mini",
  "messages": [
    {"role": "system", "content": "You are DawAPI."},
    {"role": "user", "content": "Say hi"}
  ]
}

resp = requests.post("`+o(t(s))+`/v1/chat/completions", json=payload, headers=headers)
print(resp.json())`,1)])])])]),_:1})]))}},v=a(f,[["__scopeId","data-v-98e6c2dd"]]);export{v as default};
