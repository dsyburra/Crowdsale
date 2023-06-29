const {expect} = require('chai');
const {ethers} = require('hardhat');

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
}
const ether = tokens;

describe('Crowdsale', () =>{
    let crowdsale, token
    let accounts, deployer, user1

    beforeEach(async () => {
        const Crowdsale = await ethers.getContractFactory('Crowdsale')
        const Token = await ethers.getContractFactory('Token')
        
        token = await Token.deploy('Dapp University', 'Dapp','1000000')

        accounts = await ethers.getSigners()
        deployer = accounts[0]
        user1 = accounts[1]
        
        crowdsale = await Crowdsale.deploy(token.address, ether(1), '1000000')

        let transaction = await token.connect(deployer).transfer(crowdsale.address, tokens(1000000))
        await transaction.wait()
    })
    describe('Deployment', () =>{

        it('sends tokens to the Crowdsale contract', async () => {
            expect(await token.balanceOf(crowdsale.address)).to.equal(tokens(1000000))
        })

        it('returns the price', async () => {
            expect(await crowdsale.token()).to.equal(token.address)
        })
        
        it('returns token address', async () => {
            expect(await crowdsale.token()).to.equal(token.address)
        })
    })
    describe('Buying Tokens', () => {
        let amount = tokens(10)
        let transaction , result
        
        describe('Success', () => {
            beforeEach(async () => {
                transaction =await crowdsale.connect(user1).buyTokens(amount,{value: ether(10)})
                result = await transaction.wait()
            })

            it('transfers tokens', async () => {
                expect(await token.balanceOf(crowdsale.address)).to.be.equal(tokens(999990))
                expect(await token.balanceOf(user1.address)).to.be.equal(amount)
            })
            it('updates contracts ether balance', async () => {
                expect(await ethers.provider.getBalance(crowdsale.address)).to.be.equal(amount)
                
            })
            it('updates tokenSold', async () => {
                expect(await crowdsale.tokenSold()).to.be.equal(amount)
            })   
            it('emits a buy event', async () => {              
                await expect(transaction).to.emit(crowdsale, 'Buy').withArgs(amount, user1.address)
            })

        })
        describe('Failure', () => {

            it('rejects insufficient ETH', async () => {
                await expect(crowdsale.connect(user1).buyTokens(tokens(10), { value: 0 })).to.be.reverted
            })
            
        })
    })
    describe('Sending ETH', () =>{
        let amount = ether(10)
        let transaction , result

        describe('Success', () => {
            beforeEach(async () => {
                transaction = await user1.sendTransaction({ to: crowdsale.address,  value: amount})
                result = await transaction.wait()
            })
            it('updates contracts ether balance', async () => {
                expect(await ethers.provider.getBalance(crowdsale.address)).to.equal(amount)  
            })
            it('updates user token balance', async () => {
                expect(await token.balanceOf(user1.address)).to.equal(amount) 
            })

         })

    })

})
