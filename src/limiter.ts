
if (!Date.now)
{
    Date.now = function ()
    {
        return new Date().getTime();
    }
}

class Job
{
    public gc_ready : boolean;
    public last_call_time : number;
    public fail_times : number;

    constructor (
        public callback: (...args: any) => any
        , public args? : any
        , public repeat : boolean = false
        , public fail_limit : number = 3
    )
    {
        this.last_call_time = 0;
        this.gc_ready = false;
        this.fail_times = 0;
    }

    public do () : boolean
    {
        this.last_call_time = Date.now();
        if (this.args === undefined)
        {
            this.callback();
        }
        this.callback(this.args);
        this.gc_ready = true;
        return true;
	}
};

export default class Limiter
{
    public objs : Job[];
	public last_call_times : number[];
	public timeouts : any[];

    constructor (
        public rate : number = 60
        , public period : number = 60000
    )
    {
        this.objs = [];
		this.last_call_times = [];
		this.timeouts = [];
    }

    public add (callback : (...any : any) => any, args? : any) : void
    {
        let req = new Job(callback, args);
        this.objs.push(req);
        this.pull();
    }

    public pull () : void
    {
        if (this.objs.length)
        {
            if ((Date.now() - (this.last_call_times.length ? this.last_call_times[0] : 0) > this.period)
				|| (this.rate - this.last_call_times.length > 0)
			)
            {
				let req = this.objs.shift();
				if (req === undefined)
				{
					return;
				}
                let result = req.do();
                if (this.rate - this.last_call_times.length > 0)
                {
                    this.last_call_times.push(Date.now());
                }
                else
                {
                    while(this.last_call_times.length && (Date.now() - this.last_call_times[0] > this.period))
                    {
                        this.last_call_times.shift();
                    }
                }
                if (result)
                {
                    this.timeouts.push(setTimeout(this.pull.bind(this), this.period));
                }
                else if (req.repeat && req.fail_times < req.fail_limit)
                {
                    req.fail_times++;
                    this.objs.unshift(req);
                    this.timeouts.push(setTimeout(this.pull.bind(this), this.period));
                }
            }
            else if (this.objs.length > 0)
            {
                this.timeouts.push(setTimeout(this.pull.bind(this), this.period));
            }
        }
        else
        {
            if (this.rate - this.last_call_times.length > 0)
            {
                this.last_call_times.push(Date.now());
            }
            else
            {
                while(this.last_call_times.length && (Date.now() - this.last_call_times[0] > this.period))
                {
                    this.last_call_times.shift();
                }
            }
        }
	}

	public start () : void
	{
		this.pull();
	}

	public stop () : void
	{
		while(this.timeouts.length > 0)
		{
			clearTimeout(this.timeouts.shift());
		}
	}
};