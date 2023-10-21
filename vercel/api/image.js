import { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req, res) {
  const url = 'https://api.thegraph.com/subgraphs/name/michaelliao/1024pixels';
  const id = req.query.id;
  if (!id) {
    return res.json({
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
}`
  };
  let resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(query)
  };
  if (resp.status !== 200) {
    return res.json({
      error: `Bad response: ${resp.status}`
    });
  }
  return res.json(resp.data);
}
