//generic imports for the server:
const express = require('express');
const bodyParser = require('body-parser');
const app = express()
//Ethereum specific imports
let Web3 = require('web3');
//let util = require('ethereumjs-util');
let tx = require('ethereumjs-tx').Transaction;
let lightwallet = require('eth-lightwallet');
let txutils = lightwallet.txutils;

//Put your Ethereum account address here (in quotes):
let yourAddress = "0x659C82A283b41a4B429a68b02e372F7333438ef6";
//Put your Ethereum account private key here (in quotes):
let yourKey = "66BECC08F70B0238FD9BBFDEA0FEFF307F6F6F3DEF58B3F7505CFD70ED393E6A"; //NOTE IF YOU SHARE THIS CODE WITH ANYONE YOUR ACCOUNT IS VUNERABLE - PLEASE ONLY USE A TEST ACCOUNT
//Put the Ethereum contract address to interact with here (in quotes) - make sure it is deployed on the Ropsten testnet:
let yourERC20ContractAddress = "0x09Ee9104108fB402FA2E717a09480584d8b0dC0C";
let yourInfuraEndPointKey = "v3/6dbc7bfacb784339b7464a89e046326b";
//Put the Solidity contract ABI interface of your ERC-20 contract here (Remix provides it as an array): 
let yourERC20Contractinterface = [
	{
		"constant": false,
		"inputs": [
			{
				"internalType": "address",
				"name": "_spender",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "_value",
				"type": "uint256"
			}
		],
		"name": "approve",
		"outputs": [
			{
				"internalType": "bool",
				"name": "success",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"internalType": "address",
				"name": "_to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "_value",
				"type": "uint256"
			}
		],
		"name": "transfer",
		"outputs": [
			{
				"internalType": "bool",
				"name": "success",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"internalType": "address",
				"name": "_from",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "_to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "_value",
				"type": "uint256"
			}
		],
		"name": "transferFrom",
		"outputs": [
			{
				"internalType": "bool",
				"name": "success",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_initialAmount",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "_tokenName",
				"type": "string"
			},
			{
				"internalType": "uint8",
				"name": "_decimalUnits",
				"type": "uint8"
			},
			{
				"internalType": "string",
				"name": "_tokenSymbol",
				"type": "string"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "_owner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "_spender",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "_value",
				"type": "uint256"
			}
		],
		"name": "Approval",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "_from",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "_to",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "_value",
				"type": "uint256"
			}
		],
		"name": "Transfer",
		"type": "event"
	},
	{
		"constant": true,
		"inputs": [
			{
				"internalType": "address",
				"name": "_owner",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "_spender",
				"type": "address"
			}
		],
		"name": "allowance",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "remaining",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "allowed",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"internalType": "address",
				"name": "_owner",
				"type": "address"
			}
		],
		"name": "balanceOf",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "balance",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "balances",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "decimals",
		"outputs": [
			{
				"internalType": "uint8",
				"name": "",
				"type": "uint8"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "name",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "symbol",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "totalSupply",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	}
];

//setting up the server:
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs')

//server is listening at http://localhost:3000/
app.listen(3000, function () {

	console.log('Example app listening on port 3000!')

})

//loading http://localhost:3000/ will give the generic webpage index.ejs:
app.get('/', function (req, res) {

	console.log('Loading generic webpage');
	res.render('index', {balanceIs: null, info: null});  //passes through two parameters to the webpage, both initialised as null

})

//loading http://localhost:3000/balance/:address will return the webpage with information on the balance of the provided address stored in the smart contract
app.post('/balance', function (req, res) {

	console.log('Getting balance to display on webpage for address: ' + req.body.address);
	if (typeof req.body.address != 'undefined'){
		//now lets nominate our provider for the blockchain interaction functionality:	
		const web3 = new Web3(
			//we will use the infura servers connected to the Ropsten Ethereum testnet
	    		new Web3.providers.HttpProvider('https://ropsten.infura.io/' + yourInfuraEndPointKey)
		);

		//now lets load the interface of the smart contract and the particular instance of this smart contract at the same time.	
		const contract = new web3.eth.Contract(yourERC20Contractinterface, yourERC20ContractAddress);
		//and create an instantiation of this contract, pointing to the one deployed at the smart contract address you provided
	
		//lets call balanceOf state query function from this smart contract instace
		contract.methods.balanceOf(req.body.address).call(function(err, result) {
			if(err) {
				//there was an error when calling the function...
				console.log("error when calling the balanceOf function: " + err);
				//so lets inform the user via the user interface
				res.render('index', {balanceIs: null, info: err});
		    	} else {
				//the function call proceeded correctly
				console.log("the balanceOf function returned: " + result);
				//so lets inform the user of this via the user interface	  		
				const balanceText = result;
		  		res.render('index', {balanceIs: 'The balance of address ' + req.body.address + ' is: ' + balanceText, info: null});
		    	}
		});
	} else {
		res.render('index', {balanceIs: null, info: 'toAddress or value is not undefined'});
	}
})

//posting to http://localhost:3000 will transfer 'value' number of coins from 'address' to 'toAddress'  
app.post('/', async function (req, res) {
		
	console.log('Post occurred with (toAddress): ' + req.body.address);
	console.log('Post occurred with (value): ' + req.body.value);
	
	if ((typeof req.body.address != 'undefined')||(typeof req.body.value != 'undefined')){
		//again we nominate our provider for the blockchain interaction functionality:
		var web3 = new Web3(
			//again we will use the infura servers connected to the Ropsten Ethereum testnet
  			new Web3.providers.HttpProvider('https://ropsten.infura.io/' + yourInfuraEndPointKey)
		);	
		//now we build the Ethereum transaction options:
		let txCount = await web3.eth.getTransactionCount(yourAddress);
		console.log("txCount: " + txCount);
		var txOptions = {
			//Each address has an associated nonce value. It must increment after a new tx is included in the blockchain from this address
			nonce: web3.utils.toHex(txCount),
			//Gas Price - Cost of executing each piece of code.
			gasPrice: web3.utils.toHex(20000000000),			
			//Gas Limit - a limit on the total gas you can spend for this transaction
			gasLimit: web3.utils.toHex(800000),
			//NOTE THAT GAS LIMIT IS USING GWEI AND GAS PRICE IS USING WEI DENOMINATION			
			//of course the transaction is being sent to your contract address
			to: yourERC20ContractAddress
		}
		console.log("this tx: " + JSON.stringify(txOptions));
		//now lets build the transaction. To do so, we have the contract interface, followed by the function name (in quotes), an array of the function arguments and the transaction options
		var rawTx = txutils.functionTx(yourERC20Contractinterface, "transfer" , [req.body.address,req.body.value], txOptions);
		//its time to sign the transaction. Note that this is occuring before the transaction has been sent to the provider.		
		console.log('signing transaction');
		var privateKey = new Buffer(yourKey, 'hex');
		var transaction = new tx(rawTx, {'chain':'ropsten'});
		transaction.sign(privateKey);
		
		//ok we have the signed transaction, so lets send it
		console.log('signing transaction');
		var serializedTx = transaction.serialize().toString('hex');
		web3.eth.sendSignedTransaction('0x' + serializedTx, function(err, result) {
			if(err) {
				//there was an error when sending the transaction...
				console.log("error when sending the transaction: " + err);
				//so lets inform the user via the user interface
				res.render('index', {balanceIs: null, info: err});
			} else {
				//the function call proceeded correctly
				//you will be given the transaction hash, now to wait for the transaction to be mined
				console.log("transaction hash: " + result);
				//load the page back for the user -> remember you will have to wait for this transaction to be mined, why not check the transaction hash on Etherscan?
				res.render('index', {balanceIs: null, info: "transaction hash: " + result});	
			}
		});
        
	} else {
		console.log('toAddress or value is not defined');
		res.render('index', {balanceIs: null, info: 'toAddress or value is not undefined'});	
	}
})
