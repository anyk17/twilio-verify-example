require('dotenv').config();

var accountSid = process.env.TWILIO_ACCOUNT_SID; // Your Account SID from www.twilio.com/console
var authToken = process.env.TWILIO_AUTH_TOKEN; // Your Auth Token from www.twilio.com/console
var serviceId = process.env.VERIFICATION_SID; // Your Service ID from https://www.twilio.com/console/verify/services   

var twilio = require('twilio');
var readline = require('readline');

//Create object to read the user's input
var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
var client = new twilio(accountSid, authToken);

//Function to ask the phone number and send the verification token
var startVerification = function (){
	//Ask for the phone number to verify
	rl.question("Please insert the phone number you want to verify: ", (phoneNumber) => {
		//Send a verification token
		client.verify.services(serviceId)
	             .verifications
	             .create({to: phoneNumber, channel: 'sms'})
	             .then(_ => checkVerification(phoneNumber))
	             .catch(error => console.error(error));

		
	});
};

//Function to ask the verification token and verify
var checkVerification = function (phoneNumber, attempt){
	//Cound the number of attempts
	attempt = attempt|| 0;
	var attemptsLeft = 3 - attempt;
	//Ask for the code
	rl.question("Please insert the code that you received: ", (code) => {
		//Check verification code
		client.verify.services(serviceId)
			      .verificationChecks
			      .create({to: phoneNumber, code: code})
			      .then(verification_check => {
			      	console.log(`Your code is ${verification_check.status}`);
			      	if(verification_check.status === "approved"){
			      		console.log("Yay! (ﾉ◕ヮ◕)ﾉ*:・ﾟ✧ Okay, bye");
			      		rl.close();
			      	} else if(attemptsLeft > 0){
			      		console.log(`That's not the code!!! Try again, come on! You have ${attemptsLeft} attempts left (☞ﾟヮﾟ)☞`);
			      		checkVerification(phoneNumber, ++attempt);
			      	} else{ //To avoid the rate limit, after the 4th attempt, the program quits
			      		console.log(`I won't let you block my account. Just leave (╯°□°）╯︵ ┻━┻`);
			      		rl.close();
			      	}			      	
			      })
			      .catch(error => console.error(error));
		
	});
};

startVerification();
