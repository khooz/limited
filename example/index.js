// import './limited.js';
import Limiter from '../dist/limiter.js';

function getRandomIntInclusive(min, max)
{
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive 
}

var lim = new Limiter(5, 20000);
var start = Date.now();
var temporal = Date.now();

var i = 1;                  					//  set your counter to 1
function myLoop()								//  create a loop function
{
	setTimeout(function()						//  call a setTimeout when the loop is called
		{
			lim.add((i) => { console.log(i, Date.now() - temporal, Date.now() - start); temporal = Date.now(); }, i);	//  your code here
			i++;								//  increment the counter
			if (i == 10)
			{
				lim.stop();
			}
			if (i <= 20)						//  if the counter < 10, call the loop function
			{
				myLoop();						//  ..  again which will trigger another 
			}
			if (i == 20)
			{
				lim.start();
			}
			return;
		}
		, getRandomIntInclusive(100,1500)		//  ..  setTimeout()
	);
	return;
}

myLoop();