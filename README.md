# 1024 Pixels Art

[1024pixels.art](https://1024pixels.art) allows anyone create 32 x 32 = 1024 pixels GIF images and stores on Polygon blockchain which makes the image unique and immutable.

### NFT Format

1024Pixels follow the ERC-721 standards, and supports ERC-165, ERC-2981.

### Image Format

1024Pixels stores as 32x32 GIF format with 64 index colors (63 RGB colors and 1 transparent color). The tokenID is the hash of index colors so there are no same images on chain.

### How to Get Image from Blockchain

Read the contract [0x1024Accd05Fa01AdbB74502DBDdd8e430d610c53](https://polygonscan.com/address/0x1024accd05fa01adbb74502dbddd8e430d610c53#readContract):

imageURI() returns GIF image as Base64 encoded:

```
imageURI(tokenId) =>
"data:image/gif;base64,R0lGODlhYABgAPU/AP/AwP//wMD/wA..."
```

tokenURI() return JSON metadata including the image:

```
tokenURI(tokenId) =>
"data:application/json;base64,eyJuYW1lIjoiMTAyNCBQaXhlbHMgIy..."
```
