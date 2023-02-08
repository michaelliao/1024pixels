const fs = require("node:fs/promises");
const { Buffer } = require('node:buffer');
const { BigNumber } = require("ethers");

const {
    time,
    loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("1024 Pixels", function () {

    const PIXELS_TOKEN_ID_1 = '0x4fd0de2dc552f39e731cfb4d783c94bc1d8ed9e6569d8d4aa4baa5daef1c6cb9';
    const PIXELS_TOKEN_ID_2 = '0x8399615d1a2263011f8ae01bb72601c541d1bab0ea6b5473f28a062b220743d2';
    const PIXELS_TOKEN_ID_3 = '0x1111111111111111111111111111111111111111111111111111111111111111';

    const ANIMATIONS_TOKEN_ID = '0x81a9d039ae03769d6b9aa84ae25936c73f19d25a1f6a139d47e85e22e92da29e';
    const ANIMATIONS_TOKEN_ID_2 = '0xa3c5282ea00338e69a742dbac34fe5188511add119a7b31c9aab5f424a72960b';

    const PIXELS_1 = '0x' + '000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3e3f'.repeat(16);
    const PIXELS_2 = '0x' + '0102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f003f202122232425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3e'.repeat(16);

    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    async function deployPixelsFixture() {
        // Contracts are deployed using the first signer/account by default
        const [owner, otherAccount] = await ethers.getSigners();
        const PixelsArt = await ethers.getContractFactory("Pixels");
        const pixelsContract = await PixelsArt.deploy("1024 Pixels", "1KP", otherAccount.address);
        const AnimationsArt = await ethers.getContractFactory("Animations");
        const animationsContract = await AnimationsArt.deploy("1024 Animations", "1KA", otherAccount.address, pixelsContract.address);
        return [pixelsContract, animationsContract];
    }

    async function readFileAsBase64(path) {
        let r = await readFileAsUint8Array(path);
        return r.toString('base64');
    }

    async function readFileAsUint8Array(path) {
        return await fs.readFile(path);
    }

    describe("Deployment", function () {
        it("Should mint ok", async function () {
            const [pixelsContract, animationsContract] = await loadFixture(deployPixelsFixture);
            // mint single:
            await pixelsContract.mint(PIXELS_1);
            let singleImage = 'data:image/gif;base64,' + await readFileAsBase64('test/single.gif');
            let tokenId1 = BigNumber.from(PIXELS_TOKEN_ID_1).toString();
            let singleJson = 'data:application/json;base64,' + Buffer.from(`{"name":"1024 Pixels # ${tokenId1}","image":"${singleImage}"}`).toString('base64');
            expect(await pixelsContract.imageURI(PIXELS_TOKEN_ID_1)).to.equals(singleImage);
            expect(await pixelsContract.tokenURI(PIXELS_TOKEN_ID_1)).to.equals(singleJson);
            expect(await pixelsContract.imageData(PIXELS_TOKEN_ID_1)).to.equals(PIXELS_1);
            expect(await pixelsContract.tokenExist(PIXELS_TOKEN_ID_1)).to.be.true;
            expect(await pixelsContract.tokenExist(PIXELS_TOKEN_ID_2)).to.be.false;

            // mint another single:
            await pixelsContract.mint(PIXELS_2);
            expect(await pixelsContract.tokenExist(PIXELS_TOKEN_ID_2)).to.be.true;

            // mint animations:
            let interval = 10;
            let animationImage = 'data:image/gif;base64,' + await readFileAsBase64('test/animate.gif');
            let tokenId2 = BigNumber.from(ANIMATIONS_TOKEN_ID).toString();
            let animationJson = 'data:application/json;base64,' + Buffer.from(`{"name":"1024 Animations # ${tokenId2}","image":"${animationImage}"}`).toString('base64');
            await animationsContract.mint(interval, [PIXELS_TOKEN_ID_1, PIXELS_TOKEN_ID_2]);
            expect(await animationsContract.imageURI(ANIMATIONS_TOKEN_ID)).to.equals(animationImage);
            expect(await animationsContract.tokenURI(ANIMATIONS_TOKEN_ID)).to.equals(animationJson);
            expect(await animationsContract.tokenExist(ANIMATIONS_TOKEN_ID)).to.be.true;
            expect(await animationsContract.tokenExist(ANIMATIONS_TOKEN_ID_2)).to.be.false;
            let aniImageData = await animationsContract.imageData(ANIMATIONS_TOKEN_ID);
            expect(aniImageData[0]).to.equals(100);
            expect(aniImageData[1].length).to.equals(2);
            expect(aniImageData[1][0].toHexString()).to.equals(PIXELS_TOKEN_ID_1);
            expect(aniImageData[1][1].toHexString()).to.equals(PIXELS_TOKEN_ID_2);

            // mint large animations:
            console.log('mint large animation...');
            await animationsContract.mint(4, [PIXELS_TOKEN_ID_1, PIXELS_TOKEN_ID_2, PIXELS_TOKEN_ID_1, PIXELS_TOKEN_ID_2]);
            let animation8Image = 'data:image/gif;base64,' + await readFileAsBase64('test/animate4.gif');
            let tokenId4 = BigNumber.from(ANIMATIONS_TOKEN_ID_2).toString();
            let animation8Json = 'data:application/json;base64,' + Buffer.from(`{"name":"1024 Animations # ${tokenId4}","image":"${animation8Image}"}`).toString('base64');
            console.log('get image URI...');
            expect(await animationsContract.imageURI(ANIMATIONS_TOKEN_ID_2)).to.equals(animation8Image);
            console.log('get token URI...');
            expect(await animationsContract.tokenURI(ANIMATIONS_TOKEN_ID_2)).to.equals(animation8Json);
            expect(await animationsContract.tokenExist(ANIMATIONS_TOKEN_ID_2)).to.be.true;
        });

        it("Basic info", async function () {
            const [pixelsContract, animationsContract] = await loadFixture(deployPixelsFixture);
            for (let contract of [pixelsContract, animationsContract]) {
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
            }
        });

        it("Get creator", async function () {
            const [owner, otherAccount] = await ethers.getSigners();
            const [pixelsContract, animationsContract] = await loadFixture(deployPixelsFixture);
            await pixelsContract.mint(PIXELS_1);
            expect(await pixelsContract.creatorOf(PIXELS_TOKEN_ID_1)).to.equals(owner.address);
            let redirector = '0x1234567890123456789012345678901234567890';
            await pixelsContract.setCreatorRedirect(redirector);
            expect(await pixelsContract.creatorOf(PIXELS_TOKEN_ID_1)).to.equals(redirector);
            await pixelsContract.setCreatorRedirect('0x0000000000000000000000000000000000000000');
            expect(await pixelsContract.creatorOf(PIXELS_TOKEN_ID_1)).to.equals(owner.address);
        });

        it("Should mint failed: invalid pixels", async function () {
            const [pixelsContract, animationsContract] = await loadFixture(deployPixelsFixture);
            await expect(pixelsContract.mint('0x40' + PIXELS_1.substring(4))).to.be.revertedWith('Pixels: invalid pixel index color');
            await expect(pixelsContract.mint(PIXELS_1 + '01')).to.be.revertedWith('Pixels: invalid pixels length');
        });

        it("Should mint failed: already minted", async function () {
            const [pixelsContract, animationsContract] = await loadFixture(deployPixelsFixture);
            await pixelsContract.mint(PIXELS_1);
            await expect(pixelsContract.mint(PIXELS_1)).to.be.revertedWith('ERC721: token already minted');
        });

        it("Should mint failed: invalid token ids", async function () {
            const [pixelsContract, animationsContract] = await loadFixture(deployPixelsFixture);
            await pixelsContract.mint(PIXELS_1);
            await pixelsContract.mint(PIXELS_2);

            await expect(animationsContract.mint(10, [PIXELS_TOKEN_ID_1])).to.be.revertedWith('Animations: invalid token id length');
            await expect(animationsContract.mint(10, Array(5).fill(PIXELS_TOKEN_ID_1))).to.be.revertedWith('Animations: invalid token id length');
            await expect(animationsContract.mint(10, Array(4).fill(PIXELS_TOKEN_ID_1))).to.be.revertedWith('Animations: same token ids');
            await expect(animationsContract.mint(10, [PIXELS_TOKEN_ID_1, PIXELS_TOKEN_ID_3])).to.be.revertedWith('Animations: invalid token id');
        });

        it("Admin ops", async function () {
            const [pixelsContract, animationsContract] = await loadFixture(deployPixelsFixture);
            for (let contract of [pixelsContract, animationsContract]) {
                await expect(contract.setMintFee(10000)).to.be.revertedWith('Ownable: caller is not the owner');
                await expect(contract.setSuperOperator('0x1234567890123456789012345678901234567890', true)).to.be.revertedWith('Ownable: caller is not the owner');
                await expect(contract.setRoyaltyFraction(200)).to.be.revertedWith('Ownable: caller is not the owner');
                await expect(contract.withdraw(['0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'])).to.be.revertedWith('Ownable: caller is not the owner');
            }
            await expect(animationsContract.setMaxFrames(6)).to.be.revertedWith('Ownable: caller is not the owner');
        });
    });
});
