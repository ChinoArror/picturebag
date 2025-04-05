export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const hostname = url.hostname;

    // 初始化prefix
    let prefix = '';
    
    // 根据域名判断prefix
    if (hostname === 'wall.pi.yukies.top' || hostname === 'api-hrandom-pic.onani.cn') {
      prefix = '/wallpaper/';
    } else if (hostname === 'anime.pi.yukies.top' || hostname === 'api-vrandom-pic.onani.cn') {
      prefix = '/anime';
    } else {
      return new Response('Invalid domain', { status: 400 });
    }

    try {
      // 如果是API域名，只返回数量
      if (hostname.startsWith('api-')) {
        const objects = await bucket.list({ prefix: prefix });
        const count = objects.objects.length;
        const headers = new Headers({
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'text/plain'
        });
        return new Response(count.toString(), { headers });
      }

      // 原有的随机图片逻辑
      const objects = await bucket.list({ prefix: prefix });
      const items = objects.objects;
      
      if (items.length === 0) {
        return new Response('No images found', { status: 404 });
      }
      
      const randomItem = items[Math.floor(Math.random() * items.length)];
      const object = await bucket.get(randomItem.key);

      if (!object) {
        return new Response('Image not found', { status: 404 });
      }

      const headers = new Headers();
      headers.set('Content-Type', object.httpMetadata.contentType || 'image/jpeg');

      return new Response(object.body, { headers });
    } catch (error) {
      console.error('Error:', error);
      return new Response('Internal Server Error', { status: 500 });
    }
  },
};
