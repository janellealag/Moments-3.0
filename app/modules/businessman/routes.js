//THIS IS THE CONTROLLER FOR BUSINESSMAN

//module used in this controller
var express = require('express');

//declaration of router
var router = express.Router();
var authMiddleware = require('../../core/auth');
var db = require('../../lib/database')();
router.use(authMiddleware.hasAuth);
var fs = require('fs');
var async = require('async');


router.get('/', (req,res) =>{
                var service = 0;
                var rental = 0;
                var total = 0;

                db.query(`Select count(*) as C from tblservices join tblgenservice on tblservices.intgenserviceno = tblgenservice.intgenserviceno where tblgenservice.intproviderid = ${req.session.user.intProviderID} AND tblServices.intServiceStatus = ${1}`, (err, resu, fieldsu)=>{
                    service = resu[0].C;

                    db.query(`Select count(*) as I from tblrental join tblitem on tblrental.intitemno = tblitem.intitemno where tblitem.intproviderid = ${req.session.user.intProviderID} AND tblrental.intrentalStatus = ${1}`, (err,resuu, fieldsuu)=>{
                        rental = resuu[0].I;

                        total = service + rental;

                        var profile = req.session.user;
						res.render('businessman/views/BusinessmanDashboard', {profile: profile, transact: total, user: `${req.session.user.strProviderFName}`+" "+ `${req.session.user.strProviderLName}`});
						});

                });

});

router.post('/', (req,res) =>{
    var service = 0;
                var rental = 0;
                var total = 0;

                db.query(`Select count(*) as C from tblservices join tblgenservice on tblservices.intgenserviceno = tblgenservice.intgenserviceno where tblgenservice.intproviderid = ${req.session.user.intProviderID} AND tblServices.intServiceStatus = ${1}`, (err, resu, fieldsu)=>{
                    service = resu[0].C;
                    db.query(`Select count(*) as I from tblrental join tblitem on tblrental.intitemno = tblitem.intitemno where tblitem.intproviderid = ${req.session.user.intProviderID} AND tblrental.intrentalStatus = ${1}`, (err,resuu, fieldsuu)=>{
                        rental = resuu[0].I;

                        total = service + rental;

                        var profile = req.session.user;
                        res.render('businessman/views/BusinessmanDashboard', {profile: profile, transact: total, user: `${req.session.user.strProviderFName}`+" "+ `${req.session.user.strProviderLName}`});
                    });

                });
});

router.get('/businessmanPending', (req,res)=>{

    db.query(`Select * from tblProvider where strProviderEmail = "${req.session.user.strProviderEmail}" and strProviderPassword = "${req.session.user.strProviderPassword}"`,(err,results,fields)=>{
        req.session.user = results[0];
        console.log(results[0]);


           var profile = req.session.user;
    res.render('businessman/views/businessmanPending', {profile: profile,user: `${req.session.user.strProviderFName}`+" "+ `${req.session.user.strProviderLName}`} );
    });



});

router.post('/businessmanRequest', (req,res)=>{
  db.query(`UPDATE tblprovider set intproviderstatus = ${0} where intProviderID = ${req.session.user.intProviderID}`,(err,results,fields)=>{
    if (err) console.log(err);

    res.redirect('/businessman/businessmanPending');

  });
});

var currentTransact = 0;

router.post('/transactionList', (req,res)=>{

    currentTransact = req.body.number;
    function query1(callback) {
	setTimeout(function () {
        db.query(`select *, DATE_FORMAT(tblevent.dateEventStart , "%M %e, %Y %r") as Start, DATE_FORMAT(tblevent.dateEventEnd , "%M %e, %Y %r") as End from tblevent join tblorganizer on tblevent.intorganizerid = tblorganizer.intorganizerid
	where inteventno = ${req.body.number}

            `, (err,events,fields)=>{
                        callback(events);
                    });

                }, 1000);
}

    function query2(callback) {
        setTimeout(function () {
            db.query(`select *, DATE_FORMAT(tblrental.dtmRentalDateofUse , "%M %e, %Y %r") as RDOC from tblevent join tblorganizer on tblevent.intorganizerID = tblorganizer.intorganizerID
            join tbltransaction on tblevent.inteventno = tbltransaction.inteventno
            join tblrental on tblrental.inttransactionno = tbltransaction.inttransactionno
            join tblitem on tblrental.intitemno = tblitem.intitemno
        where tblitem.intproviderid = ${req.session.user.intProviderID} && tblevent.inteventno = ${req.body.number} `, (err,itemres,fields)=>{
                callback(itemres);

            });

        }, 1000);
    }

    function query3(callback) {
        setTimeout(function () {
            db.query(`select *, DATE_FORMAT(tblservices.dtmServiceDateofUse , "%M %e, %Y %r") as SDOU from tblevent join tblorganizer on tblevent.intorganizerid = tblorganizer.intorganizerid
        join tbltransaction on tbltransaction.inteventno = tblevent.inteventno
        join tblservices on tbltransaction.inttransactionno = tblservices.inttransactionno
        join tblgenservice on tblgenservice.intgenserviceno = tblservices.intgenserviceno
    where tblgenservice.intproviderid = ${req.session.user.intProviderID} && tblevent.inteventno = ${req.body.number}`, (err,serviceres,fields)=>{
                callback(serviceres);
            });

        }, 1000);
    }




    async.parallel({
	data1: function (cb) {
		query1(function (data) {
			cb(null, data);
		});
	},
	data2: function (cb) {
		query2(function (data) {
			cb(null, data);
		});
	},
    data3: function (cb) {
		query3(function (data) {
			cb(null, data);
		});

    }
    }, function (err, dataObject) {
        //console.log('Inside parallel');
       // render([dataObject.data1, dataObject.data2, dataObject.data3]);
       var profile = req.session.user;
        res.render('businessman/views/transactionList', {profile: profile,event: dataObject.data1, item: dataObject.data2, service: dataObject.data3, user: `${req.session.user.strProviderFName}`+" "+ `${req.session.user.strProviderLName}`});
    });

    function render(dataArray) {

    }



});

router.post('/editAmount', (req,res)=>{

    db.query(`Update tblRental set decRentalFinalPrice=${req.body.rentalfinalprice}, intRentalStatus = ${2} where intTransactionNo = ${req.body.rentalno} AND intItemNo = ${req.body.rentalno2} `, (err,results,fields)=>{
        if (err) console.log(err);


       function query1(callback) {
	setTimeout(function () {
        db.query(`select *, DATE_FORMAT(tblevent.dateEventStart , "%M %e, %Y %r") as Start, DATE_FORMAT(tblevent.dateEventEnd , "%M %e, %Y %r") as End from tblevent join tblorganizer on tblevent.intorganizerid = tblorganizer.intorganizerid
	where inteventno = ${currentTransact}

            `, (err,events,fields)=>{
                        callback(events);
                    });

                }, 1000);
}

    function query2(callback) {
        setTimeout(function () {
            db.query(`select *, DATE_FORMAT(tblrental.dtmRentalDateofUse , "%M %e, %Y %r") as RDOC from tblevent join tblorganizer on tblevent.intorganizerID = tblorganizer.intorganizerID
            join tbltransaction on tblevent.inteventno = tbltransaction.inteventno
            join tblrental on tblrental.inttransactionno = tbltransaction.inttransactionno
            join tblitem on tblrental.intitemno = tblitem.intitemno
        where tblitem.intproviderid = ${req.session.user.intProviderID} && tblevent.inteventno = ${currentTransact} `, (err,itemres,fields)=>{
                callback(itemres);

            });

        }, 1000);
    }

    function query3(callback) {
        setTimeout(function () {
            db.query(`select *, DATE_FORMAT(tblservices.dtmServiceDateofUse , "%M %e, %Y %r") as SDOU from tblevent join tblorganizer on tblevent.intorganizerid = tblorganizer.intorganizerid
        join tbltransaction on tbltransaction.inteventno = tblevent.inteventno
        join tblservices on tbltransaction.inttransactionno = tblservices.inttransactionno
        join tblgenservice on tblgenservice.intgenserviceno = tblservices.intgenserviceno
    where tblgenservice.intproviderid = ${req.session.user.intProviderID} && tblevent.inteventno = ${currentTransact}`, (err,serviceres,fields)=>{
                callback(serviceres);
            });

        }, 1000);
    }




    async.parallel({
	data1: function (cb) {
		query1(function (data) {
			cb(null, data);
		});
	},
	data2: function (cb) {
		query2(function (data) {
			cb(null, data);
		});
	},
    data3: function (cb) {
		query3(function (data) {
			cb(null, data);
		});

    }
    }, function (err, dataObject) {
        //console.log('Inside parallel');
       // render([dataObject.data1, dataObject.data2, dataObject.data3]);
       var profile = req.session.user;
        res.render('businessman/views/transactionList', {profile: profile,event: dataObject.data1, item: dataObject.data2, service: dataObject.data3, user: `${req.session.user.strProviderFName}`+" "+ `${req.session.user.strProviderLName}`});
    });




    });
});



router.post('/rejectItem', (req,res)=>{
    db.query(`Update tblRental set decRentalFinalPrice=${0}, intRentalStatus = ${0} where intTransactionNo = ${req.body.rno} and intItemNo = ${req.body.rno2} `, (err,results,fields)=>{
        if (err) console.log(err);


function query1(callback) {
	setTimeout(function () {
        db.query(`select *, DATE_FORMAT(tblevent.dateEventStart , "%M %e, %Y %r") as Start, DATE_FORMAT(tblevent.dateEventEnd , "%M %e, %Y %r") as End from tblevent join tblorganizer on tblevent.intorganizerid = tblorganizer.intorganizerid
	where inteventno = ${currentTransact}

            `, (err,events,fields)=>{
                        callback(events);
                    });

                }, 1000);
}

    function query2(callback) {
        setTimeout(function () {
            db.query(`select *, DATE_FORMAT(tblrental.dtmRentalDateofUse , "%M %e, %Y %r") as RDOC from tblevent join tblorganizer on tblevent.intorganizerID = tblorganizer.intorganizerID
            join tbltransaction on tblevent.inteventno = tbltransaction.inteventno
            join tblrental on tblrental.inttransactionno = tbltransaction.inttransactionno
            join tblitem on tblrental.intitemno = tblitem.intitemno
        where tblitem.intproviderid = ${req.session.user.intProviderID} && tblevent.inteventno = ${currentTransact}`, (err,itemres,fields)=>{
                callback(itemres);

            });

        }, 1000);
    }

    function query3(callback) {
        setTimeout(function () {
            db.query(`select *, DATE_FORMAT(tblservices.dtmServiceDateofUse , "%M %e, %Y %r") as SDOU from tblevent join tblorganizer on tblevent.intorganizerid = tblorganizer.intorganizerid
        join tbltransaction on tbltransaction.inteventno = tblevent.inteventno
        join tblservices on tbltransaction.inttransactionno = tblservices.inttransactionno
        join tblgenservice on tblgenservice.intgenserviceno = tblservices.intgenserviceno
    where tblgenservice.intproviderid = ${req.session.user.intProviderID} && tblevent.inteventno = ${currentTransact}`, (err,serviceres,fields)=>{
                callback(serviceres);
            });

        }, 1000);
    }




    async.parallel({
	data1: function (cb) {
		query1(function (data) {
			cb(null, data);
		});
	},
	data2: function (cb) {
		query2(function (data) {
			cb(null, data);
		});
	},
    data3: function (cb) {
		query3(function (data) {
			cb(null, data);
		});

    }
    }, function (err, dataObject) {
        //console.log('Inside parallel');
       // render([dataObject.data1, dataObject.data2, dataObject.data3]);
       var profile = req.session.user;
        res.render('businessman/views/transactionList', {profile: profile,event: dataObject.data1, item: dataObject.data2, service: dataObject.data3, user: `${req.session.user.strProviderFName}`+" "+ `${req.session.user.strProviderLName}`});
    });




    });
});

router.post('/serviceeditAmount', (req,res)=>{

    db.query(`Update tblservices set decServiceFinalPrice= ${req.body.servicefinalprice} , intServiceStatus = ${2} where intTransactionNo = ${req.body.servno} and intGenServiceNo = ${req.body.servno2} `, (err,results,fields)=>{
        if (err) console.log(err);


       function query1(callback) {
	setTimeout(function () {
        db.query(`select *, DATE_FORMAT(tblevent.dateEventStart , "%M %e, %Y %r") as Start, DATE_FORMAT(tblevent.dateEventEnd , "%M %e, %Y %r") as End from tblevent join tblorganizer on tblevent.intorganizerid = tblorganizer.intorganizerid
	where inteventno = ${currentTransact}

            `, (err,events,fields)=>{
                        callback(events);
                    });

                }, 1000);
}

    function query2(callback) {
        setTimeout(function () {
            db.query(`select *, DATE_FORMAT(tblrental.dtmRentalDateofUse , "%M %e, %Y %r") as RDOC from tblevent join tblorganizer on tblevent.intorganizerID = tblorganizer.intorganizerID
            join tbltransaction on tblevent.inteventno = tbltransaction.inteventno
            join tblrental on tblrental.inttransactionno = tbltransaction.inttransactionno
            join tblitem on tblrental.intitemno = tblitem.intitemno
        where tblitem.intproviderid = ${req.session.user.intProviderID} && tblevent.inteventno = ${currentTransact}`, (err,itemres,fields)=>{
                callback(itemres);

            });

        }, 1000);
    }

    function query3(callback) {
        setTimeout(function () {
            db.query(`select *, DATE_FORMAT(tblservices.dtmServiceDateofUse , "%M %e, %Y %r") as SDOU from tblevent join tblorganizer on tblevent.intorganizerid = tblorganizer.intorganizerid
        join tbltransaction on tbltransaction.inteventno = tblevent.inteventno
        join tblservices on tbltransaction.inttransactionno = tblservices.inttransactionno
        join tblgenservice on tblgenservice.intgenserviceno = tblservices.intgenserviceno
    where tblgenservice.intproviderid = ${req.session.user.intProviderID} && tblevent.inteventno = ${currentTransact}`, (err,serviceres,fields)=>{
                callback(serviceres);
            });

        }, 1000);
    }




    async.parallel({
	data1: function (cb) {
		query1(function (data) {
			cb(null, data);
		});
	},
	data2: function (cb) {
		query2(function (data) {
			cb(null, data);
		});
	},
    data3: function (cb) {
		query3(function (data) {
			cb(null, data);
		});

    }
    }, function (err, dataObject) {
        //console.log('Inside parallel');
       // render([dataObject.data1, dataObject.data2, dataObject.data3]);
       var profile = req.session.user;
        res.render('businessman/views/transactionList', {profile: profile,event: dataObject.data1, item: dataObject.data2, service: dataObject.data3, user: `${req.session.user.strProviderFName}`+" "+ `${req.session.user.strProviderLName}`});
    });




    });
});

router.post('/rejectService', (req,res)=>{

     db.query(`Update tblservices set decServiceFinalPrice=${0}, intServiceStatus = ${0} where intTransactionNo = ${req.body.sno} and intGenServiceNo = ${req.body.sno2}  `, (err,results,fields)=>{
        if (err) console.log(err);


function query1(callback) {
	setTimeout(function () {
        db.query(`select *, DATE_FORMAT(tblevent.dateEventStart , "%M %e, %Y %r") as Start, DATE_FORMAT(tblevent.dateEventEnd , "%M %e, %Y %r") as End from tblevent join tblorganizer on tblevent.intorganizerid = tblorganizer.intorganizerid
	where inteventno = ${currentTransact}

            `, (err,events,fields)=>{
                        callback(events);
                    });

                }, 1000);
}

    function query2(callback) {
        setTimeout(function () {
            db.query(`select *, DATE_FORMAT(tblrental.dtmRentalDateofUse , "%M %e, %Y %r") as RDOC from tblevent join tblorganizer on tblevent.intorganizerID = tblorganizer.intorganizerID
            join tbltransaction on tblevent.inteventno = tbltransaction.inteventno
            join tblrental on tblrental.inttransactionno = tbltransaction.inttransactionno
            join tblitem on tblrental.intitemno = tblitem.intitemno
        where tblitem.intproviderid = ${req.session.user.intProviderID} && tblevent.inteventno = ${currentTransact} `, (err,itemres,fields)=>{
                callback(itemres);

            });

        }, 1000);
    }

    function query3(callback) {
        setTimeout(function () {
            db.query(`select *, DATE_FORMAT(tblservices.dtmServiceDateofUse , "%M %e, %Y %r") as SDOU from tblevent join tblorganizer on tblevent.intorganizerid = tblorganizer.intorganizerid
        join tbltransaction on tbltransaction.inteventno = tblevent.inteventno
        join tblservices on tbltransaction.inttransactionno = tblservices.inttransactionno
        join tblgenservice on tblgenservice.intgenserviceno = tblservices.intgenserviceno
    where tblgenservice.intproviderid = ${req.session.user.intProviderID} && tblevent.inteventno = ${currentTransact} `, (err,serviceres,fields)=>{
                callback(serviceres);
            });

        }, 1000);
    }




    async.parallel({
	data1: function (cb) {
		query1(function (data) {
			cb(null, data);
		});
	},
	data2: function (cb) {
		query2(function (data) {
			cb(null, data);
		});
	},
    data3: function (cb) {
		query3(function (data) {
			cb(null, data);
		});

    }
    }, function (err, dataObject) {
        //console.log('Inside parallel');
       // render([dataObject.data1, dataObject.data2, dataObject.data3]);
       var profile = req.session.user;
        res.render('businessman/views/transactionList', {profile: profile,event: dataObject.data1, item: dataObject.data2, service: dataObject.data3, user: `${req.session.user.strProviderFName}`+" "+ `${req.session.user.strProviderLName}`});
    });




    });
});

router.post('/cancelService', (req,res)=>{

     db.query(`Update tblservices set decServiceFinalPrice=${0}, intServiceStatus = ${3} where intTransactionNo = ${req.body.sno} and intGenServiceNo = ${req.body.sno2} `, (err,results,fields)=>{
        if (err) console.log(err);


function query1(callback) {
	setTimeout(function () {
        db.query(`select *, DATE_FORMAT(tblevent.dateEventStart , "%M %e, %Y %r") as Start, DATE_FORMAT(tblevent.dateEventEnd , "%M %e, %Y %r") as End from tblevent join tblorganizer on tblevent.intorganizerid = tblorganizer.intorganizerid
	where inteventno = ${currentTransact}

            `, (err,events,fields)=>{
                        callback(events);
                    });

                }, 1000);
}

    function query2(callback) {
        setTimeout(function () {
            db.query(`select *, DATE_FORMAT(tblrental.dtmRentalDateofUse , "%M %e, %Y %r") as RDOC from tblevent join tblorganizer on tblevent.intorganizerID = tblorganizer.intorganizerID
            join tbltransaction on tblevent.inteventno = tbltransaction.inteventno
            join tblrental on tblrental.inttransactionno = tbltransaction.inttransactionno
            join tblitem on tblrental.intitemno = tblitem.intitemno
        where tblitem.intproviderid = ${req.session.user.intProviderID} && tblevent.inteventno = ${currentTransact}`, (err,itemres,fields)=>{
                callback(itemres);

            });

        }, 1000);
    }

    function query3(callback) {
        setTimeout(function () {
            db.query(`select *, DATE_FORMAT(tblservices.dtmServiceDateofUse , "%M %e, %Y %r") as SDOU from tblevent join tblorganizer on tblevent.intorganizerid = tblorganizer.intorganizerid
        join tbltransaction on tbltransaction.inteventno = tblevent.inteventno
        join tblservices on tbltransaction.inttransactionno = tblservices.inttransactionno
        join tblgenservice on tblgenservice.intgenserviceno = tblservices.intgenserviceno
    where tblgenservice.intproviderid = ${req.session.user.intProviderID} && tblevent.inteventno = ${currentTransact} `, (err,serviceres,fields)=>{
                callback(serviceres);
            });

        }, 1000);
    }




    async.parallel({
	data1: function (cb) {
		query1(function (data) {
			cb(null, data);
		});
	},
	data2: function (cb) {
		query2(function (data) {
			cb(null, data);
		});
	},
    data3: function (cb) {
		query3(function (data) {
			cb(null, data);
		});

    }
    }, function (err, dataObject) {
        //console.log('Inside parallel');
       // render([dataObject.data1, dataObject.data2, dataObject.data3]);
       var profile = req.session.user;
        res.render('businessman/views/transactionList', {profile: profile,event: dataObject.data1, item: dataObject.data2, service: dataObject.data3, user: `${req.session.user.strProviderFName}`+" "+ `${req.session.user.strProviderLName}`});
    });



    });
});

router.post('/cancelItem', (req,res)=>{

     db.query(`Update tblrental set decRentalFinalPrice=${0}, intRentalStatus = ${3} where intTransactionNo = ${req.body.rno} and intItemNo = ${req.body.rno2} `, (err,results,fields)=>{
        if (err) console.log(err);


function query1(callback) {
	setTimeout(function () {
        db.query(`select *, DATE_FORMAT(tblevent.dateEventStart , "%M %e, %Y %r") as Start, DATE_FORMAT(tblevent.dateEventEnd , "%M %e, %Y %r") as End from tblevent join tblorganizer on tblevent.intorganizerid = tblorganizer.intorganizerid
	where inteventno = ${currentTransact}

            `, (err,events,fields)=>{
                        callback(events);
                    });

                }, 1000);
}

    function query2(callback) {
        setTimeout(function () {
            db.query(`select *, DATE_FORMAT(tblrental.dtmRentalDateofUse , "%M %e, %Y %r") as RDOC from tblevent join tblorganizer on tblevent.intorganizerID = tblorganizer.intorganizerID
            join tbltransaction on tblevent.inteventno = tbltransaction.inteventno
            join tblrental on tblrental.inttransactionno = tbltransaction.inttransactionno
            join tblitem on tblrental.intitemno = tblitem.intitemno
        where tblitem.intproviderid = ${req.session.user.intProviderID} && tblevent.inteventno = ${currentTransact}`, (err,itemres,fields)=>{
                callback(itemres);

            });

        }, 1000);
    }

    function query3(callback) {
        setTimeout(function () {
            db.query(`select *, DATE_FORMAT(tblservices.dtmServiceDateofUse , "%M %e, %Y %r") as SDOU from tblevent join tblorganizer on tblevent.intorganizerid = tblorganizer.intorganizerid
        join tbltransaction on tbltransaction.inteventno = tblevent.inteventno
        join tblservices on tbltransaction.inttransactionno = tblservices.inttransactionno
        join tblgenservice on tblgenservice.intgenserviceno = tblservices.intgenserviceno
    where tblgenservice.intproviderid = ${req.session.user.intProviderID} && tblevent.inteventno = ${currentTransact}`, (err,serviceres,fields)=>{
                callback(serviceres);
            });

        }, 1000);
    }




    async.parallel({
	data1: function (cb) {
		query1(function (data) {
			cb(null, data);
		});
	},
	data2: function (cb) {
		query2(function (data) {
			cb(null, data);
		});
	},
    data3: function (cb) {
		query3(function (data) {
			cb(null, data);
		});

    }
    }, function (err, dataObject) {
        //console.log('Inside parallel');
       // render([dataObject.data1, dataObject.data2, dataObject.data3]);
       var profile = req.session.user;
        res.render('businessman/views/transactionList', {profile: profile,event: dataObject.data1, item: dataObject.data2, service: dataObject.data3, user: `${req.session.user.strProviderFName}`+" "+ `${req.session.user.strProviderLName}`});
    });




    });
});

router.get('/reservations', (req,res) =>{

    currentTransact = 0;
    db.query(`Select * from (
		(select tblevent.inteventno, tblorganizer.intorganizerID, strEventName, dateEventStart, dateEventEnd, boolEventStatus, intEstimatedNumberofGuest,
		strEventDescription, strCity, strProvince, strOrganizerFName, strOrganizerMName, strOrganizerLName, tbltransaction.inttransactionno
		from tblevent join tblorganizer on tblevent.intorganizerID = tblorganizer.intorganizerID
			join tbltransaction on tbltransaction.inteventno = tblevent.inteventno
			join tblrental on tbltransaction.inttransactionno = tblrental.inttransactionno
			join tblitem on tblrental.intitemno = tblitem.intitemno
		where tblitem.intproviderid = ${req.session.user.intProviderID} AND now()<dateEventEnd)
		UNION ALL
		(select tblevent.inteventno, tblorganizer.intorganizerID, strEventName, dateEventStart, dateEventEnd, boolEventStatus, intEstimatedNumberofGuest,
		strEventDescription, strCity, strProvince, strOrganizerFName, strOrganizerMName, strOrganizerLName, tbltransaction.inttransactionno
		from tblevent join tblorganizer on tblevent.intorganizerID = tblorganizer.intorganizerID
			join tbltransaction on tbltransaction.inteventno = tblevent.inteventno
			join tblservices on tbltransaction.inttransactionno = tblservices.inttransactionno
			join tblgenservice on tblservices.intgenserviceno = tblgenservice.intgenserviceno
		where tblgenservice.intproviderid = ${req.session.user.intProviderID} AND now()<dateEventEnd)) as t
		group by inteventno

		`, (err,results,fields)=>{
				if (err) console.log(err);

		var pendinggroup = {};

        db.query(`Select count(*) as C, tblevent.intEventNo from tblevent join tbltransaction on tblevent.intEventNo = tbltransaction.intEventNo
		join tblrental on tblrental.intTransactionNo = tbltransaction.intTransactionNo
		join tblitem on tblitem.intItemNo = tblrental.intItemNo
		where tblitem.intProviderID = ${req.session.user.intProviderID} and tblrental.intRentalStatus = ${1}
		group by tblevent.intEventNo`, (erre, resultse, fieldse) =>{
					if (erre) console.log(erre);
					//console.log(resultse);

					db.query(`Select count(*) as S, tblevent.intEventNo from tblevent join tbltransaction on tblevent.intEventNo = tbltransaction.intEventNo join tblservices on tblservices.intTransactionNo = tblservices.intTransactionNo join tblgenservice on tblgenservice.intGenServiceNo = tblgenservice.intGenServiceNo where tblgenservice.intProviderID = ${req.session.user.intProviderID} and tblservices.intServiceStatus = ${1} group by tblevent.intEventNo`, (errt, resultst, fieldst)=>{
						if(errt) console.log(errt);

						//console.log(resultst);

						// pendinggroup = resultse.concat(resultst);

						//console.log(pendinggroup);
                        var profile = req.session.user;

						 res.render('businessman/views/reservations', {profile: profile,contents: results, user: `${req.session.user.strProviderFName}`+" "+ `${req.session.user.strProviderLName}`});
                //console.log(results);

            });


        });

    });

});

router.get('/previousReservation', (req,res) =>{

    currentTransact = 0;
    db.query(`Select * from (
		(select tblevent.inteventno, tblorganizer.intorganizerID, strEventName, dateEventStart, dateEventEnd, boolEventStatus, intEstimatedNumberofGuest,
		strEventDescription, strCity, strProvince, strOrganizerFName, strOrganizerMName, strOrganizerLName, tbltransaction.inttransactionno
		from tblevent join tblorganizer on tblevent.intorganizerID = tblorganizer.intorganizerID
			join tbltransaction on tbltransaction.inteventno = tblevent.inteventno
			join tblrental on tbltransaction.inttransactionno = tblrental.inttransactionno
			join tblitem on tblrental.intitemno = tblitem.intitemno
		where tblitem.intproviderid = ${req.session.user.intProviderID} AND now()>dateEventEnd)
		UNION ALL
		(select tblevent.inteventno, tblorganizer.intorganizerID, strEventName, dateEventStart, dateEventEnd, boolEventStatus, intEstimatedNumberofGuest,
		strEventDescription, strCity, strProvince, strOrganizerFName, strOrganizerMName, strOrganizerLName, tbltransaction.inttransactionno
		from tblevent join tblorganizer on tblevent.intorganizerID = tblorganizer.intorganizerID
			join tbltransaction on tbltransaction.inteventno = tblevent.inteventno
			join tblservices on tbltransaction.inttransactionno = tblservices.inttransactionno
			join tblgenservice on tblservices.intgenserviceno = tblgenservice.intgenserviceno
		where tblgenservice.intproviderid = ${req.session.user.intProviderID} AND now()>dateEventEnd)) as t
		group by inteventno

		`, (err,results,fields)=>{
				if (err) console.log(err);

		var pendinggroup = {};

        db.query(`Select count(*) as C, tblevent.intEventNo from tblevent join tbltransaction on tblevent.intEventNo = tbltransaction.intEventNo
		join tblrental on tblrental.intTransactionNo = tbltransaction.intTransactionNo
		join tblitem on tblitem.intItemNo = tblrental.intItemNo
		where tblitem.intProviderID = ${req.session.user.intProviderID} and tblrental.intRentalStatus = ${1}
		group by tblevent.intEventNo`, (erre, resultse, fieldse) =>{
					if (erre) console.log(erre);
					//console.log(resultse);

					db.query(`Select count(*) as S, tblevent.intEventNo from tblevent join tbltransaction on tblevent.intEventNo = tbltransaction.intEventNo join tblservices on tblservices.intTransactionNo = tblservices.intTransactionNo join tblgenservice on tblgenservice.intGenServiceNo = tblgenservice.intGenServiceNo where tblgenservice.intProviderID = ${req.session.user.intProviderID} and tblservices.intServiceStatus = ${1} group by tblevent.intEventNo`, (errt, resultst, fieldst)=>{
						if(errt) console.log(errt);

						//console.log(resultst);

						// pendinggroup = resultse.concat(resultst);

						//console.log(pendinggroup);
                        var profile = req.session.user;

						 res.render('businessman/views/reservations', {profile: profile,contents: results, user: `${req.session.user.strProviderFName}`+" "+ `${req.session.user.strProviderLName}`});
                //console.log(results);

            });


        });

    });

});

router.get('/items', (req,res)=>{

    db.query(`SELECT * from \`tblItem\` where  \`intProviderID\` = ${req.session.user.intProviderID} `, (err,results,fields)=>{


            var profile = req.session.user;
            res.render('businessman/views/items', {profile: profile,success: 0,itemalert: 0, servicealert: 0, re: results,  user: `${req.session.user.strProviderFName}`+" "+ `${req.session.user.strProviderLName}`});

    });

});

router.get('/services', (req,res)=>{

        db.query(`SELECT * from \`tblgenservice\` where  \`intProviderID\` = ${req.session.user.intProviderID} `, (err,resultss,fields) =>{
            var profile = req.session.user;
            res.render('businessman/views/services', {profile: profile,success: 0,itemalert: 0, servicealert: 0,  se: resultss, user: `${req.session.user.strProviderFName}`+" "+ `${req.session.user.strProviderLName}`});
        });

});

router.get('/itemsOrServices', (req,res) =>{
    //var items = [];
    db.query(`SELECT * from \`tblItem\` where  \`intProviderID\` = ${req.session.user.intProviderID} `, (err,results,fields)=>{

        db.query(`SELECT * from \`tblgenservice\` where  \`intProviderID\` = ${req.session.user.intProviderID} `, (err,resultss,fields) =>{
            var profile = req.session.user;
            res.render('businessman/views/itemsOrService', {profile: profile,success: 0,itemalert: 0, servicealert: 0, re: results, se: resultss, user: `${req.session.user.strProviderFName}`+" "+ `${req.session.user.strProviderLName}`});
        });
    });
    //console.log(items);
});

router.post('/createItem', (req,res)=>{

            db.query(`INSERT INTO \`tblItem\` (\`strItemName\`, \`strItemDescription\`, \`strItemAvailableDay\`, \`strEstimatedPrice\`, \`intProviderID\`,  \`decItemRefundPercentage\`, \`intItemStatus\`) VALUES ("${req.body.itemName}", "${req.body.itemDescription}", "${req.body.days}", "${req.body.itemPrice}", ${req.session.user.intProviderID},  ${req.body.itemRefund}, ${1})  `, (err,results,fields)=>{
            if (err) console.log(err);

                db.query(`SELECT * from \`tblItem\` where  \`intProviderID\` = ${req.session.user.intProviderID} `, (err,results,fields)=>{

                        db.query(`SELECT * from \`tblgenservice\` where  \`intProviderID\` = ${req.session.user.intProviderID} `, (err,resultss,fields) =>{
                            var profile = req.session.user;
                            res.render('businessman/views/itemsOrService', {profile: profile,success: 1, itemalert: 0, servicealert: 0, re: results, se: resultss, user: `${req.session.user.strProviderFName}`+" "+ `${req.session.user.strProviderLName}`});
                        });
                    });
            });





    //res.redirect('/businessman');
});

router.post('/editItem', (req,res)=>{
    // test the item number and the providerID
    // validation for same item names
   // console.log(`${req.body.eitemrefund}`);
    db.query(`UPDATE \`tblItem\` SET \`strEstimatedPrice\` = "${req.body.eItemPrice}", \`strItemDescription\` = "${req.body.eItemDescription}", \`strItemAvailableDay\` = "${req.body.days}", \`decItemRefundPercentage\` = ${req.body.eitemrefund} where \`intItemNo\` = ${req.body.eItemNoo} AND \`intProviderID\` = ${req.session.user.intProviderID}  `, (err,results,fields)=>{
        if (err) console.log(err);
        res.redirect('/businessman/itemsOrServices');
    });
});

router.post('/createService', (req,res)=>{
    // check if still unique

    db.query(`INSERT INTO \`tblgenservice\` (\`strServiceName\`, \`strEstimatedPrice\`, \`strServiceDescription\`, \`decServiceRefundPercentage\`, \`strServiceAvailableDay\`, \`intGenServiceStatus\`, \`intProviderID\`) VALUES ("${req.body.serviceName}", "${req.body.servicePrice}", "${req.body.serviceDescription}", ${req.body.serviceRefund}, "${req.body.days}", ${1}, ${req.session.user.intProviderID}) `, (err,results,fields) =>{
        if (err) console.log(err);

        db.query(`SELECT * from \`tblItem\` where  \`intProviderID\` = ${req.session.user.intProviderID} `, (err,results,fields)=>{

                        db.query(`SELECT * from \`tblgenservice\` where  \`intProviderID\` = ${req.session.user.intProviderID} `, (err,resultss,fields) =>{
                            var profile = req.session.user;
                            res.render('businessman/views/itemsOrService', {profile: profile,success: 1, itemalert: 0, servicealert: 0, re: results, se: resultss, user: `${req.session.user.strProviderFName}`+" "+ `${req.session.user.strProviderLName}`});
                        });
                    });
    });
});

router.post('/editService', (req,res)=>{
    db.query(`UPDATE \`tblgenservice\` SET \`strservicename\` = "${req.body.eservicename}", \`strEstimatedPrice\` = "${req.body.eserviceprice}", \`strservicedescription\` = "${req.body.eservicedescription}", \`decServiceRefundPercentage\` = ${req.body.eservicerefund}, \`strServiceAvailableDay\` = "${req.body.days}" where \`intGenServiceNo\` = ${req.body.eserviceno} AND \`intProviderID\` = ${req.session.user.intProviderID} `, (err,results,fields)=>{
        if(err) console.log(err);

        res.redirect('/businessman/itemsOrServices');
    });
});

router.get('/requirements', (req,res)=>{
    var tempFile="/requirements.pdf";
    fs.readFile(__dirname + tempFile, function (err,data){
     res.contentType("application/pdf");
     res.send(data);
    });
});

router.post('/inactivateItem', (req,res)=>{
    db.query(`Update tblItem set intItemStatus = ${0} where intItemNo = ${req.body.ino}`, (err,results,fields)=>{
        if (err) console.log(err);
        res.redirect('/businessman/itemsOrServices');
    });
});

router.post('/inactivateService', (req,res)=>{
    db.query(`Update tblGenService set intGenServiceStatus = ${0}  where intGenServiceNo = ${req.body.sno}`, (err,results,fields)=>{
        if (err) console.log(err);
        res.redirect('/businessman/itemsOrServices');
    });
});

router.post('/activateItem', (req,res)=>{
    db.query(`Update tblItem set intItemStatus = ${1}  where intItemNo = ${req.body.ino2}`, (err,results,fields)=>{
        if (err) console.log(err);
        res.redirect('/businessman/itemsOrServices');
    });
});

router.post('/activateService', (req,res)=>{
    db.query(`Update tblGenService set intGenServiceStatus = ${1} where intGenServiceNo = ${req.body.sno2}`, (err,results,fields)=>{
        if (err) console.log(err);
        res.redirect('/businessman/itemsOrServices');
    });
});


exports.businessman = router;
