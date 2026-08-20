import fetch from 'node-fetch';

async function test() {
  const url = 'http://localhost:3000/api/proxy-image?url=https%3A%2F%2Fiam-web-images.s3.ap-south-1.amazonaws.com%2Fmiscellaneous%2Fpw%2Blogo.png';
  const res = await fetch(url);
  console.log('Status:', res.status);
  const blob = await res.arrayBuffer();
  console.log('Size:', blob.byteLength);
}
test();
