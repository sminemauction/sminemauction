import { useEffect, useState } from 'react';
import {  parseAbiItem, decodeEventLog, decodeFunctionData, transactionType } from 'viem';
import { createPublicClient, http } from 'viem';
import { mainnet } from 'wagmi';
import './auctionInfo.css'
import bild1 from './a.jpg'
import hosanna from './assets/hosanna.mp3';


    const  publicClient = createPublicClient({
        chain: mainnet,
        transport: http()
    })
    
function AuctionInfo() {
    const [previousBids, setPreviousBids] = useState([]);
    const [currentBids, setCurrentBids] = useState([]);
    const [previousFirst, setPreviousFirst] = useState();
    const [previousSecond, setPreviousSecond] = useState();
    const [previousThird, setPreviousThird] = useState();
    const [currentFirst, setcurrentFirst] = useState();
    const [currentSecond, setcurrentSecond] = useState();
    const [currentThird, setcurrentThird] = useState();

    let audio = new Audio(hosanna)

    //-List of addresses that sent token from the contract "0x9778ac3d5a2f916aa9abf1eb85c207d990ca2655" to this address: 0x000000000000000000000000000000000000dEaD
    //-List shows top 3 addresses Sorted from high to low amount within 72H timeframe; after 72H a new list starts.
    //-top 3 addresses of the 72H timeframe before the current one must also be shown

    useEffect(() => {
        async function getInfo() {

        const startBlock = 18564887;
        const blocksPerPeriod = 21600 //per 72h

        const currentBlock = await publicClient.getBlockNumber()
        const currentBlockInt = parseInt(currentBlock.toString());

        const timeSinceStart = currentBlockInt - startBlock;
        const periodNumber = parseInt(timeSinceStart/blocksPerPeriod);

        let previousPeriodStart = startBlock + (periodNumber - 1) * blocksPerPeriod;

        let currentFirst = {address: '', bid: 0};
        let currentSecond = {address: '', bid: 0};
        let currentThird = {address: '', bid: 0};
        let currentAllBids = [];

        let previousFirst = {address: '', bid: 0};
        let previousSecond = {address: '', bid: 0};
        let previousThird = {address: '', bid: 0};
        let previousAllBids = [];
            
        const logs = await publicClient.getLogs({
            address: "0x9778ac3d5a2f916aa9abf1eb85c207d990ca2655",
            event: parseAbiItem('event Transfer(address indexed from, address indexed to, uint256 value)'),
            // args: {
            //     to: '0x000000000000000000000000000000000000dEaD'
            // },
            fromBlock: previousPeriodStart.toString(),
            toBlock: 'latest',
        })
        console.log(logs)

        for(let i=0; i<logs.length; i++) {
            const bidder = {address: '', bid: 0};
            bidder.bid = (parseInt(logs[i].args.value)/10**18 / 10**9) // / 10**9 to display in Billion
            // bidder.bid = (parseInt(logs[i].args.value)/10**24) //
            const address = logs[i].args.from
            bidder.address = '0x.....' + address.substring(address.length - 5)

            const logsBlock = (logs[i].blockNumber).toString();

            if(logsBlock < previousPeriodStart + blocksPerPeriod) {
                previousAllBids.push(bidder);

                if(bidder.bid > previousFirst.bid) {
                    previousThird.bid = previousSecond.bid;
                    previousThird.address = previousSecond.address;
        
                    previousSecond.bid = previousFirst.bid;
                    previousSecond.address = previousFirst.address;
        
                    previousFirst.bid = bidder.bid
                    previousFirst.address = bidder.address
                }
                else if(bidder.bid < previousFirst.bid
                        && bidder.bid > previousSecond.bid) {
                    previousThird.bid = previousSecond.bid;
                    previousThird.address = previousSecond.address;
        
                    previousSecond.bid = bidder.bid;
                    previousSecond.address = bidder.address;
                }
                else if(bidder.bid < previousSecond.bid
                        && bidder.bid > previousThird.bid) {
        
                    previousThird.bid = bidder.bid;
                    previousThird.address = bidder.address;
                }
            }
            if(logsBlock >= previousPeriodStart + blocksPerPeriod) {
                currentAllBids.push(bidder);

                if(bidder.bid > currentFirst.bid) {
                    currentThird.bid = currentSecond.bid;
                    currentThird.address = currentSecond.address;
        
                    currentSecond.bid = currentFirst.bid;
                    currentSecond.address = currentFirst.address;
        
                    currentFirst.bid = bidder.bid
                    currentFirst.address = bidder.address
                }
                else if(bidder.bid < currentFirst.bid
                        && bidder.bid > currentSecond.bid) {
                    currentThird.bid = currentSecond.bid;
                    currentThird.address = currentSecond.address;
        
                    currentSecond.bid = bidder.bid;
                    currentSecond.address = bidder.address;
                }
                else if(bidder.bid < currentSecond.bid
                        && bidder.bid > currentThird.bid) {
        
                    currentThird.bid = bidder.bid;
                    currentThird.address = bidder.address;
                }
            }
        }
        // console.log(previousFirst);
        // console.log(previousSecond);
        // console.log(previousThird);

        console.log(currentFirst);
        console.log(currentSecond);
        console.log(currentThird);
        setPreviousBids(previousAllBids);
        setCurrentBids(currentAllBids);
        setPreviousFirst(previousFirst);
        setPreviousSecond(previousSecond);
        setPreviousThird(previousThird);
        setcurrentFirst(currentFirst);
        setcurrentSecond(currentSecond);
        setcurrentThird(currentThird);
    }
    getInfo();

    }, [])

    const start = () => {
        audio.play();
    }

    const pause = () => {
        audio.pause();
    } 

    return(
        <>
        {previousFirst ? 
            <div>
                <div className='button'>
                <p className='button'>
                    <button onClick={start}>Hosanna</button>
                    <button onClick={pause}>Nosanna</button>
                </p>
                </div>
                <div className='leaderboard'>
                <div className='leaderboard'>
                    <p className='leaderItem'>1st - {currentFirst.address}</p>
                    <p>Bid - {parseFloat(currentFirst.bid).toFixed(2)}B $OGSM </p>
                </div>
                <div className='leaderboard'>
                    <p className='leaderItem'>2nd - {currentSecond.address}</p>
                    <p>Bid - {parseFloat(currentSecond.bid).toFixed(2)}B $OGSM</p>
                </div>
                <div className='leaderboard'>
                    <p className='leaderItem'>3rd - {currentThird.address}</p>
                    <p>Bid - {parseFloat(currentThird.bid).toFixed(2)}B $OGSM</p>
                </div>
                </div>
               <!-- Zeile 1 -->
	<div class="image-container">
    <img src="A.jpg" alt="Bild 1" width="1280" height="1209">
	</div>

  



	
<div>
<font color=FFFFFF"
<br>
<br>
Good morning and welcome to <br> <br>

Sminemboy's <br>
Quantumimmortal Surrealty<br> <br>

ze Auction House of ze Sminem. <br> <br> <br>


Here you bid on ze Lord's Reliquia and godly hand-crafted artworks by bringing your $OGSM to the sacrifice. <br>
Sminem creates art for you. You bid by burning $OGSM. <br> <br>

Zis is the next iteration of max-bidding-technology. <br> <br> 

Rules are simple: <br>
Highest bidder in given timeframe wins the auctioned item. <br>
Second and third place get a consolation prize: <a href="https://opensea.io/collection/sminems">SMINEMS NFT</a>
<br> <br>

Pro tip: You can buy $OGSM (CA: 0x9778ac3d5a2f916aa9abf1eb85c207d990ca2655) on f.e. 1inch.io <br>
and add send to 0x000000000000000000000000000000000000dEaD in order to save on gas. <br>
</font>
               
            </div>
        : 
            <div>
                <div>
                    <p className='button'>
                        <button onClick={start}>Hosanna</button>
                        <button onClick={pause}>Nosanna</button>
                    </p>
                    <div className='leaderboard'>
                        <p className='leaderItem'>1st - Address</p>
                        <p>Bid - Bid </p>
                    </div>
                    <div className='leaderboard'>
                        <p className='leaderItem'>2nd - Address</p>
                        <p>Bid - Bid </p>
                    </div>
                    <div className='leaderboard'>
                        <p className='leaderItemLast'>3rd - Address</p>
                        <p>Bid - Bid </p>
                    </div>
                    <!-- Zeile 1 -->
	<div class="image-container">
    <img src="A.jpg" alt="Bild 1" width="1280" height="1209">
	</div>

  



	
<div>
<font color=FFFFFF"
<br>
<br>
Good morning and welcome to <br> <br>

Sminemboy's <br>
Quantumimmortal Surrealty<br> <br>

ze Auction House of ze Sminem. <br> <br> <br>


Here you bid on ze Lord's Reliquia and godly hand-crafted artworks by bringing your $OGSM to the sacrifice. <br>
Sminem creates art for you. You bid by burning $OGSM. <br> <br>

Zis is the next iteration of max-bidding-technology. <br> <br> 

Rules are simple: <br>
Highest bidder in given timeframe wins the auctioned item. <br>
Second and third place get a consolation prize: <a href="https://opensea.io/collection/sminems">SMINEMS NFT</a>
<br> <br>

Pro tip: You can buy $OGSM (CA: 0x9778ac3d5a2f916aa9abf1eb85c207d990ca2655) on f.e. 1inch.io <br>
and add send to 0x000000000000000000000000000000000000dEaD in order to save on gas. <br>
</font>
                </div>
            </div>
        }
        </>

    )
}

export default AuctionInfo
