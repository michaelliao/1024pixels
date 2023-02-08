const {
    open
} = require("node:fs/promises");
const { Buffer } = require('node:buffer');
const { BigNumber } = require("ethers");

const {
    time,
    loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

describe("1024 Pixels", function () {

    const TOKEN_ID = '0x4fd0de2dc552f39e731cfb4d783c94bc1d8ed9e6569d8d4aa4baa5daef1c6cb9';
    const PIXELS = '0x' + '000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3e3f'.repeat(16);

    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    async function deployPixelsFixture() {
        // Contracts are deployed using the first signer/account by default
        const [owner, otherAccount] = await ethers.getSigners();
        const PixelArt = await ethers.getContractFactory("Pixels");
        const contract = await PixelArt.deploy("1024 Pixels", "1KP", otherAccount.address);
        return contract;
    }

    async function readFileAsBase64(path) {
        let r = await readFileAsUint8Array(path);
        return r.toString('base64');
    }

    async function readFileAsUint8Array(path) {
        let fp;
        try {
            fp = await open(path, 'r');
            let data = await fp.read();
            return data.buffer.subarray(0, data.bytesRead);
        } finally {
            fp?.close();
        }
    }

    describe("Deployment", function () {
        it("Should mint ok", async function () {
            const contract = await loadFixture(deployPixelsFixture);
            await contract.mint(PIXELS);
            let dataPixels = '0x' + '000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3e3f'.repeat(16);
            let dataImage = 'data:image/gif;base64,' + await readFileAsBase64('test/single.gif');
            let tokenIdAsDecimal = BigNumber.from(TOKEN_ID).toString();
            let dataJson = 'data:application/json;base64,' + Buffer.from(`{"name":"1024 Pixels # ${tokenIdAsDecimal}","image":"${dataImage}"}`).toString('base64');
            expect(await contract.imageURI(TOKEN_ID)).to.equals(dataImage);
            expect(await contract.tokenURI(TOKEN_ID)).to.equals(dataJson);
            expect(await contract.imageData(TOKEN_ID)).to.equals(dataPixels);
        });

        it("Basic info", async function () {
            const contract = await loadFixture(deployPixelsFixture);
            // IERC165:
            expect(await contract.supportsInterface('0x01ffc9a7')).to.be.true;
            // IERC721:
            expect(await contract.supportsInterface('0x80ac58cd')).to.be.true;
            // IERC721MetaData:
            expect(await contract.supportsInterface('0x5b5e139f')).to.be.true;
            // IERC2981:
            expect(await contract.supportsInterface('0x2a55205a')).to.be.true;
            // Invalid ID:
            expect(await contract.supportsInterface('0xffffffff')).to.be.false;
        });

        it("Get creator", async function () {
            const [owner, otherAccount] = await ethers.getSigners();
            const contract = await loadFixture(deployPixelsFixture);
            await contract.mint(PIXELS);
            expect(await contract.creatorOf(TOKEN_ID)).to.equals(owner.address);
            let redirector = '0x1234567890123456789012345678901234567890';
            await contract.setCreatorRedirect(redirector);
            expect(await contract.creatorOf(TOKEN_ID)).to.equals(redirector);
            await contract.setCreatorRedirect('0x0000000000000000000000000000000000000000');
            expect(await contract.creatorOf(TOKEN_ID)).to.equals(owner.address);
        });

        it("Should mint failed: invalid pixels", async function () {
            const contract = await loadFixture(deployPixelsFixture);
            await expect(contract.mint('0x40' + PIXELS.substring(4))).to.be.revertedWith('Pixels: invalid pixel index color');
            await expect(contract.mint(PIXELS + '01')).to.be.revertedWith('Pixels: invalid pixels length');
        });

        it("Should mint failed: already minted", async function () {
            const contract = await loadFixture(deployPixelsFixture);
            await contract.mint(PIXELS);
            await expect(contract.mint(PIXELS)).to.be.revertedWith('ERC721: token already minted');
        });

        it("Admin ops", async function () {
            const contract = await loadFixture(deployPixelsFixture);
            await expect(contract.setMintFee(10000)).to.be.revertedWith('Ownable: caller is not the owner');
            await expect(contract.setSuperOperator('0x1234567890123456789012345678901234567890', true)).to.be.revertedWith('Ownable: caller is not the owner');
            await expect(contract.setRoyaltyFraction(200)).to.be.revertedWith('Ownable: caller is not the owner');
            await expect(contract.withdraw(['0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'])).to.be.revertedWith('Ownable: caller is not the owner');
        });
    });
});
