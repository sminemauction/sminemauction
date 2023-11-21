import { useEffect, useState } from 'react';
import {  parseAbiItem, decodeEventLog, decodeFunctionData, transactionType } from 'viem';
import { createPublicClient, http } from 'viem';
import { mainnet } from 'wagmi';
import './auctionInfo.css'
import bild1 from './assets/bild1.jpg'
import bild2_1 from './assets/bild2_1.jpg';
import bild2_2 from './assets/bild2_2.jpg';
import bild2_3 from './assets/bild2_3.jpg';
import bild3_1 from './assets/bild3_1.jpg';
import bild3_2 from './assets/bild3_2.jpg';
import bild3_3 from './assets/bild3_3.jpg';
import bild4 from './assets/bild4.jpg';
import bild5 from './assets/bild5.jpg';
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
            bidder.bid = (parseInt(logs[i].args.value)/10**18 / 10**6) // / 10**9 to display in Billion
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
                <p className='button'>
                    <button onClick={start}>Hosanna</button>
                    <button onClick={pause}>Nosanna</button>
                </p>
                <div className='leaderboard'>
                    <p className='leaderItem'>1st - {currentFirst.address}</p>
                    <p>Bid - {parseFloat(currentFirst.bid).toFixed(2)}M $OGSM </p>
                </div>
                <div className='leaderboard'>
                    <p className='leaderItem'>2nd - {currentSecond.address}</p>
                    <p>Bid - {parseFloat(currentSecond.bid).toFixed(2)}B $OGSM</p>
                </div>
                <div className='leaderboard'>
                    <p className='leaderItem'>3rd - {currentThird.address}</p>
                    <p>Bid - {parseFloat(currentThird.bid).toFixed(2)}B $OGSM</p>
                </div>
                {/* <!-- Zeile 1 --> */}
                <div className="image-container">
                    <img src={bild1} alt="Bild 1" width="640" height="32"></img>
                </div>
                {/* <!-- Zeile 2 --> */}
                <div className="image-container">
                    <img src={bild2_1} alt="Bild 2.1" width='100%' height="100"></img>
                    <img src={bild2_2} alt="Bild 2.2" width="150" height="100"></img>
                    <img src={bild2_3} alt="Bild 2.3" width='100%' height="100"></img>
                </div>
                {/* <!-- Zeile 3 --> */}
                <div className="image-container">
                    <img src={bild3_1} alt="Bild 3.1" width='100%' height="30"></img>
                    <img src={bild3_2} alt="Bild 3.2" width='100%' height="30"></img>
                    <img src={bild3_3} alt="Bild 3.3" width='100%' height="30"></img>
                </div>
                {/* <!-- Zeile 4 --> */}
                <div class="image-container">
                    <img src={bild4} width="640" height="345" alt="" border="0"></img>
                </div>
                {/* <!-- Zeile 5 --> */}
                <div class="image-container">
                    <img src={bild5} alt="Bild 5" width="640" height='100%'></img>
                </div>
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
                    {/* <!-- Zeile 1 --> */}
                    <div className="image-container">
                        <img src={bild1} alt="Bild 1" width="640" height="32"></img>
                    </div>
                    {/* <!-- Zeile 2 --> */}
                    <div className="image-container">
                        <img src={bild2_1} alt="Bild 2.1" width='100%' height="100"></img>
                        <img src={bild2_2} alt="Bild 2.2" width="150" height="100"></img>
                        <img src={bild2_3} alt="Bild 2.3" width='100%' height="100"></img>
                    </div>
                    {/* <!-- Zeile 3 --> */}
                    <div className="image-container">
                        <img src={bild3_1} alt="Bild 3.1" width='100%' height="30"></img>
                        <img src={bild3_2} alt="Bild 3.2" width='100%' height="30"></img>
                        <img src={bild3_3} alt="Bild 3.3" width='100%' height="30"></img>
                    </div>
                    {/* <!-- Zeile 4 --> */}
                    <div class="image-container">
                        <img src={bild4} width="640" height="345" alt="" border="0"></img>
                    </div>
                    {/* <!-- Zeile 5 --> */}
                    <div class="image-container">
                        <img src={bild5} alt="Bild 5" width="640" height='100%'></img>
                    </div>
                </div>
            </div>
        }
        </>

    )
}

export default AuctionInfo
