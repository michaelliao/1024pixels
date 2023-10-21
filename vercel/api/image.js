// image api:

module.exports = async function handler(req, res) {
  const url = 'https://api.thegraph.com/subgraphs/name/michaelliao/1024pixels';
  const id = req.query.id;
  if (!id) {
    return res.status(400).json({
      error: 'Missing id'
    });
  }
  let query = {
    query: `
{
  pixelsNfts(where:{id:"${id}"}) {
    id
    owner
    creator
    image
  }
}`
  };
  let resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(query)
  });
  if (resp.status !== 200) {
    return res.status(400).json({
      error: `Bad response: ${resp.status}`
    });
  }
  let result = await resp.json();
  let nfts = result.data.pixelsNfts;
  if (nfts.length === 0) {
    return res.status(404).json({
      error: `Token not found: ${id}`
    });
  }
  let nft = nfts[0];
  let dataImage = nft.image;
  if (!dataImage.startsWith('data:image/gif;base64,')) {
    return res.status(400).json({
      error: 'Invalid data image.'
    });
  }
  let svg = `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0" y="0" viewBox="0 0 32 32">
<image x="0" y="0" width="32" height="32" xlink:href="${dataImage}" />
</svg>`;
  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'max-age=315360000');
  res.send(svg);
}
