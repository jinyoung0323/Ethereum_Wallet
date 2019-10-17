const Web3 = require('web3');
const web3 = new Web3();
const db = require('../db/db_conn');
const url = 'http://localhost:8545';

web3.setProvider(new Web3.providers.HttpProvider(url));

module.exports = function(app) {


    const searchUserPassword = async (myAccount) => {
        return new Promise((resolve, reject) => {
            let sql = `select user_password from member where user_pub_key='${myAccount}'`;
            db.query(sql, function(err, rows, fields) {
                if(err) {
                    reject(err);
                } else {
                    resolve(rows[0].user_password);
                }
            });
        });
    }

    app.get('/api/test', function (req, res) {
        res.send('api test!!');
    });

    app.get('/api/getCoinbase', async (req,res) => {
        let accounts = await web3.eth.getCoinbase();
        res.send(`현재 Coinbase는 \n ${accounts}\n 입니다.`);
    });

    app.get('/api/getAccountList', async (req,res) => {
        let accounts;
        accounts = await web3.eth.getAccounts();
        res.send(`현재 geth에서 만들어진 계정은 \n ${accounts} \n 입니다.`);
    });

    app.get('/api/getBalance', async (req,res) => {
        let account = req.query.account;
        result = await web3.eth.getBalance(account);
        result = web3.utils.fromWei(result, "ether");
        res.send(result);
    });

    app.get('/api/getEth', async (req,res) => {
        let myAccount = req.query.account;
        let coinBase = await web3.eth.getCoinbase();
        console.log(`coinBase : ${coinBase}`);
        let unlock_result = await web3.eth.personal.unlockAccount(coinBase,'',0);
        console.log(`unlock_result : ${unlock_result}`);
        let send_result = await web3.eth.sendTransaction({
            from : coinBase,
            to : myAccount,
            value : web3.utils.toWei('10', 'ether')
        });
        console.log(`send_result : ${send_result}`);
        res.send(send_result);
    });

    app.get('/api/sendEth', async (req,res) => {
        console.log('/api/sendEth 시작 -----------');
        let myAccount = req.query.myAccount;
        let receiveAccount = req.query.receiveAccount;
        let ethValue = req.query.ethValue;

        let user_password = await searchUserPassword(myAccount);
        
        let unlock_result = await web3.eth.personal.unlockAccount(myAccount,user_password,0);
        console.log(`unlock_result : ${unlock_result}`);
        let send_result = await web3.eth.sendTransaction({
            from : myAccount,
            to : receiveAccount,
            value : web3.utils.toWei(ethValue, 'ether')
        });
        console.log(`send_result : ${send_result}`);
        res.send(send_result);
    });

    app.post('/api/newAccount', async (req,res) => {
        let email = req.body.email;
        let password = req.body.password;
        let result = await web3.eth.personal.newAccount(password);

        let sql = `insert into member (user_email, user_password, user_pub_key) values ('${email}', '${password}', '${result}')`;

        db.query(sql, function(err, rows, fields) {
            if(err) {
                console.log(err);
                res.send(rows);
            }
            else {
                console.log(rows);
            }
        });
        console.log(password);
        console.log(email);
        res.end();
    });
    
    // app.post('/api/signIn', async (req,res) => {
    //     let loginEmail = req.body.loginEmail;
    //     let loginPassword = req.body.loginPassword;
    //     // let result = await web3.eth.personal.newAccount(user_pub_key);

    //     let sql = `select user_email, user_password, user_pub_key from member where user_email = '${loginEmail}'`;

    //     db.query(sql, function(err, rows, fields) {
    //         if(err) {
    //             console.log(err);
    //         }
    //         else {
    //             if((rows[0].user_email == loginEmail) && (rows[0].user_password == loginPassword)) {
    //                 console.log(rows[0].user_email);
    //             }
    //             res.send(rows[0].user_pub_key);
    //         }
    //     });
    //     console.log(loginPassword);
    // });


    
}
