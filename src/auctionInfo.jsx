import { useEffect, useState } from 'react';
import {  parseAbiItem, decodeEventLog, decodeFunctionData, transactionType } from 'viem';
import { createPublicClient, http } from 'viem';
import { mainnet } from 'wagmi';
import './auctionInfo.css'
import hosanna from './assets/hosanna.mp3';
import image from './assets/A.jpg';


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

///////// Input the correct start block for the first auctino here //////
        const startBlock = 18750529;
    ////////////////////////////////////////////////////////////////
        const blocksPerPeriod = 50400 //per 72h

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
            args: {
                to: '0x000000000000000000000000000000000000dEaD'
            },
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
                <div className='button'>
                <p className='button'>
                    <button onClick={start}>Hosanna</button>
                    <button onClick={pause}>Nosanna</button>
                </p>
                </div>
                <div className='leaderboard'>
                    <div className='leaderItem'>
                        <p className='leaderItem'>1st - {currentFirst.address}</p>
                        <p className='leaderBid'>Bid - {parseFloat(currentFirst.bid).toFixed(2)}M</p>
                    </div>
                    <div className='leaderItem'>
                        <p className='leaderItem'>2nd - {currentSecond.address}</p>
                        <p className='leaderBid'>Bid - {parseFloat(currentSecond.bid).toFixed(2)}M</p>
                    </div>
                    <div className='leaderItem'>
                        <p className='leaderItem'>3rd - {currentThird.address}</p>
                        <p className='leaderBid'>Bid - {parseFloat(currentThird.bid).toFixed(2)}M</p>
                    </div>
                </div>
                {/* <!-- Zeile 1 --> */}
                <div className="image-container">
                    <img src={image} alt="Bild 1" width="1280" height="1209"></img>
                </div>
                <font color="FFFFFF">
                        <br></br>
                        <br></br>
                        Good morning and welcome to 
                        <br></br>
                        <br></br>
                        Sminemboy's 
                        <br></br>
                        Quantumimmortal Surrealty
                        <br></br>
                        <br></br>
                        ze Auction House of ze Sminem. 
                        <br></br>
                        <br></br> 
                        <br></br>
                        Here you bid on ze Lord's Reliquia and godly hand-crafted artworks by bringing your $OGSM to the sacrifice. 
                        <br></br>
                        Sminem creates art for you. You bid by burning $OGSM.
                        <br></br>
                        <br></br>
                        Zis is the next iteration of max-bidding-technology.
                        <br></br> 
                        <br></br> 
                        Rules are simple:
                        <br></br>
                        Highest bidder in given timeframe wins the auctioned item.
                        <br></br>
                        Second and third place get a consolation prize: <a href="https://opensea.io/collection/sminems">SMINEMS NFT</a>
                        <br></br>
                        <br></br>
                        Pro tip: You can buy $OGSM (CA: 0x9778ac3d5a2f916aa9abf1eb85c207d990ca2655) on f.e. 1inch.io
                        <br></br>
                        and add send to 0x000000000000000000000000000000000000dEaD in order to save on gas.
                        <br></br>
                    ><a href="https://foundation.app/collection/sminart">see older Sminem works</a>
                    </font>
                    <div className='previousAuction'>
                    <p className='previousAuction'>Previous Auction: </p>
                    </div>
                    <div className='previousLeaderboard'>
                    <div className='leaderItem'>
                        <p className='leaderItem'>1st - {previousFirst.address}</p>
                        <p className='leaderBid'>Bid - {parseFloat(previousFirst.bid).toFixed(2)}M</p>
                    </div>
                    <div className='leaderItem'>
                        <p className='leaderItem'>2nd - {previousSecond.address}</p>
                        <p className='leaderBid'>Bid - {parseFloat(previousSecond.bid).toFixed(2)}M</p>
                    </div>
                    <div className='leaderItem'>
                        <p className='leaderItem'>3rd - {previousThird.address}</p>
                        <p className='leaderBid'>Bid - {parseFloat(previousThird.bid).toFixed(2)}M</p>
                    </div>
                </div>
            </div>
        : 
            <div>
                <div className='button'>
                    <p className='button'>
                        <button onClick={start}>Hosanna</button>
                        <button onClick={pause}>Nosanna</button>
                    </p>
                </div>
                <div className='leaderBoard'>
                    <div className='leaderItem'>
                        <p className='leaderItem'>1st - Loading....</p>
                        <p className='leaderBid'>Bid - Loading.... </p>
                    </div>
                    <div className='leaderItem'>
                        <p className='leaderItem'>2nd - Loading....</p>
                        <p className='leaderBid'>Bid - Loading.... </p>
                    </div>
                    <div className='leaderItem'>
                        <p className='leaderItem'>3rd - Loading....</p>
                        <p className='leaderBid'>Bid - Loading.... </p>
                    </div>
                </div>
                    {/* <!-- Zeile 1 --> */}
                <div className="image-container">
                    <img src={image} alt="Bild 1" width="1280" height="1209"></img>
                </div>
                    <font color="FFFFFF">
                        <br></br>
                        <br></br>
                        Good morning and welcome to 
                        <br></br>
                        <br></br>
                        Sminemboy's 
                        <br></br>
                        Quantumimmortal Surrealty
                        <br></br>
                        <br></br>
                        ze Auction House of ze Sminem. 
                        <br></br>
                        <br></br> 
                        <br></br>
                        Here you bid on ze Lord's Reliquia and godly hand-crafted artworks by bringing your $OGSM to the sacrifice.
                        <br></br>
                        Sminem creates art for you. You bid by burning $OGSM.
                        <br></br>
                        <br></br>
                        Zis is the next iteration of max-bidding-technology.
                        <br></br> 
                        <br></br> 
                        Rules are simple:
                        <br></br>
                        Highest bidder in given timeframe wins the auctioned item.
                        <br></br>
                        Second and third place get a consolation prize: <a href="https://opensea.io/collection/sminems">SMINEMS NFT</a>
                        <br></br>
                        <br></br>
                        Pro tip: You can buy $OGSM (CA: 0x9778ac3d5a2f916aa9abf1eb85c207d990ca2655) on f.e. 1inch.io
                        <br></br>
                        and add send to 0x000000000000000000000000000000000000dEaD in order to save on gas.
                        <br></br>
                    </font>
                    <font color="FFFFFF">Previous Auction: </font>
                    <div className='leaderBoard'>
                    <div className='leaderItem'>
                        <p className='leaderItem'>1st - Loading....</p>
                        <p className='leaderBid'>Bid - Loading.... </p>
                    </div>
                    <div className='leaderItem'>
                        <p className='leaderItem'>2nd - Loading....</p>
                        <p className='leaderBid'>Bid - Loading.... </p>
                    </div>
                    <div className='leaderItem'>
                        <p className='leaderItem'>3rd - Loading....</p>
                        <p className='leaderBid'>Bid - Loading.... </p>
                    </div>
                </div>
            </div>
        }
        </>
    )
}

export default AuctionInfo
