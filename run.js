require('dotenv-safe').config();
import csvToJson from 'csvtojson';
import axios from 'axios';
import cryptoRandomString from 'crypto-random-string';

const csvFilePath = './file-to-parse.csv';

const axiosParams = {
	method: 'post',
	url: process.env.API_URL,
	timeout: 10000,
	withCredentials: true,
	headers: {
		'Content-Type': 'application/json',
		Accept: 'application/json'
	}
};

csvToJson({
	noheader: false,
	delimiter: 'ћћ',
	quote: '∆',
	escape: 'њµ',
	includeColumns: /^(id|email|tokens|created)$/
})
	.fromFile(csvFilePath)
	.subscribe((json) => {
		const dataToSend = {
			email: json.email,
			password: cryptoRandomString(32),
			agreeTos: true,
			oldId: json.id,
			icoBalance: json.tokens,
			createdAt: json.created ? new Date(json.created).getTime() : Date.now(),
			importSecret: process.env.IMPORT_SECRET
		};

		console.log(`Processing User ID: ${json.id} ...`);

		return axios({
			...axiosParams,
			data: dataToSend
		})
			.then(data => {
				if (!data || data.data === undefined) {
					console.error('Something went wrong with server', `Email: ${json.email}, User ID: ${json.id}`);
					return;
				}
				console.log(`Success User ID: ${json.id}!`);
			})
			.catch(err => {
				console.error(`ERROR!!!! Email: ${json.email}, User ID: ${json.id}`, `Message: ${err}`);
			});
	});
