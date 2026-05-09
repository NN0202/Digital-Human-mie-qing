// api/log-conversation.js 
// 这个函数运行在Vercel的服务器上，密钥存储在环境变量中，很安全。 
export default async function handler(req, res) { 
  // 1. 只允许POST请求 
  if (req.method !== 'POST') { 
    return res.status(405).json({ error: 'Method Not Allowed' }); 
  } 

  const { user_id, role_engaged, intent_phase, topic_trigger, user_region, conversation_duration, product_clicked, converted } = req.body; 

  // 2. 从环境变量安全地获取密钥和表格ID 
  const appId = process.env.FEISHU_APP_ID; 
  const appSecret = process.env.FEISHU_APP_SECRET; 
  const appToken = process.env.FEISHU_APP_TOKEN; 
  const tableId = process.env.FEISHU_TABLE_ID; 

  try { 
    // 3. 用密钥去飞书服务器换取一个有时效性的访问令牌 (Token) 
    const tokenRes = await fetch('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ app_id: appId, app_secret: appSecret }) 
    }); 
    const tokenData = await tokenRes.json(); 
    const accessToken = tokenData.tenant_access_token; 

    // 4. 使用令牌将前端发来的数据安全写入飞书表格 
    const logRes = await fetch(`https://open.feishu.cn/open-apis/bitable/v1/apps/${appToken}/tables/${tableId}/records`, { 
      method: 'POST', 
      headers: { 
        'Authorization': `Bearer ${accessToken}`, 
        'Content-Type': 'application/json' 
      }, 
      body: JSON.stringify({ 
        fields: { 
          "user_id": user_id, 
          "role_engaged": role_engaged, 
          "intent_phase": intent_phase, 
          "topic_trigger": topic_trigger, 
          "user_region": user_region, 
          "conversation_duration": conversation_duration, 
          "product_clicked": product_clicked, 
          "converted": converted 
        } 
      }) 
    }); 
    const logData = await logRes.json(); 

    // 5. 把结果返回给前端 
    res.status(200).json({ success: true, data: logData }); 
  } catch (error) { 
    console.error(error); 
    res.status(500).json({ success: false, error: error.message }); 
  } 
}
