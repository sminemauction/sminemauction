import { useEffect, useState } from 'react';
import {  parseAbiItem, decodeEventLog, decodeFunctionData, transactionType } from 'viem';
import { createPublicClient, http } from 'viem';
import { mainnet } from 'wagmi';
import './auctionInfo.css'


    const  publicClient = createPublicClient({
        chain: mainnet,
        transport: http()
    })
    
function AuctionInfo() {
    // previousBids = all bids from previous auction
    const [previousBids, setPreviousBids] = useState([]);
    // currentBids = all bids from current auction
    const [currentBids, setCurrentBids] = useState([]);
    //previousFirst, etc... = first, second, third highest bids form previus or current auction
    const [previousFirst, setPreviousFirst] = useState();
    const [previousSecond, setPreviousSecond] = useState();
    const [previousThird, setPreviousThird] = useState();
    const [currentFirst, setcurrentFirst] = useState();
    const [currentSecond, setcurrentSecond] = useState();
    const [currentThird, setcurrentThird] = useState();

    //-List of addresses that sent token from the contract "0x9778ac3d5a2f916aa9abf1eb85c207d990ca2655" to this address: 0x000000000000000000000000000000000000dEaD
    //-List shows top 3 addresses Sorted from high to low amount within 72H timeframe; after 72H a new list starts.
    //-top 3 addresses of the 72H timeframe before the current one must also be shown

    useEffect(() => {
        async function getInfo() {

////// Enter the block number at which the first auctino will statrt here /////////
        const startBlock = 18564887;
 //////////////////////////////////////////////////////////////////
            
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
    //////////  Uncomment bellow to filter by 0xDEAD   ///////////////////////////
            // args: {
            //     to: '0x000000000000000000000000000000000000dEaD'
            // },
    ///////////////////////////////////////////////////////////////////////////////
            fromBlock: previousPeriodStart.toString(),
            toBlock: 'latest',
        })

        for(let i=0; i<logs.length; i++) {
            const bidder = {address: '', bid: 0};
            bidder.bid = parseInt(logs[i].args.value)/10**18;
            bidder.address = logs[i].args.from

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

    return(
        <>
    {/*Conditional - does the variable previousFirst exist? - gives time for the data to load without site crashing  */}
        {previousFirst ? {/* Yes it exist data is loaded, format website with data */}
            <div className='previousAuction'>
            <h2>Previous Auction</h2>
            <h3>1st - {previousFirst.address}</h3>
            <h3>Bid - {previousFirst.bid}</h3>
            <h3>2nd - {previousSecond.address}</h3>
            <h3>Bid - {previousSecond.bid}</h3>
            <h3>3rd - {previousThird.address}</h3>
            <h3>Bid - {previousThird.bid}</h3>
            </div>
        
            :  /* No it does not exist yet, so what to display while waiting for data to load */
            <div className='previousAuction'>
            <h2>Previous Auction</h2>
            </div>}
        </>

    )
}

export default AuctionInfo
