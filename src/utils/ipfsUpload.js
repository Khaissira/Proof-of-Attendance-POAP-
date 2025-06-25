import { Web3Storage } from 'web3.storage';

function getAccessToken() {
  return 'YOUR_WEB3_STORAGE_API_TOKEN';
}

function makeStorageClient() {
  return new Web3Storage({ token: getAccessToken() });
}

export async function uploadToIPFS(file) {
  const client = makeStorageClient();
  const cid = await client.put([file]);
  return `https://${cid}.ipfs.dweb.link/${file.name}`;
}

export async function uploadMetadata(metadata) {
  const client = makeStorageClient();
  const blob = new Blob([JSON.stringify(metadata)], { type: 'application/json' });
  const file = new File([blob], 'metadata.json');
  const cid = await client.put([file]);
  return `https://${cid}.ipfs.dweb.link/metadata.json`;
}
